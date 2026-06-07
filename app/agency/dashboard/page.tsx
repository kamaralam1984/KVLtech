"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Users, DollarSign, Percent, Copy, CheckCircle2,
  Loader2, LogOut, Search, Share2, ExternalLink, MessageCircle,
  Package, TrendingUp, Award, Wallet, ArrowUpRight, Download,
  ChevronLeft, ChevronRight, X, Trophy, BarChart3,
  Filter, Calendar,
} from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Agency {
  id: string;
  name: string;
  email: string;
  phone?: string;
  commissionRate: number;
  status: string;
  totalRevenue: number;
  totalClients: number;
  referralCode: string;
  logoUrl?: string;
  clientCount: number;
}

interface AgencyClientRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  city?: string;
  ordersCount: number;
  totalSpent: number;
}

interface TierData {
  name: string;
  minRevenue: number;
  commissionRate: number;
  color: string;
  benefits: string[];
}

interface TierInfo {
  tier: string;
  tierData: TierData;
  currentRevenue: number;
  nextTier: { key: string; name: string; minRevenue: number; commissionRate: number; color: string; benefits: string[] } | null;
  revenueToNextTier: number;
}

interface Commission {
  id: string;
  agencyId: string;
  orderId: string;
  clientId: string;
  clientName: string;
  orderAmount: number;
  commissionRate: number;
  amount: number;
  tier: string;
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

interface CommissionSummary {
  totalEarned: number;
  totalPending: number;
  totalPaid: number;
  thisMonth: number;
}

interface Payout {
  id: string;
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

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "#16A34A", PENDING: "#F59E0B",
  SUSPENDED: "#EF4444", TERMINATED: "#9CA3AF",
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

type Tab = "overview" | "commissions" | "payouts" | "leaderboard";

// ─────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────
function fmt(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
function TierBadge({ tier, color }: { tier: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ color, background: color + "20" }}
    >
      {TIER_ICONS[tier] ?? "⭐"} {tier}
    </span>
  );
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function AgencyDashboardPage() {
  const router = useRouter();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [clients, setClients] = useState<AgencyClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Tier
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [tierLoading, setTierLoading] = useState(false);

  // Commissions
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [commSummary, setCommSummary] = useState<CommissionSummary>({ totalEarned: 0, totalPending: 0, totalPaid: 0, thisMonth: 0 });
  const [commTotal, setCommTotal] = useState(0);
  const [commPage, setCommPage] = useState(1);
  const [commStatus, setCommStatus] = useState("");
  const [commFrom, setCommFrom] = useState("");
  const [commTo, setCommTo] = useState("");
  const [commLoading, setCommLoading] = useState(false);
  const COMM_LIMIT = 10;

  // Payouts
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ amount: "", bankName: "", accountNumber: "", ifscCode: "", notes: "" });
  const [payoutError, setPayoutError] = useState("");
  const [payoutSaving, setPayoutSaving] = useState(false);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [ownRank, setOwnRank] = useState(0);
  const [totalAgencies, setTotalAgencies] = useState(0);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const referralLink = agency ? `${SITE_URL}?agency=${agency.referralCode}` : "";

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  // ─── Fetchers ───────────────────────────────
  const fetchAgency = useCallback(async () => {
    try {
      const res = await fetch("/api/agency/me");
      if (res.status === 401) { router.replace("/agency/login"); return; }
      if (res.ok) { const d = await res.json(); setAgency(d.agency); }
    } catch { router.replace("/agency/login"); }
    finally { setLoading(false); }
  }, [router]);

  const fetchClients = useCallback(async () => {
    setClientsLoading(true);
    try {
      const res = await fetch("/api/agency/clients");
      if (res.ok) { const d = await res.json(); setClients(d.clients || []); }
    } catch { /* ignore */ }
    setClientsLoading(false);
  }, []);

  const fetchTier = useCallback(async () => {
    setTierLoading(true);
    try {
      const res = await fetch("/api/agency/tier");
      if (res.ok) {
        const d = await res.json();
        setTierInfo({ tier: d.tier, tierData: d.tierData, currentRevenue: d.currentRevenue, nextTier: d.nextTier, revenueToNextTier: d.revenueToNextTier });
        setLeaderboard(d.leaderboard || []);
        setOwnRank(d.ownRank || 0);
        setTotalAgencies(d.totalAgencies || 0);
      }
    } catch { /* ignore */ }
    setTierLoading(false);
  }, []);

