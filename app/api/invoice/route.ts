import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (!user || user.type !== "client")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ error: "Order ID required" }, { status: 400 });

  try {
    const order = await db.order.findUnique({
      where: { id: orderId, clientId: user.id },
      include: {
        client: { select: { name: true, email: true, phone: true, company: true, city: true } },
        product: { select: { name: true, category: true } },
        payment: { select: { gatewayPaymentId: true, paidAt: true, method: true } },
      },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const planLabel = order.plan.charAt(0) + order.plan.slice(1).toLowerCase();
    const paidDate = order.payment?.paidAt
      ? new Date(order.payment.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
      : new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${order.orderNumber} — KVL TECH</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8f9fc; padding: 40px 20px; color: #1A1A2E; }
    .invoice { max-width: 700px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #0B1437; padding: 32px 40px; display: flex; justify-content: space-between; align-items: flex-start; }
    .brand h1 { color: #C9A227; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .brand p { color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 3px; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { color: #fff; font-size: 20px; font-weight: 700; }
    .invoice-meta p { color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 4px; }
    .body { padding: 36px 40px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .info-block h4 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9CA3AF; margin-bottom: 8px; }
    .info-block p { font-size: 14px; color: #1A1A2E; line-height: 1.6; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .items-table thead tr { background: #F8F9FC; }
    .items-table th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; }
    .items-table td { padding: 14px; font-size: 14px; color: #1A1A2E; border-bottom: 1px solid #F3F4F6; }
    .items-table tr:last-child td { border-bottom: none; }
    .total-row { background: #FFF8E6; }
    .total-row td { font-weight: 700; font-size: 16px; padding: 16px 14px; }
    .total-amount { color: #C9A227; font-size: 20px; }
    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .status-paid { background: #DCFCE7; color: #16A34A; }
    .footer { background: #F8F9FC; padding: 20px 40px; border-top: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; }
    .footer p { font-size: 11px; color: #9CA3AF; }
    .payment-id { font-family: monospace; font-size: 11px; color: #6B7280; margin-top: 6px; }
    @media print { body { background: #fff; padding: 0; } .invoice { box-shadow: none; border-radius: 0; } }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="brand">
        <h1>KVL TECH</h1>
        <p>kvlbusinesssolutions.com</p>
        <p style="margin-top:2px;">INDIA</p>
      </div>
      <div class="invoice-meta">
        <h2>INVOICE</h2>
        <p>${order.orderNumber}</p>
        <p>Date: ${paidDate}</p>
      </div>
    </div>
    <div class="body">
      <div class="info-grid">
        <div class="info-block">
          <h4>Bill To</h4>
          <p><strong>${order.client.name}</strong></p>
          ${order.client.company ? `<p>${order.client.company}</p>` : ""}
          <p>${order.client.email}</p>
          ${order.client.phone ? `<p>${order.client.phone}</p>` : ""}
          ${order.client.city ? `<p>${order.client.city}</p>` : ""}
        </div>
        <div class="info-block">
          <h4>Payment Info</h4>
          <p>Status: <span class="status-badge status-paid">PAID</span></p>
          <p>Date: ${paidDate}</p>
          ${order.payment?.method ? `<p>Method: ${order.payment.method}</p>` : ""}
          ${order.payment?.gatewayPaymentId ? `<p class="payment-id">Ref: ${order.payment.gatewayPaymentId}</p>` : ""}
        </div>
      </div>
      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Plan</th>
            <th style="text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${order.product.name}</strong>
              <br/><span style="font-size:12px;color:#6B7280;">${order.product.category} Development Service</span>
            </td>
            <td>${planLabel} Plan</td>
            <td style="text-align:right;">₹${order.amount.toLocaleString("en-IN")}</td>
          </tr>
          <tr class="total-row">
            <td colspan="2" style="text-align:right;color:#1A1A2E;">Total Paid</td>
            <td style="text-align:right;" class="total-amount">₹${order.amount.toLocaleString("en-IN")}</td>
          </tr>
        </tbody>
      </table>
      <p style="font-size:12px;color:#9CA3AF;text-align:center;">Thank you for choosing KVL TECH. For support: support@kvlbusinesssolutions.com</p>
    </div>
    <div class="footer">
      <p>KVL TECH · GSTIN: ${process.env.BUSINESS_GST || "GSTIN Pending"} · PAN: ${process.env.BUSINESS_PAN || "PAN Pending"}</p>
      <p>© ${new Date().getFullYear()} KVL TECH</p>
    </div>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="invoice-${order.orderNumber}.html"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
