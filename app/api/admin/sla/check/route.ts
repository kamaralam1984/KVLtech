import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com";

function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendBreachEmail(ticketNo: string, subject: string, priority: string, ageHours: number, policyName: string, firstResponseBreached: boolean, resolutionBreached: boolean) {
  const transporter = createTransporter();
  if (!transporter || !process.env.SMTP_USER) return;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:#EF444415;border-bottom:3px solid #EF4444;padding:20px 24px">
        <h2 style="margin:0;color:#EF4444;font-size:18px">🚨 SLA Breach Alert — Ticket ${ticketNo}</h2>
      </div>
      <div style="padding:24px;background:#ffffff">
        <p style="margin:0 0 16px;font-size:14px;color:#374151">Ticket <strong>${ticketNo}</strong>: "<em>${subject}</em>" has breached SLA.</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <tr>
            <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #e5e7eb;font-weight:600;color:#6B7280">Priority</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827">${priority}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #e5e7eb;font-weight:600;color:#6B7280">Age</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827">${ageHours.toFixed(1)}h</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #e5e7eb;font-weight:600;color:#6B7280">Policy</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827">${policyName}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #e5e7eb;font-weight:600;color:#6B7280">First Response</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:${firstResponseBreached ? "#EF4444" : "#16A34A"};font-weight:600">${firstResponseBreached ? "BREACHED" : "OK"}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #e5e7eb;font-weight:600;color:#6B7280">Resolution</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;color:${resolutionBreached ? "#EF4444" : "#16A34A"};font-weight:600">${resolutionBreached ? "BREACHED" : "OK"}</td>
          </tr>
        </table>
        <div style="margin-top:20px">
          <a href="${SITE_URL}/admin/support" style="display:inline-block;background:#C9A227;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px">View Ticket</a>
        </div>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: `🚨 SLA Breach Alert — Ticket ${ticketNo}`,
      text: `Ticket ${ticketNo}: "${subject}" has breached SLA.\nPriority: ${priority} | Age: ${ageHours.toFixed(1)}h | Policy: ${policyName}\nFirst Response: ${firstResponseBreached ? "BREACHED" : "OK"} | Resolution: ${resolutionBreached ? "BREACHED" : "OK"}\nView ticket: ${SITE_URL}/admin/support`,
      html,
    });
  } catch (err) {
    console.error("[SLA] Failed to send breach email:", err);
  }
}

export async function POST(req: NextRequest) {
  // Allow cron or requireAdmin
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isCron) {
    const { requireAdmin } = await import("@/lib/auth");
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // Fetch all open + in-progress tickets
    const tickets = await db.supportTicket.findMany({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      include: { client: { select: { name: true, email: true } } },
    });

    // Fetch all active SLA policies
    const policies = await db.sLAPolicy.findMany({ where: { isActive: true } });
    const policyMap = new Map(policies.map((p) => [p.priority, p]));

    let checked = 0;
    let breached = 0;
    let escalated = 0;
    const now = Date.now();

    for (const ticket of tickets) {
      checked++;
      const policy = policyMap.get(ticket.priority);
      if (!policy) continue;

      const ageMs = now - new Date(ticket.createdAt).getTime();
      const ageMinutes = ageMs / 60000;
      const ageHours = ageMs / (1000 * 60 * 60);

      // Get or create TicketSLALog
      let slaLog = await db.ticketSLALog.findUnique({ where: { ticketId: ticket.id } });
      if (!slaLog) {
        slaLog = await db.ticketSLALog.create({
          data: { ticketId: ticket.id, slaId: policy.id },
        });
      }

      let firstResponseBreached = slaLog.firstResponseBreached;
      let resolutionBreached = slaLog.resolutionBreached;
      let needsUpdate = false;
      let shouldEscalate = false;

      // Check firstResponse breach
      if (!slaLog.firstResponseAt && ageMinutes > policy.firstResponseMinutes) {
        firstResponseBreached = true;
        needsUpdate = true;
      }

      // Check resolution breach
      if (ageMinutes > policy.resolutionMinutes) {
        resolutionBreached = true;
        needsUpdate = true;
      }

      if (needsUpdate && (firstResponseBreached || resolutionBreached)) {
        breached++;
      }

      // Check escalation
      const escalationThreshold = policy.escalationMinutes ?? policy.resolutionMinutes;
      if (!slaLog.escalatedAt && ageMinutes > escalationThreshold) {
        shouldEscalate = true;
        escalated++;
      }

      // Persist updates
      if (needsUpdate || shouldEscalate) {
        await db.ticketSLALog.update({
          where: { id: slaLog.id },
          data: {
            slaId: policy.id,
            ...(firstResponseBreached && { firstResponseBreached: true }),
            ...(resolutionBreached && { resolutionBreached: true }),
            ...(shouldEscalate && { escalatedAt: new Date() }),
          },
        });
      }

      // Send breach email if newly escalated
      if (shouldEscalate && (firstResponseBreached || resolutionBreached)) {
        await sendBreachEmail(
          ticket.ticketNo,
          ticket.subject,
          ticket.priority,
          ageHours,
          policy.name,
          firstResponseBreached,
          resolutionBreached,
        );
      }
    }

    return NextResponse.json({ checked, breached, escalated });
  } catch (err) {
    console.error("[SLA] Check error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
