import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  readManifest,
  readSchedule,
  createBackup,
  applyRetention,
  generateId,
  generateFilename,
  BACKUP_DIR,
  type BackupSchedule,
} from "@/lib/backup";
import path from "path";

async function getSuperAdmin(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return null;
  const record = await db.admin.findUnique({
    where: { id: admin.id },
    select: { role: true, name: true },
  });
  if (!record || record.role !== "SUPER_ADMIN") return null;
  return { ...admin, name: record.name as string };
}

export async function GET(req: NextRequest) {
  const admin = await getSuperAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const all = readManifest();
    const backups = all.filter((e) => e.status !== "DELETED");

    const stats = {
      total: backups.length,
      completed: backups.filter((e) => e.status === "COMPLETED").length,
      failed: backups.filter((e) => e.status === "FAILED").length,
      totalSizeBytes: backups.reduce((sum, e) => sum + e.sizeBytes, 0),
    };

    return NextResponse.json({ backups, stats });
  } catch (err) {
    console.error("[admin/backup GET]", err);
    return NextResponse.json({ error: "Failed to list backups" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await getSuperAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = (await req.json().catch(() => ({}))) as {
      notes?: string;
      schedule?: BackupSchedule;
    };

    const schedule: BackupSchedule = body.schedule ?? "MANUAL";
    const notes = body.notes ?? "";

    const now = new Date();
    const dateLabel = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const scheduleLabel =
      schedule === "MANUAL"
        ? "Manual"
        : schedule.charAt(0) + schedule.slice(1).toLowerCase();
    const name = `${scheduleLabel} Backup — ${dateLabel}`;

    const id = generateId();
    const filename = generateFilename(schedule);
    const filePath = path.join(BACKUP_DIR, filename);

    const entry = await createBackup({
      id,
      name,
      filename,
      filePath,
      schedule,
      createdBy: admin.email,
      notes,
      createdAt: now.toISOString(),
    });

    if (schedule !== "MANUAL" && entry.status === "COMPLETED") {
      const scheduleConfig = readSchedule();
      const key = schedule.toLowerCase() as keyof typeof scheduleConfig;
      const retentionCount = scheduleConfig[key].retentionCount;
      applyRetention(schedule, retentionCount);
    }

    return NextResponse.json({ backup: entry }, { status: 201 });
  } catch (err) {
    console.error("[admin/backup POST]", err);
    return NextResponse.json({ error: "Failed to create backup" }, { status: 500 });
  }
}
