import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/lib/sales-agent";

// ── Telegram API helper ───────────────────────────────────────────────────────

async function sendTelegramReply(
  chatId: number,
  text: string,
  quickReplies?: string[]
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log("[Telegram Agent] No bot token configured. Message:", text);
    return false;
  }

  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  };

  // Add inline keyboard for quick replies (max 4, 2 per row)
  if (quickReplies && quickReplies.length > 0) {
    const trimmed = quickReplies.slice(0, 4);
    const keyboard: Array<Array<{ text: string; callback_data: string }>> = [];
    for (let i = 0; i < trimmed.length; i += 2) {
      const row = trimmed.slice(i, i + 2).map((label, j) => ({
        text: label.slice(0, 40),
        callback_data: `qr_${i + j}_${label.slice(0, 20)}`,
      }));
      keyboard.push(row);
    }
    payload.reply_markup = { inline_keyboard: keyboard };
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// ── POST — Receive Telegram updates ──────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Validate secret token header if configured
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (webhookSecret) {
    const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");
    if (headerSecret !== webhookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let update: Record<string, unknown>;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Process async
  (async () => {
    try {
      // Handle callback queries (quick reply button taps)
      if (update.callback_query) {
        const cbq = update.callback_query as {
          id: string;
          from: { id: number; first_name?: string };
          message?: { chat: { id: number } };
          data?: string;
        };
        const chatId = cbq.message?.chat?.id;
        if (!chatId) return;

        // Answer callback query to remove loading state
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (token) {
          await fetch(
            `https://api.telegram.org/bot${token}/answerCallbackQuery`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ callback_query_id: cbq.id }),
            }
          );
        }

        // Extract button label from callback_data (format: qr_N_label)
        const parts = (cbq.data || "").split("_");
        const buttonText = parts.slice(2).join("_");
        if (!buttonText) return;

        const sessionId = `tg_${chatId}`;
        const agentResponse = await processMessage(sessionId, buttonText, "telegram");
        let msg = agentResponse.message;
        if (agentResponse.bookingUrl) {
          msg += `\n\n<a href="https://kvlbusinesssolutions.com/meetings">Book a free discovery call</a>`;
        }
        await sendTelegramReply(chatId, msg, agentResponse.quickReplies);
        return;
      }

      // Handle regular messages
      const message = update.message as {
        chat?: { id: number };
        from?: { first_name?: string; last_name?: string };
        text?: string;
      } | undefined;

      if (!message) return;

      const chatId = message.chat?.id;
      if (!chatId) return;

      const text = message.text || "";
      const firstName = message.from?.first_name || "";
      const sessionId = `tg_${chatId}`;

      // Handle commands
      if (text === "/start") {
        const greeting = `Hello${firstName ? ` ${firstName}` : ""}! 👋 I'm Kavya, your AI Sales Assistant from KVL Business Solutions.\n\nWe build premium websites, apps, and software. How can I help you today?`;
        await sendTelegramReply(chatId, greeting, [
          "Yes, I need a website",
          "Tell me about pricing",
          "I need software",
        ]);
        return;
      }

      if (text === "/help") {
        const helpText =
          "Here's what I can help you with:\n\n" +
          "• 🌐 Website development (from ₹15,000)\n" +
          "• 💻 Custom software & SaaS\n" +
          "• 📱 Mobile app development\n" +
          "• 📊 ERP & CRM systems\n\n" +
          "Use /book to schedule a free discovery call.\n" +
          "Just type your question and I'll assist you!";
        await sendTelegramReply(chatId, helpText);
        return;
      }

      if (text === "/book") {
        const bookText =
          '📅 <b>Book a Free Discovery Call</b>\n\nClick below to schedule a 30-minute consultation with our team:\n\n<a href="https://kvlbusinesssolutions.com/meetings">kvlbusinesssolutions.com/meetings</a>';
        await sendTelegramReply(chatId, bookText);
        return;
      }

      if (!text) return;

      // Regular message — run through sales agent
      const agentResponse = await processMessage(sessionId, text, "telegram");
      let replyText = agentResponse.message;
      if (agentResponse.bookingUrl) {
        replyText += `\n\n<a href="https://kvlbusinesssolutions.com/meetings">Book a free discovery call</a>`;
      }
      await sendTelegramReply(chatId, replyText, agentResponse.quickReplies);
    } catch (err) {
      console.error("[Telegram Agent] Error:", err);
    }
  })();

  // Always return 200 quickly to Telegram
  return NextResponse.json({ ok: true });
}
