import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/admin/chat/members — list admins for @mention autocomplete
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const members = await db.admin.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    })
    return NextResponse.json({ members })
  } catch {
    // Fallback if DB unavailable
    return NextResponse.json({ members: [] })
  }
}
