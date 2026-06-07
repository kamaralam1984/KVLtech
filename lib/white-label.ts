import { db } from "@/lib/db"

export async function getWhiteLabelConfig() {
  try {
    const config = await db.whiteLabelConfig.findFirst({
      where: { agencyId: null, isActive: true }
    })
    return {
      companyName: config?.companyName || "KVL TECH",
      logo: config?.logo || "/kvl-tech-logo.png",
      primaryColor: config?.primaryColor || "#C9A227",
      secondaryColor: config?.secondaryColor || "#0B1437",
      footerText: config?.footerText || "KVL Business Solutions",
      supportEmail: config?.supportEmail || "support@kvlbusinesssolutions.com",
      emailFromName: config?.emailFromName || "KVL TECH",
      emailFromAddr: config?.emailFromAddr || "noreply@kvlbusinesssolutions.com",
    }
  } catch {
    return {
      companyName: "KVL TECH",
      logo: "/kvl-tech-logo.png",
      primaryColor: "#C9A227",
      secondaryColor: "#0B1437",
      footerText: "KVL Business Solutions",
      supportEmail: "support@kvlbusinesssolutions.com",
      emailFromName: "KVL TECH",
      emailFromAddr: "noreply@kvlbusinesssolutions.com",
    }
  }
}
