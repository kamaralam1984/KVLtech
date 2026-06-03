import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (!user || user.type !== "client") {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const client = await db.client.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, phone: true, company: true, city: true },
    });
    if (!client) return NextResponse.json({ user: null }, { status: 401 });
    return NextResponse.json({ user: client });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
