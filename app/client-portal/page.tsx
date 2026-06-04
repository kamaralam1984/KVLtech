"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  LogIn, User, Package, CheckCircle2, Clock, Palette, Upload,
  ArrowRight, Shield, Eye, EyeOff, Zap, MessageCircle, Bell,
  Download, ExternalLink, AlertCircle, Star, X, FileText,
  ChevronDown, ChevronUp, Phone, Mail, MapPin, Send, LayoutDashboard,
  TrendingUp, Calendar, RefreshCw, Loader2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

type Tab = "overview" | "branding" | "orders" | "support";

interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  city?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  plan: string;
  status: string;
  progress: number;
  amount: number;
  deliveryEst?: string;
  deliveredAt?: string;
  liveUrl?: string;
  product: { name: string; category: string; photo: string };
  payment?: { status: string; paidAt?: string };
  review?: { rating: number };
  statusHistory: { status: string; note?: string; changedAt: string }[];
}

interface Notification {
  id: string;
  title: string;
  body: string;
  color: string;
  isRead: boolean;
  createdAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  PAYMENT_PENDING: "Payment Pending",
  PAYMENT_CONFIRMED: "Payment Confirmed",
  DESIGN_STARTED: "Design Started",
  DEVELOPMENT: "Development",
  REVIEW_TESTING: "Review & Testing",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_STEP: Record<string, number> = {
  PAYMENT_PENDING: 0,
  PAYMENT_CONFIRMED: 0,
  DESIGN_STARTED: 1,
  DEVELOPMENT: 2,
  REVIEW_TESTING: 3,
  DELIVERED: 4,
};

const STEPS = ["Payment Confirmed", "Design Started", "Development", "Review & Testing", "Delivered"];

const FAQS = [
  { q: "How do I send my logo?", a: "Send your logo in PNG or SVG format via WhatsApp +91 9942000413. Min 500×500px preferred." },
  { q: "When will my website go live?", a: "Premium plan: 1-2 days, Basic plan: 3-5 days. You will need to provide domain and hosting details to go live." },
  { q: "How do I update content after delivery?", a: "We provide an easy admin panel so you can update content yourself. Training is included." },
  { q: "What if there is an issue with my project?", a: "Premium: 90 days free support. Basic: 30 days free support. Contact us via WhatsApp or email." },
  { q: "Where should I buy domain and hosting?", a: "We recommend Hostinger or GoDaddy. We can also purchase and set it up for you if needed." },
];

const INPUT = "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all placeholder:text-[var(--color-text-muted)]";
const LABEL = "block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5";

export default function ClientPortalPage() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  // Branding
  const [branding, setBranding] = useState({
    orderId: "", companyName: "", tagline: "", primaryColor: "#C9A227",
    secondaryColor: "#0F172A", fontPreference: "", phone: "", email: "",
    address: "", website: "", logoNote: "",
  });
  const [brandingSaved, setBrandingSaved] = useState(false);
  const [brandingLoading, setBrandingLoading] = useState(false);
  const [brandingError, setBrandingError] = useState("");

  // Support
  const [ticket, setTicket] = useState({ subject: "", orderId: "", priority: "Medium", message: "" });
  const [ticketSent, setTicketSent] = useState(false);
  const [ticketNo, setTicketNo] = useState("");
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState("");

