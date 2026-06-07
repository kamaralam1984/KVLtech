import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new (require("stripe").default)(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = (auth as any).id as string;

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured. Set STRIPE_SECRET_KEY in .env" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { stripeSubId, newPriceId } = body;

    if (!stripeSubId || !newPriceId) {
      return NextResponse.json({ error: "stripeSubId and newPriceId are required" }, { status: 400 });
    }

    // Verify the subscription belongs to this client
    const dbSub = await db.stripeSubscription.findFirst({
      where: { stripeSubId, clientId },
    });

    if (!dbSub) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    // Fetch current subscription from Stripe to get item ID
    const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
    const itemId = (stripeSub as any).items.data[0]?.id;

    if (!itemId) {
      return NextResponse.json({ error: "Could not find subscription item on Stripe" }, { status: 400 });
    }

    // Find the new plan in DB by price ID
    const newPlan = await db.stripePlan.findUnique({
      where: { stripePriceId: newPriceId },
    });

    // Update the subscription on Stripe with proration
    const updatedStripeSub = await stripe.subscriptions.update(stripeSubId, {
      items: [{ id: itemId, price: newPriceId }],
      proration_behavior: "create_prorations",
    });

    // Update our DB record
    const updatedSub = await db.stripeSubscription.update({
      where: { stripeSubId },
      data: {
        ...(newPlan ? { stripePlanId: newPlan.id } : {}),
        status: (updatedStripeSub as any).status,
        currentPeriodEnd: (updatedStripeSub as any).current_period_end
          ? new Date((updatedStripeSub as any).current_period_end * 1000)
          : undefined,
      },
    });

    return NextResponse.json({ success: true, subscription: updatedSub });
  } catch (err: any) {
    console.error("[subscriptions/upgrade POST]", err);
    if (err?.type === "StripeInvalidRequestError") {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to upgrade subscription" }, { status: 500 });
  }
}
