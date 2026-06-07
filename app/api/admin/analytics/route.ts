import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { cacheGetOrSet } from "@/lib/cache"

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const analyticsData = await cacheGetOrSet(
      "admin:analytics",
      async () => {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

        const [
          totalLeads,
          lastMonthLeads,
          totalOrders,
          lastMonthOrders,
          allPayments,
          thisMonthPayments,
          lastMonthPayments,
          activeClients,
          ordersByStatus,
          leadSources,
          monthlyData,
          avgOrderValue,
          convertedLeads,
        ] = await Promise.all([
          db.contactLead.count(),
          db.contactLead.count({ where: { createdAt: { gte: lastMonth, lte: endLastMonth } } }),

          db.order.count(),
          db.order.count({ where: { createdAt: { gte: lastMonth, lte: endLastMonth } } }),

          db.payment.aggregate({ where: { status: "CAPTURED" }, _sum: { amount: true } }),
          db.payment.aggregate({
            where: { status: "CAPTURED", paidAt: { gte: startOfMonth } },
            _sum: { amount: true },
          }),
          db.payment.aggregate({
            where: { status: "CAPTURED", paidAt: { gte: lastMonth, lte: endLastMonth } },
            _sum: { amount: true },
          }),

          db.client.count(),

          db.order.groupBy({ by: ["status"], _count: { id: true } }),

          db.contactLead.groupBy({ by: ["source"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 8 }),

          db.$queryRaw<{ month: string; revenue: number; orders: number }[]>`
            SELECT
              TO_CHAR(months.month_start, 'Mon YYYY') AS month,
              COALESCE(SUM(p.amount), 0)::int AS revenue,
              COUNT(DISTINCT o.id)::int AS orders
            FROM (
              SELECT generate_series(
                date_trunc('month', NOW() - INTERVAL '11 months'),
                date_trunc('month', NOW()),
                '1 month'::interval
              ) AS month_start
            ) months
            LEFT JOIN orders o ON date_trunc('month', o."createdAt") = months.month_start
            LEFT JOIN payments p ON p."orderId" = o.id AND p.status = 'CAPTURED'
            GROUP BY months.month_start
            ORDER BY months.month_start ASC
          `,

          db.payment.aggregate({ where: { status: "CAPTURED" }, _avg: { amount: true } }),

          db.contactLead.count({ where: { status: "WON" } }),
        ])

        const pct = (curr: number, prev: number) =>
          prev === 0 ? 0 : +((curr - prev) / prev * 100).toFixed(1)

        const currentMonthLeads = await db.contactLead.count({ where: { createdAt: { gte: startOfMonth } } })
        const thisMonthOrders = await db.order.count({ where: { createdAt: { gte: startOfMonth } } })

        const topCitiesRaw = await db.client.groupBy({
          by: ["city"],
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 8,
        })

        const totalRevenue = allPayments._sum.amount || 0
        const thisRev = thisMonthPayments._sum.amount || 0
        const lastRev = lastMonthPayments._sum.amount || 0

        return {
          monthlyRevenue: (monthlyData as { month: string; revenue: number; orders: number }[]).map(r => ({
            month: r.month,
            revenue: Number(r.revenue),
            orders: Number(r.orders),
          })),
          totalRevenue,
          revenueGrowth: pct(thisRev, lastRev),
          totalLeads,
          leadGrowth: pct(currentMonthLeads, lastMonthLeads),
          totalOrders,
          orderGrowth: pct(thisMonthOrders, lastMonthOrders),
          conversionRate: totalLeads > 0 ? +((convertedLeads / totalLeads) * 100).toFixed(1) : 0,
          avgOrderValue: Math.round(avgOrderValue._avg.amount || 0),
          activeClients,
          ordersByStatus: ordersByStatus.map(s => ({ status: s.status, count: s._count.id })),
          leadSources: leadSources.map(s => ({ source: s.source || "Unknown", count: s._count.id })),
          topCities: topCitiesRaw
            .filter(c => c.city)
            .map(c => ({ city: c.city as string, count: c._count.id })),
        }
      },
      300 // 5-minute TTL — analytics data changes infrequently
    )

    return NextResponse.json(analyticsData)
  } catch (err) {
    console.error("Analytics error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
