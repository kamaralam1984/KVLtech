import { Resend } from "resend";
import nodemailer from "nodemailer";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com";

export async function sendEmailWithFallback(
  to: string,
  subject: string,
  html: string,
  opts?: { fromName?: string; fromAddr?: string }
) {
  const fromName = opts?.fromName || "KVL TECH";
  const rawFrom = opts?.fromAddr || process.env.EMAIL_FROM || "onboarding@resend.dev";
  // Use as-is if already "Name <email>" format, else wrap it
  const fromField = rawFrom.includes("<") ? rawFrom : `${fromName} <${rawFrom}>`;

  // 1. Gmail SMTP (primary — best inbox delivery until DMARC propagates)
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  if (smtpUser && smtpPass && !smtpPass.includes("xxxx") && !smtpPass.includes("placeholder")) {
    const gmail = nodemailer.createTransport({
      host: "smtp.gmail.com", port: 587, secure: false,
      auth: { user: smtpUser, pass: smtpPass },
    });
    try {
      await gmail.sendMail({ from: `"${fromName}" <${smtpUser}>`, to, subject, html });
      console.log("[GMAIL] Sent →", to);
      return;
    } catch (e) {
      console.error("[GMAIL] Failed:", e instanceof Error ? e.message : e);
    }
  }

  // 2. Resend fallback (DMARC missing → may land in spam)
  if (process.env.RESEND_API_KEY) {
    const { data, error } = await resend.emails.send({ from: fromField, to, subject, html });
    if (data?.id) {
      console.log("[RESEND] Sent:", data.id, "→", to);
      return;
    }
    console.error("[RESEND] Failed:", JSON.stringify(error));
  }

  // 3. Brevo SMTP (free 300/day — no domain verification needed)
  if (process.env.BREVO_EMAIL && process.env.BREVO_SMTP_KEY) {
    const brevo = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: { user: process.env.BREVO_EMAIL, pass: process.env.BREVO_SMTP_KEY },
    });
    await brevo.sendMail({ from: `"${fromName}" <${process.env.BREVO_EMAIL}>`, to, subject, html });
    console.log("[BREVO] Sent →", to);
    return;
  }

  console.warn("[EMAIL] No provider worked. TO:", to, "SUBJECT:", subject);
  const match = html.match(/href="(https?:\/\/[^"]+reset-password[^"]+)"/);
  if (match) console.log("[EMAIL] RESET LINK:", match[1]);
}

/**
 * Returns the white-label email config from DB, falling back to defaults.
 * Use this to get dynamic fromName/fromAddr for outbound emails.
 */
export async function getEmailConfig(): Promise<{ fromName: string; fromAddr: string }> {
  try {
    const { db } = await import("@/lib/db");
    const config = await db.whiteLabelConfig.findFirst({ where: { agencyId: null, isActive: true } });
    return {
      fromName: config?.emailFromName || "KVL TECH",
      fromAddr: config?.emailFromAddr || "noreply@kvlbusinesssolutions.com",
    };
  } catch {
    return { fromName: "KVL TECH", fromAddr: "noreply@kvlbusinesssolutions.com" };
  }
}

// ─── Shared HTML helpers ────────────────────────────────────────────────────
const emailHeader = `
  <div style="background:#0B1437;padding:24px 32px;">
    <h1 style="color:#C9A227;margin:0;font-size:24px;letter-spacing:1px;">KVL TECH</h1>
    <p style="color:#8899BB;margin:4px 0 0;font-size:12px;">kvlbusinesssolutions.com</p>
  </div>`;

const emailFooter = `
  <div style="background:#F8F9FC;padding:16px 32px;border-top:1px solid #E5E7EB;">
    <p style="color:#9CA3AF;font-size:12px;margin:0;">KVL TECH &middot; INDIA &middot; support@kvlbusinesssolutions.com &middot; +91 9942000413</p>
  </div>`;

const ctaButton = (href: string, label: string, bg = "#C9A227") =>
  `<a href="${href}" style="display:inline-block;background:${bg};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-top:8px;">${label} &rarr;</a>`;

const wrap = (inner: string) =>
  `<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">${emailHeader}${inner}${emailFooter}</div>`;

