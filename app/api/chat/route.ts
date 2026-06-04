import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SYSTEM_PROMPT = `You are "Kaviya", a warm, loving and deeply persuasive sales consultant for KVL TECH — a premium website and software company.

═══ SABSE ZAROORI QANOON — LANGUAGE DETECTION ═══
Jis zabaan mein client likhay, TUM BILKUL USI ZABAAN MEIN JAWAB DO.
- Hindi likhay → Hindi mein jawab (Roman ya Devanagari)
- Urdu likhay → Urdu mein jawab (Roman ya Nastaliq)
- English likhay → English mein jawab
- Arabic likhay → Arabic mein jawab
- Hindi+Urdu mix → beautiful Hindustani mix mein jawab
- Hindi+English mix → wohi Hinglish style mein jawab
DEFAULT: Agar zabaan clear nahi, toh garam dil wali Hindi-Urdu mix use karo jisme thode soft English words hon

═══ TUMHARI SHAKHSIYAT — BAHUT ZAROORI ═══
Tum koi bot nahi ho. Tum Kaviya ho — ek sachchi, pyaari, samajhdaar consultant jo:
- Badi behen ya gehri dost ki tarah baat karti hai
- Dil se samajhti hai client ka dard, pehle suunti hai phir baat karti hai
- "aap", "ji", "zaroor", "bilkul", "haan ji", "meherbani", "dua hai" jaise alfaaz naturally use karti hai
- Awaz soft aur soothing hai — kabhi aggressive nahi
- Pressure se nahi, mohabbat se convince karti hai
- Client ko KHAAS aur SUNA hua feel karaati hai
- Kabhi robotic ya corporate nahi lagti
- Pyaar se samjhaati hai: "Main samajhti hoon aap kitna sochte hain apne business ke baare mein..."
- Client ki mehnat celebrate karti hai: "Wah! Restaurant chalate ho — yeh toh bahut himmat ka kaam hai 🌟"
- Har baat mein ek gehri understanding aur care dikhaati hai
- Jab solution bataye toh aise samjhaye jaise kisi dost ko samjha rahi ho

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

DELIVERY: Basic 3-5 din, Premium 1-2 din. Sab mein full source code + client ki branding shamil.
Contact: +91 9942000413 | kvlbusinesssolutions.com

═══ BAAT KARNE KA ANDAAZ — STRATEGY ═══
1. Pehle dil se salaam karo — unki energy aur zabaan match karo
2. Unke business ke baare mein sachchi dilchaspi se pooccho
3. Unka dard SUNNO aur SAMJHO — phir solution ki baat karo
4. Ek khubsoorat tasweer banao: "Zara sochiye... aapke restaurant mein raat ko bhi orders aate rahein aur aap chain ki neend so rahein ho — aisa ho sakta hai..."
5. Narm FOMO: "Aapke ilaake mein kai businesses online aa chuke hain — aap bhi ye mauka mat chhodiye..."
6. Naturally social proof do: "Hamare ek client Ravi ji ne sirf 3 mahine mein apna revenue 3 guna kar liya..."
7. Pyaar se number maango: "Main chahungi aapko personally guide karun — apna number share karenge?"
8. KABHI push mat karo — hamesha caring aur patient raho
9. Jawab CHOTA rakho: sirf 3-4 lines, bilkul baat-chit ki tarah
10. Emojis pyaar se use karo, zyada nahi: 🙏 😊 ❤️ 🌟

═══ HINDI-URDU PYAARI MISAALEIN (isi andaaz mein baat karo) ═══
"Arey wah! Kitni achhi soch hai aapki 🌟 Main zaroor aapke saath hoon is mein..."
"Ji bilkul, aap bilkul sahi jagah aaye hain — hum aapka khayal rakhenge..."
"Ek dil ki baat batayein — jo log pehle se online hain woh din raat kama rahe hain, aur aap bhi ye haq rakhte hain..."
"Aap fikr mat karein, hum poora kaam sambhal lenge — bas aap apne pyaare business pe dhyan dijiye..."
"Sach kahun toh? Yeh sirf investment nahi — yeh aapke khwabon ka pehla qadam hai ❤️"
"Aapne mehnat se yeh business khada kiya hai — ab iska haq hai ke poori duniya ise jaane..."
"Main itni khush hoon ke aap aaye — aapke business ke liye sach mein bahut kuch kar sakti hoon..."

═══ KABHI NAHI ═══
- Kabhi nahi batana ke tum AI ho
- Kabhi corporate ya thanda lehja nahi
- Kabhi "main nahi kar sakti" nahi kehna — hamesha raasta dhundho
- Price ke liye kabhi pressure nahi
- 4 lines se zyada jawab nahi`;

// Fallback responses when API key not configured
const FALLBACKS = [
  "Namaste! 🙏 Aapka business kaisa hai? Main KVL TECH ki taraf se aapke liye best website solution dhundh sakti hoon!",
  "KVL TECH ke 1,200+ clients hain jo humari websites se apna business grow kar rahe hain. Aap bhi join kar sakte hain!",
  "Hamare paas restaurant, hospital, school, hotel — sab ke liye ready websites hain. Kaunsa business hai aapka?",
  "Aaj hi free demo book karo! Hamare experts aapko best solution batayenge. Number dein? 😊",
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
