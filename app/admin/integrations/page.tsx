"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  MessageSquare,
  Send,
  BarChart2,
  TrendingUp,
  Briefcase,
  Zap,
  Settings,
  Workflow,
  Mail,
  Calendar,
  CreditCard,
  Layers,
  Webhook,
  ShoppingBag,
  ShoppingCart,
  Cloud,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";

const SITE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://kvlbusinesssolutions.com";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ConnectionStatus = "connected" | "not_connected" | "error" | "coming_soon";

interface ConfigField {
  key: string;
  label: string;
  type: "text" | "password" | "url";
  placeholder?: string;
}

interface IntegrationDef {
  slug: string;
  name: string;
  category: string;
  description: string;
  Icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  configFields: ConfigField[];
  events?: string[];
  inboundUrl?: string;
  docsUrl?: string;
  note?: string;
  testable?: boolean;
}

// ─── Integration Definitions ───────────────────────────────────────────────────

const INTEGRATIONS: IntegrationDef[] = [
  // Communication
  {
    slug: "whatsapp",
    name: "WhatsApp Business",
    category: "Communication",
    description: "Send order updates, support replies, and campaigns via WhatsApp.",
    Icon: Phone,
    iconBg: "#25D36615",
    iconColor: "#25D366",
    configFields: [
      { key: "WHATSAPP_TOKEN", label: "Access Token", type: "password", placeholder: "EAABxxxx..." },
      { key: "WHATSAPP_PHONE_ID", label: "Phone Number ID", type: "text", placeholder: "1234567890" },
    ],
    events: ["new_order", "new_lead", "payment_received", "new_ticket"],
    testable: true,
    docsUrl: "https://developers.facebook.com/docs/whatsapp",
  },
  {
    slug: "slack",
    name: "Slack",
    category: "Communication",
    description: "Receive order and lead notifications in your Slack workspace.",
    Icon: MessageSquare,
    iconBg: "#4A154B15",
    iconColor: "#4A154B",
    configFields: [
      { key: "SLACK_WEBHOOK_URL", label: "Webhook URL", type: "url", placeholder: "https://hooks.slack.com/services/..." },
    ],
    events: ["new_order", "new_lead", "payment_received", "new_ticket", "ticket_closed"],
    testable: true,
    docsUrl: "https://api.slack.com/messaging/webhooks",
  },
  {
    slug: "telegram",
    name: "Telegram",
    category: "Communication",
    description: "Receive alerts via Telegram bot.",
    Icon: Send,
    iconBg: "#2CA5E015",
    iconColor: "#2CA5E0",
    configFields: [
      { key: "TELEGRAM_BOT_TOKEN", label: "Bot Token", type: "password", placeholder: "1234567890:AAFxx..." },
      { key: "TELEGRAM_CHAT_ID", label: "Chat ID", type: "text", placeholder: "-100xxxxxxxx" },
    ],
    events: ["new_order", "new_lead", "payment_received", "new_ticket"],
    testable: true,
    docsUrl: "https://core.telegram.org/bots",
  },

  // Advertising
  {
    slug: "meta-ads",
    name: "Meta Ads",
    category: "Advertising",
    description: "Track Facebook & Instagram ad performance. View spend, clicks, ROAS.",
    Icon: BarChart2,
    iconBg: "#1877F215",
    iconColor: "#1877F2",
    configFields: [
      { key: "META_ACCESS_TOKEN", label: "Access Token", type: "password", placeholder: "EAABxxxx..." },
      { key: "META_AD_ACCOUNT_ID", label: "Ad Account ID", type: "text", placeholder: "act_123456789" },
    ],
    events: [],
    testable: true,
    docsUrl: "https://developers.facebook.com/docs/marketing-apis",
  },
  {
    slug: "google-ads",
    name: "Google Ads",
    category: "Advertising",
    description: "Track ad conversions and ROI from Google Ads campaigns.",
    Icon: TrendingUp,
    iconBg: "#EA433515",
    iconColor: "#EA4335",
    configFields: [
      { key: "GOOGLE_ADS_CUSTOMER_ID", label: "Customer ID", type: "text", placeholder: "123-456-7890" },
      { key: "GOOGLE_ADS_DEVELOPER_TOKEN", label: "Developer Token", type: "password", placeholder: "ABCDEFxxxx" },
      { key: "GOOGLE_ADS_ACCESS_TOKEN", label: "Access Token", type: "password", placeholder: "ya29.xxxx" },
    ],
    events: [],
    testable: true,
    docsUrl: "https://developers.google.com/google-ads/api/docs",
  },
  {
    slug: "linkedin",
    name: "LinkedIn Ads",
    category: "Advertising",
    description: "Monitor LinkedIn ad performance and organization follower growth.",
    Icon: Briefcase,
    iconBg: "#0A66C215",
    iconColor: "#0A66C2",
    configFields: [
      { key: "LINKEDIN_ACCESS_TOKEN", label: "Access Token", type: "password", placeholder: "AQVxxx..." },
      { key: "LINKEDIN_ORG_ID", label: "Organization ID", type: "text", placeholder: "123456789" },
    ],
    events: [],
    testable: true,
    docsUrl: "https://learn.microsoft.com/en-us/linkedin/marketing/",
  },

  // Automation
  {
    slug: "zapier",
    name: "Zapier",
    category: "Automation",
    description: "Connect KVL TECH to 5000+ apps via Zapier Zaps.",
    Icon: Zap,
    iconBg: "#FF4A0015",
    iconColor: "#FF4A00",
    configFields: [
      { key: "ZAPIER_WEBHOOK_URL", label: "Outbound Webhook URL", type: "url", placeholder: "https://hooks.zapier.com/..." },
      { key: "ZAPIER_SECRET", label: "Signature Secret (optional)", type: "password", placeholder: "mysecret" },
    ],
    events: ["new_order", "new_lead", "payment_received", "order_delivered", "new_ticket", "ticket_closed"],
    inboundUrl: `${SITE_URL}/api/webhooks/zapier`,
    testable: true,
    docsUrl: "https://zapier.com/apps/webhook/integrations",
  },
  {
    slug: "make",
    name: "Make (Integromat)",
    category: "Automation",
    description: "Build powerful automation scenarios with Make.",
    Icon: Settings,
    iconBg: "#6D00CC15",
    iconColor: "#6D00CC",
    configFields: [
      { key: "MAKE_WEBHOOK_URL", label: "Webhook URL", type: "url", placeholder: "https://hook.eu1.make.com/..." },
    ],
    events: ["new_order", "new_lead", "payment_received", "order_delivered", "new_ticket", "ticket_closed"],
    testable: true,
    docsUrl: "https://www.make.com/en/help/tools/webhooks",
  },
  {
    slug: "n8n",
    name: "n8n",
    category: "Automation",
    description: "Self-hosted automation platform. Use our webhook events as triggers.",
    Icon: Workflow,
    iconBg: "#EA580C15",
    iconColor: "#EA580C",
    configFields: [
      { key: "N8N_WEBHOOK_URL", label: "Webhook URL", type: "url", placeholder: "https://your-n8n.com/webhook/..." },
      { key: "N8N_BASIC_AUTH_USER", label: "Basic Auth User (optional)", type: "text", placeholder: "admin" },
      { key: "N8N_BASIC_AUTH_PASS", label: "Basic Auth Password (optional)", type: "password", placeholder: "" },
    ],
    events: ["new_order", "new_lead", "payment_received", "order_delivered", "new_ticket", "ticket_closed"],
    inboundUrl: `${SITE_URL}/api/webhooks/n8n`,
    testable: true,
    docsUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/",
  },

  // Google Workspace
  {
    slug: "google-workspace",
    name: "Gmail",
    category: "Google Workspace",
    description: "Send transactional emails via Gmail API using OAuth.",
    Icon: Mail,
    iconBg: "#EA433515",
    iconColor: "#EA4335",
    configFields: [
      { key: "GOOGLE_GMAIL_ACCESS_TOKEN", label: "Gmail Access Token", type: "password", placeholder: "ya29.xxxx" },
    ],
    events: ["new_order", "new_lead", "payment_received"],
    testable: true,
    note: "Requires Google Cloud OAuth 2.0 setup with Gmail API enabled",
    docsUrl: "https://developers.google.com/gmail/api",
  },
  {
    slug: "google-calendar",
    name: "Google Calendar",
    category: "Google Workspace",
    description: "Syncs with meeting bookings to create calendar events automatically.",
    Icon: Calendar,
    iconBg: "#1A73E815",
    iconColor: "#1A73E8",
    configFields: [
      { key: "GOOGLE_GMAIL_ACCESS_TOKEN", label: "Google Access Token (shared)", type: "password", placeholder: "ya29.xxxx" },
    ],
    events: [],
    note: "Uses same OAuth token as Gmail. Configure Gmail first.",
    docsUrl: "https://developers.google.com/calendar/api",
  },

  // Payments (status only)
  {
    slug: "razorpay",
    name: "Razorpay",
    category: "Payments",
    description: "Accept INR payments. Connected via RAZORPAY_KEY_ID env var.",
    Icon: CreditCard,
    iconBg: "#3395FF15",
    iconColor: "#3395FF",
    configFields: [],
    note: "Configure via RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env",
    docsUrl: "https://razorpay.com/docs/",
  },
  {
    slug: "stripe",
    name: "Stripe",
    category: "Payments",
    description: "Accept international payments in 135+ currencies.",
    Icon: Layers,
    iconBg: "#635BFF15",
    iconColor: "#635BFF",
    configFields: [],
    note: "Configure via STRIPE_SECRET_KEY in .env",
    docsUrl: "https://stripe.com/docs",
  },

  // Webhooks
  {
    slug: "custom-webhooks",
    name: "Custom Webhooks",
    category: "Webhooks",
    description: "Send events to any HTTP endpoint via custom webhooks.",
    Icon: Webhook,
    iconBg: "#6B728015",
    iconColor: "#6B7280",
    configFields: [],
    note: "Manage custom webhook endpoints in Admin → Webhooks",
    docsUrl: "/admin/webhooks",
  },

  // Coming Soon
  {
    slug: "hubspot",
    name: "HubSpot",
    category: "CRM",
    description: "Sync leads and contacts with HubSpot CRM.",
    Icon: TrendingUp,
    iconBg: "#FF7A5915",
    iconColor: "#FF7A59",
    configFields: [],
  },
  {
    slug: "salesforce",
    name: "Salesforce",
    category: "CRM",
    description: "Enterprise CRM integration for leads and opportunities.",
    Icon: Cloud,
    iconBg: "#00A1E015",
    iconColor: "#00A1E0",
    configFields: [],
  },
  {
    slug: "shopify",
    name: "Shopify",
    category: "E-commerce",
    description: "Sync Shopify store orders and customers.",
    Icon: ShoppingBag,
    iconBg: "#96BF4815",
    iconColor: "#96BF48",
    configFields: [],
  },
  {
    slug: "woocommerce",
    name: "WooCommerce",
    category: "E-commerce",
    description: "Sync WooCommerce orders and product catalog.",
    Icon: ShoppingCart,
    iconBg: "#7F54B315",
    iconColor: "#7F54B3",
    configFields: [],
  },
];

