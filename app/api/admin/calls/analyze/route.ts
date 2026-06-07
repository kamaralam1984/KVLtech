import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { analyzeCallTranscript, generateFollowUpEmail } from "@/lib/call-analysis";
import { db } from "@/lib/db";

// In-memory store for recent call analyses (cleared on server restart)
interface StoredAnalysis {
  id: string;
  leadId?: string;
  clientName?: string;
  service?: string;
  transcript: string;
  analysis: Awaited<ReturnType<typeof analyzeCallTranscript>>;
  createdAt: string;
}
const recentAnalyses: StoredAnalysis[] = [];
const MAX_STORED = 50;

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { transcript, leadId, clientName, service, generateEmail, agentName } = body as {
      transcript?: string;
      leadId?: string;
      clientName?: string;
      service?: string;
      generateEmail?: boolean;
      agentName?: string;
    };

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "transcript is required" },
        { status: 400 }
      );
    }

    // Run call analysis
    const analysis = await analyzeCallTranscript(transcript, {
      clientName,
      service,
    });

    // Update lead score + notes if leadId provided
    if (leadId) {
      try {
        await db.contactLead.update({
          where: { id: leadId },
          data: {
            score: analysis.leadScore,
            scoreLabel:
              analysis.leadScore >= 70
                ? "hot"
                : analysis.leadScore >= 40
                ? "warm"
                : "cold",
            scoredAt: new Date(),
            notes: JSON.stringify({
              callAnalysis: analysis,
              transcriptSnippet: transcript.slice(0, 500),
            }),
          },
        });
      } catch (dbErr) {
        console.error("Lead update error:", dbErr);
        // Non-fatal
      }
    }

    // Store in memory
    const stored: StoredAnalysis = {
      id: `ca_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      leadId,
      clientName,
      service,
      transcript,
      analysis,
      createdAt: new Date().toISOString(),
    };
    recentAnalyses.unshift(stored);
    if (recentAnalyses.length > MAX_STORED) recentAnalyses.length = MAX_STORED;

    // Optionally generate follow-up email
    let followUpEmail: string | undefined;
    if (generateEmail && clientName && agentName) {
      followUpEmail = await generateFollowUpEmail(
        analysis,
        clientName,
        agentName
      );
    }

    return NextResponse.json({
      analysis,
      analysisId: stored.id,
      ...(followUpEmail !== undefined ? { followUpEmail } : {}),
    });
  } catch (err) {
    console.error("POST /api/admin/calls/analyze error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return up to 20 most recent analyses
    const results = recentAnalyses.slice(0, 20).map((a) => ({
      id: a.id,
      leadId: a.leadId,
      clientName: a.clientName,
      service: a.service,
      sentiment: a.analysis.sentiment,
      leadScore: a.analysis.leadScore,
      interestLevel: a.analysis.interestLevel,
      closingProbability: a.analysis.closingProbability,
      summary: a.analysis.summary,
      createdAt: a.createdAt,
    }));

    return NextResponse.json({ analyses: results, total: recentAnalyses.length });
  } catch (err) {
    console.error("GET /api/admin/calls/analyze error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
