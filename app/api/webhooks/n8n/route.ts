import { NextRequest, NextResponse } from "next/server";

// Inbound n8n webhook — receives events from n8n workflows
export async function POST(req: NextRequest) {
  // Optional Basic Auth check
  const configuredUser = process.env.N8N_BASIC_AUTH_USER;
  const configuredPass = process.env.N8N_BASIC_AUTH_PASS;

  if (configuredUser && configuredPass) {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Basic ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const encoded = authHeader.slice(6);
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const [user, pass] = decoded.split(":");
    if (user !== configuredUser || pass !== configuredPass) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = String(payload.type || payload.event || "unknown");
  let processed = false;

  // Handle known payload types
  if (type === "new_lead" || type === "lead") {
    console.log("[n8n inbound] New lead:", payload);
    processed = true;
  } else if (type === "new_order" || type === "order") {
    console.log("[n8n inbound] New order:", payload);
    processed = true;
  } else if (type === "new_ticket" || type === "ticket") {
    console.log("[n8n inbound] New ticket:", payload);
    processed = true;
  } else {
    console.log("[n8n inbound] Unknown event type:", type, payload);
  }

  return NextResponse.json({ received: true, processed, type });
}
