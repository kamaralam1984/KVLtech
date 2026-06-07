import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { transcript } = body;

  if (!transcript || typeof transcript !== "string") {
    return NextResponse.json({ error: "transcript is required" }, { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 503 });
  }

  const prompt = `Analyze this meeting transcript and extract key information.

Return ONLY a valid JSON object with this exact structure:
{
  "summary": "2-3 sentence summary of the meeting",
  "decisions": ["decision 1", "decision 2"],
  "actionItems": [
    {"task": "task description", "owner": "person name or team", "deadline": "date or timeframe or null"}
  ],
  "followUpQuestions": ["question 1", "question 2"]
}

Meeting transcript:
${transcript}`;

  const completion = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [
      {
        role: "system",
        content: "You are a professional meeting assistant. Extract structured information from meeting transcripts. Always respond with valid JSON only, no markdown, no extra text.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });

  const raw = completion.choices[0]?.message?.content?.trim() || "{}";

  let parsed;
  try {
    // Strip markdown code blocks if present
    const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response", raw }, { status: 500 });
  }

  return NextResponse.json({
    summary: parsed.summary || "",
    decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
    actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
    followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : [],
  });
}
