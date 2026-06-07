import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { findMessage, addMessage, getChannel, generateId } from "@/lib/chat-store"
import { wsBroadcast } from "@/lib/ws-broadcast"

// POST /api/admin/chat/voice — save a voice message
// Body: { channelId, duration, transcription?, audioDataUrl }
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { channelId, duration, transcription, audioDataUrl } = body

  if (!channelId) return NextResponse.json({ error: "channelId required" }, { status: 400 })
  if (!audioDataUrl) return NextResponse.json({ error: "audioDataUrl required" }, { status: 400 })

  const channel = getChannel(channelId)
  if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 })

  const adminUser = admin as { id: string; email: string; name?: string }

  const message = addMessage({
    id: generateId(),
    channelId,
    authorId: admin.id,
    authorName: adminUser.name ?? admin.email,
    authorRole: "admin",
    content: transcription ?? `Voice message (${Math.round(duration ?? 0)}s)`,
    mentions: [],
    reactions: {},
    type: "voice",
    attachmentUrl: audioDataUrl, // store base64 data URL
    createdAt: new Date().toISOString(),
  })

  wsBroadcast("team", { type: "new_message", channelId, message })

  return NextResponse.json({ message }, { status: 201 })
}

// GET /api/admin/chat/voice?messageId=&channelId= — get voice message data
export async function GET(req: NextRequest) {
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
  if (msg.type !== "voice") return NextResponse.json({ error: "Not a voice message" }, { status: 400 })

  return NextResponse.json({
    id: msg.id,
    audioDataUrl: msg.attachmentUrl,
    content: msg.content,
    createdAt: msg.createdAt,
  })
}
