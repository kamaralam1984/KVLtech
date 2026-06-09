import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const SITES_DIR = path.join(process.cwd(), "public", "generated-sites");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathParts } = await params;

  // Prevent path traversal
  const joined = pathParts.join("/");
  if (!joined || joined.includes("..") || joined.includes("\0")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(SITES_DIR, joined);

  // Must stay within SITES_DIR
  if (!filePath.startsWith(SITES_DIR + path.sep) && filePath !== SITES_DIR) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const content = await fs.readFile(filePath, "utf-8");

    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      ext === ".html" ? "text/html; charset=utf-8"
      : ext === ".css" ? "text/css; charset=utf-8"
      : ext === ".json" ? "application/json; charset=utf-8"
      : "text/plain; charset=utf-8";

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
