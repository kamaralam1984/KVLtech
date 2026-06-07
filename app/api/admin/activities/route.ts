import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const leadId = searchParams.get("leadId")

  if (!leadId)
    return NextResponse.json({ error: "leadId required" }, { status: 400 })

  try {
    const activities = await db.activity.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(activities)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { leadId, type, title, description, scheduledAt, adminName } = await req.json()

    if (!leadId || !type || !title)
      return NextResponse.json({ error: "leadId, type, title required" }, { status: 400 })

    const validTypes = ["CALL", "EMAIL", "WHATSAPP", "MEETING", "NOTE", "TASK"]
    if (!validTypes.includes(type))
      return NextResponse.json({ error: "Invalid activity type" }, { status: 400 })

    const activity = await db.activity.create({
      data: {
        leadId,
        type,
        title,
        description: description || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        adminName: adminName || null,
      },
    })
    return NextResponse.json(activity, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id)
    return NextResponse.json({ error: "id required" }, { status: 400 })

  try {
    const { outcome } = await req.json()
    const activity = await db.activity.update({
      where: { id },
      data: {
        completedAt: new Date(),
        outcome: outcome || null,
      },
    })
    return NextResponse.json(activity)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
