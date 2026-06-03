import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const priority = searchParams.get("priority") || "";

  try {
    const tickets = await db.supportTicket.findMany({
      where: {
        AND: [
          status ? { status: status as any } : {},
          priority ? { priority: priority as any } : {},
          search ? {
            OR: [
              { ticketNo: { contains: search, mode: "insensitive" } },
              { subject: { contains: search, mode: "insensitive" } },
              { client: { name: { contains: search, mode: "insensitive" } } },
            ],
          } : {},
        ],
      },
      include: {
        client: { select: { name: true, email: true, phone: true } },
        order: { select: { orderNumber: true, product: { select: { name: true } } } },
        replies: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tickets });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, status, reply } = await req.json();
    if (!id) return NextResponse.json({ error: "Ticket ID required" }, { status: 400 });

    if (status) {
      await db.supportTicket.update({
        where: { id },
        data: {
          status,
          ...(status === "RESOLVED" && { closedAt: new Date() }),
        },
      });
    }

    if (reply?.trim()) {
      const ticket = await db.supportTicket.findUnique({ where: { id } });
      await db.ticketReply.create({
        data: { ticketId: id, authorId: "admin", authorType: "admin", message: reply.trim() },
      });
      if (ticket) {
        await db.notification.create({
          data: {
            clientId: ticket.clientId,
            title: `Support reply: ${ticket.ticketNo}`,
            body: reply.trim().slice(0, 100),
            type: "ORDER_UPDATE",
            color: "#0891B2",
          },
        });
      }
    }

    const updated = await db.supportTicket.findUnique({
      where: { id },
      include: {
        client: { select: { name: true, email: true, phone: true } },
        order: { select: { orderNumber: true, product: { select: { name: true } } } },
        replies: { orderBy: { createdAt: "asc" } },
      },
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
