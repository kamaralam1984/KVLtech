import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getTenantBySlug,
  updateTenantConfig,
  ensureTenantsLoaded,
  TENANT_PLANS,
  type TenantConfig,
} from "@/lib/tenant";
import { db } from "@/lib/db";

// ─────────────────────────────────────────────
// GET — tenant detail with usage stats
// ─────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTenantsLoaded();
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  // Client count
  const clientCount = await db.agencyClient
    .count({ where: { agencyId: tenant.id } })
    .catch(() => 0);

  // Monthly revenue from tenant's clients' orders
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const agencyClients = await db.agencyClient
    .findMany({ where: { agencyId: tenant.id }, select: { clientId: true } })
    .catch(() => [] as { clientId: string }[]);

  const clientIds = agencyClients.map((c) => c.clientId);

  const monthlyRevenue =
    clientIds.length > 0
      ? await db.order
          .aggregate({
            where: {
              clientId: { in: clientIds },
              status: { not: "CANCELLED" },
              createdAt: { gte: startOfMonth },
            },
            _sum: { amount: true },
          })
          .then((r) => r._sum.amount ?? 0)
          .catch(() => 0)
      : 0;

  return NextResponse.json({
    tenant,
    usage: {
      clients: { current: clientCount, max: tenant.features.maxClients },
      admins: { current: 1, max: tenant.features.maxAdmins },
      revenue: { thisMonth: monthlyRevenue },
    },
    features: tenant.features,
  });
}

// ─────────────────────────────────────────────
// PATCH — update tenant (plan, isActive, customDomain, primaryColor)
// ─────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTenantsLoaded();
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const body = await req.json();

  // Check for /provision action
  if (body.action === "provision") {
    return provision(tenant);
  }

  const updates: Partial<TenantConfig> = {};

  if (body.plan && ["starter", "growth", "enterprise"].includes(body.plan)) {
    updates.plan = body.plan as TenantConfig["plan"];
    updates.features = TENANT_PLANS[updates.plan];
  }
  if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
  if (body.customDomain !== undefined) updates.customDomain = body.customDomain || undefined;
  if (body.primaryColor) updates.primaryColor = body.primaryColor;

  updateTenantConfig(slug, updates);
  return NextResponse.json({ tenant: getTenantBySlug(slug) });
}

// ─────────────────────────────────────────────
// POST — provision (creates default WhiteLabelConfig)
// ─────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTenantsLoaded();
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  return provision(tenant);
}

async function provision(tenant: TenantConfig) {
  // Upsert WhiteLabelConfig for this agency
  const wlConfig = await db.whiteLabelConfig.upsert({
    where: { agencyId: tenant.id },
    create: {
      agencyId: tenant.id,
      companyName: tenant.name,
      primaryColor: tenant.primaryColor,
      customDomain: tenant.customDomain ?? null,
      logo: tenant.logoUrl ?? null,
      isActive: true,
    },
    update: {
      companyName: tenant.name,
      primaryColor: tenant.primaryColor,
      customDomain: tenant.customDomain ?? null,
    },
  });

  return NextResponse.json({ success: true, whiteLabelConfig: wlConfig });
}
