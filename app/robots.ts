import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/client-portal", "/client-portal/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
