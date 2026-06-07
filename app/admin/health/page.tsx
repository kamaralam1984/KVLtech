"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  RefreshCw, Loader2, Database, Wifi, Mail, Brain,
  CreditCard, DollarSign, Server, Activity, Clock,
  CheckCircle2, AlertTriangle, XCircle, Terminal,
  Users, ShoppingCart, MessageSquare, Ticket,
} from "lucide-react"
import { AdminTopbar } from "@/components/admin/AdminSidebar"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceStatus {
  status: string
  latencyMs?: number
  error?: string
  note?: string
  provider?: string
}

interface HealthData {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  uptime: number
  version: string
  environment: string
  services: {
    database: ServiceStatus
    redis: ServiceStatus
    email: ServiceStatus & { provider: "resend" | "smtp" | "none" }
    groqAI: ServiceStatus
    razorpay: ServiceStatus
    stripe: ServiceStatus
  }
  system: {
    heapUsedMB: number
    heapTotalMB: number
    rssMB: number
    uptimeSeconds: number
    nodeVersion: string
  }
  dbStats: {
    totalClients: number
    totalOrders: number
    totalLeads: number
    openTickets: number
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const parts: string[] = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  parts.push(`${m}m`)
  return parts.join(" ")
}

function MemoryBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0
  const color = pct >= 85 ? "#EF4444" : pct >= 70 ? "#F59E0B" : "#16A34A"
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--color-text-secondary)]">
          {used} MB / {total} MB
        </span>
        <span className="font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2.5 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const isOk = status === "healthy" || status === "configured"
  const isWarn = status === "unavailable" || status === "not_configured" || status === "degraded"
  const color = isOk ? "#16A34A" : isWarn ? "#F59E0B" : "#EF4444"
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
      style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
    />
  )
}

function OverallBadge({ status }: { status: "healthy" | "degraded" | "unhealthy" }) {
  const map = {
    healthy:   { label: "HEALTHY",   color: "#16A34A", bg: "#16A34A18" },
    degraded:  { label: "DEGRADED",  color: "#F59E0B", bg: "#F59E0B18" },
    unhealthy: { label: "UNHEALTHY", color: "#EF4444", bg: "#EF444418" },
  }
  const cfg = map[status]
  return (
    <span
      className="px-3 py-1.5 rounded-full text-xs font-bold tracking-widest"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  )
}

// ─── Service Card ─────────────────────────────────────────────────────────────

