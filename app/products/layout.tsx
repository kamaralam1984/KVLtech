import type { Metadata } from "next";

// ISR: regenerate every hour
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Products — Ready-to-Launch Websites & Software | KVL TECH",
  description:
    "12+ ready-made websites aur software solutions — restaurant, school, hospital, e-commerce, hotel aur aur bhi. Buy, rent ya customize karein apni company branding ke saath.",
  keywords: "ready made website, restaurant website, school management system, hospital software, ecommerce website India, KVL TECH products",
  openGraph: {
    title: "Products — Ready-to-Launch Websites & Software | KVL TECH",
    description:
      "12+ ready-made digital products — buy, rent ya customize karein. Fully branded with your company name.",
    url: "https://kvlbusinesssolutions.com/products",
    siteName: "KVL TECH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Products — Ready-to-Launch Websites & Software | KVL TECH",
    description: "12+ ready-made websites aur software solutions. Buy, rent ya customize karein.",
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
