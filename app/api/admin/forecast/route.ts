import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { getRevenueForecast, getChurnRiskClients, getConversionFunnel } from "@/lib/predictive"

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const now = new Date()

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)

    const rawPayments = await db.$queryRaw<
      { year: number; month: number; revenue: number }[]
    >`
      SELECT
        EXTRACT(YEAR FROM p."paidAt")::int AS year,
        EXTRACT(MONTH FROM p."paidAt")::int AS month,
        COALESCE(SUM(p.amount), 0)::int AS revenue
      FROM payments p
      WHERE p.status = 'CAPTURED'
        AND p."paidAt" >= ${sixMonthsAgo}
      GROUP BY year, month
      ORDER BY year ASC, month ASC
    `

    const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const historical: { month: string; revenue: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const y = d.getFullYear()
      const m = d.getMonth() + 1
      const found = rawPayments.find(p => p.year === y && p.month === m)
      historical.push({ month: MONTH_NAMES[m - 1], revenue: found?.revenue || 0 })
    }

    const revenues = historical.map(h => h.revenue)
    const nonZero = revenues.filter(r => r > 0)
    const avgRevenue = nonZero.length > 0
      ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length
      : 0

    let growthRate = 0
    if (revenues.length >= 2) {
      const recent = revenues.slice(-3).filter(r => r > 0)
      const earlier = revenues.slice(0, 3).filter(r => r > 0)
      if (recent.length > 0 && earlier.length > 0) {
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
        const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length
        growthRate = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0
      }
    }

    const monthlyGrowth = growthRate / 6
    const lastRevenue = revenues[revenues.length - 1] || avgRevenue

    const forecast: { month: string; pessimistic: number; base: number; optimistic: number }[] = []
    for (let i = 1; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const base = Math.round(lastRevenue * Math.pow(1 + monthlyGrowth / 100, i))
      forecast.push({
        month: MONTH_NAMES[d.getMonth()],
        pessimistic: Math.round(base * 0.75),
        base: Math.max(base, 0),
        optimistic: Math.round(base * 1.35),
      })
    }

    const [hotLeads, warmLeads] = await Promise.all([
      db.contactLead.findMany({
        where: { scoreLabel: "hot" },
        select: { budget: true },
      }),
      db.contactLead.findMany({
        where: { scoreLabel: "warm" },
        select: { budget: true },
      }),
    ])

    const parseBudget = (budget: string | null): number => {
      if (!budget) return 25000
      const cleaned = budget.replace(/[^0-9.]/g, "")
      const num = parseFloat(cleaned)
      return isNaN(num) || num < 1000 ? 25000 : num
    }

    const hotTotal = hotLeads.reduce((sum, l) => sum + parseBudget(l.budget ?? null), 0)
    const warmTotal = warmLeads.reduce((sum, l) => sum + parseBudget(l.budget ?? null), 0)
    const pipelineValue = hotTotal + warmTotal * 0.5

    // Lead trend: count by week for last 4 weeks
    const leadTrend: { week: string; count: number }[] = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7)
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() - i * 7)
      weekEnd.setHours(23, 59, 59, 999)
      const count = await db.contactLead.count({
        where: { createdAt: { gte: weekStart, lte: weekEnd } },
      })
      leadTrend.push({
        week: `W${4 - i} (${weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" })})`,
        count,
      })
    }

    // New enterprise analytics
    const [revenueForecast, churnRisk, conversionFunnel] = await Promise.all([
      getRevenueForecast(6, 3),
      getChurnRiskClients(5),
      getConversionFunnel(),
    ])

    return NextResponse.json({
      historical,
      forecast,
      pipelineValue: Math.round(pipelineValue),
      hotLeadsPotential: Math.round(hotTotal),
      growthRate: parseFloat(growthRate.toFixed(1)),
      revenueForecast,
      churnRisk,
      conversionFunnel,
      leadTrend,
    })
  } catch (err) {
    console.error("Forecast error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
