import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sendWhatsAppMessage, sendSlackNotification, sendTelegramMessage } from "@/lib/integrations";
import {
  triggerZapierWebhook,
  triggerMakeWebhook,
  triggerN8nWebhook,
  integrationConfigStore,
} from "@/lib/integrations-extended";

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as { slug?: string; integration?: string; message?: string };
    // Support both "slug" and legacy "integration" key
    const slug = body.slug || body.integration;
    const testMessage =
      body.message || `[KVL TECH] Integration test at ${new Date().toISOString()}`;

    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    let success = false;
    let message = "";
    let data: unknown;

    switch (slug) {
      // ── Communication ──────────────────────────────────────────────
      case "whatsapp": {
        const to = process.env.WHATSAPP_TEST_NUMBER || "";
        if (!to) {
          return NextResponse.json({
            success: false,
            message: "Set WHATSAPP_TEST_NUMBER env var to receive test messages",
          });
        }
        success = await sendWhatsAppMessage(to, testMessage);
        message = success
          ? `Test message sent to ${to}`
          : "WhatsApp send failed — check WHATSAPP_TOKEN and WHATSAPP_PHONE_ID";
        break;
      }

      case "slack": {
        success = await sendSlackNotification(testMessage);
        message = success
          ? "Test message sent to Slack"
          : "Slack send failed — check SLACK_WEBHOOK_URL";
        break;
      }

      case "telegram": {
        success = await sendTelegramMessage(testMessage);
        message = success
          ? "Test message sent to Telegram"
          : "Telegram send failed — check TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID";
        break;
      }

      // ── Automation webhooks ────────────────────────────────────────
      case "zapier": {
        const cfg = integrationConfigStore.get("zapier");
        const url = cfg?.config?.ZAPIER_WEBHOOK_URL || process.env.ZAPIER_WEBHOOK_URL || "";
        if (!url) {
          return NextResponse.json({ success: false, message: "ZAPIER_WEBHOOK_URL not configured" });
        }
        success = await triggerZapierWebhook(url, {
          event: "test",
          source: "kvltech",
          timestamp: new Date().toISOString(),
          message: testMessage,
        });
        message = success ? "Zapier webhook triggered successfully" : "Zapier webhook call failed";
        break;
      }

      case "make": {
        const cfg = integrationConfigStore.get("make");
        const url = cfg?.config?.MAKE_WEBHOOK_URL || process.env.MAKE_WEBHOOK_URL || "";
        if (!url) {
          return NextResponse.json({ success: false, message: "MAKE_WEBHOOK_URL not configured" });
        }
        success = await triggerMakeWebhook(url, {
          event: "test",
          source: "kvltech",
          timestamp: new Date().toISOString(),
          message: testMessage,
        });
        message = success ? "Make webhook triggered successfully" : "Make webhook call failed";
        break;
      }

      case "n8n": {
        const cfg = integrationConfigStore.get("n8n");
        const url = cfg?.config?.N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL || "";
        if (!url) {
          return NextResponse.json({ success: false, message: "N8N_WEBHOOK_URL not configured" });
        }
        const user = cfg?.config?.N8N_BASIC_AUTH_USER || process.env.N8N_BASIC_AUTH_USER;
        const pass = cfg?.config?.N8N_BASIC_AUTH_PASS || process.env.N8N_BASIC_AUTH_PASS;
        const auth = user && pass ? { user, pass } : undefined;
        success = await triggerN8nWebhook(
          url,
          { event: "test", source: "kvltech", timestamp: new Date().toISOString(), message: testMessage },
          auth
        );
        message = success ? "n8n webhook triggered successfully" : "n8n webhook call failed";
        break;
      }

      // ── Google Workspace ───────────────────────────────────────────
      case "google-workspace": {
        const cfg = integrationConfigStore.get("google-workspace");
        const token = cfg?.config?.GOOGLE_GMAIL_ACCESS_TOKEN || process.env.GOOGLE_GMAIL_ACCESS_TOKEN || "";
        if (!token) {
          return NextResponse.json({ success: false, message: "GOOGLE_GMAIL_ACCESS_TOKEN not configured" });
        }
        const resp = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${token}` },
        });
        success = resp.ok;
        if (resp.ok) {
          data = await resp.json();
          message = "Google OAuth token is valid";
        } else {
          message = `Google token validation failed (HTTP ${resp.status})`;
        }
        break;
      }

      // ── Meta Ads ───────────────────────────────────────────────────
      case "meta-ads": {
        const cfg = integrationConfigStore.get("meta-ads");
        const token = cfg?.config?.META_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || "";
        const accountId = cfg?.config?.META_AD_ACCOUNT_ID || process.env.META_AD_ACCOUNT_ID || "";
        if (!token || !accountId) {
          return NextResponse.json({ success: false, message: "META_ACCESS_TOKEN and META_AD_ACCOUNT_ID required" });
        }
        const resp = await fetch(
          `https://graph.facebook.com/v18.0/${accountId}?fields=id,name,currency,account_status&access_token=${token}`
        );
        success = resp.ok;
        if (resp.ok) {
          data = await resp.json();
          message = "Meta Ads account connected successfully";
        } else {
          const err = await resp.json() as { error?: { message?: string } };
          message = `Meta Ads connection failed: ${err?.error?.message || resp.status}`;
        }
        break;
      }

      // ── Google Ads ─────────────────────────────────────────────────
      case "google-ads": {
        const cfg = integrationConfigStore.get("google-ads");
        const customerId = cfg?.config?.GOOGLE_ADS_CUSTOMER_ID || process.env.GOOGLE_ADS_CUSTOMER_ID || "";
        const devToken = cfg?.config?.GOOGLE_ADS_DEVELOPER_TOKEN || process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";
        const token = cfg?.config?.GOOGLE_ADS_ACCESS_TOKEN || process.env.GOOGLE_ADS_ACCESS_TOKEN || "";
        if (!customerId || !devToken || !token) {
          return NextResponse.json({
            success: false,
            message: "GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_DEVELOPER_TOKEN, and GOOGLE_ADS_ACCESS_TOKEN required",
          });
        }
        const cleanId = customerId.replace(/-/g, "");
        const resp = await fetch(
          `https://googleads.googleapis.com/v14/customers/${cleanId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "developer-token": devToken,
            },
          }
        );
        success = resp.ok;
        message = success
          ? "Google Ads credentials are valid"
          : `Google Ads validation failed (HTTP ${resp.status})`;
        if (resp.ok) data = await resp.json();
        break;
      }

      // ── LinkedIn ───────────────────────────────────────────────────
      case "linkedin": {
        const cfg = integrationConfigStore.get("linkedin");
        const token = cfg?.config?.LINKEDIN_ACCESS_TOKEN || process.env.LINKEDIN_ACCESS_TOKEN || "";
        const orgId = cfg?.config?.LINKEDIN_ORG_ID || process.env.LINKEDIN_ORG_ID || "";
        if (!token || !orgId) {
          return NextResponse.json({ success: false, message: "LINKEDIN_ACCESS_TOKEN and LINKEDIN_ORG_ID required" });
        }
        const resp = await fetch(
          `https://api.linkedin.com/v2/organizations/${orgId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        success = resp.ok;
        if (resp.ok) {
          data = await resp.json();
          message = "LinkedIn organization connected successfully";
        } else {
          message = `LinkedIn connection failed (HTTP ${resp.status})`;
        }
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown integration slug" }, { status: 400 });
    }

    return NextResponse.json({ success, message, ...(data ? { data } : {}) });
  } catch (err) {
    console.error("Integration test error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
