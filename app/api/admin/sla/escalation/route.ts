import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rules = await db.sLAEscalationRule.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Join policy names manually since SLAPolicy has no back-relation defined
    const policies = await db.sLAPolicy.findMany({ select: { id: true, name: true, priority: true } });
    const policyMap = new Map(policies.map((p) => [p.id, p]));

    const rulesWithPolicy = rules.map((r) => ({
      ...r,
      slaPolicy: policyMap.get(r.slaId) || null,
    }));

    return NextResponse.json({ rules: rulesWithPolicy });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { slaId, escalateAfterMinutes, notifyAdminIds, notifyEmail, message } = await req.json();

    if (!slaId || !escalateAfterMinutes) {
      return NextResponse.json({ error: "slaId and escalateAfterMinutes are required" }, { status: 400 });
    }

    const rule = await db.sLAEscalationRule.create({
      data: {
        slaId,
        escalateAfterMinutes: Number(escalateAfterMinutes),
        notifyAdminIds: notifyAdminIds || [],
        notifyEmail: notifyEmail || null,
        message: message || null,
        isActive: true,
      },
    });

    return NextResponse.json({ rule });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, slaId, escalateAfterMinutes, notifyAdminIds, notifyEmail, message, isActive } = await req.json();

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const rule = await db.sLAEscalationRule.update({
      where: { id },
      data: {
        ...(slaId !== undefined && { slaId }),
        ...(escalateAfterMinutes !== undefined && { escalateAfterMinutes: Number(escalateAfterMinutes) }),
        ...(notifyAdminIds !== undefined && { notifyAdminIds }),
        ...(notifyEmail !== undefined && { notifyEmail: notifyEmail || null }),
        ...(message !== undefined && { message: message || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ rule });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await db.sLAEscalationRule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
