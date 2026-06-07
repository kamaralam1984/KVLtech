import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const channelId = searchParams.get("channelId")
  const cursor = searchParams.get("cursor") || undefined
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)

  if (!channelId)
    return NextResponse.json({ error: "channelId required" }, { status: 400 })

  try {
    const messages = await db.teamMessage.findMany({
      where: { channelId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    let nextCursor: string | null = null
    if (messages.length > limit) {
      const next = messages.pop()
      nextCursor = next?.id ?? null
    }

    return NextResponse.json({ messages: messages.reverse(), nextCursor })
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
    const { channelId, text, mentions = [], replyToId } = body

    if (!channelId || !text?.trim())
      return NextResponse.json({ error: "channelId and text required" }, { status: 400 })

    // Verify channel exists and admin has access
    const channel = await db.teamChannel.findFirst({
      where: {
        id: channelId,
        OR: [
          { isPrivate: false },
          { members: { has: admin.id } },
          { createdBy: admin.id },
        ],
      },
    })

    if (!channel)
      return NextResponse.json({ error: "Channel not found or access denied" }, { status: 404 })

    const message = await db.teamMessage.create({
      data: {
        channelId,
        senderId: admin.id,
        senderName: admin.email,
        text: text.trim(),
        mentions,
        ...(replyToId ? { replyToId } : {}),
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
