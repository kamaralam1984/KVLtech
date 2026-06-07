"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, HeartPulse, AlertTriangle, Clock, BarChart2 } from "lucide-react";
import Link from "next/link";

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: "#EF4444",
  URGENT: "#DC2626",
};

const CATEGORY_COLORS: Record<string, string> = {
  BILLING: "#C9A227",
  TECHNICAL: "#0891B2",
  GENERAL: "#6B7280",
  COMPLAINT: "#EF4444",
  FEATURE_REQUEST: "#7C3AED",
};

interface InsightsData {
  categoryBreakdown: Record<string, number>;
  avgResolutionTime: number;
  sentimentTrend: { last7DaysPct: number; prev7DaysPct: number; trend: string };
  highPriorityOpen: number;
  openTickets: number;
  topIssueKeywords: { word: string; count: number }[];
  needsAttention: {
    id: string;
    ticketNo: string;
    subject: string;
    priority: string;
    status: string;
    createdAt: string;
    clientName: string;
  }[];
}

export function SupportInsightsWidget() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/support/insights", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalCategories = data
    ? Object.values(data.categoryBreakdown).reduce((a, b) => a + b, 0)
    : 0;

  if (loading) {
    return (
      <div className="card p-5 flex items-center justify-center h-40">
        <Loader2 size={20} className="animate-spin text-[var(--color-gold)]" />
      </div>
    );
  }

  if (!data) return null;

  const trendIcon =
    data.sentimentTrend.trend === "up" ? "↑" :
    data.sentimentTrend.trend === "down" ? "↓" : "→";
  const trendColor =
    data.sentimentTrend.trend === "up" ? "#EF4444" :
    data.sentimentTrend.trend === "down" ? "#16A34A" : "#6B7280";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="card p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-gold)]/15 flex items-center justify-center">
            <HeartPulse size={16} className="text-[var(--color-gold)]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-[var(--color-text)]">Support Health</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">Live ticket overview</p>
          </div>
        </div>
        <Link href="/admin/support" className="text-xs font-semibold text-[var(--color-gold)] hover:underline">
          View All →
        </Link>
      </div>

      {/* 4 mini stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 mb-1">
            <BarChart2 size={11} className="text-[var(--color-gold)]" />
            <span className="text-[9px] text-[var(--color-text-muted)] uppercase font-semibold tracking-wide">Open</span>
          </div>
          <p className="font-display font-bold text-lg text-[var(--color-gold)]">{data.openTickets}</p>
        </div>

        <div className="p-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle size={11} className="text-red-500" />
            <span className="text-[9px] text-[var(--color-text-muted)] uppercase font-semibold tracking-wide">High Priority</span>
          </div>
          <p className="font-display font-bold text-lg text-red-500">{data.highPriorityOpen}</p>
        </div>

        <div className="p-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={11} className="text-[var(--color-text-muted)]" />
            <span className="text-[9px] text-[var(--color-text-muted)] uppercase font-semibold tracking-wide">Avg Response</span>
          </div>
          <p className="font-display font-bold text-lg text-[var(--color-text)]">{data.avgResolutionTime}h</p>
        </div>

        <div className="p-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] text-[var(--color-text-muted)] uppercase font-semibold tracking-wide">Urgent Trend</span>
          </div>
          <p className="font-display font-bold text-lg" style={{ color: trendColor }}>
            {trendIcon} {data.sentimentTrend.last7DaysPct}%
          </p>
        </div>
      </div>

      {/* Category breakdown bar */}
      {totalCategories > 0 && (
        <div className="mb-4">
          <p className="text-[9px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1.5">Category Breakdown</p>
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            {Object.entries(data.categoryBreakdown)
              .filter(([, v]) => v > 0)
              .map(([cat, count]) => (
                <div
                  key={cat}
                  title={`${cat}: ${count}`}
                  className="rounded-full"
                  style={{
                    width: `${(count / totalCategories) * 100}%`,
                    background: CATEGORY_COLORS[cat] || "#9CA3AF",
                  }}
                />
              ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {Object.entries(data.categoryBreakdown)
              .filter(([, v]) => v > 0)
              .map(([cat, count]) => (
                <span key={cat} className="text-[9px] font-semibold" style={{ color: CATEGORY_COLORS[cat] || "#9CA3AF" }}>
                  {cat.split("_")[0].toLowerCase()} {count}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Needs attention */}
      {data.needsAttention.length > 0 && (
        <div>
          <p className="text-[9px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Needs Attention</p>
          <div className="space-y-1.5">
            {data.needsAttention.map((t) => {
              const ageHours = Math.floor(
                (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60)
              );
              return (
                <Link
                  key={t.id}
                  href="/admin/support"
                  className="flex items-start gap-2 p-2 rounded-xl bg-red-500/5 border border-red-400/20 hover:border-red-400/40 transition-all block"
                >
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: PRIORITY_COLOR[t.priority] || "#EF4444" }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-[var(--color-text)] truncate">{t.subject}</p>
                    <p className="text-[9px] text-[var(--color-text-muted)]">
                      {t.clientName} · {ageHours}h ago · {t.priority}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
