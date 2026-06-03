import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders, lastMonthOrders,
      payments, lastMonthPayments,
      totalLeads, lastMonthLeads,
      clients,
      ordersByStatus,
      recentOrders,
      recentLeads,
      topProducts,
      avgRating,
      monthlyRevenue,
    ] = await Promise.all([
      db.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      db.order.count({ where: { createdAt: { gte: lastMonth, lte: endLastMonth } } }),

      db.payment.aggregate({
        where: { status: "CAPTURED" },
        _sum: { amount: true },
      }),
      db.payment.aggregate({
        where: { status: "CAPTURED", paidAt: { gte: lastMonth, lte: endLastMonth } },
        _sum: { amount: true },
      }),

      db.contactLead.count({ where: { createdAt: { gte: startOfMonth } } }),
      db.contactLead.count({ where: { createdAt: { gte: lastMonth, lte: endLastMonth } } }),

      db.client.count(),

      db.order.groupBy({ by: ["status"], _count: { id: true } }),

      db.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { name: true, phone: true, city: true } },
          product: { select: { name: true } },
          payment: { select: { status: true } },
        },
      }),

      db.contactLead.findMany({
        where: { status: { in: ["NEW", "CONTACTED"] } },
        orderBy: { createdAt: "desc" },
        take: 9,
      }),

      db.order.groupBy({
        by: ["productId"],
        _count: { id: true },
        _sum: { amount: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),

      db.review.aggregate({ _avg: { rating: true } }),

      // Last 12 months revenue
      db.$queryRaw<{ month: string; revenue: number }[]>`
        SELECT TO_CHAR(p."paidAt", 'Mon') AS month,
               COALESCE(SUM(p.amount), 0)::int AS revenue
        FROM payments p
        WHERE p.status = 'CAPTURED'
          AND p."paidAt" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', p."paidAt"), TO_CHAR(p."paidAt", 'Mon')
        ORDER BY DATE_TRUNC('month', p."paidAt") ASC
      `,
    ]);

    // Enrich top products with names
    const productIds = topProducts.map(p => p.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });
    const productMap = Object.fromEntries(products.map(p => [p.id, p.name]));

    // Conversion rate
    const totalLeadsAll = await db.contactLead.count();
    const converted = await db.contactLead.count({ where: { status: "WON" } });
    const convRate = totalLeadsAll > 0 ? ((converted / totalLeadsAll) * 100).toFixed(1) : "0";

    // Month-over-month changes
    const pct = (curr: number, prev: number) =>
      prev === 0 ? 100 : +((( curr - prev) / prev) * 100).toFixed(1);

    const thisMonthRevenue = await db.payment.aggregate({
      where: { status: "CAPTURED", paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
    });
    const lastMonthRevenue = await db.payment.aggregate({
      where: { status: "CAPTURED", paidAt: { gte: lastMonth, lte: endLastMonth } },
      _sum: { amount: true },
    });

    return NextResponse.json({
      stats: {
        revenue: {
          value: payments._sum.amount || 0,
          change: pct(thisMonthRevenue._sum.amount || 0, lastMonthRevenue._sum.amount || 0),
          label: "Total Revenue",
        },
        orders: {
          value: await db.order.count(),
          change: pct(totalOrders, lastMonthOrders),
          label: "Total Orders",
        },
        leads: {
          value: await db.contactLead.count(),
          change: pct(totalLeads, lastMonthLeads),
          label: "New Leads",
        },
        conversion: {
          value: parseFloat(convRate),
          change: 0,
          label: "Conversion Rate",
        },
        clients: { value: clients, change: 0, label: "Total Clients" },
        rating: {
          value: +(avgRating._avg.rating?.toFixed(1) || 0),
          change: 0,
          label: "Avg Rating",
        },
      },
      ordersByStatus: Object.fromEntries(ordersByStatus.map(s => [s.status, s._count.id])),
      recentOrders: recentOrders.map(o => ({
        id: o.orderNumber,
        client: o.client.name,
        phone: o.client.phone || "",
        city: o.client.city || "",
        product: o.product.name,
        plan: o.plan,
        amount: o.amount,
        status: o.status,
        date: o.createdAt.toISOString().split("T")[0],
        paymentStatus: o.payment?.status || "PENDING",
      })),
      recentLeads: recentLeads.map(l => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        email: l.email || "",
        interest: l.service || "General",
        source: l.source,
        status: l.status,
        date: l.createdAt.toISOString().split("T")[0],
        budget: l.budget || "",
        city: "",
      })),
      topProducts: topProducts.map(p => ({
        name: productMap[p.productId] || "Unknown",
        orders: p._count.id,
        revenue: p._sum.amount || 0,
        growth: 0,
      })),
      monthlyRevenue: monthlyRevenue as { month: string; revenue: number }[],
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
