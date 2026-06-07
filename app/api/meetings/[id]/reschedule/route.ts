import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkConflict } from "@/lib/meeting-scheduler";

async function sendRescheduleEmail(booking: {
  clientEmail:  string;
  clientName:   string;
  date:         Date;
  title:        string;
  duration:     number;
  bookingId:    string;
  confirmationToken: string;
}) {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM   = "KVL TECH <onboarding@resend.dev>";
    const SITE   = process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com";

    const dateStr = booking.date.toLocaleDateString("en-IN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Kolkata",
    });
    const timeStr = booking.date.toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
    });

    const cancelUrl = `${SITE}/meetings/cancel?id=${booking.bookingId}&token=${booking.confirmationToken}`;

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
        <div style="background:#0B1437;padding:24px 32px;">
          <h1 style="color:#C9A227;margin:0;font-size:24px;">KVL TECH</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1A1A2E;margin:0 0 8px;">Meeting Rescheduled</h2>
          <p style="color:#6B7280;margin:0 0 24px;">Hi ${booking.clientName}, your meeting has been rescheduled to:</p>
          <div style="background:#F8F9FC;border-radius:10px;padding:20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Topic</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${booking.title}</td></tr>
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">New Date</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${dateStr}</td></tr>
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">New Time</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${timeStr} IST</td></tr>
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Duration</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${booking.duration} minutes</td></tr>
            </table>
          </div>
          <a href="${cancelUrl}" style="padding:10px 20px;border:1px solid #E5E7EB;border-radius:8px;color:#6B7280;text-decoration:none;font-size:13px;">Cancel Meeting</a>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">Questions? WhatsApp: +91 9942000413</p>
        </div>
      </div>
    `;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from:    FROM,
        to:      booking.clientEmail,
        subject: `Meeting Rescheduled — ${booking.title} | KVL TECH`,
        html,
      });
    }
  } catch (err) {
    console.error("[EMAIL] Failed to send reschedule email:", err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { confirmationToken, newDate, newStartTime, newEndTime, timezone } = body;

  if (!confirmationToken || !newDate || !newStartTime) {
    return NextResponse.json(
      { error: "confirmationToken, newDate, and newStartTime are required" },
      { status: 400 }
    );
  }

  // Fetch booking
  const booking = await db.meetingBooking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "Cannot reschedule a cancelled booking" }, { status: 400 });
  }

  // Validate token from notes JSON
  let storedToken: string | null = null;
  try {
    const parsed  = JSON.parse(booking.notes || "{}");
    storedToken   = parsed.confirmationToken || null;
  } catch {
    // notes may be plain text
  }

  if (storedToken !== confirmationToken) {
    return NextResponse.json({ error: "Invalid confirmation token" }, { status: 403 });
  }

  const newBookingDate = new Date(`${newDate}T${newStartTime}:00+05:30`);
  if (isNaN(newBookingDate.getTime())) {
    return NextResponse.json({ error: "Invalid newDate or newStartTime" }, { status: 400 });
  }

  const newEnd = new Date(newBookingDate.getTime() + booking.duration * 60000);

  // Check conflict (exclude this booking)
  const { hasConflict, conflictWith } = await checkConflict(newBookingDate, newEnd, id);
  if (hasConflict) {
    return NextResponse.json(
      { error: `New slot is not available: ${conflictWith}` },
      { status: 409 }
    );
  }

  const updated = await db.meetingBooking.update({
    where: { id },
    data:  { date: newBookingDate, status: "PENDING" },
  });

  sendRescheduleEmail({
    clientEmail:       booking.clientEmail,
    clientName:        booking.clientName,
    date:              newBookingDate,
    title:             booking.title,
    duration:          booking.duration,
    bookingId:         id,
    confirmationToken,
  }).catch(console.error);

  return NextResponse.json({ success: true, booking: updated });
}
