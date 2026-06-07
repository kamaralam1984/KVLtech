"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Plus, Trash2, Edit2, Check, X, Loader2,
  AlertCircle, RefreshCw, ToggleLeft, ToggleRight, ChevronDown,
  Users, Zap,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";

const INPUT = "w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all placeholder:text-[var(--color-text-muted)]";
const LABEL = "block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5";

interface StripePlan {
  id: string;
  name: string;
  description?: string;
  stripePriceId: string;
  amount: number;
  currency: string;
  interval: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

interface StripeSub {
  id: string;
  clientId: string;
  stripeSubId: string;
  stripePlanId: string;
  stripeCustomerId: string;
  status: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  client?: { name: string; email: string };
  stripePlan?: { name: string };
}

const SUB_STATUS_STYLE: Record<string, string> = {
  active:    "bg-green-500/10 text-green-500 border border-green-500/20",
  trialing:  "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  past_due:  "bg-orange-500/10 text-orange-500 border border-orange-500/20",
  cancelled: "bg-red-500/10 text-red-500 border border-red-500/20",
  canceled:  "bg-red-500/10 text-red-500 border border-red-500/20",
  incomplete:"bg-gray-500/10 text-gray-400 border border-gray-500/20",
};

function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="py-12 text-center text-[var(--color-text-muted)]">
      <Icon size={28} className="mx-auto mb-2 opacity-20" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

const defaultForm = {
  name: "",
  description: "",
  stripePriceId: "",
  amount: "",
  currency: "usd",
  interval: "month",
  features: "",
  sortOrder: "0",
};

export default function AdminStripePage() {
  const stripeConfigured = typeof process !== "undefined"
    ? true // assume true client-side; warning comes from API
    : false;

  const [plans, setPlans] = useState<StripePlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [subs, setSubs] = useState<StripeSub[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StripePlan | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [stripeWarning, setStripeWarning] = useState(false);

  const fetchPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      const r = await fetch("/api/admin/stripe-plans", { credentials: "include" });
      const data = await r.json();
      if (r.status === 503) {
        setStripeWarning(true);
      }
      if (data.plans) setPlans(data.plans);
    } catch {
      setStripeWarning(true);
    }
    setPlansLoading(false);
  }, []);

  const fetchSubs = useCallback(async () => {
    setSubsLoading(true);
    try {
      const r = await fetch("/api/admin/stripe-subscriptions", { credentials: "include" });
      if (r.ok) {
        const data = await r.json();
        if (data.subscriptions) setSubs(data.subscriptions);
      }
    } catch {}
    setSubsLoading(false);
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchSubs();
  }, [fetchPlans, fetchSubs]);

  const openAddModal = () => {
    setEditingPlan(null);
    setForm({ ...defaultForm });
    setFormError("");
    setShowAddModal(true);
  };

  const openEditModal = (plan: StripePlan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      description: plan.description || "",
      stripePriceId: plan.stripePriceId,
      amount: String(plan.amount),
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features.join("\n"),
      sortOrder: String(plan.sortOrder),
    });
    setFormError("");
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    const payload = {
      ...(editingPlan ? { id: editingPlan.id } : {}),
      name: form.name,
      description: form.description || null,
      stripePriceId: form.stripePriceId,
      amount: form.amount ? Number(form.amount) : 0,
      currency: form.currency,
      interval: form.interval,
      features: form.features.split("\n").map(f => f.trim()).filter(Boolean),
      sortOrder: Number(form.sortOrder) || 0,
    };

    const r = await fetch("/api/admin/stripe-plans", {
      method: editingPlan ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await r.json();

    if (!r.ok) {
      setFormError(data.error || "Failed to save plan");
    } else {
      setShowAddModal(false);
      fetchPlans();
    }
    setFormLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    setDeletingId(id);
    await fetch(`/api/admin/stripe-plans?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setDeletingId(null);
    fetchPlans();
  };

  const handleToggleActive = async (plan: StripePlan) => {
    setTogglingId(plan.id);
    await fetch("/api/admin/stripe-plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: plan.id, isActive: !plan.isActive }),
    });
    setTogglingId(null);
    fetchPlans();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[var(--color-bg-secondary)]">
      <AdminTopbar title="Stripe Billing Management" />
      <div className="flex-1 p-6 space-y-8">

        {/* Stripe not configured warning */}
        <AnimatePresence>
          {stripeWarning && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-3 p-5 rounded-2xl bg-orange-500/10 border border-orange-500/30">
              <AlertCircle size={20} className="text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-orange-600 dark:text-orange-400">Stripe not configured</p>
                <p className="text-sm text-orange-500/80 mt-0.5">
                  Add <code className="font-mono bg-orange-500/10 px-1 rounded">STRIPE_SECRET_KEY</code> to your{" "}
                  <code className="font-mono bg-orange-500/10 px-1 rounded">.env</code> file to enable Stripe features.
                  Plans can still be created in the database.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plans Section */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center">
                <CreditCard size={18} className="text-[var(--color-gold)]" />
              </div>
              <div>
                <h2 className="font-display font-bold text-[var(--color-text)]">Stripe Plans</h2>
                <p className="text-xs text-[var(--color-text-muted)]">{plans.length} plan{plans.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchPlans} className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-gold)]/40 transition-all">
                <RefreshCw size={14} className={plansLoading ? "animate-spin" : ""} />
              </button>
              <button onClick={openAddModal} className="btn-gold flex items-center gap-2 py-2 px-4 text-sm">
                <Plus size={15} /> Add Plan
              </button>
            </div>
          </div>

          {plansLoading ? (
            <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[var(--color-gold)]" /></div>
          ) : plans.length === 0 ? (
            <EmptyState icon={CreditCard} text="No plans yet — add your first Stripe plan" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                    {["Name", "Price ID", "Amount", "Interval", "Features", "Sort", "Active", "Actions"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {plans.map(plan => {
                    const currencySymbol = plan.currency === "inr" ? "₹" : "$";
                    return (
                      <tr key={plan.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-[var(--color-text)]">{plan.name}</p>
                          {plan.description && <p className="text-xs text-[var(--color-text-muted)] mt-0.5 max-w-[180px] truncate">{plan.description}</p>}
                        </td>
                        <td className="px-5 py-3.5">
                          <code className="text-xs font-mono text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] px-2 py-0.5 rounded">{plan.stripePriceId}</code>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-[var(--color-text)] whitespace-nowrap">
                          {currencySymbol}{(plan.amount / 100).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">{plan.interval}</td>
                        <td className="px-5 py-3.5 text-[var(--color-text-muted)]">{plan.features.length} items</td>
                        <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">{plan.sortOrder}</td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => handleToggleActive(plan)}
                            disabled={togglingId === plan.id}
                            className="transition-opacity disabled:opacity-60"
                          >
                            {togglingId === plan.id
                              ? <Loader2 size={20} className="animate-spin text-[var(--color-text-muted)]" />
                              : plan.isActive
                                ? <ToggleRight size={24} className="text-green-500" />
                                : <ToggleLeft size={24} className="text-[var(--color-text-muted)]" />}
                          </button>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEditModal(plan)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-all">
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => handleDelete(plan.id)} disabled={deletingId === plan.id}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-60">
                              {deletingId === plan.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            </button>
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

        {/* Subscriptions Section */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users size={18} className="text-blue-500" />
              </div>
              <div>
                <h2 className="font-display font-bold text-[var(--color-text)]">Stripe Subscriptions</h2>
                <p className="text-xs text-[var(--color-text-muted)]">{subs.length} subscription{subs.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <button onClick={fetchSubs} className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-gold)]/40 transition-all">
              <RefreshCw size={14} className={subsLoading ? "animate-spin" : ""} />
            </button>
          </div>

          {subsLoading ? (
            <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[var(--color-gold)]" /></div>
          ) : subs.length === 0 ? (
            <EmptyState icon={Users} text="No Stripe subscriptions yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                    {["Client", "Plan", "Status", "Current Period End", "Cancel at End", "Created"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {subs.map(sub => (
                    <tr key={sub.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                      <td className="px-5 py-3.5">
                        {sub.client ? (
                          <div>
                            <p className="font-semibold text-[var(--color-text)]">{sub.client.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">{sub.client.email}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-[var(--color-text-muted)] font-mono">{sub.clientId.slice(0, 8)}...</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">
                        {sub.stripePlan?.name || <span className="text-[var(--color-text-muted)] text-xs font-mono">{sub.stripePlanId.slice(0, 8)}...</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${SUB_STATUS_STYLE[sub.status] || "bg-gray-500/10 text-gray-400 border border-gray-500/20"}`}>
                          {sub.status.charAt(0).toUpperCase() + sub.status.slice(1).replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[var(--color-text-secondary)] whitespace-nowrap">
                        {sub.currentPeriodEnd
                          ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        {sub.cancelAtPeriodEnd
                          ? <span className="text-xs text-orange-500 font-semibold">Yes</span>
                          : <span className="text-xs text-[var(--color-text-muted)]">No</span>}
                      </td>
                      <td className="px-5 py-3.5 text-[var(--color-text-muted)] whitespace-nowrap">
                        {new Date(sub.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Add / Edit Plan Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-[var(--color-bg)] rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-lg text-[var(--color-text)]">
                  {editingPlan ? "Edit Plan" : "Add Plan"}
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Plan Name *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Pro Monthly" className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Stripe Price ID *</label>
                    <input required value={form.stripePriceId} onChange={e => setForm(f => ({ ...f, stripePriceId: e.target.value }))}
                      placeholder="price_..." className={INPUT} />
                  </div>
                </div>

                <div>
                  <label className={LABEL}>Description</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Short plan description" className={INPUT} />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className={LABEL}>Amount (in cents/paise)</label>
                    <input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="e.g. 2999" className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Currency</label>
                    <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className={INPUT}>
                      <option value="usd">USD ($)</option>
                      <option value="inr">INR (₹)</option>
                      <option value="eur">EUR (€)</option>
                      <option value="gbp">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Interval</label>
                    <select value={form.interval} onChange={e => setForm(f => ({ ...f, interval: e.target.value }))} className={INPUT}>
                      <option value="month">Monthly</option>
                      <option value="year">Yearly</option>
                      <option value="week">Weekly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={LABEL}>Features (one per line)</label>
                  <textarea rows={5} value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
                    placeholder={"Unlimited projects\nPriority support\nCustom domain"} className={INPUT + " resize-none"} />
                </div>

                <div>
                  <label className={LABEL}>Sort Order</label>
                  <input type="number" min="0" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                    placeholder="0" className={INPUT} />
                </div>

                {formError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    <AlertCircle size={14} /> {formError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline flex-1">Cancel</button>
                  <button type="submit" disabled={formLoading}
                    className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                    {formLoading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                    {editingPlan ? "Save Changes" : "Create Plan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
