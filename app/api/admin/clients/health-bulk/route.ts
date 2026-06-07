import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

// Simplified health score based on last order date — avoids N+1 queries
// for bulk computation over potentially many clients.
function computeSimpleHealthScore(client: {
  id: string
  name: string
  email: string
  orders: { createdAt: Date }[]
  createdAt: Date
}): { clientId: string; name: string; email: string; score: number; label: string } {
  let score = 50

  if (client.orders.length === 0) {
    score -= 20
  } else {
    const lastOrder = client.orders[0].createdAt
    const daysSince = (Date.now() - lastOrder.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince < 30) score += 20
    else if (daysSince < 90) score += 10
    else score -= 15

    const orderBonus = Math.min(client.orders.length * 5, 20)
    score += orderBonus
  }

  score = Math.min(100, Math.max(0, score))
  const label =
    score >= 75 ? "Healthy" : score >= 50 ? "Moderate" : score >= 25 ? "At Risk" : "Critical"

  return { clientId: client.id, name: client.name, email: client.email, score, label }
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const url = new URL(req.url)
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 100)

    const clients = await db.client.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        orders: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { createdAt: true },
        },
      },
    })

    const scored = clients
      .map(computeSimpleHealthScore)
      .sort((a, b) => a.score - b.score) // worst first
      .slice(0, limit)

    return NextResponse.json(scored)
  } catch (err) {
    console.error("Bulk health score error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
