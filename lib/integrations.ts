// WhatsApp Business API (Meta Cloud API)
export async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) {
    console.log("[WhatsApp] Not configured. Message:", message, "To:", to);
    return false;
  }
  try {
    const resp = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, ""),
        type: "text",
        text: { body: message },
      }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

// Slack incoming webhook notification
export async function sendSlackNotification(message: string, channel = "#general"): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("[Slack] Not configured. Message:", message);
    return false;
  }
  try {
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message, channel }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

// Telegram bot notification
export async function sendTelegramMessage(message: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.log("[Telegram] Not configured. Message:", message);
    return false;
  }
  try {
    const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}
