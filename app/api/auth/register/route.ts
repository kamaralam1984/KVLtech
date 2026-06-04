import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { sendWelcomeSequenceEmail } from "@/lib/email";

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
