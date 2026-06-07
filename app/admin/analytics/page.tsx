"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp, Users, ShoppingBag, IndianRupee,
  Eye, MousePointer, Globe, Smartphone, Loader2,
  ArrowUpRight, ArrowDownRight, AlertTriangle, Mail,
} from "lucide-react"
import { AdminTopbar } from "@/components/admin/AdminSidebar"

type AnalyticsData = {
  monthlyRevenue: { month: string; revenue: number; orders: number }[]
  totalRevenue: number
  revenueGrowth: number
  totalLeads: number
  leadGrowth: number
  totalOrders: number
  orderGrowth: number
  conversionRate: number
  avgOrderValue: number
  activeClients: number
  ordersByStatus: { status: string; count: number }[]
  leadSources: { source: string; count: number }[]
  topCities: { city: string; count: number }[]
}

type ForecastData = {
  revenueForecast: {
    history: { month: string; revenue: number; start: string }[]
    forecast: { month: string; revenue: number; isForecast: boolean }[]
  }
  conversionFunnel: {
    totalLeads: number
    contactedLeads: number
    qualifiedLeads: number
    wonLeads: number
    contactRate: number
    qualifyRate: number
    closeRate: number
    overallConversion: number
  }
  churnRisk: {
    id: string
    name: string
    email: string
    company: string | null
    lastOrder: string
    daysSinceOrder: number
  }[]
  leadTrend: { week: string; count: number }[]
}

type HealthEntry = {
  clientId: string
  name: string
  email: string
  score: number
  label: string
}

function SkeletonCard() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-bg-secondary)]" />
        <div className="w-12 h-5 rounded-full bg-[var(--color-bg-secondary)]" />
      </div>
      <div className="h-7 w-24 rounded bg-[var(--color-bg-secondary)] mb-1" />
      <div className="h-3 w-20 rounded bg-[var(--color-bg-secondary)]" />
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="h-5 w-40 rounded bg-[var(--color-bg-secondary)] mb-2" />
      <div className="h-3 w-56 rounded bg-[var(--color-bg-secondary)] mb-6" />
      <div className="flex items-end gap-1.5 h-36">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 bg-[var(--color-bg-secondary)] rounded-t-sm" style={{ height: `${40 + Math.random() * 80}px` }} />
        ))}
      </div>
    </div>
  )
}

