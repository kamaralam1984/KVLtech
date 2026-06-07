import { NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"
import { db } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { sendOrderConfirmationEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()

    // 1. Verify webhook signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (secret) {
      const expectedSignature = createHmac("sha256", secret)
        .update(body)
        .digest("hex")
      const receivedSignature = req.headers.get("x-razorpay-signature") || ""
      if (expectedSignature !== receivedSignature) {
        console.warn("[Webhook] Invalid signature — rejected")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    // 2. Parse event
    const event = JSON.parse(body)
    const eventType: string = event.event

    // 3. Handle events
    if (eventType === "payment.captured") {
      const payment = event.payload?.payment?.entity
      if (!payment?.order_id) {
        return NextResponse.json({ received: true })
      }

      const existingPayment = await db.payment.findFirst({
        where: { gatewayOrderId: payment.order_id },
        include: {
          order: {
            include: {
              client: true,
              product: true,
            },
          },
        },
      })

      if (existingPayment) {
        // Update payment record
        await db.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: "CAPTURED",
            gatewayPaymentId: payment.id,
            method: payment.method ?? null,
            paidAt: new Date(payment.created_at * 1000),
          },
        })

        // Update order status to confirmed after successful payment
        await db.order.update({
          where: { id: existingPayment.orderId },
          data: { status: "PAYMENT_CONFIRMED" },
        })

        // Fire-and-forget confirmation email
        const { order } = existingPayment
        if (order?.client && order?.product) {
          sendOrderConfirmationEmail({
            to: order.client.email,
            name: order.client.name,
            orderNumber: order.orderNumber,
            productName: order.product.name,
            plan: order.plan,
            amount: existingPayment.amount,
          }).catch((err) => console.error("[Webhook] Email send failed:", err))
        }

        logAudit(
          req,
          "PAYMENT_CAPTURED",
          "payment",
          existingPayment.id,
          `Razorpay payment ${payment.id} captured for order ${payment.order_id}`
        )
      } else {
        console.warn("[Webhook] payment.captured — no payment record found for order_id:", payment.order_id)
      }
    } else if (eventType === "payment.failed") {
      const payment = event.payload?.payment?.entity
      if (!payment?.order_id) {
        return NextResponse.json({ received: true })
      }

      const existingPayment = await db.payment.findFirst({
        where: { gatewayOrderId: payment.order_id },
      })

      if (existingPayment) {
        await db.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: "FAILED",
            gatewayPaymentId: payment.id ?? null,
          },
        })

        await db.order.update({
          where: { id: existingPayment.orderId },
          data: { status: "PAYMENT_PENDING" },
        })

        logAudit(
          req,
          "PAYMENT_FAILED",
          "payment",
          existingPayment.id,
          `Razorpay payment failed for order ${payment.order_id}${payment.error_description ? ": " + payment.error_description : ""}`
        )
      } else {
        console.warn("[Webhook] payment.failed — no payment record found for order_id:", payment.order_id)
      }
    } else if (eventType === "refund.created") {
      const refund = event.payload?.refund?.entity
      logAudit(
        req,
        "REFUND_CREATED",
        "payment",
        refund?.payment_id ?? undefined,
        `Refund created: ${refund?.id ?? "unknown"}, amount: ${refund?.amount ?? "?"}`
      )
    }

    // Always return 200 so Razorpay doesn't retry
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("[Webhook] Error processing event:", err)
    // Still return 200 to avoid Razorpay retrying on parse errors
    return NextResponse.json({ received: true })
  }
}
