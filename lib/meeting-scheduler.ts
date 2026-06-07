import { db } from "@/lib/db";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  conflictReason?: string;
}

export interface AvailabilityWindow {
  dayOfWeek: number; // 0-6
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  timezone: string;  // "Asia/Kolkata"
}

const BUFFER_MINUTES = 15;

// ─────────────────────────────────────────────
// Timezone utilities (pure JS / Intl)
// ─────────────────────────────────────────────

/**
 * Returns UTC offset in minutes for a timezone string (e.g. "Asia/Kolkata" → 330).
 */
export function getTimezoneOffset(timezone: string): number {
  const now = new Date();
  const utcStr = now.toLocaleString("en-US", { timeZone: "UTC" });
  const tzStr  = now.toLocaleString("en-US", { timeZone: timezone });
  const diff = (new Date(tzStr).getTime() - new Date(utcStr).getTime()) / 60000;
  return diff;
}

/**
 * Convert a Date from one timezone to another.
 * Returns a new Date whose UTC value represents the equivalent moment expressed in toTz.
 */
export function convertTimezone(date: Date, fromTz: string, toTz: string): Date {
  // Build a string representing the date as seen in fromTz
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: fromTz,
    year:   "numeric",
    month:  "2-digit",
    day:    "2-digit",
    hour:   "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const localStr = `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;

  // Interpret that string in toTz
  const toOffset  = getTimezoneOffset(toTz);
  const sign      = toOffset >= 0 ? "+" : "-";
  const abs       = Math.abs(toOffset);
  const hh        = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm        = String(abs % 60).padStart(2, "0");
  return new Date(`${localStr}${sign}${hh}:${mm}`);
}

/**
 * Format a Date in a specific timezone.
 */
export function formatInTimezone(
  date: Date,
  timezone: string,
  format: "datetime" | "time" | "date" = "datetime"
): string {
  if (format === "time") {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: timezone,
      hour:     "2-digit",
      minute:   "2-digit",
      hour12:   false,
    }).format(date);
  }
  if (format === "date") {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year:     "numeric",
      month:    "2-digit",
      day:      "2-digit",
    }).format(date);
  }
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: timezone,
    year:     "numeric",
    month:    "2-digit",
    day:      "2-digit",
    hour:     "2-digit",
    minute:   "2-digit",
    hour12:   false,
  }).format(date);
}

// ─────────────────────────────────────────────
// Conflict detection
// ─────────────────────────────────────────────

/**
 * Check whether a proposed time range overlaps any existing PENDING or CONFIRMED booking.
 * Buffer of BUFFER_MINUTES is applied after each booking.
 * Pulls all potentially overlapping bookings (those that start before proposedEnd)
 * and does precise end-time overlap in JS (since Prisma can't compute date+duration in WHERE).
 */
