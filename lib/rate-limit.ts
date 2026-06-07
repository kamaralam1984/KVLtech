import { redisIncr } from "./redis"

export async function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const key = `ratelimit:${identifier}`

  try {
    const count = await redisIncr(key, windowSeconds)
    const remaining = Math.max(0, limit - count)
    return {
      allowed: count <= limit,
      remaining,
      resetIn: windowSeconds,
    }
  } catch {
    // If Redis unavailable, fail open — allow the request
    return { allowed: true, remaining: limit, resetIn: windowSeconds }
  }
}

export function getRateLimitKey(
  req: Request,
  type: "ip" | "user" | "api-key" = "ip"
): string {
  const forwarded = (req as any).headers?.get?.("x-forwarded-for") || ""
  const ip = forwarded.split(",")[0]?.trim() || "unknown"
  return `${type}:${ip}`
}
