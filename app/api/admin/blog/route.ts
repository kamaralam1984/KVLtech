import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

const CATEGORY_IMAGES: Record<string, string> = {
  "Website Tips":      "/photos/restaurant.jpg",
  "Business Growth":   "/photos/office-meeting.jpg",
  "Software":          "/photos/person-laptop.jpg",
  "Marketing":         "/photos/fashion.jpg",
  "SEO":               "/photos/person-laptop.jpg",
  "AI & Automation":   "/photos/person-laptop.jpg",
  "Healthcare":        "/photos/hospital.jpg",
  "Education":         "/photos/school.jpg",
  "Restaurant":        "/photos/restaurant.jpg",
  "Real Estate":       "/photos/office-meeting.jpg",
  "HR & Payroll":      "/photos/office-meeting.jpg",
  "E-commerce":        "/photos/fashion.jpg",
  "Business Tips":     "/photos/office-meeting.jpg",
};

function getCategoryImage(category: string): string {
  return CATEGORY_IMAGES[category] ?? "/photos/person-laptop.jpg";
}

function sanitize(val: string): string {
  return val.replace(/\*+/g, "").replace(/^#+\s*/, "").trim();
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
      revalidatePath("/blog");
      revalidatePath(`/blog/${post.slug}`);
      return NextResponse.json({ success: true, post });
    }
    if (action === "unpublish" && id) {
      const post = await db.blogPost.update({ where: { id }, data: { isPublished: false } });
      revalidatePath("/blog");
      revalidatePath(`/blog/${post.slug}`);
      return NextResponse.json({ success: true, post });
    }
    if (action === "delete" && id) {
      await db.blogPost.delete({ where: { id } });
      revalidatePath("/blog");
      return NextResponse.json({ success: true });
    }

    if (!topic) return NextResponse.json({ error: "Topic required" }, { status: 400 });

    const keywordStr = keywords ? `Keywords to include: ${keywords}` : "";

    const prompt = `You are a senior content writer for KVL TECH, a premium software development company in India serving SME businesses. Write a high-quality, SEO-optimized blog post.

Topic: ${topic}
Category: ${category || "Business Tips"}
Target audience: Indian SME business owners, entrepreneurs, and decision-makers
Target word count: 900-1100 words (MINIMUM 800 words — this is critical)
${keywordStr}

RULES:
- Write in a professional yet conversational tone
- Include at least 2 real-world examples or scenarios relevant to Indian businesses
- Include specific numbers, stats, or data points to build credibility
- Each section must be 150-200 words with unique, non-repetitive content
- Naturally mention KVL TECH products where relevant (Hospital Management System, CRM Software, School Management System, Restaurant Website, E-commerce Platform, HR & Payroll Software, Inventory Management, Billing Software)
- End with a strong CTA to visit kvlbusinesssolutions.com
- DO NOT use "Section 1:", "Section 2:" etc. — use descriptive, keyword-rich headings

Use EXACTLY this format (no markdown bold, no asterisks around field values):

TITLE: [SEO-optimized title, 50-70 chars, no asterisks]
EXCERPT: [2-sentence hook that makes the reader want to read more, max 160 chars]
METATITLE: [SEO meta title, 50-60 chars]
METADESC: [Meta description with primary keyword, 140-160 chars]
FOCUSKEYWORD: [Single most important keyword phrase, spelled correctly]
SLUG: [url-slug-with-hyphens-only, max 60 chars]
CONTENT:
## [Engaging intro heading with primary keyword]
[Hook paragraph — start with a pain point or surprising stat. 80-100 words.]

[Second intro paragraph — expand on the problem and what this article will solve. 80-100 words.]

## [Descriptive Section Heading 1 — include keyword]
[150-200 words with specific examples, data points, or scenarios]

## [Descriptive Section Heading 2 — related keyword]
[150-200 words with different content from section 1]

## [Descriptive Section Heading 3 — related keyword or benefit]
[150-200 words with actionable advice or comparison]

## [Descriptive Section Heading 4 — implementation or results]
[150-200 words covering how to get started or real results]

## Conclusion: Take the Next Step for Your Business
[Strong 100-120 word conclusion summarizing key points + clear CTA to visit kvlbusinesssolutions.com for a free consultation]
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
      title:        sanitize(extract("TITLE", "EXCERPT")),
      excerpt:      sanitize(extract("EXCERPT", "METATITLE")),
      metaTitle:    sanitize(extract("METATITLE", "METADESC")),
      metaDesc:     sanitize(extract("METADESC", "FOCUSKEYWORD")),
      focusKeyword: sanitize(extract("FOCUSKEYWORD", "SLUG")),
      suggestedSlug: sanitize(extract("SLUG", "CONTENT")),
      content:      extract("CONTENT"),
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
        photo: getCategoryImage(category || "Business Tips"),
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
