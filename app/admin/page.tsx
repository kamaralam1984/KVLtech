"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, ShoppingBag, Users, IndianRupee,
  Star, Zap, BarChart2, Loader2, RefreshCw, Brain, Flame, AlertTriangle, MessageCircle, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { AdminTopbar } from "@/components/admin/AdminSidebar";
import { SupportInsightsWidget } from "@/components/admin/SupportInsightsWidget";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { CurrencySelector } from "@/components/ui/CurrencySelector";
import { PremiumStatCard } from "@/components/ui/PremiumStatCard";

interface ForecastMonth {
  month: string
  pessimistic: number
  base: number
  optimistic: number
}

interface ForecastData {
  historical: { month: string; revenue: number }[]
  forecast: ForecastMonth[]
  pipelineValue: number
  hotLeadsPotential: number
  growthRate: number
}

const STATUS_COLOR: Record<string, string> = {
  PAYMENT_PENDING: "#9CA3AF",
  PAYMENT_CONFIRMED: "#C9A227",
  DESIGN_STARTED: "#0891B2",
  DEVELOPMENT: "#7C3AED",
  REVIEW_TESTING: "#F59E0B",
  DELIVERED: "#16A34A",
  CANCELLED: "#EF4444",
};
const STATUS_LABEL: Record<string, string> = {
  PAYMENT_PENDING: "Pending",
  PAYMENT_CONFIRMED: "Confirmed",
  DESIGN_STARTED: "Design",
  DEVELOPMENT: "Dev",
  REVIEW_TESTING: "Review",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const LEAD_STATUS_COLOR: Record<string, string> = {
  NEW: "#C9A227", CONTACTED: "#0891B2", QUALIFIED: "#7C3AED",
  WON: "#16A34A", LOST: "#EF4444", PROPOSAL_SENT: "#F59E0B",
};

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.4 },
});

 // Dev bypass — replace with real auth

interface AIAlertItem {
  id: string;
  type: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  actionUrl?: string;
  actionLabel?: string;
  generatedAt: string;
}

