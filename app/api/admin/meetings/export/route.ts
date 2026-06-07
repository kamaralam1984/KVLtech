import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { generateICalEvent } from "@/lib/ical"

const ORGANIZER_NAME = "KVL TECH"
const ORGANIZER_EMAIL = "support@kvlbusinesssolutions.com"

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const meetingId = searchParams.get("meetingId")
  const all = searchParams.get("all") === "true"

  if (!meetingId && !all) {
    return NextResponse.json({ error: "meetingId or all=true required" }, { status: 400 })
  }

  if (meetingId) {
    // Single meeting export
    const booking = await db.meetingBooking.findUnique({ where: { id: meetingId } })
    if (!booking) return NextResponse.json({ error: "Meeting not found" }, { status: 404 })

    const endTime = new Date(booking.date)
    endTime.setMinutes(endTime.getMinutes() + booking.duration)

    const ics = generateICalEvent({
      id: booking.id,
      title: booking.title,
      description: booking.notes || undefined,
      startTime: booking.date,
      endTime,
      location: booking.meetingLink || undefined,
      organizerName: ORGANIZER_NAME,
      organizerEmail: ORGANIZER_EMAIL,
      attendeeEmail: booking.clientEmail,
      attendeeName: booking.clientName,
      meetingUrl: booking.meetingLink || undefined,
    })

    return new NextResponse(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="meeting-${booking.id}.ics"`,
      },
    })
  }

  // All meetings export
  const bookings = await db.meetingBooking.findMany({
    where: { adminId: admin.id },
    orderBy: { date: "asc" },
  })

  const events = bookings.map((booking) => {
    const endTime = new Date(booking.date)
    endTime.setMinutes(endTime.getMinutes() + booking.duration)
    return generateICalEvent({
      id: booking.id,
      title: booking.title,
      description: booking.notes || undefined,
      startTime: booking.date,
      endTime,
      location: booking.meetingLink || undefined,
      organizerName: ORGANIZER_NAME,
      organizerEmail: ORGANIZER_EMAIL,
      attendeeEmail: booking.clientEmail,
      attendeeName: booking.clientName,
      meetingUrl: booking.meetingLink || undefined,
    })
  })

  // Merge all VEVENTs into one VCALENDAR
  const vevents = events.flatMap((e) => {
    const lines = e.split("\r\n")
    const start = lines.findIndex((l) => l === "BEGIN:VEVENT")
    const end = lines.findIndex((l) => l === "END:VEVENT")
    return lines.slice(start, end + 1)
  })

  const merged = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KVL Business Solutions//Meeting Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    ...vevents,
    "END:VCALENDAR",
  ].join("\r\n")

  return new NextResponse(merged, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="kvl-meetings.ics"`,
    },
  })
}
