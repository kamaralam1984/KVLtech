import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// PUBLIC endpoint — no auth required
// Used by client portal and invoices to dynamically apply branding
export async function GET() {
  try {
    const config = await db.whiteLabelConfig.findFirst({
      where: { agencyId: null, isActive: true },
    });

    return NextResponse.json({
      companyName: config?.companyName || "KVL TECH",
      logo: config?.logo || "/kvl-tech-logo.png",
      primaryColor: config?.primaryColor || "#C9A227",
      secondaryColor: config?.secondaryColor || "#0B1437",
      footerText: config?.footerText || "KVL Business Solutions",
      supportEmail: config?.supportEmail || "support@kvlbusinesssolutions.com",
    });
  } catch {
    return NextResponse.json({
      companyName: "KVL TECH",
      logo: "/kvl-tech-logo.png",
      primaryColor: "#C9A227",
      secondaryColor: "#0B1437",
      footerText: "KVL Business Solutions",
      supportEmail: "support@kvlbusinesssolutions.com",
    });
  }
}
