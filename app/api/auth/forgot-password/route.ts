import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const client = await db.client.findUnique({ where: { email: email.toLowerCase().trim() } });

    // Always return 200 — don't reveal whether email exists
    if (!client) {
      return NextResponse.json({ success: true });
    }

    // Invalidate any existing unused tokens for this client
    await db.passwordResetToken.updateMany({
      where: { clientId: client.id, used: false },
      data: { used: true },
    });

    // Generate cryptographically secure token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.passwordResetToken.create({
      data: { token, clientId: client.id, expiresAt },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
    const resetUrl = `${siteUrl}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail({ to: client.email, name: client.name, resetUrl });
    } catch (emailErr) {
      console.error("[forgot-password] Email delivery failed:", emailErr);
      console.log("[forgot-password] RESET LINK (use this to test):", resetUrl);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
