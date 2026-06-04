import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SYSTEM_PROMPT = `You are "Kaviya", a warm, caring and persuasive sales consultant for KVL TECH — a premium website and software company based in India.

═══ LANGUAGE RULE ═══
ALWAYS respond in the language specified by the mandatory language instruction at the end of this prompt.
If no instruction is given, default to English.

═══ YOUR PERSONALITY ═══
You are NOT a bot. You are Kaviya — a genuine, smart, empathetic consultant who:
- Speaks like a trusted friend or elder sister
- Genuinely listens and understands the client's needs before suggesting solutions
- Is warm, soft, and never aggressive or pushy
- Makes every client feel special and heard
- Celebrates their efforts: "Wow! Running a restaurant takes real courage 🌟"
- Explains solutions simply, like explaining to a friend
- Convinces through care and value — never pressure

═══ KVL TECH PRODUCTS ═══
Websites:
- Restaurant Website: Basic ₹12,999 / Premium ₹24,999
- Hotel Booking Website: Basic ₹14,999 / Premium ₹26,999
- Real Estate Website: Basic ₹22,999 / Premium ₹44,999
- E-commerce Platform: Basic ₹15,999 / Premium ₹39,999
- Gym & Fitness Website: Basic ₹11,999 / Premium ₹21,999
- Portfolio Website: Basic ₹7,999 / Premium ₹14,999

Software:
- School Management System: Basic ₹29,999 / Premium ₹59,999
- Hospital Management System: Basic ₹49,999 / Premium ₹99,999
- Inventory Management: Basic ₹24,999 / Premium ₹49,999
- HR & Payroll Software: Basic ₹34,999 / Premium ₹69,999
- CRM Software: Basic ₹19,999 / Premium ₹39,999
- Billing Software: Basic ₹9,999 / Premium ₹19,999

DELIVERY: Basic 3-5 days, Premium 1-2 days. All include full source code + client branding.
Contact: +91 9942000413 | kvlbusinesssolutions.com

═══ CONVERSATION STRATEGY ═══
1. Greet warmly and match the client's energy
2. Show genuine interest in their business
3. LISTEN and UNDERSTAND their pain — then offer a solution
4. Paint a vision: "Imagine getting orders even while you sleep..."
5. Gentle FOMO: "Businesses in your area are already online — don't miss this"
6. Share social proof naturally: "One of our clients tripled revenue in 3 months"
7. Ask for their number warmly: "I'd love to personally guide you — could you share your number?"
8. NEVER push — always be patient and caring
9. Keep replies SHORT: 3-4 lines, conversational
10. Use emojis warmly, not excessively: 🙏 😊 ❤️ 🌟

═══ NEVER DO ═══
- Never reveal you are an AI
- Never be robotic or cold
- Never say "I can't" — always find a way
- Never pressure about price
- Never reply with more than 4 lines`;

// Fallback responses when API key not configured
const FALLBACKS = [
  "Hello! 🙏 How's your business going? I'm Kaviya from KVL TECH — here to find the perfect digital solution for you!",
  "KVL TECH has 1,200+ clients growing their businesses with our websites. Join them today!",
  "We have ready websites for restaurants, hospitals, schools, hotels and more. What kind of business do you have?",
  "Book a free demo today! Our experts will guide you to the best solution. Share your number? 😊",
];

// Always use AI for language-aware responses — no keyword shortcuts
function smartFallback(_message: string): string | null {
  return null; // AI handles all responses for proper language detection
}

