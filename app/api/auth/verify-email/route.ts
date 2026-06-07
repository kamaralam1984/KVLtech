import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(`${SITE_URL}/verify-email?error=invalid`);
    }

    const client = await db.client.findFirst({
      where: {
        verificationToken: token,
        verificationExpiry: { gte: new Date() },
      },
    });

    if (!client) {
      return NextResponse.redirect(`${SITE_URL}/verify-email?error=invalid`);
    }

    await db.client.update({
      where: { id: client.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    return NextResponse.redirect(`${SITE_URL}/verify-email?success=true`);
  } catch (err) {
    console.error("verify-email error:", err);
    return NextResponse.redirect(`${SITE_URL}/verify-email?error=invalid`);
  }
}
