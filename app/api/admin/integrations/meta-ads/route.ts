import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getMetaAdStats, getMetaAdCampaigns, integrationConfigStore } from "@/lib/integrations-extended";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const datePreset =
    (searchParams.get("datePreset") as "last_7d" | "last_30d" | "this_month") || "last_7d";

  const cfg = integrationConfigStore.get("meta-ads");
  const accessToken = cfg?.config?.META_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || "";
  const adAccountId = cfg?.config?.META_AD_ACCOUNT_ID || process.env.META_AD_ACCOUNT_ID || "";

  if (!accessToken || !adAccountId) {
    return NextResponse.json(
      { error: "META_ACCESS_TOKEN and META_AD_ACCOUNT_ID not configured" },
      { status: 400 }
    );
  }

  try {
    const [stats, campaigns] = await Promise.all([
      getMetaAdStats(accessToken, adAccountId, datePreset),
      getMetaAdCampaigns(accessToken, adAccountId),
    ]);
    return NextResponse.json({ stats, campaigns, datePreset });
  } catch (err) {
    console.error("[Meta Ads]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
