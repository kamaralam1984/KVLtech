import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "KVL TECH <onboarding@resend.dev>"; // change to verified domain in prod

export async function sendOrderConfirmationEmail({
  to, name, orderNumber, productName, plan, amount,
}: {
  to: string; name: string; orderNumber: string;
  productName: string; plan: string; amount: number;
}) {
  await resend.emails.send({
    from: FROM,
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
    from: FROM,
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