export async function sendOrderConfirmationEmail({
  to, name, orderNumber, productName, plan, amount,
}: {
  to: string; name: string; orderNumber: string;
  productName: string; plan: string; amount: number;
}) {
  await resend.emails.send({
    from: `KVL TECH <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
    to,
    subject: `Order Confirmed — ${orderNumber} | KVL TECH`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
        <div style="background:#0B1437;padding:24px 32px;">
          <h1 style="color:#C9A227;margin:0;font-size:22px;">KVL TECH</h1>
          <p style="color:#fff;margin:4px 0 0;font-size:13px;">kvlbusinesssolutions.com</p>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1A1A2E;margin:0 0 8px;">Order Confirm Ho Gaya! 🎉</h2>
          <p style="color:#6B7280;margin:0 0 24px;">Namaste ${name} ji, aapka payment successful raha.</p>
          <div style="background:#F8F9FC;border-radius:10px;padding:20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Order ID</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${orderNumber}</td></tr>
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Product</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${productName}</td></tr>
              <tr><td style="padding:6px 0;color:#6B7280;font-size:13px;">Plan</td><td style="padding:6px 0;font-weight:600;color:#1A1A2E;text-align:right;font-size:13px;">${plan}</td></tr>
              <tr style="border-top:1px solid #E5E7EB;"><td style="padding:10px 0 0;color:#1A1A2E;font-weight:700;font-size:15px;">Total Paid</td><td style="padding:10px 0 0;font-weight:700;color:#C9A227;text-align:right;font-size:15px;">₹${amount.toLocaleString("en-IN")}</td></tr>
            </table>
          </div>
          <p style="color:#6B7280;font-size:13px;margin:0 0 16px;">Humari team aapko jald hi contact karegi. Aap apna order <strong>Client Portal</strong> pe track kar sakte hain.</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com"}/client-portal"
            style="display:inline-block;background:#C9A227;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
            Client Portal Kholen →
          </a>
        </div>
        <div style="background:#F8F9FC;padding:16px 32px;border-top:1px solid #E5E7EB;">
          <p style="color:#9CA3AF;font-size:12px;margin:0;">KVL TECH · INDIA · support@kvlbusinesssolutions.com</p>
        </div>
      </div>
    `,
  });
}

export async function sendOrderStatusEmail({
  to, name, orderNumber, productName, status,
}: {
  to: string; name: string; orderNumber: string; productName: string; status: string;
}) {
  const statusLabels: Record<string, string> = {
    DESIGN_STARTED: "Design Shuru Ho Gayi",
    DEVELOPMENT: "Development Phase Mein",
    REVIEW_TESTING: "Review & Testing Phase Mein",
    DELIVERED: "Deliver Ho Gaya! 🎉",
  };
  const label = statusLabels[status] || status.replace(/_/g, " ");

  await resend.emails.send({
    from: `KVL TECH <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
    to,
    subject: `Order Update: ${label} — ${orderNumber}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
        <div style="background:#0B1437;padding:24px 32px;">
          <h1 style="color:#C9A227;margin:0;font-size:22px;">KVL TECH</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1A1A2E;margin:0 0 8px;">Order Update</h2>
          <p style="color:#6B7280;margin:0 0 24px;">Namaste ${name} ji,</p>
          <div style="background:#F8F9FC;border-radius:10px;padding:20px;margin-bottom:24px;">
            <p style="margin:0 0 8px;color:#6B7280;font-size:13px;">Order: <strong style="color:#1A1A2E;">${orderNumber}</strong> — ${productName}</p>
            <p style="margin:0;font-size:16px;font-weight:700;color:#C9A227;">${label}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com"}/client-portal"
            style="display:inline-block;background:#0B1437;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
            Track Order →
          </a>
        </div>
      </div>
    `,
  });
}

// ─── Email Sequence Functions ────────────────────────────────────────────────

/**
 * 1. Welcome email — jab new client register kare (auth/register route)
 */
export async function sendWelcomeSequenceEmail(client: {
  name: string;
  email: string;
  company?: string;
}) {
  const html = wrap(`
    <div style="padding:32px;">
      <h2 style="color:#0B1437;margin:0 0 6px;">Welcome to KVL TECH! &#x1F64F;</h2>
      <p style="color:#6B7280;margin:0 0 20px;font-size:14px;">Aapka account successfully create ho gaya hai.</p>
      <p style="color:#374151;line-height:1.7;">Namaste <strong>${client.name}</strong> ji,${client.company ? ` <strong>${client.company}</strong> ki taraf se aapka swagat hai.` : ""}</p>
      <p style="color:#374151;line-height:1.7;">Aapka KVL TECH Client Portal ready hai. Yahan aap apne orders track kar sakte hain, branding details submit kar sakte hain, aur humari team se directly baat kar sakte hain.</p>
      <div style="background:#F8F9FC;border-radius:10px;padding:20px;margin:24px 0;">
        <p style="margin:0 0 8px;font-weight:700;color:#0B1437;font-size:14px;">Aapke portal mein kya milega:</p>
        <ul style="margin:0;padding-left:18px;color:#6B7280;font-size:13px;line-height:2;">
          <li>Order status real-time track karo</li>
          <li>Branding form submit karo (logo, colors, content)</li>
          <li>Invoices aur payment history dekho</li>
          <li>Support tickets raise karo</li>
        </ul>
      </div>
      ${ctaButton(`${SITE_URL}/client-portal`, "Client Portal Kholen")}
      <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">Koi sawaal? Reply karein ya WhatsApp: <strong>+91 9942000413</strong></p>
    </div>
  `);

  await resend.emails.send({
    from: `KVL TECH <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
    to: client.email,
    subject: `Welcome to KVL TECH, ${client.name} ji! Aapka portal ready hai`,
    html,
  });
}

