"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, ShoppingBag, IndianRupee,
  Eye, MousePointer, Globe, Smartphone, Loader2,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";



const TRAFFIC_SOURCES = [
  { label: "Organic Search", value: 38, color: "#16A34A" },
  { label: "Direct", value: 24, color: "#0891B2" },
  { label: "Social Media", value: 18, color: "#7C3AED" },
  { label: "Referral", value: 12, color: "#C9A227" },
  { label: "Paid Ads", value: 8, color: "#EF4444" },
];

const DEVICE_SPLIT = [
  { label: "Mobile", value: 62, icon: Smartphone, color: "#0891B2" },
  { label: "Desktop", value: 31, icon: Globe, color: "#7C3AED" },
  { label: "Tablet", value: 7, icon: Globe, color: "#C9A227" },
];

const TOP_PAGES = [
  { page: "/products", views: 4821, bounce: "28%", time: "3m 12s" },
  { page: "/", views: 3910, bounce: "35%", time: "2m 45s" },
  { page: "/contact", views: 2234, bounce: "22%", time: "4m 01s" },
  { page: "/portfolio", views: 1876, bounce: "40%", time: "2m 18s" },
  { page: "/products/restaurant-website", views: 1432, bounce: "18%", time: "5m 33s" },
  { page: "/blog", views: 987, bounce: "52%", time: "1m 44s" },
];

const MONTHLY = [
  { month: "Jan", visitors: 8200, leads: 142, orders: 18 },
  { month: "Feb", visitors: 9100, leads: 168, orders: 22 },
  { month: "Mar", visitors: 8700, leads: 155, orders: 19 },
  { month: "Apr", visitors: 11200, leads: 201, orders: 28 },
  { month: "May", visitors: 12800, leads: 234, orders: 31 },
  { month: "Jun", visitors: 10900, leads: 198, orders: 26 },
  { month: "Jul", visitors: 14300, leads: 267, orders: 38 },
  { month: "Aug", visitors: 15600, leads: 289, orders: 42 },
  { month: "Sep", visitors: 13900, leads: 251, orders: 36 },
  { month: "Oct", visitors: 16800, leads: 312, orders: 47 },
  { month: "Nov", visitors: 18200, leads: 338, orders: 51 },
  { month: "Dec", visitors: 19400, leads: 365, orders: 58 },
];

const maxVisitors = Math.max(...MONTHLY.map(m => m.visitors));

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    fetch("/api/admin/stats", {
      credentials: "include",
      
    })
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const KPI = [
    { label: "Total Visitors", value: "1,42,800", change: "+23%", icon: Eye, color: "#0891B2" },
    { label: "Leads Generated", value: stats?.stats?.leads?.value?.toLocaleString("en-IN") || "—", change: "+18%", icon: Users, color: "#C9A227" },
    { label: "Orders", value: stats?.stats?.orders?.value?.toString() || "—", change: "+12%", icon: ShoppingBag, color: "#7C3AED" },
    { label: "Revenue", value: stats?.stats?.revenue?.value ? `₹${(stats.stats.revenue.value / 100000).toFixed(1)}L` : "—", change: "+28%", icon: IndianRupee, color: "#16A34A" },
    { label: "Avg Session", value: "3m 24s", change: "+8%", icon: MousePointer, color: "#EF4444" },
    { label: "Bounce Rate", value: "34.2%", change: "-5%", icon: TrendingUp, color: "#F59E0B" },
  ];

  return (
    <>
      <AdminTopbar title="Analytics" />
      <div className="p-6 space-y-6 max-w-[1400px]">

        {/* Period selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--color-text-muted)]">Period:</span>
          {(["7d", "30d", "90d"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${period === p ? "bg-[var(--color-navy)] text-white" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]"}`}>
              {p === "7d" ? "Last 7 days" : p === "30d" ? "Last 30 days" : "Last 90 days"}
            </button>
          ))}
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {KPI.map(({ label, value, change, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon size={17} style={{ color }} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${change.startsWith("+") ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                  {change}
                </span>
              </div>
              <p className="font-display font-bold text-xl text-[var(--color-text)]">
                {loading && (label === "Leads Generated" || label === "Orders" || label === "Revenue")
                  ? <Loader2 size={16} className="animate-spin text-[var(--color-gold)]" />
                  : value}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Visitors chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-base text-[var(--color-text)]">Visitor Trends</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Monthly visitors, leads & orders</p>
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                {[{ label: "Visitors", color: "#0891B2" }, { label: "Leads", color: "#C9A227" }, { label: "Orders", color: "#16A34A" }].map(l => (
                  <span key={l.label} className="flex items-center gap-1.5">
                    <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: l.color }} />{l.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-36">
              {MONTHLY.map((d, i) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-0.5 group">
                  <div className="w-full flex flex-col items-center gap-0.5">
                    <div className="w-full rounded-t-sm" title={`${d.visitors.toLocaleString()} visitors`}
                      style={{ height: `${(d.visitors / maxVisitors) * 120}px`, background: "#0891B2", opacity: 0.7 }} />
                    <div className="w-2/3 rounded-t-sm" title={`${d.leads} leads`}
                      style={{ height: `${(d.leads / 400) * 60}px`, background: "#C9A227", opacity: 0.8 }} />
                  </div>
                  <span className="text-[8px] text-[var(--color-text-muted)]">{d.month}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Traffic sources */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="card p-5">
            <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-5">Traffic Sources</h3>
            <div className="space-y-3">
              {TRAFFIC_SOURCES.map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[var(--color-text-secondary)]">{label}</span>
                    <span className="font-semibold text-[var(--color-text)]">{value}%</span>
                  </div>
                  <div className="h-2 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, delay: 0.5 }}
                      className="h-full rounded-full" style={{ background: color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-5 border-t border-[var(--color-border)]">
              <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-3">Device Split</h4>
              <div className="space-y-2">
                {DEVICE_SPLIT.map(({ label, value, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-xs text-[var(--color-text-secondary)] flex-1">{label}</span>
                    <span className="text-xs font-bold text-[var(--color-text)]">{value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top pages */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)]">
            <h3 className="font-display font-bold text-base text-[var(--color-text)]">Top Pages</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-secondary)]">
                <tr>
                  {["Page", "Views", "Bounce Rate", "Avg Time"].map(h => (
                    <th key={h} className="text-left py-3 px-5 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOP_PAGES.map((page, i) => (
                  <tr key={page.page} className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center text-[10px] font-bold text-[var(--color-text-muted)] shrink-0">{i + 1}</span>
                        <span className="text-sm font-mono text-[var(--color-text)]">{page.page}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div>
                        <p className="text-sm font-bold text-[var(--color-text)]">{page.views.toLocaleString("en-IN")}</p>
                        <div className="w-24 h-1 bg-[var(--color-bg-secondary)] rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-[var(--color-gold)] rounded-full" style={{ width: `${(page.views / TOP_PAGES[0].views) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-sm font-semibold ${parseInt(page.bounce) < 30 ? "text-green-500" : parseInt(page.bounce) > 45 ? "text-red-500" : "text-[var(--color-gold)]"}`}>
                        {page.bounce}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-sm text-[var(--color-text-secondary)]">{page.time}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </>
  );
}
