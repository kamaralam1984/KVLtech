import { redisGet, redisSet, redisDel } from "./redis"

// ---------------------------------------------------------------------------
// In-memory fallback (used when Redis is unavailable or not configured)
// ---------------------------------------------------------------------------
const memCache = new Map<string, { value: unknown; expires: number }>()

function memGet(key: string): unknown {
  const item = memCache.get(key)
  if (!item) return null
  if (Date.now() > item.expires) {
    memCache.delete(key)
    return null
  }
  return item.value
}

function memSet(key: string, value: unknown, ttlSeconds = 60) {
  memCache.set(key, { value, expires: Date.now() + ttlSeconds * 1000 })
}

function memDel(key: string) {
  memCache.delete(key)
}

// ---------------------------------------------------------------------------
// Public API — same signature as before (fully backward compatible)
// ---------------------------------------------------------------------------

export async function cacheGet(key: string): Promise<unknown> {
  // Try Redis first
  try {
    const redisVal = await redisGet(`kvl:${key}`)
    if (redisVal !== null) return JSON.parse(redisVal)
  } catch {}
  // Fallback to in-memory
  return memGet(key)
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 60) {
  // Set in Redis (best-effort) and always set in memory as local fallback
  try {
    await redisSet(`kvl:${key}`, JSON.stringify(value), ttlSeconds)
  } catch {}
  memSet(key, value, ttlSeconds)
}

export async function cacheDel(key: string) {
  try {
    await redisDel(`kvl:${key}`)
  } catch {}
  memDel(key)
}

export async function cacheGetOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 60
): Promise<T> {
  const cached = await cacheGet(key)
  if (cached !== null) return cached as T
  const value = await fetcher()
  await cacheSet(key, value, ttlSeconds)
  return value
}
