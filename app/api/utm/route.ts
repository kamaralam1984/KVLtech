import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { utm_source, utm_medium, utm_campaign, utm_content, page, sessionId } = await req.json()
    console.log("[UTM]", { utm_source, utm_medium, utm_campaign, utm_content, page, sessionId, ts: new Date().toISOString() })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
