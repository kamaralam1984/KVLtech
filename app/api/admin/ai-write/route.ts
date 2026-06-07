import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import Groq from "groq-sdk";

function getGroq() {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const ACTION_PROMPTS: Record<string, (text: string, ctx: string) => string> = {
  improve: (text, ctx) =>
    `You are a professional writing assistant. Improve the following text to make it more professional, clear, and impactful.${ctx ? ` Context: ${ctx}.` : ""} Return only the improved text, no explanation.\n\nText:\n${text}`,
  shorter: (text, ctx) =>
    `Condense the following text significantly while keeping all key points.${ctx ? ` Context: ${ctx}.` : ""} Return only the condensed text.\n\nText:\n${text}`,
  longer: (text, ctx) =>
    `Expand the following text with more detail, examples, and supporting information.${ctx ? ` Context: ${ctx}.` : ""} Return only the expanded text.\n\nText:\n${text}`,
  grammar: (text, ctx) =>
    `Fix all grammar, spelling, and punctuation errors in the following text.${ctx ? ` Context: ${ctx}.` : ""} Return only the corrected text.\n\nText:\n${text}`,
  hindi: (text, ctx) =>
    `Translate the following text to Hindi. Keep it natural and conversational, suitable for WhatsApp messages.${ctx ? ` Context: ${ctx}.` : ""} Return only the Hindi translation.\n\nText:\n${text}`,
};

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
    const { text, action, context } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const promptFn = ACTION_PROMPTS[action as string];
    if (!promptFn) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const groq = getGroq()!;
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: promptFn(text, context || "") }],
      max_tokens: 800,
      temperature: 0.7,
    });

    const result = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ result });
  } catch (err: any) {
    console.error("ai-write error:", err);
    return NextResponse.json(
      { error: "AI writing failed. Check GROQ_API_KEY." },
      { status: 500 }
    );
  }
}
