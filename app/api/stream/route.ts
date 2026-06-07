import { NextRequest } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          )
        } catch {
          // client disconnected
        }
      }

      // Send initial recent activity events
      try {
        const events = await db.activityFeedEvent.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
        })
        for (const event of events.reverse()) {
          send({ type: "activity", event })
        }
      } catch {
        // db might not be available
      }

      // Keep-alive ping loop
      const interval = setInterval(() => {
        send({ type: "ping", ts: Date.now() })
      }, 5000)

      // Clean up when client disconnects
      req.signal.addEventListener("abort", () => {
        clearInterval(interval)
        try {
          controller.close()
        } catch {
          // already closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
