import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug")?.trim();

  if (!slug) {
    return NextResponse.json({ questions: [] });
  }

  try {
    const article = await db.kBArticle.findUnique({
      where: { slug },
      select: { title: true, content: true, isPublic: true, isPublished: true },
    });

    if (!article || !article.isPublic || !article.isPublished) {
      return NextResponse.json({ questions: [] });
    }

    // Truncate content for Groq to avoid token limits
    const contentSnippet = article.content.slice(0, 1500);

    let questions: string[] = [];

    try {
      const completion = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "user",
            content: `Based on this article: '${article.title}'\n\nContent preview: ${contentSnippet}\n\nGenerate 4 related questions a user might search for after reading this. Make them concise and specific. Return JSON only (no markdown): {"questions": string[]}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 256,
      });

      const raw = completion.choices[0]?.message?.content?.trim() || "{}";
      const jsonStr = raw.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.questions)) {
        questions = parsed.questions.slice(0, 5).map((q: unknown) => String(q));
      }
    } catch (err) {
      console.error("[KB RELATED] Groq error:", err);
      // Return empty gracefully
    }

    return NextResponse.json({ questions });
  } catch (err) {
    console.error("[KB RELATED]", err);
    return NextResponse.json({ questions: [] });
  }
}
