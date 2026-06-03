"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Phone, MessageCircle, Mail, UserPlus, TrendingUp, Loader2, RefreshCw, ChevronDown, Sparkles, Zap, Info } from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";

const SCORE_CONFIG: Record<string, { emoji: string; label: string; color: string; bg: string; ring: string }> = {
  hot:  { emoji: "🔥", label: "Hot",  color: "#EF4444", bg: "#EF444415", ring: "ring-red-400/40" },
  warm: { emoji: "🌡️", label: "Warm", color: "#F59E0B", bg: "#F59E0B15", ring: "ring-amber-400/40" },
  cold: { emoji: "❄️", label: "Cold", color: "#0891B2", bg: "#0891B215", ring: "ring-cyan-400/40" },
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  NEW:           { color: "#C9A227", bg: "#C9A22715", label: "New" },
  CONTACTED:     { color: "#0891B2", bg: "#0891B215", label: "Contacted" },
  QUALIFIED:     { color: "#7C3AED", bg: "#7C3AED15", label: "Qualified" },
  PROPOSAL_SENT: { color: "#F59E0B", bg: "#F59E0B15", label: "Proposal Sent" },
  WON:           { color: "#16A34A", bg: "#16A34A15", label: "Won" },
  LOST:          { color: "#EF4444", bg: "#EF444415", label: "Lost" },
};



