import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

async function getAdminName(adminId: string): Promise<string> {
  try {
    const admin = await db.admin.findUnique({ where: { id: adminId }, select: { name: true } })
    return admin?.name || "Admin"
  } catch {
    return "Admin"
  }
}

interface UnifiedEvent {
  id: string
  title: string
  date: string
  endDate: string | null
  color: string
  type: "event" | "meeting"
  allDay: boolean
  attendees: string[]
  location: string | null
  description?: string | null
  meetingLink?: string | null
}

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get("month") // YYYY-MM

    let start: Date
    let end: Date

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, mon] = month.split("-").map(Number)
      start = new Date(year, mon - 1, 1)
      end = new Date(year, mon, 0, 23, 59, 59, 999) // last day of month
    } else {
      // Default: current month
      const now = new Date()
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    }

    const [calEvents, meetings] = await Promise.all([
      db.calendarEvent.findMany({
        where: { date: { gte: start, lte: end } },
        orderBy: { date: "asc" },
      }),
      db.meetingBooking.findMany({
        where: {
          status: "CONFIRMED",
          date: { gte: start, lte: end },
        },
        orderBy: { date: "asc" },
      }),
    ])

    const events: UnifiedEvent[] = [
      ...calEvents.map(e => ({
        id: e.id,
        title: e.title,
        date: e.date.toISOString(),
        endDate: e.endDate ? e.endDate.toISOString() : null,
        color: e.color,
        type: "event" as const,
        allDay: e.allDay,
        attendees: e.attendees,
        location: e.location || null,
        description: e.description || null,
        meetingLink: e.meetingLink || null,
      })),
      ...meetings.map(m => ({
        id: `meeting-${m.id}`,
        title: m.title || `Meeting with ${m.clientName}`,
        date: m.date.toISOString(),
        endDate: new Date(m.date.getTime() + m.duration * 60 * 1000).toISOString(),
        color: "#3B82F6",
        type: "meeting" as const,
        allDay: false,
        attendees: [m.clientName, m.clientEmail].filter(Boolean),
        location: null,
        description: m.notes || null,
        meetingLink: m.meetingLink || null,
      })),
    ]

    // Sort unified by date
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({ events })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const {
      title,
      description,
      date,
      endDate,
      allDay = false,
      color = "#C9A227",
      attendees = [],
      location,
      meetingLink,
    } = body

    if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 })
    if (!date) return NextResponse.json({ error: "Date is required" }, { status: 400 })

    const creatorName = await getAdminName(admin.id)

    const event = await db.calendarEvent.create({
      data: {
        title: title.trim(),
        description: description || null,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        allDay,
        color,
        attendees: Array.isArray(attendees) ? attendees : [attendees].filter(Boolean),
        location: location || null,
        meetingLink: meetingLink || null,
        createdBy: admin.id,
        creatorName,
        isRecurring: false,
      },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { id, title, description, date, endDate, allDay, color, attendees, location, meetingLink } = body

    if (!id) return NextResponse.json({ error: "Event ID required" }, { status: 400 })

    const data: Record<string, unknown> = {}
    if (title !== undefined) data.title = title.trim()
    if (description !== undefined) data.description = description || null
    if (date !== undefined) data.date = new Date(date)
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null
    if (allDay !== undefined) data.allDay = allDay
    if (color !== undefined) data.color = color
    if (attendees !== undefined) data.attendees = attendees
    if (location !== undefined) data.location = location || null
    if (meetingLink !== undefined) data.meetingLink = meetingLink || null

    const event = await db.calendarEvent.update({ where: { id }, data })

    return NextResponse.json({ event })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Event ID required" }, { status: 400 })

    await db.calendarEvent.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
