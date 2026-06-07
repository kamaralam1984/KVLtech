import { db } from "@/lib/db";

// ─────────────────────────────────────────────
// TENANT CONFIG TYPE
// ─────────────────────────────────────────────

export interface TenantConfig {
  id: string;             // agencyId
  slug: string;           // e.g. "acme" → acme.kvlbusinesssolutions.com
  customDomain?: string;  // e.g. "crm.acme.com"
  name: string;
  logoUrl?: string;
  primaryColor: string;   // hex
  plan: "starter" | "growth" | "enterprise";
  features: {
    maxClients: number;
    maxAdmins: number;
    customDomain: boolean;
    whiteLabel: boolean;
    apiAccess: boolean;
  };
  isActive: boolean;
  createdAt: Date;
}

// ─────────────────────────────────────────────
// PLAN DEFINITIONS
// ─────────────────────────────────────────────

export const TENANT_PLANS: Record<
  "starter" | "growth" | "enterprise",
  TenantConfig["features"]
> = {
  starter: {
    maxClients: 10,
    maxAdmins: 2,
    customDomain: false,
    whiteLabel: false,
    apiAccess: false,
  },
  growth: {
    maxClients: 50,
    maxAdmins: 10,
    customDomain: true,
    whiteLabel: true,
    apiAccess: true,
  },
  enterprise: {
    maxClients: 999999,
    maxAdmins: 999999,
    customDomain: true,
    whiteLabel: true,
    apiAccess: true,
  },
};

// ─────────────────────────────────────────────
// IN-MEMORY GLOBAL TENANT REGISTRY
// (hot-reload safe via globalThis)
// ─────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __kvl_tenant_registry: Map<string, TenantConfig>;
  // eslint-disable-next-line no-var
  var __kvl_domain_map: Map<string, string>; // customDomain → slug
}

if (!globalThis.__kvl_tenant_registry) {
  globalThis.__kvl_tenant_registry = new Map<string, TenantConfig>();
}
if (!globalThis.__kvl_domain_map) {
  globalThis.__kvl_domain_map = new Map<string, string>();
}

const registry = globalThis.__kvl_tenant_registry;
const domainMap = globalThis.__kvl_domain_map;

// ─────────────────────────────────────────────
// MAIN DOMAIN PATTERNS (not tenants)
// ─────────────────────────────────────────────

const MAIN_DOMAIN = "kvlbusinesssolutions.com";
const MAIN_HOSTS = new Set([
  "kvlbusinesssolutions.com",
  "www.kvlbusinesssolutions.com",
  "localhost",
]);

// ─────────────────────────────────────────────
// REGISTRY OPERATIONS
// ─────────────────────────────────────────────

export function registerTenant(config: TenantConfig): void {
  registry.set(config.slug, config);
  if (config.customDomain) {
    domainMap.set(config.customDomain, config.slug);
  }
}

export function unregisterTenant(slug: string): void {
  const existing = registry.get(slug);
  if (existing?.customDomain) {
    domainMap.delete(existing.customDomain);
  }
  registry.delete(slug);
}

export function getAllTenants(): TenantConfig[] {
  return Array.from(registry.values());
}

export function getTenantBySlug(slug: string): TenantConfig | null {
  return registry.get(slug) ?? null;
}

export function updateTenantConfig(
  slug: string,
  updates: Partial<TenantConfig>
): void {
  const existing = registry.get(slug);
  if (!existing) return;

  // If customDomain is changing, update the domain map
  if (updates.customDomain !== undefined) {
    if (existing.customDomain) {
      domainMap.delete(existing.customDomain);
    }
    if (updates.customDomain) {
      domainMap.set(updates.customDomain, slug);
    }
  }

  registry.set(slug, { ...existing, ...updates });
}

// ─────────────────────────────────────────────
// TENANT RESOLUTION
// ─────────────────────────────────────────────

export function resolveTenant(host: string): TenantConfig | null {
  // Strip port
  const bareHost = host.split(":")[0];

  // Main domain — not a tenant
  if (MAIN_HOSTS.has(bareHost)) return null;

  // Check custom domain map first
  if (domainMap.has(bareHost)) {
    const slug = domainMap.get(bareHost)!;
    return registry.get(slug) ?? null;
  }

  // Check subdomain pattern: slug.kvlbusinesssolutions.com
  if (bareHost.endsWith(`.${MAIN_DOMAIN}`)) {
    const slug = bareHost.slice(0, bareHost.length - MAIN_DOMAIN.length - 1);
    if (!slug) return null;
    return registry.get(slug) ?? null;
  }

  return null;
}

export function getTenantFromRequest(req: Request): TenantConfig | null {
  const host = req.headers.get("host") || req.headers.get("x-forwarded-host") || "";
  if (!host) return null;
  return resolveTenant(host);
}

export function isTenantRequest(host: string): boolean {
  return resolveTenant(host) !== null;
}

// ─────────────────────────────────────────────
// LOAD TENANTS FROM DB (lazy, idempotent)
// ─────────────────────────────────────────────

let _loaded = false;

export async function loadTenantsFromDB(): Promise<void> {
  if (_loaded && registry.size > 0) return;

  try {
    const agencies = await db.agency.findMany({
      where: { status: "ACTIVE" },
    });

    // Also load white-label configs to get domain & color info
    const wlConfigs = await db.whiteLabelConfig.findMany({
      where: { agencyId: { not: null } },
    });
    const wlMap = new Map(wlConfigs.map((w) => [w.agencyId!, w]));

    for (const agency of agencies) {
      const wl = wlMap.get(agency.id);

      // Derive a slug from agency name (lowercase alphanumeric + hyphens)
      const slug = agency.name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 30);

      if (!slug) continue;

      // Determine plan from commissionRate (heuristic — can be overridden via API)
      const plan: TenantConfig["plan"] =
        agency.commissionRate >= 30
          ? "enterprise"
          : agency.commissionRate >= 20
          ? "growth"
          : "starter";

      const config: TenantConfig = {
        id: agency.id,
        slug,
        customDomain: wl?.customDomain ?? undefined,
        name: agency.name,
        logoUrl: agency.logoUrl ?? undefined,
        primaryColor: wl?.primaryColor ?? "#C9A227",
        plan,
        features: TENANT_PLANS[plan],
        isActive: agency.status === "ACTIVE",
        createdAt: agency.createdAt,
      };

      registerTenant(config);
    }

    _loaded = true;
  } catch (err) {
    console.error("[tenant] Failed to load tenants from DB:", err);
  }
}

// ─────────────────────────────────────────────
// ENSURE LOADED (lazy init helper)
// ─────────────────────────────────────────────

export async function ensureTenantsLoaded(): Promise<void> {
  if (!_loaded || registry.size === 0) {
    await loadTenantsFromDB();
  }
}
