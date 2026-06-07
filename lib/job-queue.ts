/**
 * Job Queue Library
 * Uses Redis (via raw RESP helpers in lib/redis.ts) when available,
 * falls back to in-memory arrays when Redis is unavailable.
 *
 * Redis list operations are implemented by encoding lists as JSON arrays
 * in a single key, since lib/redis.ts exposes only GET/SET/DEL/EXISTS/INCR.
 */

import { redisGet, redisSet, redisDel, redisPing } from "./redis"

export type JobType =
  | "send_email"
  | "send_whatsapp"
  | "send_telegram"
  | "webhook_retry"
  | "automation_trigger"
  | "lead_score"
  | "report_generate"
  | "alert_check"

export interface Job {
  id: string
  type: JobType
  payload: Record<string, unknown>
  priority: "low" | "normal" | "high"
  attempts: number
  maxAttempts: number
  createdAt: string
  scheduledFor?: string // ISO string for delayed jobs
  error?: string
}

// Redis key names (store JSON arrays)
const QUEUE_KEYS = {
  high: "kvl:jobs:high",
  normal: "kvl:jobs:normal",
  low: "kvl:jobs:low",
  dead: "kvl:jobs:dead",
  processing: "kvl:jobs:processing",
} as const

// In-memory fallback when Redis is unavailable
const memQueue: { high: Job[]; normal: Job[]; low: Job[]; dead: Job[] } = {
  high: [],
  normal: [],
  low: [],
  dead: [],
}

let _redisAvailable: boolean | null = null

async function isRedisAvailable(): Promise<boolean> {
  if (_redisAvailable !== null) return _redisAvailable
  try {
    _redisAvailable = await redisPing()
  } catch {
    _redisAvailable = false
  }
  return _redisAvailable
}

// Reset cached availability (called on error so we re-check next time)
function resetRedisAvailability() {
  _redisAvailable = null
}

// ---------------------------------------------------------------------------
// Redis list helpers (encode list as JSON array in a single key)
// ---------------------------------------------------------------------------

async function redisPushLeft(key: string, item: Job): Promise<void> {
  try {
    const raw = await redisGet(key)
    const list: Job[] = raw ? (JSON.parse(raw) as Job[]) : []
    list.unshift(item) // push to front (left)
    await redisSet(key, JSON.stringify(list))
  } catch (err) {
    console.error("[Queue] redisPushLeft error:", err)
    resetRedisAvailability()
    throw err
  }
}

async function redisPopRight(key: string): Promise<Job | null> {
  try {
    const raw = await redisGet(key)
    if (!raw) return null
    const list: Job[] = JSON.parse(raw) as Job[]
    if (list.length === 0) return null
    const item = list.pop()! // pop from back (right)
    await redisSet(key, JSON.stringify(list))
    return item
  } catch (err) {
    console.error("[Queue] redisPopRight error:", err)
    resetRedisAvailability()
    throw err
  }
}

async function redisListLen(key: string): Promise<number> {
  try {
    const raw = await redisGet(key)
    if (!raw) return 0
    const list: Job[] = JSON.parse(raw) as Job[]
    return list.length
  } catch {
    return 0
  }
}

async function redisPushRight(key: string, item: Job): Promise<void> {
  try {
    const raw = await redisGet(key)
    const list: Job[] = raw ? (JSON.parse(raw) as Job[]) : []
    list.push(item) // push to back (right)
    await redisSet(key, JSON.stringify(list))
  } catch (err) {
    console.error("[Queue] redisPushRight error:", err)
    resetRedisAvailability()
    throw err
  }
}

async function redisClearKey(key: string): Promise<void> {
  try {
    await redisDel(key)
  } catch (err) {
    console.error("[Queue] redisClearKey error:", err)
  }
}

