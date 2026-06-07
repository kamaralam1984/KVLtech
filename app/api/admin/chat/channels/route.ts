import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { getChannels, createChannel, generateId } from "@/lib/chat-store"

// GET /api/admin/chat/channels — list all channels
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const channels = getChannels()
  return NextResponse.json({ channels })
}

// POST /api/admin/chat/channels — create a new channel
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, description = "", isPrivate = false, members = [] } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: "Channel name is required" }, { status: 400 })
  }

  const slug = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  const channel = createChannel({
    id: generateId(),
    name: slug,
    description,
    isPrivate,
    members: Array.isArray(members) ? members : [],
    createdBy: admin.id,
  })

  return NextResponse.json({ channel }, { status: 201 })
}
