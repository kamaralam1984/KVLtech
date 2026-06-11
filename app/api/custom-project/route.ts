import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmailWithFallback } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      businessName,
      businessType,
      projectType,
      description,
      budget,
      contactName,
      phone,
      email,
      logoDescription,
      primaryColor,
      secondaryColor,
      referenceWebsites,
    } = body;

    if (!contactName || !phone) {
      return NextResponse.json(
        { error: "Name and phone number are required." },
        { status: 400 }
      );
    }

    // Compose a human-readable message from all fields
    const allFields = {
      businessName,
      businessType,
      projectType,
      description,
      budget,
      contactName,
      phone,
      email,
      logoDescription,
      primaryColor,
      secondaryColor,
      referenceWebsites,
    };

    const lead = await db.contactLead.create({
      data: {
        name: contactName,
        email: email || null,
        phone,
        message: JSON.stringify(allFields),
        source: "custom-project",
        service: `${projectType || "Custom"} for ${businessType || "Business"}`,
        budget: budget || null,
      },
    });

    // Send email notification to admin
    const adminEmail = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.EMAIL_FROM;
    if (adminEmail) {
      const html = `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #F8FAFC; padding: 32px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="color: #C9A227; font-size: 24px; margin: 0;">New Custom Project Request</h1>
            <p style="color: #94A3B8; font-size: 14px; margin-top: 6px;">Received via kvlbusinesssolutions.com</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #1E293B;">
              <td style="padding: 10px 0; color: #94A3B8; width: 40%;">Contact Name</td>
              <td style="padding: 10px 0; color: #F8FAFC; font-weight: 600;">${contactName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1E293B;">
              <td style="padding: 10px 0; color: #94A3B8;">Phone</td>
              <td style="padding: 10px 0; color: #F8FAFC;">${phone}</td>
            </tr>
            ${email ? `
            <tr style="border-bottom: 1px solid #1E293B;">
              <td style="padding: 10px 0; color: #94A3B8;">Email</td>
              <td style="padding: 10px 0; color: #F8FAFC;">${email}</td>
            </tr>` : ""}
            <tr style="border-bottom: 1px solid #1E293B;">
              <td style="padding: 10px 0; color: #94A3B8;">Business Name</td>
              <td style="padding: 10px 0; color: #F8FAFC;">${businessName || "—"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1E293B;">
              <td style="padding: 10px 0; color: #94A3B8;">Business Type</td>
              <td style="padding: 10px 0; color: #F8FAFC;">${businessType || "—"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1E293B;">
              <td style="padding: 10px 0; color: #94A3B8;">Project Type</td>
              <td style="padding: 10px 0; color: #F8FAFC;">${projectType || "—"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1E293B;">
              <td style="padding: 10px 0; color: #94A3B8;">Budget Range</td>
              <td style="padding: 10px 0; color: #C9A227; font-weight: 600;">${budget || "—"}</td>
            </tr>
            ${description ? `
            <tr style="border-bottom: 1px solid #1E293B;">
              <td style="padding: 10px 0; color: #94A3B8; vertical-align: top;">Description</td>
              <td style="padding: 10px 0; color: #F8FAFC;">${description}</td>
            </tr>` : ""}
            ${logoDescription ? `
            <tr style="border-bottom: 1px solid #1E293B;">
              <td style="padding: 10px 0; color: #94A3B8; vertical-align: top;">Logo / Brand</td>
              <td style="padding: 10px 0; color: #F8FAFC;">${logoDescription}</td>
            </tr>` : ""}
            <tr style="border-bottom: 1px solid #1E293B;">
              <td style="padding: 10px 0; color: #94A3B8;">Colors</td>
              <td style="padding: 10px 0; color: #F8FAFC;">
                Primary: <span style="color: ${primaryColor}; font-weight: 700;">${primaryColor}</span>
                &nbsp;&nbsp;Secondary: <span style="color: ${secondaryColor}; font-weight: 700;">${secondaryColor}</span>
              </td>
            </tr>
            ${referenceWebsites ? `
            <tr>
              <td style="padding: 10px 0; color: #94A3B8; vertical-align: top;">Reference URLs</td>
              <td style="padding: 10px 0; color: #F8FAFC;">${referenceWebsites}</td>
            </tr>` : ""}
          </table>

          <div style="margin-top: 28px; padding: 16px; background: #1E293B; border-radius: 8px; text-align: center;">
            <p style="color: #94A3B8; font-size: 12px; margin: 0;">
              Lead ID: <strong style="color: #C9A227;">${lead.id}</strong> — KVL TECH Admin
            </p>
          </div>
        </div>
      `;

      sendEmailWithFallback(
        adminEmail,
        `New Custom Project Request — ${contactName} (${businessType || projectType || "Custom"})`,
        html
      ).catch((err) => console.error("[custom-project] Email notification failed:", err));
    }

    return NextResponse.json({ success: true, id: lead.id });
  } catch (err) {
    console.error("[custom-project] Error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
