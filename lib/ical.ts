// Generate .ics file content (RFC 5545 compliant)
export function generateICalEvent(meeting: {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  organizerName: string
  organizerEmail: string
  attendeeEmail?: string
  attendeeName?: string
  meetingUrl?: string
}): string {
  const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  const escape = (s: string) => s.replace(/[,;\\]/g, (c) => `\\${c}`).replace(/\n/g, "\\n")

  const uid = `${meeting.id}@kvlbusinesssolutions.com`
  const now = formatDate(new Date())
  const start = formatDate(meeting.startTime)
  const end = formatDate(meeting.endTime)

  const ical = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KVL Business Solutions//Meeting Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escape(meeting.title)}`,
    `ORGANIZER;CN=${escape(meeting.organizerName)}:MAILTO:${meeting.organizerEmail}`,
  ]

  if (meeting.description) ical.push(`DESCRIPTION:${escape(meeting.description)}`)
  if (meeting.location) ical.push(`LOCATION:${escape(meeting.location)}`)
  if (meeting.meetingUrl) ical.push(`URL:${escape(meeting.meetingUrl)}`)

  if (meeting.attendeeEmail) {
    ical.push(
      `ATTENDEE;CN=${escape(meeting.attendeeName || meeting.attendeeEmail)};RSVP=TRUE:MAILTO:${meeting.attendeeEmail}`
    )
  }

  ical.push(
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Meeting reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  )

  return ical.join("\r\n")
}

// Parse .ics file (for import)
export function parseICalEvent(icsContent: string): Array<{
  title: string
  startTime: Date
  endTime: Date
  description?: string
  location?: string
}> {
  const events: Array<{
    title: string
    startTime: Date
    endTime: Date
    description?: string
    location?: string
  }> = []
  const lines = icsContent.replace(/\r\n/g, "\n").split("\n")

  let currentEvent: Record<string, string> = {}
  let inEvent = false

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true
      currentEvent = {}
      continue
    }
    if (line === "END:VEVENT") {
      if (currentEvent.DTSTART && currentEvent.DTEND) {
        const parseDate = (s: string) => {
          const clean = s.replace(/T/, "").replace(/Z/, "")
          return new Date(
            `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}T${clean.slice(8, 10)}:${clean.slice(10, 12)}:${clean.slice(12, 14)}Z`
          )
        }
        events.push({
          title: currentEvent.SUMMARY || "Untitled Meeting",
          startTime: parseDate(currentEvent.DTSTART),
          endTime: parseDate(currentEvent.DTEND),
          description: currentEvent.DESCRIPTION,
          location: currentEvent.LOCATION,
        })
      }
      inEvent = false
      continue
    }
    if (!inEvent) continue

    const [key, ...valueParts] = line.split(":")
    const value = valueParts.join(":").replace(/\\n/g, "\n").replace(/\\,/g, ",")
    const cleanKey = key.split(";")[0]
    currentEvent[cleanKey] = value
  }

  return events
}
