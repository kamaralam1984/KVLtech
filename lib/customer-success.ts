import { db } from "@/lib/db"
import { getChurnRiskClients } from "@/lib/predictive"
import Groq from "groq-sdk"

// ─── Types ────────────────────────────────────────────────────────────────────

export type OutreachType =
  | "health_check_email"
  | "renewal_reminder"
  | "upsell_opportunity"
  | "win_back"
  | "check_in_call"
  | "satisfaction_survey"

export interface OutreachTask {
  id: string
  clientId: string
  clientName: string
  clientEmail: string
  type: OutreachType
  priority: "high" | "medium" | "low"
  reason: string
  suggestedMessage: string
  scheduledFor: Date
  status: "pending" | "sent" | "completed" | "skipped"
  createdAt: Date
  sentAt?: Date
  completedAt?: Date
  skippedAt?: Date
}

interface ClientData {
  id: string
  name: string
  email: string
  company?: string | null
  healthScore?: number
  lastOrderAt?: Date | null
  orderCount?: number
  planName?: string
}

// ─── In-memory store ──────────────────────────────────────────────────────────

export const outreachStore = new Map<string, OutreachTask>()

let lastScanAt: Date | null = null

export function getLastScanAt(): Date | null {
  return lastScanAt
}

// ─── ID generator ─────────────────────────────────────────────────────────────