function ServiceCard({
  name,
  icon: Icon,
  service,
}: {
  name: string
  icon: React.ElementType
  service: ServiceStatus
}) {
  const isOk = service.status === "healthy" || service.status === "configured"
  const dotColor = isOk ? "#16A34A" : service.status === "unhealthy" ? "#EF4444" : "#F59E0B"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${dotColor}18` }}
          >
            <Icon size={16} style={{ color: dotColor }} />
          </div>
          <span className="text-sm font-semibold text-[var(--color-text)]">{name}</span>
        </div>
        <StatusDot status={service.status} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
          style={{ color: dotColor, background: `${dotColor}18` }}
        >
          {service.status.replace(/_/g, " ")}
        </span>
        {typeof service.latencyMs === "number" && (
          <span className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] px-2 py-0.5 rounded-full">
            {service.latencyMs}ms
          </span>
        )}
        {service.provider && service.provider !== "none" && (
          <span className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] px-2 py-0.5 rounded-full capitalize">
            {service.provider}
          </span>
        )}
      </div>

      {(service.error || service.note) && (
        <p className="text-[11px] text-[#EF4444] leading-tight">
          {service.error || service.note}
        </p>
      )}
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SystemHealthPage() {
  const [data, setData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchHealth = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/health", { credentials: "include" })
      if (res.ok) {
        const json = await res.json()
        setData(json)
        setLastChecked(new Date())
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchHealth()
    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(fetchHealth, 30_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchHealth])

  const metricsToken = "kvl-metrics-secret" // placeholder shown in UI

  return (
    <>
      <AdminTopbar title="System Health" />
      <div className="p-6 space-y-6 max-w-[1400px]">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {data && <OverallBadge status={data.status} />}
            {lastChecked && (
              <span className="text-xs text-[var(--color-text-muted)]">
                Last checked: {lastChecked.toLocaleTimeString()}
              </span>
            )}
          </div>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] border border-[var(--color-border)] px-3 py-2 rounded-xl hover:border-[var(--color-gold)] transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <AnimatePresence mode="wait">
          {loading && !data ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-24"
            >
              <Loader2 size={28} className="animate-spin text-[var(--color-gold)]" />
            </motion.div>
          ) : data ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* ── Service grid ─────────────────────────────────────────── */}
              <div>
                <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                  Services
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ServiceCard name="Database" icon={Database} service={data.services.database} />
                  <ServiceCard name="Redis" icon={Wifi} service={data.services.redis} />
                  <ServiceCard name="Email" icon={Mail} service={data.services.email} />
                  <ServiceCard name="Groq AI" icon={Brain} service={data.services.groqAI} />
                  <ServiceCard name="Razorpay" icon={CreditCard} service={data.services.razorpay} />
                  <ServiceCard name="Stripe" icon={DollarSign} service={data.services.stripe} />
                </div>
              </div>

              {/* ── System resources ─────────────────────────────────────── */}
              <div className="card p-5 space-y-5">
                <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-2">
                  <Server size={13} /> System Resources
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Memory */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-[var(--color-text-muted)]" />
                      <span className="text-sm font-semibold text-[var(--color-text)]">Heap Memory</span>
                    </div>
                    <MemoryBar used={data.system.heapUsedMB} total={data.system.heapTotalMB} />
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      RSS: {data.system.rssMB} MB total process memory
                    </p>
                  </div>

                  {/* Process info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[var(--color-text-muted)]" />
                      <span className="text-sm font-semibold text-[var(--color-text)]">Process</span>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--color-text-muted)] text-xs">Uptime</span>
                        <span className="font-semibold text-[var(--color-text)]">
                          {formatUptime(data.system.uptimeSeconds)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--color-text-muted)] text-xs">Node.js</span>
                        <span className="font-semibold text-[var(--color-text)]">{data.system.nodeVersion}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--color-text-muted)] text-xs">Environment</span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                          style={{
                            color: data.environment === "production" ? "#16A34A" : "#F59E0B",
                            background: data.environment === "production" ? "#16A34A18" : "#F59E0B18",
                          }}
                        >
                          {data.environment || "unknown"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--color-text-muted)] text-xs">Version</span>
                        <span className="font-semibold text-[var(--color-text)]">v{data.version}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── DB Stats ─────────────────────────────────────────────── */}
              <div>
                <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                  Database Stats
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Clients",  value: data.dbStats.totalClients,  icon: Users,          color: "#7C3AED" },
                    { label: "Total Orders",   value: data.dbStats.totalOrders,   icon: ShoppingCart,   color: "#2563EB" },
                    { label: "Total Leads",    value: data.dbStats.totalLeads,    icon: MessageSquare,  color: "#16A34A" },
                    { label: "Open Tickets",   value: data.dbStats.openTickets,   icon: Ticket,         color: data.dbStats.openTickets > 0 ? "#F59E0B" : "#16A34A" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card p-4 flex items-center gap-3"
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${color}18` }}
                      >
                        <Icon size={18} style={{ color }} />
                      </div>
                      <div>
                        <p className="font-display font-bold text-xl text-[var(--color-text)]">{value.toLocaleString()}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] font-semibold">{label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* ── Metrics endpoint ──────────────────────────────────────── */}
              <div className="card p-5 space-y-4">
                <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-2">
                  <Terminal size={13} /> Prometheus Metrics
                </h2>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-text-muted)]">METRICS_TOKEN:</span>
                  {process.env.NEXT_PUBLIC_METRICS_TOKEN_SET === "true" ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                      <CheckCircle2 size={12} /> Configured
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#F59E0B]">
                      <AlertTriangle size={12} /> Using default — set METRICS_TOKEN in production
                    </span>
                  )}
                </div>

                <div className="bg-[var(--color-bg-secondary)] rounded-xl p-3 font-mono text-xs text-[var(--color-text-secondary)] overflow-x-auto">
                  curl -H &quot;Authorization: Bearer {metricsToken}&quot; https://yourdomain.com/api/metrics
                </div>

                <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                  Scrape <code className="px-1 py-0.5 bg-[var(--color-bg-secondary)] rounded text-[10px]">/api/metrics</code> with
                  Prometheus using a <code className="px-1 py-0.5 bg-[var(--color-bg-secondary)] rounded text-[10px]">bearer_token</code> scrape config.
                  Visualise with Grafana dashboards for real-time business and system metrics.
                </p>
              </div>

            </motion.div>
          ) : (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 gap-3"
            >
              <XCircle size={32} className="text-[#EF4444]" />
              <p className="text-sm text-[var(--color-text-muted)]">Failed to load health data</p>
              <button
                onClick={fetchHealth}
                className="text-xs font-semibold text-[var(--color-gold)] hover:underline"
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
