import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { cachedResponse } from "@/lib/api-cache";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const featured = url.searchParams.get("featured");

  const where: any = { isPublished: true };
  if (featured === "true") where.isFeatured = true;

  const projects = await db.portfolioProject.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  // Portfolio projects are public and relatively stable — cache 10 minutes
  return cachedResponse({ projects }, 600);
}
