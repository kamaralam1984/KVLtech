import { NextRequest, NextResponse } from "next/server";
import {
  verifyAgencyToken,
  getAgencyPayouts,
  requestPayout,
  getAgencyCommissions,
} from "@/lib/agency-commission";

function getAgencyFromReq(req: NextRequest) {
  const token = req.cookies.get("kvl_agency_token")?.value;
  if (!token) return null;
  return verifyAgencyToken(token);
}

export async function GET(req: NextRequest) {
  const agency = getAgencyFromReq(req);
  if (!agency) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const list = await getAgencyPayouts(agency.id);

    // Calculate available balance
    const { summary } = await getAgencyCommissions(agency.id);
    const paidOut = list.filter((p) => p.status !== "REJECTED").reduce((s, p) => s + p.amount, 0);
    const availableBalance = Math.max(0, (summary.totalPending + summary.totalEarned - summary.totalPaid) - paidOut);

    return NextResponse.json({ payouts: list, availableBalance });
  } catch (err) {
    console.error("[agency/payouts GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const agency = getAgencyFromReq(req);
  if (!agency) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { amount, bankName, accountNumber, ifscCode, notes } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!bankName || !accountNumber || !ifscCode) {
      return NextResponse.json({ error: "Bank name, account number and IFSC are required" }, { status: 400 });
    }

    const payout = await requestPayout(agency.id, amount, {
      bankName,
      accountNumber,
      ifscCode,
      notes,
    });

    return NextResponse.json({ payout }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