  // Rating
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ── check session on mount ──
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  // ── fetch orders ──
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const r = await fetch("/api/orders", { credentials: "include" });
      const data = await r.json();
      if (data.orders) setOrders(data.orders);
    } catch {}
    setOrdersLoading(false);
  }, []);

  // ── fetch notifications ──
  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const r = await fetch("/api/notifications", { credentials: "include" });
      const data = await r.json();
      if (data.notifications) setNotifications(data.notifications);
    } catch {}
    setNotifLoading(false);
  }, []);

  // ── load data when logged in ──
  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchNotifications();
    }
  }, [user, fetchOrders, fetchNotifications]);

  // ── pre-fill branding orderId with first active order ──
  useEffect(() => {
    const active = orders.find(o => o.status !== "DELIVERED" && o.status !== "CANCELLED");
    if (active && !branding.orderId) {
      setBranding(b => ({ ...b, orderId: active.id }));
    }
    // pre-fill ratings from existing reviews
    const rv: Record<string, number> = {};
    orders.forEach(o => { if (o.review?.rating) rv[o.id] = o.review.rating; });
    setRatings(rv);
  }, [orders]);

  // ── login ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
      });
      const data = await r.json();
      if (!r.ok) {
        setLoginError(data.error || "Login failed. Please try again.");
      } else {
        setUser(data.client);
      }
    } catch {
      setLoginError("Network error. Please try again.");
    }
    setLoginLoading(false);
  };

  // ── logout ──
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setOrders([]);
    setNotifications([]);
  };

  // ── mark all notifications read ──
  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications(n => n.map(x => ({ ...x, isRead: true })));
  };

  // ── branding submit ──
  const handleBrandingSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBrandingError("");
    setBrandingLoading(true);
    try {
      const r = await fetch("/api/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(branding),
      });
      const data = await r.json();
      if (!r.ok) {
        setBrandingError(data.error || "Submit failed.");
      } else {
        setBrandingSaved(true);
        fetchNotifications();
      }
    } catch {
      setBrandingError("Network error. Please try again.");
    }
    setBrandingLoading(false);
  };

  // ── support ticket submit ──
  const handleTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketError("");
    setTicketLoading(true);
    try {
      const r = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(ticket),
      });
      const data = await r.json();
      if (!r.ok) {
        setTicketError(data.error || "Submit failed.");
      } else {
        setTicketSent(true);
        setTicketNo(data.ticket.ticketNo);
        fetchNotifications();
      }
    } catch {
      setTicketError("Network error. Please try again.");
    }
    setTicketLoading(false);
  };

  // ── star rating submit ──
  const handleRating = async (orderId: string, rating: number) => {
    setRatings(r => ({ ...r, [orderId]: rating }));
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orderId, rating }),
    });
  };

  const unread = notifications.filter(n => !n.isRead).length;
  const activeOrders = orders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED");
  const deliveredOrders = orders.filter(o => o.status === "DELIVERED");

  const TABS: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "support", label: "Support", icon: MessageCircle },
  ];

  /* ─── INITIAL CHECK ─── */
  if (checking) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-[90vh] flex items-center justify-center bg-[var(--color-bg-secondary)]">
          <Loader2 size={32} className="text-[var(--color-gold)] animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  /* ─── LOGIN ─── */
  if (!user) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-[92vh] flex items-center justify-center bg-[var(--color-bg-secondary)]">
          <div className="max-w-md w-full mx-4 py-10">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="card p-8">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <img
                      src="/kvl-tech-logo-tight.png"
                      alt="KVL TECH"
                      className="h-10 w-auto object-contain dark:hidden"
                    />
                    <img
                      src="/kvl-tech-logo-white.png"
                      alt="KVL TECH"
                      className="h-10 w-auto object-contain hidden dark:block"
                    />
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-4 shadow-[0_0_0_8px_rgba(201,162,39,0.06)]">
                    <Shield size={30} className="text-[var(--color-gold)]" />
                  </div>
                  <h1 className="font-display font-bold text-2xl text-[var(--color-text)] mb-1">Client Portal</h1>
                  <p className="text-sm text-[var(--color-text-secondary)]">Track your project, submit branding details</p>
                </div>

                <AnimatePresence>
                  {loginError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm mb-5">
                      <AlertCircle size={15} className="shrink-0" /> {loginError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className={LABEL}>Email Address</label>
                    <input required type="email" value={loginForm.email}
                      onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="aap@company.com" className={INPUT} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Password</label>
                      <button type="button" className="text-[10px] text-[var(--color-gold)] hover:underline">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <input required type={showPass ? "text" : "password"} value={loginForm.password}
                        onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="••••••••" className={INPUT + " pr-12"} />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                        {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loginLoading}
                    className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                    {loginLoading ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} />}
                    {loginLoading ? "Logging in..." : "Login to Portal"}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-[var(--color-border)] space-y-3">
                  <p className="text-center text-xs text-[var(--color-text-muted)]">
                    Demo: <span className="font-mono text-[var(--color-gold)]">demo@client.com</span> / <span className="font-mono text-[var(--color-gold)]">client123</span>
                  </p>
                  <Link href="/contact" className="btn-outline w-full justify-center text-sm">
                    Pehle Product Purchase Karein <ArrowRight size={14} />
                  </Link>
                  <a href="https://wa.me/919942000413?text=Mujhe client portal access chahiye" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                    <MessageCircle size={13} style={{ color: "#25D366" }} /> Need help? WhatsApp us
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* ─── DASHBOARD ─── */
  return (
    <>
      <main className="min-h-screen bg-[var(--color-bg-secondary)]" style={{ paddingTop: '40px' }}>

        {/* Top bar */}
        <div className="bg-[var(--color-navy)] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/kvl-tech-logo-white.png"
                alt="KVL TECH"
                className="h-7 w-auto object-contain mr-1"
              />
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] flex items-center justify-center font-bold text-sm text-white shadow-[var(--shadow-gold)]">
                {user.name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-[10px] text-white/50 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  {user.company || "Client Portal"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button onClick={() => setNotifOpen(v => !v)}
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all">
                  <Bell size={18} />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[var(--color-gold)] rounded-full text-[9px] text-white flex items-center justify-center font-bold px-1">{unread}</span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                      <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        className="absolute right-0 top-11 w-80 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-luxury)] z-50 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
                          <p className="font-display font-semibold text-sm text-[var(--color-text)]">
                            Notifications {unread > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-full text-[10px]">{unread} new</span>}
                          </p>
                          <div className="flex items-center gap-2">
                            {unread > 0 && (
                              <button onClick={markAllRead} className="text-[10px] text-[var(--color-gold)] hover:underline flex items-center gap-1">
                                <RefreshCw size={10} /> Mark all read
                              </button>
                            )}
                            <button onClick={() => setNotifOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                              <X size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="max-h-72 overflow-y-auto">
                          {notifLoading ? (
                            <div className="p-6 flex justify-center"><Loader2 size={20} className="animate-spin text-[var(--color-gold)]" /></div>
                          ) : notifications.length === 0 ? (
                            <p className="p-6 text-center text-xs text-[var(--color-text-muted)]">Koi notification nahi</p>
                          ) : notifications.map(n => (
                            <div key={n.id} className={`px-4 py-3 border-b border-[var(--color-border)] last:border-0 flex gap-3 ${!n.isRead ? "bg-[var(--color-gold)]/[0.03]" : ""}`}>
                              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.color }} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold truncate ${n.isRead ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text)]"}`}>{n.title}</p>
                                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{n.body}</p>
                                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                              </div>
                              {!n.isRead && <div className="w-2 h-2 rounded-full bg-[var(--color-gold)] shrink-0 mt-1" />}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={handleLogout}
                className="text-xs text-white/50 hover:text-white/80 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20">
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

          {/* Tab nav */}
          <div className="flex gap-1.5 flex-wrap mb-7 bg-[var(--color-bg)] rounded-2xl p-1.5 border border-[var(--color-border)] w-fit">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === id
                  ? "bg-[var(--color-navy)] text-white shadow-[var(--shadow-card)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"}`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ══ OVERVIEW ══ */}
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">

                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { label: "Active Orders", value: ordersLoading ? "..." : String(activeOrders.length), icon: Package, color: "#0891B2", bg: "#0891B215" },
                    { label: "Delivered", value: ordersLoading ? "..." : String(deliveredOrders.length), icon: CheckCircle2, color: "#16A34A", bg: "#16A34A15" },
                    { label: "Notifications", value: String(unread), icon: Bell, color: "#C9A227", bg: "#C9A22715" },
                  ].map(({ label, value, icon: Icon, color, bg }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="card p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                        <Icon size={22} style={{ color }} />
                      </div>
                      <div>
                        <p className="font-display font-bold text-2xl text-[var(--color-text)]">{value}</p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Active order */}
                {ordersLoading ? (
                  <div className="card p-10 flex justify-center"><Loader2 size={24} className="animate-spin text-[var(--color-gold)]" /></div>
                ) : activeOrders.length > 0 ? (
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-display font-bold text-lg text-[var(--color-text)]">Active Order</h2>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        {STATUS_LABEL[activeOrders[0].status] || activeOrders[0].status}
                      </span>
                    </div>

                    <div className="flex items-start gap-4 mb-6 p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                      <div className="w-11 h-11 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                        <Package size={20} className="text-[var(--color-gold)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[var(--color-text)]">{activeOrders[0].product.name}</p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                          #{activeOrders[0].orderNumber} · {activeOrders[0].plan.charAt(0) + activeOrders[0].plan.slice(1).toLowerCase()} Plan
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {activeOrders[0].deliveryEst && (
                          <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 justify-end">
                            <Calendar size={11} /> Est. {new Date(activeOrders[0].deliveryEst).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                        <p className="text-sm font-bold text-[var(--color-text)] mt-0.5">₹{activeOrders[0].amount.toLocaleString("en-IN")}</p>
                      </div>
                    </div>

                    {/* Steps */}
                    {(() => {
                      const currentStep = STATUS_STEP[activeOrders[0].status] ?? 0;
                      return (
                        <>
                          <div className="relative flex items-start justify-between">
                            <div className="absolute top-3.5 left-[10%] right-[10%] h-px bg-[var(--color-border)]" />
                            <div className="absolute top-3.5 left-[10%] h-px bg-[var(--color-gold)] transition-all duration-700"
                              style={{ width: `${(currentStep / (STEPS.length - 1)) * 80}%` }} />
                            {STEPS.map((step, i) => (
                              <div key={step} className="relative flex flex-col items-center z-10" style={{ width: "20%" }}>
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${i <= currentStep ? "border-[var(--color-gold)] bg-[var(--color-gold)]" : "border-[var(--color-border)] bg-[var(--color-bg)]"}`}>
                                  {i < currentStep ? <CheckCircle2 size={13} className="text-white" />
                                    : i === currentStep ? <span className="w-2.5 h-2.5 rounded-full bg-white" />
                                      : <span className="w-2 h-2 rounded-full bg-[var(--color-border)]" />}
                                </div>
                                <p className={`text-[9px] text-center mt-2 leading-snug hidden sm:block font-medium ${i <= currentStep ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-muted)]"}`}>{step}</p>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-center text-[var(--color-text-muted)] mt-3 pt-3 border-t border-[var(--color-border)]">
                            Current Step: <span className="font-semibold text-[var(--color-text)]">{STATUS_LABEL[activeOrders[0].status]}</span>
                            {activeOrders[0].progress > 0 && ` · ${activeOrders[0].progress}% complete`}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="card p-10 text-center text-[var(--color-text-muted)]">
                    <Package size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Koi active order nahi hai</p>
                    <Link href="/products" className="btn-gold inline-flex items-center gap-2 mt-4 text-sm">Browse Products <ArrowRight size={14} /></Link>
                  </div>
                )}

                {/* Quick actions */}
                <div className="card p-6">
                  <h2 className="font-display font-bold text-lg text-[var(--color-text)] mb-4">Quick Actions</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: "Submit Branding", desc: "Logo, colors, details", icon: Palette, color: "#C9A227", bg: "#C9A22715", action: () => setActiveTab("branding") },
                      { label: "Track Orders", desc: "Status & progress", icon: Package, color: "#0891B2", bg: "#0891B215", action: () => setActiveTab("orders") },
                      { label: "WhatsApp Support", desc: "Instant response", icon: MessageCircle, color: "#25D366", bg: "#25D36615", href: "https://wa.me/919942000413" },
                      { label: "Raise Ticket", desc: "Email support", icon: FileText, color: "#7C3AED", bg: "#7C3AED15", action: () => setActiveTab("support") },
                    ].map(({ label, desc, icon: Icon, color, bg, action, href }) => (
                      href
                        ? <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)]/40 hover:shadow-[var(--shadow-card)] transition-all group">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ background: bg }}>
                            <Icon size={18} style={{ color }} />
                          </div>
                          <div><p className="text-sm font-semibold text-[var(--color-text)]">{label}</p><p className="text-[11px] text-[var(--color-text-muted)]">{desc}</p></div>
                        </a>
                        : <button key={label} onClick={action}
                          className="flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)]/40 hover:shadow-[var(--shadow-card)] transition-all group text-left">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ background: bg }}>
                            <Icon size={18} style={{ color }} />
                          </div>
                          <div><p className="text-sm font-semibold text-[var(--color-text)]">{label}</p><p className="text-[11px] text-[var(--color-text-muted)]">{desc}</p></div>
                        </button>
                    ))}
                  </div>
                </div>

                {/* Recent activity from status history */}
                {orders.length > 0 && (
                  <div className="card p-6">
                    <h2 className="font-display font-bold text-lg text-[var(--color-text)] mb-4">Recent Activity</h2>
                    <div className="space-y-0">
                      {orders.flatMap(o => o.statusHistory.map(h => ({
                        ...h, product: o.product.name, orderId: o.orderNumber,
                      }))).sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()).slice(0, 5).map((item, i) => (
                        <div key={i} className="flex gap-4 py-3.5 border-b border-[var(--color-border)] last:border-0">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0 mt-0.5">
                            <TrendingUp size={14} className="text-[var(--color-gold)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[var(--color-text)]">{STATUS_LABEL[item.status] || item.status}</p>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{item.product} · #{item.orderId}</p>
                            {item.note && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.note}</p>}
                          </div>
                          <p className="text-[10px] text-[var(--color-text-muted)] shrink-0 mt-0.5 whitespace-nowrap">
                            {new Date(item.changedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ BRANDING ══ */}
            {activeTab === "branding" && (
              <motion.div key="branding" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div className="max-w-2xl">
                  <div className="card p-7">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-11 h-11 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center">
                        <Palette size={22} className="text-[var(--color-gold)]" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-xl text-[var(--color-text)]">Branding Details</h2>
                        <p className="text-xs text-[var(--color-text-secondary)]">Yeh details aapki website mein apply ki jayengi</p>
                      </div>
                    </div>

                    {brandingSaved ? (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 size={32} className="text-[var(--color-success)]" />
                        </div>
                        <h3 className="font-display font-bold text-xl text-[var(--color-text)] mb-2">Branding Submitted!</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-sm mx-auto">
                          Hamaari team ne aapki details receive kar li hain. 24 hours ke andar apply kar denge.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <a href="https://wa.me/919942000413" target="_blank" rel="noopener noreferrer" className="btn-gold">
                            <MessageCircle size={15} /> Track on WhatsApp
                          </a>
                          <button onClick={() => setBrandingSaved(false)} className="btn-outline">Edit Details</button>
                        </div>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleBrandingSave} className="space-y-5">
                        {/* Order selection */}
                        {orders.length > 0 && (
                          <div>
                            <label className={LABEL}>Related Order</label>
                            <select value={branding.orderId} onChange={e => setBranding(b => ({ ...b, orderId: e.target.value }))} className={INPUT}>
                              <option value="">Select your order (optional)</option>
                              {orders.filter(o => o.status !== "CANCELLED").map(o => (
                                <option key={o.id} value={o.id}>#{o.orderNumber} — {o.product.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className={LABEL}>Company Name *</label>
                            <input required value={branding.companyName} onChange={e => setBranding(b => ({ ...b, companyName: e.target.value }))}
                              placeholder="Your company name" className={INPUT} />
                          </div>
                          <div>
                            <label className={LABEL}>Tagline / Slogan</label>
                            <input value={branding.tagline} onChange={e => setBranding(b => ({ ...b, tagline: e.target.value }))}
                              placeholder="Quality You Can Trust" className={INPUT} />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className={LABEL}>Phone Number *</label>
                            <input required type="tel" value={branding.phone} onChange={e => setBranding(b => ({ ...b, phone: e.target.value }))}
                              placeholder="+91 XXXXX XXXXX" className={INPUT} />
                          </div>
                          <div>
                            <label className={LABEL}>Business Email *</label>
                            <input required type="email" value={branding.email} onChange={e => setBranding(b => ({ ...b, email: e.target.value }))}
                              placeholder="info@yourcompany.com" className={INPUT} />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className={LABEL}>Business Address</label>
                            <input value={branding.address} onChange={e => setBranding(b => ({ ...b, address: e.target.value }))}
                              placeholder="City, State, Pincode" className={INPUT} />
                          </div>
                          <div>
                            <label className={LABEL}>Existing Website</label>
                            <input value={branding.website} onChange={e => setBranding(b => ({ ...b, website: e.target.value }))}
                              placeholder="https://yoursite.com" className={INPUT} />
                          </div>
                        </div>
                        <div>
                          <label className={LABEL}>Brand Colors</label>
                          <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                            <div className="flex items-center gap-3">
                              <input type="color" value={branding.primaryColor} onChange={e => setBranding(b => ({ ...b, primaryColor: e.target.value }))}
                                className="w-11 h-10 rounded-lg border border-[var(--color-border)] cursor-pointer p-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-[var(--color-text)]">Primary</p>
                                <p className="text-[11px] font-mono text-[var(--color-text-secondary)]">{branding.primaryColor}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <input type="color" value={branding.secondaryColor} onChange={e => setBranding(b => ({ ...b, secondaryColor: e.target.value }))}
                                className="w-11 h-10 rounded-lg border border-[var(--color-border)] cursor-pointer p-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-[var(--color-text)]">Secondary</p>
                                <p className="text-[11px] font-mono text-[var(--color-text-secondary)]">{branding.secondaryColor}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className={LABEL}>Font Preference</label>
                          <select value={branding.fontPreference} onChange={e => setBranding(b => ({ ...b, fontPreference: e.target.value }))} className={INPUT}>
                            <option value="">Choose a style</option>
                            <option>Modern & Bold (Plus Jakarta Sans)</option>
                            <option>Professional & Clean (Inter)</option>
                            <option>Elegant & Serif (Playfair Display)</option>
                            <option>Friendly & Rounded (Nunito)</option>
                            <option>No preference — let the team decide</option>
                          </select>
                        </div>
                        <div>
                          <label className={LABEL}>Logo Submission</label>
                          <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-gold)] transition-colors">
                            <div className="w-9 h-9 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                              <Upload size={18} className="text-[var(--color-gold)]" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[var(--color-text)]">Send Logo via WhatsApp</p>
                              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">PNG / SVG format · Min 500×500px</p>
                              <a href="https://wa.me/919942000413" className="text-xs text-[var(--color-gold)] hover:underline mt-1 inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                                <MessageCircle size={11} /> +91 9942000413
                              </a>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className={LABEL}>Additional Notes</label>
                          <textarea rows={3} value={branding.logoNote} onChange={e => setBranding(b => ({ ...b, logoNote: e.target.value }))}
                            placeholder="Any specific requirements? Reference websites, style preferences..." className={INPUT + " resize-none"} />
                        </div>

                        {brandingError && (
                          <p className="text-sm text-red-500 flex items-center gap-2"><AlertCircle size={14} /> {brandingError}</p>
                        )}

                        <button type="submit" disabled={brandingLoading}
                          className="btn-gold w-full py-4 flex items-center justify-center gap-2 disabled:opacity-60">
                          {brandingLoading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                          {brandingLoading ? "Submitting..." : "Submit Branding Details"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ ORDERS ══ */}
            {activeTab === "orders" && (
              <motion.div key="orders" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-xl text-[var(--color-text)]">My Orders</h2>
                  <button onClick={fetchOrders} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1 transition-colors">
                    <RefreshCw size={13} className={ordersLoading ? "animate-spin" : ""} /> Refresh
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="card p-10 flex justify-center"><Loader2 size={24} className="animate-spin text-[var(--color-gold)]" /></div>
                ) : orders.length === 0 ? (
                  <div className="card p-10 text-center text-[var(--color-text-muted)]">
                    <Package size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm mb-4">Koi order nahi mila</p>
                    <Link href="/products" className="btn-gold inline-flex items-center gap-2 text-sm">Browse Products <ArrowRight size={14} /></Link>
                  </div>
                ) : orders.map(order => {
                  const currentStep = STATUS_STEP[order.status] ?? 0;
                  return (
                    <div key={order.id} className="card p-6 space-y-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                            <Package size={22} className="text-[var(--color-gold)]" />
                          </div>
                          <div>
                            <p className="font-display font-semibold text-[var(--color-text)]">{order.product.name}</p>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                              #{order.orderNumber} · {order.plan.charAt(0) + order.plan.slice(1).toLowerCase()} Plan · ₹{order.amount.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                          order.status === "DELIVERED" ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : order.status === "CANCELLED" ? "bg-red-500/10 text-red-500 border border-red-500/20"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                          {order.status === "DELIVERED" ? <CheckCircle2 size={12} />
                            : <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                          {STATUS_LABEL[order.status] || order.status}
                        </span>
                      </div>

                      {/* Progress bar */}
                      {order.progress > 0 && (
                        <div>
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-[var(--color-text-secondary)] font-medium">Progress</span>
                            <span className="font-bold text-[var(--color-text)]">{order.progress}%</span>
                          </div>
                          <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${order.progress}%` }} transition={{ duration: 1, delay: 0.2 }}
                              className="h-full rounded-full bg-gradient-to-r from-[var(--color-gold)]/70 to-[var(--color-gold)]" />
                          </div>
                        </div>
                      )}

                      {/* Steps */}
                      <div className="relative flex items-start justify-between">
                        <div className="absolute top-3.5 left-[10%] right-[10%] h-px bg-[var(--color-border)]" />
                        <div className="absolute top-3.5 left-[10%] h-px bg-[var(--color-gold)] transition-all duration-700"
                          style={{ width: `${(currentStep / (STEPS.length - 1)) * 80}%` }} />
                        {STEPS.map((step, i) => (
                          <div key={step} className="relative flex flex-col items-center z-10" style={{ width: "20%" }}>
                            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${i <= currentStep ? "border-[var(--color-gold)] bg-[var(--color-gold)]" : "border-[var(--color-border)] bg-[var(--color-bg)]"}`}>
                              {i < currentStep ? <CheckCircle2 size={13} className="text-white" />
                                : i === currentStep ? <span className="w-2.5 h-2.5 rounded-full bg-white" />
                                  : <span className="w-2 h-2 rounded-full bg-[var(--color-border)]" />}
                            </div>
                            <p className={`text-[9px] text-center mt-2 leading-snug hidden sm:block ${i <= currentStep ? "text-[var(--color-text-secondary)] font-medium" : "text-[var(--color-text-muted)]"}`}>{step}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-[var(--color-border)]">
                        <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5">
                          <Clock size={12} className="text-[var(--color-text-muted)]" />
                          {order.status === "DELIVERED" ? "Delivered:" : "Est. Delivery:"}{" "}
                          <span className="font-semibold text-[var(--color-text)]">
                            {order.status === "DELIVERED" && order.deliveredAt
                              ? new Date(order.deliveredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                              : order.deliveryEst
                                ? new Date(order.deliveryEst).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                : "TBD"}
                          </span>
                        </p>
                        {order.status === "DELIVERED" ? (
                          <div className="flex gap-2 flex-wrap">
                            {order.liveUrl && (
                              <a href={order.liveUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-gold)]/10 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20 transition-all">
                                <ExternalLink size={12} /> Live Preview
                              </a>
                            )}
                            <a href={`/api/invoice?orderId=${order.id}`} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-all">
                              <Download size={12} /> Download Invoice
                            </a>
                          </div>
                        ) : (
                          <a href="https://wa.me/919942000413" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
                            <MessageCircle size={12} style={{ color: "#25D366" }} /> Ask for update
                          </a>
                        )}
                      </div>

                      {order.status === "DELIVERED" && (
                        <div className="pt-4 border-t border-[var(--color-border)]">
                          <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Rate your experience</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <button key={s} onClick={() => handleRating(order.id, s)} className="transition-transform hover:scale-110">
                                <Star size={22}
                                  fill={s <= (ratings[order.id] || 0) ? "#C9A227" : "none"}
                                  className={s <= (ratings[order.id] || 0) ? "text-[var(--color-gold)]" : "text-[var(--color-border)]"} />
                              </button>
                            ))}
                            {ratings[order.id] && <span className="ml-2 text-xs text-[var(--color-text-muted)] self-center">Shukriya!</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* ══ SUPPORT ══ */}
            {activeTab === "support" && (
              <motion.div key="support" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div className="grid lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-3 space-y-5">
                    <div className="card p-6">
                      <h2 className="font-display font-bold text-lg text-[var(--color-text)] mb-4">Contact Support</h2>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          { icon: MessageCircle, label: "WhatsApp", sub: "+91 9942000413", time: "Reply in 5 min", color: "#25D366", href: "https://wa.me/919942000413?text=Hi! I need support." },
                          { icon: Phone, label: "Call Us", sub: "+91 9942000413", time: "Mon–Sat 9AM–7PM", color: "#0891B2", href: "tel:+919942000413" },
                          { icon: Mail, label: "Email", sub: "support@kvl...", time: "Reply in 24 hrs", color: "#C9A227", href: "mailto:support@kvlbusinesssolutions.com" },
                          { icon: MapPin, label: "Office Visit", sub: "Sector 62, Noida", time: "Mon–Sat 10AM–6PM", color: "#7C3AED", href: "#" },
                        ].map(({ icon: Icon, label, sub, time, color, href }) => (
                          <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined}
                            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)]/40 hover:shadow-[var(--shadow-card)] transition-all group">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ background: `${color}15` }}>
                              <Icon size={18} style={{ color }} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[var(--color-text)]">{label}</p>
                              <p className="text-[11px] text-[var(--color-text-secondary)]">{sub}</p>
                              <p className="text-[10px] text-[var(--color-text-muted)]">{time}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="card p-6">
                      <h2 className="font-display font-bold text-lg text-[var(--color-text)] mb-1">Raise a Ticket</h2>
                      <p className="text-xs text-[var(--color-text-secondary)] mb-5">Describe your issue — we reply within 24 hours</p>

                      {ticketSent ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                          <div className="w-14 h-14 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 size={28} className="text-[var(--color-success)]" />
                          </div>
                          <h3 className="font-display font-bold text-lg text-[var(--color-text)] mb-1.5">Ticket Raised!</h3>
                          <p className="text-xs text-[var(--color-text-secondary)] mb-5">
                            Ticket ID: <span className="font-mono font-semibold text-[var(--color-gold)]">#{ticketNo}</span>
                          </p>
                          <div className="flex gap-3 justify-center">
                            <a href="https://wa.me/919942000413" target="_blank" rel="noopener noreferrer" className="btn-gold text-sm">
                              <MessageCircle size={14} /> Follow up
                            </a>
                            <button onClick={() => { setTicketSent(false); setTicket({ subject: "", orderId: "", priority: "Medium", message: "" }); }} className="btn-outline text-sm">
                              New Ticket
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleTicket} className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className={LABEL}>Subject *</label>
                              <input required value={ticket.subject} onChange={e => setTicket(t => ({ ...t, subject: e.target.value }))}
                                placeholder="Brief problem description" className={INPUT} />
                            </div>
                            <div>
                              <label className={LABEL}>Related Order</label>
                              <select value={ticket.orderId} onChange={e => setTicket(t => ({ ...t, orderId: e.target.value }))} className={INPUT}>
                                <option value="">Select order (optional)</option>
                                {orders.map(o => <option key={o.id} value={o.id}>#{o.orderNumber} — {o.product.name}</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className={LABEL}>Priority</label>
                            <div className="flex gap-2">
                              {["Low", "Medium", "High"].map(p => (
                                <button key={p} type="button" onClick={() => setTicket(t => ({ ...t, priority: p }))}
                                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${ticket.priority === p
                                    ? p === "High" ? "bg-red-500/10 border-red-500/30 text-red-500"
                                      : p === "Medium" ? "bg-[var(--color-gold)]/10 border-[var(--color-gold)]/30 text-[var(--color-gold)]"
                                        : "bg-green-500/10 border-green-500/30 text-green-500"
                                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)]/30"}`}>
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className={LABEL}>Describe Your Issue *</label>
                            <textarea required rows={4} value={ticket.message} onChange={e => setTicket(t => ({ ...t, message: e.target.value }))}
                              placeholder="Describe your issue in detail..." className={INPUT + " resize-none"} />
                          </div>
                          {ticketError && <p className="text-sm text-red-500 flex items-center gap-2"><AlertCircle size={14} /> {ticketError}</p>}
                          <button type="submit" disabled={ticketLoading}
                            className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60">
                            {ticketLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            {ticketLoading ? "Submitting..." : "Submit Ticket"}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* FAQ */}
                  <div className="lg:col-span-2">
                    <div className="card p-6">
                      <h2 className="font-display font-bold text-lg text-[var(--color-text)] mb-4">Common Questions</h2>
                      <div className="space-y-2">
                        {FAQS.map((faq, i) => (
                          <div key={i} className="border border-[var(--color-border)] rounded-xl overflow-hidden">
                            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[var(--color-bg-secondary)] transition-colors">
                              <p className="text-sm font-semibold text-[var(--color-text)] pr-3">{faq.q}</p>
                              {openFaq === i ? <ChevronUp size={16} className="text-[var(--color-gold)] shrink-0" /> : <ChevronDown size={16} className="text-[var(--color-text-muted)] shrink-0" />}
                            </button>
                            <AnimatePresence>
                              {openFaq === i && (
                                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                                  <p className="px-4 pb-4 text-xs text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)] pt-3">{faq.a}</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-center">
                        <p className="text-xs text-[var(--color-text-secondary)] mb-2">Aur koi sawaal?</p>
                        <a href="https://wa.me/919942000413" target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text)] hover:text-[var(--color-gold)] transition-colors">
                          <MessageCircle size={13} style={{ color: "#25D366" }} /> WhatsApp: +91 9942000413
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
    </>
  );
}
