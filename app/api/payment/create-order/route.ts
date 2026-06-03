import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { amount, productSlug, plan, name, phone, email } = await req.json();

    if (!amount || !productSlug || !plan || !name || !phone || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise mein
      currency: "INR",
      receipt: `kvl_${productSlug}_${Date.now()}`,
      notes: { productSlug, plan, name, phone, email },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 });
  }
}
