import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { checkRateLimit } from "./rate-limit"

export async function validateApiKey(
  req: NextRequest,
  requiredScope?: string
): Promise<{
  valid: boolean
  error?: string
  apiKey?: { id: string; adminId: string; scopes: string[] }
}> {
  const authHeader = req.headers.get("authorization") || ""
  const key =
    authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.headers.get("x-api-key") || ""

  if (!key)
    return {
      valid: false,
      error: "API key required. Use Authorization: Bearer <key> or X-Api-Key header.",
    }

  const apiKey = await db.apiKey.findUnique({ where: { key } })
  if (!apiKey) return { valid: false, error: "Invalid API key" }
  if (!apiKey.isActive) return { valid: false, error: "API key is disabled" }
  if (apiKey.expiresAt && apiKey.expiresAt < new Date())
    return { valid: false, error: "API key expired" }
  if (
    requiredScope &&
    !apiKey.scopes.includes(requiredScope) &&
    !apiKey.scopes.includes("admin")
  )
    return { valid: false, error: `Insufficient scope. Required: ${requiredScope}` }

  // Rate limiting: 100 req/min per key (Redis-backed, in-memory fallback)
  const { allowed } = await checkRateLimit(`api:${apiKey.id}`, 100, 60)
  if (!allowed)
    return { valid: false, error: "Rate limit exceeded. 100 requests/minute." }

  // Update usage (fire-and-forget)
  db.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date(), requestCount: { increment: 1 } },
    })
    .catch(() => {})
  db.apiKeyLog
    .create({
      data: {
        apiKeyId: apiKey.id,
        endpoint: req.nextUrl.pathname,
        method: req.method,
        status: 200,
        ip: req.headers.get("x-forwarded-for") || "",
      },
    })
    .catch(() => {})

  return {
    valid: true,
    apiKey: { id: apiKey.id, adminId: apiKey.adminId, scopes: apiKey.scopes },
  }
}
