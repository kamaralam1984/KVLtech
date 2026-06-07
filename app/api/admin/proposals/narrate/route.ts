import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateNarrationScript } from "@/lib/voice-narration"

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { proposalId, duration, tone, clientName, proposalContent } = await req.json()

    let content = ""

    // Use inline content if provided (from live generation)
    if (proposalContent && typeof proposalContent === "string" && proposalContent.length > 10) {
      content = proposalContent
    } else if (proposalId && proposalId !== "inline") {
      // Fetch proposal content from audit log
      const auditLog = await db.auditLog.findUnique({ where: { id: proposalId } })
      if (!auditLog)
        return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
      content = auditLog.details || auditLog.action
    } else {
      return NextResponse.json({ error: "proposalContent or proposalId is required" }, { status: 400 })
    }

    const result = await generateNarrationScript(content, {
      duration: duration as "short" | "medium" | "long" | undefined,
      tone: tone as "formal" | "friendly" | "enthusiastic" | undefined,
      clientName: clientName || undefined,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error("Narration generation error:", err)
    return NextResponse.json({ error: "Failed to generate narration" }, { status: 500 })
  }
}
