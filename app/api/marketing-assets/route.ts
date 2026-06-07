import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const client = requireAuth(req)
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || ""

    const where: any = { isPublic: true }
    if (type) where.fileType = type

    const assets = await db.marketingAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        fileType: true,
        url: true,
        thumbnail: true,
        category: true,
        fileSize: true,
        downloads: true,
        tags: true,
        createdAt: true,
      },
    })
    return NextResponse.json(assets)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
