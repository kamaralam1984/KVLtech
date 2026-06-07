import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getWhiteLabelConfig } from "@/lib/white-label";

const SAME_STATE_CITIES = [
  "Uttar Pradesh",
  "UP",
  "Delhi",
  "Noida",
  "Gurugram",
  "Gurgaon",
  "Faridabad",
  "Ghaziabad",
  "Greater Noida",
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const user = requireAuth(req);
  if (!user || user.type !== "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;

  try {
    const wl = await getWhiteLabelConfig();

    const order = await db.order.findUnique({
      where: { id: orderId, clientId: user.id },
      include: {
        client: {
          select: {
            name: true,
            email: true,
            phone: true,
            company: true,
            city: true,
          },
        },
        product: {
          select: {
            name: true,
            category: true,
          },
        },
        payment: {
          select: {
            gatewayPaymentId: true,
            paidAt: true,
            method: true,
            status: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const amount = order.amount;
    const base = Math.round((amount / 1.18) * 100) / 100;
    const gst = Math.round((amount - base) * 100) / 100;

    const clientCity = order.client.city || "";
    const isSameState = SAME_STATE_CITIES.some((loc) =>
      clientCity.toLowerCase().includes(loc.toLowerCase())
    );

    const cgst = isSameState ? Math.round((gst / 2) * 100) / 100 : 0;
    const sgst = isSameState ? Math.round((gst / 2) * 100) / 100 : 0;
    const igst = isSameState ? 0 : gst;

    const planLabel =
      order.plan.charAt(0).toUpperCase() +
      order.plan.slice(1).toLowerCase();

    const invoiceDate = order.payment?.paidAt
      ? new Date(order.payment.paidAt)
      : new Date(order.createdAt);

    const paymentStatus = order.payment?.status ?? "PENDING";

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      invoiceDate: invoiceDate.toISOString(),
      plan: planLabel,
      amount,
      base,
      gst,
      cgst,
      sgst,
      igst,
      isSameState,
      paymentStatus,
      gatewayPaymentId: order.payment?.gatewayPaymentId ?? null,
      paidAt: order.payment?.paidAt ?? null,
      paymentMethod: order.payment?.method ?? null,
      client: {
        name: order.client.name,
        email: order.client.email,
        phone: order.client.phone ?? null,
        company: order.client.company ?? null,
        city: order.client.city ?? null,
      },
      product: {
        name: order.product.name,
        category: order.product.category,
      },
      seller: {
        name: wl.companyName,
        gst: "29AABCU9603R1ZM",
        pan: "AABCU9603R",
        address: "Sector 62, Noida, Uttar Pradesh 201309",
        phone: "+91 9999999999",
        email: wl.supportEmail,
        website: "kvlbusinesssolutions.com",
      },
      // White-label branding for client-side rendering
      wlCompanyName: wl.companyName,
      wlLogo: wl.logo,
      wlSupportEmail: wl.supportEmail,
      wlPrimaryColor: wl.primaryColor,
    });
  } catch (err) {
    console.error("Invoice fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
