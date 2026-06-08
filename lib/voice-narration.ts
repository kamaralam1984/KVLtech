import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Generate a natural voice narration script from proposal content
export async function generateNarrationScript(
  proposalContent: string,
  options: {
    duration?: "short" | "medium" | "long" // short=2min, medium=5min, long=10min
    tone?: "formal" | "friendly" | "enthusiastic"
    clientName?: string
  }
): Promise<{
  script: string
  sections: Array<{ title: string; text: string; estimatedSeconds: number }>
  totalDurationMinutes: number
}> {
  const wordCount = {
    short: 250, // ~2 min at 130 words/min
    medium: 650, // ~5 min
    long: 1300, // ~10 min
  }[options.duration || "medium"]

  const prompt = `Convert this business proposal into a professional voice presentation script.

${options.clientName ? `Client: ${options.clientName}` : ""}
Tone: ${options.tone || "professional"}
Target word count: ${wordCount} words

Proposal content:
${proposalContent.slice(0, 3000)}

Create a natural speaking script divided into sections. Return JSON:
{
  "script": "Full narration script as it would be spoken...",
  "sections": [
    {"title": "Introduction", "text": "Good day...", "estimatedSeconds": 30},
    {"title": "The Challenge", "text": "...", "estimatedSeconds": 60},
    {"title": "Our Solution", "text": "...", "estimatedSeconds": 90},
    {"title": "Investment & Timeline", "text": "...", "estimatedSeconds": 45},
    {"title": "Next Steps", "text": "...", "estimatedSeconds": 30}
  ],
  "totalDurationMinutes": 4
}

Make it conversational, professional. Avoid jargon. Include natural pauses (...).`

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.6,
    })

    const text = response.choices[0]?.message?.content || "{}"
    const match = text.match(/\{[\s\S]*\}/)
    return JSON.parse(match ? match[0] : "{}")
  } catch {
    return { script: proposalContent, sections: [], totalDurationMinutes: 5 }
  }
}
