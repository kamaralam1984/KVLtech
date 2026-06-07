"use client";

import type { TenantConfig } from "@/lib/tenant";

interface TenantPortalProps {
  tenantConfig: TenantConfig;
  children: React.ReactNode;
}

export function TenantPortal({ tenantConfig, children }: TenantPortalProps) {
  const css = `
    :root {
      --color-primary: ${tenantConfig.primaryColor};
      --color-gold: ${tenantConfig.primaryColor};
    }
  `;

  const initials = tenantConfig.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      {/* Inject tenant CSS vars */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Tenant header */}
      <header className="h-16 flex items-center px-6 border-b border-[var(--color-border)] bg-[var(--color-bg)] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {tenantConfig.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tenantConfig.logoUrl}
              alt={tenantConfig.name}
              className="h-8 w-auto object-contain"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: tenantConfig.primaryColor }}
            >
              {initials}
            </div>
          )}
          <span className="font-bold text-lg text-[var(--color-text)]">
            {tenantConfig.name}
          </span>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* "Powered by KVL" footer */}
      <footer className="py-3 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <p className="text-center text-xs text-[var(--color-text-muted)]">
          Powered by{" "}
          <a
            href="https://kvlbusinesssolutions.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: tenantConfig.primaryColor }}
          >
            KVL TECH
          </a>
        </p>
      </footer>
    </div>
  );
}
