import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [campaigns, leadCounts, clientCount, orderCount] = await Promise.all([
      db.campaign.findMany({ orderBy: { createdAt: "desc" } }),
      db.contactLead.groupBy({ by: ["status"], _count: { id: true } }),
      db.client.count(),
      db.order.count({ where: { status: "DELIVERED" } }),
    ]);

    // Aggregate stats from campaigns
    const emailSent   = campaigns.filter((c: { type: string; sentCount: number }) => c.type === "EMAIL").reduce((s: number, c: { sentCount: number }) => s + c.sentCount, 0);
    const waSent      = campaigns.filter((c: { type: string; sentCount: number }) => c.type === "WHATSAPP").reduce((s: number, c: { sentCount: number }) => s + c.sentCount, 0);
    const smsSent     = campaigns.filter((c: { type: string; sentCount: number }) => c.type === "SMS").reduce((s: number, c: { sentCount: number }) => s + c.sentCount, 0);
    const conversions = orderCount;

    const leadCountMap: Record<string, number> = {};
    leadCounts.forEach(l => { leadCountMap[l.status] = l._count.id; });
    const totalLeads = Object.values(leadCountMap).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      campaigns,
      stats: { emailSent, waSent, smsSent, conversions },
      audienceSizes: {
        allLeads: totalLeads,
        newLeads: leadCountMap["NEW"] || 0,
        contacted: leadCountMap["CONTACTED"] || 0,
        qualified: leadCountMap["QUALIFIED"] || 0,
        allClients: clientCount,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, type, subject, message, recipients, scheduledAt } = await req.json();
    if (!name || !type || !message)
      return NextResponse.json({ error: "Name, type aur message required hain" }, { status: 400 });

    const campaign = await db.campaign.create({
      data: {
        name, type, subject, message,
        recipients: recipients || "ALL_LEADS",
        status: scheduledAt ? "SCHEDULED" : "DRAFT",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, action, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    let data: any = {};

    if (action === "send") {
      // Simulate send — get recipient count
      const campaign = await db.campaign.findUnique({ where: { id } });
      if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const recipientCount = await getRecipientCount(campaign.recipients);

      data = {
        status: "COMPLETED",
        sentCount: recipientCount,
        openCount: Math.floor(recipientCount * (campaign.type === "WHATSAPP" ? 0.92 : campaign.type === "SMS" ? 0.70 : 0.35)),
        clickCount: Math.floor(recipientCount * (campaign.type === "WHATSAPP" ? 0.27 : campaign.type === "SMS" ? 0.12 : 0.10)),
        sentAt: new Date(),
      };
    } else {
      if (updates.name)    data.name    = updates.name;
      if (updates.message) data.message = updates.message;
      if (updates.subject) data.subject = updates.subject;
      if (updates.status)  data.status  = updates.status;
    }

    const campaign = await db.campaign.update({ where: { id }, data });
    return NextResponse.json({ success: true, campaign });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    await db.campaign.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function getRecipientCount(recipients: string): Promise<number> {
  if (recipients === "ALL_LEADS")   return db.contactLead.count();
  if (recipients === "NEW_LEADS")   return db.contactLead.count({ where: { status: "NEW" } });
  if (recipients === "CONTACTED")   return db.contactLead.count({ where: { status: "CONTACTED" } });
  if (recipients === "QUALIFIED")   return db.contactLead.count({ where: { status: "QUALIFIED" } });
  if (recipients === "ALL_CLIENTS") return db.client.count();
  return 0;
}
