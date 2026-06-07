import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function toCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escape = (v: string | number | null | undefined) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map(row => row.map(escape).join(",")).join("\n");
}

function dateStr() {
  return new Date().toISOString().split("T")[0];
}

function fmtDate(val: Date | string | null | undefined): string {
  if (!val) return "";
  return new Date(val).toLocaleDateString("en-IN");
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const format = url.searchParams.get("format") || "csv";

  let csvContent = "";
  let filename = "export";

  if (type === "orders") {
    const orders = await db.order.findMany({
      include: { client: true, product: true, payment: true },
      orderBy: { createdAt: "desc" },
    });
    filename = `orders-export-${dateStr()}`;
    if (format === "json") {
      return NextResponse.json(orders);
    }
    csvContent = toCSV(
      ["orderNumber", "status", "plan", "amount", "clientName", "clientEmail", "productName", "paymentStatus", "createdAt"],
      orders.map(o => [
        o.orderNumber,
        o.status,
        o.plan,
        o.amount,
        o.client?.name ?? "",
        o.client?.email ?? "",
        o.product?.name ?? "",
        o.payment?.status ?? "",
        fmtDate(o.createdAt),
      ])
    );

  } else if (type === "leads") {
    const leads = await db.contactLead.findMany({
      orderBy: { createdAt: "desc" },
    });
    filename = `leads-export-${dateStr()}`;
    if (format === "json") {
      return NextResponse.json(leads);
    }
    csvContent = toCSV(
      ["name", "email", "phone", "service", "budget", "source", "status", "score", "scoreLabel", "assignedTo", "createdAt"],
      leads.map(l => [
        l.name,
        l.email ?? "",
        l.phone,
        l.service ?? "",
        l.budget ?? "",
        l.source,
        l.status,
        l.score,
        l.scoreLabel,
        l.assignedTo ?? "",
        fmtDate(l.createdAt),
      ])
    );

  } else if (type === "clients") {
    const clients = await db.client.findMany({
      include: {
        _count: { select: { orders: true } },
        orders: { select: { amount: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    filename = `clients-export-${dateStr()}`;
    if (format === "json") {
      return NextResponse.json(clients);
    }
    csvContent = toCSV(
      ["name", "email", "company", "city", "phone", "totalOrders", "totalSpent", "createdAt"],
      clients.map(c => {
        const totalSpent = c.orders.reduce((sum, o) => sum + o.amount, 0);
        return [
          c.name,
          c.email,
          c.company ?? "",
          c.city ?? "",
          c.phone ?? "",
          c._count.orders,
          totalSpent,
          fmtDate(c.createdAt),
        ];
      })
    );

  } else if (type === "tickets") {
    const tickets = await db.supportTicket.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });
    filename = `tickets-export-${dateStr()}`;
    if (format === "json") {
      return NextResponse.json(tickets);
    }
    csvContent = toCSV(
      ["ticketNumber", "subject", "status", "priority", "clientName", "clientEmail", "createdAt", "resolvedAt"],
      tickets.map(t => [
        t.ticketNo,
        t.subject,
        t.status,
        t.priority,
        t.client?.name ?? "",
        t.client?.email ?? "",
        fmtDate(t.createdAt),
        fmtDate(t.closedAt),
      ])
    );

  } else if (type === "referrals") {
    const referrals = await db.referral.findMany({
      include: { referrer: true },
      orderBy: { createdAt: "desc" },
    });
    filename = `referrals-export-${dateStr()}`;
    if (format === "json") {
      return NextResponse.json(referrals);
    }
    csvContent = toCSV(
      ["referrerName", "referrerEmail", "refereeEmail", "commission", "level", "status", "couponCode", "orderAmount", "createdAt"],
      referrals.map(r => [
        r.referrer?.name ?? "",
        r.referrer?.email ?? "",
        r.refereeEmail,
        r.commission,
        r.level,
        r.status,
        r.couponCode ?? "",
        r.orderAmount,
        fmtDate(r.createdAt),
      ])
    );

  } else if (type === "payments") {
    const payments = await db.payment.findMany({
      where: { status: "CAPTURED" },
      include: { order: { include: { client: true } } },
      orderBy: { createdAt: "desc" },
    });
    filename = `payments-export-${dateStr()}`;
    if (format === "json") {
      return NextResponse.json(payments);
    }
    csvContent = toCSV(
      ["orderNumber", "amount", "razorpayId", "status", "clientName", "paidAt"],
      payments.map(p => [
        p.order?.orderNumber ?? "",
        p.amount,
        p.gatewayPaymentId ?? "",
        p.status,
        p.order?.client?.name ?? "",
        fmtDate(p.paidAt ?? p.createdAt),
      ])
    );

  } else if (type === "applications") {
    const applications = await db.jobApplication.findMany({
      orderBy: { createdAt: "desc" },
    });
    filename = `applications-export-${dateStr()}`;
    if (format === "json") {
      return NextResponse.json(applications);
    }
    csvContent = toCSV(
      ["name", "email", "phone", "position", "experience", "status", "createdAt"],
      applications.map(a => [
        a.name,
        a.email,
        a.phone ?? "",
        a.position,
        a.experience ?? "",
        a.status,
        fmtDate(a.createdAt),
      ])
    );

  } else {
    return NextResponse.json(
      { error: "Invalid type. Use: orders, leads, clients, tickets, referrals, payments, applications" },
      { status: 400 }
    );
  }

  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}
