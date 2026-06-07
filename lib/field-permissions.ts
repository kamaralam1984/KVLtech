import { db } from "@/lib/db"

// Field permission definitions per resource type
export const FIELD_PERMISSIONS = {
  client: {
    basic: ["id", "name", "email", "company", "city", "phone", "createdAt"],
    financial: ["totalSpent", "subscriptions", "payments"],
    sensitive: ["password", "resetToken"],
    crm: ["score", "source", "assignedTo", "notes", "activities"],
  },
  order: {
    basic: ["id", "orderNumber", "status", "plan", "createdAt", "product"],
    financial: ["amount", "payment", "razorpayOrderId"],
    internal: ["internalNotes", "adminAssignee"],
  },
  lead: {
    basic: ["id", "name", "email", "phone", "service", "source", "createdAt"],
    crm: ["score", "status", "assignedTo", "notes", "activities"],
    contact: ["company", "city", "website"],
  },
} as const

type ResourceType = keyof typeof FIELD_PERMISSIONS
type FieldCategory = string

// Check if an admin has permission for specific field category
export async function hasFieldPermission(
  adminId: string,
  resource: ResourceType,
  category: FieldCategory
): Promise<boolean> {
  try {
    // Super admins always have full access
    const admin = await db.admin.findUnique({ where: { id: adminId }, select: { role: true } })
    if (admin?.role === "SUPER_ADMIN") return true

    // Check role-based permissions
    const assignment = await db.adminRoleAssignment.findFirst({
      where: { adminId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    })

    if (!assignment) return false

    // Check if role has this specific field permission
    return assignment.role.permissions.some(
      (rp) =>
        rp.permission.module === resource &&
        (rp.permission.action as string) === category
    )
  } catch {
    return false
  }
}

// Filter object fields based on permissions
export function filterFields<T extends Record<string, unknown>>(
  obj: T,
  allowedCategories: string[],
  resource: ResourceType
): Partial<T> {
  const allowedFields = allowedCategories.flatMap(
    (cat) => ((FIELD_PERMISSIONS[resource] as unknown) as Record<string, readonly string[]>)[cat] || []
  )

  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => allowedFields.includes(key))
  ) as Partial<T>
}

// Department definitions
export const DEPARTMENTS = {
  SALES: { name: "Sales", color: "#C9A227", modules: ["leads", "crm", "proposals", "referrals"] },
  SUPPORT: { name: "Support", color: "#3B82F6", modules: ["support", "kb", "sla", "clients"] },
  FINANCE: { name: "Finance", color: "#10B981", modules: ["billing", "orders", "payments", "subscriptions"] },
  TECH: { name: "Technology", color: "#8B5CF6", modules: ["products", "api-keys", "webhooks", "integrations"] },
  MARKETING: { name: "Marketing", color: "#EF4444", modules: ["blog", "marketing", "automation", "campaigns"] },
  OPERATIONS: { name: "Operations", color: "#F59E0B", modules: ["team", "meetings", "settings", "audit"] },
}

// Check if admin has department access
export async function hasDepartmentAccess(adminId: string, module: string): Promise<boolean> {
  try {
    const admin = await db.admin.findUnique({
      where: { id: adminId },
      select: { role: true },
    })
    if (admin?.role === "SUPER_ADMIN") return true

    // Also check role permissions
    const assignment = await db.adminRoleAssignment.findFirst({
      where: { adminId },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    })

    return assignment?.role.permissions.some((rp) => rp.permission.module === module) || false
  } catch {
    return true // Fail open for now
  }
}
