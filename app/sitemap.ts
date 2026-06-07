import { MetadataRoute } from "next";
import { db } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kvlbusinesssolutions.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    // Home
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    // Products / Pricing
    { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    // Solutions
    { url: `${SITE_URL}/solutions/web-development`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/solutions/mobile-apps`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/solutions/digital-marketing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/solutions/cloud-services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    // Core pages
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/portfolio`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    // Utility pages
    { url: `${SITE_URL}/help`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await db.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
    productPages = products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch {}

  // Dynamic blog post pages
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await db.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });
    blogPages = posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {}

  return [...staticPages, ...productPages, ...blogPages];
}
