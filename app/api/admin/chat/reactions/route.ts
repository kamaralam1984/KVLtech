import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { findMessage, updateMessage } from "@/lib/chat-store"
import { wsBroadcast } from "@/lib/ws-broadcast"

// POST /api/admin/chat/reactions — toggle a reaction
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { messageId, channelId, emoji } = body

  if (!messageId || !channelId || !emoji) {
    return NextResponse.json({ error: "messageId, channelId, and emoji required" }, { status: 400 })
  }

  const msg = findMessage(channelId, messageId)
  if (!msg) return NextResponse.json({ error: "Message not found" }, { status: 404 })

  // Toggle: add if not present, remove if present
  const reactions = { ...msg.reactions }
  const users = reactions[emoji] ?? []
  if (users.includes(admin.id)) {
    reactions[emoji] = users.filter(u => u !== admin.id)
    if (reactions[emoji].length === 0) delete reactions[emoji]
  } else {
    reactions[emoji] = [...users, admin.id]
  }

  const updated = updateMessage(channelId, messageId, { reactions })

  wsBroadcast("team", {
    type: "reaction",
    messageId,
    channelId,
    reactions: updated?.reactions ?? reactions,
  })

  return NextResponse.json({ reactions: updated?.reactions ?? reactions })
}
