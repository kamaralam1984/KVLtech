import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new (require("stripe").default)(process.env.STRIPE_SECRET_KEY)
  : null;

// Required for raw body access in Next.js App Router
export const config = {
  api: { bodyParser: false },
};

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured. Set STRIPE_SECRET_KEY in .env" },
      { status: 503 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error("[stripe-webhook] Missing signature or webhook secret");
    return NextResponse.json({ received: true });
  }

  let event: any;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("[stripe-webhook] Signature verification failed:", err.message);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const { clientId, planId } = session.metadata || {};
        const stripeSubId = session.subscription;
        const stripeCustomerId = session.customer;

        if (!clientId || !planId || !stripeSubId) {
          console.warn("[stripe-webhook] checkout.session.completed: missing metadata", session.metadata);
          break;
        }

        // Fetch subscription details from Stripe for period info
        const now = new Date();
        let periodStart: Date = now;
        let periodEnd: Date = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days fallback
        try {
          const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
          periodStart = new Date((stripeSub as any).current_period_start * 1000);
          periodEnd = new Date((stripeSub as any).current_period_end * 1000);
        } catch (e) {
          console.warn("[stripe-webhook] Could not retrieve subscription details:", e);
        }

        // Upsert StripeSubscription
        await db.stripeSubscription.upsert({
          where: { stripeSubId },
          create: {
            clientId,
            stripeSubId,
            stripePlanId: planId,
            stripeCustomerId,
            status: "active",
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
          },
          update: {
            status: "active",
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const stripeSubId = subscription.id;

        const updateData: Record<string, unknown> = {
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        };
        if (subscription.current_period_end) {
          updateData.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        }
        if (subscription.current_period_start) {
          updateData.currentPeriodStart = new Date(subscription.current_period_start * 1000);
        }
        if (subscription.trial_end) {
          updateData.trialEnd = new Date(subscription.trial_end * 1000);
        }

        await db.stripeSubscription.updateMany({
          where: { stripeSubId },
          data: updateData,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const stripeSubId = subscription.id;

        await db.stripeSubscription.updateMany({
          where: { stripeSubId },
          data: { status: "cancelled" },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const stripeSubId = invoice.subscription;

        if (stripeSubId) {
          await db.stripeSubscription.updateMany({
            where: { stripeSubId },
            data: { status: "past_due" },
          });
        }
        break;
      }

      default:
        // Unhandled event type — ignore
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook] Error processing event:", event.type, err);
    // Still return 200 to prevent Stripe from retrying
  }

  return NextResponse.json({ received: true });
}