function generateId(): string {
  return `cs_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// ─── Groq message generation ──────────────────────────────────────────────────

export async function generateOutreachMessage(
  client: ClientData,
  type: OutreachType,
  tone: "formal" | "friendly" = "friendly"
): Promise<string> {
  const typeDescriptions: Record<OutreachType, string> = {
    health_check_email:
      "a health check email to understand if the client is satisfied and if there's anything we can improve",
    renewal_reminder:
      "a renewal reminder email letting them know their subscription is expiring soon and encouraging renewal",
    upsell_opportunity:
      "an upsell email introducing premium features or upgrade options that could benefit their business",
    win_back:
      "a win-back email to re-engage a client who hasn't ordered in a long time, offering value and incentives",
    check_in_call:
      "a friendly check-in message asking if they need any support or have feedback for us",
    satisfaction_survey:
      "a satisfaction survey invitation asking them to share feedback on their experience with KVL TECH",
  }

  const typeSubjects: Record<OutreachType, string> = {
    health_check_email: "How is everything going?",
    renewal_reminder: "Your subscription is expiring soon",
    upsell_opportunity: "Exclusive upgrade offer for you",
    win_back: "We miss you — special offer inside",
    check_in_call: "Checking in — how can we help?",
    satisfaction_survey: "We'd love your feedback",
  }

  const prompt = `You are a customer success specialist at KVL TECH, a premium digital solutions company based in India that builds websites and software for businesses.

Write ${typeDescriptions[type]} for a client.

Client details:
- Name: ${client.name}
- Company: ${client.company || "their business"}
- Health Score: ${client.healthScore ?? "unknown"}/100
- Last Order: ${client.lastOrderAt ? `${Math.floor((Date.now() - client.lastOrderAt.getTime()) / (1000 * 60 * 60 * 24))} days ago` : "never"}
- Total Orders: ${client.orderCount ?? 0}
- Current Plan: ${client.planName || "standard"}

Tone: ${tone}
Language: English (you may include a Hindi greeting like "Namaste" if friendly tone)

Write only the email body (no subject line). Keep it concise (3-5 short paragraphs), personal, and action-oriented. Sign off as "KVL TECH Team".`

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.7,
    })
    return completion.choices[0]?.message?.content?.trim() ?? fallbackMessage(client, type)
  } catch {
    return fallbackMessage(client, type)
  }
}

function fallbackMessage(client: ClientData, type: OutreachType): string {
  const templates: Record<OutreachType, string> = {
    health_check_email: `Dear ${client.name},

We hope you're doing well! We wanted to reach out and check in on your experience with KVL TECH.

Your satisfaction is our top priority, and we'd love to hear if there's anything we can do to better serve you.

Feel free to reply to this email or reach us on WhatsApp at +91 9942000413.

Warm regards,
KVL TECH Team`,

    renewal_reminder: `Dear ${client.name},

We wanted to remind you that your subscription with KVL TECH is coming up for renewal soon.

To ensure uninterrupted access to all your services, please renew before the expiry date. As a valued client, we're offering you a special loyalty discount on renewal.

Contact us to renew: kvlbusinesssolution@gmail.com | +91 9942000413

Best regards,
KVL TECH Team`,

    upsell_opportunity: `Dear ${client.name},

Thank you for being a valued KVL TECH client! Based on your journey with us, we believe you're ready to take your business to the next level.

Our Premium plan offers advanced features including priority support, custom integrations, and enhanced analytics that could significantly boost your business growth.

Would you like a free consultation to explore these options? Reply to this email or call us at +91 9942000413.

Best regards,
KVL TECH Team`,

    win_back: `Dear ${client.name},

We've noticed it's been a while since we last worked together, and we genuinely miss having you as an active client!

A lot has changed at KVL TECH — we've launched exciting new features and improved our services based on client feedback. We'd love to show you what's new.

As a special welcome-back offer, we're offering 20% off your next project. This offer is valid for the next 7 days.

Let's reconnect: kvlbusinesssolution@gmail.com | +91 9942000413

Warm regards,
KVL TECH Team`,

    check_in_call: `Dear ${client.name},

We hope your business is thriving! We're reaching out for a quick check-in to ensure everything is running smoothly with your KVL TECH services.

If you have any questions, need support, or want to discuss new projects, we're here for you.

Best time to chat? Reply with a convenient time and we'll schedule a call.

Best regards,
KVL TECH Team`,

    satisfaction_survey: `Dear ${client.name},

Your opinion matters greatly to us at KVL TECH! We'd love to hear about your experience working with us.

Could you spare 2 minutes to share your feedback? Your insights help us improve our services and serve you better.

Please reply to this email with a rating from 1-10 and any comments you'd like to share.

Thank you for your continued trust in KVL TECH!

Best regards,
KVL TECH Team`,
  }

  return templates[type]
}

export function generateSubject(clientName: string, type: OutreachType): string {
  const subjects: Record<OutreachType, string> = {
    health_check_email: `${clientName} — How is everything going?`,
    renewal_reminder: `Action Required: Your KVL TECH subscription expires soon`,
    upsell_opportunity: `${clientName}, an exclusive upgrade offer just for you`,
    win_back: `We miss you, ${clientName} — special offer inside`,
    check_in_call: `Quick check-in from KVL TECH`,
    satisfaction_survey: `${clientName}, we'd love your feedback`,
  }
  return subjects[type]
}

// ─── Dedup helper ─────────────────────────────────────────────────────────────

function hasPendingTask(clientId: string, type: OutreachType): boolean {
  for (const task of outreachStore.values()) {
    if (task.clientId === clientId && task.type === type && task.status === "pending") {
      return true
    }
  }
  return false
}

// ─── Scan functions ───────────────────────────────────────────────────────────

