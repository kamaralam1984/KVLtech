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

    const prompt = `You are an expert content writer for KVL TECH, a website development company in India.
Write a blog post in Hinglish (mix of Hindi and English) for Indian small business owners.
Topic: ${topic}
Category: ${category || "Business Tips"}
${keywordStr}

Use EXACTLY this format with these delimiters (no extra text before or after):

TITLE: [Write SEO title here, max 70 chars]
EXCERPT: [Write 2-sentence summary here, max 160 chars]
METATITLE: [Write SEO meta title, max 60 chars]
METADESC: [Write meta description, max 160 chars]
CONTENT:
[Write full 600-800 word Hinglish article here with ## headings, bullet points, and end with CTA to visit kvlbusinesssolutions.com]
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
      metaDesc: extract("METADESC", "CONTENT"),
      content: extract("CONTENT"),
    };

    if (!generated.title || !generated.content) throw new Error("AI response missing required fields");

    const wordCount = generated.content?.split(" ").length || 800;
    const readMins = Math.ceil(wordCount / 200);

    const slug = generated.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) + "-" + Date.now();

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

    return NextResponse.json({ success: true, post });
  } catch (err) {
    console.error("Blog generate error:", err);
    return NextResponse.json({ error: "Blog generation failed. Check GROQ_API_KEY." }, { status: 500 });
  }
}
