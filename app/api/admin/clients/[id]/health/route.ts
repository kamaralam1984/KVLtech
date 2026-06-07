import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { getClientHealthScore } from "@/lib/predictive"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: "Client ID required" }, { status: 400 })

    const { score, label, factors } = await getClientHealthScore(id)

    return NextResponse.json({ clientId: id, score, label, factors })
  } catch (err) {
    console.error("Client health score error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
