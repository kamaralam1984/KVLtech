import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkConflict } from "@/lib/meeting-scheduler";

const DEFAULT_ADMIN_ID = process.env.DEFAULT_ADMIN_ID || "";

async function sendBookingEmail(booking: {
  clientEmail:  string;
  clientName:   string;
  date:         Date;
  title:        string;
  duration:     number;
  meetingLink?: string | null;
  notes?:       string | null;
  bookingId:    string;
  confirmationToken: string;
}) {
  try {
    const { Resend } = await import("resend");
    const resend  = new Resend(process.env.RESEND_API_KEY);
    const FROM    = "KVL TECH <onboarding@resend.dev>";
    const SITE    = process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com";

    const dateStr = booking.date.toLocaleDateString("en-IN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Kolkata",
    });
    const timeStr = booking.date.toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
    });

    const cancelUrl     = `${SITE}/meetings/cancel?id=${booking.bookingId}&token=${booking.confirmationToken}`;
    const rescheduleUrl = `${SITE}/meetings/reschedule?id=${booking.bookingId}&token=${booking.confirmationToken}`;

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
        <div style="background:#0B1437;padding:24px 32px;">
          <h1 style="color:#C9A227;margin:0;font-size:24px;letter-spacing:1px;">KVL TECH</h1>
          <p style="color:#8899BB;margin:4px 0 0;font-size:12px;">kvlbusinesssolutions.com</p>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1A1A2E;margin:0 0 8px;">Booking Request Received</h2>
          <p style="color:#6B7280;margin:0 0 24px;">Hi ${booking.clientName}, we've received your consultation request. Our team will confirm shortly.</p>
          <div style="background:#F8F9FC;border-radius:10px;padding:20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Topic</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${booking.title}</td></tr>
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Date</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${dateStr}</td></tr>
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Time</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${timeStr} IST</td></tr>
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Duration</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${booking.duration} minutes</td></tr>
              ${booking.meetingLink ? `<tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Join Link</td><td style="padding:6px 0;text-align:right;"><a href="${booking.meetingLink}" style="color:#C9A227;font-size:13px;font-weight:600;">Join Meeting →</a></td></tr>` : ""}
            </table>
          </div>
          <div style="background:#FFF8E7;border-left:4px solid #C9A227;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:20px;">
            <p style="margin:0;color:#92700A;font-size:13px;font-weight:600;">What happens next?</p>
            <p style="margin:4px 0 0;color:#374151;font-size:13px;">Our team will review your request and send you a confirmation with the meeting link within a few hours.</p>
          </div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <a href="${rescheduleUrl}" style="padding:10px 20px;border:1px solid #C9A227;border-radius:8px;color:#C9A227;text-decoration:none;font-size:13px;font-weight:600;">Reschedule</a>
            <a href="${cancelUrl}" style="padding:10px 20px;border:1px solid #E5E7EB;border-radius:8px;color:#6B7280;text-decoration:none;font-size:13px;">Cancel</a>
          </div>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">Questions? WhatsApp: <strong>+91 9942000413</strong></p>
        </div>
        <div style="background:#F8F9FC;padding:16px 32px;border-top:1px solid #E5E7EB;">
          <p style="color:#9CA3AF;font-size:12px;margin:0;">KVL TECH · INDIA · support@kvlbusinesssolutions.com · +91 9942000413</p>
        </div>
      </div>
    `;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from:    FROM,
        to:      booking.clientEmail,
        subject: `Booking Confirmed — ${booking.title} | KVL TECH`,
        html,
      });
    } else {
      console.log("[EMAIL] Booking email would be sent to:", booking.clientEmail);
    }
  } catch (err) {
    console.error("[EMAIL] Failed to send booking email:", err);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name,
    email,
    phone,
    date,
    startTime,
    endTime,
    timezone,
    duration,
    meetingType,
    notes,
    rescheduleToken,
  } = body;

  if (!name || !email || !date || !startTime) {
    return NextResponse.json(
      { error: "name, email, date, and startTime are required" },
      { status: 400 }
    );
  }

  // Build UTC Date from date+startTime in the provided timezone (default IST)
  const tz          = timezone || "Asia/Kolkata";
  const bookingDate = new Date(`${date}T${startTime}:00+05:30`);

  if (isNaN(bookingDate.getTime())) {
    return NextResponse.json({ error: "Invalid date or startTime" }, { status: 400 });
  }

  const dur      = parseInt(String(duration || "30"), 10);
  const bookEnd  = new Date(bookingDate.getTime() + dur * 60000);

  // Handle reschedule flow
  if (rescheduleToken) {
    // Find existing booking by token stored in notes JSON
    const existing = await db.meetingBooking.findFirst({
      where: { status: { in: ["PENDING", "CONFIRMED"] } },
    });
    // Token check is done in the dedicated reschedule route; here we just create fresh
  }

  // Conflict check
  const { hasConflict, conflictWith } = await checkConflict(bookingDate, bookEnd);
  if (hasConflict) {
    return NextResponse.json(
      { error: `This slot is no longer available: ${conflictWith}` },
      { status: 409 }
    );
  }

  // Find admin to book with
  const dayOfWeek = bookingDate.getDay();
  const avail     = await db.meetingAvailability.findFirst({
    where: {
      dayOfWeek,
      isActive: true,
      ...(DEFAULT_ADMIN_ID ? { adminId: DEFAULT_ADMIN_ID } : {}),
    },
  });

  const adminId = avail?.adminId || DEFAULT_ADMIN_ID;
  if (!adminId) {
    return NextResponse.json({ error: "No availability configured" }, { status: 400 });
  }

  // Generate confirmation token
  const confirmationToken = crypto.randomUUID();

  const notesPayload = JSON.stringify({
    confirmationToken,
    userNotes: notes || "",
    timezone:  tz,
  });

  const booking = await db.meetingBooking.create({
    data: {
      adminId,
      clientName:  name,
      clientEmail: email,
      clientPhone: phone || null,
      date:        bookingDate,
      duration:    dur,
      title:       meetingType || "Free Consultation Call",
      notes:       notesPayload,
      status:      "PENDING",
    },
  });

  // Send confirmation email async
  sendBookingEmail({
    clientEmail:       email,
    clientName:        name,
    date:              bookingDate,
    title:             booking.title,
    duration:          dur,
    meetingLink:       booking.meetingLink,
    notes:             notes,
    bookingId:         booking.id,
    confirmationToken,
  }).catch(console.error);

  return NextResponse.json({
    bookingId:         booking.id,
    confirmationToken,
    zoomLink:          booking.meetingLink || null,
    message:           "Booking request submitted. We will confirm shortly.",
  });
}
