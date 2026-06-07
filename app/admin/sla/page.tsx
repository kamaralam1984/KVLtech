"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit2, Trash2, X, Loader2, Clock, AlertCircle,
  CheckCircle2, Shield, ToggleLeft, ToggleRight, ChevronDown,
  PlayCircle, Bell,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";
import { getTicketAge, getSLAStatus } from "@/lib/sla-utils";

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  LOW:    { label: "LOW",    color: "#6B7280", bg: "#6B728018" },
  MEDIUM: { label: "MEDIUM", color: "#F59E0B", bg: "#F59E0B18" },
  HIGH:   { label: "HIGH",   color: "#EF4444", bg: "#EF444418" },
  URGENT: { label: "URGENT", color: "#7C3AED", bg: "#7C3AED18" },
};

const SLA_STATUS_COLORS = {
  ok:      { dot: "#16A34A", label: "Within SLA" },
  warning: { dot: "#F59E0B", label: ">80% time used" },
  breached:{ dot: "#EF4444", label: "SLA Breached" },
};

function fmtMins(mins: number | null | undefined) {
  if (!mins) return "—";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h} hour${h !== 1 ? "s" : ""}`;
}

function minsToHours(mins: number | null | undefined) {
  if (!mins) return "";
  return String(mins / 60);
}

function hoursToMins(h: string) {
  return Math.round(parseFloat(h) * 60);
}

const EMPTY_FORM = { name: "", priority: "MEDIUM", firstResponseHours: "2", resolutionHours: "8", escalationHours: "" };
const EMPTY_ESC_FORM = { slaId: "", escalateAfterMinutes: "60", notifyEmail: "", message: "" };

interface ToastMsg { type: "success" | "error"; text: string }

function Toast({ msg, onDismiss }: { msg: ToastMsg; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
      className="fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl text-sm font-semibold text-white flex items-center gap-2"
      style={{ background: msg.type === "success" ? "#16A34A" : "#EF4444" }}>
      {msg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {msg.text}
    </motion.div>
  );
}

export default function SLAPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [slaLogs, setSlaLogs] = useState<any[]>([]);

  // Escalation Rules state
  const [rules, setRules] = useState<any[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [showEscModal, setShowEscModal] = useState(false);
  const [editRuleTarget, setEditRuleTarget] = useState<any>(null);
  const [escForm, setEscForm] = useState(EMPTY_ESC_FORM);
  const [savingRule, setSavingRule] = useState(false);
  const [deletingRule, setDeletingRule] = useState<string | null>(null);

  // Run SLA check state
  const [checkingBreaches, setCheckingBreaches] = useState(false);
  const [toast, setToast] = useState<ToastMsg | null>(null);

  // Timer tick for live age display
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sla", { credentials: "include" });
      if (res.ok) { const d = await res.json(); setPolicies(d.policies || []); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  const fetchTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const res = await fetch("/api/admin/support?status=OPEN", { credentials: "include" });
      if (res.ok) { const d = await res.json(); setTickets(d.tickets || []); }
    } catch (e) { console.error(e); }
    setTicketsLoading(false);
  }, []);

  const fetchRules = useCallback(async () => {
    setRulesLoading(true);
    try {
      const res = await fetch("/api/admin/sla/escalation", { credentials: "include" });
      if (res.ok) { const d = await res.json(); setRules(d.rules || []); }
    } catch (e) { console.error(e); }
    setRulesLoading(false);
  }, []);

  useEffect(() => { fetchPolicies(); fetchTickets(); fetchRules(); }, [fetchPolicies, fetchTickets, fetchRules]);

  const openAdd = () => { setEditTarget(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (p: any) => {
    setEditTarget(p);
    setForm({
      name: p.name,
      priority: p.priority,
      firstResponseHours: minsToHours(p.firstResponseMinutes),
      resolutionHours: minsToHours(p.resolutionMinutes),
      escalationHours: p.escalationMinutes ? minsToHours(p.escalationMinutes) : "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.firstResponseHours || !form.resolutionHours) return;
    setSaving(true);
    try {
      const body = {
        ...(editTarget ? { id: editTarget.id } : {}),
        name: form.name,
        priority: form.priority,
        firstResponseMinutes: hoursToMins(form.firstResponseHours),
        resolutionMinutes: hoursToMins(form.resolutionHours),
        escalationMinutes: form.escalationHours ? hoursToMins(form.escalationHours) : null,
      };
      const res = await fetch("/api/admin/sla", {
        method: editTarget ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (res.ok) { setShowModal(false); fetchPolicies(); }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const toggleActive = async (p: any) => {
    await fetch("/api/admin/sla", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
    });
    fetchPolicies();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this SLA policy?")) return;
    setDeleting(id);
    await fetch(`/api/admin/sla?id=${id}`, { method: "DELETE", credentials: "include" });
    setDeleting(null);
    fetchPolicies();
  };

  // Escalation rule handlers
  const openAddRule = () => { setEditRuleTarget(null); setEscForm(EMPTY_ESC_FORM); setShowEscModal(true); };
  const openEditRule = (r: any) => {
    setEditRuleTarget(r);
    setEscForm({
      slaId: r.slaId,
      escalateAfterMinutes: String(r.escalateAfterMinutes),
      notifyEmail: r.notifyEmail || "",
      message: r.message || "",
    });
    setShowEscModal(true);
  };

  const handleSaveRule = async () => {
    if (!escForm.slaId || !escForm.escalateAfterMinutes) return;
    setSavingRule(true);
    try {
      const body = {
        ...(editRuleTarget ? { id: editRuleTarget.id } : {}),
        slaId: escForm.slaId,
        escalateAfterMinutes: Number(escForm.escalateAfterMinutes),
        notifyAdminIds: [],
        notifyEmail: escForm.notifyEmail || null,
        message: escForm.message || null,
      };
      const res = await fetch("/api/admin/sla/escalation", {
        method: editRuleTarget ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (res.ok) { setShowEscModal(false); fetchRules(); }
    } catch (e) { console.error(e); }
    setSavingRule(false);
  };

  const toggleRuleActive = async (r: any) => {
    await fetch("/api/admin/sla/escalation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: r.id, isActive: !r.isActive }),
    });
    fetchRules();
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Delete this escalation rule?")) return;
    setDeletingRule(id);
    await fetch(`/api/admin/sla/escalation?id=${id}`, { method: "DELETE", credentials: "include" });
    setDeletingRule(null);
    fetchRules();
  };

  // Run SLA breach check
  const runSLACheck = async () => {
    setCheckingBreaches(true);
    try {
      const res = await fetch("/api/admin/sla/check", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setToast({ type: "success", text: `Checked ${data.checked} tickets. ${data.breached} breached, ${data.escalated} escalated.` });
        fetchTickets();
      } else {
        setToast({ type: "error", text: "SLA check failed." });
      }
    } catch (e) {
      console.error(e);
      setToast({ type: "error", text: "SLA check failed." });
    }
    setCheckingBreaches(false);
  };

  // Compute stats — tick dependency forces recompute every minute
  const now = Date.now() + tick * 0;
  const overdueTickets = tickets.filter((t) => {
    const ageMs = now - new Date(t.createdAt).getTime();
    return ageMs / (1000 * 60 * 60) > 24;
  });
  const avgAge = tickets.length
    ? tickets.reduce((acc, t) => acc + (now - new Date(t.createdAt).getTime()), 0) / tickets.length / (1000 * 60 * 60)
    : 0;

  const breachRate = slaLogs.length
    ? Math.round((slaLogs.filter((l) => l.resolutionBreached || l.firstResponseBreached).length / slaLogs.length) * 100)
    : 0;

  // Build policyMap for overdue tickets status lookup
  const policyMap = new Map(policies.map((p) => [p.priority, p]));

  return (
    <>
      <AdminTopbar title="SLA Policies" />
      <div className="p-6 space-y-6 max-w-[1200px]">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">Manage service-level agreements for support tickets</p>
          </div>
          <button onClick={openAdd}
            className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold">
            <Plus size={16} /> Add Policy
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Breach Rate", value: `${breachRate}%`, icon: AlertCircle, color: "#EF4444", sub: "This month" },
            { label: "Avg First Response", value: `${avgAge.toFixed(1)}h`, icon: Clock, color: "#0891B2", sub: "All open tickets" },
            { label: "Avg Resolution", value: "—", icon: CheckCircle2, color: "#16A34A", sub: "No logs yet" },
            { label: "Overdue Tickets", value: String(overdueTickets.length), icon: Shield, color: "#F59E0B", sub: ">24h old" },
          ].map(({ label, value, icon: Icon, color, sub }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <p className="font-display font-bold text-xl text-[var(--color-text)]">{value}</p>
                <p className="text-[11px] font-semibold text-[var(--color-text-secondary)]">{label}</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Run SLA Check button row */}
        <div className="flex items-center justify-end">
          <button
            onClick={runSLACheck}
            disabled={checkingBreaches}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all disabled:opacity-50">
            {checkingBreaches
              ? <Loader2 size={15} className="animate-spin" />
              : <PlayCircle size={15} />}
            {checkingBreaches ? "Checking..." : "Check SLA Breaches"}
          </button>
        </div>

        {/* Policies Table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-[var(--color-text)]">SLA Policies</h2>
          </div>
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-[var(--color-gold)]" />
            </div>
          ) : policies.length === 0 ? (
            <div className="py-16 text-center text-sm text-[var(--color-text-muted)]">
              No SLA policies yet. Add one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                  <tr>
                    {["Name", "Priority", "First Response", "Resolution", "Escalation", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {policies.map((p, i) => {
                    const pc = PRIORITY_CONFIG[p.priority] || PRIORITY_CONFIG.MEDIUM;
                    return (
                      <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="text-sm font-semibold text-[var(--color-text)]">{p.name}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: pc.color, background: pc.bg }}>
                            {pc.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-sm text-[var(--color-text)]">{fmtMins(p.firstResponseMinutes)}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-sm text-[var(--color-text)]">{fmtMins(p.resolutionMinutes)}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-sm text-[var(--color-text-muted)]">{fmtMins(p.escalationMinutes)}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button onClick={() => toggleActive(p)}
                            className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                            style={{ color: p.isActive ? "#16A34A" : "#9CA3AF" }}>
                            {p.isActive
                              ? <ToggleRight size={20} className="text-[#16A34A]" />
                              : <ToggleLeft size={20} className="text-[#9CA3AF]" />}
                            {p.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(p)}
                              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-all">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all">
                              {deleting === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Escalation Rules */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-base text-[var(--color-text)]">Escalation Rules</h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Auto-escalate tickets that exceed SLA thresholds</p>
            </div>
            <button onClick={openAddRule}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all">
              <Plus size={14} /> Add Rule
            </button>
          </div>
          {rulesLoading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-[var(--color-gold)]" />
            </div>
          ) : rules.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--color-text-muted)]">
              No escalation rules. Add one to auto-notify on breaches.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                  <tr>
                    {["SLA Policy", "Escalate After", "Notify Email", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r, i) => (
                    <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="text-sm font-semibold text-[var(--color-text)]">{r.slaPolicy?.name || "—"}</p>
                        {r.slaPolicy?.priority && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 inline-block"
                            style={{ color: PRIORITY_CONFIG[r.slaPolicy.priority]?.color, background: PRIORITY_CONFIG[r.slaPolicy.priority]?.bg }}>
                            {r.slaPolicy.priority}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm text-[var(--color-text)] font-semibold">{fmtMins(r.escalateAfterMinutes)}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {r.notifyEmail ? (
                          <span className="text-xs text-[var(--color-text)]">{r.notifyEmail}</span>
                        ) : (
                          <span className="text-xs text-[var(--color-text-muted)]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <button onClick={() => toggleRuleActive(r)}
                          className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                          style={{ color: r.isActive ? "#16A34A" : "#9CA3AF" }}>
                          {r.isActive
                            ? <ToggleRight size={20} className="text-[#16A34A]" />
                            : <ToggleLeft size={20} className="text-[#9CA3AF]" />}
                          {r.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditRule(r)}
                            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-all">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteRule(r.id)} disabled={deletingRule === r.id}
                            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all">
                            {deletingRule === r.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Overdue Tickets */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)]">
            <h2 className="font-display font-bold text-base text-[var(--color-text)]">
              Overdue Tickets
              {overdueTickets.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-semibold">{overdueTickets.length}</span>
              )}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Open tickets older than 24 hours</p>
          </div>
          {ticketsLoading ? (
            <div className="py-10 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-[var(--color-gold)]" />
            </div>
          ) : overdueTickets.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--color-text-muted)]">No overdue tickets. Great job!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                  <tr>
                    {["Ticket #", "Subject", "Client", "Age", "Priority", "SLA Status"].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {overdueTickets.map((t) => {
                    const age = getTicketAge(new Date(t.createdAt));
                    const policy = policyMap.get(t.priority) || null;
                    const slaStatus = getSLAStatus(
                      new Date(t.createdAt),
                      policy,
                      t.slaLog?.firstResponseAt ? new Date(t.slaLog.firstResponseAt) : null,
                    );
                    const statusCfg = SLA_STATUS_COLORS[slaStatus];
                    const pc = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.MEDIUM;
                    return (
                      <tr key={t.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)]">{t.ticketNo}</span>
                        </td>
                        <td className="py-3.5 px-4 max-w-[220px]">
                          <p className="text-sm text-[var(--color-text)] truncate">{t.subject}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-sm font-semibold text-[var(--color-text)]">{t.client?.name}</p>
                          <p className="text-[11px] text-[var(--color-text-muted)]">{t.client?.email}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-sm font-bold text-red-500">{age.display}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: pc.color, background: pc.bg }}>
                            {pc.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5" title={`SLA: ${statusCfg.label}${policy ? ` | Policy: ${fmtMins(policy.resolutionMinutes)}` : ""}`}>
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: statusCfg.dot }} />
                            <span className="text-xs font-semibold" style={{ color: statusCfg.dot }}>{statusCfg.label}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Policy Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-[var(--color-bg)] rounded-2xl w-full max-w-md shadow-[var(--shadow-luxury)] overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                <h3 className="font-display font-bold text-base text-[var(--color-text)]">
                  {editTarget ? "Edit SLA Policy" : "Add SLA Policy"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Policy Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Standard SLA"
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Priority Level</label>
                  <div className="relative">
                    <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all appearance-none">
                      {Object.entries(PRIORITY_CONFIG).map(([val, { label }]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">First Response (hours)</label>
                    <input type="number" min="0.25" step="0.25" value={form.firstResponseHours}
                      onChange={e => setForm(f => ({ ...f, firstResponseHours: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Resolution (hours)</label>
                    <input type="number" min="1" step="0.5" value={form.resolutionHours}
                      onChange={e => setForm(f => ({ ...f, resolutionHours: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Escalation (hours, optional)</label>
                  <input type="number" min="0" step="0.5" value={form.escalationHours}
                    onChange={e => setForm(f => ({ ...f, escalationHours: e.target.value }))}
                    placeholder="Leave blank to skip"
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all placeholder:text-[var(--color-text-muted)]" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving || !form.name}
                    className="flex-1 btn-gold py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                    {editTarget ? "Save Changes" : "Create Policy"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Escalation Rule Modal */}
      <AnimatePresence>
        {showEscModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEscModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-[var(--color-bg)] rounded-2xl w-full max-w-md shadow-[var(--shadow-luxury)] overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-[var(--color-gold)]" />
                  <h3 className="font-display font-bold text-base text-[var(--color-text)]">
                    {editRuleTarget ? "Edit Escalation Rule" : "Add Escalation Rule"}
                  </h3>
                </div>
                <button onClick={() => setShowEscModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">SLA Policy</label>
                  <div className="relative">
                    <select value={escForm.slaId} onChange={e => setEscForm(f => ({ ...f, slaId: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all appearance-none">
                      <option value="">Select policy...</option>
                      {policies.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.priority})</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Escalate After (minutes)</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min="1" step="1" value={escForm.escalateAfterMinutes}
                      onChange={e => setEscForm(f => ({ ...f, escalateAfterMinutes: e.target.value }))}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                    <span className="text-sm text-[var(--color-text-muted)] shrink-0">minutes</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Notify Email (optional)</label>
                  <input type="email" value={escForm.notifyEmail}
                    onChange={e => setEscForm(f => ({ ...f, notifyEmail: e.target.value }))}
                    placeholder="e.g. manager@company.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all placeholder:text-[var(--color-text-muted)]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Custom Message (optional)</label>
                  <textarea value={escForm.message} onChange={e => setEscForm(f => ({ ...f, message: e.target.value }))}
                    rows={3} placeholder="Custom escalation message..."
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all resize-none placeholder:text-[var(--color-text-muted)]" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowEscModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSaveRule} disabled={savingRule || !escForm.slaId || !escForm.escalateAfterMinutes}
                    className="flex-1 btn-gold py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                    {savingRule ? <Loader2 size={14} className="animate-spin" /> : null}
                    {editRuleTarget ? "Save Changes" : "Create Rule"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast} onDismiss={() => setToast(null)} />}
      </AnimatePresence>
    </>
  );
}