const ALERT_SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "#EF4444",
  HIGH: "#F97316",
  MEDIUM: "#EAB308",
  LOW: "#3B82F6",
};

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [forecastLoading, setForecastLoading] = useState(true);
  const [recentAlerts, setRecentAlerts] = useState<AIAlertItem[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [chatStats, setChatStats] = useState<{ chatLeadsThisMonth: number; chatLeadsLast30: number; chatEscalations: number; summary: string } | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (res.ok) setData(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchForecast = async () => {
    setForecastLoading(true);
    try {
      const res = await fetch("/api/admin/forecast", { credentials: "include" });
      if (res.ok) setForecast(await res.json());
    } catch {}
    setForecastLoading(false);
  };

  const fetchRecentAlerts = async () => {
    setAlertsLoading(true);
    try {
      // Fetch top unread HIGH+CRITICAL alerts for dashboard widget
      const res = await fetch("/api/admin/ai-alerts?unread=true&severity=HIGH,CRITICAL&limit=3", {
        credentials: "include",
      });
      if (res.ok) {
        const d = await res.json();
        setRecentAlerts(d.alerts ?? []);
      }
    } catch {}
    setAlertsLoading(false);
  };

  const fetchChatAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/chat-analytics", { credentials: "include" });
      if (res.ok) setChatStats(await res.json());
    } catch {}
  };

  useEffect(() => { fetchStats(); fetchForecast(); fetchRecentAlerts(); fetchChatAnalytics(); }, []);

  const STAT_CARDS = [
    {
      key: "revenue", icon: IndianRupee, color: "#C9A227",
      premiumColor: "gold" as const,
      format: (v: number) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}K`,
    },
    { key: "orders", icon: ShoppingBag, color: "#0F172A", premiumColor: "blue" as const, format: (v: number) => v.toString() },
    { key: "leads", icon: Users, color: "#0891B2", premiumColor: "purple" as const, format: (v: number) => v.toString() },
    { key: "conversion", icon: BarChart2, color: "#16A34A", premiumColor: "green" as const, format: (v: number) => `${v}%` },
  ];

  if (loading) {
    return (
      <>
        <AdminTopbar title="Dashboard" />
        <div className="p-6 max-w-[1400px]">
          <DashboardSkeleton />
        </div>
      </>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const recentLeads = data?.recentLeads || [];
  const topProducts = data?.topProducts || [];
  const monthlyRevenue = data?.monthlyRevenue || [];
  const maxRevenue = Math.max(...monthlyRevenue.map((d: any) => d.revenue), 1);

  return (
    <>
      <AdminTopbar title="Dashboard" />
      <div className="p-6 space-y-6 max-w-[1400px] grid-bg min-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between glass-dark rounded-2xl px-5 py-4">
          <div>
            <h1 className="font-display font-bold text-xl text-[var(--color-text)]">Good morning 👋</h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Here's what's happening with KVL TECH today.</p>
          </div>
          <div className="flex items-center gap-3">
            <CurrencySelector />
            <button onClick={fetchStats} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] border border-[var(--color-border)] px-3 py-2 rounded-xl transition-all hover:border-[var(--color-gold)]">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        {/* AI Command Center featured card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.02 }}
          className="relative overflow-hidden rounded-2xl border-2 border-[var(--color-gold)]/40 bg-gradient-to-r from-[var(--color-gold)]/8 via-[var(--color-bg-secondary)] to-[var(--color-bg-secondary)] p-5 flex items-center justify-between gap-4"
          style={{ boxShadow: "0 0 0 1px rgba(201,162,39,0.12), 0 4px 24px rgba(201,162,39,0.08)" }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-amber-400 flex items-center justify-center shadow-lg shrink-0">
              <Sparkles size={22} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-[var(--color-text)]">AI Command Center</h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Access all AI tools — blog, proposals, leads, campaigns, automation, SEO &amp; more</p>
            </div>
          </div>
          <Link
            href="/admin/ai-hub"
            className="btn-gold flex items-center gap-2 text-sm shrink-0 whitespace-nowrap"
          >
            <Sparkles size={14} /> Open AI Hub
          </Link>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {STAT_CARDS.map(({ key, icon, premiumColor, format }) => {
            const stat = stats[key] || { value: 0, change: 0, label: key };
            return (
              <PremiumStatCard
                key={key}
                title={stat.label || key}
                value={format(stat.value)}
                rawValue={typeof stat.value === "number" ? stat.value : undefined}
                change={`${Math.abs(stat.change)}%`}
                changePositive={stat.change >= 0}
                icon={icon}
                color={premiumColor}
                animated={false}
              />
            );
          })}
        </motion.div>

        {/* Support Health Widget */}
        <SupportInsightsWidget />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue chart */}
          <motion.div {...fadeUp(4)} className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Revenue Overview</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {monthlyRevenue.length > 0 ? "Last 12 months — live data" : "No payment data yet"}
                </p>
              </div>
              <span className="text-xs font-semibold text-[var(--color-success)] bg-[var(--color-success)]/10 px-3 py-1 rounded-full">
                ₹{((stats.revenue?.value || 0) / 100000).toFixed(1)}L total
              </span>
            </div>
            {monthlyRevenue.length > 0 ? (
              <div className="flex items-end gap-2 h-40">
                {monthlyRevenue.map((d: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80 relative"
                      style={{
                        height: `${Math.max((d.revenue / maxRevenue) * 100, 4)}%`,
                        background: i === monthlyRevenue.length - 1
                          ? "linear-gradient(180deg, #C9A227, #E8C547)"
                          : "var(--color-bg-tertiary)",
                      }}>
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[var(--color-navy)] text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        ₹{(d.revenue / 1000).toFixed(0)}K
                      </div>
                    </div>
                    <span className="text-[9px] text-[var(--color-text-muted)]">{d.month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-[var(--color-text-muted)] text-sm">
                Payments aane ke baad chart dikhega
              </div>
            )}
          </motion.div>

          {/* Order status breakdown */}
          <motion.div {...fadeUp(5)} className="card p-5">
            <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-4">Order Status</h3>
            <div className="space-y-3">
              {Object.entries(data?.ordersByStatus || {}).map(([status, count]: any) => (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STATUS_COLOR[status] || "#9CA3AF" }} />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--color-text-secondary)]">{STATUS_LABEL[status] || status}</span>
                      <span className="font-semibold text-[var(--color-text)]">{count}</span>
                    </div>
                    <div className="h-1.5 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${(count / Math.max(...Object.values(data?.ordersByStatus || { x: 1 }) as number[])) * 100}%`,
                        background: STATUS_COLOR[status] || "#9CA3AF",
                      }} />
                    </div>
                  </div>
                </div>
              ))}
              {Object.keys(data?.ordersByStatus || {}).length === 0 && (
                <p className="text-xs text-[var(--color-text-muted)] text-center py-4">Koi orders nahi hain abhi</p>
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent orders */}
          <motion.div {...fadeUp(6)} className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-[var(--color-text)]">Recent Orders</h3>
              <Link href="/admin/orders" className="text-xs font-semibold text-[var(--color-gold)] hover:underline">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    {["Order ID", "Client", "Product", "Amount", "Status"].map(h => (
                      <th key={h} className="text-left py-2 px-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-xs text-[var(--color-text-muted)]">Koi orders nahi</td></tr>
                  ) : recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors">
                      <td className="py-3 px-2">
                        <span className="text-xs font-mono font-semibold text-[var(--color-text-secondary)]">{order.id}</span>
                      </td>
                      <td className="py-3 px-2">
                        <p className="text-xs font-medium text-[var(--color-text)]">{order.client}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{order.city}</p>
                      </td>
                      <td className="py-3 px-2">
                        <p className="text-xs text-[var(--color-text)]">{order.product}</p>
                        <span className="text-[10px] text-[var(--color-text-muted)]">{order.plan}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-xs font-bold text-[var(--color-text)]">₹{order.amount.toLocaleString("en-IN")}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
                          style={{ color: STATUS_COLOR[order.status], background: `${STATUS_COLOR[order.status]}18` }}>
                          {STATUS_LABEL[order.status] || order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Top products */}
          <motion.div {...fadeUp(7)} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-[var(--color-text)]">Top Products</h3>
              <Link href="/admin/products" className="text-xs font-semibold text-[var(--color-gold)] hover:underline">Manage</Link>
            </div>
            {topProducts.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)] text-center py-6">Data loading...</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p: any, i: number) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center text-[10px] font-bold text-[var(--color-text-muted)]">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--color-text)] truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
                          <div className="h-full rounded-full bg-[var(--color-gold)]"
                            style={{ width: `${Math.max((p.orders / (topProducts[0]?.orders || 1)) * 100, 4)}%` }} />
                        </div>
                        <span className="text-[10px] text-[var(--color-text-muted)]">{p.orders} orders</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-[var(--color-border)] grid grid-cols-2 gap-3">
              {[
                { icon: Zap, label: "Avg Delivery", value: "2.8 days" },
                { icon: Star, label: "Avg Rating", value: stats.rating?.value ? `${stats.rating.value}/5` : "N/A" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-2.5 rounded-xl bg-[var(--color-bg-secondary)] text-center">
                  <Icon size={14} className="text-[var(--color-gold)] mx-auto mb-1" />
                  <p className="text-xs font-bold text-[var(--color-text)]">{value}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent leads */}
        <motion.div {...fadeUp(8)} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">
              Recent Leads
              {recentLeads.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-[10px] font-semibold">{recentLeads.length}</span>
              )}
            </h3>
            <Link href="/admin/clients" className="text-xs font-semibold text-[var(--color-gold)] hover:underline">View CRM</Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-8">Koi new leads nahi hain</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentLeads.map((lead: any) => (
                <div key={lead.id} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-gold)]/40 transition-all">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-navy)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {lead.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--color-text)] truncate">{lead.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{lead.interest}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: LEAD_STATUS_COLOR[lead.status] || "#9CA3AF", background: `${LEAD_STATUS_COLOR[lead.status] || "#9CA3AF"}18` }}>
                        {lead.status}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">{lead.source}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <a href={`tel:${lead.phone}`} className="w-7 h-7 rounded-lg bg-[var(--color-success)]/10 flex items-center justify-center hover:bg-[var(--color-success)]/20 transition-colors" title="Call">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" className="w-3.5 h-3.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.72 6.72l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                    </a>
                    <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                      className="w-7 h-7 rounded-lg bg-[#25D366]/10 flex items-center justify-center hover:bg-[#25D366]/20 transition-colors" title="WhatsApp">
                      <svg viewBox="0 0 24 24" fill="#25D366" className="w-3.5 h-3.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* AI Alerts — compact inline section */}
        <motion.div {...fadeUp(9)} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle size={16} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[var(--color-text)]">Active Alerts</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Unread HIGH &amp; CRITICAL alerts</p>
              </div>
            </div>
            <Link href="/admin/alerts" className="text-xs font-semibold text-[var(--color-gold)] hover:underline">
              View all alerts
            </Link>
          </div>

          {alertsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={20} className="animate-spin text-[var(--color-gold)]" />
            </div>
          ) : recentAlerts.length === 0 ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
              <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 text-sm font-bold shrink-0">✓</div>
              <p className="text-xs text-[var(--color-text-secondary)]">All systems normal — no critical alerts.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentAlerts.map((alert) => {
                const color = ALERT_SEVERITY_COLOR[alert.severity] || "#9CA3AF";
                return (
                  <div key={alert.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-gold)]/40 transition-all">
                    <div className="w-2 h-full min-h-[36px] rounded-full shrink-0" style={{ background: color, width: "3px" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--color-text)] truncate">{alert.title}</p>
                      <span
                        className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                        style={{ color, background: `${color}18` }}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    {alert.actionUrl && alert.actionLabel && (
                      <Link
                        href={alert.actionUrl}
                        className="text-[10px] font-semibold text-[var(--color-gold)] hover:underline shrink-0"
                      >
                        {alert.actionLabel} →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* AI Insights */}
        <motion.div {...fadeUp(10)} className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-gold)]/15 flex items-center justify-center">
                <Brain size={18} className="text-[var(--color-gold)]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[var(--color-text)]">AI Insights</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Revenue forecast + smart recommendations</p>
              </div>
            </div>
            <Link href="/admin/proposals" className="text-xs font-semibold text-[var(--color-gold)] hover:underline flex items-center gap-1">
              <Zap size={12} /> Generate Proposal
            </Link>
          </div>

          {forecastLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-[var(--color-gold)]" />
            </div>
          ) : forecast ? (
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wide">
                  Revenue Forecast — Next 3 Months
                </p>
                <div className="flex items-end gap-3 h-32 mb-2">
                  {forecast.forecast.map((m, i) => {
                    const maxVal = Math.max(...forecast.forecast.map(f => f.optimistic), 1)
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="w-full flex flex-col gap-0.5 items-center justify-end" style={{ height: "100%" }}>
                          <div className="w-full rounded-t-lg relative group-hover:opacity-90 transition-opacity"
                            style={{
                              height: `${Math.max((m.base / maxVal) * 100, 6)}%`,
                              background: "linear-gradient(180deg, #C9A227, #E8C547)",
                            }}>
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[var(--color-navy)] text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              ₹{(m.base / 1000).toFixed(0)}K
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-[var(--color-text-muted)]">{m.month}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-1">
                  {forecast.forecast.map((m, i) => (
                    <div key={i} className="flex-1 text-center">
                      <p className="font-semibold text-[var(--color-text)]">₹{(m.base / 1000).toFixed(0)}K</p>
                      <p className="text-[9px]">₹{(m.pessimistic / 1000).toFixed(0)}K – ₹{(m.optimistic / 1000).toFixed(0)}K</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                    <p className="text-[10px] text-[var(--color-text-muted)] mb-1">Pipeline Value</p>
                    <p className="text-sm font-bold text-[var(--color-text)]">₹{(forecast.pipelineValue / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                    <p className="text-[10px] text-[var(--color-text-muted)] mb-1">Hot Leads Potential</p>
                    <p className="text-sm font-bold text-[var(--color-gold)]">₹{(forecast.hotLeadsPotential / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                    <p className="text-[10px] text-[var(--color-text-muted)] mb-1">Growth Rate</p>
                    <p className={`text-sm font-bold ${forecast.growthRate >= 0 ? "text-[var(--color-success)]" : "text-red-500"}`}>
                      {forecast.growthRate >= 0 ? "+" : ""}{forecast.growthRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wide">
                  AI Recommendations
                </p>
                <div className="space-y-2.5">
                  {[
                    {
                      icon: Flame,
                      color: "#EF4444",
                      text: data?.hotLeadsCount > 0
                        ? `You have ${data.hotLeadsCount} hot lead${data.hotLeadsCount > 1 ? "s" : ""} — follow up today for maximum conversion.`
                        : "No hot leads right now. Focus on warming up qualified leads.",
                    },
                    {
                      icon: TrendingUp,
                      color: "#16A34A",
                      text: forecast.growthRate > 0
                        ? `Revenue is projected to grow ${forecast.growthRate.toFixed(1)}% — capitalize on this momentum with targeted outreach.`
                        : forecast.growthRate < 0
                        ? `Revenue trend is declining ${Math.abs(forecast.growthRate).toFixed(1)}% — review your pipeline and close pending proposals.`
                        : "Revenue is stable. Push for new leads to drive growth next month.",
                    },
                    {
                      icon: AlertTriangle,
                      color: "#F59E0B",
                      text: forecast.pipelineValue > 0
                        ? `₹${(forecast.pipelineValue / 1000).toFixed(0)}K in pipeline value detected — convert these leads into orders this month.`
                        : "Pipeline is empty. Generate proposals for qualified leads to build revenue momentum.",
                    },
                  ].map(({ icon: Icon, color, text }, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-gold)]/40 transition-all">
                      <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center" style={{ background: `${color}18` }}>
                        <Icon size={14} style={{ color }} />
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-8">Unable to load forecast data</p>
          )}
        </motion.div>

        {/* Kaviya Chat Stats */}
        <motion.div {...fadeUp(11)} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-gold)]/15 flex items-center justify-center">
                <MessageCircle size={18} className="text-[var(--color-gold)]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[var(--color-text)]">Kaviya Chat Stats</h3>
                <p className="text-xs text-[var(--color-text-muted)]">AI chat lead performance</p>
              </div>
            </div>
          </div>

          {chatStats ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] text-center">
                <p className="text-2xl font-bold text-[var(--color-gold)]">{chatStats.chatLeadsThisMonth}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Leads this month</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] text-center">
                <p className="text-2xl font-bold text-[var(--color-text)]">{chatStats.chatLeadsLast30}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Last 30 days</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] text-center sm:col-span-1 col-span-2">
                <p className="text-2xl font-bold text-[var(--color-text)]">{chatStats.chatEscalations}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Escalations (30d)</p>
              </div>
              <div className="col-span-2 sm:col-span-3 p-3 rounded-xl bg-[var(--color-gold)]/5 border border-[var(--color-gold)]/20">
                <p className="text-xs text-[var(--color-text-secondary)] text-center font-medium">{chatStats.summary}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={20} className="animate-spin text-[var(--color-gold)]" />
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
