import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new (require("stripe").default)(process.env.STRIPE_SECRET_KEY)
  : null;

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const plans = await db.stripePlan.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ plans });
  } catch (err) {
    console.error("[stripe-plans GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, stripePriceId, amount, currency, interval, features, sortOrder } = body;

    if (!name || !stripePriceId) {
      return NextResponse.json({ error: "name and stripePriceId are required" }, { status: 400 });
    }

    // Optionally verify the price exists on Stripe
    if (stripe) {
      try {
        await stripe.prices.retrieve(stripePriceId);
      } catch {
        return NextResponse.json({ error: "Invalid Stripe Price ID — not found on Stripe" }, { status: 400 });
      }
    }

    const plan = await db.stripePlan.create({
      data: {
        name,
        description: description || null,
        stripePriceId,
        amount: amount ? Number(amount) : 0,
        currency: currency || "usd",
        interval: interval || "month",
        features: features || [],
        sortOrder: sortOrder != null ? Number(sortOrder) : 0,
        isActive: true,
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "A plan with this Stripe Price ID already exists" }, { status: 409 });
    }
    console.error("[stripe-plans POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, description, stripePriceId, amount, currency, interval, features, isActive, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (stripePriceId !== undefined) data.stripePriceId = stripePriceId;
    if (amount !== undefined) data.amount = Number(amount);
    if (currency !== undefined) data.currency = currency;
    if (interval !== undefined) data.interval = interval;
    if (features !== undefined) data.features = features;
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);

    const plan = await db.stripePlan.update({
      where: { id },
      data,
    });

    return NextResponse.json({ plan });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    console.error("[stripe-plans PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id query param is required" }, { status: 400 });
    }

    await db.stripePlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    console.error("[stripe-plans DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
