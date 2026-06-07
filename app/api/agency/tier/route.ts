import { NextRequest, NextResponse } from "next/server";
import {
  verifyAgencyToken,
  getAgencyTier,
  getAgencyLeaderboard,
} from "@/lib/agency-commission";
import { db } from "@/lib/db";

function getAgencyFromReq(req: NextRequest) {
  const token = req.cookies.get("kvl_agency_token")?.value;
  if (!token) return null;
  return verifyAgencyToken(token);
}

export async function GET(req: NextRequest) {
  const agencyAuth = getAgencyFromReq(req);
  if (!agencyAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tierInfo = await getAgencyTier(agencyAuth.id);
    const leaderboard = await getAgencyLeaderboard();

    // Find own position in leaderboard
    const allActiveCount = await db.agency.count({ where: { status: "ACTIVE" } });
    const ownRank = leaderboard.findIndex((e) => e.agencyId === agencyAuth.id) + 1;

    return NextResponse.json({
      ...tierInfo,
      leaderboard,
      ownRank: ownRank > 0 ? ownRank : allActiveCount,
      totalAgencies: allActiveCount,
    });
  } catch (err) {
    console.error("[agency/tier GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
