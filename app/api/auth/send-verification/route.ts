import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { sendEmail } from "@/lib/email-service";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com";

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await db.client.findUnique({ where: { id: user.id } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (client.emailVerified) {
      return NextResponse.json({ message: "Already verified" });
    }

    const token = randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 86400000); // 24 hours

    await db.client.update({
      where: { id: client.id },
      data: {
        verificationToken: token,
        verificationExpiry: expiry,
      },
    });

    const verifyUrl = `${SITE_URL}/verify-email?token=${token}`;

    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0a0a14;color:#e2e8f0;border-radius:12px;">
        <h1 style="color:#d4a843;margin:0 0 16px;">Verify Your Email</h1>
        <p style="margin:0 0 24px;line-height:1.6;">Hi ${client.name},<br/><br/>Click the button below to verify your email address. This link expires in 24 hours.</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#d4a843;color:#0a0a14;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;">Verify Email</a>
        <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">If the button doesn't work, copy this link:<br/><a href="${verifyUrl}" style="color:#d4a843;word-break:break-all;">${verifyUrl}</a></p>
        <hr style="margin:32px 0;border:none;border-top:1px solid #1e293b;"/>
        <p style="margin:0;font-size:12px;color:#64748b;">KVL TECH — kvlbusinesssolutions.com</p>
      </div>
    `;

    sendEmail(client.email, "Verify your KVL TECH account", html).catch((err) =>
      console.error("[email] send-verification failed:", err)
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("send-verification error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
