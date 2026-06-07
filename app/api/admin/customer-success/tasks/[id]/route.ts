import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import {
  getTaskById,
  markTaskSent,
  markTaskSkipped,
  markTaskCompleted,
  generateSubject,
  outreachStore,
} from "@/lib/customer-success"
import { sendEmail } from "@/lib/email-service"

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET — get single task
export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const task = getTaskById(id)
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 })

  return NextResponse.json({ task })
}

// PATCH — perform action on task
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const task = getTaskById(id)
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 })

  let body: { action?: string; customMessage?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { action, customMessage } = body

  if (action === "send") {
    const subject = generateSubject(task.clientName, task.type)
    const messageBody = customMessage || task.suggestedMessage
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#0B1437,#1a2a5e);padding:30px;text-align:center;">
        <h1 style="color:#C9A227;margin:0;font-size:22px;">KVL TECH</h1>
        <p style="color:#ccc;font-size:13px;margin:5px 0 0;">Premium Digital Solutions</p>
      </div>
      <div style="padding:30px;background:#fff;">
        ${messageBody.replace(/\n/g, "<br>")}
      </div>
      <div style="background:#f5f5f5;padding:20px;text-align:center;font-size:12px;color:#888;">
        <p>KVL TECH Pvt. Ltd. | kvlbusinesssolutions.com</p>
        <p>+91 9942000413 | kvlbusinesssolution@gmail.com</p>
      </div>
    </div>`

    try {
      await sendEmail(task.clientEmail, subject, html)
    } catch (err) {
      console.error("[customer-success task send]", err)
      // Mark as sent even if email fails (best-effort)
    }

    markTaskSent(id)
    const updated = getTaskById(id)
    return NextResponse.json({ task: updated })
  }

  if (action === "skip") {
    markTaskSkipped(id)
    return NextResponse.json({ task: getTaskById(id) })
  }

  if (action === "complete") {
    markTaskCompleted(id)
    return NextResponse.json({ task: getTaskById(id) })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
