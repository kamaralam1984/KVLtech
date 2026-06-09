import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { cacheDel } from "@/lib/cache";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  // Lightweight list for dropdowns — skip heavy joins
  if (searchParams.get("dropdown") === "1") {
    const products = await db.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, category: true, basicPrice: true, premiumPrice: true, slug: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ products });
  }

  try {
    const products = await db.product.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { category: { equals: search.toUpperCase() as any } },
        ],
      } : {},
      include: {
        plans: { orderBy: { sortOrder: "asc" } },
        faqs: { orderBy: { sortOrder: "asc" } },
        _count: { select: { orders: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Get revenue per product
    const revenueData = await db.order.groupBy({
      by: ["productId"],
      _sum: { amount: true },
      _count: { id: true },
    });
    const revenueMap = Object.fromEntries(revenueData.map(r => [r.productId, { revenue: r._sum.amount || 0, orders: r._count.id }]));

    const enriched = products.map(p => ({
      ...p,
      orderCount: revenueMap[p.id]?.orders || 0,
      revenue: revenueMap[p.id]?.revenue || 0,
    }));

    // Summary stats
    const totalOrders = await db.order.count();
    const categoryBreakdown = await db.product.groupBy({ by: ["category"], _count: { id: true } });

    return NextResponse.json({ products: enriched, totalOrders, categoryBreakdown });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, slug, tagline, description, category, basicPrice, premiumPrice, tag, photo, demoUrl, techStack, highlights, deliverables } = body;

    if (!name || !slug || !category || !basicPrice || !premiumPrice)
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });

    const exists = await db.product.findUnique({ where: { slug } });
    if (exists) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

    const product = await db.product.create({
      data: {
        name, slug, tagline: tagline || "", description: description || "",
        category, basicPrice: Number(basicPrice), premiumPrice: Number(premiumPrice),
        photo: photo || "/photos/office-meeting.jpg", gallery: photo ? [photo] : [],
        tag: tag || null, demoUrl: demoUrl || null,
        techStack: techStack || [], highlights: highlights || [], deliverables: deliverables || [],
        plans: {
          create: [
            { name: "BASIC", price: `₹${Number(basicPrice).toLocaleString("en-IN")}`, delivery: "3-5 days", support: "30 days", features: [], sortOrder: 0 },
            { name: "PREMIUM", price: `₹${Number(premiumPrice).toLocaleString("en-IN")}`, delivery: "1-2 days", support: "90 days", features: [], sortOrder: 1 },
            { name: "CUSTOM", price: "Quote", delivery: "7-15 days", support: "1 year", features: [], sortOrder: 2 },
          ],
        },
      },
    });

    await cacheDel("public:products");
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const product = await db.product.update({
      where: { id },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.tagline !== undefined && { tagline: updates.tagline }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.basicPrice && { basicPrice: Number(updates.basicPrice) }),
        ...(updates.premiumPrice && { premiumPrice: Number(updates.premiumPrice) }),
        ...(updates.tag !== undefined && { tag: updates.tag || null }),
        ...(updates.photo && { photo: updates.photo }),
        ...(updates.isActive !== undefined && { isActive: updates.isActive }),
        ...(updates.isFeatured !== undefined && { isFeatured: updates.isFeatured }),
        ...(updates.demoUrl !== undefined && { demoUrl: updates.demoUrl || null }),
        ...(updates.techStack && { techStack: updates.techStack }),
        ...(updates.highlights && { highlights: updates.highlights }),
      },
    });

    await cacheDel("public:products");
    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // Soft delete
    await db.product.update({ where: { id }, data: { isActive: false } });
    await cacheDel("public:products");
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
