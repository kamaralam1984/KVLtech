import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllPayouts, updatePayoutStatus } from "@/lib/agency-commission";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const list = await getAllPayouts();
    return NextResponse.json({ payouts: list, total: list.length });
  } catch (err) {
    console.error("[admin/agency/payouts GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { payoutId, status, txnReference } = body;

    if (!payoutId || !status) {
      return NextResponse.json({ error: "payoutId and status are required" }, { status: 400 });
    }
    if (!["PENDING", "PAID", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await updatePayoutStatus(payoutId, status, txnReference);
    if (!updated) return NextResponse.json({ error: "Payout not found" }, { status: 404 });

    return NextResponse.json({ payout: updated });
  } catch (err) {
    console.error("[admin/agency/payouts PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
