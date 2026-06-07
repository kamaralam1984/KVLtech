import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const record = await db.passwordResetToken.findUnique({ where: { token } });

    if (!record || record.used) {
      return NextResponse.json({ error: "This reset link is invalid or has already been used" }, { status: 400 });
    }
    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    await db.$transaction([
      db.client.update({ where: { id: record.clientId }, data: { password: hashed } }),
      db.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Validate token without consuming it (GET)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ valid: false });

  const record = await db.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.used || record.expiresAt < new Date()) {
    return NextResponse.json({ valid: false });
  }
  return NextResponse.json({ valid: true });
}
