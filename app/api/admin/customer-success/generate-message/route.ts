import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  generateOutreachMessage,
  generateSubject,
  type OutreachType,
} from "@/lib/customer-success"

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: { clientId?: string; type?: string; tone?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { clientId, type, tone } = body

  if (!clientId || !type) {
    return NextResponse.json({ error: "clientId and type are required" }, { status: 400 })
  }

  const validTypes: OutreachType[] = [
    "health_check_email",
    "renewal_reminder",
    "upsell_opportunity",
    "win_back",
    "check_in_call",
    "satisfaction_survey",
  ]

  if (!validTypes.includes(type as OutreachType)) {
    return NextResponse.json({ error: "Invalid outreach type" }, { status: 400 })
  }

  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { createdAt: true, plan: true, status: true },
        },
        subscriptions: {
          where: { status: "ACTIVE" },
          take: 1,
          select: { planName: true },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const clientData = {
      id: client.id,
      name: client.name,
      email: client.email,
      company: client.company,
      lastOrderAt: client.orders[0]?.createdAt ?? null,
      orderCount: client.orders.length,
      planName: client.subscriptions[0]?.planName,
    }

    const outreachType = type as OutreachType
    const resolvedTone = tone === "formal" ? "formal" : "friendly"

    const message = await generateOutreachMessage(clientData, outreachType, resolvedTone)
    const subject = generateSubject(client.name, outreachType)

    return NextResponse.json({ message, subject })
  } catch (err) {
    console.error("[generate-message]", err)
    return NextResponse.json({ error: "Failed to generate message" }, { status: 500 })
  }
}