  const fetchCommissions = useCallback(async () => {
    setCommLoading(true);
    try {
      const params = new URLSearchParams();
      if (commStatus) params.set("status", commStatus);
      if (commFrom) params.set("from", commFrom);
      if (commTo) params.set("to", commTo);
      params.set("page", commPage.toString());
      params.set("limit", COMM_LIMIT.toString());

      const res = await fetch(`/api/agency/commissions?${params}`);
      if (res.ok) {
        const d = await res.json();
        setCommissions(d.items || []);
        setCommTotal(d.total || 0);
        setCommSummary(d.summary || { totalEarned: 0, totalPending: 0, totalPaid: 0, thisMonth: 0 });
      }
    } catch { /* ignore */ }
    setCommLoading(false);
  }, [commPage, commStatus, commFrom, commTo]);

  const fetchPayouts = useCallback(async () => {
    setPayoutsLoading(true);
    try {
      const res = await fetch("/api/agency/payouts");
      if (res.ok) {
        const d = await res.json();
        setPayouts(d.payouts || []);
        setAvailableBalance(d.availableBalance || 0);
      }
    } catch { /* ignore */ }
    setPayoutsLoading(false);
  }, []);

  useEffect(() => { fetchAgency(); fetchClients(); fetchTier(); }, [fetchAgency, fetchClients, fetchTier]);
  useEffect(() => { if (activeTab === "commissions") fetchCommissions(); }, [activeTab, fetchCommissions]);
  useEffect(() => { if (activeTab === "payouts") fetchPayouts(); }, [activeTab, fetchPayouts]);
  useEffect(() => {
    if (activeTab === "leaderboard" && leaderboard.length === 0) {
      setLeaderboardLoading(true);
      fetchTier().finally(() => setLeaderboardLoading(false));
    }
  }, [activeTab, leaderboard.length, fetchTier]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/agency/logout", { method: "POST" }).catch(() => {});
    router.push("/agency/login");
  };

