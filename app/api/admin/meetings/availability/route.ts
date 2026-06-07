import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { AvailabilityWindow } from "@/lib/meeting-scheduler";

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const availability = await db.meetingAvailability.findMany({
    where: { adminId: admin.id },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json({ availability });
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Support both legacy single-day format and new batch-windows format
  if (Array.isArray(body.windows)) {
    // Batch update: { windows: AvailabilityWindow[] }
    const windows = body.windows as AvailabilityWindow[];

    // Validate no overlapping windows for same day
    const daysSeen = new Set<number>();
    for (const w of windows) {
      if (w.dayOfWeek < 0 || w.dayOfWeek > 6) {
        return NextResponse.json({ error: `Invalid dayOfWeek: ${w.dayOfWeek}` }, { status: 400 });
      }
      if (!w.startTime || !w.endTime) {
        return NextResponse.json({ error: "startTime and endTime are required for each window" }, { status: 400 });
      }
      if (w.startTime >= w.endTime) {
        return NextResponse.json({ error: `startTime must be before endTime for day ${w.dayOfWeek}` }, { status: 400 });
      }
      if (daysSeen.has(w.dayOfWeek)) {
        return NextResponse.json({ error: `Duplicate window for dayOfWeek: ${w.dayOfWeek}` }, { status: 400 });
      }
      daysSeen.add(w.dayOfWeek);
    }

    // Upsert all windows — delete existing for admin and re-create
    await db.meetingAvailability.deleteMany({ where: { adminId: admin.id } });

    const created = await db.meetingAvailability.createMany({
      data: windows.map((w) => ({
        adminId:   admin.id,
        dayOfWeek: w.dayOfWeek,
        startTime: w.startTime,
        endTime:   w.endTime,
        isActive:  true,
        timezone:  w.timezone || "Asia/Kolkata",
      })),
    });

    return NextResponse.json({ success: true, count: created.count });
  }

  // Legacy single-day format: { dayOfWeek, startTime, endTime, isActive, timezone? }
  const { dayOfWeek, startTime, endTime, isActive, timezone } = body;

  if (dayOfWeek === undefined || !startTime || !endTime) {
    return NextResponse.json({ error: "dayOfWeek, startTime, endTime are required" }, { status: 400 });
  }

  await db.meetingAvailability.deleteMany({
    where: { adminId: admin.id, dayOfWeek },
  });

  const availability = await db.meetingAvailability.create({
    data: {
      adminId:   admin.id,
      dayOfWeek,
      startTime,
      endTime,
      isActive:  isActive ?? true,
      timezone:  timezone || "Asia/Kolkata",
    },
  });

  return NextResponse.json({ availability });
}
