import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processMessage } from "@/lib/sales-agent";

// ── Enhanced Kaviya 2.0 System Prompt ────────────────────────────────────────
const KAVIYA_SYSTEM = `You are Kaviya, KVL TECH's friendly AI assistant. KVL TECH is a premium software development company at kvlbusinesssolutions.com.

Services: Website Development (₹15,000–₹50,000+), Software/SaaS (₹50,000–₹5L+), Mobile Apps (₹30,000+), Digital Marketing, ERP/CRM Systems.

Plans: Basic (₹15K-₹25K, 3-5 pages), Premium (₹30K-₹60K, full features), Custom (₹1L+, enterprise).

Key facts:
- Response in 3-5 business days (start), delivery in 2-8 weeks depending on project
- Payment: Razorpay/Stripe, 50% advance + 50% on delivery
- Free support for 6 months after delivery
- WhatsApp: same number as contact form
- Contact: +91 9942000413 | kvlbusinesssolutions.com

Personality: Warm, professional, concise. Use emojis sparingly. Always try to help the visitor take the next step.

When someone asks about pricing: give ranges, then ask what type of project they need.
When someone asks about timeline: ask about project scope first.
When someone seems interested: gently guide them to fill the contact form or WhatsApp.
When someone reports a bug/issue: show empathy, ask for order number, offer to create support ticket.
Keep replies SHORT: 3-5 lines, conversational.`;

// ── Intent Detection ──────────────────────────────────────────────────────────
type Intent = "PRICING" | "TIMELINE" | "CONTACT" | "SUPPORT" | "ESCALATE" | "SERVICES" | "SALES_AGENT" | "GENERAL";

function detectIntent(message: string): Intent {
  const m = message.toLowerCase();
  if (m.match(/price|cost|how much|rates|quote|₹|rs\.|rupee/)) return "PRICING";
  if (m.match(/time|when|how long|days|weeks|delivery|deadline/)) return "TIMELINE";
  if (m.match(/contact|whatsapp|call|email|phone|reach/)) return "CONTACT";
  if (m.match(/bug|error|issue|problem|broken|not working|fix/)) return "SUPPORT";
  if (m.match(/human|agent|real person|talk to someone/)) return "ESCALATE";
  if (m.match(/website|software|mobile|app|saas|erp|crm/)) return "SERVICES";
  if (m.match(/sales|buy|purchase|order now|i want to buy|place order|get started/)) return "SALES_AGENT";
  return "GENERAL";
}

// ── Quick Reply Map ───────────────────────────────────────────────────────────
const QUICK_REPLIES: Record<Intent, string[]> = {
  PRICING:       ["Website Development", "Mobile App", "SaaS Platform", "See all packages"],
  SERVICES:      ["View Pricing", "See Portfolio", "Talk to Team"],
  SUPPORT:       ["Create Support Ticket", "Track my order", "Contact WhatsApp"],
  CONTACT:       ["WhatsApp Us", "Fill Contact Form", "Call Now"],
  TIMELINE:      ["Tell me my project scope", "Basic Website", "Complex Software"],
  ESCALATE:      ["Connect on WhatsApp", "Fill Contact Form"],
  SALES_AGENT:   ["Yes, I need a website", "Tell me about pricing", "Book a call"],
  GENERAL:       ["What services do you offer?", "Pricing Plans", "Contact Us"],
};

// ── Escalation special response ──────────────────────────────────────────────
const ESCALATION_RESPONSE = `Of course! I'll connect you with a real team member right away. 🙏

You can reach us on:
📱 WhatsApp: +91 9942000413
📧 Contact form: kvlbusinesssolutions.com/contact

Our team typically responds within 30 minutes during business hours. Would you like me to help you with anything else in the meantime?`;

