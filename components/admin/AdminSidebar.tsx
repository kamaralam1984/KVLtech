"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Users, Package,
  Megaphone, BarChart3, Settings, LogOut,
  ChevronLeft, Menu, Bell, Search, Shield, HeadphonesIcon, FileText,
} from "lucide-react";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/admin/clients", icon: Users, label: "Clients & Leads" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/support", icon: HeadphonesIcon, label: "Support Tickets" },
  { href: "/admin/blog", icon: FileText, label: "Blog (AI)" },
  { href: "/admin/marketing", icon: Megaphone, label: "Marketing" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.admin) setAdmin(d.admin); })
      .catch(() => {});

    fetch("/api/admin/orders?status=PAYMENT_PENDING", {
      credentials: "include",
      headers: { Authorization: "Bearer admin-bypass" },
    })
      .then(r => r.json())
      .then(d => setPendingOrders(d.orders?.length || 0))
      .catch(() => {});

    fetch("/api/admin/support?status=OPEN", { credentials: "include" })
      .then(r => r.json())
      .then(d => setOpenTickets(d.tickets?.length || 0))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 transition-all duration-300 border-r border-[var(--color-border)] bg-[var(--color-bg)] shrink-0"
      style={{ width: collapsed ? "64px" : "240px" }}
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
          {collapsed ? <Menu size={16} className="text-[var(--color-text-secondary)]" /> : <ChevronLeft size={16} className="text-[var(--color-text-secondary)]" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label, exact }) => {
          const active = isActive(href, exact);
          const badge =
            (href === "/admin/orders" && pendingOrders > 0) ? pendingOrders :
            (href === "/admin/support" && openTickets > 0) ? openTickets : null;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${active
                ? "bg-[var(--color-navy)] text-white shadow-[var(--shadow-card)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]"}`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="text-sm font-medium flex-1">{label}</span>
                  {badge && (
                    <span className="w-5 h-5 rounded-full bg-[var(--color-gold)] text-white text-[10px] font-bold flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[var(--color-border)] space-y-1">
        <Link href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)] transition-all">
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
              <p className="text-xs font-semibold text-[var(--color-text)] truncate">{admin?.name || "Admin"}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] truncate">{admin?.role || "Administrator"}</p>
            </div>
            <button onClick={handleLogout} title="Logout"
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0">
              <LogOut size={13} />
            </button>
          </div>
        )}
        {collapsed && (
          <button onClick={handleLogout} title="Logout"
            className="w-full flex items-center justify-center py-2 rounded-xl text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}

export function AdminTopbar({ title }: { title: string }) {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--color-border)] bg-[var(--color-bg)] sticky top-0 z-10">
      <h1 className="font-display font-bold text-xl text-[var(--color-text)]">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <Search size={14} className="text-[var(--color-text-muted)]" />
          <input placeholder="Search..." className="text-sm bg-transparent outline-none text-[var(--color-text)] w-36 placeholder:text-[var(--color-text-muted)]" />
        </div>
        <button className="relative w-9 h-9 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-all">
          <Bell size={16} className="text-[var(--color-text-secondary)]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-gold)]" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-[var(--color-navy)] flex items-center justify-center text-white text-xs font-bold">
          <Shield size={16} />
        </div>
      </div>
    </header>
  );
}
