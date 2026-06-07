import { headers } from "next/headers";
import { GlobalSearch } from "@/components/admin/GlobalSearch";
import { AdminLayoutClient } from "./AdminLayoutClient";
import { AdminShell } from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/ui/Toast";
import { KeyboardShortcuts } from "@/components/admin/KeyboardShortcuts";

export const metadata = { title: "Admin Dashboard — KVL TECH" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <ToastProvider>
      <AdminShell
        overlays={
          <>
            {/* Global search modal — always mounted, activated by Ctrl+K or custom event */}
            <GlobalSearch />
            {/* Keyboard shortcuts system */}
            <KeyboardShortcuts />
          </>
        }
      >
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </AdminShell>
    </ToastProvider>
  );
}
