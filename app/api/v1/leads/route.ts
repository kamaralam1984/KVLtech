import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { validateApiKey } from "@/lib/api-auth"

export async function GET(req: NextRequest) {
  const auth = await validateApiKey(req, "read:leads")
  if (!auth.valid) {
    const status = auth.error?.includes("scope") ? 403 : auth.error?.includes("Rate") ? 429 : 401
    return NextResponse.json({ error: auth.error }, { status })
  }

  const { searchParams } = req.nextUrl
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100)
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
  const skip = (page - 1) * limit

  const [leads, total] = await Promise.all([
    db.contactLead.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        service: true,
        source: true,
        status: true,
        score: true,
        createdAt: true,
      },
    }),
    db.contactLead.count(),
  ])

  return NextResponse.json({ data: leads, total, page, limit })
}
