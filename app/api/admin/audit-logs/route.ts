import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")))
  const resource = searchParams.get("resource") || ""
  const adminId = searchParams.get("adminId") || ""
  const dateFrom = searchParams.get("dateFrom") || ""
  const dateTo = searchParams.get("dateTo") || ""

  try {
    const where: Record<string, unknown> = {}
    if (resource && resource !== "all") where.resource = resource
    if (adminId) where.adminId = adminId
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo + "T23:59:59.999Z") } : {}),
      }
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ])

    return NextResponse.json({
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { adminId, adminName, action, resource, resourceId, details, ip } = await req.json()
    if (!action || !resource)
      return NextResponse.json({ error: "action and resource required" }, { status: 400 })

    const log = await db.auditLog.create({
      data: { adminId, adminName, action, resource, resourceId, details, ip },
    })
    return NextResponse.json({ success: true, log })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
