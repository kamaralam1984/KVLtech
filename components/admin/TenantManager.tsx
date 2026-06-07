"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Plus, X, RefreshCw, AlertTriangle,
  CheckCircle, XCircle, Globe, Palette, Users, Shield,
  Zap, ChevronRight, ExternalLink, Trash2,
} from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface TenantFeatures {
  maxClients: number;
  maxAdmins: number;
  customDomain: boolean;
  whiteLabel: boolean;
  apiAccess: boolean;
}

interface TenantUsage {
  clients: number;
}

interface Tenant {
  id: string;
  slug: string;
  name: string;
  customDomain?: string;
  primaryColor: string;
  logoUrl?: string;
  plan: "starter" | "growth" | "enterprise";
  features: TenantFeatures;
  isActive: boolean;
  createdAt: string;
  usage?: TenantUsage;
}

interface Agency {
  id: string;
  name: string;
  email: string;
}

interface UsageDetail {
  clients: { current: number; max: number; percentage: number };
  admins: { current: number; max: number; percentage: number };
  orders: { thisMonth: number; total: number };
  revenue: { thisMonth: number; total: number };
  apiCalls: { thisMonth: number };
  storageUsed: string;
}

// ─────────────────────────────────────────────
// PLAN CONFIG
// ─────────────────────────────────────────────

const PLAN_COLORS: Record<string, string> = {
  starter: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  growth: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  enterprise: "bg-[var(--color-gold)]/10 text-[var(--color-gold)]",
};

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  enterprise: "Enterprise",
};

