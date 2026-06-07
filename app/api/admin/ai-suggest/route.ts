import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Groq from "groq-sdk";

function getGroq() {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

async function callGroq(prompt: string, maxTokens = 800): Promise<string> {
  const groq = getGroq();
  if (!groq) throw new Error("AI features require GROQ_API_KEY in .env");
  const completion = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content || "";
}

function parseJsonArray(text: string): string[] {
  const match = text.match(/\[[\s\S]*?\]/);
  if (!match) return [];
  try {
    const arr = JSON.parse(match[0]);
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "AI features require GROQ_API_KEY in .env" },
      { status: 503 }
    );
  }

  try {
    const { type, context } = await req.json();

    if (type === "blog-topics") {
      const prompt =
        `Generate 5 blog post title ideas for KVL TECH, a software development company in India. ` +
        `Topics should help attract SME clients looking for website development, mobile apps, ERP, and digital marketing. ` +
        `Return as JSON array of strings.`;
      const raw = await callGroq(prompt);
      const suggestions = parseJsonArray(raw);
      return NextResponse.json({ suggestions });
    }

    if (type === "email-subject") {
      const prompt =
        `Generate 5 email subject lines for a software development company to re-engage inactive clients. ` +
        `Context: ${context || "general re-engagement"}. ` +
        `Make them professional, curiosity-inducing, and avoid spam triggers. Return as JSON array of strings.`;
      const raw = await callGroq(prompt);
      const suggestions = parseJsonArray(raw);
      return NextResponse.json({ suggestions });
    }

    if (type === "automation-rule") {
      const existingRules = await db.automationRule
        .findMany({ orderBy: { createdAt: "desc" }, take: 5 })
        .catch(() => []);
      const existingRulesStr =
        existingRules.length > 0
          ? existingRules
              .map((r: any) => `${r.name}: trigger=${r.trigger}, action=${r.action}`)
              .join("; ")
          : "none yet";
      const prompt =
        `KVL TECH has these automation rules: ${existingRulesStr}. ` +
        `Suggest 3 new automation rules for their CRM. ` +
        `Each rule: trigger (NEW_LEAD/ORDER_PLACED/TICKET_OPENED/etc.), action (SEND_EMAIL/SEND_WHATSAPP/UPDATE_STATUS/etc.), and name. ` +
        `Return JSON array: [{name, trigger, action, description}]`;
      const raw = await callGroq(prompt);
      const match = raw.match(/\[[\s\S]*?\]/);
      let suggestions: any[] = [];
      if (match) {
        try {
          suggestions = JSON.parse(match[0]);
        } catch {
          suggestions = [];
        }
      }
      return NextResponse.json({ suggestions });
    }

    if (type === "social-post") {
      const prompt =
        `Write a professional LinkedIn/Instagram post for KVL TECH (software development company). ` +
        `Context: ${context || "showcase our services"}. ` +
        `Make it engaging, professional, and include relevant hashtags. Max 200 words.`;
      const post = await callGroq(prompt);
      return NextResponse.json({ post });
    }

    if (type === "seo-keywords") {
      const prompt =
        `Generate 10 SEO keywords for a software development company in India targeting SMEs. ` +
        `Context: ${context || "general software development services"}. ` +
        `Include long-tail keywords. Return as JSON array.`;
      const raw = await callGroq(prompt);
      const suggestions = parseJsonArray(raw);
      return NextResponse.json({ suggestions });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    console.error("ai-suggest error:", err);
    const msg =
      err?.message?.includes("GROQ_API_KEY")
        ? err.message
        : "AI suggestion failed. Check GROQ_API_KEY.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