/**
 * 2. Lead follow-up — jab contact form submit ho (fire-and-forget, 24 hrs baad wale ke liye DB cron use karo)
 *    Yeh immediate confirmation email hai; 24-hr delay ke liye ek separate cron/queue chahiye.
 */
export async function sendLeadFollowupEmail(lead: {
  name: string;
  email: string;
  phone?: string;
}) {
  const html = wrap(`
    <div style="padding:32px;">
      <h2 style="color:#0B1437;margin:0 0 6px;">Aapki enquiry receive ho gayi! &#x2705;</h2>
      <p style="color:#6B7280;margin:0 0 20px;font-size:14px;">Humari team 24 ghante ke andar contact karegi.</p>
      <p style="color:#374151;line-height:1.7;">Namaste <strong>${lead.name}</strong> ji,</p>
      <p style="color:#374151;line-height:1.7;">Shukriya KVL TECH se contact karne ke liye! Aapki enquiry humne receive kar li hai. Hamare experts jald hi aapko best solution suggest karenge.</p>
      <div style="background:#FFF8E7;border-left:4px solid #C9A227;border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;color:#92700A;font-size:13px;font-weight:600;">Jaldi response chahiye?</p>
        <p style="margin:4px 0 0;color:#374151;font-size:13px;">WhatsApp karo: <strong>+91 9942000413</strong> — typically 30 min mein reply milta hai.</p>
      </div>
      <p style="color:#374151;line-height:1.7;font-size:14px;"><strong>Tab tak, hamare products dekho:</strong></p>
      ${ctaButton(`${SITE_URL}/products`, "Products Dekhein")}
      <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">Reference: ${lead.phone ? `Phone — ${lead.phone}` : "Email se contact"}</p>
    </div>
  `);

  await resend.emails.send({
    from: `KVL TECH <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
    to: lead.email,
    subject: `${lead.name} ji, aapki KVL TECH enquiry receive ho gayi ✓`,
    html,
  });
}

/**
 * 3. Demo reminder — 48 hrs baad agar koi action nahi liya
 */
export async function sendDemoReminderEmail(lead: {
  name: string;
  email: string;
}) {
  const html = wrap(`
    <div style="padding:32px;">
      <h2 style="color:#0B1437;margin:0 0 6px;">Abhi bhi soch rahe ho? &#x1F914;</h2>
      <p style="color:#6B7280;margin:0 0 20px;font-size:14px;">Aapke liye ek FREE demo ready hai.</p>
      <p style="color:#374151;line-height:1.7;">Namaste <strong>${lead.name}</strong> ji,</p>
      <p style="color:#374151;line-height:1.7;">2 din pehle aapne KVL TECH se contact kiya tha. Main jaanna chahta tha — kya aapke mann mein koi sawaal hai jo decision rok raha hai?</p>
      <div style="background:#F8F9FC;border-radius:10px;padding:20px;margin:24px 0;">
        <p style="margin:0 0 12px;font-weight:700;color:#0B1437;font-size:14px;">Humare clients ke real results:</p>
        <div style="display:flex;gap:16px;">
          <div style="flex:1;text-align:center;padding:12px;background:#fff;border-radius:8px;border:1px solid #E5E7EB;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#C9A227;">300%</p>
            <p style="margin:4px 0 0;font-size:11px;color:#6B7280;">Online enquiries badhein</p>
          </div>
          <div style="flex:1;text-align:center;padding:12px;background:#fff;border-radius:8px;border:1px solid #E5E7EB;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#C9A227;">3-5 din</p>
            <p style="margin:4px 0 0;font-size:11px;color:#6B7280;">Website launch time</p>
          </div>
          <div style="flex:1;text-align:center;padding:12px;background:#fff;border-radius:8px;border:1px solid #E5E7EB;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#C9A227;">1200+</p>
            <p style="margin:4px 0 0;font-size:11px;color:#6B7280;">Happy clients</p>
          </div>
        </div>
      </div>
      <p style="color:#374151;line-height:1.7;">Ek baar FREE live demo dekho — no commitment, no pressure.</p>
      ${ctaButton(`${SITE_URL}/products`, "Free Demo Book Karo")}
      <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">Ya directly call karo: <strong>+91 9942000413</strong></p>
    </div>
  `);

  await resend.emails.send({
    from: `KVL TECH <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
    to: lead.email,
    subject: `${lead.name} ji — ek FREE demo ke liye 15 min doge? 🚀`,
    html,
  });
}

