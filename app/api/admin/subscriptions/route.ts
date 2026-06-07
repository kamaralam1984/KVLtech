import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || ""

    const subscriptions = await db.subscription.findMany({
      where: status ? { status: status as any } : {},
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        coupon: { select: { code: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const activeSubscriptions = subscriptions.filter(s => s.status === "ACTIVE")
    const mrr = activeSubscriptions
      .filter(s => s.billingCycle === "monthly")
      .reduce((sum, s) => sum + s.amount, 0)
    const yearlyMrr = activeSubscriptions
      .filter(s => s.billingCycle === "yearly")
      .reduce((sum, s) => sum + Math.round(s.amount / 12), 0)
    const totalMrr = mrr + yearlyMrr

    const churnCount = subscriptions.filter(
      s => s.status === "CANCELLED" && s.cancelledAt && s.cancelledAt >= thisMonthStart
    ).length

    return NextResponse.json({
      subscriptions,
      stats: {
        totalMrr,
        activeCount: activeSubscriptions.length,
        churnCount,
      },
    })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
