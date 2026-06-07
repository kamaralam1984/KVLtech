import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getAllCommissions,
  updateCommissionStatus,
} from "@/lib/agency-commission";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const agencyId = searchParams.get("agencyId") || undefined;

  try {
    const items = await getAllCommissions(agencyId);
    return NextResponse.json({ items, total: items.length });
  } catch (err) {
    console.error("[admin/agency/commissions GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { commissionId, status } = body;

    if (!commissionId || !status) {
      return NextResponse.json({ error: "commissionId and status are required" }, { status: 400 });
    }

    if (!["PENDING", "APPROVED", "PAID", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await updateCommissionStatus(commissionId, status);
    if (!updated) return NextResponse.json({ error: "Commission not found" }, { status: 404 });

    return NextResponse.json({ commission: updated });
  } catch (err) {
    console.error("[admin/agency/commissions PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
