import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

async function sendCancellationEmail(booking: {
  clientEmail: string;
  clientName:  string;
  date:        Date;
  title:       string;
  reason?:     string;
}) {
  try {
    const { Resend } = await import("resend");
    const resend  = new Resend(process.env.RESEND_API_KEY);
    const FROM    = "KVL TECH <onboarding@resend.dev>";
    const SITE    = process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com";

    const dateStr = booking.date.toLocaleDateString("en-IN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Kolkata",
    });

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
        <div style="background:#0B1437;padding:24px 32px;">
          <h1 style="color:#C9A227;margin:0;font-size:24px;">KVL TECH</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1A1A2E;margin:0 0 8px;">Meeting Cancelled</h2>
          <p style="color:#6B7280;margin:0 0 24px;">Hi ${booking.clientName}, your meeting has been cancelled.</p>
          <div style="background:#F8F9FC;border-radius:10px;padding:20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Meeting</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${booking.title}</td></tr>
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Was Scheduled</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${dateStr}</td></tr>
              ${booking.reason ? `<tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Reason</td><td style="padding:6px 0;color:#1A1A2E;text-align:right;font-size:13px;">${booking.reason}</td></tr>` : ""}
            </table>
          </div>
          <a href="${SITE}/meetings" style="display:inline-block;background:#C9A227;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">Book a New Meeting →</a>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">Questions? WhatsApp: +91 9942000413</p>
        </div>
      </div>
    `;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from:    FROM,
        to:      booking.clientEmail,
        subject: `Meeting Cancelled — ${booking.title} | KVL TECH`,
        html,
      });
    }
  } catch (err) {
    console.error("[EMAIL] Failed to send cancellation email:", err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { confirmationToken, reason } = body;

  if (!confirmationToken) {
    return NextResponse.json({ error: "confirmationToken is required" }, { status: 400 });
  }

  const booking = await db.meetingBooking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
  }

  // Validate token
  let storedToken: string | null = null;
  try {
    const parsed = JSON.parse(booking.notes || "{}");
    storedToken  = parsed.confirmationToken || null;
  } catch {
    // plain text notes
  }

  if (storedToken !== confirmationToken) {
    return NextResponse.json({ error: "Invalid confirmation token" }, { status: 403 });
  }

  const updated = await db.meetingBooking.update({
    where: { id },
    data: {
      status:       "CANCELLED",
      cancelReason: reason || null,
    },
  });

  sendCancellationEmail({
    clientEmail: booking.clientEmail,
    clientName:  booking.clientName,
    date:        booking.date,
    title:       booking.title,
    reason:      reason,
  }).catch(console.error);

  return NextResponse.json({ success: true, booking: updated });
}