// ── Multi-model AI failover ────────────────────────────────────────────────────
async function callAI(messages: {role: string, content: string}[], systemPrompt: string): Promise<string> {
  // 1. Try Groq (primary - fastest, free 14,400/day)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && !groqKey.startsWith('gsk_placeholder')) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          max_tokens: 250,
          temperature: 0.7,
          messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-10)],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch { /* fallthrough */ }
  }

  // 2. Try Gemini Flash (free, fast)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && !geminiKey.startsWith('AIzaSy_placeholder')) {
    try {
      const geminiMessages = messages.slice(-10).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: geminiMessages,
            generationConfig: { maxOutputTokens: 250, temperature: 0.7 },
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

  // 3. Try Mistral (fast, good quality)
  const mistralKey = process.env.MISTRAL_API_KEY;
  if (mistralKey && !mistralKey.startsWith('placeholder')) {
    try {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${mistralKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          max_tokens: 250,
          messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-10)],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch { /* fallthrough */ }
  }

  // 4. Try OpenRouter (aggregator - free models available)
  const orKey = process.env.OPENROUTER_API_KEY;
  if (orKey && !orKey.startsWith('sk-or-v1-placeholder')) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${orKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://kvlbusinesssolutions.com',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          max_tokens: 250,
          messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-10)],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch { /* fallthrough */ }
  }

  throw new Error('All AI providers failed');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Support both input shapes:
    //   New: { message: string, history: {role, content}[] }
    //   Legacy: { messages: {role, content}[], sessionId?, leadInfo? }
    let messages: { role: "user" | "assistant"; content: string }[];
    let sessionId: string | undefined;
    let leadInfo: { name?: string; phone?: string; email?: string; interest?: string } | undefined;

    const selectedLang: string = body.lang || "en";

    if (typeof body.message === "string") {
      // New format: { message, history }
      const history: { role: "user" | "assistant"; content: string }[] = Array.isArray(body.history)
        ? body.history
        : [];
      messages = [...history, { role: "user", content: body.message }];
      sessionId = body.sessionId;
      leadInfo = body.leadInfo;
    } else {
      // Legacy format: { messages, sessionId, leadInfo }
      messages = Array.isArray(body.messages) ? body.messages : [];
      sessionId = body.sessionId;
      leadInfo = body.leadInfo;
    }

    if (messages.length === 0) {
      const fallbackText = FALLBACKS[0];
      return NextResponse.json({ reply: fallbackText });
    }

    // Save lead to DB when phone collected
    if (leadInfo?.phone) {
      try {
        await db.contactLead.create({
          data: {
            name: leadInfo.name || "Chat Visitor",
            email: leadInfo.email || null,
            phone: leadInfo.phone,
            service: leadInfo.interest || "General Inquiry",
            message: `Chat conversation lead. Session: ${sessionId || "unknown"}. Interest: ${leadInfo.interest || "General"}`,
            source: "chat_widget",
            status: "NEW",
          },
        });
      } catch {
        // DB save is optional
      }
    }

    const lastMsg = messages[messages.length - 1]?.content || "";
    const msgCount = messages.filter(m => m.role === "user").length;

    // Strategy: Free keyword match first (no API call)
    // Only call AI when: message is complex OR conversation is 3+ turns deep
    const keywordReply = smartFallback(lastMsg);
    if (keywordReply && msgCount <= 2) {
      return NextResponse.json({ reply: keywordReply, fallback: true });
    }

    const hasAnyKey =
      (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.startsWith("gsk_placeholder")) ||
      (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith("AIzaSy_placeholder")) ||
      (process.env.MISTRAL_API_KEY && !process.env.MISTRAL_API_KEY.startsWith("placeholder")) ||
      (process.env.OPENROUTER_API_KEY && !process.env.OPENROUTER_API_KEY.startsWith("sk-or-v1-placeholder"));

    if (!hasAnyKey) {
      // No API keys — use keyword match or generic fallback
      const fallbackText = keywordReply || FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
      return NextResponse.json({ reply: fallbackText, fallback: true });
    }

    // Language-specific mandatory override
    const LANG_NAMES: Record<string, string> = {
      en: "English only — no Hindi, no Hinglish, no Urdu. Every word in English.",
      hi: "Hindi / Hinglish (Roman script) — warm Hinglish style.",
      ar: "Arabic only — every word in Arabic script.",
      ru: "Russian only.",
      de: "German only.",
    };
    const langInstruction = `\n\n⚠️ MANDATORY LANGUAGE RULE (overrides all else): Respond in ${LANG_NAMES[selectedLang] || "English only."}`;
    const activePrompt = SYSTEM_PROMPT + langInstruction;

    // Multi-model AI call with automatic failover
    try {
      const text = await callAI(messages, activePrompt);
      return NextResponse.json({ reply: text });
    } catch {
      // All AI providers failed — use keyword or generic fallback
      const fallbackText = keywordReply || FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
      return NextResponse.json({ reply: fallbackText, fallback: true });
    }
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const fallbackText = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
    return NextResponse.json({ reply: fallbackText, fallback: true });
  }
}
