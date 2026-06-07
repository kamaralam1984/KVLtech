import { NextRequest, NextResponse } from "next/server";
import {
  verifyAgencyToken,
  getAgencyCommissions,
  getAgencyTier,
  PARTNER_TIERS,
} from "@/lib/agency-commission";

function getAgencyFromReq(req: NextRequest) {
  const token = req.cookies.get("kvl_agency_token")?.value;
  if (!token) return null;
  return verifyAgencyToken(token);
}

export async function GET(req: NextRequest) {
  const agency = getAgencyFromReq(req);
  if (!agency) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as "PENDING" | "APPROVED" | "PAID" | "REJECTED" | null;
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const { items, total, summary } = await getAgencyCommissions(agency.id, {
      status: status ?? undefined,
      from,
      to,
      page,
      limit,
    });

    const tierInfo = await getAgencyTier(agency.id);

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      summary,
      tier: tierInfo,
    });
  } catch (err) {
    console.error("[agency/commissions GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
