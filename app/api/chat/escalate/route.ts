import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmailWithFallback } from "@/lib/email";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@kvlbusinesssolutions.com";
const WA_NUMBER = "919942000413";
const WHATSAPP_URL = `https://wa.me/${WA_NUMBER}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      message,
      conversationHistory,
    }: {
      name?: string;
      email?: string;
      message?: string;
      conversationHistory?: { role: string; content: string }[];
    } = body;

    // Save escalation as a ContactLead
    try {
      await db.contactLead.create({
        data: {
          name: name || "Chat Visitor",
          email: email || `escalation-${Date.now()}@kvlchat.com`,
          phone: "",
          service: "Chat Escalation",
          message:
            message ||
            (conversationHistory
              ? `Chat escalation. Last messages:\n${conversationHistory
                  .slice(-4)
                  .map(m => `${m.role}: ${m.content}`)
                  .join("\n")}`
              : "Visitor requested human agent via chat."),
          source: "CHAT_ESCALATION",
          status: "NEW",
        },
      });
    } catch {
      // DB save is optional — do not fail the request
    }

    // Notify admin
    try {
      const historyHtml = conversationHistory
        ? conversationHistory
            .slice(-6)
            .map(
              m =>
                `<tr><td style="padding:4px 8px;color:#6B7280;font-size:12px;text-transform:capitalize;">${m.role}</td><td style="padding:4px 8px;font-size:13px;color:#1A1A2E;">${m.content}</td></tr>`
            )
            .join("")
        : "";

      const html = `
        <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
          <div style="background:#0B1437;padding:24px 32px;">
            <h1 style="color:#C9A227;margin:0;font-size:22px;">KVL TECH</h1>
            <p style="color:#fff;margin:4px 0 0;font-size:13px;">Chat Escalation Alert</p>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#EF4444;margin:0 0 16px;">🚨 Visitor Requested Human Agent</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;width:120px;">Name</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;">${name || "Unknown"}</td></tr>
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Email</td><td style="padding:6px 0;color:#1A1A2E;">${email || "Not provided"}</td></tr>
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Message</td><td style="padding:6px 0;color:#1A1A2E;">${message || "—"}</td></tr>
            </table>
            ${
              historyHtml
                ? `<p style="font-weight:700;color:#0B1437;margin:0 0 8px;">Recent Conversation:</p>
              <table style="width:100%;border-collapse:collapse;background:#F8F9FC;border-radius:8px;overflow:hidden;margin-bottom:20px;">
                ${historyHtml}
              </table>`
                : ""
            }
            <a href="https://kvlbusinesssolutions.com/admin/clients" style="display:inline-block;background:#C9A227;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
              View in CRM →
            </a>
          </div>
          <div style="background:#F8F9FC;padding:16px 32px;border-top:1px solid #E5E7EB;">
            <p style="color:#9CA3AF;font-size:12px;margin:0;">KVL TECH · Chat Escalation · kvlbusinesssolutions.com</p>
          </div>
        </div>
      `;

      await sendEmailWithFallback(
        ADMIN_EMAIL,
        `[Chat Escalation] ${name || "Visitor"} wants to speak with a human`,
        html
      );
    } catch {
      // Email notification is optional
    }

    return NextResponse.json({
      success: true,
      ticketUrl: "/support",
      whatsappUrl: WHATSAPP_URL,
    });
  } catch (error) {
    console.error("Chat escalation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process escalation" },
      { status: 500 }
    );
  }
}
