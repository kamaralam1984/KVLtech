"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  RefreshCw, Loader2, Copy, Trash2, Check, X, Plus,
  TrendingUp, Users, XCircle, Tag, Zap, Download,
} from "lucide-react"
import { AdminTopbar } from "@/components/admin/AdminSidebar"

const SUB_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:    { label: "Active",    color: "#16A34A", bg: "#16A34A15" },
  PAUSED:    { label: "Paused",    color: "#F59E0B", bg: "#F59E0B15" },
  CANCELLED: { label: "Cancelled", color: "#EF4444", bg: "#EF444415" },
  EXPIRED:   { label: "Expired",   color: "#9CA3AF", bg: "#9CA3AF15" },
}

const REF_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "Pending",   color: "#F59E0B", bg: "#F59E0B15" },
  CONVERTED: { label: "Converted", color: "#0891B2", bg: "#0891B215" },
  PAID:      { label: "Paid",      color: "#16A34A", bg: "#16A34A15" },
  REJECTED:  { label: "Rejected",  color: "#EF4444", bg: "#EF444415" },
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
        <Icon size={20} className="text-[var(--color-gold)]" />
      </div>
      <div>
        <p className="text-xs text-[var(--color-text-muted)] mb-0.5">{label}</p>
        <p className="font-display font-bold text-xl text-[var(--color-text)]">{value}</p>
        {sub && <p className="text-[11px] text-[var(--color-text-muted)]">{sub}</p>}
      </div>
    </div>
  )
}