const PLANS: Array<{
  id: "starter" | "growth" | "enterprise";
  label: string;
  features: string[];
}> = [
  {
    id: "starter",
    label: "Starter",
    features: ["Up to 10 clients", "2 admins", "No custom domain"],
  },
  {
    id: "growth",
    label: "Growth",
    features: ["Up to 50 clients", "10 admins", "Custom domain", "White label", "API access"],
  },
  {
    id: "enterprise",
    label: "Enterprise",
    features: ["Unlimited clients", "Unlimited admins", "Custom domain", "White label", "API access"],
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
}

function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────
function UsageBar({
  label,
  current,
  max,
}: {
  label: string;
  current: number;
  max: number;
}) {
  const unlimited = max >= 999999;
  const pct = unlimited ? 0 : Math.min(100, Math.round((current / max) * 100));
  const danger = pct >= 90;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
        <span>{label}</span>
        <span className={danger ? "text-red-500 font-semibold" : ""}>
          {current} / {unlimited ? "∞" : max}
        </span>
      </div>
      {!unlimited && (
        <div className="h-1.5 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`h-full rounded-full ${danger ? "bg-red-500" : "bg-[var(--color-gold)]"}`}
          />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TENANT CARD
// ─────────────────────────────────────────────
function TenantCard({
  tenant,
  onSelect,
  onSuspend,
}: {
  tenant: Tenant;
  onSelect: (t: Tenant) => void;
  onSuspend: (t: Tenant) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 flex flex-col gap-4 hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: tenant.primaryColor }}
        >
          {tenant.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tenant.logoUrl} alt={tenant.name} className="w-full h-full object-contain rounded-xl" />
          ) : (
            initials(tenant.name)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[var(--color-text)] truncate">{tenant.name}</span>
            <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] px-2 py-0.5 rounded-full font-mono">
              {tenant.slug}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLORS[tenant.plan]}`}>
              {PLAN_LABELS[tenant.plan]}
            </span>
            <span className={`w-2 h-2 rounded-full ${tenant.isActive ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-xs text-[var(--color-text-muted)]">
              {tenant.isActive ? "Active" : "Suspended"}
            </span>
          </div>
        </div>
      </div>

      {/* Usage bars */}
      <div className="space-y-2">
        <UsageBar
          label="Clients"
          current={tenant.usage?.clients ?? 0}
          max={tenant.features.maxClients}
        />
        <UsageBar label="Admins" current={1} max={tenant.features.maxAdmins} />
      </div>

      {/* Custom domain */}
      {tenant.customDomain && (
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] rounded-lg px-3 py-1.5">
          <Globe size={12} />
          <span className="truncate">{tenant.customDomain}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border)]">
        <button
          onClick={() => onSelect(tenant)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[var(--color-navy)] text-white hover:opacity-90 transition-opacity"
        >
          Configure <ChevronRight size={13} />
        </button>
        <button
          onClick={() => onSuspend(tenant)}
          title={tenant.isActive ? "Suspend tenant" : "Activate tenant"}
          className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
            tenant.isActive
              ? "border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              : "border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
          }`}
        >
          {tenant.isActive ? "Suspend" : "Activate"}
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// DETAIL PANEL
// ─────────────────────────────────────────────
function TenantDetailPanel({
  tenant,
  onClose,
  onUpdate,
}: {
  tenant: Tenant;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [usage, setUsage] = useState<UsageDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState(tenant.plan);

  useEffect(() => {
    fetch(`/api/admin/tenants/${tenant.slug}/usage`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then(setUsage)
      .catch(() => {});
  }, [tenant.slug]);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/admin/tenants/${tenant.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ plan }),
    });
    setSaving(false);
    onUpdate();
  };

  const provision = async () => {
    await fetch(`/api/admin/tenants/${tenant.slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "provision" }),
    });
    onUpdate();
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-y-0 right-0 z-50 w-[480px] max-w-full bg-[var(--color-bg)] border-l border-[var(--color-border)] shadow-2xl flex flex-col overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-bg)] z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: tenant.primaryColor }}
          >
            {initials(tenant.name)}
          </div>
          <div>
            <h2 className="font-bold text-[var(--color-text)]">{tenant.name}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLORS[tenant.plan]}`}>
              {PLAN_LABELS[tenant.plan]}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Usage */}
        {usage && (
          <section>
            <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
              Usage
            </h3>
            <div className="space-y-3 bg-[var(--color-bg-secondary)] rounded-2xl p-4">
              <UsageBar label="Clients" current={usage.clients.current} max={usage.clients.max} />
              <UsageBar label="Admins" current={usage.admins.current} max={usage.admins.max} />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl bg-[var(--color-bg)] p-3 border border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)]">Revenue (Month)</p>
                  <p className="font-bold text-[var(--color-text)]">{formatINR(usage.revenue.thisMonth)}</p>
                </div>
                <div className="rounded-xl bg-[var(--color-bg)] p-3 border border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)]">Orders (Month)</p>
                  <p className="font-bold text-[var(--color-text)]">{usage.orders.thisMonth}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Feature flags */}
        <section>
          <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
            Features
          </h3>
          <div className="space-y-2">
            {[
              { label: "White Label", key: "whiteLabel", icon: Palette },
              { label: "API Access", key: "apiAccess", icon: Zap },
              { label: "Custom Domain", key: "customDomain", icon: Globe },
            ].map(({ label, key, icon: Icon }) => (
              <div
                key={key}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={15} className="text-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text)]">{label}</span>
                </div>
                {tenant.features[key as keyof TenantFeatures] ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <XCircle size={16} className="text-[var(--color-text-muted)]" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Plan change */}
        <section>
          <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
            Change Plan
          </h3>
          <div className="flex gap-2">
            {(["starter", "growth", "enterprise"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlan(p)}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  plan === p
                    ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)]/50"
                }`}
              >
                {PLAN_LABELS[p]}
              </button>
            ))}
          </div>
          <button
            onClick={save}
            disabled={saving || plan === tenant.plan}
            className="mt-3 w-full py-2.5 rounded-xl bg-[var(--color-navy)] text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {saving ? "Saving..." : "Save Plan"}
          </button>
        </section>

        {/* Domain info */}
        {tenant.customDomain && (
          <section>
            <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
              Domain Configuration
            </h3>
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 text-sm space-y-2 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-300">
                <Globe size={14} />
                DNS Setup Instructions
              </div>
              <p className="text-blue-600 dark:text-blue-400 text-xs">
                Point a <strong>CNAME</strong> record from{" "}
                <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{tenant.customDomain}</code> to{" "}
                <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">kvlbusinesssolutions.com</code>
              </p>
              <a
                href={`https://${tenant.customDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs hover:underline"
              >
                Visit portal <ExternalLink size={10} />
              </a>
            </div>
          </section>
        )}

        {/* CSS Preview */}
        <section>
          <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
            Brand Preview
          </h3>
          <div
            className="rounded-2xl p-4 border"
            style={{ borderColor: tenant.primaryColor + "44" }}
          >
            <div
              className="h-8 rounded-xl mb-3"
              style={{ backgroundColor: tenant.primaryColor }}
            />
            <div className="space-y-1">
              <div className="h-2 rounded bg-current opacity-20" style={{ color: tenant.primaryColor, width: "60%" }} />
              <div className="h-2 rounded bg-current opacity-10" style={{ color: tenant.primaryColor, width: "80%" }} />
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Primary: <code>{tenant.primaryColor}</code>
            </p>
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wide mb-3">
            Danger Zone
          </h3>
          <div className="border border-red-200 dark:border-red-800 rounded-2xl p-4 space-y-3">
            <button
              onClick={provision}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors"
            >
              <Shield size={14} /> Provision White Label Config
            </button>
            <button
              onClick={async () => {
                if (!confirm(`Really delete tenant "${tenant.name}"?`)) return;
                await fetch(`/api/admin/tenants?slug=${tenant.slug}`, {
                  method: "DELETE",
                  credentials: "include",
                });
                onClose();
                onUpdate();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-300 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 size={14} /> Delete Tenant
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// ADD TENANT MODAL
// ─────────────────────────────────────────────
function AddTenantModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agencyId, setAgencyId] = useState("");
  const [slug, setSlug] = useState("");
  const [plan, setPlan] = useState<"starter" | "growth" | "enterprise">("starter");
  const [customDomain, setCustomDomain] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#C9A227");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/agency", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setAgencies(d?.agencies ?? []))
      .catch(() => {});
  }, []);

  const handleAgencyChange = (id: string) => {
    setAgencyId(id);
    const ag = agencies.find((a) => a.id === id);
    if (ag) setSlug(slugify(ag.name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          slug,
          name: agencies.find((a) => a.id === agencyId)?.name ?? slug,
          agencyId,
          plan,
          customDomain: customDomain || undefined,
          primaryColor,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg text-[var(--color-text)]">Add Tenant</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Agency */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Agency <span className="text-red-500">*</span>
            </label>
            <select
              value={agencyId}
              onChange={(e) => handleAgencyChange(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
            >
              <option value="">Select an agency...</option>
              {agencies.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.email})
                </option>
              ))}
            </select>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Slug <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                required
                placeholder="acme"
                maxLength={30}
                pattern="[a-z0-9-]+"
                className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
              />
              <span className="text-xs text-[var(--color-text-muted)] shrink-0">.kvlbusinesssolutions.com</span>
            </div>
          </div>

          {/* Plan */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Plan <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlan(p.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    plan === p.id
                      ? "border-[var(--color-gold)] bg-[var(--color-gold)]/5"
                      : "border-[var(--color-border)] hover:border-[var(--color-gold)]/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        plan === p.id
                          ? "border-[var(--color-gold)] bg-[var(--color-gold)]"
                          : "border-[var(--color-border)]"
                      }`}
                    />
                    <span className="font-medium text-sm text-[var(--color-text)]">{p.label}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] ml-5">
                    {p.features.join(" · ")}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom domain — growth+ only */}
          {plan !== "starter" && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                Custom Domain <span className="text-[var(--color-text-muted)]">(optional)</span>
              </label>
              <input
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="crm.acme.com"
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
              />
            </div>
          )}

          {/* Primary color */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-xl border border-[var(--color-border)] cursor-pointer"
              />
              <span className="text-sm font-mono text-[var(--color-text-muted)]">{primaryColor}</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 text-sm">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-[var(--color-navy)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Tenant"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export function TenantManager() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tenants", { credentials: "include" });
      const data = await res.json();
      setTenants(data.tenants ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  const suspendTenant = async (tenant: Tenant) => {
    await fetch(`/api/admin/tenants/${tenant.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isActive: !tenant.isActive }),
    });
    fetchTenants();
  };

  // Stats
  const totalActive = tenants.filter((t) => t.isActive).length;
  const growthCount = tenants.filter((t) => t.plan === "growth").length;
  const enterpriseCount = tenants.filter((t) => t.plan === "enterprise").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-[var(--color-text)]">
            Tenant Management
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Manage multi-tenant portals for agencies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTenants}
            className="w-9 h-9 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-navy)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> Add Tenant
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Tenants", value: tenants.length, icon: Building2 },
          { label: "Active", value: totalActive, icon: CheckCircle },
          { label: "Growth Plan", value: growthCount, icon: Users },
          { label: "Enterprise Plan", value: enterpriseCount, icon: Shield },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
          >
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-1">
              <Icon size={14} />
              <span className="text-xs">{label}</span>
            </div>
            <p className="font-bold text-2xl text-[var(--color-text)]">{value}</p>
          </div>
        ))}
      </div>

      {/* Tenant grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 h-52 animate-pulse"
            />
          ))}
        </div>
      ) : tenants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-16 text-center">
          <Building2 size={40} className="mx-auto text-[var(--color-text-muted)] mb-4" />
          <h3 className="font-semibold text-[var(--color-text)] mb-2">No tenants yet</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Register your first tenant to get started
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-navy)] text-white text-sm font-medium"
          >
            <Plus size={16} /> Add First Tenant
          </button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {tenants.map((t) => (
              <TenantCard
                key={t.slug}
                tenant={t}
                onSelect={setSelectedTenant}
                onSuspend={suspendTenant}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <AddTenantModal
            onClose={() => setShowAdd(false)}
            onCreated={fetchTenants}
          />
        )}
      </AnimatePresence>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedTenant && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setSelectedTenant(null)}
            />
            <TenantDetailPanel
              tenant={selectedTenant}
              onClose={() => setSelectedTenant(null)}
              onUpdate={() => {
                fetchTenants();
                setSelectedTenant(null);
              }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
