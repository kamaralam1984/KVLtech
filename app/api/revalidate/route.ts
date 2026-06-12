import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

const PATHS = ["/blog", "/products", "/portfolio", "/kb", "/pricing", "/about"];

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { path } = await req.json().catch(() => ({}));

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path });
    }

    // Revalidate all public pages
    PATHS.forEach(p => revalidatePath(p));
    return NextResponse.json({ revalidated: true, paths: PATHS });
  } catch (err) {
    console.error("[revalidate]", err);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
