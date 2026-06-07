"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bell, RefreshCw, CheckCheck, Eye, X, Loader2, Search,
  AlertTriangle, ShieldAlert, Info, Zap,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";

type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface AIAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  resourceType?: string;
  resourceId?: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  isDismissed: boolean;
  generatedAt: string;
}

const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  CRITICAL: "#EF4444",
  HIGH: "#F97316",
  MEDIUM: "#EAB308",
  LOW: "#3B82F6",
};

const SEVERITY_BG: Record<AlertSeverity, string> = {
  CRITICAL: "rgba(239,68,68,0.08)",
  HIGH: "rgba(249,115,22,0.08)",
  MEDIUM: "rgba(234,179,8,0.08)",
  LOW: "rgba(59,130,246,0.08)",
};

const SEVERITY_ICON: Record<AlertSeverity, typeof AlertTriangle> = {
  CRITICAL: ShieldAlert,
  HIGH: AlertTriangle,
  MEDIUM: Zap,
  LOW: Info,
};

function formatType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function entityLink(resourceType?: string, resourceId?: string): string | null {
  if (!resourceType || !resourceId) return null;
  const map: Record<string, string> = {
    order: "/admin/orders",
    ticket: "/admin/support",
    client: "/admin/clients",
    lead: "/admin/crm",
  };
  const base = map[resourceType.toLowerCase()];
  return base ? `${base}?id=${resourceId}` : null;
}

type SeverityFilter = "ALL" | AlertSeverity;

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("ALL");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [search, setSearch] = useState("");

  const fetchAlerts = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (severityFilter !== "ALL") params.set("severity", severityFilter);
      if (unreadOnly) params.set("unread", "true");
      const res = await fetch(`/api/admin/ai-alerts?${params}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {}
    setLoading(false);
  }, [severityFilter, unreadOnly]);

  useEffect(() => {
    setLoading(true);
    fetchAlerts();
  }, [fetchAlerts]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const id = setInterval(fetchAlerts, 60000);
    return () => clearInterval(id);
  }, [fetchAlerts]);

  const runCheck = async () => {
    setGenerating(true);
    try {
      await fetch("/api/admin/ai-alerts/generate", {
        method: "POST",
        credentials: "include",
      });
      await fetchAlerts();
    } catch {}
    setGenerating(false);
  };

  const markRead = async (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await fetch("/api/admin/ai-alerts", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "read" }),
    });
  };

  const dismiss = async (id: string) => {
    const wasUnread = alerts.find((a) => a.id === id)?.isRead === false;
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    await fetch(`/api/admin/ai-alerts?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  };

  const markAllRead = async () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    setUnreadCount(0);
    await fetch("/api/admin/ai-alerts", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
  };

  const filtered = alerts.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q)
    );
  });

  const SEVERITY_TABS: { value: SeverityFilter; label: string; color?: string }[] = [
    { value: "ALL", label: "All" },
    { value: "CRITICAL", label: "Critical", color: "#EF4444" },
    { value: "HIGH", label: "High", color: "#F97316" },
    { value: "MEDIUM", label: "Medium", color: "#EAB308" },
    { value: "LOW", label: "Low", color: "#3B82F6" },
  ];

  return (
    <>
      <AdminTopbar title="AI Alerts" />
      <div className="p-6 space-y-6 max-w-5xl">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Bell size={20} className="text-red-500" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-[var(--color-text)]">
                AI Alerts Center
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Intelligent business alerts — auto-refreshes every 60s
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                {unreadCount} unread
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-all"
              >
                <CheckCheck size={14} />
                Mark All Read
              </button>
            )}
            <button
              onClick={runCheck}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-gold)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-60 transition-all"
            >
              {generating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Run Check Now
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Severity tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            {SEVERITY_TABS.map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => setSeverityFilter(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  severityFilter === value
                    ? "bg-[var(--color-bg)] shadow-sm"
                    : "hover:bg-[var(--color-bg)]"
                }`}
                style={
                  severityFilter === value && color
                    ? { color }
                    : color
                    ? { color: "var(--color-text-muted)" }
                    : {}
                }
              >
                {label}
              </button>
            ))}
          </div>

          {/* Unread toggle */}
          <button
            onClick={() => setUnreadOnly((v) => !v)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
              unreadOnly
                ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
            }`}
          >
            {unreadOnly ? "Unread only" : "All status"}
          </button>

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] flex-1 min-w-[180px] max-w-xs">
            <Search size={13} className="text-[var(--color-text-muted)] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alerts..."
              className="text-sm bg-transparent outline-none text-[var(--color-text)] w-full placeholder:text-[var(--color-text-muted)]"
            />
          </div>
        </div>

        {/* Alert list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[var(--color-gold)]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <span className="text-3xl">✓</span>
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-lg text-[var(--color-text)]">
                All clear!
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                No active alerts matching your filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((alert) => {
              const color = SEVERITY_COLOR[alert.severity];
              const bgHighlight = SEVERITY_BG[alert.severity];
              const SeverityIcon = SEVERITY_ICON[alert.severity];
              const entityHref = entityLink(alert.resourceType, alert.resourceId);

              return (
                <div
                  key={alert.id}
                  className={`flex gap-0 rounded-xl border overflow-hidden transition-all hover:shadow-sm ${
                    !alert.isRead
                      ? "border-[var(--color-border)] shadow-[0_0_0_1px_rgba(201,162,39,0.15)]"
                      : "border-[var(--color-border)]"
                  }`}
                  style={!alert.isRead ? { background: bgHighlight } : { background: "var(--color-bg)" }}
                >
                  {/* Left severity bar */}
                  <div
                    className="w-1 shrink-0 rounded-l-xl"
                    style={{ background: color }}
                  />

                  {/* Content */}
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
                        style={{ background: `${color}18` }}
                      >
                        <SeverityIcon size={15} style={{ color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Badges row */}
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span
                            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                            style={{ color, background: `${color}18` }}
                          >
                            {alert.severity}
                          </span>
                          <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                            {formatType(alert.type)}
                          </span>
                          {!alert.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
                          )}
                        </div>

                        {/* Title */}
                        <p className="text-sm font-bold text-[var(--color-text)] mb-1">
                          {alert.title}
                        </p>

                        {/* Description */}
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-2">
                          {alert.description}
                        </p>

                        {/* Entity link */}
                        {entityHref && (
                          <Link
                            href={entityHref}
                            className="text-[10px] font-semibold text-[var(--color-gold)] hover:underline mr-3"
                          >
                            {alert.resourceType} #{alert.resourceId?.slice(0, 8)} →
                          </Link>
                        )}

                        {/* Action link */}
                        {alert.actionUrl && alert.actionLabel && (
                          <Link
                            href={alert.actionUrl}
                            className="text-[10px] font-semibold text-[var(--color-gold)] hover:underline"
                          >
                            {alert.actionLabel} →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: time + actions */}
                  <div className="flex flex-col items-end justify-between p-3 shrink-0 gap-2">
                    <span className="text-[10px] text-[var(--color-text-muted)] whitespace-nowrap">
                      {timeAgo(alert.generatedAt)}
                    </span>
                    <div className="flex items-center gap-1">
                      {!alert.isRead && (
                        <button
                          onClick={() => markRead(alert.id)}
                          title="Mark as read"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-all"
                        >
                          <Eye size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => dismiss(alert.id)}
                        title="Dismiss"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
