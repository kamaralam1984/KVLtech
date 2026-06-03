import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SYSTEM_PROMPT = `Tu KVL TECH ki expert sales consultant "Kavya" hai. Tera ek hi kaam hai — visitor ko customer banana.

KVL TECH ke products:
- Restaurant Website: Basic ₹12,999 | Premium ₹24,999 | Custom Quote
- School Management System: Basic ₹18,999 | Premium ₹34,999 | Custom Quote
- Hospital Management System: Basic ₹22,999 | Premium ₹44,999 | Custom Quote
- E-commerce Platform: Basic ₹15,999 | Premium ₹29,999 | Custom Quote
- Hotel Booking Website: Basic ₹14,999 | Premium ₹27,999 | Custom Quote
- Real Estate Website: Basic ₹13,999 | Premium ₹25,999 | Custom Quote

ALL plans include: Full source code ownership + complete company branding.
Basic: 3-5 day delivery, 30 days support.
Premium: 1-2 day delivery, 90 days support, payment gateway, admin panel.
Custom: 7-15 days, 1 year support, fully tailored.

Contact: +91 98765 43210 | info@kvlbusinesssolutions.com | Noida, UP

**Sales Strategy:**
1. Pehle visitor ka naam aur business type pooch
2. Uski problem samjho — "aapka abhi online presence kaisa hai?"
3. FOMO create karo — "Aapke competitors already digital ho gaye hain"
4. Social proof do — "1,200+ businesses ne KVL TECH choose kiya"
5. Urgency banao — "Is month sirf 3 slots available hain"
6. Benefit pe focus karo, price pe nahi
7. Agar interested lage to phone number maango
8. Kabhi negative mat bolo — hamesha solution do
9. Short mein baat karo (max 3-4 lines)
10. Hinglish mein baat karo (mix of Hindi + English)

**Lead Collection:**
- Agar conversation 3+ turns ho jaye, naam pooch
- Agar interested lage, phone number maango
- Email bhi collect karo

**Closing lines (use naturally):**
- "Aaj hi demo book karo — bilkul free hai!"
- "Main abhi aapke liye best plan suggest kar sakti hoon"
- "WhatsApp pe baat karte hain? +91 98765 43210"

Tu smart, friendly, aur persuasive hai. Visitor ko lagna chahiye ki tu unki genuinely help kar rahi hai. Never reveal you are an AI.`;

// Fallback responses when API key not configured
const FALLBACKS = [
  "Namaste! 🙏 Aapka business kaisa hai? Main KVL TECH ki taraf se aapke liye best website solution dhundh sakti hoon!",
  "KVL TECH ke 1,200+ clients hain jo humari websites se apna business grow kar rahe hain. Aap bhi join kar sakte hain!",
  "Hamare paas restaurant, hospital, school, hotel — sab ke liye ready websites hain. Kaunsa business hai aapka?",
  "Aaj hi free demo book karo! Hamare experts aapko best solution batayenge. Number dein? 😊",
];

// Keyword-based instant reply — NO API call (zero cost)
// Covers ~80% of real visitor messages
function smartFallback(message: string): string | null {
  const lower = message.toLowerCase();
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("namaste") || lower.includes("hlo"))
    return "Namaste! 🙏 Main Kavya hoon, KVL TECH ki consultant. Aapka business kya hai?";
  if (lower.includes("price") || lower.includes("cost") || lower.includes("kitna") || lower.includes("rate") || lower.includes("fees") || lower.includes("charge"))
    return "Hamare Basic plans ₹12,999 se shuru hote hain! Premium mein payment gateway + admin panel bhi milta hai. Kaunsa business hai aapka? 😊";
  if (lower.includes("contact") || lower.includes("call") || lower.includes("number") || lower.includes("phone") || lower.includes("callback"))
    return "Bilkul! +91 98765 43210 pe call karein ya apna number dijiye — hamari team callback karegi. 😊";
  if (lower.includes("restaurant") || lower.includes("dhaba") || lower.includes("cafe") || lower.includes("food"))
    return "Restaurant website ₹12,999 mein! Online menu, table booking, delivery integration — 3-5 din mein ready. Demo dekhein? 🍽️";
  if (lower.includes("school") || lower.includes("college") || lower.includes("institute") || lower.includes("coaching"))
    return "School Management System ₹18,999 se — fees, attendance, students, exams — ek dashboard pe. Free demo book karein!";
  if (lower.includes("hospital") || lower.includes("clinic") || lower.includes("doctor") || lower.includes("medical"))
    return "Hospital Management System ₹22,999 se — appointments, billing, patient records. Aapka clinic modern ho jayega! Demo chahiye? 🏥";
  if (lower.includes("hotel") || lower.includes("resort") || lower.includes("guest house") || lower.includes("lodge"))
    return "Hotel Booking Website ₹14,999 mein! Online reservations, payment, availability — 3-5 din mein ready! 🏨";
  if (lower.includes("real estate") || lower.includes("property") || lower.includes("plot") || lower.includes("builder"))
    return "Real Estate Website ₹13,999 mein — property listings, search, lead forms. 200+ realtors use kar rahe hain! 🏠";
  if (lower.includes("shop") || lower.includes("ecommerce") || lower.includes("sell") || lower.includes("store") || lower.includes("online store"))
    return "E-commerce Platform ₹15,999 mein — full store, payments, inventory. Aaj hi shuru karein! 🛒";
  if (lower.includes("demo") || lower.includes("dikhao") || lower.includes("show") || lower.includes("example"))
    return "Zaroor! kvlbusinesssolutions.com/products pe live demos available hain. Kaunsa business type aapka hai? 👀";
  if (lower.includes("time") || lower.includes("kitne din") || lower.includes("delivery") || lower.includes("ready"))
    return "Basic plan: 3-5 din mein ready. Premium plan: 1-2 din mein ready! Sach mein itna fast hai. 🚀";
  if (lower.includes("support") || lower.includes("help") || lower.includes("problem") || lower.includes("issue"))
    return "Basic plan mein 30 din support, Premium mein 90 din. Hum hamesha available hain! +91 98765 43210 📞";
  if (lower.includes("guarantee") || lower.includes("refund") || lower.includes("return") || lower.includes("trust"))
    return "100% money-back guarantee hai! Agar kaam na aaye to full refund. 1,200+ clients hamare saath hain — trust karo! 💯";
  // Not a simple keyword match — let AI handle it
  return null;
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
    const { messages, sessionId, leadInfo } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
      sessionId?: string;
      leadInfo?: { name?: string; phone?: string; email?: string; interest?: string };
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ content: FALLBACKS[0] });
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
      return NextResponse.json({ content: keywordReply, fallback: true });
    }

    const hasAnyKey =
      (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.startsWith("gsk_placeholder")) ||
      (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith("AIzaSy_placeholder")) ||
      (process.env.MISTRAL_API_KEY && !process.env.MISTRAL_API_KEY.startsWith("placeholder")) ||
      (process.env.OPENROUTER_API_KEY && !process.env.OPENROUTER_API_KEY.startsWith("sk-or-v1-placeholder"));

    if (!hasAnyKey) {
      // No API keys — use keyword match or generic fallback
      return NextResponse.json({
        content: keywordReply || FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)],
        fallback: true,
      });
    }

    // Multi-model AI call with automatic failover
    try {
      const content = await callAI(messages, SYSTEM_PROMPT);
      return NextResponse.json({ content });
    } catch {
      // All AI providers failed — use keyword or generic fallback
      return NextResponse.json({
        content: keywordReply || FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)],
        fallback: true,
      });
    }
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      content: FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)],
      fallback: true,
    });
  }
}
