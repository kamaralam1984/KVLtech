import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const roleId = searchParams.get("roleId")
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200)

    const logs = await db.permissionAuditLog.findMany({
      where: roleId ? { roleId } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return NextResponse.json({ logs })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
