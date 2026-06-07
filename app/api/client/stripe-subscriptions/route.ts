import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = (auth as any).id as string;

  try {
    const subscriptions = await db.stripeSubscription.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ subscriptions });
  } catch (err) {
    console.error("[client/stripe-subscriptions GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
