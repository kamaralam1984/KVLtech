import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const aiSearch = searchParams.get("aiSearch") === "true";

  if (!q) {
    return NextResponse.json({ articles: [], total: 0 });
  }

  try {
    // Step 1: Exact/like DB search
    const dbResults = await db.kBArticle.findMany({
      where: {
        isPublic: true,
        isPublished: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
          { tags: { has: q } },
        ],
      },
      include: { category: { select: { name: true, slug: true, icon: true } } },
      orderBy: { viewCount: "desc" },
      take: 10,
    });

    // If we have DB results and AI not forced, return them directly
    if (dbResults.length > 0 && !aiSearch) {
      // Increment viewCount for returned articles
      await db.kBArticle.updateMany({
        where: { id: { in: dbResults.map((a) => a.id) } },
        data: { viewCount: { increment: 1 } },
      });
      return NextResponse.json({ articles: dbResults, total: dbResults.length, isAI: false });
    }

    // Step 2: Use Groq for AI search
    const allArticles = await db.kBArticle.findMany({
      where: { isPublic: true, isPublished: true },
      select: { id: true, slug: true, title: true, excerpt: true },
    });

    const articlesList = allArticles
      .map((a) => `- slug:"${a.slug}" | title:"${a.title}" | excerpt:"${a.excerpt || ""}"`)
      .join("\n");

    let relevantSlugs: string[] = [];
    let directAnswer: string | null = null;

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: `User is searching for: '${q}'. Here are available KB articles:\n${articlesList}\n\nWhich articles are most relevant? Also provide a direct answer if possible. Return JSON only (no markdown): {"relevantArticleSlugs": string[], "directAnswer": string | null}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 512,
      });

      const raw = completion.choices[0]?.message?.content?.trim() || "{}";
      // Strip markdown code fences if present
      const jsonStr = raw.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(jsonStr);
      relevantSlugs = Array.isArray(parsed.relevantArticleSlugs) ? parsed.relevantArticleSlugs : [];
      directAnswer = typeof parsed.directAnswer === "string" ? parsed.directAnswer : null;
    } catch (err) {
      console.error("[KB AI SEARCH] Groq error:", err);
      // Fall back to DB results if any
      if (dbResults.length > 0) {
        return NextResponse.json({ articles: dbResults, total: dbResults.length, isAI: false });
      }
      return NextResponse.json({ articles: [], total: 0, isAI: false });
    }

    // Fetch matched articles
    const matchedArticles = relevantSlugs.length > 0
      ? await db.kBArticle.findMany({
          where: {
            slug: { in: relevantSlugs },
            isPublic: true,
            isPublished: true,
          },
          include: { category: { select: { name: true, slug: true, icon: true } } },
        })
      : [];

    // Reorder to match AI relevance order
    const ordered = relevantSlugs
      .map((slug) => matchedArticles.find((a) => a.slug === slug))
      .filter(Boolean) as typeof matchedArticles;

    // Increment viewCount for returned articles
    if (ordered.length > 0) {
      await db.kBArticle.updateMany({
        where: { id: { in: ordered.map((a) => a.id) } },
        data: { viewCount: { increment: 1 } },
      });
    }

    return NextResponse.json({
      articles: ordered,
      total: ordered.length,
      directAnswer,
      isAI: true,
    });
  } catch (err) {
    console.error("[KB SEARCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
