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

    if (!orderId || !companyName || !phone || !email) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    // Verify order belongs to this client
    const order = await db.order.findFirst({
      where: { id: orderId, clientId: user.id },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const branding = await db.brandingSubmission.upsert({
      where: { orderId },
      create: {
        orderId,
        clientId: user.id,
        companyName,
        tagline,
        primaryColor: primaryColor || "#C9A227",
        secondaryColor: secondaryColor || "#0F172A",
        fontPreference,
        phone,
        email,
        address,
        website,
        logoNote,
      },
      update: {
        companyName, tagline, primaryColor, secondaryColor,
        fontPreference, phone, email, address, website, logoNote,
        status: "SUBMITTED",
      },
    });

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
