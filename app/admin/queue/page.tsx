"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";
import {
  Layers,
  RefreshCw,
  Play,
  Trash2,
  RotateCcw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Server,
} from "lucide-react";

interface QueueStats {
  high: number;
  normal: number;
  low: number;
  dead: number;
  processing: number;
  backend: "redis" | "memory";
}

interface CronSchedule {
  path: string;
  schedule: string;
  description: string;
}

const CRON_SCHEDULES: CronSchedule[] = [
  { path: "/api/cron/worker", schedule: "Every 1 minute", description: "Process queued jobs (email, telegram, automations…)" },
  { path: "/api/cron/alerts", schedule: "Every 15 minutes", description: "Run AI alert checks across CRM, orders, SLA" },
  { path: "/api/admin/webhooks/retry", schedule: "Every 5 minutes", description: "Retry failed outbound webhook deliveries" },
];

function StatCard({
  label,
  count,
  color,
  icon: Icon,
}: {
  label: string;
  count: number;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className={`rounded-xl border p-5 flex items-center gap-4 bg-[var(--color-bg)] ${color}`}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-current/10 shrink-0">
        <Icon size={20} className="text-current" />
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--color-text)]">{count}</p>
        <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
      </div>
    </div>
  );
}

export default function QueuePage() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/queue", { credentials: "include" });
      if (res.ok) {
        const data = await res.json() as { stats: QueueStats };
        setStats(data.stats);
        setLastRefreshed(new Date());
      }
    } catch {
      // silently ignore polling errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10_000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleAction = async (action: string, onDone: () => void) => {
    try {
      const res = await fetch("/api/admin/queue", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json() as Record<string, unknown>;
      if (res.ok) {
        if (action === "process") {
          showToast(`Processed ${data.processed as number} job(s), ${data.failed as number} failed`);
        } else if (action === "retry-dead") {
          showToast(`Re-enqueued ${data.retried as number} dead job(s)`);
        } else if (action === "clear-dead") {
          showToast("Dead letter queue cleared");
        } else if (action === "enqueue-test") {
          showToast(`Test job enqueued: ${data.jobId as string}`);
        }
        await fetchStats();
      } else {
        showToast((data.error as string) || "Action failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      onDone();
    }
  };

  const handleProcess = () => {
    setProcessing(true);
    handleAction("process", () => setProcessing(false));
  };

  const handleRetryDead = () => {
    setRetrying(true);
    handleAction("retry-dead", () => setRetrying(false));
  };

  const handleClearDead = () => {
    if (!confirm("Clear all dead-letter jobs? This cannot be undone.")) return;
    setClearing(true);
    handleAction("clear-dead", () => setClearing(false));
  };

  const handleEnqueueTest = () => {
    handleAction("enqueue-test", () => {});
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg-secondary)]">
      <AdminTopbar title="Job Queue" />

      <main className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">

        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
              toast.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-navy)] flex items-center justify-center">
              <Layers size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text)]">Job Queue Monitor</h2>
              {lastRefreshed && (
                <p className="text-xs text-[var(--color-text-muted)]">
                  Last updated {lastRefreshed.toLocaleTimeString()} — auto-refreshes every 10s
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchStats}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              onClick={handleEnqueueTest}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors"
            >
              <Layers size={14} />
              Enqueue Test
            </button>
            <button
              onClick={handleProcess}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-navy)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {processing ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Play size={14} />
              )}
              {processing ? "Processing…" : "Process Now"}
            </button>
          </div>
        </div>

        {/* Backend badge */}
        {stats && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <Server size={13} />
            Backend:{" "}
            <span
              className={`font-semibold ${
                stats.backend === "redis" ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {stats.backend === "redis" ? "Redis" : "In-Memory (Redis unavailable)"}
            </span>
          </div>
        )}

        {/* Stats cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="High Priority"
              count={stats?.high ?? 0}
              color="border-red-200 text-red-600"
              icon={AlertTriangle}
            />
            <StatCard
              label="Normal Priority"
              count={stats?.normal ?? 0}
              color="border-blue-200 text-blue-600"
              icon={Layers}
            />
            <StatCard
              label="Low Priority"
              count={stats?.low ?? 0}
              color="border-gray-200 text-gray-500"
              icon={Clock}
            />
            <StatCard
              label="Dead Letter"
              count={stats?.dead ?? 0}
              color="border-orange-200 text-orange-600"
              icon={AlertTriangle}
            />
          </div>
        )}

        {/* Queue status table */}
        <div className="bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)]">
            <h3 className="font-semibold text-[var(--color-text)]">Queue Status</h3>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {[
              { name: "High Priority", key: "high", color: "bg-red-500" },
              { name: "Normal Priority", key: "normal", color: "bg-blue-500" },
              { name: "Low Priority", key: "low", color: "bg-gray-400" },
              { name: "Dead Letter", key: "dead", color: "bg-orange-500" },
              { name: "Processing", key: "processing", color: "bg-green-500" },
            ].map(({ name, key, color }) => {
              const count = stats ? stats[key as keyof QueueStats] as number : 0;
              return (
                <div key={key} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <span className="text-sm text-[var(--color-text)]">{name}</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-[var(--color-text)]">
                    {loading ? "—" : count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dead Letter Queue actions */}
        <div className="bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">Dead Letter Queue</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Jobs that exhausted all retry attempts
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRetryDead}
                disabled={retrying || (stats?.dead ?? 0) === 0}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {retrying ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <RotateCcw size={12} />
                )}
                Retry All
              </button>
              <button
                onClick={handleClearDead}
                disabled={clearing || (stats?.dead ?? 0) === 0}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {clearing ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <Trash2 size={12} />
                )}
                Clear All
              </button>
            </div>
          </div>
          <div className="px-5 py-8 text-center text-sm text-[var(--color-text-muted)]">
            {loading ? (
              "Loading…"
            ) : (stats?.dead ?? 0) === 0 ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 size={24} className="text-green-500" />
                No dead-letter jobs — all clear
              </div>
            ) : (
              <p>
                <span className="font-bold text-orange-600">{stats?.dead}</span> job(s) in the dead-letter queue.
                Use &quot;Retry All&quot; to re-enqueue them, or &quot;Clear All&quot; to discard.
              </p>
            )}
          </div>
        </div>

        {/* Cron schedule info */}
        <div className="bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)]">
            <h3 className="font-semibold text-[var(--color-text)]">Cron Schedule</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Configure these endpoints in your cron service (e.g., Vercel Cron, crontab)
            </p>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {CRON_SCHEDULES.map(({ path, schedule, description }) => (
              <div key={path} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <code className="text-xs font-mono text-[var(--color-navy)] bg-[var(--color-bg-secondary)] px-2 py-0.5 rounded">
                    {path}
                  </code>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">{description}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Clock size={13} className="text-[var(--color-text-muted)]" />
                  <span className="text-xs font-medium text-[var(--color-text-secondary)]">{schedule}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
