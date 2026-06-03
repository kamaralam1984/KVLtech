import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (!user || user.type !== "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await db.order.findMany({
      where: { clientId: user.id },
      include: {
        product: { select: { name: true, category: true, photo: true } },
        payment: { select: { status: true, paidAt: true } },
        branding: { select: { status: true, companyName: true } },
        statusHistory: { orderBy: { changedAt: "desc" }, take: 5 },
        review: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Orders fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
