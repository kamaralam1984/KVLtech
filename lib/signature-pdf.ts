import puppeteer from "puppeteer"
import { createHash } from "crypto"
import { db } from "@/lib/db"

export async function generateSignatureCertificate(signatureRequestId: string): Promise<Buffer> {
  const request = await db.signatureRequest.findUnique({
    where: { id: signatureRequestId },
    include: {
      signatories: true,
    },
  })

  if (!request) throw new Error("Signature request not found")

  const hash = createHash("sha256")
    .update(
      request.id +
        (request.title || "") +
        JSON.stringify(request.signatories?.map((s) => s.signedAt))
    )
    .digest("hex")

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; background: #fff; color: #1a1a2e; padding: 40px; }
    .header { text-align: center; border-bottom: 3px solid #C9A227; padding-bottom: 24px; margin-bottom: 32px; }
    .logo { font-size: 24px; font-weight: 800; color: #C9A227; margin-bottom: 8px; }
    .title { font-size: 20px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
    .subtitle { color: #666; font-size: 14px; }
    .cert-id { background: #f8f8f8; border: 1px solid #eee; border-radius: 8px; padding: 12px 20px; margin: 24px 0; display: flex; justify-content: space-between; align-items: center; }
    .section { margin-bottom: 28px; }
    .section h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 12px; }
    .document-info { background: #fff9ed; border: 1px solid #C9A227; border-radius: 8px; padding: 16px 20px; }
    .document-info h4 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
    .document-info p { color: #555; font-size: 14px; }
    .signatory { border: 1px solid #eee; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .signatory-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; }
    .signatory-name { font-weight: 700; font-size: 15px; }
    .signatory-email { color: #666; font-size: 13px; }
    .status-signed { background: #dcfce7; color: #16a34a; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-pending { background: #fef9c3; color: #ca8a04; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .signatory-meta { font-size: 12px; color: #888; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 12px; }
    .hash-section { background: #f8f8f8; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 11px; color: #888; word-break: break-all; }
    .gold-bar { height: 4px; background: linear-gradient(to right, #C9A227, #FFD700, #C9A227); border-radius: 2px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">KVL TECH</div>
    <div class="title">Electronic Signature Certificate</div>
    <div class="subtitle">This document serves as legally valid proof of electronic signature</div>
  </div>

  <div class="cert-id">
    <div>
      <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">Certificate ID</div>
      <div style="font-weight:700;font-family:monospace;font-size:14px">${request.id.toUpperCase()}</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">Generated</div>
      <div style="font-weight:700;font-size:14px">${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</div>
    </div>
  </div>

  <div class="gold-bar"></div>

  <div class="section">
    <h3>Document Information</h3>
    <div class="document-info">
      <h4>${request.title || "Signature Request"}</h4>
      <p>Type: ${(request as Record<string, unknown>).documentType as string || "Agreement"}</p>
      <p>Request created: ${new Date(request.createdAt).toLocaleString("en-IN")}</p>
      ${request.status === "SIGNED" ? '<p style="color:#16a34a;font-weight:600;margin-top:8px">&#10003; All parties have signed</p>' : ""}
    </div>
  </div>

  <div class="section">
    <h3>Signatories (${request.signatories?.length || 0})</h3>
    ${(request.signatories || [])
      .map(
        (s) => `
    <div class="signatory">
      <div class="signatory-header">
        <div>
          <div class="signatory-name">${s.name}</div>
          <div class="signatory-email">${s.email}</div>
          ${s.role ? `<div style="font-size:12px;color:#888;margin-top:2px">${s.role}</div>` : ""}
        </div>
        <span class="${s.signedAt ? "status-signed" : "status-pending"}">${s.signedAt ? "&#10003; Signed" : "Pending"}</span>
      </div>
      ${
        s.signedAt
          ? `
      <div class="signatory-meta">
        <div>Signed on: ${new Date(s.signedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
        ${s.ipAddress ? `<div>IP Address: ${s.ipAddress}</div>` : ""}
        ${s.signatureData ? '<div style="color:#16a34a;font-size:11px;margin-top:4px">Digital signature captured</div>' : ""}
      </div>`
          : ""
      }
    </div>`
      )
      .join("")}
  </div>

  <div class="section">
    <h3>Document Hash (Tamper Proof)</h3>
    <div class="hash-section">${hash}</div>
  </div>

  <div class="footer">
    <p>This certificate is generated by KVL Business Solutions (kvlbusinesssolutions.com)</p>
    <p>Certificate ID: ${request.id} | Generated: ${new Date().toISOString()}</p>
    <p>This electronic signature is legally valid under the Information Technology Act, 2000 (India)</p>
  </div>
</body>
</html>`

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })
    const pdf = await page.pdf({
      format: "A4",
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      printBackground: true,
    })
    return pdf as Buffer
  } finally {
    await browser.close()
  }
}
