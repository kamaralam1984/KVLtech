import { NextRequest, NextResponse } from "next/server";
import { processMessage, getConversation } from "@/lib/sales-agent";

// ── POST — Send a message ─────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message, name, email } = body as {
      sessionId?: string;
      message?: string;
      name?: string;
      email?: string;
    };

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    // Optionally prepend name/email context for first message
    let userMessage = message.trim();
    const existing = getConversation(sessionId);
    if (!existing && (name || email)) {
      const intro: string[] = [];
      if (name) intro.push(`My name is ${name}`);
      if (email) intro.push(`email: ${email}`);
      userMessage = `${intro.join(", ")}. ${userMessage}`;
    }

    const agentResponse = await processMessage(sessionId, userMessage, "web");

    return NextResponse.json({
      ...agentResponse,
      sessionId,
    });
  } catch (err) {
    console.error("[Web Agent] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── GET — Fetch conversation history ─────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const conversation = getConversation(sessionId);
  if (!conversation) {
    return NextResponse.json({ messages: [], stage: "greeting", qualificationScore: 0 });
  }

  return NextResponse.json({
    sessionId: conversation.sessionId,
    stage: conversation.stage,
    qualificationScore: conversation.leadData.qualificationScore || 0,
    leadData: conversation.leadData,
    messages: conversation.messages,
    isQualified: conversation.isQualified,
    meetingBooked: conversation.meetingBooked,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  });
}
