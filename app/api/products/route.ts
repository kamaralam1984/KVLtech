import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/cache";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const featured = searchParams.get("featured") === "true";

  const cacheKey = featured ? "public:products:featured" : "public:products:all";
  const cached = cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const products = await db.product.findMany({
      where: {
        isActive: true,
        ...(featured ? { isFeatured: true } : {}),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        tag: true,
        tagline: true,
        category: true,
        basicPrice: true,
        premiumPrice: true,
        photo: true,
        demoUrl: true,
        highlights: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    const result = { products };
    cacheSet(cacheKey, result, 300); // 5 min cache
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
