import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "in", "on", "at", "to", "for", "of", "and",
  "or", "but", "my", "i", "we", "you", "with", "have", "has", "it",
  "this", "that", "can", "not", "be", "are", "was",
])

const URGENT_KEYWORDS = ["urgent", "asap", "immediately", "critical", "broken", "down", "emergency", "not working", "failed"]

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Fetch all tickets from last 30 days
    const tickets = await db.supportTicket.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
    })

    // Category breakdown using existing status/priority as proxy (no category field on ticket)
    // We group by priority as a category approximation, and also track by keyword heuristic
    const categoryBreakdown: Record<string, number> = {
      BILLING: 0,
      TECHNICAL: 0,
      GENERAL: 0,
      COMPLAINT: 0,
      FEATURE_REQUEST: 0,
    }

    for (const t of tickets) {
      const text = (t.subject + " " + t.message).toLowerCase()
      if (/billing|invoice|payment|refund|charge|price|cost/.test(text)) {
        categoryBreakdown.BILLING++
      } else if (/bug|error|crash|broken|not work|issue|fix|technical|code|api|server/.test(text)) {
        categoryBreakdown.TECHNICAL++
      } else if (/feature|request|add|enhance|suggestion|want|wish|would like/.test(text)) {
        categoryBreakdown.FEATURE_REQUEST++
      } else if (/complain|unhappy|frustrated|disappoint|worst|terrible|bad service/.test(text)) {
        categoryBreakdown.COMPLAINT++
      } else {
        categoryBreakdown.GENERAL++
      }
    }

    // Avg resolution time (hours) for resolved tickets in last 30 days
    const resolvedTickets = tickets.filter(
      (t) => (t.status === "RESOLVED" || t.status === "CLOSED") && t.closedAt
    )
    let avgResolutionTime = 0
    if (resolvedTickets.length > 0) {
      const totalMs = resolvedTickets.reduce((sum, t) => {
        return sum + (t.closedAt!.getTime() - t.createdAt.getTime())
      }, 0)
      avgResolutionTime = parseFloat(
        (totalMs / resolvedTickets.length / (1000 * 60 * 60)).toFixed(1)
      )
    }

    // Sentiment trend: % urgent keywords in last 7 days vs previous 7 days
    const last7 = tickets.filter((t) => t.createdAt >= sevenDaysAgo)
    const prev7 = tickets.filter(
      (t) => t.createdAt >= fourteenDaysAgo && t.createdAt < sevenDaysAgo
    )

    const countUrgent = (arr: typeof tickets) =>
      arr.filter((t) => {
        const text = (t.subject + " " + t.message).toLowerCase()
        return URGENT_KEYWORDS.some((kw) => text.includes(kw)) || t.priority === "URGENT"
      }).length

    const urgentLast7Pct =
      last7.length > 0
        ? parseFloat(((countUrgent(last7) / last7.length) * 100).toFixed(1))
        : 0
    const urgentPrev7Pct =
      prev7.length > 0
        ? parseFloat(((countUrgent(prev7) / prev7.length) * 100).toFixed(1))
        : 0

    // High priority open count
    const highPriorityOpen = tickets.filter(
      (t) =>
        (t.priority === "HIGH" || t.priority === "URGENT") &&
        t.status !== "RESOLVED" &&
        t.status !== "CLOSED"
    ).length

    // Top issue keywords from ticket subjects
    const wordFreq: Record<string, number> = {}
    for (const t of tickets) {
      const words = t.subject
        .toLowerCase()
        .replace(/[^a-z\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
      for (const w of words) {
        wordFreq[w] = (wordFreq[w] || 0) + 1
      }
    }
    const topIssueKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }))

    // Open tickets (current)
    const openTickets = await db.supportTicket.count({
      where: {
        status: { in: ["OPEN", "IN_PROGRESS", "WAITING_CLIENT"] },
      },
    })

    // Needs attention: HIGH/URGENT open tickets unresolved > 24h
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const needsAttention = await db.supportTicket.findMany({
      where: {
        status: { in: ["OPEN", "IN_PROGRESS", "WAITING_CLIENT"] },
        priority: { in: ["HIGH", "URGENT"] },
        createdAt: { lte: twentyFourHoursAgo },
      },
      include: {
        client: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 3,
    })

    return NextResponse.json({
      categoryBreakdown,
      avgResolutionTime,
      sentimentTrend: {
        last7DaysPct: urgentLast7Pct,
        prev7DaysPct: urgentPrev7Pct,
        trend: urgentLast7Pct > urgentPrev7Pct ? "up" : urgentLast7Pct < urgentPrev7Pct ? "down" : "stable",
      },
      highPriorityOpen,
      openTickets,
      topIssueKeywords,
      needsAttention: needsAttention.map((t) => ({
        id: t.id,
        ticketNo: t.ticketNo,
        subject: t.subject,
        priority: t.priority,
        status: t.status,
        createdAt: t.createdAt,
        clientName: t.client?.name || "Unknown",
      })),
    })
  } catch (err) {
    console.error("[support/insights]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
