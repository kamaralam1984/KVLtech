import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const categoryId = searchParams.get("categoryId");
  const q = searchParams.get("q") || "";

  try {
    if (type === "versions") {
      const articleId = searchParams.get("articleId");
      if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });
      const versions = await db.kBArticleVersion.findMany({
        where: { articleId },
        orderBy: { version: "desc" },
      });
      return NextResponse.json({ versions });
    }

    if (type === "categories") {
      const categories = await db.kBCategory.findMany({
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { articles: true } } },
      });
      return NextResponse.json({ categories });
    }

    if (type === "articles") {
      const articles = await db.kBArticle.findMany({
        where: {
          ...(categoryId ? { categoryId } : {}),
          ...(q ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { excerpt: { contains: q, mode: "insensitive" } },
              { authorName: { contains: q, mode: "insensitive" } },
            ],
          } : {}),
        },
        include: { category: { select: { name: true, slug: true, icon: true } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ articles });
    }

    return NextResponse.json({ error: "type=categories or type=articles required" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // Category creation
    if (body.type === "category") {
      const { name, slug, description, icon, isPublic } = body;
      if (!name || !slug) return NextResponse.json({ error: "name and slug required" }, { status: 400 });
      const category = await db.kBCategory.create({
        data: { name, slug, description, icon, isPublic: isPublic ?? true },
      });
      return NextResponse.json({ category });
    }

    // Article creation
    if (body.type === "article") {
      const { categoryId, title, slug, content, excerpt, tags, isPublic, isPublished, authorName } = body;
      if (!title || !slug || !content) return NextResponse.json({ error: "title, slug, content required" }, { status: 400 });
      const article = await db.kBArticle.create({
        data: {
          categoryId: categoryId || null,
          title,
          slug,
          content,
          excerpt: excerpt || null,
          tags: tags || [],
          isPublic: isPublic ?? true,
          isPublished: isPublished ?? false,
          authorName: authorName || null,
        },
      });
      return NextResponse.json({ article });
    }

    return NextResponse.json({ error: "type=category or type=article required" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, type } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    if (type === "category") {
      const { name, slug, description, icon, isPublic, sortOrder } = body;
      const category = await db.kBCategory.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(slug !== undefined && { slug }),
          ...(description !== undefined && { description }),
          ...(icon !== undefined && { icon }),
          ...(isPublic !== undefined && { isPublic }),
          ...(sortOrder !== undefined && { sortOrder }),
        },
      });
      return NextResponse.json({ category });
    }

    if (type === "article") {
      const { categoryId, title, slug, content, excerpt, tags, isPublic, isPublished, authorName, changeNote } = body;

      // Read current article to create a version snapshot
      const current = await db.kBArticle.findUnique({ where: { id } });
      if (current) {
        const versionCount = await db.kBArticleVersion.count({ where: { articleId: id } });
        await db.kBArticleVersion.create({
          data: {
            articleId: id,
            version: versionCount + 1,
            title: current.title,
            content: current.content,
            changedBy: "Admin",
            changeNote: changeNote || "Updated",
          },
        });
      }

      const article = await db.kBArticle.update({
        where: { id },
        data: {
          ...(categoryId !== undefined && { categoryId }),
          ...(title !== undefined && { title }),
          ...(slug !== undefined && { slug }),
          ...(content !== undefined && { content }),
          ...(excerpt !== undefined && { excerpt }),
          ...(tags !== undefined && { tags }),
          ...(isPublic !== undefined && { isPublic }),
          ...(isPublished !== undefined && { isPublished }),
          ...(authorName !== undefined && { authorName }),
        },
      });
      return NextResponse.json({ article });
    }

    return NextResponse.json({ error: "type=category or type=article required" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    if (type === "category") {
      await db.kBCategory.delete({ where: { id } });
    } else {
      await db.kBArticle.delete({ where: { id } });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