/**
 * 5. Branding reminder — agar 3 din baad bhi branding form submit nahi kiya
 */
export async function sendPasswordResetEmail({
  to, name, resetUrl,
}: {
  to: string; name: string; resetUrl: string;
}) {
  const html = wrap(`
    <div style="padding:32px;">
      <h2 style="color:#0B1437;margin:0 0 6px;">Password Reset Request &#x1F512;</h2>
      <p style="color:#6B7280;margin:0 0 20px;font-size:14px;">You requested a password reset for your KVL TECH account.</p>
      <p style="color:#374151;line-height:1.7;">Hi <strong>${name}</strong>,</p>
      <p style="color:#374151;line-height:1.7;">We received a request to reset the password for your account. Click the button below to set a new password.</p>
      <div style="background:#FFF8E7;border-left:4px solid #C9A227;border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;color:#92700A;font-size:13px;font-weight:600;">&#x26A0; This link expires in 1 hour</p>
        <p style="margin:4px 0 0;color:#374151;font-size:13px;">If you did not request this, please ignore this email — your account is safe.</p>
      </div>
      ${ctaButton(resetUrl, "Reset Password", "#0B1437")}
      <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">Button not working? Copy and paste this link in your browser:<br/><span style="color:#C9A227;word-break:break-all;">${resetUrl}</span></p>
      <p style="color:#9CA3AF;font-size:12px;margin-top:16px;">Need help? WhatsApp: <strong>+91 9942000413</strong></p>
    </div>
  `);

  await sendEmailWithFallback(to, `Reset your KVL TECH password`, html);
}

export async function sendBrandingReminderEmail(client: {
  name: string;
  email: string;
  orderNumber: string;
}) {
  const html = wrap(`
    <div style="padding:32px;">
      <h2 style="color:#0B1437;margin:0 0 6px;">Aapki website ruk gayi hai! &#x23F0;</h2>
      <p style="color:#6B7280;margin:0 0 20px;font-size:14px;">Order: <strong>${client.orderNumber}</strong></p>
      <p style="color:#374151;line-height:1.7;">Namaste <strong>${client.name}</strong> ji,</p>
      <p style="color:#374151;line-height:1.7;">Aapka order <strong>${client.orderNumber}</strong> already process mein hai, lekin hum aapki <strong>branding details ka intezaar kar rahe hain</strong> — jaise logo, colors, business info.</p>
      <div style="background:#FFF0F0;border-left:4px solid #E53E3E;border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;color:#C53030;font-size:13px;font-weight:700;">&#x26A0; Delivery delay ho sakti hai!</p>
        <p style="margin:4px 0 0;color:#374151;font-size:13px;">Branding form submit karne ke baad hi humari design team kaam shuru karegi. Abhi submit karo aur delivery fast karo.</p>
      </div>
      <p style="color:#374151;line-height:1.7;font-size:14px;"><strong>Branding form mein kya bharna hai:</strong></p>
      <ul style="color:#6B7280;font-size:13px;line-height:2;padding-left:18px;margin:0 0 20px;">
        <li>Business name aur tagline</li>
        <li>Logo file (JPG/PNG/SVG)</li>
        <li>Preferred colors</li>
        <li>Business description aur services</li>
        <li>Contact details jo website pe show hon</li>
      </ul>
      ${ctaButton(`${SITE_URL}/client-portal/branding`, "Branding Form Submit Karo", "#0B1437")}
      <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">Koi help chahiye? WhatsApp: <strong>+91 9942000413</strong></p>
    </div>
  `);

  await resend.emails.send({
    from: `KVL TECH <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
    to: client.email,
    subject: `Action required: ${client.orderNumber} — Branding form abhi submit karo`,
    html,
  });
}
