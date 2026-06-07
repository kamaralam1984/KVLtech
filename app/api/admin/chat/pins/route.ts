import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import {
  getChannel,
  findMessage,
  pinMessage,
  unpinMessage,
  getPinnedMessages,
} from "@/lib/chat-store"
import { wsBroadcast } from "@/lib/ws-broadcast"

// GET /api/admin/chat/pins?channelId= — get pinned messages
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const channelId = searchParams.get("channelId")

  if (!channelId) return NextResponse.json({ error: "channelId required" }, { status: 400 })

  const channel = getChannel(channelId)
  if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 })

  const pinned = getPinnedMessages(channelId)
  return NextResponse.json({ pinned })
}

// POST /api/admin/chat/pins — pin a message
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { channelId, messageId } = body

  if (!channelId || !messageId) {
    return NextResponse.json({ error: "channelId and messageId required" }, { status: 400 })
  }

  const channel = getChannel(channelId)
  if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 })

  const message = findMessage(channelId, messageId)
  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 })

  pinMessage(channelId, message)

  // Broadcast pin event
  wsBroadcast("team", { type: "message_pinned", channelId, message })

  return NextResponse.json({ ok: true, pinned: getPinnedMessages(channelId) })
}

// DELETE /api/admin/chat/pins?channelId=&messageId= — unpin a message
export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const channelId = searchParams.get("channelId")
  const messageId = searchParams.get("messageId")

  if (!channelId || !messageId) {
    return NextResponse.json({ error: "channelId and messageId required" }, { status: 400 })
  }

  const channel = getChannel(channelId)
  if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 })

  unpinMessage(channelId, messageId)

  // Broadcast unpin event
  wsBroadcast("team", { type: "message_unpinned", channelId, messageId })

  return NextResponse.json({ ok: true, pinned: getPinnedMessages(channelId) })
}
