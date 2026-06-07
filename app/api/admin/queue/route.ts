import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getQueueStats, clearDeadJobs, retryDeadJobs, enqueueJob } from "@/lib/job-queue";
import { runWorkerBatch } from "@/lib/job-worker";

// GET — queue statistics
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const stats = await getQueueStats();
    return NextResponse.json({ success: true, stats });
  } catch (err) {
    console.error("[admin/queue GET]", err);
    return NextResponse.json({ error: "Failed to fetch queue stats" }, { status: 500 });
  }
}

// POST — queue actions
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { action } = (await req.json()) as { action: string };

    switch (action) {
      case "process": {
        const result = await runWorkerBatch(20);
        return NextResponse.json({ success: true, ...result });
      }

      case "clear-dead": {
        await clearDeadJobs();
        return NextResponse.json({ success: true, message: "Dead letter queue cleared" });
      }

      case "retry-dead": {
        const retried = await retryDeadJobs();
        return NextResponse.json({ success: true, retried });
      }

      case "enqueue-test": {
        const jobId = await enqueueJob(
          "report_generate",
          { test: true, requestedBy: admin.email, requestedAt: new Date().toISOString() },
          { priority: "low" }
        );
        return NextResponse.json({ success: true, jobId });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error("[admin/queue POST]", err);
    return NextResponse.json({ error: "Queue action failed" }, { status: 500 });
  }
}
