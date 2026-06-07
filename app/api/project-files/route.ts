import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function GET(req: NextRequest) {
  const client = requireAuth(req)
  if (!client || client.type !== "client")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const orderId = req.nextUrl.searchParams.get("orderId")
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 })
  try {
    const order = await db.order.findFirst({ where: { id: orderId, clientId: client.id } })
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    const files = await db.projectFile.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ files })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const client = requireAuth(req)
  if (!client || client.type !== "client")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const orderId = formData.get("orderId") as string | null
    if (!file || !orderId) return NextResponse.json({ error: "file and orderId required" }, { status: 400 })
    const order = await db.order.findFirst({ where: { id: orderId, clientId: client.id } })
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    const clientRecord = await db.client.findUnique({ where: { id: client.id } })
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
    const uploadDir = join(process.cwd(), "public", "uploads", "files")
    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, safeName), buffer)
    const url = `/uploads/files/${safeName}`
    const projectFile = await db.projectFile.create({
      data: {
        orderId,
        uploadedBy: client.id,
        uploaderType: "client",
        uploaderName: clientRecord?.name || "Client",
        name: file.name,
        url,
        size: file.size,
        mimeType: file.type || null,
      },
    })
    return NextResponse.json({ file: projectFile }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
