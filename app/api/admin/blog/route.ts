import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";

async function generateWithGroq(prompt: string): Promise<string> {
  const res = await fetch(GROQ_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const posts = await db.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, slug: true, category: true, isPublished: true, isFeatured: true, createdAt: true },
    });
    return NextResponse.json({ posts });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { topic, category, keywords, action, id } = await req.json();

    if (action === "publish" && id) {
      const post = await db.blogPost.update({
        where: { id },
        data: { isPublished: true, publishedAt: new Date() },
      });
      return NextResponse.json({ success: true, post });
    }
    if (action === "unpublish" && id) {
      const post = await db.blogPost.update({ where: { id }, data: { isPublished: false } });
      return NextResponse.json({ success: true, post });
    }
    if (action === "delete" && id) {
      await db.blogPost.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (!topic) return NextResponse.json({ error: "Topic required" }, { status: 400 });

    const keywordStr = keywords ? `Keywords to include: ${keywords}` : "";

    const prompt = `Generate a comprehensive, SEO-optimized blog post for KVL TECH, a software development company in India.

Title/Topic: ${topic}
Category: ${category || "Business Tips"}
Target audience: SME business owners looking for software solutions
Word count: 600-800 words
${keywordStr}

Use EXACTLY this format with these delimiters (no extra text before or after):

TITLE: [Write SEO title here, max 70 chars]
EXCERPT: [Write 2-sentence summary hook here, max 160 chars]
METATITLE: [Write SEO meta title, max 60 chars]
METADESC: [Write meta description, max 160 chars]
FOCUSKEYWORD: [Write the single most important SEO keyword]
SLUG: [Write URL-friendly slug, lowercase, hyphens only, max 60 chars]
CONTENT:
## [Title]
[Intro paragraph - 2-3 sentences hook for SME business owners]

## [Section 1 heading]
[Content - 100-150 words]

## [Section 2 heading]
[Content - 100-150 words]

## [Section 3 heading]
[Content - 100-150 words]

## Conclusion
[Summary paragraph + CTA mentioning KVL TECH — visit kvlbusinesssolutions.com for a free consultation]

**Meta Description:** [150 char description]
**Focus Keyword:** [main keyword]
**Tags:** [tag1, tag2, tag3]
END_CONTENT`;

    const raw = await generateWithGroq(prompt);

    // Parse structured delimiter format
    const extract = (key: string, nextKey?: string) => {
      const startTag = `${key}:`;
      const si = raw.indexOf(startTag);
      if (si === -1) return "";
      const from = si + startTag.length;
      const ei = nextKey ? raw.indexOf(`\n${nextKey}:`, from) : raw.indexOf("END_CONTENT", from);
      return (ei !== -1 ? raw.slice(from, ei) : raw.slice(from)).trim();
    };

    const generated = {
      title: extract("TITLE", "EXCERPT"),
      excerpt: extract("EXCERPT", "METATITLE"),
      metaTitle: extract("METATITLE", "METADESC"),
      metaDesc: extract("METADESC", "FOCUSKEYWORD"),
      focusKeyword: extract("FOCUSKEYWORD", "SLUG"),
      suggestedSlug: extract("SLUG", "CONTENT"),
      content: extract("CONTENT"),
    };

    if (!generated.title || !generated.content) throw new Error("AI response missing required fields");

    const wordCount = generated.content?.split(" ").length || 800;
    const readMins = Math.ceil(wordCount / 200);

    // Prefer AI-suggested slug, fall back to title-derived slug
    const baseSlug =
      generated.suggestedSlug && generated.suggestedSlug.length > 3
        ? generated.suggestedSlug
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 60)
        : generated.title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .replace(/\s+/g, "-")
            .slice(0, 60);
    const slug = `${baseSlug}-${Date.now()}`;

    const post = await db.blogPost.create({
      data: {
        title: generated.title,
        slug,
        excerpt: generated.excerpt,
        content: generated.content,
        category: category || "Business Tips",
        photo: "/photos/person-laptop.jpg",
        author: "KVL TECH Team",
        authorRole: "Content Team",
        readTime: `${readMins} min read`,
        metaTitle: generated.metaTitle || generated.title,
        metaDesc: generated.metaDesc || generated.excerpt,
        isPublished: false,
      },
    });

    return NextResponse.json({
      success: true,
      post,
      seo: {
        focusKeyword: generated.focusKeyword,
        suggestedSlug: slug,
        metaDescription: generated.metaDesc,
      },
    });
  } catch (err) {
    console.error("Blog generate error:", err);
    return NextResponse.json({ error: "Blog generation failed. Check GROQ_API_KEY." }, { status: 500 });
  }
}
