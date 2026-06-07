import { NextRequest, NextResponse } from "next/server";
import { runAlertChecks } from "@/lib/alert-engine";

export async function POST(req: NextRequest) {
  const expectedToken = process.env.CRON_SECRET || "kvl-cron-secret";
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await runAlertChecks();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results,
    });
  } catch (err) {
    console.error("[cron/alerts]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
