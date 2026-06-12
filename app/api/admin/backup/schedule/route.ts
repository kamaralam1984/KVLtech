import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { readSchedule, writeSchedule, ScheduleConfig } from "@/lib/backup";

async function isSuperAdmin(req: NextRequest): Promise<boolean> {
  const user = requireAdmin(req);
  if (!user) return false;
  const admin = await db.admin.findUnique({ where: { id: user.id } });
  return admin?.role === "SUPER_ADMIN";
}

export async function GET(req: NextRequest) {
  if (!(await isSuperAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const schedule = readSchedule();
    return NextResponse.json({ schedule });
  } catch (err) {
    console.error("[admin/backup/schedule GET]", err);
    return NextResponse.json({ error: "Failed to read schedule" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isSuperAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: Partial<ScheduleConfig> = await req.json();

    if (body.daily !== undefined) {
      if (body.daily.hour !== undefined && (body.daily.hour < 0 || body.daily.hour > 23)) {
        return NextResponse.json({ error: "daily.hour must be 0–23" }, { status: 400 });
      }
      if (body.daily.retentionCount !== undefined && (body.daily.retentionCount < 1 || body.daily.retentionCount > 365)) {
        return NextResponse.json({ error: "daily.retentionCount must be 1–365" }, { status: 400 });
      }
    }

    if (body.weekly !== undefined) {
      if (body.weekly.hour !== undefined && (body.weekly.hour < 0 || body.weekly.hour > 23)) {
        return NextResponse.json({ error: "weekly.hour must be 0–23" }, { status: 400 });
      }
      if (body.weekly.dayOfWeek !== undefined && (body.weekly.dayOfWeek < 0 || body.weekly.dayOfWeek > 6)) {
        return NextResponse.json({ error: "weekly.dayOfWeek must be 0–6" }, { status: 400 });
      }
      if (body.weekly.retentionCount !== undefined && (body.weekly.retentionCount < 1 || body.weekly.retentionCount > 365)) {
        return NextResponse.json({ error: "weekly.retentionCount must be 1–365" }, { status: 400 });
      }
    }

    if (body.monthly !== undefined) {
      if (body.monthly.hour !== undefined && (body.monthly.hour < 0 || body.monthly.hour > 23)) {
        return NextResponse.json({ error: "monthly.hour must be 0–23" }, { status: 400 });
      }
      if (body.monthly.dayOfMonth !== undefined && (body.monthly.dayOfMonth < 1 || body.monthly.dayOfMonth > 28)) {
        return NextResponse.json({ error: "monthly.dayOfMonth must be 1–28" }, { status: 400 });
      }
      if (body.monthly.retentionCount !== undefined && (body.monthly.retentionCount < 1 || body.monthly.retentionCount > 365)) {
        return NextResponse.json({ error: "monthly.retentionCount must be 1–365" }, { status: 400 });
      }
    }

    if (body.yearly !== undefined) {
      if (body.yearly.hour !== undefined && (body.yearly.hour < 0 || body.yearly.hour > 23)) {
        return NextResponse.json({ error: "yearly.hour must be 0–23" }, { status: 400 });
      }
      if (body.yearly.month !== undefined && (body.yearly.month < 1 || body.yearly.month > 12)) {
        return NextResponse.json({ error: "yearly.month must be 1–12" }, { status: 400 });
      }
      if (body.yearly.retentionCount !== undefined && (body.yearly.retentionCount < 1 || body.yearly.retentionCount > 365)) {
        return NextResponse.json({ error: "yearly.retentionCount must be 1–365" }, { status: 400 });
      }
    }

    const current = readSchedule();
    const merged: ScheduleConfig = { ...current, ...body };
    writeSchedule(merged);

    return NextResponse.json({ success: true, schedule: merged });
  } catch (err) {
    console.error("[admin/backup/schedule PUT]", err);
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  }
}
