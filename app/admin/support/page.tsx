"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, RefreshCw, X, Send, Loader2,
  ChevronDown, MessageCircle, Clock, CheckCircle2, AlertCircle, Sparkles,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  OPEN:        { label: "Open",        color: "#C9A227", bg: "#C9A22715" },
  IN_PROGRESS: { label: "In Progress", color: "#0891B2", bg: "#0891B215" },
  RESOLVED:    { label: "Resolved",    color: "#16A34A", bg: "#16A34A15" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  LOW:    { label: "Low",    color: "#6B7280", bg: "#6B728015" },
  MEDIUM: { label: "Medium", color: "#F59E0B", bg: "#F59E0B15" },
  HIGH:   { label: "High",   color: "#EF4444", bg: "#EF444415" },
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/support?${params}`, { credentials: "include" });
      if (res.ok) { const data = await res.json(); setTickets(data.tickets || []); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const openTicket = (t: any) => { setSelected(t); setNewStatus(t.status); setReplyText(""); };

  const suggestReply = async () => {
    if (!selected) return;
    setSuggesting(true);
    try {
      const res = await fetch("/api/admin/support/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          subject: selected.subject,
          clientName: selected.client?.name,
          originalMessage: selected.message,
          replies: selected.replies,
          priority: selected.priority,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setReplyText(data.suggestion);
      }
    } catch (e) { console.error(e); }
    setSuggesting(false);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: selected.id, status: newStatus !== selected.status ? newStatus : undefined, reply: replyText || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(prev => prev.map(t => t.id === selected.id ? data.ticket : t));
        setSelected(data.ticket);
        setReplyText("");
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const counts = {
    OPEN: tickets.filter(t => t.status === "OPEN").length,
    IN_PROGRESS: tickets.filter(t => t.status === "IN_PROGRESS").length,
    RESOLVED: tickets.filter(t => t.status === "RESOLVED").length,
  };

  return (
    <>
      <AdminTopbar title="Support Tickets" />
      <div className="p-6 space-y-5 max-w-[1400px]">

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: "OPEN", label: "Open", icon: AlertCircle, color: "#C9A227" },
            { key: "IN_PROGRESS", label: "In Progress", icon: Clock, color: "#0891B2" },
            { key: "RESOLVED", label: "Resolved", icon: CheckCircle2, color: "#16A34A" },
          ].map(({ key, label, icon: Icon, color }) => (
            <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
              className="card p-4 flex items-center gap-4 cursor-pointer hover:shadow-[var(--shadow-card)] transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <p className="font-display font-bold text-2xl text-[var(--color-text)]">{counts[key as keyof typeof counts]}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchTickets()}
              placeholder="Ticket ID, client, subject..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-[var(--color-text-muted)]" />
            {["all", "OPEN", "IN_PROGRESS", "RESOLVED"].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === f ? "bg-[var(--color-navy)] text-white" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]"}`}>
                {f === "all" ? "All" : STATUS_CONFIG[f]?.label}
              </button>
            ))}
          </div>
          <button onClick={fetchTickets}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all ml-auto">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                <tr>
                  {["Ticket ID", "Client", "Subject", "Order", "Priority", "Status", "Replies", "Date", "Action"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="py-16 text-center"><Loader2 size={24} className="animate-spin text-[var(--color-gold)] mx-auto" /></td></tr>
                ) : tickets.length === 0 ? (
                  <tr><td colSpan={9} className="py-16 text-center text-sm text-[var(--color-text-muted)]">No tickets found</td></tr>
                ) : tickets.map((ticket, i) => {
                  const sc = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
                  const pc = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.MEDIUM;
                  return (
                    <motion.tr key={ticket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)]">{ticket.ticketNo}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-sm font-semibold text-[var(--color-text)]">{ticket.client?.name}</p>
                        <p className="text-[11px] text-[var(--color-text-muted)]">{ticket.client?.email}</p>
                      </td>
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <p className="text-sm text-[var(--color-text)] truncate">{ticket.subject}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        {ticket.order ? (
                          <span className="text-xs font-mono text-[var(--color-text-secondary)]">{ticket.order.orderNumber}</span>
                        ) : (
                          <span className="text-xs text-[var(--color-text-muted)]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: pc.color, background: pc.bg }}>{pc.label}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                          <MessageCircle size={13} />
                          <span>{ticket.replies?.length || 0}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {new Date(ticket.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button onClick={() => openTicket(ticket)}
                          className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors">
                          <MessageCircle size={14} /> View
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ticket detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-[var(--color-bg)] rounded-2xl w-full max-w-lg shadow-[var(--shadow-luxury)] overflow-hidden max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-start justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)]">{selected.ticketNo}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: PRIORITY_CONFIG[selected.priority]?.color, background: PRIORITY_CONFIG[selected.priority]?.bg }}>
                      {PRIORITY_CONFIG[selected.priority]?.label}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-[var(--color-text)]">{selected.subject}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{selected.client?.name} · {selected.order?.orderNumber || "No order linked"}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors shrink-0 ml-4">
                  <X size={20} />
                </button>
              </div>

              {/* Conversation */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Original message */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[var(--color-navy)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {selected.client?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-[var(--color-text)]">{selected.client?.name}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text)]">
                      {selected.message}
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {selected.replies?.map((r: any) => (
                  <div key={r.id} className={`flex gap-3 ${r.authorType === "admin" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${r.authorType === "admin" ? "bg-[var(--color-gold)]" : "bg-[var(--color-navy)]"}`}>
                      {r.authorType === "admin" ? "A" : selected.client?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className={`flex items-center gap-2 mb-1 ${r.authorType === "admin" ? "justify-end" : ""}`}>
                        <span className="text-xs font-semibold text-[var(--color-text)]">{r.authorType === "admin" ? "KVL TECH" : selected.client?.name}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className={`p-3 rounded-xl text-sm text-[var(--color-text)] ${r.authorType === "admin" ? "bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20" : "bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"}`}>
                        {r.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply + status update */}
              <div className="p-4 border-t border-[var(--color-border)] space-y-3 shrink-0">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] shrink-0">Status:</label>
                  <div className="relative flex-1">
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all appearance-none">
                      {Object.entries(STATUS_CONFIG).map(([v, { label }]) => (
                        <option key={v} value={v}>{label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Reply</span>
                    <button onClick={suggestReply} disabled={suggesting}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-purple-300/50 text-purple-500 hover:bg-purple-500/10 transition-all disabled:opacity-50">
                      {suggesting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {suggesting ? "Generating..." : "Suggest with AI"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                      rows={3} placeholder="Reply likhein ya AI se suggest karwao..."
                      className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all resize-none placeholder:text-[var(--color-text-muted)]" />
                    <button onClick={handleSave} disabled={saving || (!replyText.trim() && newStatus === selected.status)}
                      className="btn-gold px-4 flex items-center gap-2 self-end disabled:opacity-50">
                      {saving ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                      {saving ? "..." : "Send"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
