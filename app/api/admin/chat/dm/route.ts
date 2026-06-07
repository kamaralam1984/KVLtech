import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import {
  getDMConversation,
  getDMMessages,
  addDMMessage,
  getDMsForUser,
  markDMRead,
  generateId,
  ChatMessage,
} from "@/lib/chat-store"
import { wsSendToUser } from "@/lib/ws-broadcast"

// GET /api/admin/chat/dm?withUserId=  — get DM conversation with specific user
// GET /api/admin/chat/dm?list=true    — list all DM conversations for current admin
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const list = searchParams.get("list")
  const withUserId = searchParams.get("withUserId")

  if (list === "true") {
    const convs = getDMsForUser(admin.id)
    return NextResponse.json({ conversations: convs })
  }

  if (withUserId) {
    const conv = getDMConversation(admin.id, withUserId)
    const messages = getDMMessages(conv.id)
    const unread = conv.unread[admin.id] ?? 0
    return NextResponse.json({ dmId: conv.id, messages, unread })
  }

  return NextResponse.json({ error: "Provide withUserId or list=true" }, { status: 400 })
}

// POST /api/admin/chat/dm — send a DM
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { toAdminId, content, replyToId } = body

  if (!toAdminId) return NextResponse.json({ error: "toAdminId required" }, { status: 400 })
  if (!content?.trim()) return NextResponse.json({ error: "content required" }, { status: 400 })

  const adminName = (admin as { id: string; email: string; name?: string }).name ?? admin.email

  const conv = getDMConversation(admin.id, toAdminId)

  // Build replyTo preview
  let replyTo: ChatMessage["replyTo"] = null
  if (replyToId) {
    const parent = conv.messages.find(m => m.id === replyToId)
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
    channelId: conv.id,
    authorId: admin.id,
    authorName: adminName,
    authorRole: "admin",
    content: content.trim(),
    mentions: [],
    replyToId: replyToId ?? undefined,
    replyTo,
    reactions: {},
    type: "text",
    createdAt: new Date().toISOString(),
  }

  addDMMessage(conv.id, message)

  // Notify recipient via WebSocket
  wsSendToUser(toAdminId, { type: "dm", dmId: conv.id, message, fromAdminId: admin.id })

  return NextResponse.json({ message }, { status: 201 })
}

// PATCH /api/admin/chat/dm — mark DM as read
export async function PATCH(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { dmId } = body

  if (!dmId) return NextResponse.json({ error: "dmId required" }, { status: 400 })

  // Verify the admin is a participant
  const dmIdCheck = dmId as string
  if (!dmIdCheck.includes(admin.id)) {
    return NextResponse.json({ error: "Not a participant in this DM" }, { status: 403 })
  }

  markDMRead(dmId, admin.id)
  return NextResponse.json({ ok: true })
}

