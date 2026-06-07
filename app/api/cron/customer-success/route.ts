import { NextRequest, NextResponse } from "next/server"
import {
  runOutreachScan,
  getTaskById,
  markTaskSent,
  generateSubject,
} from "@/lib/customer-success"
import { sendEmail } from "@/lib/email-service"
import { wsBroadcast } from "@/lib/ws-broadcast"

const CRON_SECRET = process.env.CRON_SECRET || "kvl-cron-secret"

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization")
  return auth === `Bearer ${CRON_SECRET}`
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await runOutreachScan()

    // Auto-send high-priority tasks: win_back and renewal_reminder < 7 days
    const autoSentIds: string[] = []

    for (const task of result.newTasks) {
      if (task.priority !== "high") continue
      if (task.type !== "win_back" && task.type !== "renewal_reminder") continue

      // For renewal_reminder, only auto-send if < 7 days (already high priority means <= 7 days)
      const subject = generateSubject(task.clientName, task.type)
      const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#0B1437,#1a2a5e);padding:30px;text-align:center;">
          <h1 style="color:#C9A227;margin:0;font-size:22px;">KVL TECH</h1>
          <p style="color:#ccc;font-size:13px;margin:5px 0 0;">Premium Digital Solutions</p>
        </div>
        <div style="padding:30px;background:#fff;">
          ${task.suggestedMessage.replace(/\n/g, "<br>")}
        </div>
        <div style="background:#f5f5f5;padding:20px;text-align:center;font-size:12px;color:#888;">
          <p>KVL TECH Pvt. Ltd. | kvlbusinesssolutions.com</p>
          <p>+91 9942000413 | kvlbusinesssolution@gmail.com</p>
        </div>
      </div>`

      try {
        await sendEmail(task.clientEmail, subject, html)
        markTaskSent(task.id)
        autoSentIds.push(task.id)
      } catch (err) {
        console.error(`[cron/customer-success] Failed to send task ${task.id}:`, err)
      }
    }

    wsBroadcast("notifications", {
      type: "cs_scan_complete",
      churnRisks: result.churnRisks,
      renewals: result.renewals,
      upsells: result.upsells,
      totalPending: result.totalPending,
      autoSent: autoSentIds.length,
      ts: Date.now(),
    })

    return NextResponse.json({
      success: true,
      churnRisks: result.churnRisks,
      renewals: result.renewals,
      upsells: result.upsells,
      totalPending: result.totalPending,
      autoSent: autoSentIds.length,
      autoSentIds,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[cron/customer-success]", err)
    return NextResponse.json({ error: "Scan failed" }, { status: 500 })
  }
}
