import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { validateApiKey } from "@/lib/api-auth"

export async function GET(req: NextRequest) {
  const auth = await validateApiKey(req, "read:analytics")
  if (!auth.valid) {
    const status = auth.error?.includes("scope") ? 403 : auth.error?.includes("Rate") ? 429 : 401
    return NextResponse.json({ error: auth.error }, { status })
  }

  const [orders, totalLeads] = await Promise.all([
    db.order.findMany({
      select: { amount: true, status: true, createdAt: true },
    }),
    db.contactLead.count(),
  ])

  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0)
  const totalOrders = orders.length
  const convertedLeads = await db.contactLead.count({
    where: { status: "QUALIFIED" },
  })
  const conversionRate =
    totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 10000) / 100 : 0

  // Monthly revenue for the last 12 months
  const now = new Date()
  const monthlyMap: Record<string, number> = {}
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    monthlyMap[key] = 0
  }

  for (const order of orders) {
    const d = new Date(order.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    if (key in monthlyMap) {
      monthlyMap[key] += order.amount
    }
  }

  const monthlyRevenue = Object.entries(monthlyMap).map(([month, revenue]) => ({
    month,
    revenue,
  }))

  return NextResponse.json({
    totalRevenue,
    totalOrders,
    totalLeads,
    conversionRate,
    monthlyRevenue,
  })
}
