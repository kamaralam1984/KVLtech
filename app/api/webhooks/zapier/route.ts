import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Inbound Zapier webhook — receives events from Zapier and processes them
export async function POST(req: NextRequest) {
  // Verify signature if ZAPIER_SECRET is set
  const secret = process.env.ZAPIER_SECRET;
  if (secret) {
    const signature = req.headers.get("x-zapier-signature") || "";
    const body = await req.text();
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    if (signature !== expected && signature !== `sha256=${expected}`) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    // Parse body after signature check (body was read as text)
    try {
      const payload = JSON.parse(body) as Record<string, unknown>;
      return processPayload(payload);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
  }

  // No secret — parse body normally
  let payload: Record<string, unknown>;
  try {
    payload = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  return processPayload(payload);
}

function processPayload(payload: Record<string, unknown>): NextResponse {
  const type = String(payload.type || payload.event || "unknown");
  let processed = false;

  // Handle known payload types
  if (type === "new_lead" || type === "lead") {
    console.log("[Zapier inbound] New lead:", payload);
    processed = true;
  } else if (type === "new_order" || type === "order") {
    console.log("[Zapier inbound] New order:", payload);
    processed = true;
  } else if (type === "new_ticket" || type === "ticket") {
    console.log("[Zapier inbound] New ticket:", payload);
    processed = true;
  } else {
    console.log("[Zapier inbound] Unknown event type:", type, payload);
  }

  return NextResponse.json({ received: true, processed, type });
}
