import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getTenantBySlug, ensureTenantsLoaded } from "@/lib/tenant";
import { db } from "@/lib/db";

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

  const agencyId = tenant.id;
  const maxClients = tenant.features.maxClients;
  const maxAdmins = tenant.features.maxAdmins;

  // Get agency clients
  const agencyClients = await db.agencyClient
    .findMany({ where: { agencyId }, select: { clientId: true } })
    .catch(() => [] as { clientId: string }[]);
  const clientIds = agencyClients.map((c) => c.clientId);

  // Clients metric
  const currentClients = clientIds.length;

  // Admins metric (agency.adminId counts as 1 admin seat)
  const currentAdmins = 1;

  // Date helpers
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Orders metrics
  const [ordersThisMonth, ordersTotal] = await Promise.all([
    clientIds.length > 0
      ? db.order
          .count({ where: { clientId: { in: clientIds }, createdAt: { gte: startOfMonth } } })
          .catch(() => 0)
      : Promise.resolve(0),
    clientIds.length > 0
      ? db.order.count({ where: { clientId: { in: clientIds } } }).catch(() => 0)
      : Promise.resolve(0),
  ]);

  // Revenue metrics
  const [revenueThisMonth, revenueTotal] = await Promise.all([
    clientIds.length > 0
      ? db.order
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
      : Promise.resolve(0),
    clientIds.length > 0
      ? db.order
          .aggregate({
            where: { clientId: { in: clientIds }, status: { not: "CANCELLED" } },
            _sum: { amount: true },
          })
          .then((r) => r._sum.amount ?? 0)
          .catch(() => 0)
      : Promise.resolve(0),
  ]);

  // API calls this month (from ApiKeyLog by admin who owns API keys under this agency)
  // Since ApiKey is owned by adminId, not agencyId, we use a placeholder
  const apiCallsThisMonth = 0;

  const pct = (current: number, max: number) =>
    max >= 999999 ? 0 : Math.min(100, Math.round((current / max) * 100));

  return NextResponse.json({
    clients: {
      current: currentClients,
      max: maxClients,
      percentage: pct(currentClients, maxClients),
    },
    admins: {
      current: currentAdmins,
      max: maxAdmins,
      percentage: pct(currentAdmins, maxAdmins),
    },
    orders: {
      thisMonth: ordersThisMonth,
      total: ordersTotal,
    },
    revenue: {
      thisMonth: revenueThisMonth,
      total: revenueTotal,
    },
    apiCalls: {
      thisMonth: apiCallsThisMonth,
    },
    storageUsed: "0 MB",
  });
}