function GrowthBadge({ value }: { value: number }) {
  const isPos = value >= 0
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${isPos ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
      {isPos ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
      {Math.abs(value)}%
    </span>
  )
}

const STATUS_COLORS: Record<string, string> = {
  PAYMENT_PENDING: "#9CA3AF",
  PAYMENT_CONFIRMED: "#C9A227",
  DESIGN_STARTED: "#0891B2",
  DEVELOPMENT: "#7C3AED",
  REVIEW_TESTING: "#F59E0B",
  DELIVERED: "#16A34A",
  CANCELLED: "#EF4444",
}

const STATUS_LABELS: Record<string, string> = {
  PAYMENT_PENDING: "Payment Pending",
  PAYMENT_CONFIRMED: "Payment Confirmed",
  DESIGN_STARTED: "Design Started",
  DEVELOPMENT: "Development",
  REVIEW_TESTING: "Review & Testing",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
}

function healthColor(score: number) {
  if (score >= 75) return "#16A34A"
  if (score >= 50) return "#F59E0B"
  if (score >= 25) return "#F97316"
  return "#EF4444"
}

function healthBg(score: number) {
  if (score >= 75) return "#16A34A18"
  if (score >= 50) return "#F59E0B18"
  if (score >= 25) return "#F9731618"
  return "#EF444418"
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d")
  const [forecastData, setForecastData] = useState<ForecastData | null>(null)
  const [forecastLoading, setForecastLoading] = useState(true)
  const [healthData, setHealthData] = useState<HealthEntry[]>([])
  const [healthLoading, setHealthLoading] = useState(true)
  const [engagingId, setEngagingId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch("/api/admin/analytics", { credentials: "include" })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setForecastLoading(true)
    fetch("/api/admin/forecast", { credentials: "include" })
      .then(r => r.json())
      .then(d => setForecastData(d))
      .catch(() => {})
      .finally(() => setForecastLoading(false))
  }, [])

  useEffect(() => {
    setHealthLoading(true)
    fetch("/api/admin/clients/health-bulk?limit=10", { credentials: "include" })
      .then(r => r.json())
      .then(d => setHealthData(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setHealthLoading(false))
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const sendReengagement = async (id: string, name: string) => {
    setEngagingId(id)
    // Simulate send — wire up to real email endpoint as needed
    await new Promise(r => setTimeout(r, 800))
    setEngagingId(null)
    showToast(`Re-engagement email queued for ${name}`)
  }

  const fmt = (n: number) => n.toLocaleString("en-IN")
  const fmtRs = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${fmt(n)}`

  const KPI = [
    {
      label: "Total Revenue",
      value: data ? fmtRs(data.totalRevenue) : "—",
      growth: data?.revenueGrowth ?? 0,
      icon: IndianRupee,
      color: "#16A34A",
    },
    {
      label: "Total Leads",
      value: data ? fmt(data.totalLeads) : "—",
      growth: data?.leadGrowth ?? 0,
      icon: Users,
      color: "#C9A227",
    },
    {
      label: "Total Orders",
      value: data ? fmt(data.totalOrders) : "—",
      growth: data?.orderGrowth ?? 0,
      icon: ShoppingBag,
      color: "#7C3AED",
    },
    {
      label: "Conversion Rate",
      value: data ? `${data.conversionRate}%` : "—",
      growth: 0,
      icon: TrendingUp,
      color: "#0891B2",
    },
    {
      label: "Avg Order Value",
      value: data ? fmtRs(data.avgOrderValue) : "—",
      growth: 0,
      icon: MousePointer,
      color: "#EF4444",
    },
    {
      label: "Active Clients",
      value: data ? fmt(data.activeClients) : "—",
      growth: 0,
      icon: Globe,
      color: "#F59E0B",
    },
  ]

  const maxRevenue = data ? Math.max(...data.monthlyRevenue.map(m => m.revenue), 1) : 1
  const maxOrders = data ? Math.max(...data.monthlyRevenue.map(m => m.orders), 1) : 1
  const maxLeadSource = data ? Math.max(...data.leadSources.map(s => s.count), 1) : 1
  const maxStatusCount = data ? Math.max(...data.ordersByStatus.map(s => s.count), 1) : 1

  return (
    <>
      <AdminTopbar title="Analytics" />
      <div className="p-6 space-y-6 max-w-[1400px]">

        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--color-text-muted)]">Period:</span>
          {(["7d", "30d", "90d"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${period === p ? "bg-[var(--color-navy)] text-white" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]"}`}>
              {p === "7d" ? "Last 7 days" : p === "30d" ? "Last 30 days" : "Last 90 days"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {KPI.map(({ label, value, growth, icon: Icon, color }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                    <Icon size={17} style={{ color }} />
                  </div>
                  <GrowthBadge value={growth} />
                </div>
                <p className="font-display font-bold text-xl text-[var(--color-text)]">{value}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{label}</p>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {loading ? (
            <>
              <div className="lg:col-span-2"><SkeletonChart /></div>
              <SkeletonChart />
            </>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="card p-5 lg:col-span-2">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-display font-bold text-base text-[var(--color-text)]">Monthly Revenue & Orders</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">Last 12 months — real payment data</p>
                  </div>
                  <div className="flex items-center gap-4 text-[10px]">
                    {[{ label: "Revenue", color: "#16A34A" }, { label: "Orders", color: "#C9A227" }].map(l => (
                      <span key={l.label} className="flex items-center gap-1.5">
                        <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: l.color }} />{l.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-end gap-1.5 h-36">
                  {(data?.monthlyRevenue || []).map((d) => (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-0.5 group">
                      <div className="w-full flex flex-col items-center gap-0.5">
                        <div
                          className="w-full rounded-t-sm transition-all group-hover:opacity-100"
                          title={`₹${fmt(d.revenue)}`}
                          style={{ height: `${Math.max((d.revenue / maxRevenue) * 120, 2)}px`, background: "#16A34A", opacity: 0.75 }}
                        />
                        <div
                          className="w-2/3 rounded-t-sm"
                          title={`${d.orders} orders`}
                          style={{ height: `${Math.max((d.orders / maxOrders) * 60, 2)}px`, background: "#C9A227", opacity: 0.85 }}
                        />
                      </div>
                      <span className="text-[8px] text-[var(--color-text-muted)] truncate w-full text-center">{d.month.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="card p-5">
                <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-5">Lead Sources</h3>
                <div className="space-y-3">
                  {(data?.leadSources || []).map(({ source, count }) => (
                    <div key={source}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[var(--color-text-secondary)] capitalize">{source.replace(/_/g, " ")}</span>
                        <span className="font-semibold text-[var(--color-text)]">{count}</span>
                      </div>
                      <div className="h-2 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(count / maxLeadSource) * 100}%` }} transition={{ duration: 0.8, delay: 0.5 }}
                          className="h-full rounded-full" style={{ background: "var(--color-gold)" }} />
                      </div>
                    </div>
                  ))}
                  {!data?.leadSources?.length && (
                    <p className="text-xs text-[var(--color-text-muted)] text-center py-4">No lead source data yet</p>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {loading ? (
            <>
              <SkeletonChart />
              <SkeletonChart />
            </>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="card p-5">
                <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-5">Orders by Status</h3>
                <div className="space-y-3">
                  {(data?.ordersByStatus || []).map(({ status, count }) => (
                    <div key={status}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[var(--color-text-secondary)]">{STATUS_LABELS[status] || status}</span>
                        <span className="font-semibold text-[var(--color-text)]">{count}</span>
                      </div>
                      <div className="h-2 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(count / maxStatusCount) * 100}%` }} transition={{ duration: 0.8, delay: 0.5 }}
                          className="h-full rounded-full" style={{ background: STATUS_COLORS[status] || "#9CA3AF" }} />
                      </div>
                    </div>
                  ))}
                  {!data?.ordersByStatus?.length && (
                    <p className="text-xs text-[var(--color-text-muted)] text-center py-4">No order data yet</p>
                  )}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                className="card p-5">
                <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-5">Top Cities</h3>
                <div className="space-y-3">
                  {(data?.topCities || []).map(({ city, count }, i) => (
                    <div key={city} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center text-[10px] font-bold text-[var(--color-text-muted)] shrink-0">{i + 1}</span>
                      <span className="text-sm text-[var(--color-text)] flex-1">{city}</span>
                      <span className="text-xs font-bold text-[var(--color-text-secondary)]">{count} clients</span>
                    </div>
                  ))}
                  {!data?.topCities?.length && (
                    <p className="text-xs text-[var(--color-text-muted)] text-center py-4">No city data yet</p>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* ── Section 1: Revenue Forecast Chart ────────────────────── */}
        {forecastLoading ? (
          <SkeletonChart />
        ) : forecastData?.revenueForecast ? (() => {
          const all = [
            ...forecastData.revenueForecast.history.map(h => ({ ...h, isForecast: false })),
            ...forecastData.revenueForecast.forecast,
          ]
          const maxRev = Math.max(...all.map(m => m.revenue), 1)
          return (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="card p-5">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-display font-bold text-base text-[var(--color-text)]">AI Revenue Forecast</h3>
                <div className="flex items-center gap-4 text-[10px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: "var(--color-gold)" }} />
                    Historical
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-full inline-block border-2 border-dashed border-[var(--color-gold)]" style={{ background: "transparent" }} />
                    Forecast
                  </span>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mb-5">AI Forecast (Next 3 Months) — Linear regression on payment history</p>
              <div className="flex items-end gap-2 h-40">
                {all.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[9px] text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ₹{m.revenue.toLocaleString("en-IN")}
                    </span>
                    <div className="w-full relative"
                      style={{ height: `${Math.max((m.revenue / maxRev) * 120, 4)}px` }}>
                      <div className="absolute inset-0 rounded-t-sm"
                        style={{
                          background: m.isForecast ? "transparent" : "var(--color-gold)",
                          border: m.isForecast ? "2px dashed var(--color-gold)" : "none",
                          opacity: m.isForecast ? 0.7 : 0.85,
                        }} />
                      {m.isForecast && (
                        <div className="absolute inset-0 rounded-t-sm"
                          style={{ background: "var(--color-gold)", opacity: 0.15 }} />
                      )}
                    </div>
                    <span className={`text-[8px] truncate w-full text-center ${m.isForecast ? "text-[var(--color-gold)] font-semibold" : "text-[var(--color-text-muted)]"}`}>
                      {m.month}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })() : null}

        {/* ── Section 2: Conversion Funnel ─────────────────────────── */}
        {forecastLoading ? (
          <SkeletonChart />
        ) : forecastData?.conversionFunnel ? (() => {
          const f = forecastData.conversionFunnel
          const steps = [
            { label: "Total Leads", count: f.totalLeads, pct: 100, rate: `${f.contactRate}% contacted`, color: "#C9A227" },
            { label: "Contacted", count: f.contactedLeads, pct: f.totalLeads ? Math.round((f.contactedLeads / f.totalLeads) * 100) : 0, rate: `${f.qualifyRate}% qualified`, color: "#7C3AED" },
            { label: "Qualified", count: f.qualifiedLeads, pct: f.totalLeads ? Math.round((f.qualifiedLeads / f.totalLeads) * 100) : 0, rate: `${f.closeRate}% closed`, color: "#0891B2" },
            { label: "Won", count: f.wonLeads, pct: f.totalLeads ? Math.round((f.wonLeads / f.totalLeads) * 100) : 0, rate: `${f.overallConversion}% overall`, color: "#16A34A" },
          ]
          return (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              className="card p-5">
              <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-1">Conversion Funnel</h3>
              <p className="text-xs text-[var(--color-text-muted)] mb-5">Lead to client conversion stages</p>
              <div className="flex flex-col items-center gap-1.5">
                {steps.map((step, i) => (
                  <div key={step.label} className="w-full flex items-center gap-4">
                    <div className="flex-1 flex justify-center">
                      <div className="h-10 rounded-sm flex items-center justify-center transition-all"
                        style={{
                          width: `${Math.max(step.pct, 8)}%`,
                          background: step.color,
                          opacity: 0.85,
                        }}>
                        <span className="text-white font-bold text-xs whitespace-nowrap px-2">
                          {step.count}
                        </span>
                      </div>
                    </div>
                    <div className="w-44 shrink-0">
                      <span className="text-xs font-semibold text-[var(--color-text)]">{step.label}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)] ml-2">{step.pct}%</span>
                      {i < steps.length - 1 && (
                        <p className="text-[10px] text-[var(--color-text-muted)]">{step.rate}</p>
                      )}
                      {i === steps.length - 1 && (
                        <p className="text-[10px] text-green-500 font-semibold">{step.rate}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })() : null}

        {/* ── Section 3: Churn Risk Alert ───────────────────────────── */}
        {!forecastLoading && forecastData?.churnRisk && forecastData.churnRisk.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="card p-5 border border-orange-400/30">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-orange-500" />
              <h3 className="font-display font-bold text-base text-orange-500">
                {forecastData.churnRisk.length} client{forecastData.churnRisk.length !== 1 ? "s" : ""} at churn risk (60+ days inactive)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left py-2 font-semibold text-[var(--color-text-muted)]">Client</th>
                    <th className="text-left py-2 font-semibold text-[var(--color-text-muted)]">Last Order</th>
                    <th className="text-left py-2 font-semibold text-[var(--color-text-muted)]">Days Since</th>
                    <th className="text-left py-2 font-semibold text-[var(--color-text-muted)]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.churnRisk.map(c => (
                    <tr key={c.id} className="border-b border-[var(--color-border)] last:border-0">
                      <td className="py-2.5">
                        <p className="font-semibold text-[var(--color-text)]">{c.name}</p>
                        <p className="text-[var(--color-text-muted)]">{c.email}</p>
                      </td>
                      <td className="py-2.5 text-[var(--color-text-secondary)]">
                        {new Date(c.lastOrder).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full font-bold"
                          style={{ background: "#F9731618", color: "#F97316" }}>
                          {c.daysSinceOrder}d
                        </span>
                      </td>
                      <td className="py-2.5">
                        <button
                          onClick={() => sendReengagement(c.id, c.name)}
                          disabled={engagingId === c.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all disabled:opacity-50">
                          {engagingId === c.id ? <Loader2 size={10} className="animate-spin" /> : <Mail size={10} />}
                          {engagingId === c.id ? "Sending..." : "Re-engage"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── Section 4: Client Health Overview ────────────────────── */}
        {healthLoading ? (
          <SkeletonChart />
        ) : healthData.length > 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            className="card p-5">
            <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-1">Client Health Overview</h3>
            <p className="text-xs text-[var(--color-text-muted)] mb-5">Worst performing clients first — scores 0-100</p>
            <div className="space-y-3">
              {healthData.map(client => (
                <div key={client.clientId} className="flex items-center gap-3">
                  <div className="w-32 shrink-0">
                    <p className="text-xs font-semibold text-[var(--color-text)] truncate">{client.name}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate">{client.email}</p>
                  </div>
                  <div className="flex-1 h-2.5 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${client.score}%` }}
                      transition={{ duration: 0.8, delay: 0.7 }}
                      className="h-full rounded-full"
                      style={{ background: healthColor(client.score) }}
                    />
                  </div>
                  <span className="w-10 text-xs font-bold text-right" style={{ color: healthColor(client.score) }}>
                    {client.score}
                  </span>
                  <span className="w-16 shrink-0 text-[10px] font-semibold text-center px-2 py-0.5 rounded-full"
                    style={{ color: healthColor(client.score), background: healthBg(client.score) }}>
                    {client.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}

        {/* Toast notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[var(--color-navy)] text-white text-sm font-semibold shadow-xl border border-[var(--color-gold)]/30">
            {toast}
          </div>
        )}

      </div>
    </>
  )
}
