import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)
  const cursor = searchParams.get("cursor") || undefined
  const typeFilter = searchParams.get("type") || undefined

  try {
    const events = await db.activityFeedEvent.findMany({
      where: typeFilter ? { type: { startsWith: typeFilter } } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    let nextCursor: string | null = null
    if (events.length > limit) {
      const next = events.pop()
      nextCursor = next?.id ?? null
    }

    return NextResponse.json({ events, nextCursor })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { type, title, description, resourceType, resourceId } = body

    if (!type || !title)
      return NextResponse.json({ error: "type and title required" }, { status: 400 })

    const event = await db.activityFeedEvent.create({
      data: {
        type,
        title,
        description,
        actorName: admin.email,
        actorType: "admin",
        resourceType,
        resourceId,
      },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
