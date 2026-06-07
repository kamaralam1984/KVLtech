import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function uniqueReferralCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateReferralCode();
    const existing = await db.agency.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }
  throw new Error("Could not generate unique referral code");
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const agencies = await db.agency.findMany({
      include: {
        clients: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalRevenue = agencies.reduce((sum, a) => sum + a.totalRevenue, 0);
    const activeCount = agencies.filter((a) => a.status === "ACTIVE").length;

    return NextResponse.json({
      agencies: agencies.map((a) => ({
        ...a,
        clientCount: a.clients.length,
      })),
      stats: {
        total: agencies.length,
        active: activeCount,
        totalRevenue,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, email, phone, commissionRate, website } = await req.json();
    if (!name || !email)
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });

    const referralCode = await uniqueReferralCode();

    const agency = await db.agency.create({
      data: {
        name,
        email,
        phone: phone || null,
        website: website || null,
        commissionRate: commissionRate ?? 20,
        status: "PENDING",
        referralCode,
      },
    });

    return NextResponse.json({ success: true, agency }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    if (err.code === "P2002")
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, status, commissionRate, name, email, phone, website, totalRevenue, password } =
      await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    const agency = await db.agency.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(commissionRate !== undefined && { commissionRate }),
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(website !== undefined && { website }),
        ...(totalRevenue !== undefined && { totalRevenue }),
        ...(hashedPassword !== undefined && { password: hashedPassword }),
      },
    });

    return NextResponse.json({ success: true, agency });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await db.agency.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
