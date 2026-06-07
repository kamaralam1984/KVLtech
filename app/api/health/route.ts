import { db } from "@/lib/db"

// Public liveness probe — no auth required
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`
    return Response.json({ status: "ok", timestamp: new Date().toISOString() })
  } catch {
    return Response.json({ status: "error" }, { status: 503 })
  }
}
