"use client";

import { useState, useEffect } from "react";
import { AdminSidebar, AdminBottomNav } from "@/components/admin/AdminSidebar";

interface AdminShellProps {
  children: React.ReactNode;
  /** Portal-level components (modals, global overlays) */
  overlays?: React.ReactNode;
}

export function AdminShell({ children, overlays }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Listen for the hamburger event dispatched by AdminTopbar
  useEffect(() => {
    const handler = () => setMobileOpen(true);
    document.addEventListener("admin-mobile-menu-open", handler);
    return () => document.removeEventListener("admin-mobile-menu-open", handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-secondary)]">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      {/* Main content — extra bottom padding on mobile to avoid bottom nav overlap */}
      <div className="flex-1 overflow-y-auto pb-16 md:pb-0" id="main-content">
        {children}
      </div>
      {/* Mobile bottom navigation */}
      <AdminBottomNav />
      {/* Portal-level overlays (GlobalSearch, KeyboardShortcuts, etc.) */}
      {overlays}
    </div>
  );
}
