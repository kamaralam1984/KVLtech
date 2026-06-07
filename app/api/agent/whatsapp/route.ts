import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/integrations";
import { processMessage } from "@/lib/sales-agent";
import crypto from "crypto";

// ── Helpers ───────────────────────────────────────────────────────────────────

function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !signature) return !secret; // if no secret configured, skip verification
  const expected = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex")}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

async function sendWhatsAppInteractive(
  to: string,
  message: string,
  buttons: string[]
): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return false;

  // Max 3 buttons per WA interactive message
  const trimmedButtons = buttons.slice(0, 3);

  try {
    const resp = await fetch(
      `https://graph.facebook.com/v18.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace(/\D/g, ""),
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: message },
            action: {
              buttons: trimmedButtons.map((title, i) => ({
                type: "reply",
                reply: {
                  id: `btn_${i}`,
                  title: title.slice(0, 20), // WA button title max 20 chars
                },
              })),
            },
          },
        }),
      }
    );
    return resp.ok;
  } catch {
    return false;
  }
}

async function markAsRead(messageId: string): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return;

  try {
    await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      }),
    });
  } catch { /* fire and forget */ }
}

// ── GET — Webhook verification ────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// ── POST — Receive messages ───────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Return 200 immediately — WhatsApp requires a quick response
  const bodyText = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifySignature(bodyText, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Process async — don't await
  (async () => {
    try {
      const payload = JSON.parse(bodyText);
      const entry = payload?.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;

      // Only handle messages (not status updates)
      if (!value?.messages?.length) return;

      const waMsg = value.messages[0];
      const from: string = waMsg.from; // phone number
      const messageId: string = waMsg.id;
      const text: string =
        waMsg.type === "text"
          ? waMsg.text?.body || ""
          : waMsg.type === "interactive"
          ? waMsg.interactive?.button_reply?.title || waMsg.interactive?.list_reply?.title || ""
          : "";

      if (!text || !from) return;

      // Mark as read
      await markAsRead(messageId);

      // Process through sales agent
      const agentResponse = await processMessage(from, text, "whatsapp");

      // Build full message (append booking URL if suggested)
      let fullMessage = agentResponse.message;
      if (agentResponse.bookingUrl) {
        fullMessage += `\n\nBook here: https://kvlbusinesssolutions.com/meetings`;
      }

      // Send response
      const quickReplies = agentResponse.quickReplies || [];
      if (quickReplies.length > 0 && quickReplies.length <= 3) {
        await sendWhatsAppInteractive(from, fullMessage, quickReplies);
      } else {
        // Add quick replies as plain text if > 3
        if (quickReplies.length > 3) {
          fullMessage += `\n\nReply with:\n${quickReplies.map((r, i) => `${i + 1}. ${r}`).join("\n")}`;
        }
        await sendWhatsAppMessage(from, fullMessage);
      }
    } catch (err) {
      console.error("[WhatsApp Agent] Error:", err);
    }
  })();

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
