import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

async function getAdminName(adminId: string): Promise<string> {
  try {
    const admin = await db.admin.findUnique({ where: { id: adminId }, select: { name: true } })
    return admin?.name || "Admin"
  } catch {
    return "Admin"
  }
}

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const assignedTo = searchParams.get("assignedTo")

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (assignedTo) where.assignedTo = assignedTo

    const tasks = await db.teamTask.findMany({
      where,
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    })

    return NextResponse.json({ tasks })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { title, description, assignedTo, dueDate, priority = "MEDIUM", tags = [] } = body

    if (!title?.trim())
      return NextResponse.json({ error: "Title is required" }, { status: 400 })

    const assignedBy = await getAdminName(admin.id)

    const task = await db.teamTask.create({
      data: {
        title: title.trim(),
        description,
        assignedTo: assignedTo || null,
        assignedBy,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        tags,
        status: "TODO",
      },
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { id, status, title, assignedTo, dueDate, priority } = body

    if (!id) return NextResponse.json({ error: "Task ID required" }, { status: 400 })

    const data: Record<string, unknown> = {}
    if (status !== undefined) data.status = status
    if (title !== undefined) data.title = title.trim()
    if (assignedTo !== undefined) data.assignedTo = assignedTo || null
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null
    if (priority !== undefined) data.priority = priority

    const task = await db.teamTask.update({ where: { id }, data })

    return NextResponse.json({ task })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Task ID required" }, { status: 400 })

    await db.teamTask.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
