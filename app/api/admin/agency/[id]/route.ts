import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const agency = await db.agency.findUnique({
      where: { id },
      include: {
        clients: true,
      },
    });

    if (!agency)
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });

    // Fetch actual client details
    const clientIds = agency.clients.map((ac) => ac.clientId);
    const clients = await db.client.findMany({
      where: { id: { in: clientIds } },
      include: {
        orders: {
          select: { id: true, amount: true, status: true },
        },
      },
    });

    const clientsWithStats = clients.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: c.company,
      ordersCount: c.orders.length,
      totalSpent: c.orders.reduce((sum, o) => sum + o.amount, 0),
      addedAt: agency.clients.find((ac) => ac.clientId === c.id)?.addedAt,
    }));

    return NextResponse.json({
      agency: { ...agency, clients: clientsWithStats },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { clientId } = await req.json();
    if (!clientId)
      return NextResponse.json({ error: "clientId required" }, { status: 400 });

    const agencyClient = await db.agencyClient.create({
      data: { agencyId: id, clientId },
    });

    // Update agency client count
    await db.agency.update({
      where: { id },
      data: { totalClients: { increment: 1 } },
    });

    return NextResponse.json({ success: true, agencyClient }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    if (err.code === "P2002")
      return NextResponse.json({ error: "Client already in this agency" }, { status: 409 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    if (!clientId)
      return NextResponse.json({ error: "clientId required" }, { status: 400 });

    await db.agencyClient.delete({
      where: { agencyId_clientId: { agencyId: id, clientId } },
    });

    await db.agency.update({
      where: { id },
      data: { totalClients: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
