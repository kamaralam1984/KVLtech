import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email aur password required hai" }, { status: 400 });
    }

    const client = await db.client.findUnique({ where: { email: email.toLowerCase() } });

    if (!client || !client.isActive) {
      return NextResponse.json({ error: "Invalid email ya password" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, client.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email ya password" }, { status: 401 });
    }

    await db.client.update({
      where: { id: client.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signToken({ id: client.id, email: client.email, type: "client" });

    // Determine redirect: new clients (no company set) go to onboarding
    const redirect = !client.company ? "/onboarding" : "/client-portal";

    const res = NextResponse.json({
      success: true,
      token,
      redirect,
      client: { id: client.id, name: client.name, email: client.email, company: client.company },
    });

    res.cookies.set("kvl_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
