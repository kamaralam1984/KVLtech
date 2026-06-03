import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import { requireAdmin } from "@/lib/auth";

const MAX_SIZE   = 20 * 1024 * 1024; // 20 MB input limit
const MAX_PX     = 1920;             // max dimension (px)
const WEBP_Q     = 82;               // WebP quality (good balance)

// All common image formats sharp supports
const ALLOWED_MIME = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "image/gif", "image/avif", "image/tiff", "image/bmp",
  "image/svg+xml", "image/heic", "image/heif",
  "image/x-icon", "image/vnd.microsoft.icon",
]);

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Check MIME type (broad check — also accept any image/* not in the list)
    if (!file.type.startsWith("image/"))
      return NextResponse.json({ error: "Sirf image files allowed hain" }, { status: 400 });

    if (file.size > MAX_SIZE)
      return NextResponse.json(
        { error: `File 20MB se badi hai (${(file.size / 1024 / 1024).toFixed(1)} MB)` },
        { status: 400 }
      );

    const bytes   = await file.arrayBuffer();
    const buffer  = Buffer.from(bytes);

    // SVG — save as-is (sharp can't compress SVG meaningfully)
    const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");

    let outputBuffer: Buffer;
    let ext = ".webp";
    let originalSize = buffer.length;

    if (isSvg) {
      outputBuffer = buffer;
      ext = ".svg";
    } else {
      // Convert & compress → WebP
      outputBuffer = await sharp(buffer)
        .rotate()                          // auto-orient (EXIF)
        .resize(MAX_PX, MAX_PX, {
          fit: "inside",                   // never upscale
          withoutEnlargement: true,
        })
        .webp({ quality: WEBP_Q, effort: 4 })
        .toBuffer();
    }

    const savingPct = originalSize > 0
      ? Math.round((1 - outputBuffer.length / originalSize) * 100)
      : 0;

    // Unique filename
    const baseName = file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40);
    const filename = `${baseName}-${Date.now()}${ext}`;

    const uploadDir = join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), outputBuffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/products/${filename}`,
      filename,
      originalSize: `${(originalSize / 1024).toFixed(0)} KB`,
      savedSize: `${(outputBuffer.length / 1024).toFixed(0)} KB`,
      saving: `${savingPct}% smaller`,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed. Invalid image file." }, { status: 500 });
  }
}
