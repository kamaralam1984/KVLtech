import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getAvailableSlots,
  checkConflict,
  suggestNextAvailable,
  formatInTimezone,
} from "@/lib/meeting-scheduler";

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateStr  = searchParams.get("date");
  const duration = parseInt(searchParams.get("duration") || "30", 10);
  const timezone = searchParams.get("timezone") || "Asia/Kolkata";

  if (!dateStr) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  const date = new Date(dateStr + "T00:00:00");
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const slots = await getAvailableSlots(date, duration, admin.id);

  // Convert slots to requested timezone representation
  const formattedSlots = slots.map((s) => ({
    start:          s.start.toISOString(),
    end:            s.end.toISOString(),
    available:      s.available,
    conflictReason: s.conflictReason,
    localStart:     formatInTimezone(s.start, timezone, "time"),
    localEnd:       formatInTimezone(s.end,   timezone, "time"),
  }));

  // Suggest next available
  const nextAvailDate = await suggestNextAvailable(duration, new Date());
  const nextAvailable = nextAvailDate
    ? formatInTimezone(nextAvailDate, timezone, "datetime")
    : null;

  return NextResponse.json({
    date:          dateStr,
    timezone,
    slots:         formattedSlots,
    nextAvailable,
  });
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { date, start, end, excludeId } = body;

  if (!date || !start || !end) {
    return NextResponse.json({ error: "date, start, end are required" }, { status: 400 });
  }

  const proposedStart = new Date(start);
  const proposedEnd   = new Date(end);

  if (isNaN(proposedStart.getTime()) || isNaN(proposedEnd.getTime())) {
    return NextResponse.json({ error: "Invalid start or end time" }, { status: 400 });
  }

  const result = await checkConflict(proposedStart, proposedEnd, excludeId);
  return NextResponse.json(result);
}
