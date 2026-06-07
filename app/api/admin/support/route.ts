import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { analyzeTicket } from "@/lib/ticket-intelligence";

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

    // Fetch SLA logs for all tickets
    const ticketIds = tickets.map((t) => t.id);
    const slaLogs = ticketIds.length
      ? await db.ticketSLALog.findMany({ where: { ticketId: { in: ticketIds } } })
      : [];
    const slaLogMap = new Map(slaLogs.map((l) => [l.ticketId, l]));

    const ticketsWithSla = tickets.map((t) => ({
      ...t,
      slaLog: slaLogMap.get(t.id) || null,
    }));

    return NextResponse.json({ tickets: ticketsWithSla });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, status, reply, priority } = await req.json();
    if (!id) return NextResponse.json({ error: "Ticket ID required" }, { status: 400 });

    if (status || priority) {
      await db.supportTicket.update({
        where: { id },
        data: {
          ...(status && { status, ...(status === "RESOLVED" && { closedAt: new Date() }) }),
          ...(priority && { priority }),
        },
      });

      // Update TicketSLALog timestamps on status transitions
      if (status) {
        try {
          const now = new Date();
          if (status === "IN_PROGRESS") {
            const existing = await db.ticketSLALog.findUnique({ where: { ticketId: id } });
            if (existing) {
              if (!existing.firstResponseAt) {
                await db.ticketSLALog.update({
                  where: { ticketId: id },
                  data: { firstResponseAt: now },
                });
              }
            } else {
              await db.ticketSLALog.create({
                data: { ticketId: id, firstResponseAt: now },
              });
            }
          } else if (status === "RESOLVED" || status === "CLOSED") {
            const existing = await db.ticketSLALog.findUnique({ where: { ticketId: id } });
            if (existing) {
              await db.ticketSLALog.update({
                where: { ticketId: id },
                data: {
                  resolvedAt: now,
                  ...(!existing.firstResponseAt && { firstResponseAt: now }),
                },
              });
            } else {
              await db.ticketSLALog.create({
                data: { ticketId: id, firstResponseAt: now, resolvedAt: now },
              });
            }
          }
        } catch (slaErr) {
          console.error("[SLA] Failed to update TicketSLALog:", slaErr);
        }
      }
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

    const slaLog = await db.ticketSLALog.findUnique({ where: { ticketId: id } }).catch(() => null);

    // Fire-and-forget AI analysis if priority wasn't manually set
    if (!priority && updated) {
      setTimeout(() => {
        analyzeTicket(id).catch(() => {});
      }, 0);
    }

    return NextResponse.json({ success: true, ticket: updated ? { ...updated, slaLog } : null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
