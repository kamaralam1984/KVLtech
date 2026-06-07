import { db } from "@/lib/db";
import { createHmac } from "crypto";

export async function dispatchWebhook(event: string, payload: Record<string, unknown>) {
  const endpoints = await db.webhookEndpoint.findMany({
    where: { isActive: true, events: { has: event } },
  });

  for (const endpoint of endpoints) {
    const body = JSON.stringify({ event, data: payload, ts: new Date().toISOString() });
    const delivery = await db.webhookDelivery.create({
      data: {
        endpointId: endpoint.id,
        event,
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
        signal: AbortSignal.timeout(10000),
      });
      await db.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: resp.ok ? "SUCCESS" : "FAILED",
          responseStatus: resp.status,
          deliveredAt: new Date(),
          attempts: 1,
        },
      });
    } catch (err) {
      await db.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: "FAILED",
          attempts: 1,
          responseBody: String(err),
        },
      });
    }
  }
}
