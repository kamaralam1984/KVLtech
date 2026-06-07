"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  TrendingDown,
  Users,
  Clock,
  CreditCard,
  X,
  Brain,
  RefreshCw,
  CheckCheck,
  Loader2,
  BellRing,
} from "lucide-react";

interface AIAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  resourceType?: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  isDismissed: boolean;
  generatedAt: string;
}

const SEVERITY_STYLES: Record<string, { border: string; bg: string; badge: string }> = {
  CRITICAL: {
    border: "border-l-red-500",
    bg: "bg-red-500/5",
    badge: "bg-red-500/10 text-red-500",
  },
  HIGH: {
    border: "border-l-orange-500",
    bg: "bg-orange-500/5",
    badge: "bg-orange-500/10 text-orange-500",
  },
  MEDIUM: {
    border: "border-l-yellow-500",
    bg: "bg-yellow-500/5",
    badge: "bg-yellow-500/10 text-yellow-500",
  },
  LOW: {
    border: "border-l-blue-500",
    bg: "bg-blue-500/5",
    badge: "bg-blue-500/10 text-blue-500",
  },
};

function AlertIcon({ type }: { type: string }) {
  const cls = "shrink-0";
  const sz = 16;
  switch (type) {
    case "revenue_drop":
      return <TrendingDown size={sz} className={cls} />;
    case "lead_stagnation":
      return <Users size={sz} className={cls} />;
    case "client_risk":
      return <Brain size={sz} className={cls} />;
    case "overdue_tickets":
      return <Clock size={sz} className={cls} />;
    case "payment_pending":
      return <CreditCard size={sz} className={cls} />;
    default:
      return <AlertTriangle size={sz} className={cls} />;
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function AIAlertsPanel() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [dismissingAll, setDismissingAll] = useState(false);
  const lastGeneratedRef = useRef<number | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ai-alerts", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setAlerts(data.alerts ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {}
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ai-alerts?unreadOnly=true&limit=1", {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.unreadCount ?? 0);
    } catch {}
  }, []);

  const generateAlerts = useCallback(async () => {
    setGenerating(true);
    try {
      await fetch("/api/admin/ai-alerts/generate", {
        method: "POST",
        credentials: "include",
      });
      lastGeneratedRef.current = Date.now();
      await fetchAlerts();
    } catch {}
    setGenerating(false);
  }, [fetchAlerts]);

  const handleOpen = useCallback(async () => {
    setOpen(true);
    setLoading(true);
    await fetchAlerts();
    setLoading(false);

    // Auto-generate if no alerts exist in the last 6h
    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
    const hasRecent =
      lastGeneratedRef.current && lastGeneratedRef.current > sixHoursAgo;
    if (!hasRecent) {
      await generateAlerts();
    }
  }, [fetchAlerts, generateAlerts]);

  const markRead = useCallback(
    async (id: string) => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await fetch("/api/admin/ai-alerts", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action: "read" }),
        });
      } catch {}
    },
    []
  );

  const dismiss = useCallback(
    async (id: string) => {
      const wasUnread = alerts.find((a) => a.id === id && !a.isRead);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await fetch("/api/admin/ai-alerts", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action: "dismiss" }),
        });
      } catch {}
    },
    [alerts]
  );

  const dismissAll = useCallback(async () => {
    setDismissingAll(true);
    setAlerts([]);
    setUnreadCount(0);
    try {
      for (const alert of alerts) {
        await fetch("/api/admin/ai-alerts", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: alert.id, action: "dismiss" }),
        });
      }
    } catch {}
    setDismissingAll(false);
  }, [alerts]);

  // 30-second polling for unread count (badge stays live even when panel is closed)
  useEffect(() => {
    fetchUnreadCount();
    pollRef.current = setInterval(fetchUnreadCount, 30_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchUnreadCount]);

  // Mark all as read when opened
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      try {
        await fetch("/api/admin/ai-alerts", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "readAll" }),
        });
        setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
        setUnreadCount(0);
      } catch {}
    }, 1500);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        className="relative flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-gold)]/60 transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        title="AI Intelligence Alerts"
      >
        <BellRing size={15} />
        <span className="hidden sm:inline text-xs font-medium">AI Alerts</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[380px] z-50 flex flex-col bg-[var(--color-bg)] border-l border-[var(--color-border)] shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-gold)]/15 flex items-center justify-center">
              <Brain size={15} className="text-[var(--color-gold)]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-[var(--color-text)]">
                AI Intelligence Alerts
              </h2>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                {alerts.length} active alert{alerts.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={generateAlerts}
              disabled={generating}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-[var(--color-gold)]/10 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20 transition-all disabled:opacity-60"
              title="Generate new alerts from AI"
            >
              {generating ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <RefreshCw size={11} />
              )}
              Generate
            </button>
            {alerts.length > 0 && (
              <button
                onClick={dismissAll}
                disabled={dismissingAll}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-all disabled:opacity-60"
                title="Dismiss all alerts"
              >
                <CheckCheck size={11} />
                Dismiss All
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Alert list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-[var(--color-gold)]" />
            </div>
          ) : generating && alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={24} className="animate-spin text-[var(--color-gold)]" />
              <p className="text-xs text-[var(--color-text-muted)]">Analysing business data…</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <p className="text-sm font-semibold text-[var(--color-text)]">All clear!</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                No alerts — your business is healthy!
              </p>
            </div>
          ) : (
            alerts.map((alert) => {
              const styles = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.MEDIUM;
              return (
                <div
                  key={alert.id}
                  onClick={() => !alert.isRead && markRead(alert.id)}
                  className={`relative rounded-xl border-l-4 border border-[var(--color-border)] p-4 transition-all cursor-default ${styles.border} ${styles.bg} ${
                    !alert.isRead ? "ring-1 ring-[var(--color-gold)]/20" : ""
                  }`}
                >
                  {/* Dismiss button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismiss(alert.id);
                    }}
                    className="absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)] transition-all"
                    title="Dismiss"
                  >
                    <X size={12} />
                  </button>

                  {/* Header */}
                  <div className="flex items-start gap-2.5 pr-7">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${styles.badge}`}
                    >
                      <AlertIcon type={alert.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={`text-sm font-semibold text-[var(--color-text)] leading-tight ${
                            !alert.isRead ? "font-bold" : ""
                          }`}
                        >
                          {alert.title}
                        </p>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${styles.badge}`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                        {alert.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--color-border)]/50">
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      {timeAgo(alert.generatedAt)}
                    </span>
                    {alert.actionUrl && alert.actionLabel && (
                      <Link
                        href={alert.actionUrl}
                        onClick={() => setOpen(false)}
                        className="text-[10px] font-semibold text-[var(--color-gold)] hover:underline flex items-center gap-1"
                      >
                        {alert.actionLabel} →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
