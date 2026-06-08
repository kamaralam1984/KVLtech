import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { ticketId } = await req.json();
    if (!ticketId) return NextResponse.json({ error: "ticketId required" }, { status: 400 });

    const ticket = await db.supportTicket.findUnique({
      where: { id: ticketId },
      select: { id: true, subject: true, message: true, priority: true },
    });
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    const prompt = `Classify this support ticket into: priority (LOW/MEDIUM/HIGH/URGENT), category (TECHNICAL/BILLING/GENERAL/FEATURE_REQUEST/BUG), and suggest a brief resolution hint (1-2 sentences).
Subject: ${ticket.subject}
Message: ${ticket.message}
Return JSON only: {"priority":"...","category":"...","hint":"..."}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 200,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "{}";
    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    const priority = (["LOW", "MEDIUM", "HIGH", "URGENT"].includes(parsed.priority)) ? parsed.priority : ticket.priority;
    const category = parsed.category || "GENERAL";
    const hint = parsed.hint || "Review the ticket and respond accordingly.";

    // Update ticket priority in DB
    await db.supportTicket.update({
      where: { id: ticketId },
      data: { priority: priority as any },
    });

    return NextResponse.json({ priority, category, hint, ticketId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
