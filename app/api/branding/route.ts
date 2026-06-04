import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user || user.type !== "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { orderId, companyName, tagline, primaryColor, secondaryColor,
      fontPreference, phone, email, address, website, logoNote } = body;

    if (!companyName || !phone || !email) {
      return NextResponse.json({ error: "Company name, phone and email are required." }, { status: 400 });
    }

    // If orderId given, verify it belongs to this client
    if (orderId) {
      const order = await db.order.findFirst({ where: { id: orderId, clientId: user.id } });
      if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Upsert: by orderId if provided, else by clientId with null orderId
    const brandingData = {
      companyName, tagline,
      primaryColor: primaryColor || "#C9A227",
      secondaryColor: secondaryColor || "#0F172A",
      fontPreference, phone, email, address, website, logoNote,
      status: "SUBMITTED" as const,
    };

    let branding;
    if (orderId) {
      // Link to specific order — upsert by orderId
      branding = await db.brandingSubmission.upsert({
        where: { orderId },
        create: { ...brandingData, orderId, clientId: user.id },
        update: brandingData,
      });
    } else {
      // No order — find latest for this client or create new
      const existing = await db.brandingSubmission.findFirst({
        where: { clientId: user.id },
        orderBy: { createdAt: "desc" },
      });
      if (existing) {
        branding = await db.brandingSubmission.update({ where: { id: existing.id }, data: brandingData });
      } else {
        // Use raw SQL to insert without orderId (Prisma 7 requires relation even on optional fields)
        const id = `brand_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        await db.$executeRaw`
          INSERT INTO branding_submissions
            (id, "clientId", "companyName", tagline, "primaryColor", "secondaryColor", "fontPreference", phone, email, address, website, "logoNote", status, "createdAt", "updatedAt")
          VALUES
            (${id}, ${user.id}, ${companyName}, ${tagline ?? null}, ${primaryColor || "#C9A227"}, ${secondaryColor || "#0F172A"}, ${fontPreference ?? null}, ${phone}, ${email}, ${address ?? null}, ${website ?? null}, ${logoNote ?? null}, 'SUBMITTED'::"BrandingStatus", NOW(), NOW())
        `;
        branding = await db.brandingSubmission.findUnique({ where: { id } });
      }
    }

    // Create notification for client
    await db.notification.create({
      data: {
        clientId: user.id,
        title: "Branding details received!",
        body: `${companyName} ki branding details hamaari team ne receive kar li hain.`,
        type: "BRANDING",
        color: "#C9A227",
      },
    });

    return NextResponse.json({ success: true, branding });
  } catch (err) {
    console.error("Branding submit error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (!user || user.type !== "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const brandings = await db.brandingSubmission.findMany({
      where: { clientId: user.id },
      include: { order: { select: { orderNumber: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ brandings });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