export default function ClientsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "score">("score");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [scoringId, setScoringId] = useState<string | null>(null);
  const [rescoring, setRescoring] = useState(false);
  const [scoreTooltip, setScoreTooltip] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "All") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/leads?${params}`, {
        credentials: "include",
        
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        const countMap: Record<string, number> = {};
        (data.counts || []).forEach((c: any) => { countMap[c.status] = c._count.id; });
        setCounts(countMap);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Sort + filter leads
  const filteredLeads = leads
    .filter(l => scoreFilter === "all" || l.scoreLabel === scoreFilter)
    .sort((a, b) => sortBy === "score" ? (b.score || 0) - (a.score || 0) : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const hotCount  = leads.filter(l => l.scoreLabel === "hot").length;
  const warmCount = leads.filter(l => l.scoreLabel === "warm").length;
  const coldCount = leads.filter(l => l.scoreLabel === "cold").length;

  const rescoreAll = async () => {
    setRescoring(true);
    try {
      await fetch("/api/admin/leads/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ all: true }),
      });
      await fetchLeads();
    } catch (e) { console.error(e); }
    setRescoring(false);
  };

  const rescoreOne = async (id: string) => {
    setScoringId(id);
    try {
      const res = await fetch("/api/admin/leads/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data.lead } : l));
      }
    } catch (e) { console.error(e); }
    setScoringId(null);
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } catch (e) { console.error(e); }
    setUpdatingId(null);
  };

  const totalLeads = Object.values(counts).reduce((a, b) => a + b, 0);
  const wonCount = counts["WON"] || 0;
  const convRate = totalLeads > 0 ? ((wonCount / totalLeads) * 100).toFixed(1) : "0";

  return (
    <>
      <AdminTopbar title="Clients & Leads" />
      <div className="p-6 space-y-5 max-w-[1400px]">

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(STATUS_CONFIG).map(([status, { label, color, bg }], i) => {
            const count = counts[status] || 0;
            return (
              <motion.div key={status} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="card p-4 text-center cursor-pointer hover:shadow-[var(--shadow-card-hover)] transition-all"
                onClick={() => setStatusFilter(statusFilter === status ? "All" : status)}>
                <p className="font-display font-bold text-2xl text-[var(--color-text)]">{count}</p>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full mt-1.5 inline-block"
                  style={{ color, background: bg }}>{label}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Score overview + conversion row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AI Score Cards */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-[var(--color-gold)]" />
                <span className="text-xs font-semibold text-[var(--color-text-secondary)]">AI Lead Score</span>
              </div>
              <button onClick={rescoreAll} disabled={rescoring}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all disabled:opacity-50">
                {rescoring ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                {rescoring ? "Scoring..." : "Rescore All"}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "hot",  count: hotCount,  ...SCORE_CONFIG.hot  },
                { key: "warm", count: warmCount, ...SCORE_CONFIG.warm },
                { key: "cold", count: coldCount, ...SCORE_CONFIG.cold },
              ].map(({ key, count, emoji, label, color, bg }) => (
                <button key={key} onClick={() => setScoreFilter(scoreFilter === key ? "all" : key)}
                  className={`p-3 rounded-xl text-center transition-all border ${scoreFilter === key ? "border-current shadow-sm" : "border-[var(--color-border)]"}`}
                  style={{ background: bg, color }}>
                  <p className="text-lg">{emoji}</p>
                  <p className="font-bold text-lg">{count}</p>
                  <p className="text-[10px] font-semibold">{label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Conversion banner */}
          <div className="card p-4 flex items-center justify-between bg-gradient-to-r from-[var(--color-navy)] to-[#1E293B] text-white">
            <div className="flex items-center gap-3">
              <TrendingUp size={20} className="text-[var(--color-gold)]" />
              <div>
                <p className="font-semibold text-sm">Conversion Rate</p>
                <p className="text-white/60 text-xs">{wonCount} of {totalLeads} leads converted to clients</p>
              </div>
            </div>
            <span className="font-display font-bold text-3xl text-[var(--color-gold)]">{convRate}%</span>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchLeads()}
              placeholder="Search name, phone, interest..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm outline-none focus:border-[var(--color-gold)] transition-all text-[var(--color-text)]" />
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", ...Object.keys(STATUS_CONFIG)].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === s ? "bg-[var(--color-navy)] text-white" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]"}`}>
                {s === "All" ? "All" : STATUS_CONFIG[s]?.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto items-center">
            <select value={sortBy} onChange={e => setSortBy(e.target.value as "date" | "score")}
              className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-gold)] transition-all">
              <option value="score">Sort: AI Score</option>
              <option value="date">Sort: Date</option>
            </select>
            <button onClick={fetchLeads} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        {/* Leads grid */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-[var(--color-gold)]" /></div>
        ) : leads.length === 0 ? (
          <div className="card p-12 text-center text-[var(--color-text-muted)]">
            <p className="text-sm">Koi leads nahi milein</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map((lead, i) => {
              const cfg = STATUS_CONFIG[lead.status] || { color: "#9CA3AF", bg: "#9CA3AF15", label: lead.status };
              const scfg = SCORE_CONFIG[lead.scoreLabel || "cold"];
              return (
                <motion.div key={lead.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`card p-5 hover:shadow-[var(--shadow-card-hover)] transition-all ${lead.scoreLabel === "hot" ? "ring-1 ring-red-400/20" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar with score ring */}
                      <div className="relative shrink-0">
                        <div className={`w-10 h-10 rounded-full bg-[var(--color-navy)] flex items-center justify-center text-white font-bold`}>
                          {lead.name[0]}
                        </div>
                        {/* Score badge on avatar */}
                        {lead.score > 0 && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ background: scfg.color }}>
                            {lead.score}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm text-[var(--color-text)]">{lead.name}</p>
                          {lead.scoreLabel && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ color: scfg.color, background: scfg.bg }}>
                              {scfg.emoji} {scfg.label}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>

                    {/* Status dropdown */}
                    <div className="relative shrink-0">
                      <select
                        value={lead.status}
                        onChange={e => updateStatus(lead.id, e.target.value)}
                        disabled={updatingId === lead.id}
                        className="text-[10px] font-bold px-2 py-1 rounded-full border-0 outline-none cursor-pointer appearance-none pr-5"
                        style={{ color: cfg.color, background: cfg.bg }}>
                        {Object.entries(STATUS_CONFIG).map(([v, { label }]) => (
                          <option key={v} value={v}>{label}</option>
                        ))}
                      </select>
                      {updatingId === lead.id
                        ? <Loader2 size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 animate-spin" style={{ color: cfg.color }} />
                        : <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: cfg.color }} />}
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    {lead.service && (
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                        <span className="font-medium text-[var(--color-text)]">Interest:</span> {lead.service}
                      </div>
                    )}
                    {lead.budget && (
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                        <span className="font-medium text-[var(--color-text)]">Budget:</span>
                        <span className="text-[var(--color-gold)] font-semibold">{lead.budget}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                      <span className="font-medium text-[var(--color-text)]">Source:</span>
                      <span className="px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">{lead.source}</span>
                    </div>
                    {lead.message && (
                      <p className="text-xs text-[var(--color-text-muted)] italic line-clamp-2 mt-1">"{lead.message}"</p>
                    )}
                  </div>

                  {/* Score note tooltip */}
                  {lead.scoreNote && (
                    <p className="text-[10px] text-[var(--color-text-muted)] italic bg-[var(--color-bg-secondary)] rounded-lg px-2.5 py-1.5 mb-3 line-clamp-2">
                      {lead.scoreNote}
                    </p>
                  )}

                  <div className="flex gap-1.5 pt-3 border-t border-[var(--color-border)]">
                    <a href={`tel:${lead.phone}`}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-green-500 hover:text-green-600 transition-all">
                      <Phone size={11} /> Call
                    </a>
                    <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[#25D366] hover:text-[#25D366] transition-all">
                      <MessageCircle size={11} /> WA
                    </a>
                    {lead.email && (
                      <a href={`mailto:${lead.email}`}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all">
                        <Mail size={11} /> Mail
                      </a>
                    )}
                    <button onClick={() => rescoreOne(lead.id)} disabled={scoringId === lead.id}
                      title="Score with AI"
                      className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-purple-400 hover:text-purple-500 transition-all disabled:opacity-50">
                      {scoringId === lead.id ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
