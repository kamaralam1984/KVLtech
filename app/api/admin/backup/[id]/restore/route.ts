import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import {
  readManifest,
  restoreBackup,
  createBackup,
  generateId,
  generateFilename,
  BACKUP_DIR,
} from "@/lib/backup";
import fs from "fs";
import path from "path";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminData = requireAdmin(req);
  if (!adminData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await db.admin.findUnique({ where: { id: adminData.id }, select: { role: true, name: true } });
  if (admin?.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Super admin only" }, { status: 403 });

  try {
    const body = await req.json();
    if (body.confirm !== true) {
      return NextResponse.json(
        { error: "Confirmation required. Send { confirm: true }" },
        { status: 400 }
      );
    }

    const { id } = await params;
    const entries = readManifest();
    const entry = entries.find((e) => e.id === id);
    if (!entry) return NextResponse.json({ error: "Backup not found" }, { status: 404 });

    if (entry.status !== "COMPLETED") {
      return NextResponse.json({ error: "Backup is not in COMPLETED status" }, { status: 400 });
    }

    if (!fs.existsSync(entry.filePath)) {
      return NextResponse.json({ error: "Backup file not found on disk" }, { status: 404 });
    }

    const preRestoreName = `Pre-Restore Backup — ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`;
    const filename = generateFilename("MANUAL");
    const filePath = path.join(BACKUP_DIR, filename);

    await createBackup({
      id: generateId(),
      name: preRestoreName,
      filename,
      filePath,
      schedule: "MANUAL",
      createdBy: admin.name ?? adminData.id,
      notes: "Automatically created before restore",
    });

    await restoreBackup(id);

    return NextResponse.json({
      success: true,
      message: "Database restored successfully. A pre-restore backup was created.",
    });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
