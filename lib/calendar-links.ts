export function getGoogleCalendarLink(meeting: {
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
}): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: meeting.title,
    dates: `${fmt(meeting.startTime)}/${fmt(meeting.endTime)}`,
    details: meeting.description || "",
    location: meeting.location || "",
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

export function getOutlookCalendarLink(meeting: {
  title: string
  startTime: Date
  endTime: Date
  description?: string
}): string {
  const params = new URLSearchParams({
    subject: meeting.title,
    startdt: meeting.startTime.toISOString(),
    enddt: meeting.endTime.toISOString(),
    body: meeting.description || "",
    path: "/calendar/action/compose",
    rru: "addevent",
  })
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params}`
}

export function getAppleCalendarLink(meetingId: string): string {
  return `${process.env.SITE_URL || ""}/api/meetings/${meetingId}/ical`
}
