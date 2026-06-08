import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { runAlertChecks } from "@/lib/alert-engine";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const VALID_TYPES = [
  "revenue_drop",
  "lead_stagnation",
  "client_risk",
  "overdue_tickets",
  "payment_pending",
] as const;

const VALID_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const now = new Date();
    const hours48Ago = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const days7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const days14Ago = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const hours24Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Run rule-based alert checks first
    const ruleChecks = await runAlertChecks().catch((err) => {
      console.error("[ai-alerts/generate] runAlertChecks error:", err);
      return { checked: 0, alertsCreated: 0, types: [] };
    });

    // 1. Overdue open tickets (older than 48h)
    const overdueTickets = await db.supportTicket.count({
      where: {
        status: "OPEN",
        createdAt: { lt: hours48Ago },
      },
    });

    // 2. Stagnant leads (NEW or CONTACTED, no activity in 7 days)
    const stagnantLeads = await db.contactLead.count({
      where: {
        status: { in: ["NEW", "CONTACTED"] },
        createdAt: { lt: days7Ago },
      },
    });

    // 3. High-risk clients
    const highRiskClients = await db.clientHealthScore.findMany({
      where: { riskLevel: "high" },
      select: { clientId: true, overallScore: true },
    });

    // 4. Revenue: last 7 days vs previous 7 days (CAPTURED payments)
    const recentRevenue = await db.payment.aggregate({
      where: {
        status: "CAPTURED",
        paidAt: { gte: days7Ago },
      },
      _sum: { amount: true },
    });

    const previousRevenue = await db.payment.aggregate({
      where: {
        status: "CAPTURED",
        paidAt: { gte: days14Ago, lt: days7Ago },
      },
      _sum: { amount: true },
    });

    const recentRev = recentRevenue._sum.amount ?? 0;
    const prevRev = previousRevenue._sum.amount ?? 0;
    const revenueChange =
      prevRev > 0
        ? (((recentRev - prevRev) / prevRev) * 100).toFixed(1)
        : recentRev > 0
        ? "+∞"
        : "0";

    // 5. Orders with PAYMENT_PENDING for >24h
    const pendingPaymentOrders = await db.order.count({
      where: {
        status: "PAYMENT_PENDING",
        createdAt: { lt: hours24Ago },
      },
    });

    const contextString = `
- Overdue open support tickets (>48h): ${overdueTickets}
- Stagnant leads (NEW/CONTACTED, no activity >7 days): ${stagnantLeads}
- High-risk clients (health score riskLevel=high): ${highRiskClients.length}
- Revenue last 7 days: ₹${recentRev.toLocaleString("en-IN")}
- Revenue previous 7 days: ₹${prevRev.toLocaleString("en-IN")}
- Revenue change: ${revenueChange}%
- Orders stuck in PAYMENT_PENDING (>24h): ${pendingPaymentOrders}
`.trim();

    const prompt = `You are a business intelligence AI for a software agency. Based on this data, generate 3-5 actionable business alerts that require attention.

Business Data:
${contextString}

Return a JSON array of alerts:
[{
  "type": "revenue_drop|lead_stagnation|client_risk|overdue_tickets|payment_pending",
  "title": "Short alert title",
  "description": "Detailed description with specific numbers and recommended action",
  "severity": "LOW|MEDIUM|HIGH|CRITICAL",
  "resourceType": "optional: ticket|lead|client|order",
  "actionUrl": "optional: /admin/support or /admin/crm etc",
  "actionLabel": "optional: View Tickets"
}]

Return only the JSON array, no other text.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1200,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "[]";

    // Extract JSON array from response
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({
        alerts: [],
        generated: 0,
        ruleChecks,
      });
    }

    let parsed: any[] = [];
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ alerts: [], generated: 0, ruleChecks });
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json({ alerts: [], generated: 0, ruleChecks });
    }

    // Dedup window: 6 hours
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    const createdAlerts: any[] = [];

    for (const item of parsed) {
      if (!item?.type || !item?.title || !item?.description) continue;

      const type = VALID_TYPES.includes(item.type) ? item.type : "lead_stagnation";
      const severity = VALID_SEVERITIES.includes(item.severity)
        ? item.severity
        : "MEDIUM";

      // Check for similar alert in last 6h
      const existing = await db.aIAlert.findFirst({
        where: {
          type,
          generatedAt: { gte: sixHoursAgo },
          isDismissed: false,
        },
      });

      if (existing) continue;

      const alert = await db.aIAlert.create({
        data: {
          type,
          title: String(item.title).slice(0, 200),
          description: String(item.description).slice(0, 1000),
          severity,
          resourceType: item.resourceType ? String(item.resourceType) : undefined,
          resourceId: item.resourceId ? String(item.resourceId) : undefined,
          actionUrl: item.actionUrl ? String(item.actionUrl) : undefined,
          actionLabel: item.actionLabel ? String(item.actionLabel) : undefined,
        },
      });

      createdAlerts.push(alert);
    }

    return NextResponse.json({
      alerts: createdAlerts,
      generated: createdAlerts.length,
      ruleChecks,
    });
  } catch (err) {
    console.error("[ai-alerts/generate]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
