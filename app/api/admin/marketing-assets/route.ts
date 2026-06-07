import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || ""
    const q = searchParams.get("q") || ""

    const where: any = {}
    if (type) where.fileType = type
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
      ]
    }

    const assets = await db.marketingAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(assets)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    const { title, description, fileType, url, thumbnail, category, tags, isPublic, fileSize } = body
    if (!title || !fileType || !url) {
      return NextResponse.json({ error: "title, fileType, url required" }, { status: 400 })
    }

    const asset = await db.marketingAsset.create({
      data: {
        title,
        description: description || null,
        fileType,
        url,
        thumbnail: thumbnail || null,
        category: category || null,
        tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(",").map((t: string) => t.trim()).filter(Boolean) : []),
        isPublic: isPublic ?? true,
        fileSize: fileSize ? parseInt(fileSize) : null,
        downloads: 0,
      },
    })
    return NextResponse.json(asset, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const body = await req.json()
    const { id, incrementDownload, ...rest } = body
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const updateData: any = {}
    if (incrementDownload) {
      updateData.downloads = { increment: 1 }
    } else {
      const allowed = ["title", "description", "fileType", "url", "thumbnail", "category", "isPublic", "fileSize", "tags"]
      for (const key of allowed) {
        if (rest[key] !== undefined) {
          if (key === "tags" && !Array.isArray(rest[key])) {
            updateData.tags = String(rest[key]).split(",").map((t: string) => t.trim()).filter(Boolean)
          } else {
            updateData[key] = rest[key]
          }
        }
      }
    }

    const asset = await db.marketingAsset.update({ where: { id }, data: updateData })
    return NextResponse.json(asset)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    await db.marketingAsset.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
