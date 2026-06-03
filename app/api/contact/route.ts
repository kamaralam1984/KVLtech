import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email-service";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, service, budget, message } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ error: "Name aur phone required hain" }, { status: 400 });
    }

    const lead = await db.contactLead.create({
      data: { name, phone, email, service, budget, message },
    });

    // Auto-send welcome email (fire-and-forget — never blocks the response)
    if (email) {
      sendWelcomeEmail(email, name, service ?? "our services").catch(console.error);
    }

    return NextResponse.json({ success: true, id: lead.id });
  } catch (err) {
    console.error("Contact lead error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
