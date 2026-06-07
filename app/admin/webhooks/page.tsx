"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Webhook, Plus, X, Loader2, RefreshCw, CheckCircle2, XCircle,
  AlertCircle, Eye, Trash2, Play, Copy, Clock, ChevronDown, ChevronUp,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";
import { useToast } from "@/components/ui/Toast";

const INPUT =
  "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all";
const LABEL = "block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5";

const ALL_EVENTS = [
  "order.created", "order.status_changed",
  "payment.captured", "payment.failed",
  "lead.created", "lead.status_changed",
  "ticket.created", "ticket.resolved",
];

const STATUS_DELIVERY: Record<string, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
  SUCCESS: { color: "#16A34A", bg: "#16A34A15", icon: CheckCircle2 },
  FAILED:  { color: "#EF4444", bg: "#EF444415", icon: XCircle },
  PENDING: { color: "#F59E0B", bg: "#F59E0B15", icon: Clock },
  RETRYING:{ color: "#0891B2", bg: "#0891B215", icon: RefreshCw },
};

interface Endpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  description?: string;
  createdAt: string;
  stats: { successCount: number; failedCount: number; total: number; lastDelivery: string | null };
}

interface Delivery {
  id: string;
  event: string;
  status: string;
  responseStatus?: number;
  payload: string;
  responseBody?: string;
  createdAt: string;
  attempts: number;
}

