import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deleteBackupEntry } from "@/lib/backup";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminData = requireAdmin(req);
  if (!adminData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await db.admin.findUnique({ where: { id: adminData.id }, select: { role: true, name: true } });
  if (admin?.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Super admin only" }, { status: 403 });

  try {
    const { id } = await params;
    const deleted = deleteBackupEntry(id);
    if (!deleted) return NextResponse.json({ error: "Backup not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
