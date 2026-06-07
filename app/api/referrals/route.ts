import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com"

export async function GET(req: NextRequest) {
  const client = requireAuth(req)
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const referrals = await db.referral.findMany({
      where: { referrerId: client.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        refereeEmail: true,
        refereeId: true,
        orderAmount: true,
        commission: true,
        commissionRate: true,
        level: true,
        parentReferralId: true,
        couponCode: true,
        status: true,
        createdAt: true,
        paidAt: true,
      },
    })

    const level1 = referrals.filter(r => r.level === 1)
    const level2 = referrals.filter(r => r.level === 2)

    const totalEarned = referrals
      .filter(r => r.status === "PAID")
      .reduce((sum, r) => sum + r.commission, 0)

    const pendingEarnings = referrals
      .filter(r => r.status === "CONVERTED")
      .reduce((sum, r) => sum + r.commission, 0)

    const stats = {
      totalEarned,
      pendingEarnings,
      level1Count: level1.length,
      level2Count: level2.length,
      totalReferrals: referrals.length,
    }

    const referralLink = `${SITE_URL}?ref=${client.id.slice(-8)}`

    return NextResponse.json({ referrals, stats, referralLink })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const client = requireAuth(req)
  if (!client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { refereeEmail } = await req.json()
    if (!refereeEmail) return NextResponse.json({ error: "refereeEmail required" }, { status: 400 })
    if (refereeEmail.toLowerCase() === client.email?.toLowerCase()) {
      return NextResponse.json({ error: "Cannot refer yourself" }, { status: 400 })
    }
    const existing = await db.referral.findFirst({
      where: { referrerId: client.id, refereeEmail: refereeEmail.toLowerCase() },
    })
    if (existing) return NextResponse.json({ error: "Already referred this email" }, { status: 409 })

    const referral = await db.referral.create({
      data: {
        referrerId: client.id,
        refereeEmail: refereeEmail.toLowerCase(),
        level: 1,
        commissionRate: 20,
      },
    })
    return NextResponse.json(referral, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
