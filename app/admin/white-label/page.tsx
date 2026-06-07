"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette, Globe, Eye, Save, Upload, CheckCircle2, Loader2,
  Monitor, Mail, AlertCircle,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";

type Tab = "branding" | "domain" | "preview";

const INPUT =
  "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all";
const LABEL = "block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5";

interface Config {
  companyName: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain: string;
  emailFromName: string;
  emailFromAddr: string;
  footerText: string;
  supportEmail: string;
}

const DEFAULT_CONFIG: Config = {
  companyName: "KVL TECH",
  logo: "",
  favicon: "",
  primaryColor: "#C9A227",
  secondaryColor: "#0B1437",
  customDomain: "",
  emailFromName: "",
  emailFromAddr: "",
  footerText: "",
  supportEmail: "",
};

export default function WhiteLabelPage() {
  const [tab, setTab] = useState<Tab>("branding");
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/white-label", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.config) {
          setConfig({
            companyName: d.config.companyName || DEFAULT_CONFIG.companyName,
            logo: d.config.logo || "",
            favicon: d.config.favicon || "",
            primaryColor: d.config.primaryColor || DEFAULT_CONFIG.primaryColor,
            secondaryColor: d.config.secondaryColor || DEFAULT_CONFIG.secondaryColor,
            customDomain: d.config.customDomain || "",
            emailFromName: d.config.emailFromName || "",
            emailFromAddr: d.config.emailFromAddr || "",
            footerText: d.config.footerText || "",
            supportEmail: d.config.supportEmail || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/white-label", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    }
    setSaving(false);
  };

  const set = (key: keyof Config) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setConfig((c) => ({ ...c, [key]: e.target.value }));

  const TABS: { id: Tab; label: string; icon: typeof Palette }[] = [
    { id: "branding", label: "Branding", icon: Palette },
    { id: "domain", label: "Domain & Email", icon: Globe },
    { id: "preview", label: "Client Portal Preview", icon: Eye },
  ];

  if (loading) {
    return (
      <>
        <AdminTopbar title="White Label Configuration" />
        <div className="flex justify-center py-24">
          <Loader2 size={28} className="animate-spin text-[var(--color-gold)]" />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminTopbar title="White Label Configuration" />
      <div className="p-6 max-w-6xl space-y-6">

        {/* Tab bar */}
        <div className="card p-2 flex gap-1 w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === id
                  ? "bg-[var(--color-navy)] text-white shadow"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>

            {/* ── BRANDING TAB ── */}
            {tab === "branding" && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="card p-7 space-y-6">
                  <div>
                    <h2 className="font-display font-bold text-lg text-[var(--color-text)]">Brand Identity</h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Configure your company&apos;s visual identity</p>
                  </div>

                  <div>
                    <label className={LABEL}>Company Name</label>
                    <input value={config.companyName} onChange={set("companyName")} className={INPUT} placeholder="Your Company Name" />
                  </div>

                  <div>
                    <label className={LABEL}>Logo URL</label>
                    <div className="flex gap-2">
                      <input value={config.logo} onChange={set("logo")} className={INPUT} placeholder="https://..." />
                    </div>
                    {config.logo && (
                      <div className="mt-2 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={config.logo} alt="Logo preview" className="max-h-12 max-w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    )}
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                      <Upload size={10} className="inline mr-1" />
                      Upload via Settings → Upload, then paste URL here
                    </p>
                  </div>

                  <div>
                    <label className={LABEL}>Favicon URL</label>
                    <input value={config.favicon} onChange={set("favicon")} className={INPUT} placeholder="https://..." />
                    {config.favicon && (
                      <div className="mt-2 flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={config.favicon} alt="Favicon" className="w-6 h-6 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        <span className="text-xs text-[var(--color-text-muted)]">Favicon preview</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Primary Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.primaryColor}
                          onChange={set("primaryColor")}
                          className="w-12 h-11 rounded-xl border border-[var(--color-border)] cursor-pointer p-0.5 bg-transparent"
                        />
                        <input
                          value={config.primaryColor}
                          onChange={set("primaryColor")}
                          className={INPUT}
                          maxLength={7}
                          placeholder="#C9A227"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={LABEL}>Secondary Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.secondaryColor}
                          onChange={set("secondaryColor")}
                          className="w-12 h-11 rounded-xl border border-[var(--color-border)] cursor-pointer p-0.5 bg-transparent"
                        />
                        <input
                          value={config.secondaryColor}
                          onChange={set("secondaryColor")}
                          className={INPUT}
                          maxLength={7}
                          placeholder="#0B1437"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Preview Panel */}
                <div className="card p-7">
                  <div className="flex items-center gap-2 mb-4">
                    <Monitor size={16} className="text-[var(--color-gold)]" />
                    <h3 className="font-semibold text-sm text-[var(--color-text)]">Live Preview</h3>
                  </div>

                  {/* Mini mockup */}
                  <div className="rounded-xl overflow-hidden border border-[var(--color-border)] shadow-lg">
                    {/* Nav bar */}
                    <div
                      className="flex items-center justify-between px-4 py-3"
                      style={{ background: config.secondaryColor }}
                    >
                      <div className="flex items-center gap-2">
                        {config.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={config.logo} alt="Logo" className="h-6 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <span className="font-bold text-sm" style={{ color: config.primaryColor }}>
                            {config.companyName || "Company Name"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full" style={{ background: config.primaryColor }} />
                      </div>
                    </div>

                    {/* Content area */}
                    <div className="p-4 bg-white dark:bg-[#0A0A0F] space-y-3">
                      <div className="h-2 rounded-full w-3/4" style={{ background: config.primaryColor + "40" }} />
                      <div className="h-2 rounded-full w-1/2 bg-gray-200 dark:bg-gray-700" />
                      <div className="mt-3 p-3 rounded-xl border" style={{ borderColor: config.primaryColor + "40", background: config.primaryColor + "08" }}>
                        <div className="h-2 rounded-full w-full mb-2" style={{ background: config.primaryColor + "60" }} />
                        <div className="h-2 rounded-full w-2/3" style={{ background: config.primaryColor + "40" }} />
                      </div>
                      <button
                        className="px-4 py-2 rounded-lg text-xs font-bold text-white w-full"
                        style={{ background: config.primaryColor }}
                      >
                        Primary Action
                      </button>
                    </div>

                    {/* Footer */}
                    <div
                      className="px-4 py-2 text-center text-[10px]"
                      style={{ background: config.secondaryColor + "CC", color: config.primaryColor }}
                    >
                      {config.footerText || `© ${new Date().getFullYear()} ${config.companyName || "Company"}`}
                    </div>
                  </div>

                  {/* Color swatches */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border border-[var(--color-border)]" style={{ background: config.primaryColor }} />
                      <span className="text-xs text-[var(--color-text-muted)] font-mono">{config.primaryColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border border-[var(--color-border)]" style={{ background: config.secondaryColor }} />
                      <span className="text-xs text-[var(--color-text-muted)] font-mono">{config.secondaryColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── DOMAIN & EMAIL TAB ── */}
            {tab === "domain" && (
              <div className="card p-7 max-w-2xl space-y-6">
                <div>
                  <h2 className="font-display font-bold text-lg text-[var(--color-text)]">Domain & Email Settings</h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Configure custom domain and email branding</p>
                </div>

                <div>
                  <label className={LABEL}>Custom Domain</label>
                  <input value={config.customDomain} onChange={set("customDomain")} className={INPUT} placeholder="portal.yourclient.com" />
                  <div className="mt-3 p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-2">
                    <p className="text-xs font-semibold text-[var(--color-text)]">DNS Setup Instructions</p>
                    <ol className="text-xs text-[var(--color-text-muted)] space-y-1 list-decimal list-inside">
                      <li>Add a CNAME record: <code className="bg-black/10 px-1 rounded font-mono">{config.customDomain || "portal.yourdomain.com"}</code> → <code className="bg-black/10 px-1 rounded font-mono">kvlbusinesssolutions.com</code></li>
                      <li>Wait for DNS propagation (up to 24 hours)</li>
                      <li>Contact support to enable SSL for your domain</li>
                    </ol>
                  </div>
                </div>

                <div className="border-t border-[var(--color-border)] pt-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail size={15} className="text-[var(--color-gold)]" />
                    <p className="text-sm font-semibold text-[var(--color-text)]">Email Branding</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Email From Name</label>
                      <input value={config.emailFromName} onChange={set("emailFromName")} className={INPUT} placeholder="Your Company Name" />
                    </div>
                    <div>
                      <label className={LABEL}>Email From Address</label>
                      <input type="email" value={config.emailFromAddr} onChange={set("emailFromAddr")} className={INPUT} placeholder="noreply@yourdomain.com" />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL}>Support Email</label>
                    <input type="email" value={config.supportEmail} onChange={set("supportEmail")} className={INPUT} placeholder="support@yourdomain.com" />
                  </div>

                  <div>
                    <label className={LABEL}>Footer Text</label>
                    <input value={config.footerText} onChange={set("footerText")} className={INPUT} placeholder={`© ${new Date().getFullYear()} ${config.companyName}. All rights reserved.`} />
                  </div>
                </div>
              </div>
            )}

            {/* ── PREVIEW TAB ── */}
            {tab === "preview" && (
              <div className="space-y-4">
                <div className="card p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Eye size={18} className="text-[var(--color-gold)]" />
                    <div>
                      <h2 className="font-semibold text-[var(--color-text)]">Client Portal Preview</h2>
                      <p className="text-xs text-[var(--color-text-muted)]">This is how your clients will see the portal</p>
                    </div>
                  </div>

                  {/* Simulated browser chrome */}
                  <div className="rounded-xl overflow-hidden border border-[var(--color-border)] shadow-xl max-w-3xl mx-auto">
                    {/* Browser bar */}
                    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2.5 flex items-center gap-2 border-b border-[var(--color-border)]">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 mx-4 bg-white dark:bg-gray-700 rounded-lg px-3 py-1 text-xs text-[var(--color-text-muted)] font-mono">
                        {config.customDomain ? `https://${config.customDomain}/portal` : "https://portal.kvlbusinesssolutions.com"}
                      </div>
                    </div>

                    {/* Portal header */}
                    <div style={{ background: config.secondaryColor }} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {config.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={config.logo} alt="Logo" className="h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <span className="font-bold text-lg" style={{ color: config.primaryColor }}>
                            {config.companyName}
                          </span>
                        )}
                      </div>
                      <nav className="flex items-center gap-4">
                        {["Dashboard", "Orders", "Support"].map((item) => (
                          <span key={item} className="text-sm opacity-70 cursor-pointer hover:opacity-100 transition-opacity" style={{ color: config.primaryColor }}>
                            {item}
                          </span>
                        ))}
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: config.primaryColor, color: config.secondaryColor }}>
                          JD
                        </div>
                      </nav>
                    </div>

                    {/* Portal content area */}
                    <div className="bg-[#F8F9FA] dark:bg-[#0A0A0F] p-6 space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        {["Active Orders", "Payments", "Support Tickets"].map((label, i) => (
                          <div key={label} className="bg-white dark:bg-[#111] rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                            <p className="text-xs text-gray-500 mb-1">{label}</p>
                            <p className="font-bold text-xl" style={{ color: i === 0 ? config.primaryColor : "#374151" }}>
                              {i === 0 ? "3" : i === 1 ? "₹42,500" : "1"}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-white dark:bg-[#111] rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">Recent Orders</p>
                          <span className="text-xs px-2 py-1 rounded-full" style={{ background: config.primaryColor + "20", color: config.primaryColor }}>
                            View All
                          </span>
                        </div>
                        {[
                          { name: "Business Website", status: "In Progress" },
                          { name: "Logo Design", status: "Delivered" },
                        ].map((order) => (
                          <div key={order.name} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                            <span className="text-xs text-gray-600 dark:text-gray-400">{order.name}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: config.primaryColor + "15", color: config.primaryColor }}>
                              {order.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 text-center text-xs" style={{ background: config.secondaryColor }}>
                      <span style={{ color: config.primaryColor + "AA" }}>
                        {config.footerText || `© ${new Date().getFullYear()} ${config.companyName}. All rights reserved.`}
                      </span>
                      {config.supportEmail && (
                        <span className="ml-3" style={{ color: config.primaryColor + "80" }}>
                          Support: {config.supportEmail}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Save bar */}
        <div className="card p-4 flex items-center justify-between">
          {error ? (
            <p className="text-sm text-red-500 flex items-center gap-2">
              <AlertCircle size={15} /> {error}
            </p>
          ) : saved ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-green-500 flex items-center gap-2">
              <CheckCircle2 size={15} /> White label configuration saved!
            </motion.p>
          ) : (
            <span />
          )}
          <button onClick={handleSave} disabled={saving} className="btn-gold flex items-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </>
  );
}
