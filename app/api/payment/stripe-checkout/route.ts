import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new (require("stripe").default)(process.env.STRIPE_SECRET_KEY)
  : null;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://kvlbusinesssolutions.com";

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
    const { planId } = body;

    if (!planId) {
      return NextResponse.json({ error: "planId is required" }, { status: 400 });
    }

    // Fetch the plan
    const plan = await db.stripePlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    if (!plan.isActive) {
      return NextResponse.json({ error: "Plan is not active" }, { status: 400 });
    }

    // Fetch client details
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, email: true },
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Get or create StripeCustomer
    let stripeCustomerId: string;
    const existingCustomer = await db.stripeCustomer.findUnique({
      where: { clientId },
    });

    if (existingCustomer) {
      stripeCustomerId = existingCustomer.stripeCustomerId;
    } else {
      // Create new Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: client.email,
        name: client.name,
        metadata: { clientId },
      });
      stripeCustomerId = stripeCustomer.id;

      // Save to DB
      await db.stripeCustomer.create({
        data: {
          clientId,
          stripeCustomerId,
        },
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${SITE_URL}/client-portal?tab=billing&success=1`,
      cancel_url: `${SITE_URL}/client-portal?tab=billing&cancelled=1`,
      metadata: { clientId, planId },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("[stripe-checkout POST]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