// ── Fallback responses ────────────────────────────────────────────────────────
const FALLBACKS = [
  "Hello! 🙏 I'm Kaviya from KVL TECH. How can I help you today?",
  "KVL TECH builds premium websites, apps, and software. What kind of project do you have in mind?",
  "We have solutions for all business types — restaurants, hospitals, schools, e-commerce and more. What are you looking for?",
  "Feel free to reach us on WhatsApp: +91 9942000413 or fill our contact form. Our team responds within 30 minutes! 😊",
];

// ── Multi-model AI failover ───────────────────────────────────────────────────
async function callAI(
  messages: { role: string; content: string }[],
  systemPrompt: string
): Promise<string> {
  // 1. Groq (primary — fastest, free 14,400/day)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && !groqKey.startsWith("gsk_placeholder")) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          max_tokens: 300,
          temperature: 0.7,
          messages: [{ role: "system", content: systemPrompt }, ...messages.slice(-6)],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch { /* fallthrough */ }
  }

  // 2. Gemini Flash
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && !geminiKey.startsWith("AIzaSy_placeholder")) {
    try {
      const geminiMessages = messages.slice(-6).map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: geminiMessages,
            generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch { /* fallthrough */ }
  }

  // 3. Mistral
  const mistralKey = process.env.MISTRAL_API_KEY;
  if (mistralKey && !mistralKey.startsWith("placeholder")) {
    try {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${mistralKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "mistral-small-latest",
          max_tokens: 300,
          messages: [{ role: "system", content: systemPrompt }, ...messages.slice(-6)],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch { /* fallthrough */ }
  }

  // 4. OpenRouter (aggregator)
  const orKey = process.env.OPENROUTER_API_KEY;
  if (orKey && !orKey.startsWith("sk-or-v1-placeholder")) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${orKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://kvlbusinesssolutions.com",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct:free",
          max_tokens: 300,
          messages: [{ role: "system", content: systemPrompt }, ...messages.slice(-6)],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch { /* fallthrough */ }
  }

  throw new Error("All AI providers failed");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Accept new format: { message, history, sessionId, sessionName, lang }
    // or legacy:         { messages, sessionId, leadInfo }
    let history: { role: "user" | "assistant"; content: string }[] = [];
    let currentMessage = "";
    let sessionId: string | undefined;
    let sessionName: string | undefined;
    let selectedLang = body.lang || "en";

    if (typeof body.message === "string") {
      currentMessage = body.message;
      history = Array.isArray(body.history) ? body.history : [];
      sessionId = body.sessionId;
      sessionName = body.sessionName;
    } else {
      // Legacy shape
      const msgs: { role: "user" | "assistant"; content: string }[] = Array.isArray(body.messages)
        ? body.messages
        : [];
      if (msgs.length === 0) {
        return NextResponse.json({ message: FALLBACKS[0], intent: "GENERAL" });
      }
      const last = msgs[msgs.length - 1];
      currentMessage = last.role === "user" ? last.content : "";
      history = msgs.slice(0, -1);
      sessionId = body.sessionId;
      sessionName = body.leadInfo?.name;
      // Legacy lead save
      if (body.leadInfo?.phone) {
        db.contactLead.create({
          data: {
            name: body.leadInfo.name || "Chat Visitor",
            email: body.leadInfo.email || null,
            phone: body.leadInfo.phone,
            service: body.leadInfo.interest || "General Inquiry",
            message: `Chat conversation lead. Session: ${sessionId || "unknown"}.`,
            source: "chat_widget",
            status: "NEW",
          },
        }).catch(() => {});
      }
    }

    if (!currentMessage.trim()) {
      return NextResponse.json({ message: FALLBACKS[0], intent: "GENERAL" });
    }

    // ── Intent Detection ─────────────────────────────────────────────────────
    const intent = detectIntent(currentMessage);

    // ── Escalation fast-path ─────────────────────────────────────────────────
    if (intent === "ESCALATE") {
      return NextResponse.json({
        message: ESCALATION_RESPONSE,
        quickReplies: QUICK_REPLIES.ESCALATE,
        intent: "ESCALATE",
        leadCaptured: false,
      });
    }

    // ── Sales Agent delegation ────────────────────────────────────────────────
    if (intent === "SALES_AGENT" && sessionId) {
      try {
        const agentResponse = await processMessage(sessionId, currentMessage, "web");
        return NextResponse.json({
          message: agentResponse.message,
          reply: agentResponse.message,
          quickReplies: agentResponse.quickReplies || [],
          intent: "SALES_AGENT",
          leadCaptured: agentResponse.leadCaptured,
          bookingUrl: agentResponse.bookingUrl,
          stage: agentResponse.stage,
          qualificationScore: agentResponse.qualificationScore,
        });
      } catch {
        // Fall through to normal AI handling if sales agent fails
      }
    }

    // ── Lead Capture from message ────────────────────────────────────────────
    const phoneMatch = currentMessage.match(/\b(\+91[\s-]?)?[6-9]\d{9}\b/);
    const emailMatch = currentMessage.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/);
    let leadCaptured = false;

    if ((phoneMatch || emailMatch) && sessionName) {
      db.contactLead.create({
        data: {
          name: sessionName,
          email: emailMatch?.[0] || `chat-${Date.now()}@kvlchat.com`,
          phone: phoneMatch?.[0] || "",
          service: "Inquiry via Chat",
          message: `Chat lead capture: ${currentMessage}`,
          source: "CHAT",
          status: "NEW",
        },
      }).catch(() => {});
      leadCaptured = true;
    }

    // ── KB Article Search ─────────────────────────────────────────────────────
    let systemContext = KAVIYA_SYSTEM;
    try {
      const keywords = currentMessage
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 4)
        .slice(0, 3);

      if (keywords.length > 0) {
        const kbResults = await db.kBArticle.findMany({
          where: {
            isPublished: true,
            OR: keywords.map(k => ({ title: { contains: k, mode: "insensitive" as const } })),
          },
          take: 2,
          select: { title: true, content: true, slug: true },
        });
        if (kbResults.length > 0) {
          systemContext +=
            "\n\nRelevant knowledge base:\n" +
            kbResults.map(a => `${a.title}: ${a.content.slice(0, 300)}...`).join("\n");
        }
      }
    } catch { /* KB search is optional */ }

    // ── Language instruction ──────────────────────────────────────────────────
    const LANG_NAMES: Record<string, string> = {
      en: "English only.",
      hi: "Hindi / Hinglish (Roman script) — warm style.",
      ar: "Arabic only — every word in Arabic script.",
      ru: "Russian only.",
      de: "German only.",
    };
    if (selectedLang && selectedLang !== "en") {
      systemContext += `\n\n⚠️ MANDATORY LANGUAGE RULE: Respond in ${LANG_NAMES[selectedLang] || "English only."}`;
    }

    // ── Build messages array for AI ───────────────────────────────────────────
    const allMessages: { role: string; content: string }[] = [
      ...history.slice(-6),
      { role: "user", content: currentMessage },
    ];

    // ── AI call with fallback ─────────────────────────────────────────────────
    const hasAnyKey =
      (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.startsWith("gsk_placeholder")) ||
      (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith("AIzaSy_placeholder")) ||
      (process.env.MISTRAL_API_KEY && !process.env.MISTRAL_API_KEY.startsWith("placeholder")) ||
      (process.env.OPENROUTER_API_KEY && !process.env.OPENROUTER_API_KEY.startsWith("sk-or-v1-placeholder"));

    let aiText: string;
    if (hasAnyKey) {
      try {
        aiText = await callAI(allMessages, systemContext);
      } catch {
        aiText = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
      }
    } else {
      aiText = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
    }

    const quickReplies = QUICK_REPLIES[intent] || [];

    return NextResponse.json({
      message: aiText,
      // Also send as `reply` for legacy widget compatibility
      reply: aiText,
      quickReplies,
      intent,
      leadCaptured,
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      message: FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)],
      reply: FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)],
      intent: "GENERAL",
      quickReplies: [],
      leadCaptured: false,
    });
  }
}
