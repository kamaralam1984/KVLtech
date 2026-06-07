import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com";

async function sendSigningEmail(signatory: { name: string; email: string; role: string; token: string }, title: string, description?: string | null) {
  try {
    const signingUrl = `${SITE_URL}/sign/${signatory.token}`;
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM = "KVL TECH <onboarding@resend.dev>";

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
        <div style="background:#0B1437;padding:24px 32px;">
          <h1 style="color:#C9A227;margin:0;font-size:24px;">KVL TECH</h1>
          <p style="color:#8899BB;margin:4px 0 0;font-size:12px;">kvlbusinesssolutions.com</p>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1A1A2E;margin:0 0 8px;">Document Signature Required</h2>
          <p style="color:#6B7280;margin:0 0 24px;">Hi ${signatory.name}, you have been requested to sign a document as <strong>${signatory.role}</strong>.</p>
          <div style="background:#F8F9FC;border-radius:10px;padding:20px;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#1A1A2E;">${title}</p>
            ${description ? `<p style="margin:0;color:#6B7280;font-size:13px;">${description}</p>` : ""}
          </div>
          <a href="${signingUrl}" style="display:inline-block;background:#C9A227;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">Review & Sign Document →</a>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px;">Or copy this link: <span style="color:#C9A227;word-break:break-all;">${signingUrl}</span></p>
        </div>
        <div style="background:#F8F9FC;padding:16px 32px;border-top:1px solid #E5E7EB;">
          <p style="color:#9CA3AF;font-size:12px;margin:0;">KVL TECH &middot; INDIA &middot; support@kvlbusinesssolutions.com</p>
        </div>
      </div>
    `;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: FROM,
        to: signatory.email,
        subject: `Signature Required: ${title} | KVL TECH`,
        html,
      });
    } else {
      console.log("[SIGNATURE EMAIL] Would send to:", signatory.email, "| Signing URL:", signingUrl);
    }
  } catch (err) {
    console.error("[SIGNATURE EMAIL] Failed:", err);
    const signingUrl = `${SITE_URL}/sign/${signatory.token}`;
    console.log("[SIGNATURE EMAIL] Signing link for", signatory.email, ":", signingUrl);
  }
}

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const format = searchParams.get("format");

  // Certificate generation
  if (id && format === "certificate") {
    const request = await db.signatureRequest.findUnique({
      where: { id },
      include: { signatories: true },
    });
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const signatories = request.signatories;
    const html = `<!DOCTYPE html><html><head>
<title>Signature Certificate - ${request.title}</title>
<style>
  body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 2px solid #C9A227; padding-bottom: 20px; margin-bottom: 30px; }
  .logo { font-size: 24px; font-weight: bold; color: #C9A227; }
  .title { font-size: 18px; color: #333; margin-top: 10px; }
  .cert-id { font-size: 12px; color: #666; }
  .section { margin: 20px 0; }
  .section-title { font-weight: bold; color: #C9A227; border-bottom: 1px solid #eee; padding-bottom: 5px; }
  .signature-block { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 4px; }
  .sig-image { max-width: 200px; max-height: 80px; border-bottom: 1px solid #333; }
  .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
  @media print { .no-print { display: none !important; } }
</style>
</head><body>
<div class="header">
  <div class="logo">KVL TECH</div>
  <div class="title">DIGITAL SIGNATURE CERTIFICATE</div>
  <div class="cert-id">Certificate ID: ${request.id} | Issued: ${new Date().toLocaleDateString("en-IN")}</div>
</div>
<div class="section">
  <div class="section-title">DOCUMENT DETAILS</div>
  <p><strong>Document:</strong> ${request.title}</p>
  <p><strong>Description:</strong> ${request.description || "N/A"}</p>
  <p><strong>Status:</strong> ${request.status}</p>
  <p><strong>Requested:</strong> ${new Date(request.createdAt).toLocaleString("en-IN")}</p>
</div>
<div class="section">
  <div class="section-title">SIGNATORIES</div>
  ${signatories.map((s) => `
  <div class="signature-block">
    <p><strong>${s.name}</strong> (${s.role}) — ${s.email}</p>
    ${s.signatureData ? `<img class="sig-image" src="${s.signatureData}" />` : "<p>Pending signature</p>"}
    ${s.signedAt ? `<p>Signed: ${new Date(s.signedAt).toLocaleString("en-IN")} | IP: ${s.ipAddress || "N/A"}</p>` : ""}
    <p>Status: <strong>${s.status}</strong></p>
  </div>`).join("")}
</div>
<div class="footer">
  This certificate is generated by KVL Business Solutions. Certificate ID: ${request.id}
  <br>Verify at: kvlbusinesssolutions.com | support@kvlbusinesssolutions.com
</div>
</body></html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const requests = await db.signatureRequest.findMany({
    include: {
      signatories: {
        select: { id: true, name: true, email: true, role: true, status: true, signedAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = requests.map((r) => ({
    ...r,
    totalSignatories: r.signatories.length,
    signedCount: r.signatories.filter((s) => s.status === "SIGNED").length,
  }));

  return NextResponse.json({ requests: result });
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, content, signatories, expiresAt } = body;

  if (!title || !signatories || !Array.isArray(signatories) || signatories.length === 0) {
    return NextResponse.json({ error: "title and signatories[] are required" }, { status: 400 });
  }

  const request = await db.signatureRequest.create({
    data: {
      title,
      description: description || null,
      content: content || null,
      createdBy: admin.id,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      status: "PENDING",
      signatories: {
        create: signatories.map((s: { name: string; email: string; role?: string }) => ({
          name: s.name,
          email: s.email,
          role: s.role || "signer",
          status: "PENDING",
        })),
      },
    },
    include: { signatories: true },
  });

  // Send emails to each signatory
  for (const sig of request.signatories) {
    await sendSigningEmail(sig, title, description).catch(console.error);
  }

  return NextResponse.json({ request });
}

export async function PATCH(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id } = body;

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const request = await db.signatureRequest.update({
    where: { id },
    data: { status: "EXPIRED" },
  });

  // Mark all pending signatories as expired
  await db.signatory.updateMany({
    where: { requestId: id, status: "PENDING" },
    data: { status: "EXPIRED" },
  });

  return NextResponse.json({ request });
}
