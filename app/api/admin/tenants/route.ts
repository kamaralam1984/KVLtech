import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getAllTenants,
  registerTenant,
  unregisterTenant,
  updateTenantConfig,
  ensureTenantsLoaded,
  TENANT_PLANS,
  getTenantBySlug,
  type TenantConfig,
} from "@/lib/tenant";
import { db } from "@/lib/db";

const SLUG_REGEX = /^[a-z0-9-]+$/;

// ─────────────────────────────────────────────
// GET — list all tenants with usage stats
// ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTenantsLoaded();

  const tenants = getAllTenants();

  // Attach client counts for each tenant
  const withStats = await Promise.all(
    tenants.map(async (t) => {
      const clientCount = await db.agencyClient.count({ where: { agencyId: t.id } }).catch(() => 0);
      return { ...t, usage: { clients: clientCount } };
    })
  );

  return NextResponse.json({ tenants: withStats, total: withStats.length });
}

// ─────────────────────────────────────────────
// POST — register new tenant
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { slug, name, customDomain, primaryColor, plan, agencyId } = body;

  // Validate required fields
  if (!slug || !name || !agencyId || !plan) {
    return NextResponse.json({ error: "slug, name, agencyId, and plan are required" }, { status: 400 });
  }

  // Validate slug format
  if (!SLUG_REGEX.test(slug) || slug.length > 30) {
    return NextResponse.json(
      { error: "Slug must be lowercase alphanumeric + hyphens, max 30 chars" },
      { status: 400 }
    );
  }

  // Validate plan
  if (!["starter", "growth", "enterprise"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Check slug uniqueness
  await ensureTenantsLoaded();
  if (getTenantBySlug(slug)) {
    return NextResponse.json({ error: "Slug already registered" }, { status: 409 });
  }

  // Validate agencyId exists
  const agency = await db.agency.findUnique({ where: { id: agencyId } });
  if (!agency) {
    return NextResponse.json({ error: "Agency not found" }, { status: 404 });
  }

  // Build config
  const config: TenantConfig = {
    id: agencyId,
    slug,
    name,
    customDomain: customDomain || undefined,
    primaryColor: primaryColor || "#C9A227",
    plan: plan as TenantConfig["plan"],
    features: TENANT_PLANS[plan as TenantConfig["plan"]],
    isActive: true,
    createdAt: new Date(),
  };

  registerTenant(config);

  return NextResponse.json({ tenant: config }, { status: 201 });
}

// ─────────────────────────────────────────────
// PATCH — update tenant config
// ─────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { slug, ...updates } = body;

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  await ensureTenantsLoaded();
  const existing = getTenantBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  // If plan is changing, update features
  if (updates.plan && TENANT_PLANS[updates.plan as TenantConfig["plan"]]) {
    updates.features = TENANT_PLANS[updates.plan as TenantConfig["plan"]];
  }

  updateTenantConfig(slug, updates);
  const updated = getTenantBySlug(slug);

  return NextResponse.json({ tenant: updated });
}

// ─────────────────────────────────────────────
// DELETE — unregister tenant
// ─────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug query param required" }, { status: 400 });
  }

  await ensureTenantsLoaded();
  if (!getTenantBySlug(slug)) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  unregisterTenant(slug);
  return NextResponse.json({ success: true });
}
