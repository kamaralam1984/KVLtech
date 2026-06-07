import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { scoreLeadFast } from "@/lib/lead-scoring";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  try {
    const leads = await db.contactLead.findMany({
      where: {
        AND: [
          status ? { status: status as any } : {},
          search ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
              { service: { contains: search, mode: "insensitive" } },
            ],
          } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    const counts = await db.contactLead.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    return NextResponse.json({ leads, counts });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, status, notes } = await req.json();
    if (!id) return NextResponse.json({ error: "Lead ID required" }, { status: 400 });

    const existing = await db.contactLead.findUnique({ where: { id } });
    const lead = await db.contactLead.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    // Re-score when status changes
    if (status && existing) {
      const merged = { ...existing, status };
      const result = scoreLeadFast(merged);
      await db.contactLead.update({
        where: { id },
        data: { score: result.score, scoreLabel: result.scoreLabel, scoreNote: result.scoreNote, scoredAt: new Date() },
      });
    }

    if (status) {
      logAudit(req, "UPDATE", "leads", id, `Lead status changed to ${status}`)
    }

    return NextResponse.json({ success: true, lead });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
