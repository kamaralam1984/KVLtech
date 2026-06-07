const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";

export interface ScoreResult {
  score: number;
  scoreLabel: "hot" | "warm" | "cold";
  scoreNote: string;
  breakdown: Record<string, number>;
  explanations?: string[];
}

// Rule-based fast scoring (no API cost)
export function scoreLeadFast(lead: {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  service?: string | null;
  budget?: string | null;
  message?: string | null;
  source?: string | null;
  status?: string | null;
  createdAt?: Date | string | null;
  company?: string | null;
}): ScoreResult {
  const breakdown: Record<string, number> = {};
  const explanations: string[] = [];
  let score = 0;

  // ── Contact completeness ──────────────────────────────────────
  if ((lead.phone?.replace(/\D/g, "") ?? "").length >= 10) {
    breakdown["phone"] = 30; score += 30;
    explanations.push("Valid phone number (+30)");
  }
  if (lead.email?.includes("@")) {
    breakdown["email"] = 12; score += 12;
    explanations.push("Email provided (+12)");
  }

  // ── Intent signals ────────────────────────────────────────────
  if (lead.service) { breakdown["service_specified"] = 10; score += 10; }

  if (lead.budget) {
    breakdown["budget_specified"] = 12; score += 12;
    const budgetNum = parseInt(lead.budget.replace(/[^\d]/g, "") || "0");
    if (budgetNum >= 20000) {
      breakdown["budget_high"] = 10; score += 10;
      explanations.push("High budget (₹20k+) (+10)");
    } else if (budgetNum >= 10000) {
      breakdown["budget_medium"] = 5; score += 5;
      explanations.push("Medium budget (₹10k+) (+5)");
    } else {
      explanations.push("Budget specified (+12)");
    }
  }

  // ── Message length & quality ──────────────────────────────────
  if (lead.message) {
    const msg = lead.message.toLowerCase();
    const wordCount = msg.trim().split(/\s+/).length;

    if (wordCount > 80) {
      breakdown["message_detailed"] = 8; score += 8;
      explanations.push("Detailed message (80+ words) (+8)");
    } else if (wordCount > 30) {
      breakdown["message_medium"] = 4; score += 4;
      explanations.push("Medium message (30+ words) (+4)");
    } else if (wordCount > 10) {
      breakdown["message_short"] = 2; score += 2;
      explanations.push("Short message (+2)");
    }

    // High-intent keywords
    const highIntent = ["urgent", "jaldi", "abhi chahiye", "ready", "book", "payment", "confirm", "asap", "today", "aaj", "buy", "purchase", "finalize", "finalise"];
    const medIntent  = ["interested", "quote", "price", "cost", "kitna", "kya rate", "demo", "sample", "proposal", "timeline"];
    const lowIntent  = ["bas dekh", "just looking", "explore", "info chahiye", "sochna hai", "maybe", "later", "baad mein", "not sure", "just checking"];

    const hasHigh = highIntent.some(w => msg.includes(w));
    const hasMed  = medIntent.some(w => msg.includes(w));
    const hasLow  = lowIntent.some(w => msg.includes(w));

    if (hasHigh) {
      breakdown["high_intent_words"] = 15; score += 15;
      explanations.push("Urgency/purchase intent keywords (+15)");
    } else if (hasMed) {
      breakdown["medium_intent_words"] = 7; score += 7;
      explanations.push("Interest/inquiry keywords (+7)");
    }
    if (hasLow) {
      breakdown["low_intent_words"] = -8; score -= 8;
      explanations.push("Low-intent keywords detected (-8)");
    }
  }

  // ── Source quality ────────────────────────────────────────────
  // Organic/referral score higher than cold outreach
  const sourceScores: Record<string, number> = {
    demo_request:   18,  // highest — explicitly requested demo
    pricing_page:   15,  // showed price intent
    chat_widget:    12,  // engaged in real-time chat
    organic:        11,  // SEO / direct search (high intent)
    referral:       10,  // referred by existing client
    contact_form:   6,   // standard form
    social_media:   5,   // social media (lower intent)
    cold_email:     2,   // cold outreach
    cold_call:      2,
  };
  const srcScore = sourceScores[lead.source || ""] ?? 3;
  breakdown[`source_${lead.source || "unknown"}`] = srcScore;
  score += srcScore;
  const isHighQualitySource = ["demo_request", "pricing_page", "organic", "referral"].includes(lead.source || "");
  if (isHighQualitySource) {
    explanations.push(`High-quality source (${lead.source}) (+${srcScore})`);
  }

  // ── Company size / B2B signals ────────────────────────────────
  const companyStr = (lead.company || "").toLowerCase();
  const serviceStr = (lead.service || "").toLowerCase();
  const nameStr    = (lead.name || "").toLowerCase();
  const msgStr     = (lead.message || "").toLowerCase();
  const combinedText = `${companyStr} ${serviceStr} ${nameStr} ${msgStr}`;

  const b2bKeywords = ["pvt ltd", "pvt. ltd", "private limited", " ltd", "limited", "group", "enterprises", "corporation", "solutions", "technologies", "tech", "industries"];
  const hasB2B = b2bKeywords.some(k => combinedText.includes(k));
  if (hasB2B) {
    breakdown["b2b_company"] = 10; score += 10;
    explanations.push("B2B company signal (+10)");
  }

  // ── Service type premium ──────────────────────────────────────
  // SaaS, ERP, CRM, ERP, enterprise software score higher
  const premiumServices = ["saas", "erp", "crm", "enterprise", "software", "app", "mobile app", "web app", "e-commerce", "ecommerce", "marketplace"];
  const basicServices   = ["basic website", "landing page", "brochure", "simple website", "static"];
  const hasPremiumService = premiumServices.some(s => serviceStr.includes(s) || msgStr.includes(s));
  const hasBasicService   = basicServices.some(s => serviceStr.includes(s) || msgStr.includes(s));

  if (hasPremiumService) {
    breakdown["premium_service_type"] = 8; score += 8;
    explanations.push("Premium service type (SaaS/ERP/App) (+8)");
  } else if (hasBasicService) {
    breakdown["basic_service_type"] = -3; score -= 3;
    explanations.push("Basic service type (-3)");
  }

  // ── Status bonus ──────────────────────────────────────────────
  const statusBonus: Record<string, number> = {
    NEW: 0, CONTACTED: 5, QUALIFIED: 15, PROPOSAL_SENT: 20, WON: 0, LOST: -20,
  };
  const sb = statusBonus[lead.status || "NEW"] || 0;
  if (sb !== 0) {
    breakdown[`status_${lead.status}`] = sb; score += sb;
    if (sb > 0) explanations.push(`Status: ${lead.status} (+${sb})`);
    else explanations.push(`Status: ${lead.status} (${sb})`);
  }

  // ── Time decay — leads older than 30 days score lower ─────────
  if (lead.createdAt) {
    const ageHours = (Date.now() - new Date(lead.createdAt).getTime()) / 3_600_000;
    const ageDays  = ageHours / 24;

    if (ageHours < 1) {
      breakdown["recency_fresh"] = 10; score += 10;
      explanations.push("Lead submitted <1 hour ago (+10)");
    } else if (ageHours < 24) {
      breakdown["recency_today"] = 5; score += 5;
      explanations.push("Lead submitted today (+5)");
    } else if (ageDays > 90) {
      breakdown["time_decay_90d"] = -15; score -= 15;
      explanations.push("Lead is 90+ days old (time decay -15)");
    } else if (ageDays > 60) {
      breakdown["time_decay_60d"] = -10; score -= 10;
      explanations.push("Lead is 60+ days old (time decay -10)");
    } else if (ageDays > 30) {
      breakdown["time_decay_30d"] = -5; score -= 5;
      explanations.push("Lead is 30+ days old (time decay -5)");
    } else if (ageHours > 168) {
      breakdown["recency_old_week"] = -3; score -= 3;
    }
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

  return { score, scoreLabel, scoreNote, breakdown, explanations };
}

// AI-enhanced scoring using Groq (called on-demand)
export async function scoreLeadAI(lead: {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  service?: string | null;
  budget?: string | null;
  message?: string | null;
  source?: string | null;
  company?: string | null;
}): Promise<ScoreResult> {
  const fast = scoreLeadFast(lead);

  if (!process.env.GROQ_API_KEY || !lead.message) return fast;

  try {
    const prompt = `You are a sales analyst for KVL TECH, a website development company in India selling websites for ₹12,999–₹99,999.

Analyze this lead and give a purchase intent score from 0-100:

Name: ${lead.name || "Unknown"}
Company: ${lead.company || "Not specified"}
Service interested: ${lead.service || "Not specified"}
Budget: ${lead.budget || "Not mentioned"}
Message: "${lead.message}"
Source: ${lead.source || "contact_form"}

Consider:
- How specific/detailed is their requirement?
- Do they mention timeline/urgency?
- Is budget realistic for the service?
- Are they comparing or ready to buy?
- B2B vs B2C context (company name, service type)
- Service complexity: SaaS/ERP/App score higher than basic websites
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
      const explanations = [...(fast.explanations || []), `AI analysis: ${reason}`];
      return {
        score: blended,
        scoreLabel,
        scoreNote: `AI score: ${aiScore}/100. ${reason} (Rule-based: ${fast.score})`,
        breakdown: { ...fast.breakdown, ai_score: aiScore },
        explanations,
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