// Slugs that are "coming soon"
const COMING_SOON = new Set(["hubspot", "salesforce", "shopify", "woocommerce"]);

// Slugs where connection is determined by env var presence (status-only)
const ENV_CONNECTED: Record<string, string> = {
  razorpay: "RAZORPAY_KEY_ID",
  stripe: "STRIPE_SECRET_KEY",
};

const ALL_EVENTS = [
  { key: "new_order", label: "New Order" },
  { key: "new_lead", label: "New Lead" },
  { key: "payment_received", label: "Payment Received" },
  { key: "order_delivered", label: "Order Delivered" },
  { key: "new_ticket", label: "New Ticket" },
  { key: "ticket_closed", label: "Ticket Closed" },
];

const CATEGORIES = ["All", "Communication", "Advertising", "Automation", "Google Workspace", "Payments", "Webhooks", "CRM", "E-commerce"];

// ─── Subcomponents ─────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: ConnectionStatus }) {
  const map: Record<ConnectionStatus, { color: string; label: string }> = {
    connected: { color: "#16A34A", label: "Connected" },
    not_connected: { color: "#9CA3AF", label: "Not Connected" },
    error: { color: "#EF4444", label: "Error" },
    coming_soon: { color: "#9CA3AF", label: "Coming Soon" },
  };
  const { color, label } = map[status];
  return (
    <span className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      {label}
    </span>
  );
}

