import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import Groq from "groq-sdk";

function getGroq() {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "AI features require GROQ_API_KEY in .env" },
      { status: 503 }
    );
  }

  try {
    const {
      targetAudience,
      campaignGoal,
      tone = "professional",
      includeSubjectLines = true,
    } = await req.json();

    if (!targetAudience || !campaignGoal) {
      return NextResponse.json(
        { error: "targetAudience and campaignGoal are required" },
        { status: 400 }
      );
    }

    const prompt = `Create a complete email marketing campaign for KVL TECH (software development company).

Target audience: ${targetAudience}
Campaign goal: ${campaignGoal}
Tone: ${tone}

Provide:
1. 3 subject line variations
2. Preview text (90 chars)
3. Email body (HTML-friendly, 200-300 words)
4. Call-to-action text
5. P.S. line

Format as JSON: {"subjects": [], "preview": "", "body": "", "cta": "", "ps": ""}`;

    const groq = getGroq()!;
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content || "";

    // Extract JSON from response
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("AI did not return valid JSON");
    }

    let campaign: {
      subjects: string[];
      preview: string;
      body: string;
      cta: string;
      ps: string;
    };
    try {
      campaign = JSON.parse(match[0]);
    } catch {
      throw new Error("Failed to parse AI campaign JSON");
    }

    // Ensure subjects is an array
    if (!Array.isArray(campaign.subjects)) campaign.subjects = [];

    return NextResponse.json({ campaign });
  } catch (err: any) {
    console.error("ai-campaign error:", err);
    const msg =
      err?.message?.includes("GROQ_API_KEY")
        ? err.message
        : "Campaign generation failed. Check GROQ_API_KEY.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
