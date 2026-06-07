import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscriptions = await db.stripeSubscription.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Enrich with client and plan info manually (no Prisma relations in schema)
    const clientIds = [...new Set(subscriptions.map(s => s.clientId))];
    const planIds = [...new Set(subscriptions.map(s => s.stripePlanId))];

    const [clients, plans] = await Promise.all([
      db.client.findMany({
        where: { id: { in: clientIds } },
        select: { id: true, name: true, email: true },
      }),
      db.stripePlan.findMany({
        where: { id: { in: planIds } },
        select: { id: true, name: true },
      }),
    ]);

    const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));
    const planMap = Object.fromEntries(plans.map(p => [p.id, p]));

    const enriched = subscriptions.map(sub => ({
      ...sub,
      client: clientMap[sub.clientId] || null,
      stripePlan: planMap[sub.stripePlanId] || null,
    }));

    return NextResponse.json({ subscriptions: enriched });
  } catch (err) {
    console.error("[admin/stripe-subscriptions GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
