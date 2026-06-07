import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { clientName, clientBusiness, service, plan, budget, requirements, tone, leadId } =
      await req.json()

    if (!clientName || !clientBusiness || !service || !plan || !budget || !requirements)
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })

    const toneNote = tone === "Friendly"
      ? "Use a warm, friendly tone while maintaining professionalism."
      : tone === "Formal"
      ? "Use a strictly formal, corporate tone."
      : "Use a professional, confident tone."

    const userPrompt = `Generate a comprehensive business proposal for the following client:

Client Name: ${clientName}
Business Type: ${clientBusiness}
Service Requested: ${service}
Plan: ${plan}
Budget Range: ${budget}
Key Requirements: ${requirements}

${toneNote}

Please write a detailed proposal in Markdown format with the following sections:

1. **Executive Summary** — A compelling 2-3 paragraph overview of what we will deliver and why KVL TECH is the right partner.

2. **Understanding of Requirements** — Demonstrate that we understand the client's specific needs, challenges, and goals.

3. **Our Solution** — Detailed breakdown of what we will build: features, technologies, integrations, and how it solves their problems.

4. **Project Timeline** — Milestones with realistic timeframes (e.g., Week 1: Discovery & Design, Week 2: Development, etc.)

5. **Investment** — A pricing table comparing Basic, Premium, and Custom tiers with features listed for each. Highlight the recommended ${plan} plan. Use Indian Rupee (₹) pricing.

6. **Our Guarantee** — Quality assurance, revision policy, support commitment, and delivery promise.

7. **Next Steps** — Clear call to action: what the client needs to do to get started.

Make it persuasive, specific to ${clientBusiness} industry, and tailored for the Indian market. Use professional Markdown formatting with headers, bullet points, and tables where appropriate.`

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are a professional business proposal writer for KVL TECH, a premium digital solutions company based in India. You write compelling, detailed proposals that win clients.",
        },
        { role: "user", content: userPrompt },
      ],
    })

    const proposal = completion.choices[0]?.message?.content || ""
    const generatedAt = new Date().toISOString()

    logAudit(
      req,
      "proposal_generated",
      "proposals",
      leadId || undefined,
      `Proposal generated for ${clientName} (${clientBusiness}) — ${service} ${plan}`
    )

    return NextResponse.json({ proposal, generatedAt })
  } catch (err) {
    console.error("Proposal generation error:", err)
    return NextResponse.json({ error: "Failed to generate proposal" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const leadId = searchParams.get("leadId")

  try {
    const where: Record<string, unknown> = { action: "proposal_generated" }
    if (leadId) where.resourceId = leadId

    const logs = await db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return NextResponse.json({ proposals: logs })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
