import { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/client-portal", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
