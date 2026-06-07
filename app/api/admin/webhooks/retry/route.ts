import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  // Allow cron (Bearer token) or admin session
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
  const isAdmin = requireAdmin(req);

  if (!isCron && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    const deliveries = await db.webhookDelivery.findMany({
      where: {
        status: "FAILED",
        attempts: { lt: 3 },
        OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }],
      },
    });

    let retried = 0;
    let succeeded = 0;
    let failed = 0;

    for (const delivery of deliveries) {
      const endpoint = await db.webhookEndpoint.findUnique({
        where: { id: delivery.endpointId },
      });

      if (!endpoint || !endpoint.isActive) continue;

      retried++;
      const attempts = delivery.attempts;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (endpoint.secret) {
        headers["X-KVL-Signature"] = createHmac("sha256", endpoint.secret)
          .update(delivery.payload)
          .digest("hex");
      }

      try {
        const resp = await fetch(endpoint.url, {
          method: "POST",
          headers,
          body: delivery.payload,
          signal: AbortSignal.timeout(10000),
        });

        if (resp.ok) {
          succeeded++;
        } else {
          failed++;
        }

        await db.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: resp.ok ? "SUCCESS" : attempts >= 2 ? "FAILED" : "RETRYING",
            responseStatus: resp.status,
            attempts: { increment: 1 },
            deliveredAt: resp.ok ? new Date() : null,
            nextRetryAt:
              !resp.ok && attempts < 2
                ? new Date(Date.now() + (attempts + 1) * 5 * 60000)
                : null,
          },
        });
      } catch {
        failed++;
        await db.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: delivery.attempts >= 2 ? "FAILED" : "RETRYING",
            attempts: { increment: 1 },
            nextRetryAt:
              delivery.attempts < 2
                ? new Date(Date.now() + (delivery.attempts + 1) * 5 * 60000)
                : null,
          },
        });
      }
    }

    return NextResponse.json({ retried, succeeded, failed });
  } catch (err) {
    console.error("Webhook retry error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
