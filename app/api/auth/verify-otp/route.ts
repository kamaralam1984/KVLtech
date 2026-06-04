import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { sendWelcomeSequenceEmail } from "@/lib/email";

// Import the shared OTP store from send-otp route
// Using a module-level singleton map accessible across routes
declare global {
  // eslint-disable-next-line no-var
  var kvlOtpStore: Map<string, {
    otp: string;
    expiry: number;
    sentAt: number;
    name: string;
    phone?: string;
    company?: string;
    password: string;
  }> | undefined;
}

// Use global to persist across hot-reloads in dev
if (!global.kvlOtpStore) {
  global.kvlOtpStore = new Map();
}
const otpStore = global.kvlOtpStore;

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const record = otpStore.get(emailLower);

    if (!record) {
      return NextResponse.json({ error: "OTP expired or not found. Please request a new one." }, { status: 400 });
    }

    if (Date.now() > record.expiry) {
      otpStore.delete(emailLower);
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    if (record.otp !== otp.trim()) {
      return NextResponse.json({ error: "Incorrect OTP. Please check and try again." }, { status: 400 });
    }

    // OTP verified — create account
    otpStore.delete(emailLower);

    const exists = await db.client.findUnique({ where: { email: emailLower } });
    if (exists) {
      return NextResponse.json({ error: "This email is already registered." }, { status: 409 });
    }

    const hash = await bcrypt.hash(record.password, 12);

    const client = await db.client.create({
      data: {
        name: record.name,
        email: emailLower,
        phone: record.phone,
        company: record.company,
        password: hash,
      },
    });

    // Fire-and-forget welcome email
    sendWelcomeSequenceEmail({
      name: client.name,
      email: client.email,
      company: client.company ?? undefined,
    }).catch(err => console.error("[email] welcome failed:", err));

    const token = signToken({ id: client.id, email: client.email, type: "client" });

    const res = NextResponse.json({
      success: true,
      token,
      client: { id: client.id, name: client.name, email: client.email },
    }, { status: 201 });

    res.cookies.set("kvl_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;

  } catch (err) {
    console.error("verify-otp error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
