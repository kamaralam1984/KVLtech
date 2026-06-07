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

    const agencyClients = await db.agencyClient.findMany({
      where: { agencyId: payload.id },
    });

    const clientIds = agencyClients.map((ac) => ac.clientId);

    if (clientIds.length === 0) {
      return NextResponse.json({ clients: [] });
    }

    const clients = await db.client.findMany({
      where: { id: { in: clientIds } },
      include: {
        orders: {
          include: { payment: true },
        },
      },
    });

    const agencyClientMap = new Map(agencyClients.map((ac) => [ac.clientId, ac]));

    const result = clients.map((client) => {
      const ordersCount = client.orders.length;
      const totalSpent = client.orders.reduce((sum, order) => sum + order.amount, 0);
      const ac = agencyClientMap.get(client.id);

      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        city: client.city,
        ordersCount,
        totalSpent,
        addedAt: ac?.addedAt ?? null,
      };
    });

    return NextResponse.json({ clients: result });
  } catch (err) {
    console.error("Agency clients error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