export async function scanChurnRisks(): Promise<OutreachTask[]> {
  const newTasks: OutreachTask[] = []

  // Churn risk clients (score < 40 from predictive) — already filtered by 60 days
  const churnClients = await getChurnRiskClients(50)

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  for (const client of churnClients) {
    // Health check for clients with low score (score inferred from daysSinceOrder)
    const isHighRisk = client.daysSinceOrder >= 90
    const type: OutreachType = isHighRisk ? "win_back" : "health_check_email"

    if (!hasPendingTask(client.id, type)) {
      const clientData: ClientData = {
        id: client.id,
        name: client.name,
        email: client.email,
        company: client.company,
        lastOrderAt: client.lastOrder,
        orderCount: 0,
      }

      const message = await generateOutreachMessage(clientData, type)
      const task: OutreachTask = {
        id: generateId(),
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        type,
        priority: isHighRisk ? "high" : "medium",
        reason: `No orders in ${client.daysSinceOrder} days (last order: ${client.lastOrder.toLocaleDateString()})`,
        suggestedMessage: message,
        scheduledFor: new Date(),
        status: "pending",
        createdAt: new Date(),
      }
      outreachStore.set(task.id, task)
      newTasks.push(task)
    }

    // Additional win_back for 90+ days with no activity (if not already created)
    if (client.lastOrder < ninetyDaysAgo && !hasPendingTask(client.id, "win_back") && type !== "win_back") {
      const clientData: ClientData = {
        id: client.id,
        name: client.name,
        email: client.email,
        company: client.company,
        lastOrderAt: client.lastOrder,
      }
      const message = await generateOutreachMessage(clientData, "win_back")
      const task: OutreachTask = {
        id: generateId(),
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        type: "win_back",
        priority: "high",
        reason: `No orders in ${client.daysSinceOrder} days — win-back opportunity`,
        suggestedMessage: message,
        scheduledFor: new Date(),
        status: "pending",
        createdAt: new Date(),
      }
      outreachStore.set(task.id, task)
      newTasks.push(task)
    }
  }

  return newTasks
}

export async function scanRenewalOpportunities(): Promise<OutreachTask[]> {
  const newTasks: OutreachTask[] = []

  const now = new Date()
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  try {
    const expiringSubs = await db.subscription.findMany({
      where: {
        status: "ACTIVE",
        nextBillingAt: { gte: now, lte: in30Days },
      },
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
      },
    })

    for (const sub of expiringSubs) {
      const client = sub.client
      if (!hasPendingTask(client.id, "renewal_reminder")) {
        const daysUntilRenewal = sub.nextBillingAt
          ? Math.floor((sub.nextBillingAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 30

        const clientData: ClientData = {
          id: client.id,
          name: client.name,
          email: client.email,
          company: client.company,
          planName: sub.planName,
        }

        const message = await generateOutreachMessage(clientData, "renewal_reminder")
        const task: OutreachTask = {
          id: generateId(),
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          type: "renewal_reminder",
          priority: daysUntilRenewal <= 7 ? "high" : "medium",
          reason: `Subscription "${sub.planName}" expires in ${daysUntilRenewal} days (${sub.nextBillingAt?.toLocaleDateString()})`,
          suggestedMessage: message,
          scheduledFor: new Date(),
          status: "pending",
          createdAt: new Date(),
        }
        outreachStore.set(task.id, task)
        newTasks.push(task)
      }
    }
  } catch (err) {
    console.error("[CustomerSuccess] scanRenewalOpportunities error:", err)
  }

  return newTasks
}

export async function scanUpsellOpportunities(): Promise<OutreachTask[]> {
  const newTasks: OutreachTask[] = []

  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

  try {
    // Clients with DELIVERED orders older than 60 days
    const clientsWithOldDelivered = await db.client.findMany({
      where: {
        orders: {
          some: {
            status: "DELIVERED",
            deliveredAt: { lte: sixtyDaysAgo },
          },
        },
      },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, status: true, plan: true, deliveredAt: true, createdAt: true },
        },
      },
      take: 50,
    })

    for (const client of clientsWithOldDelivered) {
      if (hasPendingTask(client.id, "upsell_opportunity")) continue

      const hasUpgrade = client.orders.some((o) => o.plan === "PREMIUM" || o.plan === "CUSTOM")
      if (!hasUpgrade) {
        const clientData: ClientData = {
          id: client.id,
          name: client.name,
          email: client.email,
          company: client.company,
          orderCount: client.orders.length,
        }
        const message = await generateOutreachMessage(clientData, "upsell_opportunity")
        const task: OutreachTask = {
          id: generateId(),
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          type: "upsell_opportunity",
          priority: "medium",
          reason: `Delivered ${client.orders.length} BASIC order(s), no premium upgrade yet`,
          suggestedMessage: message,
          scheduledFor: new Date(),
          status: "pending",
          createdAt: new Date(),
        }
        outreachStore.set(task.id, task)
        newTasks.push(task)
      }
    }

    // Clients with Basic plan and 3+ orders
    const basicMultiClients = await db.client.findMany({
      where: {
        orders: {
          some: { plan: "BASIC" },
        },
      },
      include: {
        orders: {
          select: { plan: true, status: true },
        },
      },
      take: 50,
    })

    for (const client of basicMultiClients) {
      if (hasPendingTask(client.id, "upsell_opportunity")) continue

      const basicOrders = client.orders.filter((o) => o.plan === "BASIC")
      const hasPremium = client.orders.some((o) => o.plan === "PREMIUM" || o.plan === "CUSTOM")

      if (basicOrders.length >= 3 && !hasPremium) {
        const clientData: ClientData = {
          id: client.id,
          name: client.name,
          email: client.email,
          company: client.company,
          orderCount: client.orders.length,
          planName: "Basic",
        }
        const message = await generateOutreachMessage(clientData, "upsell_opportunity")
        const task: OutreachTask = {
          id: generateId(),
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          type: "upsell_opportunity",
          priority: "medium",
          reason: `${basicOrders.length} Basic plan orders — prime candidate for Premium upgrade`,
          suggestedMessage: message,
          scheduledFor: new Date(),
          status: "pending",
          createdAt: new Date(),
        }
        outreachStore.set(task.id, task)
        newTasks.push(task)
      }
    }
  } catch (err) {
    console.error("[CustomerSuccess] scanUpsellOpportunities error:", err)
  }

  return newTasks
}

