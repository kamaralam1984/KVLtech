import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { analytics, marketing, necessary } = await req.json();

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;

    await db.cookieConsent.create({
      data: {
        ip,
        analytics: Boolean(analytics),
        marketing: Boolean(marketing),
        necessary: necessary !== false,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Cookie consent error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use localStorage to check consent on client side." });
}
