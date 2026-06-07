import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email-service";
import { sendLeadFollowupEmail } from "@/lib/email";
import { scoreLeadFast } from "@/lib/lead-scoring";
import { runAutomationTrigger } from "@/lib/automation-engine";
import { enqueueJob } from "@/lib/job-queue";
import { wsEvents } from "@/lib/ws-broadcast";
import { metrics } from "@/lib/metrics";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, service, budget, message } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ error: "Name aur phone required hain" }, { status: 400 });
    }

    const scoreData = scoreLeadFast({ name, phone, email, service, budget, message, source: "contact_form" });

    const lead = await db.contactLead.create({
      data: {
        name, phone, email, service, budget, message,
        score: scoreData.score,
        scoreLabel: scoreData.scoreLabel,
        scoreNote: scoreData.scoreNote,
        scoredAt: new Date(),
      },
    });

    metrics.leadsTotal.inc({ source: "website" })
    runAutomationTrigger("lead_created", { lead }).catch(console.error)
    wsEvents.newLead({ id: lead.id, name, service: service ?? "", score: scoreData.score })

    // Queue integration notifications (non-blocking, low priority)
    enqueueJob(
      "send_telegram",
      { message: `<b>New Lead</b>\nName: ${name}\nService: ${service}\nPhone: ${phone}` },
      { priority: "low" }
    ).catch(() => {})

    if (email) {
      sendWelcomeEmail(email, name, service ?? "our services").catch(console.error);
      // Lead follow-up confirmation email via Resend
      sendLeadFollowupEmail({ name, email, phone: phone ?? undefined }).catch(
        (err) => console.error("[email] sendLeadFollowupEmail failed:", err)
      );
    }

    return NextResponse.json({ success: true, id: lead.id });
  } catch (err) {
    console.error("Contact lead error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
