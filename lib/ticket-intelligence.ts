import Groq from "groq-sdk"
import { db } from "@/lib/db"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

type TicketAnalysis = {
  category: "BILLING" | "TECHNICAL" | "GENERAL" | "COMPLAINT" | "FEATURE_REQUEST"
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "URGENT"
  suggestedPriority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  autoResponse: string
  similarTicketIds: string[]
  tags: string[]
  escalationRequired: boolean
}

export async function analyzeTicket(ticketId: string): Promise<TicketAnalysis> {
  const ticket = await db.supportTicket.findUnique({
    where: { id: ticketId },
    include: { client: { select: { name: true, email: true } } },
  })
  if (!ticket) throw new Error("Ticket not found")

  // Get recent similar tickets for context
  const recentTickets = await db.supportTicket.findMany({
    where: { id: { not: ticketId } },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, subject: true, message: true, priority: true },
  })

  const prompt = `You are a support ticket analyzer for KVL TECH, a software development company.

Analyze this support ticket and respond with a JSON object only (no markdown, no explanation):

Ticket:
Subject: ${ticket.subject}
Description: ${ticket.message}
Client: ${ticket.client?.name || "Unknown"}

Respond with ONLY this JSON:
{
  "category": "BILLING" | "TECHNICAL" | "GENERAL" | "COMPLAINT" | "FEATURE_REQUEST",
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "URGENT",
  "suggestedPriority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  "autoResponse": "A helpful 2-3 sentence response addressing their issue",
  "tags": ["tag1", "tag2"],
  "escalationRequired": true | false,
  "escalationReason": "reason if escalation needed"
}`

  let analysis: TicketAnalysis
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.2,
    })
    const text = response.choices[0]?.message?.content || "{}"
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : "{}")
    analysis = {
      category: parsed.category || "GENERAL",
      sentiment: parsed.sentiment || "NEUTRAL",
      suggestedPriority: parsed.suggestedPriority || "MEDIUM",
      autoResponse:
        parsed.autoResponse ||
        "Thank you for contacting KVL TECH support. We will review your issue and respond within 24 hours.",
      tags: parsed.tags || [],
      escalationRequired: parsed.escalationRequired || false,
      similarTicketIds: [],
    }
  } catch {
    analysis = {
      category: "GENERAL",
      sentiment: "NEUTRAL",
      suggestedPriority: (ticket.priority as any) || "MEDIUM",
      autoResponse:
        "Thank you for contacting KVL TECH support. We will review your issue and respond within 24 hours.",
      tags: [],
      escalationRequired: false,
      similarTicketIds: [],
    }
  }

  // Find similar tickets by keyword overlap
  const words = ticket.subject
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3)
  const similar = recentTickets
    .filter((t) =>
      words.some(
        (w) =>
          t.subject.toLowerCase().includes(w) ||
          (t.message || "").toLowerCase().includes(w)
      )
    )
    .slice(0, 3)
  analysis.similarTicketIds = similar.map((t) => t.id)

  return analysis
}

export async function generateTicketResponse(
  ticketId: string,
  adminContext?: string
): Promise<string> {
  const ticket = await db.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      client: { select: { name: true } },
      replies: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  })
  if (!ticket) throw new Error("Ticket not found")

  const conversationHistory = ticket.replies
    .map((r) => `${r.authorType === "admin" ? "Support" : "Client"}: ${r.message}`)
    .reverse()
    .join("\n")

  const prompt = `You are a professional support agent for KVL TECH (a software development company).

Write a helpful, professional reply to this support ticket.
${adminContext ? `Admin note: ${adminContext}` : ""}

Ticket Subject: ${ticket.subject}
Description: ${ticket.message}
Client Name: ${ticket.client?.name || "Valued Customer"}
${conversationHistory ? `\nConversation so far:\n${conversationHistory}` : ""}

Write a clear, empathetic response (2-4 sentences). Be specific, professional, and helpful.`

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.4,
    })
    return (
      response.choices[0]?.message?.content ||
      "Thank you for reaching out. Our team will assist you shortly."
    )
  } catch {
    return "Thank you for reaching out. Our team will assist you shortly."
  }
}
