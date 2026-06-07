import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN is not configured" },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_APP_URL is not configured" },
      { status: 400 }
    );
  }

  const webhookUrl = `${appUrl}/api/agent/telegram`;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  const body: Record<string, string> = { url: webhookUrl };
  if (webhookSecret) {
    body.secret_token = webhookSecret;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    return NextResponse.json({
      success: data.ok,
      description: data.description,
      webhookUrl,
      telegramResponse: data,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to register webhook", details: String(err) },
      { status: 500 }
    );
  }
}
