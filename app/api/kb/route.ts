import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cachedResponse } from "@/lib/api-cache";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();

  try {
    if (q) {
      // Delegate to search logic
      const searchUrl = new URL("/api/kb/search", req.url);
      searchUrl.searchParams.set("q", q);
      const res = await fetch(searchUrl.toString());
      const data = await res.json();
      // Search results are not cached — query-specific
      return NextResponse.json(data);
    }

    if (category) {
      const articles = await db.kBArticle.findMany({
        where: {
          isPublic: true,
          isPublished: true,
          category: { slug: category },
        },
        include: { category: { select: { name: true, slug: true, icon: true } } },
        orderBy: { viewCount: "desc" },
      });
      return cachedResponse({ articles, total: articles.length }, 300);
    }

    // Default: featured / recent articles (cached 5 minutes)
    const articles = await db.kBArticle.findMany({
      where: { isPublic: true, isPublished: true },
      include: { category: { select: { name: true, slug: true, icon: true } } },
      orderBy: { viewCount: "desc" },
      take: 12,
    });
    return cachedResponse({ articles, total: articles.length }, 300);
  } catch (err) {
    console.error("[KB PUBLIC API]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
