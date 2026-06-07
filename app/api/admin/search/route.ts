import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() || ""
  if (q.length < 2) return NextResponse.json({ results: [] })

  const limit = parseInt(searchParams.get("limit") || "5")
  const contains = { contains: q, mode: "insensitive" as const }

  const [clients, orders, tickets, leads, kbArticles, blogPosts] = await Promise.all([
    // Clients — search name, email, company, phone
    db.client.findMany({
      where: {
        OR: [
          { name: contains },
          { email: contains },
          { company: contains },
          { phone: contains },
        ],
      },
      take: limit,
      select: { id: true, name: true, email: true, company: true, city: true },
    }),

    // Orders — search orderNumber or client name (plan is an enum, skip text search on it)
    db.order.findMany({
      where: {
        OR: [
          { orderNumber: contains },
          { client: { name: contains } },
        ],
      },
      take: limit,
      select: {
        id: true,
        orderNumber: true,
        plan: true,
        status: true,
        amount: true,
        client: { select: { name: true } },
      },
    }),

    // Support Tickets — SupportTicket has `subject` and `message` (not description)
    db.supportTicket.findMany({
      where: {
        OR: [
          { subject: contains },
          { message: contains },
        ],
      },
      take: limit,
      select: {
        id: true,
        subject: true,
        status: true,
        priority: true,
        client: { select: { name: true } },
      },
    }),

    // Leads — ContactLead has name, phone, email but no company field
    db.contactLead.findMany({
      where: {
        OR: [
          { name: contains },
          { email: contains },
          { phone: contains },
        ],
      },
      take: limit,
      select: { id: true, name: true, email: true, service: true, status: true, score: true },
    }),

    // KB Articles — KBArticle has title, content, excerpt; category is a relation (KBCategory)
    db.kBArticle.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: contains },
          { content: contains },
          { excerpt: contains },
        ],
      },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        category: { select: { name: true } },
      },
    }),

    // Blog Posts
    db.blogPost.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: contains },
          { excerpt: contains },
        ],
      },
      take: limit,
      select: { id: true, title: true, slug: true, category: true },
    }),
  ])

  return NextResponse.json({
    results: {
      clients: clients.map(c => ({
        type: "client",
        id: c.id,
        label: c.name,
        sub: c.email,
        meta: c.company ?? c.city ?? undefined,
        url: `/admin/clients?id=${c.id}`,
      })),
      orders: orders.map(o => ({
        type: "order",
        id: o.id,
        label: `#${o.orderNumber}`,
        sub: o.client?.name,
        meta: `₹${o.amount} · ${o.status}`,
        url: `/admin/orders?id=${o.id}`,
      })),
      tickets: tickets.map(t => ({
        type: "ticket",
        id: t.id,
        label: t.subject,
        sub: t.client?.name,
        meta: `${t.priority} · ${t.status}`,
        url: `/admin/support?id=${t.id}`,
      })),
      leads: leads.map(l => ({
        type: "lead",
        id: l.id,
        label: l.name,
        sub: l.email ?? undefined,
        meta: `${l.service ?? "—"} · Score: ${l.score ?? 0}`,
        url: `/admin/crm?id=${l.id}`,
      })),
      kbArticles: kbArticles.map(a => ({
        type: "kb",
        id: a.id,
        label: a.title,
        sub: a.category?.name,
        url: `/kb/${a.slug}`,
      })),
      blogPosts: blogPosts.map(b => ({
        type: "blog",
        id: b.id,
        label: b.title,
        sub: b.category,
        url: `/admin/blog?id=${b.id}`,
      })),
    },
    query: q,
    totalCount:
      clients.length +
      orders.length +
      tickets.length +
      leads.length +
      kbArticles.length +
      blogPosts.length,
  })
}
