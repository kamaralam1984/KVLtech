"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Plus, Copy, CheckCircle2, Loader2, X, RefreshCw,
  TrendingUp, Users, DollarSign, Mail, Phone,
  Globe, Percent, ToggleLeft, ToggleRight, Trash2, Eye, KeyRound,
  Award, Wallet, Trophy, BarChart3, CheckCircle, XCircle, ArrowUpRight,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: "Pending",    color: "#F59E0B", bg: "#F59E0B15" },
  ACTIVE:     { label: "Active",     color: "#16A34A", bg: "#16A34A15" },
  SUSPENDED:  { label: "Suspended",  color: "#EF4444", bg: "#EF444415" },
  TERMINATED: { label: "Terminated", color: "#9CA3AF", bg: "#9CA3AF15" },
};

const TIER_COLORS: Record<string, string> = {
  STARTER: "#6B7280", SILVER: "#94A3B8", GOLD: "#C9A227", PLATINUM: "#7C3AED",
};

const TIER_ICONS: Record<string, string> = {
  STARTER: "⭐", SILVER: "🥈", GOLD: "🥇", PLATINUM: "💎",
};

const COMM_STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  PENDING:  { color: "#F59E0B", bg: "#F59E0B15" },
  APPROVED: { color: "#16A34A", bg: "#16A34A15" },
  PAID:     { color: "#3B82F6", bg: "#3B82F615" },
  REJECTED: { color: "#EF4444", bg: "#EF444415" },
};

const PAYOUT_STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  PENDING:  { color: "#F59E0B", bg: "#F59E0B15" },
  PAID:     { color: "#16A34A", bg: "#16A34A15" },
  REJECTED: { color: "#EF4444", bg: "#EF444415" },
};

const INPUT = "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all";
const LABEL = "block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5";

interface Agency {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  commissionRate: number;
  status: string;
  totalRevenue: number;
  totalClients: number;
  referralCode: string;
  clientCount: number;
  createdAt: string;
}

interface AgencyClientRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ordersCount: number;
  totalSpent: number;
  addedAt: string;
}

interface Stats { total: number; active: number; totalRevenue: number }

interface Commission {
  id: string;
  agencyId: string;
  orderId: string;
  clientName: string;
  orderAmount: number;
  commissionRate: number;
  amount: number;
  tier: string;
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED";
  createdAt: string;
}

interface Payout {
  id: string;
  agencyId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  notes?: string;
  status: "PENDING" | "PAID" | "REJECTED";
  txnReference?: string;
  createdAt: string;
}

interface LeaderboardEntry {
  agencyId: string;
  name: string;
  tier: string;
  revenue: number;
  commissions: number;
  clientCount: number;
}

interface TierDistribution { STARTER: number; SILVER: number; GOLD: number; PLATINUM: number }

type AdminTab = "agencies" | "commissions" | "payouts" | "leaderboard";

// ─────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────
function fmt(paise: number) { return `₹${(paise / 100).toLocaleString("en-IN")}`; }
function formatDate(iso: string) { return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }

