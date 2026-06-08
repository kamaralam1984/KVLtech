import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { requireAuth } from "@/lib/auth";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "image/svg+xml", "image/gif", "image/avif", "image/tiff",
  "image/bmp", "image/x-icon", "image/heic", "image/heif",
]);

const EXT_MAP: Record<string, string> = {
  "image/jpeg": ".jpg", "image/jpg": ".jpg", "image/png": ".png",
  "image/webp": ".webp", "image/svg+xml": ".svg", "image/gif": ".gif",
  "image/avif": ".avif", "image/tiff": ".tiff", "image/bmp": ".bmp",
  "image/x-icon": ".ico", "image/heic": ".heic", "image/heif": ".heif",
};

export async function POST(req: NextRequest) {
  const client = requireAuth(req);
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (!file.type.startsWith("image/") && !ALLOWED_MIME.has(file.type))
      return NextResponse.json({ error: "Sirf image files allowed hain (PNG, SVG, JPG, WebP, etc.)" }, { status: 400 });

    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: `File 10MB se badi hai` }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = EXT_MAP[file.type] || ".png";
    const timestamp = Date.now();
    const clientId = (client as { id?: string }).id || "unknown";
    const filename = `logo_${clientId}_${timestamp}${ext}`;

    const uploadDir = join(process.cwd(), "public", "uploads", "logos");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    const url = `/uploads/logos/${filename}`;
    return NextResponse.json({ url, filename, size: file.size, type: file.type });
  } catch (err) {
    console.error("[LOGO UPLOAD]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
