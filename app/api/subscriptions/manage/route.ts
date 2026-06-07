import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const client = await requireAuth(req);
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, subscriptionId } = await req.json();

  if (!action || !subscriptionId) {
    return NextResponse.json({ error: "action and subscriptionId are required" }, { status: 400 });
  }

  // Find subscription and verify ownership
  const subscription = await db.subscription.findFirst({
    where: {
      id: subscriptionId,
      clientId: (client as any).id,
    },
  });

  if (!subscription) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }

  let newStatus: string;

  switch (action) {
    case "pause":
      if (subscription.status !== "ACTIVE") {
        return NextResponse.json({ error: "Only active subscriptions can be paused" }, { status: 400 });
      }
      newStatus = "PAUSED";
      break;
    case "cancel":
      if (subscription.status === "CANCELLED") {
        return NextResponse.json({ error: "Subscription is already cancelled" }, { status: 400 });
      }
      newStatus = "CANCELLED";
      break;
    case "resume":
      if (subscription.status !== "PAUSED") {
        return NextResponse.json({ error: "Only paused subscriptions can be resumed" }, { status: 400 });
      }
      newStatus = "ACTIVE";
      break;
    default:
      return NextResponse.json({ error: "Invalid action. Use: pause, cancel, or resume" }, { status: 400 });
  }

  const updated = await db.subscription.update({
    where: { id: subscriptionId },
    data: { status: newStatus as any },
  });

  return NextResponse.json({ subscription: updated });
}