async function redisGetAllItems(key: string): Promise<Job[]> {
  try {
    const raw = await redisGet(key)
    if (!raw) return []
    return JSON.parse(raw) as Job[]
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function enqueueJob(
  type: JobType,
  payload: Record<string, unknown>,
  options: {
    priority?: "low" | "normal" | "high"
    maxAttempts?: number
    delaySeconds?: number
  } = {}
): Promise<string> {
  const job: Job = {
    id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    payload,
    priority: options.priority ?? "normal",
    attempts: 0,
    maxAttempts: options.maxAttempts ?? 3,
    createdAt: new Date().toISOString(),
    scheduledFor: options.delaySeconds
      ? new Date(Date.now() + options.delaySeconds * 1000).toISOString()
      : undefined,
  }

  const useRedis = await isRedisAvailable()

  if (useRedis) {
    try {
      await redisPushLeft(QUEUE_KEYS[job.priority], job)
    } catch {
      // Fallback to memory on Redis error
      memQueue[job.priority].push(job)
    }
  } else {
    memQueue[job.priority].push(job)
  }

  console.log(`[Queue] Enqueued ${type} job ${job.id} (priority=${job.priority})`)
  return job.id
}

export async function dequeueJob(): Promise<Job | null> {
  const useRedis = await isRedisAvailable()

  if (useRedis) {
    for (const priority of ["high", "normal", "low"] as const) {
      const key = QUEUE_KEYS[priority]
      try {
        const job = await redisPopRight(key)
        if (!job) continue

        // If delayed and not yet ready, put back
        if (job.scheduledFor && new Date(job.scheduledFor) > new Date()) {
          await redisPushRight(key, job)
          continue
        }

        // Mark as processing (TTL 300s via a separate key)
        await redisSet(
          `${QUEUE_KEYS.processing}:${job.id}`,
          JSON.stringify(job),
          300
        )
        return job
      } catch {
        // On Redis error, fall through to next priority or memory
        continue
      }
    }
    return null
  } else {
    // Memory fallback
    for (const priority of ["high", "normal", "low"] as const) {
      const queue = memQueue[priority]
      if (queue.length === 0) continue
      const job = queue.pop()!
      if (job.scheduledFor && new Date(job.scheduledFor) > new Date()) {
        queue.push(job)
        continue
      }
      return job
    }
    return null
  }
}

export async function completeJob(jobId: string): Promise<void> {
  const useRedis = await isRedisAvailable()
  if (useRedis) {
    await redisDel(`${QUEUE_KEYS.processing}:${jobId}`)
  }
  // Memory: nothing to clean up — job was already popped
}

export async function failJob(job: Job, error: string): Promise<void> {
  const useRedis = await isRedisAvailable()

  job.attempts++
  job.error = error

  if (job.attempts < job.maxAttempts) {
    // Exponential backoff: 30s, 60s, 120s …
    const backoffSeconds = Math.pow(2, job.attempts - 1) * 30
    job.scheduledFor = new Date(Date.now() + backoffSeconds * 1000).toISOString()
    console.log(`[Queue] Job ${job.id} failed, scheduling retry in ${backoffSeconds}s`)

    if (useRedis) {
      try {
        await redisPushLeft(QUEUE_KEYS[job.priority], job)
      } catch {
        memQueue[job.priority].push(job)
      }
    } else {
      memQueue[job.priority].push(job)
    }
  } else {
    console.error(
      `[Queue] Job ${job.id} permanently failed after ${job.attempts} attempts: ${error}`
    )
    if (useRedis) {
      try {
        await redisPushLeft(QUEUE_KEYS.dead, job)
      } catch {
        memQueue.dead.push(job)
      }
    } else {
      memQueue.dead.push(job)
    }
  }

  if (useRedis) {
    await redisDel(`${QUEUE_KEYS.processing}:${job.id}`)
  }
}

export async function getQueueStats(): Promise<{
  high: number
  normal: number
  low: number
  dead: number
  processing: number
  backend: "redis" | "memory"
}> {
  const useRedis = await isRedisAvailable()

  if (useRedis) {
    const [high, normal, low, dead] = await Promise.all([
      redisListLen(QUEUE_KEYS.high),
      redisListLen(QUEUE_KEYS.normal),
      redisListLen(QUEUE_KEYS.low),
      redisListLen(QUEUE_KEYS.dead),
    ])
    return { high, normal, low, dead, processing: 0, backend: "redis" }
  }

  return {
    high: memQueue.high.length,
    normal: memQueue.normal.length,
    low: memQueue.low.length,
    dead: memQueue.dead.length,
    processing: 0,
    backend: "memory",
  }
}

/** Clear all dead-letter jobs and re-enqueue them at normal priority. */
export async function retryDeadJobs(): Promise<number> {
  const useRedis = await isRedisAvailable()
  let count = 0

  if (useRedis) {
    const deadJobs = await redisGetAllItems(QUEUE_KEYS.dead)
    await redisClearKey(QUEUE_KEYS.dead)
    for (const job of deadJobs) {
      job.attempts = 0
      job.error = undefined
      job.scheduledFor = undefined
      await redisPushLeft(QUEUE_KEYS[job.priority], job)
      count++
    }
  } else {
    const deadJobs = [...memQueue.dead]
    memQueue.dead = []
    for (const job of deadJobs) {
      job.attempts = 0
      job.error = undefined
      job.scheduledFor = undefined
      memQueue[job.priority].push(job)
      count++
    }
  }

  console.log(`[Queue] Retried ${count} dead jobs`)
  return count
}

/** Clear the dead-letter queue without re-enqueueing. */
export async function clearDeadJobs(): Promise<void> {
  const useRedis = await isRedisAvailable()
  if (useRedis) {
    await redisClearKey(QUEUE_KEYS.dead)
  } else {
    memQueue.dead = []
  }
}
