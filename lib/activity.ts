import { db } from "@/lib/db"

export async function logActivity(data: {
  type: string
  title: string
  description?: string
  actorName?: string
  actorType?: "admin" | "client" | "system"
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, unknown>
}) {
  try {
    await db.activityFeedEvent.create({
      data: {
        ...data,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      },
    })
  } catch {
    /* fire-and-forget */
  }
}
