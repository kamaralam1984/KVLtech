import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { validateApiKey } from "@/lib/api-auth"

export async function GET(req: NextRequest) {
  const auth = await validateApiKey(req, "read:orders")
  if (!auth.valid) {
    const status = auth.error?.includes("scope") ? 403 : auth.error?.includes("Rate") ? 429 : 401
    return NextResponse.json({ error: auth.error }, { status })
  }

  const { searchParams } = req.nextUrl
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100)
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
  const status = searchParams.get("status") || undefined
  const skip = (page - 1) * limit

  const where = status ? { status: status as never } : {}

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        amount: true,
        plan: true,
        createdAt: true,
        client: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
    }),
    db.order.count({ where }),
  ])

  return NextResponse.json({ data: orders, total, page, limit })
}
