import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { analyzeTicket, generateTicketResponse } from "@/lib/ticket-intelligence"

// In-memory cache: ticketId -> { result, expiresAt }
const analysisCache = new Map<string, { result: any; expiresAt: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function getCached(ticketId: string): any | null {
  const entry = analysisCache.get(ticketId)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    analysisCache.delete(ticketId)
    return null
  }
  return entry.result
}

function setCache(ticketId: string, result: any) {
  analysisCache.set(ticketId, { result, expiresAt: Date.now() + CACHE_TTL_MS })
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { ticketId, action = "analyze", context } = await req.json()

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId required" }, { status: 400 })
    }

    if (action === "generate-response") {
      const response = await generateTicketResponse(ticketId, context)
      return NextResponse.json({ response })
    }

    // analyze or suggest-priority — both need full analysis
    const cached = getCached(ticketId)
    const analysis = cached ?? (await analyzeTicket(ticketId))
    if (!cached) setCache(ticketId, analysis)

    if (action === "suggest-priority") {
      return NextResponse.json({ suggestedPriority: analysis.suggestedPriority })
    }

    // default: "analyze"
    return NextResponse.json(analysis)
  } catch (err) {
    console.error("[support/analyze]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
