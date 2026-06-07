import type { Metadata } from "next";

// ISR: regenerate every hour
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Blog — Business Tips, Tech Insights & Digital Growth | KVL TECH",
  description:
    "KVL TECH blog — business growth tips, website tips, digital marketing strategies aur tech insights. Apna business online kaise badhayein, ye jaanein.",
  keywords: "KVL TECH blog, business tips Hindi, website tips, digital marketing India, online business growth",
  openGraph: {
    title: "Blog — Business Tips & Digital Growth | KVL TECH",
    description:
      "Business growth tips, website tips, digital marketing strategies aur tech insights — KVL TECH blog pe.",
    url: "https://kvlbusinesssolutions.com/blog",
    siteName: "KVL TECH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Business Tips & Digital Growth | KVL TECH",
    description: "Business growth tips aur digital marketing strategies — KVL TECH blog pe.",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
