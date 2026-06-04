import { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com";

const CITY_SLUGS = [
  "mumbai", "delhi", "bangalore", "hyderabad", "chennai",
  "pune", "kolkata", "ahmedabad", "jaipur", "surat",
  "lucknow", "noida", "gurgaon", "chandigarh", "indore",
];

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

  const cityPages = CITY_SLUGS.map(city => ({
    url: `${BASE}/city/${city}`,
    priority: 0.8,
    changeFrequency: "monthly" as const,
  }));

  return [...staticPages, ...productPages, ...cityPages].map(p => ({
    url: p.url,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
