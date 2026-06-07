import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { metrics, generatePrometheusOutput } from "@/lib/metrics"
import { getQueueStats } from "@/lib/job-queue"

export async function GET(req: NextRequest) {
  // Bearer token auth
  const auth = req.headers.get("authorization") || ""
  const metricsToken = process.env.METRICS_TOKEN || process.env.CRON_SECRET || "kvl-metrics-secret"
  if (auth !== `Bearer ${metricsToken}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  // ── Refresh gauges from DB ──────────────────────────────────────────────────
  try {
    const [
      clientsTotal,
      ordersActive,
      leadsPending,
      revenue,
    ] = await Promise.all([
      db.client.count(),
      db.order.count({
        where: { status: { notIn: ["DELIVERED", "CANCELLED"] } },
      }),
      db.contactLead.count({
        where: { status: { in: ["NEW", "CONTACTED"] } },
      }),
      db.payment.aggregate({
        _sum: { amount: true },
        where: { status: "CAPTURED" },
      }),
    ])

    metrics.clientsTotal.set(clientsTotal)
    metrics.ordersActiveCount.set(ordersActive)
    metrics.leadsPendingCount.set(leadsPending)
    metrics.revenueTotalInr.set(Number(revenue._sum.amount ?? 0))
  } catch {
    // DB unavailable — skip gauge refresh, serve stale/zero values
  }

  // ── Refresh memory gauges ───────────────────────────────────────────────────
  const mem = process.memoryUsage()
  metrics.memoryHeapMb.set(Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100)
  metrics.memoryRssMb.set(Math.round((mem.rss / 1024 / 1024) * 100) / 100)

  // ── Refresh queue depth gauges ──────────────────────────────────────────────
  try {
    const qStats = await getQueueStats()
    metrics.queueDepth.set(qStats.high, { priority: "high" })
    metrics.queueDepth.set(qStats.normal, { priority: "normal" })
    metrics.queueDepth.set(qStats.low, { priority: "low" })
    metrics.queueDepth.set(qStats.dead, { priority: "dead" })
  } catch {
    // queue unavailable
  }

  return new Response(generatePrometheusOutput(), {
    headers: { "Content-Type": "text/plain; version=0.0.4; charset=utf-8" },
  })
}
