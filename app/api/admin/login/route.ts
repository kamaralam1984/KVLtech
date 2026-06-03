import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "Email aur password required" }, { status: 400 });

    const admin = await db.admin.findUnique({ where: { email: email.toLowerCase() } });
    if (!admin || !admin.isActive)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = signToken({ id: admin.id, email: admin.email, type: "admin" });

    const res = NextResponse.json({
      success: true, token,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });
    res.cookies.set("kvl_admin_token", token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/",
    });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