export async function checkConflict(
  proposedStart: Date,
  proposedEnd: Date,
  excludeBookingId?: string
): Promise<{ hasConflict: boolean; conflictWith?: string }> {
  // Fetch candidates: bookings that start before proposed end (could overlap)
  const candidates = await db.meetingBooking.findMany({
    where: {
      id:     excludeBookingId ? { not: excludeBookingId } : undefined,
      status: { in: ["PENDING", "CONFIRMED"] },
      date:   { lt: proposedEnd },
    },
  });

  for (const b of candidates) {
    const bStart = b.date;
    const bEnd   = new Date(bStart.getTime() + (b.duration + BUFFER_MINUTES) * 60000);

    // Overlap: proposed start < existing end AND proposed end > existing start
    if (proposedStart < bEnd && proposedEnd > bStart) {
      return {
        hasConflict: true,
        conflictWith: `${b.clientName} at ${formatInTimezone(bStart, "Asia/Kolkata", "time")}`,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * More thorough conflict check that pulls all bookings for the day.
 */
async function hasConflictOnDay(
  dayStart: Date,
  dayEnd: Date,
  slotStart: Date,
  slotEnd: Date,
  excludeId?: string
): Promise<{ conflict: boolean; reason?: string }> {
  const bookings = await db.meetingBooking.findMany({
    where: {
      id:     excludeId ? { not: excludeId } : undefined,
      date:   { gte: dayStart, lt: dayEnd },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });

  for (const b of bookings) {
    const bStart = b.date;
    const bEnd   = new Date(bStart.getTime() + (b.duration + BUFFER_MINUTES) * 60000);

    // Overlap: proposed start < booking end AND proposed end > booking start
    if (slotStart < bEnd && slotEnd > bStart) {
      return {
        conflict: true,
        reason: `Conflicts with ${b.clientName} at ${formatInTimezone(bStart, "Asia/Kolkata", "time")}`,
      };
    }
  }

  return { conflict: false };
}

// ─────────────────────────────────────────────
// Available slots
// ─────────────────────────────────────────────

/**
 * Returns 30-minute time slots for a given date, respecting availability windows and conflicts.
 */
export async function getAvailableSlots(
  date: Date,
  durationMinutes: number,
  adminId?: string
): Promise<TimeSlot[]> {
  // dayOfWeek in UTC — but availability windows are per local day
  // We'll use the raw day value of the date passed in.
  const dayOfWeek = date.getDay();

  const where: Record<string, unknown> = {
    dayOfWeek,
    isActive: true,
  };
  if (adminId) where.adminId = adminId;

  const windows = await db.meetingAvailability.findMany({ where });
  if (windows.length === 0) return [];

  const slots: TimeSlot[] = [];
  const STEP = 30; // 30-min grid

  // Day boundaries (midnight → midnight UTC for the given date value)
  const dayStart = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayEnd   = new Date(dayStart.getTime() + 24 * 60 * 60000);

  for (const win of windows) {
    const tz     = win.timezone || "Asia/Kolkata";
    const offset = getTimezoneOffset(tz); // minutes
    const sign   = offset >= 0 ? 1 : -1;
    const absOff = Math.abs(offset);
    const offMs  = offset * 60000;

    // Parse startTime / endTime as local time in the window's timezone
    const [sh, sm] = win.startTime.split(":").map(Number);
    const [eh, em] = win.endTime.split(":").map(Number);

    // Build UTC Date for window start on this calendar day
    // date.getFullYear/Month/Date are the raw values passed
    const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const winStartUTC   = new Date(localMidnight.getTime() + (sh * 60 + sm) * 60000 - offMs);
    const winEndUTC     = new Date(localMidnight.getTime() + (eh * 60 + em) * 60000 - offMs);

    let cur = winStartUTC.getTime();

    while (cur + durationMinutes * 60000 <= winEndUTC.getTime()) {
      const slotStart = new Date(cur);
      const slotEnd   = new Date(cur + durationMinutes * 60000);

      // Past check
      if (slotStart <= new Date()) {
        cur += STEP * 60000;
        continue;
      }

      const { conflict, reason } = await hasConflictOnDay(dayStart, dayEnd, slotStart, slotEnd);

      slots.push({
        start:           slotStart,
        end:             slotEnd,
        available:       !conflict,
        conflictReason:  reason,
      });

      cur += STEP * 60000;
    }
  }

  // Sort by start time
  slots.sort((a, b) => a.start.getTime() - b.start.getTime());
  return slots;
}

// ─────────────────────────────────────────────
// Next available slot
// ─────────────────────────────────────────────

export async function suggestNextAvailable(
  durationMinutes: number,
  afterDate?: Date
): Promise<Date | null> {
  const from = afterDate ?? new Date();

  for (let i = 0; i < 14; i++) {
    const day = new Date(from);
    day.setDate(day.getDate() + i);
    day.setHours(0, 0, 0, 0);

    const slots = await getAvailableSlots(day, durationMinutes);
    const next  = slots.find((s) => s.available && s.start > from);
    if (next) return next.start;
  }

  return null;
}

// ─────────────────────────────────────────────
// Meeting statistics
// ─────────────────────────────────────────────

export async function getMeetingStats(): Promise<{
  totalThisMonth: number;
  upcoming: number;
  completed: number;
  avgDuration: number;
  popularSlots: string[];
}> {
  const now            = new Date();
  const monthStart     = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [thisMonthBookings, upcomingCount, completedBookings] = await Promise.all([
    db.meetingBooking.findMany({
      where: { date: { gte: monthStart, lt: nextMonthStart } },
      select: { status: true, duration: true, date: true },
    }),
    db.meetingBooking.count({
      where: {
        date:   { gte: now },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
    db.meetingBooking.findMany({
      where: { status: "COMPLETED", date: { gte: monthStart, lt: nextMonthStart } },
      select: { duration: true, date: true },
    }),
  ]);

  const totalThisMonth = thisMonthBookings.length;

  const avgDuration =
    completedBookings.length > 0
      ? Math.round(
          completedBookings.reduce((s, b) => s + b.duration, 0) / completedBookings.length
        )
      : 0;

  // Popular slots — hour of day in IST
  const hourCounts: Record<string, number> = {};
  for (const b of thisMonthBookings) {
    const h = formatInTimezone(b.date, "Asia/Kolkata", "time").slice(0, 5);
    hourCounts[h] = (hourCounts[h] ?? 0) + 1;
  }
  const popularSlots = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([h]) => h);

  return {
    totalThisMonth,
    upcoming:    upcomingCount,
    completed:   completedBookings.length,
    avgDuration,
    popularSlots,
  };
}
