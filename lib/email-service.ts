import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Resend (primary - free 3000/month, most reliable)
const resend = new Resend(process.env.RESEND_API_KEY);

// Gmail SMTP (fallback)
const gmailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

// KVL TECH brand colors: #1a2035 (dark navy), #d4a017 (gold)

export const EMAIL_TEMPLATES = {
  welcome: (name: string, service: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; background: white; }
  .header { background: linear-gradient(135deg, #1a2035, #2d3a5f); padding: 40px; text-align: center; }
  .header img { max-width: 150px; }
  .header h1 { color: #d4a017; font-size: 28px; margin: 20px 0 5px; }
  .header p { color: #ccc; font-size: 14px; }
  .body { padding: 40px; }
  .body h2 { color: #1a2035; font-size: 22px; }
  .body p { color: #555; line-height: 1.6; font-size: 15px; }
  .highlight-box { background: #fff8e1; border-left: 4px solid #d4a017; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
  .cta-button { display: inline-block; background: linear-gradient(135deg, #d4a017, #b8860b); color: white; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-size: 16px; font-weight: bold; margin: 20px 0; }
  .benefits { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; }
  .benefit-item { display: flex; align-items: center; margin: 12px 0; color: #333; }
  .stats { display: flex; justify-content: space-around; background: #1a2035; padding: 25px; text-align: center; }
  .stat { color: white; }
  .stat-number { color: #d4a017; font-size: 28px; font-weight: bold; display: block; }
  .footer { background: #f5f5f5; padding: 30px; text-align: center; color: #888; font-size: 12px; }
  .whatsapp-btn { display: inline-block; background: #25D366; color: white; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-size: 14px; margin: 10px 5px; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <img src="https://kvlbusinesssolutions.com/kvl-tech-logo-white.png" alt="KVL TECH" style="max-width:160px;height:auto;margin-bottom:10px;" onerror="this.style.display='none'" />
    <h1 style="color:#d4a017;font-size:24px;margin:5px 0;">KVL TECH</h1>
    <p style="color:#ccc;font-size:13px;margin:0;">Premium Digital Solutions</p>
  </div>
  <div class="body">
    <h2>Namaste ${name}! &#x1F64F;</h2>
    <p>Shukriya KVL TECH se contact karne ke liye! Aapki enquiry humne receive kar li hai regarding <strong>${service}</strong>.</p>

    <div class="highlight-box">
      <strong>&#x1F3AF; Aapke liye kya hai:</strong><br>
      Hamare experts aapko 24 ghante ke andar contact karenge. Tab tak, humari website pe demo dekhein!
    </div>

    <p><strong>KVL TECH kyun choose karein?</strong></p>
    <div class="benefits">
      <div class="benefit-item">&#x2705; Ready-to-launch websites sirf 3-5 din mein</div>
      <div class="benefit-item">&#x2705; Aapki company branding ke saath fully customized</div>
      <div class="benefit-item">&#x2705; 1,200+ satisfied clients across India</div>
      <div class="benefit-item">&#x2705; Lifetime technical support</div>
      <div class="benefit-item">&#x2705; 100% quality guaranteed</div>
    </div>

    <p style="text-align:center">
      <a href="${process.env.SITE_URL}/products" class="cta-button">&#x1F680; Products Dekhein</a>
    </p>

    <p style="text-align:center">
      <a href="https://wa.me/919942000413?text=Hello KVL TECH, I need ${encodeURIComponent(service)}" class="whatsapp-btn">&#x1F4AC; WhatsApp Pe Baat Karein</a>
    </p>
  </div>

  <div class="stats">
    <div class="stat"><span class="stat-number">1,200+</span>Happy Clients</div>
    <div class="stat"><span class="stat-number">12,500+</span>Projects</div>
    <div class="stat"><span class="stat-number">4.9&#x2605;</span>Rating</div>
  </div>

  <div class="footer">
    <p>KVL TECH Pvt. Ltd. | INDIA</p>
    <p>&#x1F4DE; +91 9942000413 | &#x2709;&#xFE0F; kvlbusinesssolution@gmail.com</p>
    <p><a href="${process.env.SITE_URL}/unsubscribe" style="color:#888">Unsubscribe</a></p>
  </div>
</div>
</body></html>`,

  followUp1: (name: string, service: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0}
  .container{max-width:600px;margin:0 auto;background:white}
  .header{background:linear-gradient(135deg,#1a2035,#2d3a5f);padding:30px;text-align:center}
  .header h1{color:#d4a017;font-size:24px;margin:0}
  .body{padding:35px}
  .body p{color:#555;line-height:1.7;font-size:15px}
  .urgency-box{background:#fff3cd;border:2px solid #d4a017;padding:20px;border-radius:10px;margin:20px 0;text-align:center}
  .cta-button{display:inline-block;background:linear-gradient(135deg,#d4a017,#b8860b);color:white;text-decoration:none;padding:14px 30px;border-radius:8px;font-size:16px;font-weight:bold;margin:15px 0}
  .testimonial{background:#f8f9fa;padding:20px;border-radius:8px;border-left:4px solid #d4a017;margin:20px 0;font-style:italic;color:#444}
  .footer{background:#f5f5f5;padding:20px;text-align:center;color:#888;font-size:12px}
</style></head>
<body>
<div class="container">
  <div class="header">
    <img src="https://kvlbusinesssolutions.com/kvl-tech-logo-white.png" alt="KVL TECH" style="max-width:130px;height:auto;display:block;margin:0 auto 10px;" onerror="this.style.display='none'" />
    <h1 style="color:#d4a017;font-size:22px;margin:0;">KVL TECH &#x2014; Aapka Wait Kar Raha Hoon &#x1F64F;</h1>
  </div>
  <div class="body">
    <p>Namaste <strong>${name}</strong>,</p>
    <p>Kal aapne KVL TECH se ${service} ke baare mein poochha tha. Main jaanna chahta tha &#x2014; kya aapne decision le liya?</p>

    <div class="urgency-box">
      <strong>&#x26A1; Limited Time Offer!</strong><br>
      Is hafte jo bhi client Premium Plan lega, usse <strong>FREE Domain + Hosting (1 year)</strong> milega!<br>
      <small>Yeh offer sirf <strong>3 din aur</strong> valid hai</small>
    </div>

    <p>Aapke jaise business owners jo digital ho gaye hain unke results:</p>

    <div class="testimonial">
      &ldquo;KVL TECH ki website se hamare restaurant ke online orders 300% badh gaye. Best investment tha!&rdquo;
      <br><strong>&#x2014; Rajesh Kumar, Delhi</strong>
    </div>

    <p style="text-align:center">
      <a href="${process.env.SITE_URL}/products" class="cta-button">Abhi Start Karein &#x2192;</a>
    </p>

    <p>Koi sawaal hai? Direct reply karein ya WhatsApp: <strong>+91 9942000413</strong></p>
  </div>
  <div class="footer"><p>KVL TECH | <a href="${process.env.SITE_URL}/unsubscribe" style="color:#888">Unsubscribe</a></p></div>
</div></body></html>`,

  coldOutreach: (businessName: string, ownerName: string, businessType: string, city: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0}
  .container{max-width:600px;margin:0 auto;background:white}
  .header{background:linear-gradient(135deg,#1a2035,#2d3a5f);padding:30px;text-align:center}
  .header h1{color:#d4a017;font-size:22px;margin:0}
  .body{padding:35px}
  .body p{color:#444;line-height:1.8;font-size:15px}
  .problem-box{background:#fff5f5;border-left:4px solid #e74c3c;padding:15px 20px;margin:20px 0;border-radius:0 8px 8px 0}
  .solution-box{background:#f0fff4;border-left:4px solid #27ae60;padding:15px 20px;margin:20px 0;border-radius:0 8px 8px 0}
  .cta-button{display:inline-block;background:linear-gradient(135deg,#d4a017,#b8860b);color:white;text-decoration:none;padding:14px 30px;border-radius:8px;font-size:16px;font-weight:bold}
  .footer{background:#f5f5f5;padding:20px;text-align:center;color:#888;font-size:12px}
</style></head>
<body>
<div class="container">
  <div class="header">
    <img src="https://kvlbusinesssolutions.com/kvl-tech-logo-white.png" alt="KVL TECH" style="max-width:130px;height:auto;display:block;margin:0 auto 10px;" onerror="this.style.display='none'" />
    <h1 style="color:#d4a017;font-size:22px;margin:0;">KVL TECH &#x2014; ${city} ke Businesses ke liye Special Offer</h1>
  </div>
  <div class="body">
    <p>Namaste <strong>${ownerName || businessName}</strong> Ji,</p>
    <p>Main KVL TECH se Kavya bol rahi hoon. Maine aapka <strong>${businessName}</strong> Google pe dekha &#x2014; bahut achha ${businessType} hai aapka!</p>

    <div class="problem-box">
      <strong>&#x1F534; Ek baat notice ki:</strong><br>
      ${city} mein aapke competitors already professional websites aur online booking systems use kar rahe hain. Agar aapki digital presence strong nahi hai, to aap valuable customers miss kar rahe hain.
    </div>

    <div class="solution-box">
      <strong>&#x2705; Humari Solution:</strong><br>
      KVL TECH ke paas ${businessType} ke liye ready-made, fully customizable website hai. Sirf 3-5 din mein launch &#x2014; aapke naam ke saath!
    </div>

    <p><strong>Kya milega aapko:</strong></p>
    <ul style="color:#444;line-height:2">
      <li>Professional website aapke brand ke color/logo ke saath</li>
      <li>Online booking/order system</li>
      <li>Google pe top ranking ke liye SEO</li>
      <li>WhatsApp integration</li>
      <li>Mobile-friendly design</li>
    </ul>

    <p><strong>Starting: &#x20B9;12,999 sirf</strong> &#x2014; ek baar invest karo, lifetime returns pao!</p>

    <p style="text-align:center;margin:25px 0">
      <a href="${process.env.SITE_URL}/products" class="cta-button">Free Demo Dekhein &#x2192;</a>
    </p>

    <p>Reply karein ya WhatsApp: <strong>+91 9942000413</strong></p>
    <p style="color:#888;font-size:13px">Main personally aapko project ke baare mein guide karungi.</p>
  </div>
  <div class="footer">
    <p>KVL TECH Pvt. Ltd. | kvlbusinesssolutions.com</p>
    <p><a href="${process.env.SITE_URL}/unsubscribe" style="color:#888">Unsubscribe</a></p>
  </div>
</div></body></html>`,
};

export async function sendEmail(to: string, subject: string, html: string, fromName = 'KVL TECH'): Promise<boolean> {
  const from = `${fromName} <onboarding@resend.dev>`; // Resend default domain (works without custom domain)

  // Try Resend first
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('placeholder')) {
    try {
      const result = await resend.emails.send({ from, to, subject, html });
      if (result.data?.id) {
        console.log('[RESEND] Sent to:', to, '| ID:', result.data.id);
        return true;
      }
    } catch (e) {
      console.error('[RESEND] Failed, trying Gmail:', e);
    }
  }

  // Fallback: Gmail SMTP
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  if (smtpUser && smtpPass && !smtpPass.includes('placeholder') && !smtpPass.includes('xxxx')) {
    try {
      await gmailTransport.sendMail({
        from: `"${fromName}" <${smtpUser}>`,
        to, subject, html
      });
      console.log('[GMAIL SMTP] Sent to:', to);
      return true;
    } catch (e) {
      console.error('[GMAIL SMTP] Failed:', e);
    }
  }

  console.log('[EMAIL] No working email service configured. Would send to:', to);
  return false;
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
  service: string
): Promise<boolean> {
  return sendEmail(
    to,
    `Namaste ${name}! KVL TECH mein aapka swagat hai`,
    EMAIL_TEMPLATES.welcome(name, service)
  );
}

export async function sendFollowUpEmail(
  to: string,
  name: string,
  service: string,
  day: number
): Promise<boolean> {
  const subjects: Record<number, string> = {
    1: `${name} Ji, kya aapne decide kiya? Special offer sirf aaj ke liye!`,
    3: `${name} Ji, FREE Domain offer sirf 1 din aur valid hai!`,
    7: `Last chance: ${name} Ji, aapki slot reserve karte hain?`,
  };
  const subject = subjects[day] ?? `KVL TECH — Exclusive offer aapke liye`;
  return sendEmail(to, subject, EMAIL_TEMPLATES.followUp1(name, service));
}

export async function sendColdOutreachEmail(
  to: string,
  businessName: string,
  ownerName: string,
  businessType: string,
  city: string
): Promise<boolean> {
  return sendEmail(
    to,
    `${businessName} ke liye professional website — KVL TECH Special Offer`,
    EMAIL_TEMPLATES.coldOutreach(businessName, ownerName, businessType, city)
  );
}

export interface BulkEmailRecipient {
  to: string;
  name: string;
  service?: string;
  businessName?: string;
  ownerName?: string;
  businessType?: string;
  city?: string;
}

export async function sendBulkEmail(
  recipients: BulkEmailRecipient[],
  type: 'welcome' | 'followup' | 'cold',
  day?: number
): Promise<{ sent: number; failed: number; skipped: number }> {
  const results = { sent: 0, failed: 0, skipped: 0 };

  for (const recipient of recipients) {
    let success = false;

    if (type === 'welcome') {
      if (!recipient.name || !recipient.service) {
        results.skipped++;
        continue;
      }
      success = await sendWelcomeEmail(recipient.to, recipient.name, recipient.service);
    } else if (type === 'followup') {
      if (!recipient.name || !recipient.service) {
        results.skipped++;
        continue;
      }
      success = await sendFollowUpEmail(recipient.to, recipient.name, recipient.service, day ?? 1);
    } else if (type === 'cold') {
      if (!recipient.businessName || !recipient.businessType || !recipient.city) {
        results.skipped++;
        continue;
      }
      success = await sendColdOutreachEmail(
        recipient.to,
        recipient.businessName,
        recipient.ownerName ?? '',
        recipient.businessType,
        recipient.city
      );
    }

    if (success) {
      results.sent++;
    } else {
      results.failed++;
    }

    // Throttle: 1 email per 300ms to stay within rate limits
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  return results;
}
