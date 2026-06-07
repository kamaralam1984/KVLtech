import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || ""
    const levelParam = searchParams.get("level") || ""

    const where: any = {}
    if (status) where.status = status as any
    if (levelParam === "1" || levelParam === "2") where.level = parseInt(levelParam)

    const referrals = await db.referral.findMany({
      where,
      include: {
        referrer: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    // Aggregate stats across all referrals (unfiltered)
    const allReferrals = await db.referral.findMany({
      select: { status: true, commission: true, orderAmount: true, level: true },
    })

    const totalPaid = allReferrals
      .filter(r => r.status === "PAID")
      .reduce((sum, r) => sum + r.commission, 0)

    const totalPending = allReferrals
      .filter(r => r.status === "CONVERTED")
      .reduce((sum, r) => sum + r.commission, 0)

    const level1Count = allReferrals.filter(r => r.level === 1).length
    const level2Count = allReferrals.filter(r => r.level === 2).length

    const totalRevenue = allReferrals
      .filter(r => r.level === 1)
      .reduce((sum, r) => sum + (r.orderAmount || 0), 0)

    const stats = { totalPaid, totalPending, level1Count, level2Count, totalRevenue }

    return NextResponse.json({ referrals, stats })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { id, status, commission } = await req.json()
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 })
    const updated = await db.referral.update({
      where: { id },
      data: {
        status,
        ...(commission !== undefined && { commission: parseInt(commission) }),
        ...(status === "PAID" && { paidAt: new Date() }),
      },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
