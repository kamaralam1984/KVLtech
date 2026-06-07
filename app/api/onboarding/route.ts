import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const client = await db.client.findUnique({
      where: { id: auth.id },
      select: { company: true, phone: true, city: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const companySet = Boolean(client.company);
    const phoneSet = Boolean(client.phone);

    if (companySet && phoneSet) {
      return NextResponse.json({ completed: true, step: 5 });
    }

    // Count filled fields to approximate step
    let step = 1; // default at welcome
    if (companySet) step = 3; // company set → past step 2
    else if (client.city) step = 2; // city set → at step 2
    if (phoneSet && step < 3) step = 3; // phone set → past step 3

    return NextResponse.json({ completed: false, step });
  } catch (err) {
    console.error("Onboarding GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { step, data } = body as { step: number; data: Record<string, unknown> };

    if (!step || !data) {
      return NextResponse.json({ error: "step and data are required" }, { status: 400 });
    }

    switch (step) {
      case 1:
        // Welcome step — no data to save, just advance
        return NextResponse.json({ success: true, nextStep: 2 });

      case 2: {
        // Company info
        const updateData: Record<string, unknown> = {};
        if (data.company) updateData.company = data.company;
        if (data.city) updateData.city = data.city;

        if (Object.keys(updateData).length > 0) {
          await db.client.update({
            where: { id: auth.id },
            data: updateData,
          });
        }
        return NextResponse.json({ success: true, nextStep: 3 });
      }

      case 3: {
        // Contact details
        const updateData: Record<string, unknown> = {};
        if (data.phone) updateData.phone = data.phone as string;

        if (Object.keys(updateData).length > 0) {
          await db.client.update({
            where: { id: auth.id },
            data: updateData,
          });
        }
        return NextResponse.json({ success: true, nextStep: 4 });
      }

      case 4: {
        // Project goals — save as branding notes since schema has no dedicated fields
        const noteLines: string[] = [];
        if (data.serviceInterest) {
          const services = Array.isArray(data.serviceInterest) ? data.serviceInterest.join(", ") : data.serviceInterest;
          noteLines.push(`Services: ${services}`);
        }
        if (data.projectBudget) noteLines.push(`Budget: ${data.projectBudget}`);
        if (data.projectTimeline) noteLines.push(`Timeline: ${data.projectTimeline}`);

        if (noteLines.length > 0) {
          // Get or create a branding submission with these notes
          const client = await db.client.findUnique({ where: { id: auth.id }, select: { company: true, name: true } });
          const companyName = (client?.company || client?.name || "").toString();
          const notes = noteLines.join(" | ");

          // Check if a branding submission without orderId exists
          const existing = await db.brandingSubmission.findFirst({
            where: { clientId: auth.id, orderId: null },
          });

          if (existing) {
            await db.brandingSubmission.update({
              where: { id: existing.id },
              data: { logoNote: notes },
            });
          } else {
            await db.brandingSubmission.create({
              data: {
                clientId: auth.id,
                companyName: companyName || "Pending",
                logoNote: notes,
              },
            });
          }
        }

        return NextResponse.json({ success: true, nextStep: 5 });
      }

      case 5: {
        // Mark onboarding complete — ensure company + phone are set as markers
        // Only update if values not already present
        const client = await db.client.findUnique({
          where: { id: auth.id },
          select: { company: true, phone: true, name: true },
        });

        const updateData: Record<string, unknown> = {};
        if (!client?.company) updateData.company = data.company || client?.name || "Onboarded";
        if (!client?.phone) updateData.phone = data.phone || "Not provided";

        if (Object.keys(updateData).length > 0) {
          await db.client.update({
            where: { id: auth.id },
            data: updateData,
          });
        }

        return NextResponse.json({ success: true, nextStep: 6, completed: true });
      }

      default:
        return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }
  } catch (err) {
    console.error("Onboarding POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