function SubscriptionsTab() {
  const [data, setData] = useState<{ subscriptions: any[]; stats: any }>({ subscriptions: [], stats: {} })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [cancelling, setCancelling] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : ""
      const res = await fetch(`/api/admin/subscriptions${params}`, { credentials: "include" })
      if (res.ok) setData(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const cancelSub = async (id: string) => {
    if (!confirm("Cancel this subscription?")) return
    setCancelling(id)
    try {
      await fetch("/api/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status: "CANCELLED" }),
      })
      await fetchData()
    } catch { /* ignore */ }
    setCancelling(null)
  }

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={TrendingUp} label="Total MRR" value={`₹${(data.stats.totalMrr || 0).toLocaleString("en-IN")}/mo`} sub="Monthly Recurring Revenue" />
        <StatCard icon={Users} label="Active Subscribers" value={String(data.stats.activeCount || 0)} sub="Currently active plans" />
        <StatCard icon={XCircle} label="Cancelled This Month" value={String(data.stats.churnCount || 0)} sub="Churned subscribers" />
      </div>

      <div className="card p-4 flex items-center gap-2 flex-wrap">
        {["all", ...Object.keys(SUB_STATUS)].map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === f ? "bg-[var(--color-navy)] text-white" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]"}`}>
            {f === "all" ? "All" : SUB_STATUS[f]?.label}
          </button>
        ))}
        <button onClick={fetchData} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
              <tr>
                {["Client", "Plan", "Amount", "Cycle", "Status", "Next Billing", "Start Date", "Action"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center"><Loader2 size={24} className="animate-spin text-[var(--color-gold)] mx-auto" /></td></tr>
              ) : data.subscriptions.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-sm text-[var(--color-text-muted)]">No subscriptions found</td></tr>
              ) : data.subscriptions.map((sub, i) => {
                const cfg = SUB_STATUS[sub.status] || SUB_STATUS.EXPIRED
                return (
                  <motion.tr key={sub.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="text-sm font-semibold text-[var(--color-text)]">{sub.client?.name}</p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">{sub.client?.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm text-[var(--color-text)]">{sub.planName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-bold text-[var(--color-text)]">₹{sub.amount.toLocaleString("en-IN")}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] capitalize">{sub.billingCycle}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {sub.nextBillingAt ? new Date(sub.nextBillingAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {new Date(sub.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.status === "ACTIVE" && (
                        <button onClick={() => cancelSub(sub.id)} disabled={cancelling === sub.id}
                          className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-400 transition-colors disabled:opacity-50">
                          {cancelling === sub.id ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                          Cancel
                        </button>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function CouponsTab() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [form, setForm] = useState({
    code: "", description: "", discountType: "percent", discountValue: "",
    maxUses: "", expiresAt: "", minOrderValue: "", referrerId: "",
  })
  const [affiliateSearch, setAffiliateSearch] = useState("")
  const [affiliateResults, setAffiliateResults] = useState<any[]>([])
  const [affiliateSearching, setAffiliateSearching] = useState(false)
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null)
  const [formError, setFormError] = useState("")

  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/coupons", { credentials: "include" })
      if (res.ok) setCoupons(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchCoupons() }, [fetchCoupons])

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    setForm(f => ({ ...f, code }))
  }

  const searchAffiliates = async (q: string) => {
    if (!q.trim()) { setAffiliateResults([]); return }
    setAffiliateSearching(true)
    try {
      const res = await fetch(`/api/admin/clients?q=${encodeURIComponent(q)}&limit=5`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setAffiliateResults(Array.isArray(data) ? data : (data.clients || []))
      }
    } catch { /* ignore */ }
    setAffiliateSearching(false)
  }

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    if (!form.code || !form.discountValue) { setFormError("Code and discount value are required"); return }
    setCreating(true)
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, referrerId: selectedAffiliate?.id || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error || "Failed to create coupon"); setCreating(false); return }
      setForm({ code: "", description: "", discountType: "percent", discountValue: "", maxUses: "", expiresAt: "", minOrderValue: "", referrerId: "" })
      setSelectedAffiliate(null)
      setAffiliateSearch("")
      setAffiliateResults([])
      await fetchCoupons()
    } catch { setFormError("Server error") }
    setCreating(false)
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, isActive: !isActive }),
      })
      await fetchCoupons()
    } catch { /* ignore */ }
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return
    try {
      await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE", credentials: "include" })
      await fetchCoupons()
    } catch { /* ignore */ }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="font-display font-bold text-lg text-[var(--color-text)] mb-5 flex items-center gap-2">
          <Tag size={18} className="text-[var(--color-gold)]" /> Create Coupon
        </h3>
        <form onSubmit={createCoupon} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Code *</label>
            <div className="flex gap-2">
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SAVE20" maxLength={20}
                className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all font-mono" />
              <button type="button" onClick={generateCode}
                className="px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all whitespace-nowrap">
                <Zap size={14} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Summer sale discount"
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Discount Type *</label>
            <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all">
              <option value="percent">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
              Discount Value * {form.discountType === "percent" ? "(%)" : "(₹)"}
            </label>
            <input type="number" min="1" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
              placeholder={form.discountType === "percent" ? "20" : "500"}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Max Uses</label>
            <input type="number" min="1" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
              placeholder="Unlimited"
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Expiry Date</label>
            <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Assign to Affiliate (optional)</label>
            {selectedAffiliate ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--color-text)]">{selectedAffiliate.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{selectedAffiliate.email}</p>
                </div>
                <button type="button" onClick={() => { setSelectedAffiliate(null); setAffiliateSearch(""); setAffiliateResults([]) }}
                  className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  value={affiliateSearch}
                  onChange={e => { setAffiliateSearch(e.target.value); searchAffiliates(e.target.value) }}
                  placeholder="Search client by name or email..."
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all"
                />
                {affiliateSearching && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--color-text-muted)]" />
                )}
                {affiliateResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] z-20 overflow-hidden">
                    {affiliateResults.map((client: any) => (
                      <button key={client.id} type="button"
                        onClick={() => { setSelectedAffiliate(client); setAffiliateResults([]); setAffiliateSearch("") }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-bg-secondary)] transition-colors text-left">
                        <div className="w-7 h-7 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center text-xs font-bold text-[var(--color-gold)] shrink-0">
                          {(client.name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text)]">{client.name}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{client.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {formError && (
            <p className="sm:col-span-2 lg:col-span-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{formError}</p>
          )}
          <div className="sm:col-span-2 lg:col-span-3">
            <button type="submit" disabled={creating}
              className="btn-gold flex items-center gap-2 disabled:opacity-60">
              {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              {creating ? "Creating..." : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
              <tr>
                {["Code", "Description", "Discount", "Used / Max", "Expires", "Active", "Actions"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center"><Loader2 size={24} className="animate-spin text-[var(--color-gold)] mx-auto" /></td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-sm text-[var(--color-text-muted)]">No coupons yet</td></tr>
              ) : coupons.map((c, i) => {
                const expired = c.expiresAt && new Date(c.expiresAt) < new Date()
                return (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-sm text-[var(--color-text)]">{c.code}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm text-[var(--color-text-secondary)]">{c.description || "—"}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-semibold text-[var(--color-gold)]">
                        {c.discountType === "percent" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm text-[var(--color-text)]">{c.usedCount} / {c.maxUses ?? "∞"}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs ${expired ? "text-red-500" : "text-[var(--color-text-muted)]"}`}>
                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Never"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button onClick={() => toggleActive(c.id, c.isActive)}
                        className={`w-10 h-5 rounded-full transition-all relative ${c.isActive ? "bg-[var(--color-gold)]" : "bg-[var(--color-border)]"}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${c.isActive ? "left-5.5" : "left-0.5"}`} />
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => copyCode(c.code)}
                          className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors">
                          {copied === c.code ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                        </button>
                        <button onClick={() => deleteCoupon(c.id)}
                          className="text-xs text-red-400 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ReferralsTab() {
  const [referrals, setReferrals] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [payModal, setPayModal] = useState<any>(null)
  const [commission, setCommission] = useState("")
  const [paying, setPaying] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")

  const fetchReferrals = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (levelFilter !== "all") params.set("level", levelFilter)
      const res = await fetch(`/api/admin/referrals?${params}`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setReferrals(data.referrals || [])
        setStats(data.stats || {})
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [statusFilter, levelFilter])

  useEffect(() => { fetchReferrals() }, [fetchReferrals])

  const markPaid = async () => {
    if (!payModal) return
    setPaying(true)
    try {
      await fetch("/api/admin/referrals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: payModal.id, status: "PAID", commission }),
      })
      setPayModal(null)
      setCommission("")
      await fetchReferrals()
    } catch { /* ignore */ }
    setPaying(false)
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={TrendingUp} label="Total Paid" value={`₹${(stats.totalPaid || 0).toLocaleString("en-IN")}`} sub="Commission paid out" />
        <StatCard icon={Zap} label="Pending" value={`₹${(stats.totalPending || 0).toLocaleString("en-IN")}`} sub="Awaiting payout" />
        <StatCard icon={Users} label="Level 1" value={String(stats.level1Count || 0)} sub="Direct referrals" />
        <StatCard icon={Users} label="Level 2" value={String(stats.level2Count || 0)} sub="Indirect referrals" />
        <StatCard icon={Tag} label="Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString("en-IN")}`} sub="From referred orders" />
      </div>

      <div className="card p-4 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-[var(--color-text-muted)] mr-1">Status:</span>
        {["all", ...Object.keys(REF_STATUS)].map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === f ? "bg-[var(--color-navy)] text-white" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]"}`}>
            {f === "all" ? "All" : REF_STATUS[f]?.label}
          </button>
        ))}
        <span className="text-xs font-semibold text-[var(--color-text-muted)] ml-4 mr-1">Level:</span>
        {["all", "1", "2"].map(l => (
          <button key={l} onClick={() => setLevelFilter(l)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${levelFilter === l ? "bg-[var(--color-navy)] text-white" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]"}`}>
            {l === "all" ? "All Levels" : `Level ${l}`}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={fetchReferrals} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <a href="/api/admin/export?type=referrals&format=csv" download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all">
            <Download size={13} /> Export CSV
          </a>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
              <tr>
                {["Referrer", "Referee Email", "Order Amt", "Level", "Commission", "Coupon", "Status", "Date", "Action"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-16 text-center"><Loader2 size={24} className="animate-spin text-[var(--color-gold)] mx-auto" /></td></tr>
              ) : referrals.length === 0 ? (
                <tr><td colSpan={9} className="py-16 text-center text-sm text-[var(--color-text-muted)]">No referrals found</td></tr>
              ) : referrals.map((r, i) => {
                const cfg = REF_STATUS[r.status] || REF_STATUS.PENDING
                const isLevel1 = (r.level ?? 1) === 1
                return (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="text-sm font-semibold text-[var(--color-text)]">{r.referrer?.name}</p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">{r.referrer?.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm text-[var(--color-text)]">{r.refereeEmail}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        {r.orderAmount ? `₹${r.orderAmount.toLocaleString("en-IN")}` : "—"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${isLevel1 ? "bg-[var(--color-gold)]/15 text-[var(--color-gold)]" : "bg-slate-500/15 text-slate-400"}`}>
                        L{r.level ?? 1} · {r.commissionRate ?? (isLevel1 ? 20 : 10)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-bold text-[var(--color-text)]">
                        {r.commission > 0 ? `₹${r.commission.toLocaleString("en-IN")}` : "—"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-mono text-[var(--color-text-muted)]">{r.couponCode || "—"}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {r.status !== "PAID" && r.status !== "REJECTED" && (
                        <button onClick={() => { setPayModal(r); setCommission(String(r.commission || "")) }}
                          className="text-xs font-medium text-[var(--color-gold)] hover:underline transition-colors">
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {payModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPayModal(null)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-[var(--color-bg)] rounded-2xl w-full max-w-sm shadow-[var(--shadow-luxury)] overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Mark as Paid</h3>
                <button onClick={() => setPayModal(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs space-y-1.5">
                  <p className="text-[var(--color-text-secondary)]">Referrer: <span className="font-semibold text-[var(--color-text)]">{payModal.referrer?.name}</span></p>
                  <p className="text-[var(--color-text-secondary)]">Referee: <span className="font-semibold text-[var(--color-text)]">{payModal.refereeEmail}</span></p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Commission Amount (₹)</label>
                  <input type="number" min="0" value={commission} onChange={e => setCommission(e.target.value)}
                    placeholder="Enter commission amount"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                </div>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => setPayModal(null)} className="btn-outline flex-1">Cancel</button>
                <button onClick={markPaid} disabled={paying}
                  className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                  {paying ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  {paying ? "Saving..." : "Confirm Paid"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function BillingPage() {
  const [tab, setTab] = useState<"subscriptions" | "coupons" | "referrals">("subscriptions")

  const tabs = [
    { id: "subscriptions" as const, label: "Subscriptions" },
    { id: "coupons" as const, label: "Coupons" },
    { id: "referrals" as const, label: "Referrals" },
  ]

  return (
    <>
      <AdminTopbar title="Billing & Subscriptions" />
      <div className="p-6 space-y-5 max-w-[1400px]">
        <div className="flex gap-1 p-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? "bg-[var(--color-navy)] text-white shadow-sm" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {tab === "subscriptions" && <SubscriptionsTab />}
            {tab === "coupons" && <CouponsTab />}
            {tab === "referrals" && <ReferralsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}
