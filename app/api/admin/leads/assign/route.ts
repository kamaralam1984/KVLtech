import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { leadId, assignedTo } = await req.json()

    if (!leadId)
      return NextResponse.json({ error: "leadId required" }, { status: 400 })

    const lead = await db.contactLead.update({
      where: { id: leadId },
      data: { assignedTo: assignedTo || null },
    })
    return NextResponse.json({ success: true, lead })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
