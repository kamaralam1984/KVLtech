import { redisGet, redisSet, redisDel } from "./redis"
import crypto from "crypto"

export async function createSession(
  data: Record<string, unknown>,
  ttlSeconds = 86400 * 7
): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString("hex")
  await redisSet(`session:${sessionId}`, JSON.stringify(data), ttlSeconds)
  return sessionId
}

export async function getSession(
  sessionId: string
): Promise<Record<string, unknown> | null> {
  const data = await redisGet(`session:${sessionId}`)
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export async function destroySession(sessionId: string): Promise<void> {
  await redisDel(`session:${sessionId}`)
}

export async function refreshSession(
  sessionId: string,
  ttlSeconds = 86400 * 7
): Promise<void> {
  const data = await redisGet(`session:${sessionId}`)
  if (data) await redisSet(`session:${sessionId}`, data, ttlSeconds)
}
