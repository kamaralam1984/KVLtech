import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { sendOrderConfirmationSMS } from "@/lib/sms";
import { enqueueJob } from "@/lib/job-queue";

function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expected === signature;
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `KVL-${year}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      productSlug,
      plan,
      amount,
      name,
      phone,
      email,
      business,
    } = await req.json();

    // 1. Verify Razorpay signature
    if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Find product in DB
    const product = await db.product.findFirst({ where: { slug: productSlug } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // 3. Find or create client
    let client = await db.client.findUnique({ where: { email } });
    if (!client) {
      const tempPassword = await bcrypt.hash(phone.replace(/\D/g, "").slice(-6), 10);
      client = await db.client.create({
        data: {
          name,
          email,
          phone,
          password: tempPassword,
          company: business || null,
          city: null,
        },
      });
    }

    // 4. Create order
    const planMap: Record<string, "BASIC" | "PREMIUM" | "CUSTOM"> = {
      Basic: "BASIC", Premium: "PREMIUM", Custom: "CUSTOM",
    };
    const deliveryDays = plan === "Basic" ? 5 : plan === "Premium" ? 2 : 15;
    const deliveryEst = new Date();
    deliveryEst.setDate(deliveryEst.getDate() + deliveryDays);

    let orderNumber = generateOrderNumber();
    // ensure uniqueness
    while (await db.order.findUnique({ where: { orderNumber } })) {
      orderNumber = generateOrderNumber();
    }

    const order = await db.order.create({
      data: {
        orderNumber,
        clientId: client.id,
        productId: product.id,
        plan: planMap[plan] || "BASIC",
        status: "PAYMENT_CONFIRMED",
        progress: 10,
        amount,
        deliveryEst,
        notes: business ? `Business: ${business}` : null,
      },
    });

    // 5. Create payment record
    await db.payment.create({
      data: {
        orderId: order.id,
        amount,
        currency: "INR",
        status: "CAPTURED",
        gateway: "razorpay",
        gatewayOrderId: razorpay_order_id,
        gatewayPaymentId: razorpay_payment_id,
        gatewaySignature: razorpay_signature,
        paidAt: new Date(),
      },
    });

    // 6. Status history entry
    await db.orderStatusHistory.create({
      data: { orderId: order.id, status: "PAYMENT_CONFIRMED", note: "Payment received via Razorpay" },
    });

    // 7. Welcome notification
    await db.notification.create({
      data: {
        clientId: client.id,
        title: "Order confirmed!",
        body: `Aapka order #${orderNumber} confirm ho gaya hai. Humari team aapko jald contact karegi.`,
        type: "PAYMENT",
        color: "#16A34A",
      },
    });

    // 8. Queue Telegram notification (low priority, non-blocking)
    enqueueJob(
      "send_telegram",
      { message: `<b>New Order</b>\nOrder: ${orderNumber}\nAmount: ₹${(amount / 100).toLocaleString("en-IN")}\nPlan: ${plan}\nClient: ${client.name}` },
      { priority: "low" }
    ).catch(() => {});

    // 9. Queue confirmation email (high priority) + SMS (fire-and-forget)
    enqueueJob(
      "send_email",
      {
        to: client.email,
        subject: `Order Confirmed — ${orderNumber}`,
        html: `<p>Hi ${client.name},</p><p>Your order <strong>${orderNumber}</strong> for <strong>${product.name}</strong> (${plan}) has been confirmed.</p><p>Amount paid: ₹${(amount / 100).toLocaleString("en-IN")}</p><p>Our team will be in touch shortly.</p><p>— KVL TECH</p>`,
        text: `Hi ${client.name}, your order ${orderNumber} for ${product.name} (${plan}) has been confirmed. Amount: ₹${(amount / 100).toLocaleString("en-IN")}. Our team will be in touch shortly.`,
      },
      { priority: "high" }
    ).catch(() => {});

    if (client.phone) {
      sendOrderConfirmationSMS(client.phone, client.name, order.orderNumber)
        .catch(err => console.error("SMS send failed:", err));
    }

    // 9. Issue JWT for auto-login
    const token = signToken({ id: client.id, email: client.email, type: "client" });

    const res = NextResponse.json({ success: true, orderNumber, clientId: client.id });
    res.cookies.set("kvl_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    return res;
  } catch (err) {
    console.error("Payment verify error:", err);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
