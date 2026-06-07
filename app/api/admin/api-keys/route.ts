import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import crypto from "crypto"

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const now = new Date()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const monthAgo = new Date(now)
    monthAgo.setDate(monthAgo.getDate() - 30)

    const keys = await db.apiKey.findMany({
      where: { adminId: admin.id },
      include: {
        _count: { select: { logs: { where: { createdAt: { gte: today } } } } },
      },
      orderBy: { createdAt: "desc" },
    })

    // Per-key enhanced stats
    const keyIds = keys.map(k => k.id)

    // Week requests per key
    const weekLogs = await db.apiKeyLog.groupBy({
      by: ["apiKeyId"],
      where: { apiKeyId: { in: keyIds }, createdAt: { gte: weekAgo } },
      _count: { _all: true },
    })
    const weekMap = Object.fromEntries(weekLogs.map(l => [l.apiKeyId, l._count._all]))

    // Top endpoints per key (aggregate all keys for this admin)
    const topEndpointsRaw = await db.apiKeyLog.groupBy({
      by: ["apiKeyId", "endpoint"],
      where: { apiKeyId: { in: keyIds } },
      _count: { _all: true },
    })

    // Sort descending by count and group top 5 per key
    const topEndpointsSorted = [...topEndpointsRaw].sort(
      (a, b) => b._count._all - a._count._all
    )
    const topEndpointsMap: Record<string, { endpoint: string; count: number }[]> = {}
    for (const row of topEndpointsSorted) {
      if (!topEndpointsMap[row.apiKeyId]) topEndpointsMap[row.apiKeyId] = []
      if (topEndpointsMap[row.apiKeyId].length < 5) {
        topEndpointsMap[row.apiKeyId].push({ endpoint: row.endpoint, count: row._count._all })
      }
    }

    const result = keys.map(k => ({
      id: k.id,
      name: k.name,
      prefix: k.prefix,
      maskedKey: k.prefix + "..." + k.key.slice(-4),
      scopes: k.scopes,
      lastUsedAt: k.lastUsedAt,
      expiresAt: k.expiresAt,
      isActive: k.isActive,
      requestCount: k.requestCount,
      requestsToday: k._count.logs,
      weekRequests: weekMap[k.id] || 0,
      topEndpoints: topEndpointsMap[k.id] || [],
      createdAt: k.createdAt,
    }))

    const [totalCallsToday, totalCallsWeek, totalCallsMonth] = await Promise.all([
      db.apiKeyLog.count({
        where: { createdAt: { gte: today }, apiKey: { adminId: admin.id } },
      }),
      db.apiKeyLog.count({
        where: { createdAt: { gte: weekAgo }, apiKey: { adminId: admin.id } },
      }),
      db.apiKeyLog.count({
        where: { createdAt: { gte: monthAgo }, apiKey: { adminId: admin.id } },
      }),
    ])

    // Global top endpoints across all keys for this admin
    const globalTopEndpointsRaw = await db.apiKeyLog.groupBy({
      by: ["endpoint"],
      where: { apiKeyId: { in: keyIds } },
      _count: { _all: true },
    })
    const globalTopEndpoints = [...globalTopEndpointsRaw]
      .sort((a, b) => b._count._all - a._count._all)
      .slice(0, 10)

    return NextResponse.json({
      keys: result,
      stats: {
        total: keys.length,
        active: keys.filter(k => k.isActive).length,
        callsToday: totalCallsToday,
        callsWeek: totalCallsWeek,
        callsMonth: totalCallsMonth,
        topEndpoints: globalTopEndpoints.map(e => ({
          endpoint: e.endpoint,
          count: e._count._all,
        })),
      },
    })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { name, scopes, expiresAt } = await req.json()

    if (!name?.trim())
      return NextResponse.json({ error: "Name is required" }, { status: 400 })

    const randomSuffix = crypto.randomBytes(2).toString("hex")
    const prefix = "kvl_" + randomSuffix
    const secret = crypto.randomBytes(32).toString("hex")
    const fullKey = prefix + "_" + secret

    // In production, store bcrypt hash of fullKey. For now storing full key.
    const apiKey = await db.apiKey.create({
      data: {
        name: name.trim(),
        key: fullKey,
        prefix,
        adminId: admin.id,
        scopes: scopes || [],
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    return NextResponse.json({
      success: true,
      key: {
        id: apiKey.id,
        name: apiKey.name,
        prefix: apiKey.prefix,
        fullKey,
        scopes: apiKey.scopes,
        createdAt: apiKey.createdAt,
      },
    })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id, isActive } = await req.json()
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const existing = await db.apiKey.findFirst({ where: { id, adminId: admin.id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const updated = await db.apiKey.update({
      where: { id },
      data: { isActive },
    })

    return NextResponse.json({ success: true, key: { id: updated.id, isActive: updated.isActive } })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const existing = await db.apiKey.findFirst({ where: { id, adminId: admin.id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await db.apiKey.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
