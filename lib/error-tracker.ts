import { logger } from "./logger"

interface ErrorReport {
  error: Error | string
  context?: Record<string, unknown>
  userId?: string
  path?: string
  severity?: "low" | "medium" | "high" | "critical"
}

export async function captureError(report: ErrorReport) {
  const { error, context, userId, path, severity = "medium" } = report
  const message = error instanceof Error ? error.message : error
  const stack = error instanceof Error ? error.stack : undefined

  logger.error(message, {
    stack,
    context,
    userId,
    path,
    severity,
  })

  // Forward to Sentry if configured
  if (process.env.SENTRY_DSN) {
    try {
      const Sentry = await import("@sentry/nextjs").catch(() => null)
      if (Sentry) {
        Sentry.captureException(
          error instanceof Error ? error : new Error(String(error)),
          {
            extra: context,
            user: userId ? { id: userId } : undefined,
          }
        )
      }
    } catch {
      // Sentry unavailable — continue silently
    }
  }

  // Persist high-severity errors as AIAlerts in DB
  if (severity === "critical" || severity === "high") {
    try {
      const { db } = await import("./db")
      await db.aIAlert
        .create({
          data: {
            type: "SYSTEM_ERROR",
            severity: severity === "critical" ? "CRITICAL" : "HIGH",
            title: `System Error: ${message.slice(0, 100)}`,
            description: `${path ? `Path: ${path}\n` : ""}${stack?.slice(0, 500) || message}`,
          },
        })
        .catch(() => {
          // Non-fatal — DB might be the source of the error
        })
    } catch {
      // Non-fatal
    }
  }
}

/** Register global unhandled-rejection handler for the Node.js process. */
export function setupErrorHandlers() {
  if (typeof process !== "undefined") {
    process.on("unhandledRejection", (reason) => {
      captureError({
        error: reason instanceof Error ? reason : new Error(String(reason)),
        severity: "high",
        context: { type: "unhandledRejection" },
      })
    })
  }
}
