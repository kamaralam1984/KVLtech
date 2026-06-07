import { db } from "@/lib/db"

// Call this when a new client registers using a referral code or coupon
export async function trackReferral(params: {
  refereeId: string
  refereeEmail: string
  orderAmount: number
  couponCode?: string
  referralCode?: string
}) {
  try {
    // Find referrer by referralCode or couponCode
    let referrerId: string | null = null
    let couponId: string | null = null

    if (params.couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: params.couponCode } })
      if (coupon?.referrerId) {
        referrerId = coupon.referrerId
        couponId = coupon.id
      }
    }

    if (!referrerId && params.referralCode) {
      // referralCode is last 8 chars of client id (used in referral links as ?ref=XXXXXXXX)
      const referrer = await db.client.findFirst({
        where: { id: { endsWith: params.referralCode } },
      })
      if (referrer) referrerId = referrer.id
    }

    if (!referrerId) return

    // Level 1 referral — direct referrer gets 20%
    const level1Commission = Math.floor(params.orderAmount * 0.20)
    const level1 = await db.referral.create({
      data: {
        referrerId,
        refereeEmail: params.refereeEmail,
        refereeId: params.refereeId,
        orderAmount: params.orderAmount,
        commissionRate: 20,
        commission: level1Commission,
        level: 1,
        couponId,
        couponCode: params.couponCode,
      },
    })

    // Level 2 — find who referred the level-1 referrer (10% commission)
    const level1Referrer = await db.referral.findFirst({
      where: { refereeId: referrerId, status: "CONVERTED" },
    })
    if (level1Referrer) {
      const level2Commission = Math.floor(params.orderAmount * 0.10)
      await db.referral.create({
        data: {
          referrerId: level1Referrer.referrerId,
          refereeEmail: params.refereeEmail,
          refereeId: params.refereeId,
          orderAmount: params.orderAmount,
          commissionRate: 10,
          commission: level2Commission,
          level: 2,
          parentReferralId: level1.id,
          couponId,
          couponCode: params.couponCode,
        },
      })
    }
    return level1
  } catch (err) {
    console.error("[Referral]", err)
  }
}
