import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const featured = url.searchParams.get("featured");
  const skip = (page - 1) * limit;

  const where: any = {};
  if (featured === "true") where.isFeatured = true;

  const [projects, total] = await Promise.all([
    db.portfolioProject.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    db.portfolioProject.count({ where }),
  ]);

  return NextResponse.json({ projects, total, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    slug, title, clientName, industry, description, challenge, solution, results,
    techStack, coverImage, gallery, liveUrl, duration, teamSize, testimonial,
    authorName, metrics, tags, isFeatured, isPublished, sortOrder,
  } = body;

  if (!slug || !title || !clientName || !industry || !description || !coverImage) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  }

  const project = await db.portfolioProject.create({
    data: {
      slug,
      title,
      clientName,
      industry,
      description,
      challenge: challenge || null,
      solution: solution || null,
      results: results || null,
      techStack: Array.isArray(techStack) ? techStack : [],
      coverImage,
      gallery: Array.isArray(gallery) ? gallery : [],
      liveUrl: liveUrl || null,
      duration: duration || null,
      teamSize: teamSize || null,
      testimonial: testimonial || null,
      authorName: authorName || null,
      metrics: metrics ? JSON.stringify(metrics) : null,
      tags: Array.isArray(tags) ? tags : [],
      isFeatured: Boolean(isFeatured),
      isPublished: isPublished !== false,
      sortOrder: sortOrder || 0,
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (data.metrics && typeof data.metrics !== "string") {
    data.metrics = JSON.stringify(data.metrics);
  }

  const project = await db.portfolioProject.update({ where: { id }, data });
  return NextResponse.json({ project });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.portfolioProject.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
