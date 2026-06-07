import { db } from "@/lib/db";
import type { TenantConfig } from "@/lib/tenant";

// ─────────────────────────────────────────────
// CSS GENERATION
// ─────────────────────────────────────────────

export function getTenantCSS(config: TenantConfig): string {
  return `:root {
  --color-primary: ${config.primaryColor};
  --color-gold: ${config.primaryColor};
  --tenant-name: "${config.name}";
}`;
}

// ─────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────

export function getTenantMeta(config: TenantConfig): {
  title: string;
  description: string;
  favicon: string;
} {
  return {
    title: `${config.name} Portal`,
    description: `Manage your projects and orders with ${config.name}`,
    favicon: config.logoUrl ?? "/favicon.ico",
  };
}

// ─────────────────────────────────────────────
// QUERY SCOPING
// ─────────────────────────────────────────────

/**
 * Returns a Prisma where-clause fragment that scopes an AgencyClient join.
 * Usage:
 *   const clients = await db.agencyClient.findMany({
 *     where: scopeQueryToTenant(agencyId),
 *     include: { ... }
 *   });
 */
export function scopeQueryToTenant(agencyId: string): { agencyId: string } {
  return { agencyId };
}

// ─────────────────────────────────────────────
// LIMIT CHECKS
// ─────────────────────────────────────────────

export async function checkTenantLimit(
  agencyId: string,
  resource: "clients" | "admins",
  planFeatures: TenantConfig["features"]
): Promise<{ allowed: boolean; current: number; max: number }> {
  if (resource === "clients") {
    const current = await db.agencyClient.count({ where: { agencyId } });
    const max = planFeatures.maxClients;
    return { allowed: current < max, current, max };
  }

  // "admins" — there is no AdminAgency join in the schema, so we count the
  // agency's own adminId field as 1 and use the plan cap as the ceiling.
  // Extend this when a proper AdminAgency model is added.
  const current = 1;
  const max = planFeatures.maxAdmins;
  return { allowed: current < max, current, max };
}
