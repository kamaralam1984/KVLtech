import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user || user.type !== "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId, rating, title, comment } = await req.json();

    if (!orderId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Valid orderId aur rating (1-5) required hai" }, { status: 400 });
    }

    const order = await db.order.findFirst({
      where: { id: orderId, clientId: user.id, status: "DELIVERED" },
    });
    if (!order) {
      return NextResponse.json({ error: "Delivered order not found" }, { status: 404 });
    }

    const review = await db.review.upsert({
      where: { orderId },
      create: { orderId, clientId: user.id, rating, title, comment },
      update: { rating, title, comment },
    });

    return NextResponse.json({ success: true, review });
  } catch (err) {
    console.error("Review error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
