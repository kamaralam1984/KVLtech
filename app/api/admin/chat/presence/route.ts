import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import {
  setUserOnline,
  setUserOffline,
  setUserAway,
  getOnlineUsers,
} from "@/lib/chat-store"
import { wsBroadcast } from "@/lib/ws-broadcast"

// GET /api/admin/chat/presence — get all online users
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const users = getOnlineUsers()
  return NextResponse.json({ users })
}

// POST /api/admin/chat/presence — update own presence status
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { status } = body

  if (!["online", "away", "offline"].includes(status)) {
    return NextResponse.json({ error: "status must be online, away, or offline" }, { status: 400 })
  }

  const adminName = (admin as { id: string; email: string; name?: string }).name ?? admin.email

  if (status === "online") {
    setUserOnline(admin.id, adminName)
  } else if (status === "away") {
    setUserAway(admin.id)
  } else {
    setUserOffline(admin.id)
  }

  // Broadcast presence update to all team members
  wsBroadcast("team", { type: "presence", adminId: admin.id, adminName, status })

  return NextResponse.json({ ok: true })
}
