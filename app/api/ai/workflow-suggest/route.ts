import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { goal } = await req.json();
  if (!goal) return NextResponse.json({ error: "goal is required" }, { status: 400 });

  const prompt = `Suggest an automation workflow for this business goal: "${goal}"

Return ONLY valid JSON (no markdown, no extra text):
{
  "name": "string",
  "description": "string",
  "trigger": "string (e.g. lead_created, order_placed, time_delay)",
  "nodes": [
    {"id": "1", "type": "trigger|action|condition", "label": "string", "config": {}}
  ],
  "edges": [
    {"from": "1", "to": "2"}
  ]
}

Keep it simple: 3-5 nodes max. Make it practical for an Indian SMB.`;

  try {
    const res = await fetch(GROQ_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.5,
      }),
    });

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || "";

    // Extract JSON from response (may have markdown fences)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse AI response" }, { status: 500 });
    }

    const workflow = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ workflow });
  } catch (err) {
    console.error("Workflow suggest error:", err);
    return NextResponse.json({ error: "AI suggestion failed" }, { status: 500 });
  }
}
