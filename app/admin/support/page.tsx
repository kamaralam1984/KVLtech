"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, RefreshCw, X, Send, Loader2, Download,
  ChevronDown, ChevronUp, MessageCircle, Clock, CheckCircle2, AlertCircle, Sparkles,
  Brain, CheckCheck, Tag, AlertTriangle, Zap, BarChart2, Link as LinkIcon,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { AdminTopbar } from "@/components/admin/AdminSidebar";
import { getTicketAge, getSLAStatus } from "@/lib/sla-utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  OPEN:        { label: "Open",        color: "#C9A227", bg: "#C9A22715" },
  IN_PROGRESS: { label: "In Progress", color: "#0891B2", bg: "#0891B215" },
  RESOLVED:    { label: "Resolved",    color: "#16A34A", bg: "#16A34A15" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; firstResponseMinutes: number; resolutionMinutes: number }> = {
  LOW:    { label: "Low",    color: "#6B7280", bg: "#6B728015", firstResponseMinutes: 480,  resolutionMinutes: 2880 },
  MEDIUM: { label: "Medium", color: "#F59E0B", bg: "#F59E0B15", firstResponseMinutes: 240,  resolutionMinutes: 1440 },
  HIGH:   { label: "High",   color: "#EF4444", bg: "#EF444415", firstResponseMinutes: 60,   resolutionMinutes: 480  },
  URGENT: { label: "Urgent", color: "#DC2626", bg: "#DC262615", firstResponseMinutes: 30,   resolutionMinutes: 240  },
};

const SENTIMENT_CONFIG: Record<string, { color: string; bg: string }> = {
  POSITIVE: { color: "#16A34A", bg: "#16A34A15" },
  NEUTRAL:  { color: "#6B7280", bg: "#6B728015" },
  NEGATIVE: { color: "#EF4444", bg: "#EF444415" },
  URGENT:   { color: "#DC2626", bg: "#DC262615" },
};

const CATEGORY_COLORS: Record<string, string> = {
  BILLING: "#C9A227",
  TECHNICAL: "#0891B2",
  GENERAL: "#6B7280",
  COMPLAINT: "#EF4444",
  FEATURE_REQUEST: "#7C3AED",
};

const SLA_DOT: Record<"ok" | "warning" | "breached", { color: string; label: string }> = {
  ok:      { color: "#16A34A", label: "Within SLA" },
  warning: { color: "#F59E0B", label: ">80% used" },
  breached:{ color: "#EF4444", label: "Breached" },
};

interface AIAnalysis {
  category: string;
  sentiment: string;
  suggestedPriority: string;
  autoResponse: string;
  similarTicketIds: string[];
  tags: string[];
  escalationRequired: boolean;
}

interface InsightsData {
  categoryBreakdown: Record<string, number>;
  avgResolutionTime: number;
  sentimentTrend: { last7DaysPct: number; prev7DaysPct: number; trend: string };
  highPriorityOpen: number;
  openTickets: number;
  topIssueKeywords: { word: string; count: number }[];
  needsAttention: any[];
}

/** Live SLA indicator */
function SLAIndicator({ ticket, tick }: { ticket: any; tick: number }) {
  const policy = PRIORITY_CONFIG[ticket.priority] || null;
  const firstResponseAt = ticket.slaLog?.firstResponseAt ? new Date(ticket.slaLog.firstResponseAt) : null;
  const age = getTicketAge(new Date(ticket.createdAt));
  const status = getSLAStatus(new Date(ticket.createdAt), policy, firstResponseAt);
  const dotCfg = SLA_DOT[status];
  const policyLabel = policy ? `${Math.floor(policy.resolutionMinutes / 60)}h` : "No policy";

  return (
    <div className="flex items-center gap-1" title={`SLA: ${age.display} / Policy: ${policyLabel} | ${dotCfg.label}`}>
      <span className="w-2 h-2 rounded-full shrink-0 transition-colors" style={{ background: dotCfg.color }} />
      <span className="text-[11px] font-mono text-[var(--color-text-muted)]">{age.display}</span>
    </div>
  );
}

