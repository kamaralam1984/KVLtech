import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const client = requireAuth(req)
  if (!client || client.type !== "client")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const orderId = req.nextUrl.searchParams.get("orderId")
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 })
  try {
    const order = await db.order.findFirst({ where: { id: orderId, clientId: client.id } })
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    const messages = await db.message.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json({ messages })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const client = requireAuth(req)
  if (!client || client.type !== "client")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { orderId, text, fileUrl, fileName } = await req.json()
    if (!orderId || !text) return NextResponse.json({ error: "orderId and text required" }, { status: 400 })
    const order = await db.order.findFirst({ where: { id: orderId, clientId: client.id } })
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    const clientRecord = await db.client.findUnique({ where: { id: client.id } })
    const message = await db.message.create({
      data: {
        orderId,
        senderId: client.id,
        senderType: "client",
        senderName: clientRecord?.name || "Client",
        text,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
      },
    })
    return NextResponse.json({ message }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
