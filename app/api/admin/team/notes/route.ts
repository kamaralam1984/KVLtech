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
    const q = searchParams.get("q")?.trim()

    const where: Record<string, unknown> = {}
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ]
    }

    const notes = await db.teamNote.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    })

    return NextResponse.json({ notes })
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
    const { title, content, isPinned = false, tags = [] } = body

    if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 })
    if (!content?.trim()) return NextResponse.json({ error: "Content is required" }, { status: 400 })

    const creatorName = await getAdminName(admin.id)

    const note = await db.teamNote.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        createdBy: admin.id,
        creatorName,
        isPinned,
        tags,
      },
    })

    return NextResponse.json({ note }, { status: 201 })
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
    const { id, title, content, isPinned } = body

    if (!id) return NextResponse.json({ error: "Note ID required" }, { status: 400 })

    const data: Record<string, unknown> = {}
    if (title !== undefined) data.title = title.trim()
    if (content !== undefined) data.content = content.trim()
    if (isPinned !== undefined) data.isPinned = isPinned

    const note = await db.teamNote.update({ where: { id }, data })

    return NextResponse.json({ note })
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
    if (!id) return NextResponse.json({ error: "Note ID required" }, { status: 400 })

    await db.teamNote.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
