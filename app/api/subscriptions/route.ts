import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth, requireAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const client = requireAuth(req)
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const subscriptions = await db.subscription.findMany({
      where: { clientId: client.id },
      include: { coupon: { select: { code: true, discountType: true, discountValue: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(subscriptions)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const client = requireAuth(req)
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { planName, amount, billingCycle, nextBillingAt, razorpaySubId, couponId } = await req.json()
    if (!planName || !amount) return NextResponse.json({ error: "planName and amount required" }, { status: 400 })
    const subscription = await db.subscription.create({
      data: {
        clientId: client.id,
        planName,
        amount,
        billingCycle: billingCycle || "monthly",
        nextBillingAt: nextBillingAt ? new Date(nextBillingAt) : null,
        razorpaySubId: razorpaySubId || null,
        couponId: couponId || null,
      },
    })
    return NextResponse.json(subscription, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { id, status } = await req.json()
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 })
    const updated = await db.subscription.update({
      where: { id },
      data: {
        status,
        ...(status === "CANCELLED" && { cancelledAt: new Date() }),
      },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
