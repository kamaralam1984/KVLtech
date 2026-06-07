import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { redisPing } from "@/lib/redis"

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // ── Database check ─────────────────────────────────────────────────────────
  let dbStatus: { status: "healthy" | "unhealthy"; latencyMs: number; error?: string } = {
    status: "unhealthy",
    latencyMs: 0,
  }
  try {
    const t0 = Date.now()
    await db.$queryRaw`SELECT 1`
    dbStatus = { status: "healthy", latencyMs: Date.now() - t0 }
  } catch (err) {
    dbStatus = {
      status: "unhealthy",
      latencyMs: 0,
      error: err instanceof Error ? err.message : String(err),
    }
  }

  // ── Redis check ─────────────────────────────────────────────────────────────
  let redisStatus: { status: "healthy" | "unavailable"; note?: string }
  try {
    const pong = await redisPing()
    redisStatus = pong
      ? { status: "healthy" }
      : { status: "unavailable", note: "Did not receive PONG" }
  } catch {
    redisStatus = { status: "unavailable", note: "Connection failed" }
  }

  // ── Third-party service env checks ─────────────────────────────────────────
  let emailProvider: "resend" | "smtp" | "none" = "none"
  if (process.env.RESEND_API_KEY) emailProvider = "resend"
  else if (process.env.SMTP_USER) emailProvider = "smtp"

  const emailStatus = {
    status: emailProvider !== "none" ? "configured" : "not_configured",
    provider: emailProvider,
  } as const

  const groqAIStatus = {
    status: process.env.GROQ_API_KEY ? "configured" : "not_configured",
  } as const

  const razorpayStatus = {
    status: process.env.RAZORPAY_KEY_ID ? "configured" : "not_configured",
  } as const

  const stripeStatus = {
    status: process.env.STRIPE_SECRET_KEY ? "configured" : "not_configured",
  } as const

  // ── System memory ───────────────────────────────────────────────────────────
  const mem = process.memoryUsage()
  const toMB = (bytes: number) => Math.round(bytes / 1024 / 1024)

  // ── DB stats ────────────────────────────────────────────────────────────────
  let dbStats = { totalClients: 0, totalOrders: 0, totalLeads: 0, openTickets: 0 }
  if (dbStatus.status === "healthy") {
    try {
      const [totalClients, totalOrders, totalLeads, openTickets] = await Promise.all([
        db.client.count(),
        db.order.count(),
        db.contactLead.count(),
        db.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      ])
      dbStats = { totalClients, totalOrders, totalLeads, openTickets }
    } catch {
      // non-fatal — stats unavailable
    }
  }

  // ── Overall status ──────────────────────────────────────────────────────────
  // unhealthy if DB is down; degraded if any optional service is unconfigured
  let overallStatus: "healthy" | "degraded" | "unhealthy"
  if (dbStatus.status === "unhealthy") {
    overallStatus = "unhealthy"
  } else {
    const allConfigured =
      emailProvider !== "none" &&
      !!process.env.GROQ_API_KEY &&
      !!process.env.RAZORPAY_KEY_ID &&
      !!process.env.STRIPE_SECRET_KEY
    overallStatus = allConfigured ? "healthy" : "degraded"
  }

  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV,
    services: {
      database: dbStatus,
      redis: redisStatus,
      email: emailStatus,
      groqAI: groqAIStatus,
      razorpay: razorpayStatus,
      stripe: stripeStatus,
    },
    system: {
      heapUsedMB: toMB(mem.heapUsed),
      heapTotalMB: toMB(mem.heapTotal),
      rssMB: toMB(mem.rss),
      uptimeSeconds: Math.round(process.uptime()),
      nodeVersion: process.version,
    },
    dbStats,
  })
}

// ── Client health score recalculation (POST) — used by health dashboard ───────
interface ClientData {
  id: string
  name: string
  email: string
  company: string | null
  lastLoginAt: Date | null
  orders: { id: string; amount: number; payment: { status: string } | null; createdAt: Date }[]
  brandingSubmissions: { id: string }[]
  supportTickets: { id: string; status: string }[]
  reviews: { id: string }[]
}

function calculateClientHealth(client: ClientData) {
  const { orders, brandingSubmissions, supportTickets, reviews, lastLoginAt } = client

  const hasCaptured = orders.some((o) => o.payment?.status === "CAPTURED")
  const hasPending = orders.some((o) => o.payment?.status === "PENDING")
  const paymentScore = hasCaptured ? 90 + Math.min(orders.length * 2, 10) : hasPending ? 50 : 20

  let engagementScore = 30
  if (brandingSubmissions.length > 0) engagementScore += 20
  if (reviews.length > 0) engagementScore += 20
  if (lastLoginAt) {
    const daysSinceLogin = (Date.now() - new Date(lastLoginAt).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceLogin <= 30) engagementScore += 30
  }
  engagementScore = Math.min(engagementScore, 100)

  const openTickets = supportTickets.filter(
    (t) => t.status === "OPEN" || t.status === "IN_PROGRESS"
  ).length
  const supportScore = Math.max(100 - openTickets * 15, 0)
  const activityScore = Math.min(orders.length * 10, 100)
  const overallScore = Math.round((paymentScore + engagementScore + supportScore + activityScore) / 4)
  const riskLevel = overallScore < 30 ? "high" : overallScore < 60 ? "medium" : "low"
  const churnProbability = parseFloat(((100 - overallScore) / 100).toFixed(2))
  const renewalProbability = parseFloat((overallScore / 100).toFixed(2))

  return { paymentScore, engagementScore, supportScore, activityScore, overallScore, riskLevel, churnProbability, renewalProbability }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { clientId } = await req.json()
    if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 })

    const client = await db.client.findUnique({
      where: { id: clientId },
      include: {
        orders: {
          include: { payment: { select: { status: true } } },
          select: { id: true, amount: true, createdAt: true, payment: { select: { status: true } } },
        },
        brandingSubmissions: { select: { id: true } },
        supportTickets: { select: { id: true, status: true } },
        reviews: { select: { id: true } },
      },
    })

    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 })

    const scores = calculateClientHealth(client as ClientData)

    await db.clientHealthScore.upsert({
      where: { clientId },
      create: { clientId, ...scores, calculatedAt: new Date() },
      update: { ...scores, calculatedAt: new Date() },
    })

    return NextResponse.json({ success: true, scores })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
