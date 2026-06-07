import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const SECRET = process.env.JWT_SECRET || "kvltech-fallback-secret";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const agency = await db.agency.findUnique({
      where: { email, status: "ACTIVE" },
    });

    if (!agency) {
      return NextResponse.json({ error: "Invalid credentials or account not active" }, { status: 401 });
    }

    if (!agency.password) {
      return NextResponse.json(
        { error: "Contact admin to set your password" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, agency.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: agency.id, email: agency.email, type: "agency" },
      SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
      success: true,
      agency: {
        id: agency.id,
        name: agency.name,
        email: agency.email,
        referralCode: agency.referralCode,
      },
    });

    res.cookies.set("kvl_agency_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return res;
  } catch (err) {
    console.error("Agency login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
