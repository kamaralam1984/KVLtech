import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const orderId = req.nextUrl.searchParams.get("orderId")
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 })
  try {
    const approvals = await db.designApproval.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ approvals })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { orderId, title, description, fileUrl, previewUrl } = await req.json()
    if (!orderId || !title) return NextResponse.json({ error: "orderId and title required" }, { status: 400 })
    const order = await db.order.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    const approval = await db.designApproval.create({
      data: {
        orderId,
        title,
        description: description || null,
        fileUrl: fileUrl || null,
        previewUrl: previewUrl || null,
      },
    })
    await db.notification.create({
      data: {
        clientId: order.clientId,
        title: "New design ready for your approval",
        body: `Please review and approve: "${title}"`,
        color: "#0891B2",
        type: "INFO",
      },
    })
    return NextResponse.json({ approval }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { id, title, description, fileUrl, previewUrl } = await req.json()
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const updated = await db.designApproval.update({
      where: { id },
      data: {
        title: title || undefined,
        description: description || undefined,
        fileUrl: fileUrl || undefined,
        previewUrl: previewUrl || undefined,
      },
    })
    return NextResponse.json({ approval: updated })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
