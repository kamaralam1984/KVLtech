import { NextRequest, NextResponse } from "next/server";
import { runWorkerBatch } from "@/lib/job-worker";
import { getQueueStats } from "@/lib/job-queue";

const CRON_SECRET = process.env.CRON_SECRET || "kvl-cron-secret";

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${CRON_SECRET}`;
}

// POST — process up to 20 jobs from the queue
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { processed, failed } = await runWorkerBatch(20);
    return NextResponse.json({
      success: true,
      processed,
      failed,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cron/worker]", err);
    return NextResponse.json({ error: "Worker error" }, { status: 500 });
  }
}

// GET — return current queue statistics
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await getQueueStats();
    return NextResponse.json({ success: true, stats, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("[cron/worker GET]", err);
    return NextResponse.json({ error: "Stats error" }, { status: 500 });
  }
}
