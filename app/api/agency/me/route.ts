import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const SECRET = process.env.JWT_SECRET || "kvltech-fallback-secret";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("kvl_agency_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: { id: string; email: string; type: string };
    try {
      payload = jwt.verify(token, SECRET) as typeof payload;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (payload.type !== "agency") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agency = await db.agency.findUnique({
      where: { id: payload.id },
      include: { clients: true },
    });

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    return NextResponse.json({
      agency: {
        id: agency.id,
        name: agency.name,
        email: agency.email,
        phone: agency.phone,
        website: agency.website,
        commissionRate: agency.commissionRate,
        status: agency.status,
        totalRevenue: agency.totalRevenue,
        totalClients: agency.totalClients,
        referralCode: agency.referralCode,
        logoUrl: agency.logoUrl,
        description: agency.description,
        clientCount: agency.clients.length,
      },
    });
  } catch (err) {
    console.error("Agency me error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