export async function runOutreachScan(): Promise<{
  churnRisks: number
  renewals: number
  upsells: number
  totalPending: number
  newTasks: OutreachTask[]
}> {
  const [churnTasks, renewalTasks, upsellTasks] = await Promise.all([
    scanChurnRisks(),
    scanRenewalOpportunities(),
    scanUpsellOpportunities(),
  ])

  lastScanAt = new Date()

  const totalPending = Array.from(outreachStore.values()).filter(
    (t) => t.status === "pending"
  ).length

  const newTasks = [...churnTasks, ...renewalTasks, ...upsellTasks]

  return {
    churnRisks: churnTasks.length,
    renewals: renewalTasks.length,
    upsells: upsellTasks.length,
    totalPending,
    newTasks,
  }
}

// ─── Queue helpers ────────────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<OutreachTask["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export function getOutreachQueue(): OutreachTask[] {
  return Array.from(outreachStore.values()).sort((a, b) => {
    const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    if (pd !== 0) return pd
    return a.createdAt.getTime() - b.createdAt.getTime()
  })
}

export function getPendingCount(): number {
  return Array.from(outreachStore.values()).filter((t) => t.status === "pending").length
}

export function markTaskSent(taskId: string): void {
  const task = outreachStore.get(taskId)
  if (task) {
    outreachStore.set(taskId, { ...task, status: "sent", sentAt: new Date() })
  }
}

export function markTaskSkipped(taskId: string): void {
  const task = outreachStore.get(taskId)
  if (task) {
    outreachStore.set(taskId, { ...task, status: "skipped", skippedAt: new Date() })
  }
}

export function markTaskCompleted(taskId: string): void {
  const task = outreachStore.get(taskId)
  if (task) {
    outreachStore.set(taskId, { ...task, status: "completed", completedAt: new Date() })
  }
}

export function getTaskById(taskId: string): OutreachTask | undefined {
  return outreachStore.get(taskId)
}

export function getOutreachStats(): {
  pending: number
  sent: number
  completed: number
  skipped: number
} {
  const tasks = Array.from(outreachStore.values())
  return {
    pending: tasks.filter((t) => t.status === "pending").length,
    sent: tasks.filter((t) => t.status === "sent").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    skipped: tasks.filter((t) => t.status === "skipped").length,
  }
}
