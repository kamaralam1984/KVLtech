import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface CallAnalysis {
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  sentimentScore: number; // 0-100
  leadScore: number; // 0-100
  interestLevel: "HIGH" | "MEDIUM" | "LOW";
  objections: string[];
  closingProbability: number; // 0-100%
  keyTopics: string[];
  actionItems: string[];
  nextSteps: string[];
  budgetMentioned: boolean;
  timelineMentioned: boolean;
  competitorsMentioned: string[];
  summary: string;
}

const DEFAULT_CALL_ANALYSIS: CallAnalysis = {
  sentiment: "NEUTRAL",
  sentimentScore: 50,
  leadScore: 50,
  interestLevel: "MEDIUM",
  objections: [],
  closingProbability: 30,
  keyTopics: [],
  actionItems: [],
  nextSteps: [],
  budgetMentioned: false,
  timelineMentioned: false,
  competitorsMentioned: [],
  summary: "Analysis unavailable",
};

export async function analyzeCallTranscript(
  transcript: string,
  context?: {
    clientName?: string;
    service?: string;
    previousInteractions?: number;
  }
): Promise<CallAnalysis> {
  if (!transcript || transcript.trim().length === 0) {
    return { ...DEFAULT_CALL_ANALYSIS, summary: "No transcript provided" };
  }

  const prompt = `You are an expert sales call analyzer for KVL TECH, a software development company.

Analyze this sales call transcript and provide a detailed analysis.
${context?.clientName ? `Client: ${context.clientName}` : ""}
${context?.service ? `Service discussed: ${context.service}` : ""}
${context?.previousInteractions != null ? `Previous interactions: ${context.previousInteractions}` : ""}

Transcript:
${transcript.slice(0, 5000)}

Return ONLY a JSON object (no markdown):
{
  "sentiment": "POSITIVE|NEUTRAL|NEGATIVE",
  "sentimentScore": 0-100,
  "leadScore": 0-100,
  "interestLevel": "HIGH|MEDIUM|LOW",
  "objections": ["objection1", "objection2"],
  "closingProbability": 0-100,
  "keyTopics": ["topic1", "topic2"],
  "actionItems": ["action1"],
  "nextSteps": ["step1"],
  "budgetMentioned": true|false,
  "timelineMentioned": true|false,
  "competitorsMentioned": [],
  "summary": "2-3 sentence summary"
}`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
      temperature: 0.2,
    });

    const text = response.choices[0]?.message?.content || "{}";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { ...DEFAULT_CALL_ANALYSIS };

    const parsed = JSON.parse(match[0]);

    const normalizeEnum = <T extends string>(
      val: unknown,
      allowed: T[],
      fallback: T
    ): T => (allowed.includes(val as T) ? (val as T) : fallback);

    return {
      sentiment: normalizeEnum(
        parsed.sentiment,
        ["POSITIVE", "NEUTRAL", "NEGATIVE"] as const,
        "NEUTRAL"
      ),
      sentimentScore: Math.min(
        100,
        Math.max(0, Number(parsed.sentimentScore) || 50)
      ),
      leadScore: Math.min(100, Math.max(0, Number(parsed.leadScore) || 50)),
      interestLevel: normalizeEnum(
        parsed.interestLevel,
        ["HIGH", "MEDIUM", "LOW"] as const,
        "MEDIUM"
      ),
      objections: Array.isArray(parsed.objections) ? parsed.objections : [],
      closingProbability: Math.min(
        100,
        Math.max(0, Number(parsed.closingProbability) || 30)
      ),
      keyTopics: Array.isArray(parsed.keyTopics) ? parsed.keyTopics : [],
      actionItems: Array.isArray(parsed.actionItems)
        ? parsed.actionItems
        : [],
      nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
      budgetMentioned: Boolean(parsed.budgetMentioned),
      timelineMentioned: Boolean(parsed.timelineMentioned),
      competitorsMentioned: Array.isArray(parsed.competitorsMentioned)
        ? parsed.competitorsMentioned
        : [],
      summary:
        typeof parsed.summary === "string" && parsed.summary.trim()
          ? parsed.summary
          : DEFAULT_CALL_ANALYSIS.summary,
    };
  } catch (err) {
    console.error("analyzeCallTranscript error:", err);
    return { ...DEFAULT_CALL_ANALYSIS };
  }
}

export async function generateFollowUpEmail(
  analysis: CallAnalysis,
  clientName: string,
  agentName: string
): Promise<string> {
  const prompt = `Write a professional follow-up email after a sales call.

Client: ${clientName}
Agent: ${agentName}
Call Summary: ${analysis.summary}
Interest Level: ${analysis.interestLevel}
Action Items: ${analysis.actionItems.join(", ") || "None noted"}
Next Steps: ${analysis.nextSteps.join(", ") || "TBD"}

Write a warm, professional email (150-200 words). Include specific next steps. Sign as ${agentName} from KVL TECH.`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
    });

    return response.choices[0]?.message?.content || "";
  } catch (err) {
    console.error("generateFollowUpEmail error:", err);
    return "";
  }
}
