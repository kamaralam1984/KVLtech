import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getConversationStats,
  getAllConversations,
  getConversation,
  deleteConversation,
} from "@/lib/sales-agent";
import { sendWhatsAppMessage } from "@/lib/integrations";

// ── GET — Stats + conversations ───────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (sessionId) {
    const conv = getConversation(sessionId);
    if (!conv) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    return NextResponse.json({ conversation: conv });
  }

  const stats = getConversationStats();
  const conversations = getAllConversations();

  return NextResponse.json({ stats, conversations });
}

// ── DELETE — Remove conversation ──────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  deleteConversation(sessionId);
  return NextResponse.json({ success: true });
}

// ── POST — Admin actions (handoff) ────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, sessionId, adminMessage } = body as {
    action?: string;
    sessionId?: string;
    adminMessage?: string;
  };

  if (action === "handoff") {
    if (!sessionId || !adminMessage) {
      return NextResponse.json(
        { error: "sessionId and adminMessage are required" },
        { status: 400 }
      );
    }

    const conv = getConversation(sessionId);
    if (!conv) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Mark as handed off
    conv.isHandedOff = true;
    conv.stage = "closed";
    conv.updatedAt = new Date();

    // Send admin message through the appropriate channel
    let sent = false;
    if (conv.channel === "whatsapp" && conv.contactId) {
      sent = await sendWhatsAppMessage(conv.contactId, adminMessage);
    } else if (conv.channel === "telegram") {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = conv.contactId.replace("tg_", "");
      if (token && chatId) {
        try {
          const res = await fetch(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatId, text: adminMessage }),
            }
          );
          sent = res.ok;
        } catch { /* ignore */ }
      }
    }

    return NextResponse.json({ success: true, messageSent: sent });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