interface SavedConfig {
  enabled: boolean;
  config: Record<string, string>;
  events: string[];
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function IntegrationsMarketplace() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<IntegrationDef | null>(null);
  const [saved, setSaved] = useState<Record<string, SavedConfig>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [enabledToggle, setEnabledToggle] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [adTab, setAdTab] = useState<"meta-ads" | "google-ads" | "linkedin">("meta-ads");
  const [adStats, setAdStats] = useState<Record<string, unknown> | null>(null);
  const [adLoading, setAdLoading] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [adLastSync, setAdLastSync] = useState<Record<string, Date | null>>({});

  // Load saved configs on mount
  useEffect(() => {
    fetch("/api/admin/integrations/config", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { configs?: Array<{ slug: string; enabled: boolean; config: Record<string, string>; events: string[] }> }) => {
        if (data.configs) {
          const map: Record<string, SavedConfig> = {};
          data.configs.forEach((c) => {
            map[c.slug] = { enabled: c.enabled, config: c.config, events: c.events };
          });
          setSaved(map);
        }
      })
      .catch(() => null);
  }, []);

  function getStatus(integration: IntegrationDef): ConnectionStatus {
    if (COMING_SOON.has(integration.slug)) return "coming_soon";
    if (ENV_CONNECTED[integration.slug]) {
      // We can only guess from saved config; assume "not_connected" until API returns info
      return saved[integration.slug]?.enabled ? "connected" : "not_connected";
    }
    const s = saved[integration.slug];
    if (!s) return "not_connected";
    if (!s.enabled) return "not_connected";
    // Check if required fields have values
    const required = integration.configFields.filter((f) => !f.placeholder?.includes("optional"));
    const hasAll = required.every((f) => s.config?.[f.key] && s.config[f.key] !== "");
    return hasAll ? "connected" : "not_connected";
  }

  const connectedCount = INTEGRATIONS.filter((i) => getStatus(i) === "connected").length;

  const filtered = useMemo(() => {
    return INTEGRATIONS.filter((i) => {
      const catMatch = category === "All" || i.category === category;
      const q = search.toLowerCase();
      const searchMatch =
        !q ||
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q);
      return catMatch && searchMatch;
    });
  }, [category, search]);

  function openDrawer(integration: IntegrationDef) {
    if (COMING_SOON.has(integration.slug)) return;
    setDrawer(integration);
    setTestResult(null);
    const s = saved[integration.slug];
    setEnabledToggle(s?.enabled ?? false);
    setSelectedEvents(s?.events ?? integration.events ?? []);
    const vals: Record<string, string> = {};
    integration.configFields.forEach((f) => {
      vals[f.key] = s?.config?.[f.key] ?? "";
    });
    setFieldValues(vals);
  }

  async function handleSave() {
    if (!drawer) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/integrations/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          slug: drawer.slug,
          enabled: enabledToggle,
          config: fieldValues,
          events: selectedEvents,
        }),
      });
      if (res.ok) {
        setSaved((prev) => ({
          ...prev,
          [drawer.slug]: { enabled: enabledToggle, config: { ...fieldValues }, events: selectedEvents },
        }));
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect() {
    if (!drawer) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/integrations/config?slug=${drawer.slug}`, {
        method: "DELETE",
        credentials: "include",
      });
      setSaved((prev) => {
        const n = { ...prev };
        delete n[drawer.slug];
        return n;
      });
      setEnabledToggle(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    if (!drawer) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/integrations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ slug: drawer.slug }),
      });
      const data = await res.json() as { success?: boolean; message?: string; error?: string };
      setTestResult({ success: data.success ?? false, message: data.message || data.error || "Done" });
    } catch {
      setTestResult({ success: false, message: "Network error" });
    } finally {
      setTesting(false);
    }
  }

  async function fetchAdStats(tab: "meta-ads" | "google-ads" | "linkedin") {
    setAdLoading(true);
    setAdError(null);
    setAdStats(null);
    const urlMap: Record<string, string> = {
      "meta-ads": "/api/admin/integrations/meta-ads",
      "google-ads": "/api/admin/integrations/google-ads",
      linkedin: "/api/admin/integrations/linkedin",
    };
    try {
      const res = await fetch(urlMap[tab], { credentials: "include" });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) {
        setAdError((data.error as string) || "Failed to fetch stats");
      } else {
        setAdStats(data);
        setAdLastSync((prev) => ({ ...prev, [tab]: new Date() }));
      }
    } catch {
      setAdError("Network error");
    } finally {
      setAdLoading(false);
    }
  }

  const connectedAdSlugs = ["meta-ads", "google-ads", "linkedin"].filter(
    (s) => getStatus(INTEGRATIONS.find((i) => i.slug === s)!) === "connected"
  );
  const showAdPanel = connectedAdSlugs.length > 0;

  function timeSince(d: Date | null): string {
    if (!d) return "Never";
    const secs = Math.floor((Date.now() - d.getTime()) / 1000);
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ago`;
  }

  return (
    <>
      <AdminTopbar title="Integrations & Marketplace" />
      <div className="p-6 space-y-6 max-w-[1400px]">

        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)]/50"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-500/10 text-green-600">
              Connected: {connectedCount}
            </span>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                category === cat
                  ? "bg-[var(--color-navy)] text-white shadow"
                  : "border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-12">No integrations found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((integration, i) => {
              const status = getStatus(integration);
              const comingSoon = status === "coming_soon";
              const { Icon } = integration;
              return (
                <motion.div
                  key={integration.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`card p-5 flex flex-col gap-3 transition-all ${comingSoon ? "opacity-60 cursor-default" : "hover:shadow-[var(--shadow-card-hover)] cursor-pointer"}`}
                  onClick={() => !comingSoon && openDrawer(integration)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: integration.iconBg }}
                      >
                        <Icon size={18} style={{ color: integration.iconColor }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[var(--color-text)] leading-tight">{integration.name}</p>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                          style={{
                            color: integration.iconColor,
                            borderColor: integration.iconColor + "40",
                            background: integration.iconBg,
                          }}
                        >
                          {integration.category}
                        </span>
                      </div>
                    </div>
                    {comingSoon ? (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500 shrink-0">
                        Soon
                      </span>
                    ) : (
                      <StatusDot status={status} />
                    )}
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed flex-1">
                    {integration.description}
                  </p>

                  {!comingSoon && (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={(e) => { e.stopPropagation(); openDrawer(integration); }}
                        className="text-xs font-semibold text-[var(--color-gold)] hover:underline"
                      >
                        Configure
                      </button>
                      {status === "connected" && (
                        <CheckCircle2 size={14} className="text-green-500" />
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Advertising Stats Panel */}
        {showAdPanel && (
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-[var(--color-text)]">Advertising Stats</h3>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {connectedAdSlugs.map((slug) => {
                const def = INTEGRATIONS.find((i) => i.slug === slug)!;
                return (
                  <button
                    key={slug}
                    onClick={() => {
                      setAdTab(slug as "meta-ads" | "google-ads" | "linkedin");
                      fetchAdStats(slug as "meta-ads" | "google-ads" | "linkedin");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      adTab === slug
                        ? "bg-[var(--color-navy)] text-white"
                        : "border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)]"
                    }`}
                  >
                    <def.Icon size={11} />
                    {def.name}
                  </button>
                );
              })}
              <button
                onClick={() => fetchAdStats(adTab)}
                disabled={adLoading}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)] transition-all disabled:opacity-50"
              >
                <RefreshCw size={11} className={adLoading ? "animate-spin" : ""} />
                Sync Now
              </button>
            </div>

            <p className="text-[10px] text-[var(--color-text-muted)]">
              Last synced: {timeSince(adLastSync[adTab] ?? null)}
            </p>

            {adError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500">
                <AlertCircle size={13} />
                {adError}
              </div>
            )}

            {adLoading && (
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                <Loader2 size={13} className="animate-spin" /> Fetching stats...
              </div>
            )}

            {adStats && !adLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(
                  (adStats.stats as Record<string, number>) || {}
                ).map(([key, val]) => (
                  <div key={key} className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                    <p className="text-[10px] text-[var(--color-text-muted)] capitalize mb-1">
                      {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
                    </p>
                    <p className="text-sm font-bold text-[var(--color-text)]">
                      {typeof val === "number" && key.toLowerCase().includes("spend")
                        ? `$${val.toFixed(2)}`
                        : typeof val === "number" && (key.toLowerCase().includes("ctr") || key.toLowerCase().includes("roas"))
                        ? val.toFixed(2)
                        : typeof val === "number"
                        ? val.toLocaleString()
                        : String(val)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Config Drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setDrawer(null)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[420px] bg-[var(--color-bg)] border-l border-[var(--color-border)] flex flex-col shadow-2xl overflow-y-auto"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)] shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: drawer.iconBg }}
                  >
                    <drawer.Icon size={16} style={{ color: drawer.iconColor }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[var(--color-text)]">{drawer.name}</p>
                    <StatusDot status={getStatus(drawer)} />
                  </div>
                </div>
                <button
                  onClick={() => setDrawer(null)}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 p-5 space-y-5">

                {/* Enable toggle */}
                {drawer.configFields.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--color-text)]">Enable Integration</span>
                    <button
                      onClick={() => setEnabledToggle((v) => !v)}
                      className={`relative w-11 h-6 rounded-full transition-all ${enabledToggle ? "bg-green-500" : "bg-[var(--color-border)]"}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabledToggle ? "translate-x-5" : ""}`}
                      />
                    </button>
                  </div>
                )}

                {/* Note */}
                {drawer.note && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <AlertCircle size={13} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-600">{drawer.note}</p>
                  </div>
                )}

                {/* Config fields */}
                {drawer.configFields.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Configuration
                    </p>
                    {drawer.configFields.map((field) => {
                      const isSecret = field.type === "password";
                      const visible = showSecrets[field.key];
                      return (
                        <div key={field.key}>
                          <label className="text-xs font-medium text-[var(--color-text-muted)] block mb-1.5">
                            {field.label}
                          </label>
                          <div className="relative">
                            <input
                              type={isSecret && !visible ? "password" : "text"}
                              value={fieldValues[field.key] ?? ""}
                              onChange={(e) =>
                                setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                              }
                              placeholder={field.placeholder}
                              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)]/60 pr-10"
                            />
                            {isSecret && (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowSecrets((prev) => ({ ...prev, [field.key]: !prev[field.key] }))
                                }
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                              >
                                {visible ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Inbound webhook URL */}
                {drawer.inboundUrl && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Inbound Webhook URL
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-[11px] px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] truncate">
                        {drawer.inboundUrl}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(drawer.inboundUrl!)}
                        className="shrink-0 p-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
                        title="Copy"
                      >
                        <ExternalLink size={12} />
                      </button>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      Use this URL as an endpoint in your integration platform
                    </p>
                  </div>
                )}

                {/* Events */}
                {(drawer.events ?? []).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Forward Events
                    </p>
                    <div className="space-y-1.5">
                      {ALL_EVENTS.filter((e) => (drawer.events ?? []).includes(e.key)).map((ev) => (
                        <label key={ev.key} className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedEvents.includes(ev.key)}
                            onChange={(e) =>
                              setSelectedEvents((prev) =>
                                e.target.checked ? [...prev, ev.key] : prev.filter((x) => x !== ev.key)
                              )
                            }
                            className="w-3.5 h-3.5 rounded accent-[var(--color-gold)]"
                          />
                          <span className="text-xs text-[var(--color-text)] group-hover:text-[var(--color-gold)] transition-colors">
                            {ev.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Test result */}
                {testResult && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-xl text-xs ${
                      testResult.success
                        ? "bg-green-500/10 border border-green-500/20 text-green-600"
                        : "bg-red-500/10 border border-red-500/20 text-red-500"
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 size={13} className="shrink-0" />
                    ) : (
                      <XCircle size={13} className="shrink-0" />
                    )}
                    {testResult.message}
                  </div>
                )}

                {/* Docs link */}
                {drawer.docsUrl && (
                  <a
                    href={drawer.docsUrl}
                    target={drawer.docsUrl.startsWith("/") ? "_self" : "_blank"}
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[var(--color-gold)] hover:underline"
                  >
                    <ExternalLink size={11} />
                    View Documentation
                  </a>
                )}
              </div>

              {/* Drawer footer */}
              <div className="p-5 border-t border-[var(--color-border)] space-y-2 shrink-0">
                <div className="flex gap-2">
                  {drawer.testable && (
                    <button
                      onClick={handleTest}
                      disabled={testing}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-blue-400 hover:text-blue-500 transition-all disabled:opacity-50"
                    >
                      {testing ? <Loader2 size={12} className="animate-spin" /> : null}
                      Test Connection
                    </button>
                  )}
                  {drawer.configFields.length > 0 && (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-[var(--color-gold)] text-[var(--color-navy)] hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={12} className="animate-spin" /> : null}
                      Save
                    </button>
                  )}
                </div>

                {saved[drawer.slug]?.enabled && (
                  <button
                    onClick={handleDisconnect}
                    disabled={saving}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold border border-red-500/40 text-red-500 hover:bg-red-500/5 transition-all disabled:opacity-50"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
