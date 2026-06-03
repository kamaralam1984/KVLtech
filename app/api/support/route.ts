import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

function generateTicketNo() {
  return "TKT-" + Date.now().toString(36).toUpperCase().slice(-6);
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user || user.type !== "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subject, orderId, priority, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject aur message required hain" }, { status: 400 });
    }

    // Verify order if provided
    if (orderId) {
      const order = await db.order.findFirst({ where: { id: orderId, clientId: user.id } });
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const ticket = await db.supportTicket.create({
      data: {
        ticketNo: generateTicketNo(),
        clientId: user.id,
        orderId: orderId || null,
        subject,
        message,
        priority: priority?.toUpperCase() || "MEDIUM",
      },
    });

    await db.notification.create({
      data: {
        clientId: user.id,
        title: "Support ticket raised",
        body: `Ticket #${ticket.ticketNo} successfully create hua. 24 hrs mein reply milegi.`,
        type: "SUPPORT",
        color: "#7C3AED",
      },
    });

    return NextResponse.json({ success: true, ticket: { id: ticket.id, ticketNo: ticket.ticketNo } });
  } catch (err) {
    console.error("Ticket create error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (!user || user.type !== "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tickets = await db.supportTicket.findMany({
      where: { clientId: user.id },
      include: {
        replies: { orderBy: { createdAt: "asc" } },
        order: { select: { orderNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ tickets });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
