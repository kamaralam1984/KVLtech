import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const article = await db.kBArticle.findUnique({
      where: { slug },
      include: { category: { select: { name: true, slug: true, icon: true } } },
    });
    if (!article || !article.isPublic || !article.isPublished) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    // Increment view count
    await db.kBArticle.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } });
    return NextResponse.json({ article });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const { helpful } = await req.json();
    const article = await db.kBArticle.findUnique({ where: { slug } });
    if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (helpful === true) {
      await db.kBArticle.update({ where: { id: article.id }, data: { helpfulCount: { increment: 1 } } });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
