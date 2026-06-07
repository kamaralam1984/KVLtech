import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"

export function logAudit(
  req: NextRequest,
  action: string,
  resource: string,
  resourceId?: string,
  details?: string
): void {
  const token = req.cookies.get("kvl_admin_token")?.value || getTokenFromRequest(req)
  const admin = token ? verifyToken(token) : null
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"

  db.auditLog
    .create({
      data: {
        adminId: admin?.id || null,
        adminName: admin?.email || null,
        action,
        resource,
        resourceId: resourceId || null,
        details: details || null,
        ip,
      },
    })
    .catch(() => {})
}
