import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import {
  runOutreachScan,
  getOutreachQueue,
  getOutreachStats,
  getLastScanAt,
} from "@/lib/customer-success"

// POST — trigger outreach scan
export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const result = await runOutreachScan()
    return NextResponse.json({
      ...result,
      lastScanAt: getLastScanAt()?.toISOString(),
    })
  } catch (err) {
    console.error("[customer-success/scan POST]", err)
    return NextResponse.json({ error: "Scan failed" }, { status: 500 })
  }
}

// GET — get outreach queue
export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const tasks = getOutreachQueue()
    const stats = getOutreachStats()
    return NextResponse.json({
      tasks,
      stats,
      lastScanAt: getLastScanAt()?.toISOString(),
    })
  } catch (err) {
    console.error("[customer-success/scan GET]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
