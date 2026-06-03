import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = requireAdmin(req);
  if (!user) return NextResponse.json({ admin: null }, { status: 401 });

  // Dev bypass returns mock data
  if (user.id === "dev") {
    return NextResponse.json({
      admin: { id: "dev", name: "Rahul Sharma", email: "admin@kvlbusinesssolutions.com", role: "SUPER_ADMIN" },
    });
  }

  try {
    const admin = await db.admin.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!admin) return NextResponse.json({ admin: null }, { status: 401 });
    return NextResponse.json({ admin });
  } catch {
    return NextResponse.json({ admin: null }, { status: 500 });
  }
}
