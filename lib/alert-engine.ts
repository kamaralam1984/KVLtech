import { db } from "@/lib/db"

type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

async function createAlertIfNew(
  type: string,
  severity: AlertSeverity,
  title: string,
  description: string,
  resourceType?: string,
  resourceId?: string,
  actionUrl?: string,
  actionLabel?: string,
) {
  // Avoid duplicate alerts: check if same type+resource created in last 24h
  const existing = await db.aIAlert.findFirst({
    where: {
      type,
      resourceId: resourceId || null,
      isRead: false,
      isDismissed: false,
      generatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  })
  if (existing) return null
  return db.aIAlert.create({
    data: { type, severity, title, description, resourceType, resourceId, actionUrl, actionLabel },
  })
}

export async function runAlertChecks() {
  const alerts: string[] = []
  const now = new Date()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

  // 1. Revenue drop: compare this week vs last week (CAPTURED payments, using paidAt)
  const thisWeekRevenue = await db.payment.aggregate({
    _sum: { amount: true },
    where: { paidAt: { gte: weekAgo }, status: "CAPTURED" },
  })
  const lastWeekRevenue = await db.payment.aggregate({
    _sum: { amount: true },
    where: { paidAt: { gte: twoWeeksAgo, lt: weekAgo }, status: "CAPTURED" },
  })
  const thisW = thisWeekRevenue._sum.amount || 0
  const lastW = lastWeekRevenue._sum.amount || 0

  if (lastW > 0 && thisW < lastW * 0.7) {
    const drop = Math.round((1 - thisW / lastW) * 100)
    await createAlertIfNew(
      "REVENUE_DROP",
      "HIGH",
      "Revenue Drop Detected",
      `Revenue is down ${drop}% this week (₹${thisW.toLocaleString("en-IN")} vs ₹${lastW.toLocaleString("en-IN")} last week). Investigate immediately.`,
      undefined,
      undefined,
      "/admin/analytics",
      "View Analytics",
    )
    alerts.push("revenue_drop")
  }

  // 2. Payment failures spike (FAILED payments this week)
  const failedPayments = await db.payment.count({
    where: { createdAt: { gte: weekAgo }, status: "FAILED" },
  })
  if (failedPayments >= 3) {
    await createAlertIfNew(
      "PAYMENT_FAILURES",
      "HIGH",
      "Payment Failure Spike",
      `${failedPayments} payment failures in the last 7 days. Check Razorpay/Stripe configuration.`,
      undefined,
      undefined,
      "/admin/billing",
      "View Billing",
    )
    alerts.push("payment_failures")
  }

  // 3. Support ticket overload
  const openTickets = await db.supportTicket.count({
    where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
  })
  if (openTickets >= 10) {
    await createAlertIfNew(
      "TICKET_OVERLOAD",
      "MEDIUM",
      "High Open Ticket Count",
      `${openTickets} support tickets are currently open. Response times may be affected.`,
      undefined,
      undefined,
      "/admin/support",
      "View Tickets",
    )
    alerts.push("ticket_overload")
  }

  // 4. Urgent unattended tickets (URGENT priority open > 2 hours)
  const urgentOld = await db.supportTicket.count({
    where: {
      priority: "URGENT",
      status: "OPEN",
      createdAt: { lte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    },
  })
  if (urgentOld > 0) {
    await createAlertIfNew(
      "URGENT_TICKET_UNATTENDED",
      "CRITICAL",
      "Urgent Ticket Unattended",
      `${urgentOld} URGENT support ticket(s) have been open for over 2 hours without response.`,
      "ticket",
      undefined,
      "/admin/support",
      "View Tickets",
    )
    alerts.push("urgent_tickets")
  }

  // 5. Client churn risk: clients with no orders in 60 days
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  const churnRiskClients = await db.client.findMany({
    where: { createdAt: { lte: sixtyDaysAgo } },
    include: { orders: { orderBy: { createdAt: "desc" }, take: 1 } },
  })
  const atRisk = churnRiskClients.filter(
    (c) => !c.orders.length || c.orders[0].createdAt < sixtyDaysAgo,
  )
  if (atRisk.length >= 3) {
    await createAlertIfNew(
      "CHURN_RISK",
      "MEDIUM",
      "Client Churn Risk Detected",
      `${atRisk.length} clients haven't placed orders in 60+ days. Consider re-engagement campaigns.`,
      undefined,
      undefined,
      "/admin/health",
      "View Health",
    )
    alerts.push("churn_risk")
  }

  // 6. Lead surge: more than 2x average daily leads today
  const todayLeads = await db.contactLead.count({
    where: { createdAt: { gte: new Date(now.toDateString()) } },
  })
  const weekLeadsTotal = await db.contactLead.count({
    where: { createdAt: { gte: weekAgo } },
  })
  const avgDailyLeads = weekLeadsTotal / 7
  if (todayLeads > avgDailyLeads * 2 && todayLeads >= 5) {
    await createAlertIfNew(
      "LEAD_SURGE",
      "LOW",
      "Lead Surge Today",
      `${todayLeads} leads today vs avg ${Math.round(avgDailyLeads)}/day. Great momentum! Consider prioritizing follow-ups.`,
      undefined,
      undefined,
      "/admin/crm",
      "View CRM",
    )
    alerts.push("lead_surge")
  }

  // 7. No orders in 3 days
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  const recentOrders = await db.order.count({
    where: { createdAt: { gte: threeDaysAgo } },
  })
  if (recentOrders === 0) {
    await createAlertIfNew(
      "NO_ORDERS",
      "MEDIUM",
      "No Orders in 3 Days",
      "No new orders in the last 3 days. Check if payment gateway is working correctly.",
      undefined,
      undefined,
      "/admin/orders",
      "View Orders",
    )
    alerts.push("no_orders")
  }

  return { checked: 7, alertsCreated: alerts.length, types: alerts }
}
