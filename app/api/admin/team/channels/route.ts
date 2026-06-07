import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const channels = await db.teamChannel.findMany({
      where: {
        OR: [
          { isPrivate: false },
          { members: { has: admin.id } },
          { createdBy: admin.id },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ channels })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { name, description, isPrivate = false, members = [] } = body

    if (!name)
      return NextResponse.json({ error: "Channel name required" }, { status: 400 })

    // Always include creator in members
    const allMembers = Array.from(new Set([admin.id, ...members]))

    const channel = await db.teamChannel.create({
      data: {
        name: name.toLowerCase().replace(/\s+/g, "-"),
        description,
        isPrivate,
        createdBy: admin.id,
        members: allMembers,
      },
    })

    return NextResponse.json({ channel }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