/** AI Insights Panel */
function InsightsPanel() {
  const [open, setOpen] = useState(true);
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

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-gold)]/15 flex items-center justify-center">
            <Brain size={15} className="text-[var(--color-gold)]" />
          </div>
          <span className="font-display font-bold text-sm text-[var(--color-text)]">AI Support Insights</span>
          <span className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] px-2 py-0.5 rounded-full">last 30 days</span>
        </div>
        {open ? <ChevronUp size={16} className="text-[var(--color-text-muted)]" /> : <ChevronDown size={16} className="text-[var(--color-text-muted)]" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-[var(--color-gold)]" />
              </div>
            ) : data ? (
              <div className="p-5 space-y-5">
                {/* 4 metric cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                    <p className="text-[10px] text-[var(--color-text-muted)] mb-1">Open Tickets</p>
                    <p className="font-display font-bold text-xl text-[var(--color-gold)]">{data.openTickets}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                    <p className="text-[10px] text-[var(--color-text-muted)] mb-1">Avg Resolution</p>
                    <p className="font-display font-bold text-xl text-[var(--color-text)]">{data.avgResolutionTime}h</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                    <p className="text-[10px] text-[var(--color-text-muted)] mb-1">High Priority Open</p>
                    <p className="font-display font-bold text-xl text-red-500">{data.highPriorityOpen}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                    <p className="text-[10px] text-[var(--color-text-muted)] mb-2">Category Breakdown</p>
                    {totalCategories > 0 ? (
                      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                        {Object.entries(data.categoryBreakdown)
                          .filter(([, v]) => v > 0)
                          .map(([cat, count]) => (
                            <div
                              key={cat}
                              title={`${cat}: ${count}`}
                              className="rounded-full transition-all"
                              style={{
                                width: `${(count / totalCategories) * 100}%`,
                                background: CATEGORY_COLORS[cat] || "#9CA3AF",
                              }}
                            />
                          ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--color-text-muted)]">No data</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {Object.entries(data.categoryBreakdown)
                        .filter(([, v]) => v > 0)
                        .map(([cat, count]) => (
                          <span key={cat} className="text-[9px] font-semibold" style={{ color: CATEGORY_COLORS[cat] || "#9CA3AF" }}>
                            {cat.split("_")[0]} {count}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Top keywords word cloud */}
                {data.topIssueKeywords.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Top Issue Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {data.topIssueKeywords.map(({ word, count }, i) => {
                        const maxCount = data.topIssueKeywords[0].count;
                        const ratio = count / maxCount;
                        const size = ratio > 0.7 ? "text-sm font-bold" : ratio > 0.4 ? "text-xs font-semibold" : "text-[11px]";
                        return (
                          <span
                            key={word}
                            className={`px-2.5 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] ${size}`}
                          >
                            {word}
                            <span className="ml-1 text-[var(--color-text-muted)] text-[9px]">{count}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-6">Unable to load insights</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

  // Per-ticket AI classification (legacy inline flow)
  const [aiResults, setAiResults] = useState<Record<string, any>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [applyingAI, setApplyingAI] = useState<Record<string, boolean>>({});

  // Modal AI Tools state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiDraft, setAiDraft] = useState("");
  const [aiDrafting, setAiDrafting] = useState(false);
  const [applyingAnalysis, setApplyingAnalysis] = useState(false);

  // Tick counter for live SLA timer (every 60s)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(interval);
  }, []);

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

  const openTicket = (t: any) => {
    setSelected(t);
    setNewStatus(t.status);
    setReplyText("");
    setAiAnalysis(null);
    setAiDraft("");
  };

  // Legacy inline AI classify (table row)
  const classifyWithAI = async (ticketId: string) => {
    setAiLoading(prev => ({ ...prev, [ticketId]: true }));
    try {
      const res = await fetch("/api/admin/support/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ticketId, action: "analyze" }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResults(prev => ({ ...prev, [ticketId]: { priority: data.suggestedPriority, category: data.category, hint: data.autoResponse } }));
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, _aiPriority: data.suggestedPriority } : t));
      }
    } catch (e) { console.error(e); }
    setAiLoading(prev => ({ ...prev, [ticketId]: false }));
  };

  const applyAIPriority = async (ticketId: string, priority: string) => {
    setApplyingAI(prev => ({ ...prev, [ticketId]: true }));
    try {
      await fetch("/api/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: ticketId, priority }),
      });
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, priority, _aiPriority: undefined } : t));
      setAiResults(prev => { const next = { ...prev }; delete next[ticketId]; return next; });
    } catch (e) { console.error(e); }
    setApplyingAI(prev => ({ ...prev, [ticketId]: false }));
  };

  // Modal AI: analyze ticket
  const analyzeWithAI = async () => {
    if (!selected) return;
    setAiAnalyzing(true);
    setAiAnalysis(null);
    try {
      const res = await fetch("/api/admin/support/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ticketId: selected.id, action: "analyze" }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
      }
    } catch (e) { console.error(e); }
    setAiAnalyzing(false);
  };

  // Modal AI: draft response
  const draftResponse = async () => {
    if (!selected) return;
    setAiDrafting(true);
    try {
      const res = await fetch("/api/admin/support/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ticketId: selected.id, action: "generate-response" }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiDraft(data.response || "");
      }
    } catch (e) { console.error(e); }
    setAiDrafting(false);
  };

  // Apply AI suggestions (priority + category)
  const applyAnalysisSuggestions = async () => {
    if (!selected || !aiAnalysis) return;
    setApplyingAnalysis(true);
    try {
      await fetch("/api/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: selected.id, priority: aiAnalysis.suggestedPriority }),
      });
      setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, priority: aiAnalysis.suggestedPriority } : t));
      setSelected((prev: any) => prev ? { ...prev, priority: aiAnalysis.suggestedPriority } : prev);
    } catch (e) { console.error(e); }
    setApplyingAnalysis(false);
  };

  // Legacy suggest reply
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

        {/* AI Insights Panel */}
        <InsightsPanel />

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
            <input
              id="support-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchTickets()}
              placeholder="Ticket ID, client, subject..."
              aria-label="Search tickets"
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
          <div className="ml-auto flex items-center gap-2">
            <button onClick={fetchTickets}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <a href="/api/admin/export?type=tickets&format=csv" download
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all">
              <Download size={13} /> Export CSV
            </a>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden" aria-live="polite" aria-atomic="false">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                <tr>
                  {["Ticket ID", "Client", "Subject", "Order", "Priority", "Status", "SLA", "Replies", "Date", "AI", "Action"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} className="py-16 text-center"><Loader2 size={24} className="animate-spin text-[var(--color-gold)] mx-auto" /></td></tr>
                ) : tickets.length === 0 ? (
                  <tr><td colSpan={11} className="py-16 text-center text-sm text-[var(--color-text-muted)]">No tickets found</td></tr>
                ) : tickets.map((ticket, i) => {
                  const sc = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
                  const pc = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.MEDIUM;
                  const aiResult = aiResults[ticket.id];
                  const isAiLoading = aiLoading[ticket.id];
                  const isApplying = applyingAI[ticket.id];
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
                        {aiResult?.hint && (
                          <p className="text-[10px] text-orange-500 mt-0.5 truncate" title={aiResult.hint}>AI: {aiResult.hint}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {ticket.order ? (
                          <span className="text-xs font-mono text-[var(--color-text-secondary)]">{ticket.order.orderNumber}</span>
                        ) : (
                          <span className="text-xs text-[var(--color-text-muted)]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: pc.color, background: pc.bg }}>{pc.label}</span>
                          {aiResult && aiResult.priority !== ticket.priority && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border" style={{ color: "#F97316", borderColor: "#F97316", background: "#F9731610" }}>
                                AI: {aiResult.priority}
                              </span>
                              <button onClick={() => applyAIPriority(ticket.id, aiResult.priority)} disabled={isApplying}
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F97316] text-white hover:bg-[#ea6a0a] transition-colors disabled:opacity-50">
                                {isApplying ? "..." : "Apply"}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" ? (
                          <SLAIndicator ticket={ticket} tick={tick} />
                        ) : (
                          <span className="text-[11px] text-[var(--color-text-muted)]">—</span>
                        )}
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
                        {aiResult ? (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-500">
                            <CheckCheck size={12} /> {aiResult.category}
                          </span>
                        ) : (
                          <button onClick={() => classifyWithAI(ticket.id)} disabled={isAiLoading}
                            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border border-purple-300/50 text-purple-500 hover:bg-purple-500/10 transition-all disabled:opacity-50 whitespace-nowrap">
                            {isAiLoading ? <Loader2 size={11} className="animate-spin" /> : <Brain size={11} />}
                            {isAiLoading ? "..." : "AI Classify"}
                          </button>
                        )}
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
            onClick={() => setSelected(null)}
            aria-hidden="true">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-[var(--color-bg)] rounded-2xl w-full max-w-2xl shadow-[var(--shadow-luxury)] overflow-hidden max-h-[90vh] flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label={`Ticket: ${selected?.subject}`}
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
                    {selected.status !== "RESOLVED" && selected.status !== "CLOSED" && (
                      <SLAIndicator ticket={selected} tick={tick} />
                    )}
                  </div>
                  <h3 className="font-display font-bold text-base text-[var(--color-text)]">{selected.subject}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{selected.client?.name} · {selected.order?.orderNumber || "No order linked"}</p>
                </div>
                <button onClick={() => setSelected(null)} aria-label="Close ticket" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors shrink-0 ml-4">
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto">

                {/* Conversation */}
                <div className="p-6 space-y-4">
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

                {/* AI Tools section */}
                <div className="mx-6 mb-4 border border-purple-300/30 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-purple-500/5 border-b border-purple-300/20">
                    <Brain size={14} className="text-purple-500" />
                    <span className="text-xs font-bold text-purple-500 uppercase tracking-wide">AI Tools</span>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Analyze + Draft buttons row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={analyzeWithAI}
                        disabled={aiAnalyzing}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-purple-300/50 text-purple-600 hover:bg-purple-500/10 transition-all disabled:opacity-50"
                      >
                        {aiAnalyzing ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                        {aiAnalyzing ? "Analyzing..." : "Analyze with AI"}
                      </button>
                      <button
                        onClick={draftResponse}
                        disabled={aiDrafting}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-blue-300/50 text-blue-600 hover:bg-blue-500/10 transition-all disabled:opacity-50"
                      >
                        {aiDrafting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                        {aiDrafting ? "Drafting..." : "Draft Response"}
                      </button>
                    </div>

                    {/* Analysis results */}
                    {aiAnalysis && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Category:</span>
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{ color: CATEGORY_COLORS[aiAnalysis.category] || "#6B7280", background: `${CATEGORY_COLORS[aiAnalysis.category] || "#6B7280"}18` }}>
                            {aiAnalysis.category}
                          </span>
                          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase ml-2">Sentiment:</span>
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{ color: SENTIMENT_CONFIG[aiAnalysis.sentiment]?.color || "#6B7280", background: SENTIMENT_CONFIG[aiAnalysis.sentiment]?.bg || "#6B728018" }}>
                            {aiAnalysis.sentiment}
                          </span>
                          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase ml-2">Priority:</span>
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{ color: PRIORITY_CONFIG[aiAnalysis.suggestedPriority]?.color || "#F59E0B", background: PRIORITY_CONFIG[aiAnalysis.suggestedPriority]?.bg || "#F59E0B18" }}>
                            {aiAnalysis.suggestedPriority}
                          </span>
                        </div>

                        {/* Tags */}
                        {aiAnalysis.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <Tag size={11} className="text-[var(--color-text-muted)]" />
                            {aiAnalysis.tags.map(tag => (
                              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Escalation warning */}
                        {aiAnalysis.escalationRequired && (
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-400/30">
                            <AlertTriangle size={14} className="text-red-500 shrink-0" />
                            <span className="text-xs font-semibold text-red-600">Escalation Recommended</span>
                          </div>
                        )}

                        {/* Similar tickets */}
                        {aiAnalysis.similarTicketIds.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <LinkIcon size={11} className="text-[var(--color-text-muted)]" />
                            <span className="text-[10px] text-[var(--color-text-muted)]">Similar tickets:</span>
                            {aiAnalysis.similarTicketIds.map(id => {
                              const t = tickets.find(tk => tk.id === id);
                              return (
                                <button key={id} onClick={() => t && openTicket(t)}
                                  className="text-[10px] font-semibold text-[var(--color-gold)] hover:underline">
                                  #{t?.ticketNo || id.slice(0, 6)}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Apply AI suggestions */}
                        {aiAnalysis.suggestedPriority !== selected.priority && (
                          <button onClick={applyAnalysisSuggestions} disabled={applyingAnalysis}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[var(--color-gold)] text-black hover:opacity-90 transition-all disabled:opacity-50">
                            {applyingAnalysis ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={12} />}
                            Apply AI Suggestions (Priority: {aiAnalysis.suggestedPriority})
                          </button>
                        )}
                      </motion.div>
                    )}

                    {/* Draft response area */}
                    {aiDraft && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">AI Draft</span>
                          <button onClick={draftResponse} disabled={aiDrafting}
                            className="flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-600 transition-colors">
                            <RotateCcw size={10} /> Regenerate
                          </button>
                        </div>
                        <div className="relative">
                          <textarea
                            value={aiDraft}
                            onChange={e => setAiDraft(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2.5 rounded-xl border border-blue-300/40 bg-blue-500/5 text-sm text-[var(--color-text)] outline-none focus:border-blue-400 transition-all resize-none"
                          />
                        </div>
                        <button onClick={() => { setReplyText(aiDraft); setAiDraft(""); }}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all">
                          <CheckCheck size={12} /> Use This Response
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reply + status update */}
              <div className="p-4 border-t border-[var(--color-border)] space-y-3 shrink-0">
                <div className="flex items-center gap-3">
                  <label htmlFor="ticket-status" className="text-xs font-semibold text-[var(--color-text-secondary)] shrink-0">Status:</label>
                  <div className="relative flex-1">
                    <select id="ticket-status" value={newStatus} onChange={e => setNewStatus(e.target.value)}
                      aria-label="Update ticket status"
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
