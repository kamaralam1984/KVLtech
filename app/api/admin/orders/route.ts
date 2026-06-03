import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  try {
    const orders = await db.order.findMany({
      where: {
        AND: [
          status ? { status: status as any } : {},
          search ? {
            OR: [
              { orderNumber: { contains: search, mode: "insensitive" } },
              { client: { name: { contains: search, mode: "insensitive" } } },
              { product: { name: { contains: search, mode: "insensitive" } } },
            ],
          } : {},
        ],
      },
      include: {
        client: { select: { name: true, phone: true, city: true, email: true } },
        product: { select: { name: true, category: true } },
        payment: { select: { status: true, paidAt: true } },
        branding: { select: { status: true, companyName: true } },
        review: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, status, progress, liveUrl, filesUrl } = await req.json();
    if (!id) return NextResponse.json({ error: "Order ID required" }, { status: 400 });

    const order = await db.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(progress !== undefined && { progress }),
        ...(liveUrl && { liveUrl }),
        ...(filesUrl && { filesUrl }),
        ...(status === "DELIVERED" && { deliveredAt: new Date() }),
      },
    });

    if (status) {
      await db.orderStatusHistory.create({
        data: { orderId: id, status, note: `Status updated to ${status} by admin` },
      });
      // Notify client
      await db.notification.create({
        data: {
          clientId: order.clientId,
          title: `Order update: ${status.replace(/_/g, " ")}`,
          body: `Aapka order #${order.orderNumber} ab ${status.replace(/_/g, " ")} stage mein hai.`,
          type: "ORDER_UPDATE",
          color: status === "DELIVERED" ? "#16A34A" : "#0891B2",
        },
      });
    }

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