export default function WebhooksPage() {
  const { toast } = useToast();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<{ endpoint: Endpoint; deliveries: Delivery[] } | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [expandedPayload, setExpandedPayload] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryToast, setRetryToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", url: "", secret: "", description: "", events: [] as string[],
  });
  const [formError, setFormError] = useState("");

  const fetchEndpoints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/webhooks", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setEndpoints(data.endpoints || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchEndpoints(); }, [fetchEndpoints]);

  const toggleEvent = (event: string) => {
    setForm((f) => ({
      ...f,
      events: f.events.includes(event) ? f.events.filter((e) => e !== event) : [...f.events, event],
    }));
  };

  const handleCreate = async () => {
    setFormError("");
    if (!form.name || !form.url) { setFormError("Name and URL are required"); return; }
    if (!form.url.startsWith("https://")) { setFormError("URL must start with https://"); return; }
    if (!form.events.length) { setFormError("Select at least one event"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      await fetchEndpoints();
      setShowModal(false);
      setForm({ name: "", url: "", secret: "", description: "", events: [] });
    } catch (e: any) {
      setFormError(e.message);
    }
    setSaving(false);
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch("/api/admin/webhooks/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ endpointId: id }),
      });
      const data = await res.json();
      toast(
        data.success
          ? `Test delivered! Response: ${data.responseStatus}`
          : `Test failed: ${data.error || "Unknown error"}`,
        data.success ? "success" : "error"
      );
      await fetchEndpoints();
    } catch { toast("Test failed — network error", "error"); }
    setTestingId(null);
  };

  const handleToggle = async (endpoint: Endpoint) => {
    setTogglingId(endpoint.id);
    try {
      await fetch("/api/admin/webhooks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: endpoint.id, isActive: !endpoint.isActive }),
      });
      await fetchEndpoints();
    } catch { /* ignore */ }
    setTogglingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this webhook endpoint?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/webhooks?id=${id}`, { method: "DELETE", credentials: "include" });
      await fetchEndpoints();
    } catch { /* ignore */ }
    setDeletingId(null);
  };

  const openLogs = async (endpoint: Endpoint) => {
    setDrawerLoading(true);
    setDrawer({ endpoint, deliveries: [] });
    try {
      const res = await fetch(`/api/admin/webhooks/${endpoint.id}/deliveries?limit=30`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDrawer({ endpoint, deliveries: data.deliveries || [] });
      }
    } catch { /* ignore */ }
    setDrawerLoading(false);
  };

  const handleRetryFailed = async () => {
    setRetrying(true);
    setRetryToast(null);
    try {
      const res = await fetch("/api/admin/webhooks/retry", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setRetryToast(`Retried ${data.retried} deliveries — ${data.succeeded} succeeded, ${data.failed} failed`);
        await fetchEndpoints();
      } else {
        setRetryToast("Retry failed: " + (data.error || "Unknown error"));
      }
    } catch {
      setRetryToast("Retry failed — network error");
    }
    setRetrying(false);
    setTimeout(() => setRetryToast(null), 5000);
  };

  const fmtTime = (d: string | null) => {
    if (!d) return "Never";
    return new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <AdminTopbar title="Webhooks" />
      <div className="p-6 space-y-5 max-w-[1200px]">

        {/* Retry toast */}
        {retryToast && (
          <div className="px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-600 dark:text-blue-400">
            {retryToast}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Send real-time event notifications to external services
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchEndpoints} className="p-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={handleRetryFailed}
              disabled={retrying}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:border-orange-400 hover:text-orange-500 transition-all disabled:opacity-50"
            >
              {retrying ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              Retry Failed
            </button>
            <button onClick={() => setShowModal(true)} className="btn-gold flex items-center gap-2">
              <Plus size={15} /> Add Endpoint
            </button>
          </div>
        </div>

        {/* Endpoints */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-[var(--color-gold)]" /></div>
        ) : endpoints.length === 0 ? (
          <div className="card p-12 text-center text-[var(--color-text-muted)]">
            <Webhook size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm mb-2">No webhook endpoints configured</p>
            <p className="text-xs">Add your first endpoint to receive real-time event notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {endpoints.map((ep, i) => (
              <motion.div key={ep.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Active indicator */}
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${ep.isActive ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" : "bg-gray-400"}`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[var(--color-text)]">{ep.name}</p>
                      <p className="text-xs font-mono text-[var(--color-text-muted)] truncate">{ep.url}</p>
                      {ep.description && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{ep.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleTest(ep.id)} disabled={testingId === ep.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-blue-400 hover:text-blue-500 transition-all disabled:opacity-50">
                      {testingId === ep.id ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />} Test
                    </button>
                    <button onClick={() => openLogs(ep)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all">
                      <Eye size={11} /> Logs
                    </button>
                    <button onClick={() => handleToggle(ep)} disabled={togglingId === ep.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 ${
                        ep.isActive
                          ? "border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          : "border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      }`}>
                      {togglingId === ep.id ? <Loader2 size={11} className="animate-spin inline" /> : ep.isActive ? "Disable" : "Enable"}
                    </button>
                    <button onClick={() => handleDelete(ep.id)} disabled={deletingId === ep.id}
                      className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-red-400 hover:text-red-500 transition-all">
                      {deletingId === ep.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  </div>
                </div>

                {/* Events + stats row */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {ep.events.map((ev) => (
                    <span key={ev} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--color-navy)]/10 text-[var(--color-navy)] dark:text-blue-300 border border-[var(--color-navy)]/20">
                      {ev}
                    </span>
                  ))}
                  <div className="ml-auto flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-green-500" /> {ep.stats.successCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle size={11} className="text-red-500" /> {ep.stats.failedCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {fmtTime(ep.stats.lastDelivery)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Endpoint Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="card w-full max-w-lg p-6 space-y-5 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-[var(--color-text)]">Add Webhook Endpoint</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-all">
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg flex items-center gap-2">
                  <AlertCircle size={14} /> {formError}
                </p>
              )}

              <div className="space-y-4">
                <div>
                  <label className={LABEL}>Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={INPUT} placeholder="My Webhook" />
                </div>
                <div>
                  <label className={LABEL}>URL * (https required)</label>
                  <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className={INPUT} placeholder="https://yourdomain.com/webhook" />
                </div>
                <div>
                  <label className={LABEL}>Secret (optional — for HMAC signature)</label>
                  <input value={form.secret} onChange={e => setForm(f => ({ ...f, secret: e.target.value }))} className={INPUT} placeholder="your-secret-key" type="password" />
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">If set, an X-KVL-Signature header will be included for verification</p>
                </div>
                <div>
                  <label className={LABEL}>Description</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={INPUT} placeholder="What this endpoint does..." />
                </div>

                <div>
                  <label className={LABEL}>Events * (select at least one)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_EVENTS.map((ev) => (
                      <label key={ev} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                        form.events.includes(ev) ? "border-[var(--color-gold)] bg-[var(--color-gold)]/5" : "border-[var(--color-border)] hover:border-[var(--color-gold)]/40"
                      }`}>
                        <input type="checkbox" className="sr-only" checked={form.events.includes(ev)} onChange={() => toggleEvent(ev)} />
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                          form.events.includes(ev) ? "bg-[var(--color-gold)] border-[var(--color-gold)]" : "border-[var(--color-border)]"
                        }`}>
                          {form.events.includes(ev) && <CheckCircle2 size={10} className="text-white" />}
                        </div>
                        <span className="text-xs font-mono text-[var(--color-text)]">{ev}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 btn-outline">Cancel</button>
                <button onClick={handleCreate} disabled={saving} className="flex-1 btn-gold flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {saving ? "Creating..." : "Add Endpoint"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delivery Logs Drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setDrawer(null)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-[var(--color-bg)] border-l border-[var(--color-border)] overflow-y-auto">
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-bold text-lg text-[var(--color-text)]">Delivery Logs</h2>
                    <p className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5 truncate max-w-[350px]">{drawer.endpoint.url}</p>
                  </div>
                  <button onClick={() => setDrawer(null)} className="p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-all">
                    <X size={18} />
                  </button>
                </div>

                {drawerLoading ? (
                  <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[var(--color-gold)]" /></div>
                ) : drawer.deliveries.length === 0 ? (
                  <div className="card p-8 text-center text-[var(--color-text-muted)] text-sm">No deliveries yet</div>
                ) : (
                  <div className="space-y-2">
                    {drawer.deliveries.map((delivery) => {
                      const cfg = STATUS_DELIVERY[delivery.status] || STATUS_DELIVERY.PENDING;
                      const Icon = cfg.icon;
                      const isExpanded = expandedPayload === delivery.id;
                      let parsedPayload = "";
                      try { parsedPayload = JSON.stringify(JSON.parse(delivery.payload), null, 2); } catch { parsedPayload = delivery.payload; }

                      return (
                        <div key={delivery.id} className="card overflow-hidden">
                          <div className="flex items-center gap-3 p-4">
                            <Icon size={15} style={{ color: cfg.color }} className="shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <code className="text-xs font-mono font-semibold text-[var(--color-text)]">{delivery.event}</code>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>
                                  {delivery.status}
                                </span>
                                {delivery.responseStatus && (
                                  <span className="text-[10px] font-mono text-[var(--color-text-muted)]">HTTP {delivery.responseStatus}</span>
                                )}
                              </div>
                              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                                {new Date(delivery.createdAt).toLocaleString("en-IN")} · {delivery.attempts} attempt{delivery.attempts !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <button onClick={() => setExpandedPayload(isExpanded ? null : delivery.id)}
                              className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors shrink-0">
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-2">
                              <div>
                                <p className="text-[10px] font-semibold text-[var(--color-text-muted)] mb-1">PAYLOAD</p>
                                <pre className="text-[10px] font-mono bg-[var(--color-bg-secondary)] rounded-lg p-3 overflow-x-auto text-[var(--color-text)] whitespace-pre-wrap max-h-40">
                                  {parsedPayload}
                                </pre>
                              </div>
                              {delivery.responseBody && (
                                <div>
                                  <p className="text-[10px] font-semibold text-[var(--color-text-muted)] mb-1">RESPONSE</p>
                                  <pre className="text-[10px] font-mono bg-[var(--color-bg-secondary)] rounded-lg p-3 overflow-x-auto text-[var(--color-text)] whitespace-pre-wrap max-h-24">
                                    {delivery.responseBody}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
