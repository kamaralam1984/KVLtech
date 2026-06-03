import { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${BASE}/products`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${BASE}/pricing`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${BASE}/about`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${BASE}/portfolio`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${BASE}/contact`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${BASE}/blog`, priority: 0.8, changeFrequency: "weekly" as const },
  ];

  const productPages = PRODUCTS.map(p => ({
    url: `${BASE}/products/${p.slug}`,
    priority: 0.85,
    changeFrequency: "monthly" as const,
  }));

  return [...staticPages, ...productPages].map(p => ({
    url: p.url,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
