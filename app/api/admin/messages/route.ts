import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { wsEvents } from "@/lib/ws-broadcast"

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const orderId = req.nextUrl.searchParams.get("orderId")
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 })
  try {
    const messages = await db.message.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
    })
    const unread = messages.filter(m => !m.isRead && m.senderType === "client").length
    return NextResponse.json({ messages, unread })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { orderId, text, fileUrl, fileName } = await req.json()
    if (!orderId || !text) return NextResponse.json({ error: "orderId and text required" }, { status: 400 })
    const order = await db.order.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    const message = await db.message.create({
      data: {
        orderId,
        senderId: "admin",
        senderType: "admin",
        senderName: "KVL TECH Team",
        text,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
      },
    })
    await db.notification.create({
      data: {
        clientId: order.clientId,
        title: "New message from KVL TECH Team",
        body: text.slice(0, 120),
        color: "#C9A227",
      },
    })
    wsEvents.chatMessage(orderId, { content: text, sender: "KVL TECH Team", isAdmin: true })
    return NextResponse.json({ message }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const orderId = req.nextUrl.searchParams.get("orderId")
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 })
  try {
    await db.message.updateMany({
      where: { orderId, senderType: "client", isRead: false },
      data: { isRead: true },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
