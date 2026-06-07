import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateICalEvent } from "@/lib/ical"

const ORGANIZER_NAME = "KVL TECH"
const ORGANIZER_EMAIL = "support@kvlbusinesssolutions.com"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const booking = await db.meetingBooking.findUnique({ where: { id } })

  if (!booking) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
  }

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
      "Cache-Control": "no-cache",
    },
  })
}
