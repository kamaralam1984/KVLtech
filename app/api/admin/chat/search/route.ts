import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { searchMessages } from "@/lib/chat-store"

// GET /api/admin/chat/search?q=&channelId= — search messages
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const q = searchParams.get("q")
  const channelId = searchParams.get("channelId") ?? undefined

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ error: "q must be at least 2 characters" }, { status: 400 })
  }

  const results = searchMessages(q.trim(), channelId)
  return NextResponse.json({ results, total: results.length })
}
