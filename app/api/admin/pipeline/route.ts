import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

const STAGES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "WON", "LOST"] as const

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const leads = await db.contactLead.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { activities: true } },
      },
    })

    const grouped: Record<string, any[]> = {
      NEW: [], CONTACTED: [], QUALIFIED: [], PROPOSAL_SENT: [], WON: [], LOST: [],
    }

    for (const lead of leads) {
      const stage = lead.status as string
      if (!grouped[stage]) grouped[stage] = []
      grouped[stage].push({
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email || "",
        service: lead.service || "",
        score: lead.score,
        scoreLabel: lead.scoreLabel,
        assignedTo: lead.assignedTo || "",
        followUpAt: lead.followUpAt ? lead.followUpAt.toISOString() : null,
        budget: lead.budget || "",
        source: lead.source,
        activitiesCount: lead._count.activities,
        createdAt: lead.createdAt.toISOString(),
      })
    }

    return NextResponse.json(grouped)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { leadId, newStatus } = await req.json()

    if (!leadId || !newStatus)
      return NextResponse.json({ error: "leadId and newStatus required" }, { status: 400 })

    if (!STAGES.includes(newStatus as typeof STAGES[number]))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })

    const lead = await db.contactLead.update({
      where: { id: leadId },
      data: { status: newStatus },
    })
    return NextResponse.json({ success: true, lead })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
