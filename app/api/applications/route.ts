import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = "KVL TECH <onboarding@resend.dev>"

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, position, experience, portfolio, coverLetter } = await req.json()

    if (!name || !email || !position) {
      return NextResponse.json({ error: "Name, email and position are required" }, { status: 400 })
    }

    const application = await db.jobApplication.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || "",
        position: position.trim(),
        experience: experience?.trim() || null,
        portfolio: portfolio?.trim() || null,
        coverLetter: coverLetter?.trim() || null,
      },
    })

    try {
      const adminEmail = process.env.ADMIN_EMAIL || "careers@kvlbusinesssolutions.com"
      await resend.emails.send({
        from: FROM,
        to: adminEmail,
        subject: `New Job Application — ${position} | KVL TECH`,
        html: `
          <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
            <div style="background:#0B1437;padding:24px 32px;">
              <h1 style="color:#C9A227;margin:0;font-size:22px;">KVL TECH</h1>
              <p style="color:#8899BB;margin:4px 0 0;font-size:12px;">New Job Application Received</p>
            </div>
            <div style="padding:32px;">
              <h2 style="color:#1A1A2E;margin:0 0 20px;">Application for: ${position}</h2>
              <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;width:120px;">Name</td><td style="padding:8px 0;font-weight:600;color:#1A1A2E;font-size:13px;">${name}</td></tr>
                <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Email</td><td style="padding:8px 0;color:#1A1A2E;font-size:13px;">${email}</td></tr>
                <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Phone</td><td style="padding:8px 0;color:#1A1A2E;font-size:13px;">${phone || "—"}</td></tr>
                <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Experience</td><td style="padding:8px 0;color:#1A1A2E;font-size:13px;">${experience || "—"}</td></tr>
                <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Portfolio</td><td style="padding:8px 0;color:#1A1A2E;font-size:13px;">${portfolio || "—"}</td></tr>
              </table>
              ${coverLetter ? `<div style="background:#F8F9FC;border-radius:8px;padding:16px;"><p style="color:#6B7280;font-size:12px;margin:0 0 8px;font-weight:600;">Cover Letter / Why KVL TECH:</p><p style="color:#1A1A2E;font-size:13px;margin:0;line-height:1.6;">${coverLetter}</p></div>` : ""}
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com"}/admin/applications"
                style="display:inline-block;background:#C9A227;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:20px;">
                View in Admin Panel →
              </a>
            </div>
            <div style="background:#F8F9FC;padding:16px 32px;border-top:1px solid #E5E7EB;">
              <p style="color:#9CA3AF;font-size:12px;margin:0;">KVL TECH · INDIA · careers@kvlbusinesssolutions.com</p>
            </div>
          </div>
        `,
      })
    } catch {
    }

    return NextResponse.json({ success: true, id: application.id })
  } catch (err) {
    console.error("Application submit error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    const applications = await db.jobApplication.findMany({
      where: status && status !== "all" ? { status: status as any } : undefined,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ applications })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id, status } = await req.json()

    if (!id || !status)
      return NextResponse.json({ error: "id and status required" }, { status: 400 })

    const application = await db.jobApplication.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ success: true, application })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
