import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

// Brevo SMTP (free 300/day — preferred fallback)
const brevoTransport = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_EMAIL,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

// Gmail SMTP (last resort — has daily limits)
const gmailTransport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(to: string, name: string, otp: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr><td align="center">
          <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <tr><td style="background:#0B1437;padding:28px 40px;text-align:center;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;">
                KVL <span style="color:#C9A227;">TECH</span>
              </div>
              <div style="font-size:11px;color:rgba(255,255,255,0.45);letter-spacing:2px;text-transform:uppercase;margin-top:4px;">
                kvlbusinesssolutions.com
              </div>
            </td></tr>
            <tr><td style="padding:40px;">
              <p style="margin:0 0 6px;font-size:14px;color:#6b7280;">
                Hello, <strong style="color:#111827;">${name}</strong>
              </p>
              <h1 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#111827;">
                Verify your email address
              </h1>
              <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.6;">
                Use the code below to complete your KVL TECH account registration.<br/>
                This code expires in <strong>10 minutes</strong>.
              </p>
              <div style="background:#f9fafb;border:2px dashed #C9A227;border-radius:12px;padding:32px;text-align:center;margin-bottom:28px;">
                <div style="font-size:46px;font-weight:900;letter-spacing:14px;color:#0B1437;font-family:monospace;">
                  ${otp}
                </div>
                <div style="font-size:12px;color:#9ca3af;margin-top:10px;">
                  One-Time Password &middot; Valid for 10 minutes
                </div>
              </div>
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.7;">
                Did not request this? You can safely ignore this email.
              </p>
            </td></tr>
            <tr><td style="padding:20px 40px 28px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;font-size:12px;color:#d1d5db;">
                &copy; 2024 KVL TECH Pvt. Ltd.
              </p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  const subject = `${otp} — Your KVL TECH Verification Code`;

  // 1. Try Resend (requires verified domain at resend.com/domains)
  if (process.env.RESEND_API_KEY) {
    try {
      const emailFrom = process.env.EMAIL_FROM || "onboarding@resend.dev";
      const fromField = emailFrom.includes("<") ? emailFrom : `KVL TECH <${emailFrom}>`;
      const { data, error } = await resend.emails.send({
        from: fromField,
        to, subject, html,
      });
      if (data?.id) {
        console.log("[send-otp] Resend OK:", data.id);
        return;
      }
      console.error("[send-otp] Resend failed:", JSON.stringify(error));
    } catch (e) {
      console.error("[send-otp] Resend exception:", e instanceof Error ? e.message : e);
    }
  }

  // 2. Brevo SMTP (free 300/day — no domain verification needed)
  const brevoKey = process.env.BREVO_SMTP_KEY || "";
  if (process.env.BREVO_EMAIL && brevoKey && !brevoKey.includes("placeholder")) {
    try {
      await brevoTransport.sendMail({
        from: `"KVL TECH" <${process.env.BREVO_EMAIL}>`,
        to, subject, html,
      });
      console.log("[send-otp] Brevo OK");
      return;
    } catch (e) {
      console.error("[send-otp] Brevo failed:", e instanceof Error ? e.message : e);
    }
  }

  // 3. Gmail SMTP (last resort — 500 email/day limit)
  const smtpPass = process.env.SMTP_PASS || "";
  if (process.env.SMTP_USER && smtpPass && !smtpPass.includes("xxxx")) {
    try {
      await gmailTransport.sendMail({
        from: `"KVL TECH" <${process.env.SMTP_USER}>`,
        to, subject, html,
      });
      console.log("[send-otp] Gmail OK");
      return;
    } catch (e) {
      console.error("[send-otp] Gmail failed:", e instanceof Error ? e.message : e);
    }
  }

  throw new Error("No email provider available. Options: (1) verify domain at resend.com/domains, (2) set real BREVO_SMTP_KEY, (3) check Gmail app password at myaccount.google.com/apppasswords");
}

// Global OTP store shared with verify-otp
declare global {
  // eslint-disable-next-line no-var
  var kvlOtpStore: Map<string, {
    otp: string;
    expiry: number;
    sentAt: number;
    name: string;
    phone?: string;
    company?: string;
    password: string;
  }> | undefined;
}

if (!global.kvlOtpStore) {
  global.kvlOtpStore = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [email, data] of global.kvlOtpStore!.entries()) {
      if (data.expiry < now) global.kvlOtpStore!.delete(email);
    }
  }, 15 * 60 * 1000);
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, company, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    // Already registered?
    const exists = await db.client.findUnique({ where: { email: emailLower } });
    if (exists) {
      return NextResponse.json({ error: "This email is already registered. Please sign in." }, { status: 409 });
    }

    // Rate limit: 60s between requests
    const existing = global.kvlOtpStore!.get(emailLower);
    if (existing && Date.now() - existing.sentAt < 60 * 1000) {
      const wait = Math.ceil((60 * 1000 - (Date.now() - existing.sentAt)) / 1000);
      return NextResponse.json({ error: `Please wait ${wait} seconds before requesting a new code.` }, { status: 429 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    global.kvlOtpStore!.set(emailLower, {
      otp, expiry: Date.now() + 10 * 60 * 1000,
      sentAt: Date.now(), name, phone, company, password,
    });

    await sendOtpEmail(emailLower, name, otp);

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    console.error("send-otp error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to send OTP: ${msg}` }, { status: 500 });
  }
}
