import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { code, orderAmount } = await req.json()
    if (!code || typeof orderAmount !== "number") {
      return NextResponse.json({ error: "code and orderAmount required" }, { status: 400 })
    }

    const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase().trim() } })

    if (!coupon) return NextResponse.json({ valid: false, reason: "Invalid coupon code" })
    if (!coupon.isActive) return NextResponse.json({ valid: false, reason: "Coupon is inactive" })
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return NextResponse.json({ valid: false, reason: "Coupon has expired" })
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return NextResponse.json({ valid: false, reason: "Coupon usage limit reached" })
    if (coupon.minOrderValue && orderAmount < coupon.minOrderValue) {
      return NextResponse.json({ valid: false, reason: `Minimum order value ₹${coupon.minOrderValue} required` })
    }

    let discount = 0
    if (coupon.discountType === "percent") {
      discount = Math.round((orderAmount * coupon.discountValue) / 100)
    } else {
      discount = Math.min(coupon.discountValue, orderAmount)
    }
    const finalAmount = Math.max(0, orderAmount - discount)

    await db.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } })

    return NextResponse.json({
      valid: true,
      couponId: coupon.id,
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      finalAmount,
    })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
