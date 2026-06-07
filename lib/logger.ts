// Structured JSON logger — production outputs JSON; development outputs coloured text.

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  [key: string]: unknown
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  }

  if (process.env.NODE_ENV === "production") {
    // JSON structured logging for Datadog, CloudWatch, etc.
    console.log(JSON.stringify(entry))
  } else {
    const colors: Record<LogLevel, string> = {
      debug: "\x1b[90m",
      info:  "\x1b[36m",
      warn:  "\x1b[33m",
      error: "\x1b[31m",
    }
    const reset = "\x1b[0m"
    const prefix = `${colors[level]}[${level.toUpperCase()}]${reset}`
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : ""
    console.log(`${prefix} ${entry.timestamp} — ${message}${metaStr}`)
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log("debug", msg, meta),
  info:  (msg: string, meta?: Record<string, unknown>) => log("info",  msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => log("warn",  msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
}

/** Log an HTTP request with method, path, status, and duration. */
export function logRequest(
  method: string,
  path: string,
  status: number,
  durationMs: number,
  meta?: Record<string, unknown>
) {
  logger.info(`${method} ${path} ${status}`, { durationMs, ...meta })
}
