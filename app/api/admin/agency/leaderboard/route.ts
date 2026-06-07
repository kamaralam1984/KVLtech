import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAgencyLeaderboard, getAdminAgencyStats, PARTNER_TIERS } from "@/lib/agency-commission";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [leaderboard, stats] = await Promise.all([
      getAgencyLeaderboard(),
      getAdminAgencyStats(),
    ]);

    return NextResponse.json({
      leaderboard,
      tierDistribution: stats.tierDistribution,
      tiers: PARTNER_TIERS,
    });
  } catch (err) {
    console.error("[admin/agency/leaderboard GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
