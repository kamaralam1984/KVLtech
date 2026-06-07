import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const orderId = req.nextUrl.searchParams.get("orderId")
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 })
  try {
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
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const orderId = formData.get("orderId") as string | null
    if (!file || !orderId) return NextResponse.json({ error: "file and orderId required" }, { status: 400 })
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
        uploadedBy: "admin",
        uploaderType: "admin",
        uploaderName: "KVL TECH Team",
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

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  try {
    const record = await db.projectFile.findUnique({ where: { id } })
    if (!record) return NextResponse.json({ error: "File not found" }, { status: 404 })
    if (record.url.startsWith("/uploads/")) {
      const filePath = join(process.cwd(), "public", record.url)
      await unlink(filePath).catch(() => {})
    }
    await db.projectFile.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
