import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const DEFAULT_ADMIN_ID = process.env.DEFAULT_ADMIN_ID || "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com";

function generateSlots(startTime: string, endTime: string, durationMins = 30): string[] {
  const slots: string[] = [];
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let cur = sh * 60 + sm;
  const end = eh * 60 + em;
  while (cur + durationMins <= end) {
    const h = Math.floor(cur / 60).toString().padStart(2, "0");
    const m = (cur % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
    cur += durationMins;
  }
  return slots;
}

async function sendBookingRequestEmail(booking: {
  clientEmail: string;
  clientName: string;
  date: Date;
  title: string;
  duration: number;
  notes?: string | null;
}) {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM = "KVL TECH <onboarding@resend.dev>";
    const dateStr = booking.date.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Kolkata" });
    const timeStr = booking.date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
        <div style="background:#0B1437;padding:24px 32px;">
          <h1 style="color:#C9A227;margin:0;font-size:24px;">KVL TECH</h1>
          <p style="color:#8899BB;margin:4px 0 0;font-size:12px;">kvlbusinesssolutions.com</p>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1A1A2E;margin:0 0 8px;">Booking Request Received</h2>
          <p style="color:#6B7280;margin:0 0 24px;">Hi ${booking.clientName}, we've received your consultation request. Our team will confirm shortly.</p>
          <div style="background:#F8F9FC;border-radius:10px;padding:20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Topic</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${booking.title}</td></tr>
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Date</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${dateStr}</td></tr>
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Time</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${timeStr} IST</td></tr>
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Duration</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${booking.duration} minutes</td></tr>
              ${booking.notes ? `<tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Notes</td><td style="padding:6px 0;color:#1A1A2E;text-align:right;font-size:13px;">${booking.notes}</td></tr>` : ""}
            </table>
          </div>
          <div style="background:#FFF8E7;border-left:4px solid #C9A227;border-radius:0 8px 8px 0;padding:16px 20px;">
            <p style="margin:0;color:#92700A;font-size:13px;font-weight:600;">What happens next?</p>
            <p style="margin:4px 0 0;color:#374151;font-size:13px;">Our team will review your request and send you a confirmation with the meeting link within a few hours.</p>
          </div>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">Questions? WhatsApp: <strong>+91 9942000413</strong></p>
        </div>
        <div style="background:#F8F9FC;padding:16px 32px;border-top:1px solid #E5E7EB;">
          <p style="color:#9CA3AF;font-size:12px;margin:0;">KVL TECH &middot; INDIA &middot; support@kvlbusinesssolutions.com</p>
        </div>
      </div>
    `;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: FROM,
        to: booking.clientEmail,
        subject: `Booking Request: ${booking.title} on ${dateStr} | KVL TECH`,
        html,
      });
    } else {
      console.log("[EMAIL] Booking request email would be sent to:", booking.clientEmail);
    }
  } catch (err) {
    console.error("[EMAIL] Failed to send booking request email:", err);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 });

  const d = new Date(date + "T00:00:00+05:30");
  if (isNaN(d.getTime())) return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  // dayOfWeek: 0=Sunday in IST
  const dayOfWeek = d.getDay();

  // Get all active admins' availability for this day (use any admin if DEFAULT_ADMIN_ID not set)
  const availabilities = await db.meetingAvailability.findMany({
    where: {
      dayOfWeek,
      isActive: true,
      ...(DEFAULT_ADMIN_ID ? { adminId: DEFAULT_ADMIN_ID } : {}),
    },
  });

  if (availabilities.length === 0) {
    return NextResponse.json({ slots: [], message: "No availability for this day" });
  }

  // Use first availability
  const avail = availabilities[0];
  const allSlots = generateSlots(avail.startTime, avail.endTime, 30);

  // Get existing bookings for this date (CONFIRMED or PENDING)
  const dayStart = new Date(date + "T00:00:00+05:30");
  const dayEnd = new Date(date + "T23:59:59+05:30");

  const bookedBookings = await db.meetingBooking.findMany({
    where: {
      adminId: avail.adminId,
      date: { gte: dayStart, lte: dayEnd },
      status: { in: ["CONFIRMED", "PENDING"] },
    },
    select: { date: true, duration: true },
  });

  const bookedTimes = new Set<string>();
  for (const b of bookedBookings) {
    const bDate = new Date(b.date);
    // Convert to IST
    const h = bDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
    // Mark the slot and any overlapping ones
    const [bh, bm] = h.split(":").map(Number);
    let cur = bh * 60 + bm;
    const end = cur + b.duration;
    while (cur < end) {
      const hStr = Math.floor(cur / 60).toString().padStart(2, "0");
      const mStr = (cur % 60).toString().padStart(2, "0");
      bookedTimes.add(`${hStr}:${mStr}`);
      cur += 30;
    }
  }

  const slots = allSlots.map((time) => ({
    time,
    available: !bookedTimes.has(time),
  }));

  return NextResponse.json({ slots, adminId: avail.adminId });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientName, clientEmail, clientPhone, date, time, duration, title, notes } = body;

  if (!clientName || !clientEmail || !date || !time) {
    return NextResponse.json({ error: "clientName, clientEmail, date, time are required" }, { status: 400 });
  }

  // Find available admin
  const dayStart = new Date(date + "T00:00:00+05:30");
  const d = new Date(date + "T00:00:00+05:30");
  const dayOfWeek = d.getDay();

  const avail = await db.meetingAvailability.findFirst({
    where: {
      dayOfWeek,
      isActive: true,
      ...(DEFAULT_ADMIN_ID ? { adminId: DEFAULT_ADMIN_ID } : {}),
    },
  });

  if (!avail) {
    return NextResponse.json({ error: "No availability for this day" }, { status: 400 });
  }

  // Build date with time in IST
  const [h, m] = time.split(":").map(Number);
  const bookingDate = new Date(`${date}T${time}:00+05:30`);

  const dur = duration || 30;

  const booking = await db.meetingBooking.create({
    data: {
      adminId: avail.adminId,
      clientName,
      clientEmail,
      clientPhone: clientPhone || null,
      date: bookingDate,
      duration: dur,
      title: title || "Free Consultation Call",
      notes: notes || null,
      status: "PENDING",
    },
  });

  // Send confirmation email (fire and forget)
  sendBookingRequestEmail({
    clientEmail,
    clientName,
    date: bookingDate,
    title: booking.title,
    duration: dur,
    notes,
  }).catch(console.error);

  return NextResponse.json({
    bookingId: booking.id,
    message: "Booking request submitted successfully. We will confirm shortly.",
  });
}
