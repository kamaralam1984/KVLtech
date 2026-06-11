import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email";
import { sendOrderStatusSMS } from "@/lib/sms";
import { logAudit } from "@/lib/audit";
import { wsEvents } from "@/lib/ws-broadcast";
import { metrics } from "@/lib/metrics";

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

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { clientId, productId, plan, amount, notes, deliveryEst, status } = await req.json();
    if (!clientId || !productId || !plan || !amount)
      return NextResponse.json({ error: "clientId, productId, plan, amount required" }, { status: 400 });

    // Verify client and product exist
    const [client, product] = await Promise.all([
      db.client.findUnique({ where: { id: clientId } }),
      db.product.findUnique({ where: { id: productId } }),
    ]);
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Generate unique order number
    let orderNumber = "";
    do {
      orderNumber = "KVL" + Math.floor(Math.random() * 900000 + 100000);
    } while (await db.order.findUnique({ where: { orderNumber } }));

    const order = await db.order.create({
      data: {
        orderNumber,
        clientId,
        productId,
        plan: plan as any,
        status: (status || "PAYMENT_CONFIRMED") as any,
        progress: 10,
        amount,
        notes: notes || null,
        deliveryEst: deliveryEst ? new Date(deliveryEst) : null,
      },
    });

    await db.orderStatusHistory.create({
      data: { orderId: order.id, status: order.status, note: "Order created by admin" },
    });

    // Notify client
    await db.notification.create({
      data: {
        clientId,
        title: "New Order Created",
        body: `Aapka order #${orderNumber} — ${product.name} create ho gaya hai!`,
        type: "ORDER_UPDATE",
        color: "#C9A227",
      },
    });

    logAudit(req, "CREATE", "orders", order.id, `Order ${orderNumber} created for client ${client.name}`)
    metrics.ordersTotal.inc({ status: order.status })

    return NextResponse.json({ success: true, order });
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
        ...(status && { status: status as any }),
        ...(progress !== undefined && { progress: Number(progress) }),
        ...(liveUrl && { liveUrl }),
        ...(filesUrl && { filesUrl }),
        ...(status === "DELIVERED" && { deliveredAt: new Date() }),
      },
    });

    if (status) {
      await db.orderStatusHistory.create({
        data: { orderId: id, status: status as any, note: `Status updated to ${status} by admin` },
      });
      // Notify client (in-app)
      await db.notification.create({
        data: {
          clientId: order.clientId,
          title: `Order update: ${status.replace(/_/g, " ")}`,
          body: `Aapka order #${order.orderNumber} ab ${status.replace(/_/g, " ")} stage mein hai.`,
          type: "ORDER_UPDATE",
          color: status === "DELIVERED" ? "#16A34A" : "#0891B2",
        },
      });
      // Email notification (fire-and-forget)
      const emailStatuses = ["DESIGN_STARTED", "DEVELOPMENT", "REVIEW_TESTING", "DELIVERED"];
      if (emailStatuses.includes(status)) {
        const client = await db.client.findUnique({ where: { id: order.clientId }, select: { name: true, email: true, phone: true } });
        const product = await db.product.findUnique({ where: { id: order.productId }, select: { name: true } });
        if (client && product) {
          sendOrderStatusEmail({
            to: client.email, name: client.name,
            orderNumber: order.orderNumber, productName: product.name, status,
          }).catch(err => console.error("Status email failed:", err));
          if (client.phone) {
            sendOrderStatusSMS(client.phone, client.name, order.orderNumber, status)
              .catch(err => console.error("Status SMS failed:", err));
          }
        }
      }
    }

    if (status) {
      logAudit(req, "UPDATE", "orders", id, `Status changed to ${status}`)
      wsEvents.orderStatusChanged(order.id, status, order.clientId)
      metrics.ordersTotal.inc({ status })
    }

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
