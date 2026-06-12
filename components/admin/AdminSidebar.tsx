"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, Users, Package,
  Megaphone, BarChart3, Settings, LogOut,
  ChevronLeft, Menu, Search, Shield, HeadphonesIcon, FileText,
  Kanban, CreditCard, Zap, FileSignature, ClipboardList, ScrollText, Key,
  Activity, MessageSquare, CalendarDays, PenLine, Webhook, Building2, Puzzle, Palette,
  BookOpen, Timer, HeartPulse, FolderOpen, GitBranch, ExternalLink, Bell, Sparkles,
  ShoppingCart, Layers, Globe, TrendingUp, Bot, DatabaseBackup,
} from "lucide-react";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { AIAlertsPanel } from "@/components/ui/AIAlertsPanel";

const BOTTOM_NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Home", exact: true },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/crm", icon: Users, label: "CRM" },
  { href: "/admin/support", icon: HeadphonesIcon, label: "Support" },
  { href: "/admin/ai-hub", icon: Sparkles, label: "AI Hub" },
];

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/admin/ai-hub", icon: Sparkles, label: "AI Hub" },
  { href: "/admin/sales-agent", icon: Bot, label: "Sales Agent" },
  { href: "/admin/tenants", icon: Building2, label: "Tenants" },
  { href: "/admin/website-builder", icon: Globe, label: "Website Builder" },
  { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/admin/clients", icon: Users, label: "Clients & Leads" },
  { href: "/admin/customer-success", icon: TrendingUp, label: "Customer Success" },
  { href: "/admin/crm", icon: Kanban, label: "CRM Pipeline" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/support", icon: HeadphonesIcon, label: "Support Tickets" },
  { href: "/admin/sla", icon: Timer, label: "SLA Policies" },
  { href: "/admin/kb", icon: BookOpen, label: "Knowledge Base" },
  { href: "/admin/health", icon: HeartPulse, label: "Customer Health" },
  { href: "/admin/meetings", icon: CalendarDays, label: "Meetings" },
  { href: "/admin/signatures", icon: PenLine, label: "E-Signatures" },
  { href: "/admin/blog", icon: FileText, label: "Blog (AI)" },
  { href: "/admin/marketing", icon: Megaphone, label: "Marketing" },
  { href: "/admin/automation", icon: Zap, label: "Automation" },
  { href: "/admin/workflow-builder", icon: GitBranch, label: "Workflow Builder" },
  { href: "/admin/portfolio", icon: FolderOpen, label: "Portfolio" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/billing", icon: CreditCard, label: "Billing" },
  { href: "/admin/stripe", icon: CreditCard, label: "Stripe Billing" },
  { href: "/admin/proposals", icon: FileSignature, label: "AI Proposals" },
  { href: "/admin/applications", icon: ClipboardList, label: "Job Applications" },
  { href: "/admin/alerts", icon: Bell, label: "Alerts" },
  { href: "/admin/activity", icon: Activity, label: "Activity Feed" },
  { href: "/admin/team", icon: MessageSquare, label: "Team Chat" },
  { href: "/admin/audit", icon: ScrollText, label: "Audit Logs" },
  { href: "/admin/roles", icon: Shield, label: "Roles & Permissions" },
  { href: "/admin/backup", icon: DatabaseBackup, label: "Backup & Restore" },
  { href: "/admin/api-keys", icon: Key, label: "API Keys" },
  { href: "/admin/agency", icon: Building2, label: "Agency" },
  { href: "/admin/white-label", icon: Palette, label: "White Label" },
  { href: "/admin/queue", icon: Layers, label: "Job Queue" },
  { href: "/admin/webhooks", icon: Webhook, label: "Webhooks" },
  { href: "/admin/integrations", icon: Puzzle, label: "Integrations" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  const fetchUnreadAlerts = () => {
    fetch("/api/admin/ai-alerts?unread=true&limit=1", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => setUnreadAlerts(d?.unreadCount || 0))
      .catch(() => {});
  };

  useEffect(() => {
    if (pathname === "/admin/login") return;

    fetch("/api/admin/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.admin) setAdmin(d.admin); })
      .catch(() => {});

    fetch("/api/admin/orders?status=PAYMENT_PENDING", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => setPendingOrders(d?.orders?.length || 0))
      .catch(() => {});

    fetch("/api/admin/support?status=OPEN", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => setOpenTickets(d?.tickets?.length || 0))
      .catch(() => {});

    fetchUnreadAlerts();

    const alertInterval = setInterval(fetchUnreadAlerts, 60000);
    return () => clearInterval(alertInterval);
  }, [pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    if (onMobileClose) onMobileClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const sidebarInner = (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex flex-col h-full border-r border-[rgba(201,162,39,0.2)] bg-[#0B1437] shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--color-border)] h-16 shrink-0">
        {!collapsed && (
          <Link href="/admin">
            <Image src="/kvl-tech-logo-tight.png" alt="KVL TECH" width={130} height={42}
              className="h-8 w-auto object-contain [mix-blend-mode:multiply] dark:hidden" />
            <Image src="/kvl-tech-logo-white.png" alt="KVL TECH" width={130} height={42}
              className="h-8 w-auto object-contain hidden dark:block" />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-colors ml-auto shrink-0"
        >
          {collapsed ? <Menu size={16} className="text-slate-300" /> : <ChevronLeft size={16} className="text-slate-300" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label, exact }) => {
          const active = isActive(href, exact);
          const badge =
            (href === "/admin/orders" && pendingOrders > 0) ? pendingOrders :
            (href === "/admin/support" && openTickets > 0) ? openTickets : null;
          const alertBadge = href === "/admin/alerts" && unreadAlerts > 0 ? unreadAlerts : null;
          return (
            <motion.div
              key={href}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.15 }}
            >
              <Link
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group relative ${active
                  ? "text-white shadow-[var(--shadow-card)]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
              >
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-xl bg-[var(--color-navy)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative shrink-0 z-10">
                  <Icon size={18} />
                  {alertBadge && collapsed && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {alertBadge > 9 ? "9+" : alertBadge}
                    </span>
                  )}
                </span>
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium flex-1 relative z-10">{label}</span>
                    {badge && (
                      <span className="w-5 h-5 rounded-full bg-[var(--color-gold)] text-white text-[10px] font-bold flex items-center justify-center relative z-10">
                        {badge}
                      </span>
                    )}
                    {alertBadge && (
                      <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center relative z-10">
                        {alertBadge > 9 ? "9+" : alertBadge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[var(--color-border)] space-y-1">
        <Link href="/docs/api"
          title={collapsed ? "API Documentation" : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
          <ExternalLink size={18} className="shrink-0" />
          {!collapsed && <span className="text-sm font-medium">API Documentation</span>}
        </Link>
        <Link href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all">
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Back to Site</span>}
        </Link>

        {/* Admin user card */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <div className="w-7 h-7 rounded-full bg-[var(--color-navy)] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {admin?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{admin?.name || "Admin"}</p>
              <p className="text-[10px] text-slate-400 truncate">{admin?.role || "Administrator"}</p>
            </div>
            <button onClick={handleLogout} title="Logout"
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0">
              <LogOut size={13} />
            </button>
          </div>
        )}
        {collapsed && (
          <button onClick={handleLogout} title="Logout" aria-label="Logout"
            className="w-full flex items-center justify-center py-2 rounded-xl text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </motion.aside>
  );

  return (
    <>
      {/* Desktop sidebar — sticky, always visible on md+ */}
      <div className="hidden md:flex h-screen sticky top-0">
        {sidebarInner}
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mob-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={onMobileClose}
              aria-hidden="true"
            />
            {/* Drawer panel */}
            <motion.div
              key="mob-drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
              style={{ width: 240 }}
            >
              {sidebarInner}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function AdminBottomNav() {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[var(--color-bg)] border-t border-[var(--color-border)] flex"
      aria-label="Mobile admin navigation"
    >
      {BOTTOM_NAV.map(({ href, icon: Icon, label, exact }) => (
        <Link
          key={href}
          href={href}
          aria-label={label}
          aria-current={isActive(href, exact) ? "page" : undefined}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs transition-colors ${
            isActive(href, exact)
              ? "text-[var(--color-gold)]"
              : "text-[var(--color-text-muted)]"
          }`}
        >
          <Icon size={20} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function AdminTopbar({ title, action }: { title: string; action?: React.ReactNode }) {
  const openSearch = () => {
    document.dispatchEvent(new CustomEvent("open-search"));
  };
  const openMobileMenu = () => {
    document.dispatchEvent(new CustomEvent("admin-mobile-menu-open"));
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-[var(--color-border)] bg-[var(--color-bg)] sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={openMobileMenu}
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu size={20} className="text-[var(--color-text)]" />
        </button>
        <h1 className="font-display font-bold text-xl text-[var(--color-text)]">{title}</h1>
        {action && <div className="hidden sm:block">{action}</div>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={openSearch}
          aria-label="Search"
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm hover:border-[var(--color-gold)] transition-colors"
        >
          <Search size={14} />
          <span>Search...</span>
          <kbd className="ml-4 px-1.5 py-0.5 text-xs rounded bg-[var(--color-bg)] border border-[var(--color-border)]">⌘K</kbd>
        </button>
        <AIAlertsPanel />
        <NotificationBell />
        <div className="w-9 h-9 rounded-xl bg-[var(--color-navy)] flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">
          <Shield size={16} />
        </div>
      </div>
    </header>
  );
}
