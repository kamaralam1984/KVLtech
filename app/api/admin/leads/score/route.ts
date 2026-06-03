import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { scoreLeadFast, scoreLeadAI } from "@/lib/lead-scoring";

// POST /api/admin/leads/score
// body: { id } → score one lead with AI
// body: { all: true } → fast-score all leads
export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, all } = await req.json();

    // Rescore ALL leads (rule-based, fast)
    if (all) {
      const leads = await db.contactLead.findMany();
      let updated = 0;
      for (const lead of leads) {
        const result = scoreLeadFast(lead);
        await db.contactLead.update({
          where: { id: lead.id },
          data: { score: result.score, scoreLabel: result.scoreLabel, scoreNote: result.scoreNote, scoredAt: new Date() },
        });
        updated++;
      }
      return NextResponse.json({ success: true, updated });
    }

    // Score single lead with AI
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const lead = await db.contactLead.findUnique({ where: { id } });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const result = await scoreLeadAI(lead);

    const updated = await db.contactLead.update({
      where: { id },
      data: { score: result.score, scoreLabel: result.scoreLabel, scoreNote: result.scoreNote, scoredAt: new Date() },
    });

    return NextResponse.json({ success: true, lead: updated, result });
  } catch (err) {
    console.error("Scoring error:", err);
    return NextResponse.json({ error: "Scoring failed" }, { status: 500 });
  }
}
