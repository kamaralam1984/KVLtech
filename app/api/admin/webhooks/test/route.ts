import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createHmac } from "crypto";

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { endpointId } = await req.json();
    if (!endpointId)
      return NextResponse.json({ error: "endpointId required" }, { status: 400 });

    const endpoint = await db.webhookEndpoint.findUnique({ where: { id: endpointId } });
    if (!endpoint)
      return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });

    const body = JSON.stringify({
      event: "test",
      ts: new Date().toISOString(),
      data: { message: "Test from KVL TECH" },
    });

    const delivery = await db.webhookDelivery.create({
      data: {
        endpointId: endpoint.id,
        event: "test",
        payload: body,
        status: "PENDING",
        attempts: 0,
      },
    });

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (endpoint.secret) {
        headers["X-KVL-Signature"] = createHmac("sha256", endpoint.secret)
          .update(body)
          .digest("hex");
      }

      const resp = await fetch(endpoint.url, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(5000),
      });

      const responseBody = await resp.text().catch(() => "");

      await db.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: resp.ok ? "SUCCESS" : "FAILED",
          responseStatus: resp.status,
          responseBody: responseBody.slice(0, 2000),
          deliveredAt: new Date(),
          attempts: 1,
        },
      });

      return NextResponse.json({
        success: resp.ok,
        responseStatus: resp.status,
        deliveryId: delivery.id,
      });
    } catch (fetchErr) {
      const errMsg = String(fetchErr);
      await db.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: "FAILED",
          attempts: 1,
          responseBody: errMsg.slice(0, 2000),
        },
      });

      return NextResponse.json({
        success: false,
        error: errMsg,
        deliveryId: delivery.id,
      });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
