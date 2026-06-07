import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getGoogleAdsStats, integrationConfigStore } from "@/lib/integrations-extended";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateRange = searchParams.get("dateRange") || "LAST_7_DAYS";

  const cfg = integrationConfigStore.get("google-ads");
  const customerId = cfg?.config?.GOOGLE_ADS_CUSTOMER_ID || process.env.GOOGLE_ADS_CUSTOMER_ID || "";
  const developerToken = cfg?.config?.GOOGLE_ADS_DEVELOPER_TOKEN || process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";
  const accessToken = cfg?.config?.GOOGLE_ADS_ACCESS_TOKEN || process.env.GOOGLE_ADS_ACCESS_TOKEN || "";

  if (!customerId || !developerToken || !accessToken) {
    return NextResponse.json(
      { error: "GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_DEVELOPER_TOKEN, and GOOGLE_ADS_ACCESS_TOKEN not configured" },
      { status: 400 }
    );
  }

  try {
    const stats = await getGoogleAdsStats(customerId, developerToken, accessToken, dateRange);
    return NextResponse.json({ stats, dateRange });
  } catch (err) {
    console.error("[Google Ads]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
