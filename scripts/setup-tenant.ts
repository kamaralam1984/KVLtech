/**
 * KVL TECH — Tenant Setup CLI
 *
 * Usage:
 *   npx ts-node --skip-project scripts/setup-tenant.ts \
 *     --slug=acme \
 *     --agency-id=clxxxxxxxxx \
 *     --plan=growth \
 *     [--custom-domain=crm.acme.com] \
 *     [--color=#C9A227]
 *
 * For production use the Admin UI at /admin/tenants instead.
 */

import { registerTenant, TENANT_PLANS, loadTenantsFromDB, type TenantConfig } from "../lib/tenant";

function parseArgs() {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};
  for (const arg of args) {
    const [key, ...rest] = arg.replace(/^--/, "").split("=");
    result[key] = rest.join("=");
  }
  return result;
}

async function main() {
  const args = parseArgs();

  const slug = args["slug"];
  const agencyId = args["agency-id"];
  const plan = (args["plan"] ?? "starter") as TenantConfig["plan"];
  const customDomain = args["custom-domain"];
  const primaryColor = args["color"] ?? "#C9A227";

  if (!slug || !agencyId) {
    console.error("Usage: --slug=<slug> --agency-id=<id> [--plan=starter|growth|enterprise] [--custom-domain=<domain>] [--color=<hex>]");
    process.exit(1);
  }

  if (!/^[a-z0-9-]+$/.test(slug) || slug.length > 30) {
    console.error("Invalid slug. Must be lowercase alphanumeric + hyphens, max 30 chars.");
    process.exit(1);
  }

  if (!["starter", "growth", "enterprise"].includes(plan)) {
    console.error("Invalid plan. Must be starter, growth, or enterprise.");
    process.exit(1);
  }

  // Load existing tenants from DB so we can detect duplicates
  await loadTenantsFromDB();

  // Build config
  const config: TenantConfig = {
    id: agencyId,
    slug,
    name: slug, // Will be populated from DB in production
    customDomain: customDomain || undefined,
    primaryColor,
    plan,
    features: TENANT_PLANS[plan],
    isActive: true,
    createdAt: new Date(),
  };

  try {
    registerTenant(config);
    console.log("\n✓ Tenant registered successfully!\n");
    console.log("  Slug:         ", slug);
    console.log("  Agency ID:    ", agencyId);
    console.log("  Plan:         ", plan);
    console.log("  URL:          ", `https://${slug}.kvlbusinesssolutions.com`);
    if (customDomain) {
      console.log("  Custom domain:", customDomain);
      console.log("\n  DNS: Point CNAME from", customDomain, "→ kvlbusinesssolutions.com");
    }
    console.log("\nNote: This registration is in-memory only. Restart the server to reload from DB.\n");
  } catch (err) {
    console.error("Failed to register tenant:", err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
