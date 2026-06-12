import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { readManifest } from "@/lib/backup";
import fs from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminData = requireAdmin(req);
  if (!adminData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await db.admin.findUnique({ where: { id: adminData.id }, select: { role: true, name: true } });
  if (admin?.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Super admin only" }, { status: 403 });

  try {
    const { id } = await params;
    const entries = readManifest();
    const entry = entries.find((e) => e.id === id);
    if (!entry) return NextResponse.json({ error: "Backup not found" }, { status: 404 });

    if (!fs.existsSync(entry.filePath)) return NextResponse.json({ error: "Backup file not found on disk" }, { status: 404 });

    const fileStream = fs.createReadStream(entry.filePath);
    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${entry.filename}"`,
        "Content-Length": `${entry.sizeBytes}`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