  const shareOnWhatsApp = () => {
    if (!agency) return;
    const text = encodeURIComponent(`Hi! I partner with KVL TECH for digital services. Use my referral link:\n${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const downloadCSV = () => {
    const header = ["Commission ID", "Order ID", "Client", "Date", "Order Amount (₹)", "Rate (%)", "Commission (₹)", "Status"];
    const rows = commissions.map((c) => [
      c.id, c.orderId, c.clientName, formatDate(c.createdAt),
      (c.orderAmount / 100).toFixed(2),
      (c.commissionRate * 100).toFixed(0),
      (c.amount / 100).toFixed(2),
      c.status,
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commissions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const submitPayout = async () => {
    setPayoutError("");
    const amt = Math.round(parseFloat(payoutForm.amount) * 100);
    if (!amt || isNaN(amt) || amt <= 0) { setPayoutError("Enter a valid amount"); return; }
    if (!payoutForm.bankName || !payoutForm.accountNumber || !payoutForm.ifscCode) {
      setPayoutError("Bank Name, Account Number, and IFSC Code are required");
      return;
    }
    setPayoutSaving(true);
    try {
      const res = await fetch("/api/agency/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, bankName: payoutForm.bankName, accountNumber: payoutForm.accountNumber, ifscCode: payoutForm.ifscCode, notes: payoutForm.notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setShowPayoutModal(false);
      setPayoutForm({ amount: "", bankName: "", accountNumber: "", ifscCode: "", notes: "" });
      await fetchPayouts();
    } catch (e: unknown) {
      setPayoutError(e instanceof Error ? e.message : "Failed");
    }
    setPayoutSaving(false);
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  // ─── Tier Progress ──────────────────────────
  const tierProgress = tierInfo && tierInfo.nextTier
    ? Math.min(100, ((tierInfo.currentRevenue - tierInfo.tierData.minRevenue) / (tierInfo.nextTier.minRevenue - tierInfo.tierData.minRevenue)) * 100)
    : 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[var(--color-gold)]" />
      </div>
    );
  }
  if (!agency) return null;

  const initials = agency.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const TABS: { id: Tab; label: string; icon: typeof Award }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "commissions", label: "Commissions", icon: DollarSign },
    { id: "payouts", label: "Payouts", icon: Wallet },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {agency.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agency.logoUrl} alt={agency.name}
                className="w-10 h-10 rounded-xl object-cover border border-[var(--color-border)]" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 flex items-center justify-center text-sm font-bold text-[var(--color-gold)]">
                {initials}
              </div>
            )}
            <div>
              <p className="font-display font-bold text-sm text-[var(--color-text)]">{agency.name}</p>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ color: STATUS_COLOR[agency.status] || "#9CA3AF", background: (STATUS_COLOR[agency.status] || "#9CA3AF") + "20" }}>
                {agency.status}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} disabled={loggingOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] hover:border-red-400 hover:text-red-500 transition-all">
            {loggingOut ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={12} />}
            Logout
          </button>
        </div>

        {/* Tab bar */}
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto pb-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                activeTab === id
                  ? "border-[var(--color-gold)] text-[var(--color-gold)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}>
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* ══════════════════════════════════════ */}
        {/* TAB: OVERVIEW                         */}
        {/* ══════════════════════════════════════ */}
        {activeTab === "overview" && (
          <>
            {/* Tier Card */}
            {tierLoading ? (
              <div className="card p-6 flex justify-center"><Loader2 size={20} className="animate-spin text-[var(--color-gold)]" /></div>
            ) : tierInfo ? (
              <div className="card p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: tierInfo.tierData.color + "15" }}>
                    {TIER_ICONS[tierInfo.tier] ?? "⭐"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-bold text-xl text-[var(--color-text)]">{tierInfo.tierData.name} Partner</p>
                      <TierBadge tier={tierInfo.tier} color={tierInfo.tierData.color} />
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      <span className="font-bold text-[var(--color-gold)]">{(tierInfo.tierData.commissionRate * 100).toFixed(0)}% commission</span> on every completed order
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--color-text-muted)]">Total Revenue</p>
                    <p className="font-bold text-lg text-[var(--color-gold)]">{fmt(tierInfo.currentRevenue)}</p>
                  </div>
                </div>

                {/* Progress to next tier */}
                {tierInfo.nextTier ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--color-text-muted)]">Progress to {tierInfo.nextTier.name}</span>
                      <span className="font-semibold text-[var(--color-text)]">{fmt(tierInfo.revenueToNextTier)} more to go</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${tierProgress}%`, background: tierInfo.tierData.color }} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                      <span>{fmt(tierInfo.currentRevenue)}</span>
                      <span>{fmt(tierInfo.nextTier.minRevenue)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl text-xs font-semibold text-center" style={{ background: tierInfo.tierData.color + "15", color: tierInfo.tierData.color }}>
                    You have reached the highest tier! 🎉
                  </div>
                )}

                {/* Benefits */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">Your Benefits</p>
                    <ul className="space-y-1.5">
                      {tierInfo.tierData.benefits.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-xs text-[var(--color-text)]">
                          <CheckCircle2 size={13} className="text-green-500 shrink-0" /> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {tierInfo.nextTier && (
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">
                        {tierInfo.nextTier.name} Benefits <span className="text-[10px] font-normal">(unlock at {fmt(tierInfo.nextTier.minRevenue)})</span>
                      </p>
                      <ul className="space-y-1.5">
                        {tierInfo.nextTier.benefits.map((b) => (
                          <li key={b} className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] opacity-50">
                            <CheckCircle2 size={13} className="shrink-0" /> {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Users, label: "Total Clients", value: agency.totalClients.toString() },
                { icon: DollarSign, label: "Revenue Earned", value: fmt(agency.totalRevenue) },
                { icon: Percent, label: "Commission Rate", value: `${agency.commissionRate}%` },
                { icon: Copy, label: "Referral Code", value: agency.referralCode, action: () => copyText(agency.referralCode, "code"), actionLabel: copied === "code" ? "Copied!" : "Copy" },
              ].map(({ icon: Icon, label, value, action, actionLabel }) => (
                <div key={label} className="card p-5 flex flex-col gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center">
                    <Icon size={17} className="text-[var(--color-gold)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
                    <p className="font-display font-bold text-lg text-[var(--color-text)] font-mono">{value}</p>
                  </div>
                  {action && (
                    <button onClick={action} className="text-xs font-semibold text-[var(--color-gold)] hover:underline text-left">
                      {actionLabel}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Clients table */}
            <div className="card overflow-hidden">
              <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Users size={17} className="text-[var(--color-gold)]" />
                  <h2 className="font-semibold text-sm text-[var(--color-text)]">Your Clients</h2>
                  <span className="text-xs text-[var(--color-text-muted)]">({filteredClients.length})</span>
                </div>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search clients..."
                    className="pl-9 pr-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all w-52" />
                </div>
              </div>

              {clientsLoading ? (
                <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-[var(--color-gold)]" /></div>
              ) : filteredClients.length === 0 ? (
                <div className="py-12 text-center text-[var(--color-text-muted)]">
                  <Users size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{clients.length === 0 ? "No clients yet. Share your referral link to get started." : "No clients match your search."}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                        {["Client", "Email", "Company", "Orders", "Total Spent"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-semibold text-[var(--color-text-muted)] whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {filteredClients.map((client) => (
                        <tr key={client.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center text-[10px] font-bold text-[var(--color-gold)] shrink-0">
                                {client.name[0]}
                              </div>
                              <span className="font-semibold text-[var(--color-text)]">{client.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[var(--color-text-muted)]">{client.email}</td>
                          <td className="px-4 py-3 text-[var(--color-text-muted)]">{client.company || "—"}</td>
                          <td className="px-4 py-3 font-semibold text-[var(--color-text)]">{client.ordersCount}</td>
                          <td className="px-4 py-3 font-bold text-[var(--color-gold)]">{fmt(client.totalSpent)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Marketing Resources */}
            <div className="card p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Share2 size={17} className="text-[var(--color-gold)]" />
                <h2 className="font-semibold text-sm text-[var(--color-text)]">Marketing Resources</h2>
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">Your Referral Link</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] font-mono text-xs text-[var(--color-text)] truncate">
                    {referralLink}
                  </div>
                  <button onClick={() => copyText(referralLink, "link")}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all">
                    {copied === "link" ? <CheckCircle2 size={13} className="text-green-500" /> : <Copy size={13} />}
                    {copied === "link" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={shareOnWhatsApp}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-green-600 hover:bg-green-700 text-white transition-all">
                  <MessageCircle size={14} /> Share on WhatsApp
                </button>
                <a href="/marketing-assets" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all">
                  <Package size={14} /> Marketing Kit <ExternalLink size={11} />
                </a>
              </div>
              <div className="p-4 rounded-xl bg-[var(--color-gold)]/5 border border-[var(--color-gold)]/20 space-y-2">
                <p className="text-xs font-semibold text-[var(--color-gold)]">Pro tips for more referrals</p>
                <ul className="text-xs text-[var(--color-text-muted)] space-y-1 list-disc list-inside">
                  <li>Share your link in WhatsApp business groups</li>
                  <li>Add the link to your email signature</li>
                  <li>Mention KVL TECH in your social media posts</li>
                  <li>You earn {agency.commissionRate}% commission on every successful order</li>
                </ul>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: COMMISSIONS                      */}
        {/* ══════════════════════════════════════ */}
        {activeTab === "commissions" && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Earned", value: fmt(commSummary.totalEarned), color: "#C9A227" },
                { label: "Pending", value: fmt(commSummary.totalPending), color: "#F59E0B" },
                { label: "Paid", value: fmt(commSummary.totalPaid), color: "#3B82F6" },
                { label: "This Month", value: fmt(commSummary.thisMonth), color: "#16A34A" },
              ].map(({ label, value, color }) => (
                <div key={label} className="card p-4">
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">{label}</p>
                  <p className="font-bold text-lg" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="card p-4 flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Filter size={13} className="text-[var(--color-text-muted)]" />
                <span className="text-xs font-semibold text-[var(--color-text-muted)]">Filters</span>
              </div>
              <select value={commStatus} onChange={(e) => { setCommStatus(e.target.value); setCommPage(1); }}
                className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all">
                <option value="">All Status</option>
                {["PENDING", "APPROVED", "PAID", "REJECTED"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[var(--color-text-muted)]" />
                <input type="date" value={commFrom} onChange={(e) => { setCommFrom(e.target.value); setCommPage(1); }}
                  className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                <span className="text-xs text-[var(--color-text-muted)]">to</span>
                <input type="date" value={commTo} onChange={(e) => { setCommTo(e.target.value); setCommPage(1); }}
                  className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
              </div>
              <button onClick={downloadCSV} disabled={commissions.length === 0}
                className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all disabled:opacity-40">
                <Download size={13} /> CSV
              </button>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
              {commLoading ? (
                <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-[var(--color-gold)]" /></div>
              ) : commissions.length === 0 ? (
                <div className="py-12 text-center text-[var(--color-text-muted)]">
                  <TrendingUp size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No commissions found.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                          {["Order ID", "Client", "Date", "Order Amount", "Rate", "Commission", "Status"].map((h) => (
                            <th key={h} className="px-4 py-3 text-left font-semibold text-[var(--color-text-muted)] whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {commissions.map((c) => {
                          const st = COMM_STATUS_STYLE[c.status] || COMM_STATUS_STYLE.PENDING;
                          return (
                            <tr key={c.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                              <td className="px-4 py-3 font-mono text-[var(--color-text-muted)]">{c.orderId.slice(0, 8)}…</td>
                              <td className="px-4 py-3 font-semibold text-[var(--color-text)]">{c.clientName}</td>
                              <td className="px-4 py-3 text-[var(--color-text-muted)] whitespace-nowrap">{formatDate(c.createdAt)}</td>
                              <td className="px-4 py-3 text-[var(--color-text)]">{fmt(c.orderAmount)}</td>
                              <td className="px-4 py-3 text-[var(--color-text-muted)]">{(c.commissionRate * 100).toFixed(0)}%</td>
                              <td className="px-4 py-3 font-bold text-[var(--color-gold)]">{fmt(c.amount)}</td>
                              <td className="px-4 py-3">
                                <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ color: st.color, background: st.bg }}>
                                  {c.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {Math.min((commPage - 1) * COMM_LIMIT + 1, commTotal)}–{Math.min(commPage * COMM_LIMIT, commTotal)} of {commTotal}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => setCommPage((p) => Math.max(1, p - 1))} disabled={commPage === 1}
                        className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)] transition-all disabled:opacity-40">
                        <ChevronLeft size={14} />
                      </button>
                      <button onClick={() => setCommPage((p) => p + 1)} disabled={commPage * COMM_LIMIT >= commTotal}
                        className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)] transition-all disabled:opacity-40">
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: PAYOUTS                           */}
        {/* ══════════════════════════════════════ */}
        {activeTab === "payouts" && (
          <>
            {/* Balance card */}
            <div className="card p-6 flex items-center justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center">
                  <Wallet size={24} className="text-[var(--color-gold)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Available to withdraw</p>
                  <p className="font-display font-bold text-3xl text-[var(--color-gold)]">{fmt(availableBalance)}</p>
                </div>
              </div>
              <button onClick={() => setShowPayoutModal(true)} disabled={availableBalance === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-[var(--color-gold)] text-[var(--color-navy)] hover:opacity-90 transition-all disabled:opacity-40">
                <ArrowUpRight size={16} /> Request Payout
              </button>
            </div>

            {/* Payout history */}
            <div className="card overflow-hidden">
              <div className="p-5 border-b border-[var(--color-border)] flex items-center gap-2">
                <Wallet size={17} className="text-[var(--color-gold)]" />
                <h2 className="font-semibold text-sm text-[var(--color-text)]">Payout History</h2>
              </div>
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
                        {["Date", "Amount", "Bank", "Account", "Status", "Txn Reference"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-semibold text-[var(--color-text-muted)] whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {payouts.map((p) => {
                        const st = PAYOUT_STATUS_STYLE[p.status] || PAYOUT_STATUS_STYLE.PENDING;
                        return (
                          <tr key={p.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                            <td className="px-4 py-3 text-[var(--color-text-muted)] whitespace-nowrap">{formatDate(p.createdAt)}</td>
                            <td className="px-4 py-3 font-bold text-[var(--color-gold)]">{fmt(p.amount)}</td>
                            <td className="px-4 py-3 text-[var(--color-text)]">{p.bankName}</td>
                            <td className="px-4 py-3 font-mono text-[var(--color-text-muted)]">****{p.accountNumber.slice(-4)}</td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ color: st.color, background: st.bg }}>
                                {p.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-[var(--color-text-muted)]">{p.txnReference || "—"}</td>
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
            <div className="card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center">
                <Trophy size={22} className="text-[var(--color-gold)]" />
              </div>
              <div>
                <p className="font-display font-bold text-lg text-[var(--color-text)]">Agency Leaderboard</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Your position: <span className="font-bold text-[var(--color-gold)]">#{ownRank}</span> of {totalAgencies} agencies
                </p>
              </div>
            </div>

            <div className="card overflow-hidden">
              {leaderboardLoading ? (
                <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-[var(--color-gold)]" /></div>
              ) : leaderboard.length === 0 ? (
                <div className="py-12 text-center text-[var(--color-text-muted)]">
                  <Trophy size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Leaderboard data not available yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                        {["Rank", "Agency", "Tier", "Revenue", "Commission Rate"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-semibold text-[var(--color-text-muted)] whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {leaderboard.map((entry, i) => {
                        const isOwn = entry.agencyId === agency?.id;
                        const tierColors: Record<string, string> = { STARTER: "#6B7280", SILVER: "#94A3B8", GOLD: "#C9A227", PLATINUM: "#7C3AED" };
                        const tierRates: Record<string, string> = { STARTER: "10%", SILVER: "15%", GOLD: "20%", PLATINUM: "25%" };
                        const rankEmoji = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
                        return (
                          <tr key={entry.agencyId}
                            className={`transition-colors ${isOwn ? "bg-[var(--color-gold)]/5" : "hover:bg-[var(--color-bg-secondary)]"}`}>
                            <td className="px-4 py-3 font-bold text-[var(--color-text)]">{rankEmoji}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold ${isOwn ? "text-[var(--color-gold)]" : "text-[var(--color-text)]"}`}>
                                  {isOwn ? entry.name : i < 3 ? entry.name : `Agency #${i + 1}`}
                                </span>
                                {isOwn && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)]">You</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <TierBadge tier={entry.tier} color={tierColors[entry.tier] || "#6B7280"} />
                            </td>
                            <td className="px-4 py-3 font-bold text-[var(--color-gold)]">{fmt(entry.revenue)}</td>
                            <td className="px-4 py-3 text-[var(--color-text-muted)]">{tierRates[entry.tier] || "10%"}</td>
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
      </main>

      {/* ══════════════════════════════════════════ */}
      {/* PAYOUT MODAL                              */}
      {/* ══════════════════════════════════════════ */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-[var(--color-text)]">Request Payout</h2>
              <button onClick={() => { setShowPayoutModal(false); setPayoutError(""); }}
                className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-gold)]/5 border border-[var(--color-gold)]/20">
              <p className="text-xs text-[var(--color-text-muted)]">Available balance</p>
              <p className="font-bold text-xl text-[var(--color-gold)]">{fmt(availableBalance)}</p>
            </div>

            {payoutError && (
              <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{payoutError}</p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">
                  Amount (₹) <span className="text-red-400">*</span>
                </label>
                <input type="number" min="1" max={availableBalance / 100} step="0.01"
                  value={payoutForm.amount} onChange={(e) => setPayoutForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder={`Max ₹${(availableBalance / 100).toFixed(2)}`}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">
                  Bank Name <span className="text-red-400">*</span>
                </label>
                <input value={payoutForm.bankName} onChange={(e) => setPayoutForm((f) => ({ ...f, bankName: e.target.value }))}
                  placeholder="e.g. HDFC Bank"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">
                    Account Number <span className="text-red-400">*</span>
                  </label>
                  <input value={payoutForm.accountNumber} onChange={(e) => setPayoutForm((f) => ({ ...f, accountNumber: e.target.value }))}
                    placeholder="1234567890"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">
                    IFSC Code <span className="text-red-400">*</span>
                  </label>
                  <input value={payoutForm.ifscCode} onChange={(e) => setPayoutForm((f) => ({ ...f, ifscCode: e.target.value.toUpperCase() }))}
                    placeholder="HDFC0001234"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">Notes (optional)</label>
                <textarea value={payoutForm.notes} onChange={(e) => setPayoutForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="Any special instructions..."
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all resize-none" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setShowPayoutModal(false); setPayoutError(""); }}
                className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-gold)] transition-all">
                Cancel
              </button>
              <button onClick={submitPayout} disabled={payoutSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-[var(--color-gold)] text-[var(--color-navy)] hover:opacity-90 transition-all disabled:opacity-50">
                {payoutSaving ? <Loader2 size={14} className="animate-spin" /> : <ArrowUpRight size={14} />}
                {payoutSaving ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
