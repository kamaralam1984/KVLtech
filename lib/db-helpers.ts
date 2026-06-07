import { db } from "@/lib/db"
import { cacheGetOrSet } from "@/lib/cache"

// ---------------------------------------------------------------------------
// Optimized paginated query helper
// ---------------------------------------------------------------------------
export async function paginatedQuery<T>(
  model: {
    findMany: (args: Record<string, unknown>) => Promise<T[]>
    count: (args: Record<string, unknown>) => Promise<number>
  },
  where: Record<string, unknown> = {},
  options: {
    page?: number
    limit?: number
    orderBy?: Record<string, string>
    include?: Record<string, unknown>
    select?: Record<string, boolean>
  } = {}
): Promise<{ data: T[]; total: number; page: number; pages: number; limit: number }> {
  const page = Math.max(1, options.page || 1)
  const limit = Math.min(100, options.limit || 20)
  const skip = (page - 1) * limit

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy: options.orderBy || { createdAt: "desc" },
      ...(options.include ? { include: options.include } : {}),
      ...(options.select ? { select: options.select } : {}),
    }),
    model.count({ where }),
  ])

  return {
    data,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  }
}

// ---------------------------------------------------------------------------
// Dashboard stats — cached 1 minute
// ---------------------------------------------------------------------------
export async function getDashboardStats() {
  return cacheGetOrSet("dashboard:stats", async () => {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )

    const [
      totalClients,
      totalOrders,
      totalLeads,
      openTickets,
      revenueResult,
      newClientsThisMonth,
      ordersThisMonth,
    ] = await Promise.all([
      db.client.count(),
      db.order.count(),
      db.contactLead.count(),
      db.supportTicket.count({
        where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
      db.payment.aggregate({
        _sum: { amount: true },
        where: { status: "CAPTURED" },
      }),
      db.client.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      db.order.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
    ])

    return {
      totalClients,
      totalOrders,
      totalLeads,
      openTickets,
      totalRevenue: revenueResult._sum.amount || 0,
      newClientsThisMonth,
      ordersThisMonth,
    }
  }, 60) // 1-minute TTL
}

// ---------------------------------------------------------------------------
// Public products — cached 10 minutes
// ---------------------------------------------------------------------------
export async function getPublicProducts() {
  return cacheGetOrSet("public:products:v1", async () => {
    return db.product.findMany({
      where: { isActive: true },
      include: {
        plans: { orderBy: { sortOrder: "asc" } },
        faqs: { take: 3 },
      },
      orderBy: { sortOrder: "asc" },
    })
  }, 600) // 10-minute TTL
}
