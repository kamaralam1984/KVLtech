import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { sendWelcomeSequenceEmail } from "@/lib/email";
import { sendEmail } from "@/lib/email-service";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, company } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email aur password required hain" }, { status: 400 });
    }

    const exists = await db.client.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) {
      return NextResponse.json({ error: "Yeh email already registered hai" }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);

    const client = await db.client.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        company,
        password: hash,
      },
    });

    // Generate and store email verification token
    const verToken = randomBytes(32).toString("hex");
    await db.client.update({
      where: { id: client.id },
      data: {
        verificationToken: verToken,
        verificationExpiry: new Date(Date.now() + 86400000),
      },
    });

    // Fire-and-forget verification email
    const verifyUrl = `${SITE_URL}/verify-email?token=${verToken}`;
    const verifyHtml = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0a0a14;color:#e2e8f0;border-radius:12px;">
        <h1 style="color:#d4a843;margin:0 0 16px;">Welcome to KVL TECH!</h1>
        <p style="margin:0 0 24px;line-height:1.6;">Hi ${client.name},<br/><br/>Please verify your email address to activate your account. This link expires in 24 hours.</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#d4a843;color:#0a0a14;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;">Verify Email</a>
        <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">If the button doesn't work, copy this link:<br/><a href="${verifyUrl}" style="color:#d4a843;word-break:break-all;">${verifyUrl}</a></p>
        <hr style="margin:32px 0;border:none;border-top:1px solid #1e293b;"/>
        <p style="margin:0;font-size:12px;color:#64748b;">KVL TECH — kvlbusinesssolutions.com</p>
      </div>
    `;
    sendEmail(client.email, "Verify your KVL TECH account", verifyHtml).catch((err) =>
      console.error("[email] verification email failed:", err)
    );

    // Fire-and-forget welcome email — never blocks registration
    sendWelcomeSequenceEmail({ name: client.name, email: client.email, company: client.company ?? undefined }).catch(
      (err) => console.error("[email] sendWelcomeSequenceEmail failed:", err)
    );

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
    console.error("Register error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
