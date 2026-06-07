import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Chat-captured leads (last 30 days)
    const [chatLeadsThisMonth, chatLeadsLast30, chatEscalations, totalChatLeads] =
      await Promise.all([
        db.contactLead.count({
          where: {
            source: "CHAT",
            createdAt: { gte: startOfMonth },
          },
        }),
        db.contactLead.count({
          where: {
            source: "CHAT",
            createdAt: { gte: thirtyDaysAgo },
          },
        }),
        db.contactLead.count({
          where: {
            source: "CHAT_ESCALATION",
            createdAt: { gte: thirtyDaysAgo },
          },
        }),
        db.contactLead.count({
          where: {
            OR: [{ source: "CHAT" }, { source: "CHAT_ESCALATION" }],
          },
        }),
      ]);

    return NextResponse.json({
      chatLeadsThisMonth,
      chatLeadsLast30,
      chatEscalations,
      totalChatLeads,
      summary: `Kaviya captured ${chatLeadsThisMonth} lead${chatLeadsThisMonth !== 1 ? "s" : ""} this month via chat`,
    });
  } catch (error) {
    console.error("Chat analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch chat analytics" }, { status: 500 });
  }
}