function TierBadge({ tier }: { tier: string }) {
  const color = TIER_COLORS[tier] || "#6B7280";
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ color, background: color + "20" }}>
      {TIER_ICONS[tier] ?? "⭐"} {tier}
    </span>
  );
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function AgencyPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("agencies");

  // Agencies
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<{ agency: Agency; clients: AgencyClientRow[] } | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [drawerPassword, setDrawerPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", website: "", commissionRate: "20" });
  const [formError, setFormError] = useState("");

  // Commissions
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [commLoading, setCommLoading] = useState(false);
  const [commActionLoading, setCommActionLoading] = useState<string | null>(null);

  // Payouts
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [payoutActionLoading, setPayoutActionLoading] = useState<string | null>(null);
  const [txnRefs, setTxnRefs] = useState<Record<string, string>>({});

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tierDistribution, setTierDistribution] = useState<TierDistribution>({ STARTER: 0, SILVER: 0, GOLD: 0, PLATINUM: 0 });
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // ─── Fetchers ───────────────────────────────
  const fetchAgencies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/agency", { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        setAgencies(d.agencies || []);
        setStats(d.stats || { total: 0, active: 0, totalRevenue: 0 });
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const fetchCommissions = useCallback(async () => {
    setCommLoading(true);
    try {
      const res = await fetch("/api/admin/agency/commissions", { credentials: "include" });
      if (res.ok) { const d = await res.json(); setCommissions(d.items || []); }
    } catch { /* ignore */ }
    setCommLoading(false);
  }, []);

  const fetchPayouts = useCallback(async () => {
    setPayoutsLoading(true);
    try {
      const res = await fetch("/api/admin/agency/payouts", { credentials: "include" });
      if (res.ok) { const d = await res.json(); setPayouts(d.payouts || []); }
    } catch { /* ignore */ }
    setPayoutsLoading(false);
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const res = await fetch("/api/admin/agency/leaderboard", { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        setLeaderboard(d.leaderboard || []);
        setTierDistribution(d.tierDistribution || { STARTER: 0, SILVER: 0, GOLD: 0, PLATINUM: 0 });
      }
    } catch { /* ignore */ }
    setLeaderboardLoading(false);
  }, []);

  useEffect(() => { fetchAgencies(); }, [fetchAgencies]);
  useEffect(() => { if (activeTab === "commissions") fetchCommissions(); }, [activeTab, fetchCommissions]);
  useEffect(() => { if (activeTab === "payouts") fetchPayouts(); }, [activeTab, fetchPayouts]);
  useEffect(() => { if (activeTab === "leaderboard") fetchLeaderboard(); }, [activeTab, fetchLeaderboard]);

  // ─── Agency actions ──────────────────────────
  const openDrawer = async (agency: Agency) => {
    setDrawerPassword(""); setPasswordMsg(null); setDrawerLoading(true);
    setDrawer({ agency, clients: [] });
    try {
      const res = await fetch(`/api/admin/agency/${agency.id}`, { credentials: "include" });
      if (res.ok) { const d = await res.json(); setDrawer({ agency: d.agency, clients: d.agency.clients || [] }); }
    } catch { /* ignore */ }
    setDrawerLoading(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => { setCopiedCode(code); setTimeout(() => setCopiedCode(null), 2000); });
  };

  const handleCreate = async () => {
    setFormError("");
    if (!form.name || !form.email) { setFormError("Name and email are required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/agency", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, website: form.website, commissionRate: parseFloat(form.commissionRate) || 20 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      await fetchAgencies();
      setShowModal(false);
      setForm({ name: "", email: "", phone: "", website: "", commissionRate: "20" });
    } catch (e: unknown) { setFormError(e instanceof Error ? e.message : "Failed"); }
    setSaving(false);
  };

  const handleSetPassword = async () => {
    if (!drawer || !drawerPassword) return;
    setPasswordSaving(true); setPasswordMsg(null);
    try {
      const res = await fetch("/api/admin/agency", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ id: drawer.agency.id, password: drawerPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setPasswordMsg({ type: "success", text: "Password set successfully" });
      setDrawerPassword("");
    } catch (e: unknown) { setPasswordMsg({ type: "error", text: e instanceof Error ? e.message : "Failed" }); }
    setPasswordSaving(false);
  };

  const toggleStatus = async (agency: Agency) => {
    const newStatus = agency.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setActionLoading(agency.id);
    try {
      await fetch("/api/admin/agency", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ id: agency.id, status: newStatus }),
      });
      await fetchAgencies();
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  const deleteAgency = async (id: string) => {
    if (!confirm("Delete this agency? This cannot be undone.")) return;
    setActionLoading(id);
    try {
      await fetch(`/api/admin/agency?id=${id}`, { method: "DELETE", credentials: "include" });
      await fetchAgencies();
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  // ─── Commission actions ──────────────────────
  const updateCommission = async (commissionId: string, status: string) => {
    setCommActionLoading(commissionId);
    try {
      const res = await fetch("/api/admin/agency/commissions", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ commissionId, status }),
      });
      if (res.ok) await fetchCommissions();
    } catch { /* ignore */ }
    setCommActionLoading(null);
  };

  // ─── Payout actions ──────────────────────────
  const updatePayout = async (payoutId: string, status: string) => {
    setPayoutActionLoading(payoutId);
    try {
      const res = await fetch("/api/admin/agency/payouts", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ payoutId, status, txnReference: txnRefs[payoutId] || undefined }),
      });
      if (res.ok) await fetchPayouts();
    } catch { /* ignore */ }
    setPayoutActionLoading(null);
  };

  // ─── Leaderboard pie chart ───────────────────
  const tierTotal = Object.values(tierDistribution).reduce((s, v) => s + v, 0) || 1;
  const tierPie = [
    { key: "STARTER", label: "Starter", color: "#6B7280" },
    { key: "SILVER",  label: "Silver",  color: "#94A3B8" },
    { key: "GOLD",    label: "Gold",    color: "#C9A227" },
    { key: "PLATINUM",label: "Platinum",color: "#7C3AED" },
  ];

  const TABS: { id: AdminTab; label: string; icon: typeof Award }[] = [
    { id: "agencies", label: "All Agencies", icon: Building2 },
    { id: "commissions", label: "Commissions", icon: DollarSign },
    { id: "payouts", label: "Payout Requests", icon: Wallet },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <>
      <AdminTopbar title="Agency & Reseller Management" />
      <div className="p-6 space-y-5 max-w-[1400px]">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Building2, label: "Total Agencies", value: stats.total.toString() },
            { icon: Users, label: "Active Agencies", value: stats.active.toString() },
            { icon: TrendingUp, label: "Total Revenue", value: fmt(stats.totalRevenue) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-[var(--color-gold)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
                <p className="font-display font-bold text-xl text-[var(--color-text)]">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-[var(--color-border)] overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                activeTab === id
                  ? "border-[var(--color-gold)] text-[var(--color-gold)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}>
              <Icon size={13} />{label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════ */}
        {/* TAB: ALL AGENCIES                     */}
        {/* ══════════════════════════════════════ */}
        {activeTab === "agencies" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[var(--color-text)]">All Agencies</h2>
              <div className="flex items-center gap-2">
                <button onClick={fetchAgencies} className="p-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all">
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
                <button onClick={() => setShowModal(true)} className="btn-gold flex items-center gap-2">
                  <Plus size={15} /> Add Agency
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-[var(--color-gold)]" /></div>
            ) : agencies.length === 0 ? (
              <div className="card p-12 text-center text-[var(--color-text-muted)]">
                <Building2 size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No agencies yet. Add your first reseller partner.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {agencies.map((agency, i) => {
                  const cfg = STATUS_CFG[agency.status] || STATUS_CFG.PENDING;
                  return (
                    <motion.div key={agency.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className="card p-5 hover:shadow-[var(--shadow-card-hover)] transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--color-navy)] flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {agency.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[var(--color-text)]">{agency.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)] truncate max-w-[140px]">{agency.email}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0" style={{ color: cfg.color, background: cfg.bg }}>
                          {cfg.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center">
                          <p className="font-bold text-sm text-[var(--color-text)]">{agency.commissionRate}%</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">Commission</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-sm text-[var(--color-text)]">{agency.clientCount}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">Clients</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-sm text-[var(--color-gold)]">{fmt(agency.totalRevenue)}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">Revenue</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                        <span className="text-[10px] text-[var(--color-text-muted)]">Code:</span>
                        <code className="text-xs font-bold text-[var(--color-text)] font-mono flex-1">{agency.referralCode}</code>
                        <button onClick={() => copyCode(agency.referralCode)} className="text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors">
                          {copiedCode === agency.referralCode ? <CheckCircle2 size={13} className="text-green-500" /> : <Copy size={13} />}
                        </button>
                      </div>

                      <div className="flex gap-1.5">
                        <button onClick={() => openDrawer(agency)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all">
                          <Eye size={12} /> View
                        </button>
                        <button onClick={() => toggleStatus(agency)} disabled={actionLoading === agency.id}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            agency.status === "ACTIVE"
                              ? "border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                              : "border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          }`}>
                          {actionLoading === agency.id ? <Loader2 size={12} className="animate-spin" /> :
                            agency.status === "ACTIVE" ? <><ToggleRight size={12} /> Suspend</> : <><ToggleLeft size={12} /> Activate</>}
                        </button>
                        <button onClick={() => deleteAgency(agency.id)} disabled={actionLoading === agency.id}
                          className="p-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-red-400 hover:text-red-500 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: COMMISSIONS                      */}
        {/* ══════════════════════════════════════ */}
        {activeTab === "commissions" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[var(--color-text)]">Commission Requests</h2>
              <button onClick={fetchCommissions} className="p-2 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all">
                <RefreshCw size={14} className={commLoading ? "animate-spin text-[var(--color-gold)]" : "text-[var(--color-text-muted)]"} />
              </button>
            </div>

            <div className="card overflow-hidden">
              {commLoading ? (
                <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-[var(--color-gold)]" /></div>
              ) : commissions.length === 0 ? (
                <div className="py-12 text-center text-[var(--color-text-muted)]">
                  <DollarSign size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No commissions yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                        {["Agency ID", "Order", "Client", "Date", "Order Amt", "Rate", "Commission", "Tier", "Status", "Actions"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-semibold text-[var(--color-text-muted)] whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {commissions.map((c) => {
                        const st = COMM_STATUS_STYLE[c.status] || COMM_STATUS_STYLE.PENDING;
                        return (
                          <tr key={c.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                            <td className="px-4 py-3 font-mono text-[var(--color-text-muted)]">{c.agencyId.slice(0, 8)}…</td>
                            <td className="px-4 py-3 font-mono text-[var(--color-text-muted)]">{c.orderId.slice(0, 8)}…</td>
                            <td className="px-4 py-3 text-[var(--color-text)]">{c.clientName}</td>
                            <td className="px-4 py-3 text-[var(--color-text-muted)] whitespace-nowrap">{formatDate(c.createdAt)}</td>
                            <td className="px-4 py-3 text-[var(--color-text)]">{fmt(c.orderAmount)}</td>
                            <td className="px-4 py-3 text-[var(--color-text-muted)]">{(c.commissionRate * 100).toFixed(0)}%</td>
                            <td className="px-4 py-3 font-bold text-[var(--color-gold)]">{fmt(c.amount)}</td>
                            <td className="px-4 py-3">
                              <TierBadge tier={c.tier} />
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ color: st.color, background: st.bg }}>{c.status}</span>
                            </td>
                            <td className="px-4 py-3">
                              {c.status === "PENDING" && (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => updateCommission(c.id, "APPROVED")} disabled={commActionLoading === c.id}
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-all">
                                    {commActionLoading === c.id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle size={10} />} Approve
                                  </button>
                                  <button onClick={() => updateCommission(c.id, "REJECTED")} disabled={commActionLoading === c.id}
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all">
                                    <XCircle size={10} /> Reject
                                  </button>
                                </div>
                              )}
                              {c.status === "APPROVED" && (
                                <button onClick={() => updateCommission(c.id, "PAID")} disabled={commActionLoading === c.id}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all">
                                  <ArrowUpRight size={10} /> Mark Paid
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: PAYOUTS                           */}
        {/* ══════════════════════════════════════ */}
        {activeTab === "payouts" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[var(--color-text)]">Payout Requests</h2>
              <button onClick={fetchPayouts} className="p-2 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all">
                <RefreshCw size={14} className={payoutsLoading ? "animate-spin text-[var(--color-gold)]" : "text-[var(--color-text-muted)]"} />
              </button>
            </div>

            <div className="card overflow-hidden">
              {payoutsLoading ? (
                <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-[var(--color-gold)]" /></div>
              ) : payouts.length === 0 ? (
                <div className="py-12 text-center text-[var(--color-text-muted)]">
                  <Wallet size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No payout requests yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                        {["Agency", "Date", "Amount", "Bank", "Account", "IFSC", "Notes", "Status", "Txn Ref", "Actions"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-semibold text-[var(--color-text-muted)] whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {payouts.map((p) => {
                        const st = PAYOUT_STATUS_STYLE[p.status] || PAYOUT_STATUS_STYLE.PENDING;
                        const agencyName = agencies.find((a) => a.id === p.agencyId)?.name || p.agencyId.slice(0, 8) + "…";
                        return (
                          <tr key={p.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                            <td className="px-4 py-3 font-semibold text-[var(--color-text)]">{agencyName}</td>
                            <td className="px-4 py-3 text-[var(--color-text-muted)] whitespace-nowrap">{formatDate(p.createdAt)}</td>
                            <td className="px-4 py-3 font-bold text-[var(--color-gold)]">{fmt(p.amount)}</td>
                            <td className="px-4 py-3 text-[var(--color-text)]">{p.bankName}</td>
                            <td className="px-4 py-3 font-mono text-[var(--color-text-muted)]">****{p.accountNumber.slice(-4)}</td>
                            <td className="px-4 py-3 font-mono text-[var(--color-text-muted)]">{p.ifscCode}</td>
                            <td className="px-4 py-3 text-[var(--color-text-muted)] max-w-[120px] truncate">{p.notes || "—"}</td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ color: st.color, background: st.bg }}>{p.status}</span>
                            </td>
                            <td className="px-4 py-3">
                              {p.status === "PENDING" ? (
                                <input
                                  value={txnRefs[p.id] || ""}
                                  onChange={(e) => setTxnRefs((prev) => ({ ...prev, [p.id]: e.target.value }))}
                                  placeholder="Txn reference"
                                  className="w-28 px-2 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[10px] text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all"
                                />
                              ) : (
                                <span className="font-mono text-[var(--color-text-muted)]">{p.txnReference || "—"}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {p.status === "PENDING" && (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => updatePayout(p.id, "PAID")} disabled={payoutActionLoading === p.id}
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-all whitespace-nowrap">
                                    {payoutActionLoading === p.id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle size={10} />} Mark Paid
                                  </button>
                                  <button onClick={() => updatePayout(p.id, "REJECTED")} disabled={payoutActionLoading === p.id}
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all">
                                    <XCircle size={10} /> Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: LEADERBOARD                      */}
        {/* ══════════════════════════════════════ */}
        {activeTab === "leaderboard" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[var(--color-text)]">Agency Leaderboard</h2>
              <button onClick={fetchLeaderboard} className="p-2 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all">
                <RefreshCw size={14} className={leaderboardLoading ? "animate-spin text-[var(--color-gold)]" : "text-[var(--color-text-muted)]"} />
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {/* Tier distribution — CSS bar chart */}
              <div className="card p-5 col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={15} className="text-[var(--color-gold)]" />
                  <h3 className="font-semibold text-sm text-[var(--color-text)]">Tier Distribution</h3>
                </div>
                <div className="space-y-3">
                  {tierPie.map(({ key, label, color }) => {
                    const count = tierDistribution[key as keyof TierDistribution] || 0;
                    const pct = (count / tierTotal) * 100;
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[var(--color-text-muted)]">{TIER_ICONS[key]} {label}</span>
                          <span className="text-xs font-bold text-[var(--color-text)]">{count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-3 text-center">{tierTotal} active agencies total</p>
              </div>

              {/* Leaderboard table */}
              <div className="card overflow-hidden col-span-2">
                {leaderboardLoading ? (
                  <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-[var(--color-gold)]" /></div>
                ) : leaderboard.length === 0 ? (
                  <div className="py-12 text-center text-[var(--color-text-muted)]">
                    <Trophy size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No active agencies in leaderboard yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                          {["Rank", "Agency", "Tier", "Revenue", "Commissions Earned", "Clients"].map((h) => (
                            <th key={h} className="px-4 py-3 text-left font-semibold text-[var(--color-text-muted)] whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {leaderboard.map((entry, i) => {
                          const rankEmoji = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
                          return (
                            <tr key={entry.agencyId} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                              <td className="px-4 py-3 font-bold text-[var(--color-text)]">{rankEmoji}</td>
                              <td className="px-4 py-3 font-semibold text-[var(--color-text)]">{entry.name}</td>
                              <td className="px-4 py-3"><TierBadge tier={entry.tier} /></td>
                              <td className="px-4 py-3 font-bold text-[var(--color-gold)]">{fmt(entry.revenue)}</td>
                              <td className="px-4 py-3 text-[var(--color-text)]">{fmt(entry.commissions)}</td>
                              <td className="px-4 py-3 text-[var(--color-text-muted)]">{entry.clientCount}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Agency Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="card w-full max-w-md p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-[var(--color-text)]">Add Agency</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-all">
                  <X size={18} />
                </button>
              </div>

              {formError && <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{formError}</p>}

              <div className="space-y-4">
                <div>
                  <label className={LABEL}>Agency Name *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={INPUT} placeholder="Partner Agency Ltd." />
                </div>
                <div>
                  <label className={LABEL}>Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={INPUT} placeholder="contact@agency.com" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Phone</label>
                    <div className="relative">
                      <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                      <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={INPUT + " pl-9"} placeholder="+91..." />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL}>Commission Rate (%)</label>
                    <div className="relative">
                      <Percent size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                      <input type="number" min="0" max="100" value={form.commissionRate}
                        onChange={(e) => setForm((f) => ({ ...f, commissionRate: e.target.value }))}
                        className={INPUT + " pl-9"} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Website</label>
                  <div className="relative">
                    <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} className={INPUT + " pl-9"} placeholder="https://agency.com" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 btn-outline">Cancel</button>
                <button onClick={handleCreate} disabled={saving} className="flex-1 btn-gold flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {saving ? "Creating..." : "Create Agency"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Agency Drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setDrawer(null)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-[var(--color-bg)] border-l border-[var(--color-border)] overflow-y-auto">
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg text-[var(--color-text)]">{drawer.agency.name}</h2>
                  <button onClick={() => setDrawer(null)} className="p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-all">
                    <X size={18} />
                  </button>
                </div>

                <div className="card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--color-text-muted)]">Status</span>
                    <span className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ color: STATUS_CFG[drawer.agency.status]?.color, background: STATUS_CFG[drawer.agency.status]?.bg }}>
                      {STATUS_CFG[drawer.agency.status]?.label}
                    </span>
                  </div>
                  {[
                    { icon: Mail, label: "Email", value: drawer.agency.email },
                    { icon: Phone, label: "Phone", value: drawer.agency.phone || "—" },
                    { icon: Globe, label: "Website", value: drawer.agency.website || "—" },
                    { icon: Percent, label: "Commission", value: `${drawer.agency.commissionRate}%` },
                    { icon: DollarSign, label: "Total Revenue", value: fmt(drawer.agency.totalRevenue) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                      <Icon size={14} className="text-[var(--color-text-muted)] shrink-0" />
                      <span className="text-xs text-[var(--color-text-muted)]">{label}:</span>
                      <span className="text-xs text-[var(--color-text)] font-medium">{value}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 pt-1">
                    <Copy size={14} className="text-[var(--color-text-muted)] shrink-0" />
                    <span className="text-xs text-[var(--color-text-muted)]">Referral Code:</span>
                    <code className="text-xs font-bold font-mono text-[var(--color-gold)]">{drawer.agency.referralCode}</code>
                    <button onClick={() => copyCode(drawer.agency.referralCode)} className="ml-auto text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors">
                      {copiedCode === drawer.agency.referralCode ? <CheckCircle2 size={13} className="text-green-500" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                {/* Set Portal Password */}
                <div className="card p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <KeyRound size={15} className="text-[var(--color-gold)]" />
                    <h3 className="font-semibold text-sm text-[var(--color-text)]">Set Portal Password</h3>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Set a password so this agency can log in at <code className="font-mono text-[var(--color-gold)]">/agency/login</code>
                  </p>
                  {passwordMsg && (
                    <p className={`text-xs px-3 py-2 rounded-lg ${passwordMsg.type === "success" ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                      {passwordMsg.text}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                      <input type="password" value={drawerPassword}
                        onChange={(e) => { setDrawerPassword(e.target.value); setPasswordMsg(null); }}
                        placeholder="New password"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all" />
                    </div>
                    <button onClick={handleSetPassword} disabled={passwordSaving || !drawerPassword}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--color-navy)] text-white hover:opacity-90 transition-all disabled:opacity-50">
                      {passwordSaving ? <Loader2 size={12} className="animate-spin" /> : <KeyRound size={12} />} Set
                    </button>
                  </div>
                </div>

                {/* Clients list */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={15} className="text-[var(--color-gold)]" />
                    <h3 className="font-semibold text-sm text-[var(--color-text)]">Clients ({drawer.clients.length})</h3>
                  </div>
                  {drawerLoading ? (
                    <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[var(--color-gold)]" /></div>
                  ) : drawer.clients.length === 0 ? (
                    <div className="card p-6 text-center text-[var(--color-text-muted)] text-sm">No clients assigned yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {drawer.clients.map((client) => (
                        <div key={client.id} className="card p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--color-navy)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {client.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[var(--color-text)]">{client.name}</p>
                              <p className="text-xs text-[var(--color-text-muted)]">{client.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-[var(--color-text)]">{client.ordersCount} orders</p>
                            <p className="text-xs text-[var(--color-gold)] font-bold">{fmt(client.totalSpent)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
