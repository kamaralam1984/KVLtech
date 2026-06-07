import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json(coupons)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { code, description, discountType, discountValue, maxUses, expiresAt, minOrderValue, referrerId } = await req.json()
    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: "code, discountType, discountValue required" }, { status: 400 })
    }
    const existing = await db.coupon.findUnique({ where: { code: code.toUpperCase().trim() } })
    if (existing) return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 })

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        description: description || null,
        discountType,
        discountValue: parseInt(discountValue),
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        minOrderValue: minOrderValue ? parseInt(minOrderValue) : null,
        ...(referrerId ? { referrerId } : {}),
      },
    })
    return NextResponse.json(coupon, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { id, isActive } = await req.json()
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const updated = await db.coupon.update({ where: { id }, data: { isActive } })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    await db.coupon.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
