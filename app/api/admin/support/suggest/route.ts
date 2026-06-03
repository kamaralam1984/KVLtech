import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { subject, clientName, originalMessage, replies, priority } = await req.json();

    if (!subject || !clientName) {
      return NextResponse.json({ error: "subject and clientName required" }, { status: 400 });
    }

    // Build conversation context
    const conversationHistory = (replies || [])
      .slice(-4)
      .map((r: any) => `${r.authorType === "admin" ? "KVL TECH" : clientName}: ${r.message}`)
      .join("\n");

    const prompt = `You are a professional customer support agent for KVL TECH, a website development company in India.

Generate a helpful, professional reply for this support ticket. Reply in Hinglish (mix of Hindi and English).

Ticket Details:
- Client: ${clientName}
- Subject: ${subject}
- Priority: ${priority || "MEDIUM"}
- Original Message: "${originalMessage}"
${conversationHistory ? `\nConversation so far:\n${conversationHistory}` : ""}

Guidelines:
- Start with "Namaste ${clientName} ji!"
- Be empathetic and professional
- Give a concrete solution or timeline
- Keep it concise (3-5 sentences max)
- End with reassurance
- If technical issue: give estimated fix time
- If delivery query: give status update
- Don't use markdown, just plain text

Reply ONLY with the message text, nothing else:`;

    const res = await fetch(GROQ_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.6,
      }),
    });

    const data = await res.json();
    const suggestion = data.choices?.[0]?.message?.content?.trim() || "";

    if (!suggestion) {
      return NextResponse.json({ error: "AI suggestion failed" }, { status: 500 });
    }

    return NextResponse.json({ suggestion });
  } catch (err) {
    console.error("Support suggest error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
