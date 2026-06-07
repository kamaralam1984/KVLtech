import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);

  if (searchParams.get("preview") === "true") {
    // Return a mock HTML page showing the configured branding
    try {
      const config = await db.whiteLabelConfig.findFirst({
        where: { agencyId: null },
      });

      const companyName = config?.companyName || "KVL TECH";
      const logo = config?.logo || "/kvl-tech-logo.png";
      const primaryColor = config?.primaryColor || "#C9A227";
      const secondaryColor = config?.secondaryColor || "#0B1437";
      const footerText = config?.footerText || "KVL Business Solutions";
      const supportEmail = config?.supportEmail || "support@kvlbusinesssolutions.com";

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${companyName} — Branding Preview</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Inter, Arial, sans-serif; background: #f0f2f5; color: #1a1a2e; }
    .topbar { background: ${secondaryColor}; padding: 12px 32px; display: flex; align-items: center; justify-content: space-between; }
    .topbar img { height: 36px; object-fit: contain; }
    .topbar-brand { color: ${primaryColor}; font-size: 20px; font-weight: 800; letter-spacing: 1px; }
    .nav { background: ${secondaryColor}cc; padding: 0 32px; display: flex; gap: 0; border-top: 1px solid rgba(255,255,255,0.08); }
    .nav a { display: inline-block; padding: 14px 20px; color: rgba(255,255,255,0.65); font-size: 14px; font-weight: 500; text-decoration: none; transition: color 0.2s; }
    .nav a:hover, .nav a.active { color: ${primaryColor}; }
    .nav a.active { border-bottom: 2px solid ${primaryColor}; }
    .hero { background: ${secondaryColor}; padding: 48px 32px; text-align: center; color: #fff; }
    .hero h1 { font-size: 32px; font-weight: 800; margin-bottom: 12px; }
    .hero p { color: rgba(255,255,255,0.65); font-size: 16px; max-width: 520px; margin: 0 auto 24px; }
    .hero-btn { display: inline-block; background: ${primaryColor}; color: ${secondaryColor}; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; text-decoration: none; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 32px; max-width: 960px; margin: 0 auto; }
    .card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; }
    .card-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 14px; }
    .card h3 { font-size: 15px; font-weight: 700; margin-bottom: 6px; color: ${secondaryColor}; }
    .card p { font-size: 13px; color: #6b7280; line-height: 1.6; }
    .footer { background: ${secondaryColor}; color: rgba(255,255,255,0.5); text-align: center; padding: 20px 32px; font-size: 13px; margin-top: 32px; }
    .footer strong { color: ${primaryColor}; }
    .badge { display: inline-block; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); font-size: 11px; padding: 4px 10px; border-radius: 20px; margin-top: 8px; }
  </style>
</head>
<body>
  <!-- Header / Nav -->
  <div class="topbar">
    <div style="display:flex;align-items:center;gap:14px;">
      <img src="${logo}" alt="${companyName}" onerror="this.style.display='none'" />
      <span class="topbar-brand">${companyName}</span>
    </div>
    <div style="color:rgba(255,255,255,0.5);font-size:13px;">Client Portal Preview</div>
  </div>
  <nav class="nav">
    <a href="#" class="active">Overview</a>
    <a href="#">My Orders</a>
    <a href="#">Branding</a>
    <a href="#">Support</a>
    <a href="#">Messages</a>
    <a href="#">Files</a>
    <a href="#">Billing</a>
  </nav>

  <!-- Hero -->
  <div class="hero">
    <h1>Welcome to ${companyName}</h1>
    <p>Your dedicated client portal — track orders, submit branding details, and get real-time support.</p>
    <a href="#" class="hero-btn">Go to Dashboard &rarr;</a>
  </div>

  <!-- Feature cards -->
  <div class="cards">
    <div class="card">
      <div class="card-icon" style="background:${primaryColor}22;">📦</div>
      <h3>Track Orders</h3>
      <p>Monitor your project status in real-time with step-by-step progress updates.</p>
    </div>
    <div class="card">
      <div class="card-icon" style="background:${primaryColor}22;">🎨</div>
      <h3>Submit Branding</h3>
      <p>Upload your logo, choose your colors, and share all business details in one form.</p>
    </div>
    <div class="card">
      <div class="card-icon" style="background:${primaryColor}22;">💬</div>
      <h3>Get Support</h3>
      <p>Raise tickets or chat directly with the team. Contact: <strong>${supportEmail}</strong></p>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>${footerText} &middot; <strong>${supportEmail}</strong></p>
    <div class="badge">White Label Preview &mdash; powered by KVL TECH</div>
  </div>
</body>
</html>`;

      return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }

  try {
    const config = await db.whiteLabelConfig.findFirst({
      where: { agencyId: null },
    });
    return NextResponse.json({ config });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return upsertConfig(req);
}

export async function PATCH(req: NextRequest) {
  return upsertConfig(req);
}

async function upsertConfig(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      companyName,
      logo,
      favicon,
      primaryColor,
      secondaryColor,
      customDomain,
      emailFromName,
      emailFromAddr,
      footerText,
      supportEmail,
    } = body;

    const config = await db.whiteLabelConfig.upsert({
      where: { agencyId: null },
      create: {
        agencyId: null,
        ...(companyName && { companyName }),
        ...(logo !== undefined && { logo }),
        ...(favicon !== undefined && { favicon }),
        ...(primaryColor && { primaryColor }),
        ...(secondaryColor && { secondaryColor }),
        ...(customDomain !== undefined && { customDomain }),
        ...(emailFromName !== undefined && { emailFromName }),
        ...(emailFromAddr !== undefined && { emailFromAddr }),
        ...(footerText !== undefined && { footerText }),
        ...(supportEmail !== undefined && { supportEmail }),
      },
      update: {
        ...(companyName && { companyName }),
        ...(logo !== undefined && { logo }),
        ...(favicon !== undefined && { favicon }),
        ...(primaryColor && { primaryColor }),
        ...(secondaryColor && { secondaryColor }),
        ...(customDomain !== undefined && { customDomain }),
        ...(emailFromName !== undefined && { emailFromName }),
        ...(emailFromAddr !== undefined && { emailFromAddr }),
        ...(footerText !== undefined && { footerText }),
        ...(supportEmail !== undefined && { supportEmail }),
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
