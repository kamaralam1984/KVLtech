import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllConversations } from "@/lib/sales-agent";
import { sendWhatsAppMessage } from "@/lib/integrations";

const RATE_LIMIT = 50;

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { channel, message, filter } = body as {
    channel?: "whatsapp" | "telegram";
    message?: string;
    filter?: "all" | "qualified" | "inactive";
  };

  if (!channel || !message) {
    return NextResponse.json(
      { error: "channel and message are required" },
      { status: 400 }
    );
  }
  if (message.length > 500) {
    return NextResponse.json(
      { error: "Message exceeds 500 characters" },
      { status: 400 }
    );
  }

  const allConvs = getAllConversations();
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;

  // Filter conversations by channel and audience
  let targets = allConvs.filter((c) => c.channel === channel);
  if (filter === "qualified") {
    targets = targets.filter((c) => c.isQualified);
  } else if (filter === "inactive") {
    targets = targets.filter((c) => c.updatedAt.getTime() < threeDaysAgo);
  }

  // Rate limit
  targets = targets.slice(0, RATE_LIMIT);

  let sent = 0;
  let failed = 0;

  for (const conv of targets) {
    try {
      if (channel === "whatsapp") {
        const ok = await sendWhatsAppMessage(conv.contactId, message);
        if (ok) sent++;
        else failed++;
      } else if (channel === "telegram") {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = conv.contactId.replace("tg_", "");
        if (!token || !chatId) { failed++; continue; }
        const res = await fetch(
          `https://api.telegram.org/bot${token}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message }),
          }
        );
        if (res.ok) sent++;
        else failed++;
      }
      // Small delay to respect rate limits
      await new Promise((r) => setTimeout(r, 100));
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total: targets.length });
}
