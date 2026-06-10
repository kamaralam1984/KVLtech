import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const { amount, productSlug, plan, name, phone, email } = await req.json();

    if (!amount || !productSlug || !plan || !name || !phone || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise mein
      currency: "INR",
      receipt: `kvl_${Date.now()}`,
      notes: { productSlug, plan, name, phone, email },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    const errStr = JSON.stringify(err, null, 2);
    const msg = err?.error?.description || err?.message || errStr;
    console.error("Razorpay create-order error:", errStr);
    return NextResponse.json({ error: `Payment failed: ${msg}` }, { status: 500 });
  }
}
