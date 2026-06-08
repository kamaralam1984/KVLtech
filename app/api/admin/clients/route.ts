import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  try {
    const clients = await db.client.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      } : {},
      select: { id: true, name: true, email: true, phone: true, company: true, city: true, isActive: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ clients });
  } catch (err) {
    console.error("[admin/clients GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
