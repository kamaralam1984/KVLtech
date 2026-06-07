import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const rules = await db.automationRule.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json(rules)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { name, trigger, triggerValue, action, channel, template, delayHours } = await req.json()
    if (!name || !trigger || !action)
      return NextResponse.json({ error: "name, trigger, action required" }, { status: 400 })
    const rule = await db.automationRule.create({
      data: {
        name,
        trigger,
        triggerValue: triggerValue ?? null,
        action,
        channel: channel ?? "email",
        template: template ?? null,
        delayHours: delayHours ?? 0,
        isActive: true,
        runCount: 0,
      },
    })
    return NextResponse.json(rule, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const body = await req.json()
    const rule = await db.automationRule.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.trigger !== undefined && { trigger: body.trigger }),
        ...(body.triggerValue !== undefined && { triggerValue: body.triggerValue }),
        ...(body.action !== undefined && { action: body.action }),
        ...(body.channel !== undefined && { channel: body.channel }),
        ...(body.template !== undefined && { template: body.template }),
        ...(body.delayHours !== undefined && { delayHours: body.delayHours }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })
    return NextResponse.json(rule)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    await db.automationRule.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
