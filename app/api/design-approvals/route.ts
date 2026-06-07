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
    const approvals = await db.designApproval.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ approvals })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const client = requireAuth(req)
  if (!client || client.type !== "client")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  try {
    const { status, clientNote } = await req.json()
    if (!status || !["APPROVED", "REVISION_REQUESTED"].includes(status))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    const approval = await db.designApproval.findUnique({
      where: { id },
      include: { order: true },
    })
    if (!approval) return NextResponse.json({ error: "Approval not found" }, { status: 404 })
    if (approval.order.clientId !== client.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const updated = await db.designApproval.update({
      where: { id },
      data: { status, clientNote: clientNote || null, respondedAt: new Date() },
    })
    return NextResponse.json({ approval: updated })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
