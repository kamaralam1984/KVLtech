import { db } from "@/lib/db"

// Simple linear regression for forecasting
function linearRegression(values: number[]) {
  const n = values.length
  if (n < 2) return { slope: 0, intercept: values[0] || 0 }
  const x = Array.from({ length: n }, (_, i) => i)
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = values.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((acc, xi, i) => acc + xi * values[i], 0)
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

function forecast(values: number[], periods: number) {
  const { slope, intercept } = linearRegression(values)
  const n = values.length
  return Array.from({ length: periods }, (_, i) =>
    Math.max(0, Math.round(intercept + slope * (n + i)))
  )
}

// Get monthly revenue for last N months
// Uses Payment.paidAt + status CAPTURED (matching the DB schema)
export async function getMonthlyRevenue(months = 6) {
  const result = []
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
    const agg = await db.payment.aggregate({
      _sum: { amount: true },
      where: { paidAt: { gte: start, lte: end }, status: "CAPTURED" },
    })
    result.push({
      month: start.toLocaleString("default", { month: "short", year: "2-digit" }),
      revenue: agg._sum.amount || 0,
      start: start.toISOString(),
    })
  }
  return result
}

// Revenue forecast for next N months using linear regression
export async function getRevenueForecast(historyMonths = 6, forecastMonths = 3) {
  const history = await getMonthlyRevenue(historyMonths)
  const values = history.map((h) => h.revenue)
  const predictions = forecast(values, forecastMonths)
  const result = []
  for (let i = 0; i < forecastMonths; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() + i + 1)
    result.push({
      month: date.toLocaleString("default", { month: "short", year: "2-digit" }),
      revenue: predictions[i],
      isForecast: true,
    })
  }
  return { history, forecast: result }
}

// Client health score (0-100)
// Note: Client does not have a direct `payments` relation; payments go through orders.
export async function getClientHealthScore(clientId: string) {
  const client = await db.client.findUnique({
    where: { id: clientId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { payment: true },
      },
      supportTickets: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  })
  if (!client) return { score: 0, label: "Unknown", factors: [] }

  let score = 50 // base
  const factors: string[] = []

  // Recent order activity
  if (client.orders.length > 0) {
    const lastOrder = client.orders[0].createdAt
    const daysSinceOrder =
      (Date.now() - lastOrder.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceOrder < 30) {
      score += 20
      factors.push("Recent purchase")
    } else if (daysSinceOrder < 90) {
      score += 10
      factors.push("Moderately recent purchase")
    } else {
      score -= 15
      factors.push("No recent orders (90+ days)")
    }
  } else {
    score -= 20
    factors.push("No orders placed")
  }

  // Payment success rate via order payments
  const payments = client.orders
    .map((o) => o.payment)
    .filter((p): p is NonNullable<typeof p> => p !== null)
  const successPayments = payments.filter((p) => p.status === "CAPTURED").length
  const totalPayments = payments.length
  if (totalPayments > 0) {
    const rate = successPayments / totalPayments
    if (rate >= 0.9) {
      score += 10
      factors.push("Excellent payment history")
    } else if (rate < 0.5) {
      score -= 15
      factors.push("Poor payment history")
    }
  }

  // Support tickets penalty
  const unresolvedTickets = client.supportTickets.filter(
    (t) => t.status !== "RESOLVED" && t.status !== "CLOSED"
  ).length
  if (unresolvedTickets > 0) {
    score -= unresolvedTickets * 5
    factors.push(`${unresolvedTickets} open support ticket(s)`)
  }

  // Order count bonus
  const orderBonus = Math.min(client.orders.length * 5, 20)
  score += orderBonus
  if (client.orders.length > 1) factors.push(`${client.orders.length} total orders`)

  score = Math.min(100, Math.max(0, score))
  const label =
    score >= 75 ? "Healthy" : score >= 50 ? "Moderate" : score >= 25 ? "At Risk" : "Critical"

  return { score, label, factors }
}

// Churn risk clients (no orders in 60+ days)
export async function getChurnRiskClients(limit = 10) {
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  const clients = await db.client.findMany({
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    take: 100,
  })

  const atRisk = clients
    .filter((c) => !c.orders.length || c.orders[0].createdAt < sixtyDaysAgo)
    .map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      company: c.company,
      lastOrder: c.orders[0]?.createdAt || c.createdAt,
      daysSinceOrder: c.orders[0]
        ? Math.floor(
            (Date.now() - c.orders[0].createdAt.getTime()) / (1000 * 60 * 60 * 24)
          )
        : Math.floor((Date.now() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    }))
    .sort((a, b) => b.daysSinceOrder - a.daysSinceOrder)
    .slice(0, limit)

  return atRisk
}

// Lead conversion funnel stats
export async function getConversionFunnel() {
  const [totalLeads, contactedLeads, qualifiedLeads, wonLeads] = await Promise.all([
    db.contactLead.count(),
    db.contactLead.count({
      where: { status: { in: ["CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "WON"] } },
    }),
    db.contactLead.count({
      where: { status: { in: ["QUALIFIED", "PROPOSAL_SENT", "WON"] } },
    }),
    db.contactLead.count({ where: { status: "WON" } }),
  ])
  return {
    totalLeads,
    contactedLeads,
    qualifiedLeads,
    wonLeads,
    contactRate: totalLeads ? Math.round((contactedLeads / totalLeads) * 100) : 0,
    qualifyRate: contactedLeads
      ? Math.round((qualifiedLeads / contactedLeads) * 100)
      : 0,
    closeRate: qualifiedLeads ? Math.round((wonLeads / qualifiedLeads) * 100) : 0,
    overallConversion: totalLeads ? Math.round((wonLeads / totalLeads) * 100) : 0,
  }
}
