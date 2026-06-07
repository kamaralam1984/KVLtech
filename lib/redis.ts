/**
 * Redis client using Node.js built-in `net` module (RESP protocol).
 * No npm package required — works with the redis:7-alpine service in docker-compose.
 *
 * To switch to the official client, run: npm install redis
 * then replace this file with the implementation that uses `createClient` from "redis".
 *
 * All functions gracefully return null/false/void when Redis is unavailable,
 * so the in-memory fallback in lib/cache.ts keeps working in dev without Docker.
 */

import net from "net"

const REDIS_HOST = process.env.REDIS_HOST || "localhost"
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10)
const CONNECT_TIMEOUT_MS = 2000

// Check whether Redis is configured at all
function isRedisConfigured(): boolean {
  return !!(process.env.REDIS_URL || process.env.REDIS_HOST || process.env.REDIS_PORT)
}

// ---------------------------------------------------------------------------
// Low-level: send a single RESP command and collect the reply
// ---------------------------------------------------------------------------
function sendCommand(args: string[]): Promise<string | number | null> {
  return new Promise((resolve, reject) => {
    if (!isRedisConfigured()) {
      resolve(null)
      return
    }

    const socket = new net.Socket()
    let buffer = ""
    let settled = false

    const finish = (val: string | number | null) => {
      if (!settled) {
        settled = true
        socket.destroy()
        resolve(val)
      }
    }

    const fail = (err: Error) => {
      if (!settled) {
        settled = true
        socket.destroy()
        reject(err)
      }
    }

    socket.setTimeout(CONNECT_TIMEOUT_MS)
    socket.on("timeout", () => fail(new Error("Redis timeout")))
    socket.on("error", fail)

    socket.on("data", (chunk) => {
      buffer += chunk.toString()

      // Simple RESP parser — handles the responses we use
      if (buffer.startsWith("+")) {
        // Simple string: +OK\r\n or +PONG\r\n
        const end = buffer.indexOf("\r\n")
        if (end !== -1) finish(buffer.slice(1, end))
      } else if (buffer.startsWith("-")) {
        // Error
        const end = buffer.indexOf("\r\n")
        if (end !== -1) fail(new Error(buffer.slice(1, end)))
      } else if (buffer.startsWith(":")) {
        // Integer
        const end = buffer.indexOf("\r\n")
        if (end !== -1) finish(parseInt(buffer.slice(1, end), 10))
      } else if (buffer.startsWith("$")) {
        // Bulk string
        const firstCRLF = buffer.indexOf("\r\n")
        if (firstCRLF === -1) return
        const len = parseInt(buffer.slice(1, firstCRLF), 10)
        if (len === -1) { finish(null); return }
        const dataStart = firstCRLF + 2
        if (buffer.length >= dataStart + len + 2) {
          finish(buffer.slice(dataStart, dataStart + len))
        }
      } else if (buffer.startsWith("*")) {
        // Array — we only call this for EXISTS which returns an integer
        // so treat the array case as not-found
        const firstCRLF = buffer.indexOf("\r\n")
        if (firstCRLF !== -1) finish(null)
      }
    })

    socket.connect(REDIS_PORT, REDIS_HOST, () => {
      // Build RESP command
      let cmd = `*${args.length}\r\n`
      for (const arg of args) {
        cmd += `$${Buffer.byteLength(arg)}\r\n${arg}\r\n`
      }
      socket.write(cmd)
    })
  })
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

export async function redisGet(key: string): Promise<string | null> {
  try {
    const result = await sendCommand(["GET", key])
    if (result === null || typeof result === "number") return null
    return result
  } catch {
    return null
  }
}

export async function redisSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  try {
    if (ttlSeconds) {
      await sendCommand(["SETEX", key, String(ttlSeconds), value])
    } else {
      await sendCommand(["SET", key, value])
    }
  } catch (err) {
    console.error("[Redis] Set error:", err)
  }
}

export async function redisDel(key: string): Promise<void> {
  try {
    await sendCommand(["DEL", key])
  } catch {}
}

export async function redisExists(key: string): Promise<boolean> {
  try {
    const result = await sendCommand(["EXISTS", key])
    return result === 1
  } catch {
    return false
  }
}

export async function redisIncr(key: string, ttlSeconds?: number): Promise<number> {
  try {
    const val = await sendCommand(["INCR", key])
    const count = typeof val === "number" ? val : 0
    if (ttlSeconds && count === 1) {
      // Set expiry only when key is first created
      await sendCommand(["EXPIRE", key, String(ttlSeconds)])
    }
    return count
  } catch {
    return 0
  }
}

export async function redisPublish(channel: string, message: string): Promise<void> {
  try {
    await sendCommand(["PUBLISH", channel, message])
  } catch {}
}

export async function redisPing(): Promise<boolean> {
  try {
    const result = await sendCommand(["PING"])
    return result === "PONG"
  } catch {
    return false
  }
}
