// Zoom Server-to-Server OAuth API integration
export interface ZoomMeeting {
  id: string
  join_url: string
  start_url: string
  password: string
  host_email: string
}

async function getZoomToken(): Promise<string | null> {
  const accountId = process.env.ZOOM_ACCOUNT_ID
  const clientId = process.env.ZOOM_CLIENT_ID
  const clientSecret = process.env.ZOOM_CLIENT_SECRET

  if (!accountId || !clientId || !clientSecret) return null

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
    const response = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    const data = (await response.json()) as { access_token: string }
    return data.access_token || null
  } catch {
    return null
  }
}

export async function createZoomMeeting(params: {
  topic: string
  startTime: Date
  durationMinutes: number
  agenda?: string
  password?: string
}): Promise<ZoomMeeting | null> {
  const token = await getZoomToken()
  if (!token) return null

  try {
    const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: params.topic,
        type: 2, // Scheduled meeting
        start_time: params.startTime.toISOString(),
        duration: params.durationMinutes,
        agenda: params.agenda || "",
        password: params.password || Math.random().toString(36).slice(2, 8),
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          waiting_room: true,
          auto_recording: "none",
        },
      }),
    })
    return (await response.json()) as ZoomMeeting
  } catch {
    return null
  }
}

export async function deleteZoomMeeting(meetingId: string): Promise<boolean> {
  const token = await getZoomToken()
  if (!token) return false
  try {
    const res = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.ok
  } catch {
    return false
  }
}

export function isZoomConfigured(): boolean {
  return !!(
    process.env.ZOOM_ACCOUNT_ID &&
    process.env.ZOOM_CLIENT_ID &&
    process.env.ZOOM_CLIENT_SECRET
  )
}
