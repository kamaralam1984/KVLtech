import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { BookingStatus } from "@prisma/client";
import { createZoomMeeting } from "@/lib/zoom";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com";

async function sendBookingConfirmationEmail(booking: {
  clientEmail: string;
  clientName: string;
  date: Date;
  title: string;
  meetingLink?: string | null;
  duration: number;
}) {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM = "KVL TECH <onboarding@resend.dev>";
    const dateStr = booking.date.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Kolkata" });
    const timeStr = booking.date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
        <div style="background:#0B1437;padding:24px 32px;">
          <h1 style="color:#C9A227;margin:0;font-size:24px;letter-spacing:1px;">KVL TECH</h1>
          <p style="color:#8899BB;margin:4px 0 0;font-size:12px;">kvlbusinesssolutions.com</p>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1A1A2E;margin:0 0 8px;">Meeting Confirmed!</h2>
          <p style="color:#6B7280;margin:0 0 24px;">Your consultation has been confirmed. Here are the details:</p>
          <div style="background:#F8F9FC;border-radius:10px;padding:20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Meeting</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${booking.title}</td></tr>
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Date</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${dateStr}</td></tr>
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Time</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${timeStr} IST</td></tr>
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Duration</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${booking.duration} minutes</td></tr>
              ${booking.meetingLink ? `<tr style="border-top:1px solid #E5E7EB;"><td style="padding:10px 0 0;color:#6B7280;font-size:13px;">Meeting Link</td><td style="padding:10px 0 0;text-align:right;"><a href="${booking.meetingLink}" style="color:#C9A227;font-size:13px;font-weight:600;">Join Meeting →</a></td></tr>` : ""}
            </table>
          </div>
          ${booking.meetingLink ? `<a href="${booking.meetingLink}" style="display:inline-block;background:#C9A227;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">Join Meeting →</a>` : ""}
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">Questions? Contact us at support@kvlbusinesssolutions.com or WhatsApp: +91 9942000413</p>
        </div>
        <div style="background:#F8F9FC;padding:16px 32px;border-top:1px solid #E5E7EB;">
          <p style="color:#9CA3AF;font-size:12px;margin:0;">KVL TECH &middot; INDIA &middot; support@kvlbusinesssolutions.com &middot; +91 9942000413</p>
        </div>
      </div>
    `;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: FROM,
        to: booking.clientEmail,
        subject: `Meeting Confirmed — ${booking.title} | KVL TECH`,
        html,
      });
    } else {
      console.log("[EMAIL] Meeting confirmation would be sent to:", booking.clientEmail);
    }
  } catch (err) {
    console.error("[EMAIL] Failed to send booking confirmation:", err);
  }
}

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const date = searchParams.get("date");

  const where: Record<string, unknown> = { adminId: admin.id };
  if (status && status !== "ALL") where.status = status as BookingStatus;
  if (date) {
    const d = new Date(date);
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);
    where.date = { gte: d, lt: nextDay };
  }

  const bookings = await db.meetingBooking.findMany({
    where,
    orderBy: { date: "asc" },
  });

  const upcoming = await db.meetingBooking.count({
    where: {
      adminId: admin.id,
      date: { gte: new Date() },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });

  return NextResponse.json({ bookings, upcoming });
}

export async function PATCH(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, status, meetingLink, notes, createZoomLink } = body;

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // If createZoomLink requested, fetch booking first then create Zoom meeting
  let resolvedMeetingLink = meetingLink;
  let zoomMeeting = null;

  if (createZoomLink) {
    const existing = await db.meetingBooking.findUnique({ where: { id } });
    if (existing) {
      zoomMeeting = await createZoomMeeting({
        topic: existing.title,
        startTime: existing.date,
        durationMinutes: existing.duration,
        agenda: existing.notes || undefined,
      });
      if (zoomMeeting?.join_url) {
        resolvedMeetingLink = zoomMeeting.join_url;
      }
    }
  }

  // status is required unless we're only creating a Zoom link
  if (!status && !createZoomLink) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status as BookingStatus;
  if (resolvedMeetingLink !== undefined) updateData.meetingLink = resolvedMeetingLink;
  if (notes !== undefined) updateData.notes = notes;

  const booking = await db.meetingBooking.update({
    where: { id },
    data: updateData,
  });

  if (status === "CONFIRMED") {
    await sendBookingConfirmationEmail({
      clientEmail: booking.clientEmail,
      clientName: booking.clientName,
      date: booking.date,
      title: booking.title,
      meetingLink: booking.meetingLink,
      duration: booking.duration,
    });
  }

  return NextResponse.json({ booking, zoomMeeting });
}
