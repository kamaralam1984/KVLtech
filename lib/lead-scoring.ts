const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";

export interface ScoreResult {
  score: number;
  scoreLabel: "hot" | "warm" | "cold";
  scoreNote: string;
  breakdown: Record<string, number>;
}

// Rule-based fast scoring (no API cost)
export function scoreLeadFast(lead: {
  name: string;
  phone?: string | null;
  email?: string | null;
  service?: string | null;
  budget?: string | null;
  message?: string | null;
  source?: string | null;
  status?: string | null;
  createdAt?: Date | string | null;
}): ScoreResult {
  const breakdown: Record<string, number> = {};
  let score = 0;

  // ── Contact completeness ──────────────────────────────────────
  if ((lead.phone?.replace(/\D/g, "") ?? "").length >= 10) { breakdown["phone"] = 30; score += 30; }
  if (lead.email?.includes("@")) { breakdown["email"] = 12; score += 12; }

  // ── Intent signals ────────────────────────────────────────────
  if (lead.service) { breakdown["service_specified"] = 10; score += 10; }

  if (lead.budget) {
    breakdown["budget_specified"] = 12; score += 12;
    const budgetNum = parseInt(lead.budget.replace(/[^\d]/g, "") || "0");
    if (budgetNum >= 20000) { breakdown["budget_high"] = 10; score += 10; }
    else if (budgetNum >= 10000) { breakdown["budget_medium"] = 5; score += 5; }
  }

  // ── Message analysis (keyword-based) ─────────────────────────
  if (lead.message) {
    const msg = lead.message.toLowerCase();
    const len = msg.trim().split(/\s+/).length;
    if (len > 80) { breakdown["message_detailed"] = 8; score += 8; }
    else if (len > 30) { breakdown["message_medium"] = 4; score += 4; }

    const highIntent = ["urgent", "jaldi", "abhi chahiye", "ready", "book", "payment", "confirm", "asap", "today", "aaj", "buy", "purchase"];
    const medIntent  = ["interested", "quote", "price", "cost", "kitna", "kya rate", "demo", "sample"];
    const lowIntent  = ["bas dekh", "just looking", "explore", "info chahiye", "sochna hai", "maybe", "later", "baad mein"];

    const hasHigh = highIntent.some(w => msg.includes(w));
    const hasMed  = medIntent.some(w => msg.includes(w));
    const hasLow  = lowIntent.some(w => msg.includes(w));

    if (hasHigh) { breakdown["high_intent_words"] = 15; score += 15; }
    else if (hasMed) { breakdown["medium_intent_words"] = 7; score += 7; }
    if (hasLow) { breakdown["low_intent_words"] = -8; score -= 8; }
  }

  // ── Source quality ────────────────────────────────────────────
  const sourceScores: Record<string, number> = {
    chat_widget:    12,  // engaged enough to chat
    contact_form:   6,
    demo_request:   18,
    pricing_page:   15,
    referral:       10,
  };
  const srcScore = sourceScores[lead.source || ""] || 3;
  breakdown[`source_${lead.source || "unknown"}`] = srcScore;
  score += srcScore;

  // ── Status bonus ──────────────────────────────────────────────
  const statusBonus: Record<string, number> = {
    NEW: 0, CONTACTED: 5, QUALIFIED: 15, PROPOSAL_SENT: 20, WON: 0, LOST: -20,
  };
  const sb = statusBonus[lead.status || "NEW"] || 0;
  if (sb !== 0) { breakdown[`status_${lead.status}`] = sb; score += sb; }

  // ── Recency bonus ─────────────────────────────────────────────
  if (lead.createdAt) {
    const ageHours = (Date.now() - new Date(lead.createdAt).getTime()) / 3_600_000;
    if (ageHours < 1)       { breakdown["recency_fresh"] = 10; score += 10; }
    else if (ageHours < 24) { breakdown["recency_today"] = 5;  score += 5;  }
    else if (ageHours > 168){ breakdown["recency_old"] = -5;   score -= 5;  }
  }

  // ── Clamp 0–100 ───────────────────────────────────────────────
  score = Math.max(0, Math.min(100, score));

  const scoreLabel = score >= 70 ? "hot" : score >= 40 ? "warm" : "cold";

  const topFactors = Object.entries(breakdown)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 3)
    .map(([k, v]) => `${k.replace(/_/g, " ")} (${v > 0 ? "+" : ""}${v})`)
    .join(", ");

  const scoreNote = `Rule-based score: ${score}/100. Top factors: ${topFactors}.`;

  return { score, scoreLabel, scoreNote, breakdown };
}

// AI-enhanced scoring using Groq (called on-demand)
export async function scoreLeadAI(lead: {
  name: string;
  phone?: string | null;
  email?: string | null;
  service?: string | null;
  budget?: string | null;
  message?: string | null;
  source?: string | null;
}): Promise<ScoreResult> {
  const fast = scoreLeadFast(lead);

  if (!process.env.GROQ_API_KEY || !lead.message) return fast;

  try {
    const prompt = `You are a sales analyst for KVL TECH, a website development company in India selling websites for ₹12,999–₹99,999.

Analyze this lead and give a purchase intent score from 0-100:

Name: ${lead.name}
Service interested: ${lead.service || "Not specified"}
Budget: ${lead.budget || "Not mentioned"}
Message: "${lead.message}"
Source: ${lead.source || "contact_form"}

Consider:
- How specific/detailed is their requirement?
- Do they mention timeline/urgency?
- Is budget realistic for the service?
- Are they comparing or ready to buy?
- Indian business context (Hinglish signals like "abhi chahiye" = urgent)

Reply ONLY with this format (no extra text):
SCORE: [0-100]
REASON: [One sentence in English explaining the score]`;

    const res = await fetch(GROQ_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 80,
        temperature: 0.3,
      }),
    });

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "";

    const scoreMatch = raw.match(/SCORE:\s*(\d+)/i);
    const reasonMatch = raw.match(/REASON:\s*(.+)/i);

    if (scoreMatch) {
      const aiScore = Math.max(0, Math.min(100, parseInt(scoreMatch[1])));
      // Blend: 60% rule-based + 40% AI for stability
      const blended = Math.round(fast.score * 0.6 + aiScore * 0.4);
      const scoreLabel = blended >= 70 ? "hot" : blended >= 40 ? "warm" : "cold";
      const reason = reasonMatch?.[1]?.trim() || "";
      return {
        score: blended,
        scoreLabel,
        scoreNote: `AI score: ${aiScore}/100. ${reason} (Rule-based: ${fast.score})`,
        breakdown: { ...fast.breakdown, ai_score: aiScore },
      };
    }
  } catch (err) {
    console.error("AI scoring failed, using rule-based:", err);
  }

  return fast;
}

export function getScoreBadge(scoreLabel: string): { emoji: string; label: string; color: string; bg: string } {
  const badges: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
    hot:  { emoji: "🔥", label: "Hot",  color: "#EF4444", bg: "#EF444418" },
    warm: { emoji: "🌡️", label: "Warm", color: "#F59E0B", bg: "#F59E0B18" },
    cold: { emoji: "❄️", label: "Cold", color: "#0891B2", bg: "#0891B218" },
  };
  return badges[scoreLabel] || badges.cold;
}
