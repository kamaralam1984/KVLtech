import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateICalEvent } from "@/lib/ical"

const ORGANIZER_NAME = "KVL TECH"
const ORGANIZER_EMAIL = "support@kvlbusinesssolutions.com"

// Public calendar feed — all upcoming confirmed/pending meetings
export async function GET() {
  const bookings = await db.meetingBooking.findMany({
    where: {
      date: { gte: new Date() },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    orderBy: { date: "asc" },
  })

  const vevents = bookings.flatMap((booking) => {
    const endTime = new Date(booking.date)
    endTime.setMinutes(endTime.getMinutes() + booking.duration)

    const ical = generateICalEvent({
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

    const lines = ical.split("\r\n")
    const start = lines.findIndex((l) => l === "BEGIN:VEVENT")
    const end = lines.findIndex((l) => l === "END:VEVENT")
    return lines.slice(start, end + 1)
  })

  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KVL Business Solutions//Meeting Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:KVL TECH Meetings",
    "X-WR-TIMEZONE:Asia/Kolkata",
    "METHOD:PUBLISH",
    ...vevents,
    "END:VCALENDAR",
  ].join("\r\n")

  return new NextResponse(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": "inline; filename=calendar.ics",
      "Cache-Control": "no-cache, max-age=0",
    },
  })
}
