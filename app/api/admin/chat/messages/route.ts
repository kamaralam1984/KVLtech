import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import {
  getChannel,
  getMessages,
  addMessage,
  findMessage,
  updateMessage,
  deleteMessage,
  generateId,
  ChatMessage,
} from "@/lib/chat-store"
import { wsBroadcast } from "@/lib/ws-broadcast"

// GET /api/admin/chat/messages?channelId=&before=&limit=50
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const channelId = searchParams.get("channelId")
  const before = searchParams.get("before")
  const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 100)

  if (!channelId) return NextResponse.json({ error: "channelId required" }, { status: 400 })

  const channel = getChannel(channelId)
  if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 })

  let msgs = getMessages(channelId)

  // Filter messages before the cursor
  if (before) {
    const idx = msgs.findIndex(m => m.id === before)
    if (idx !== -1) msgs = msgs.slice(0, idx)
  }

  // Return last `limit` messages (newest at end)
  const page = msgs.slice(-limit)
  const hasMore = msgs.length > limit
  const nextCursor = hasMore ? page[0]?.id : null

  return NextResponse.json({ messages: page, nextCursor })
}

// POST /api/admin/chat/messages — send a message
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { channelId, content, mentions = [], replyToId, attachmentUrl, attachmentDataUrl, attachmentName, attachmentType, type = "text" } = body

  if (!channelId) return NextResponse.json({ error: "channelId required" }, { status: 400 })
  if (!content?.trim() && type !== "voice" && type !== "file") {
    return NextResponse.json({ error: "content required" }, { status: 400 })
  }

  const channel = getChannel(channelId)
  if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 })

  // Build replyTo preview
  let replyTo: ChatMessage["replyTo"] = null
  if (replyToId) {
    const parent = findMessage(channelId, replyToId)
    if (parent) {
      replyTo = {
        id: parent.id,
        authorName: parent.authorName,
        content: parent.content.slice(0, 100),
      }
    }
  }

  const message: ChatMessage = {
    id: generateId(),
    channelId,
    authorId: admin.id,
    authorName: (admin as { id: string; email: string; name?: string }).name ?? admin.email,
    authorRole: "admin",
    content: content?.trim() ?? "",
    mentions: Array.isArray(mentions) ? mentions : [],
    replyToId: replyToId ?? undefined,
    replyTo,
    reactions: {},
    type: type as "text" | "voice" | "file",
    attachmentUrl: attachmentUrl ?? undefined,
    attachmentDataUrl: attachmentDataUrl ?? undefined,
    attachmentName: attachmentName ?? undefined,
    attachmentType: attachmentType ?? undefined,
    createdAt: new Date().toISOString(),
  }

  addMessage(message)

  // Broadcast via WebSocket
  wsBroadcast("team", { type: "new_message", channelId, message })

  // Broadcast mention events so clients can highlight/notify by name match
  for (const mentionName of message.mentions) {
    wsBroadcast("team", { type: "mention", channelId, message, mentionedName: mentionName })
  }

  return NextResponse.json({ message }, { status: 201 })
}

// PATCH /api/admin/chat/messages — edit message
export async function PATCH(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { messageId, channelId, content } = body

  if (!messageId || !channelId || !content?.trim()) {
    return NextResponse.json({ error: "messageId, channelId, and content required" }, { status: 400 })
  }

  const msg = findMessage(channelId, messageId)
  if (!msg) return NextResponse.json({ error: "Message not found" }, { status: 404 })
  if (msg.authorId !== admin.id) {
    return NextResponse.json({ error: "Can only edit own messages" }, { status: 403 })
  }

  const updated = updateMessage(channelId, messageId, {
    content: content.trim(),
    editedAt: new Date().toISOString(),
  })

  wsBroadcast("team", { type: "message_edited", channelId, message: updated })

  return NextResponse.json({ message: updated })
}

// DELETE /api/admin/chat/messages — delete message
export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const messageId = searchParams.get("messageId")
  const channelId = searchParams.get("channelId")

  if (!messageId || !channelId) {
    return NextResponse.json({ error: "messageId and channelId required" }, { status: 400 })
  }

  const msg = findMessage(channelId, messageId)
  if (!msg) return NextResponse.json({ error: "Message not found" }, { status: 404 })

  // Allow delete of own or if super admin
  const isOwn = msg.authorId === admin.id
  if (!isOwn) {
    return NextResponse.json({ error: "Not authorized to delete this message" }, { status: 403 })
  }

  deleteMessage(channelId, messageId)
  wsBroadcast("team", { type: "message_deleted", channelId, messageId })

  return NextResponse.json({ ok: true })
}
