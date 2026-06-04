import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio — Our Work & Client Success Stories | KVL TECH",
  description:
    "KVL TECH ke delivered projects dekhein — restaurants, schools, hospitals, e-commerce aur aur bhi. Real client case studies aur live website demos.",
  keywords: "KVL TECH portfolio, website examples India, client work, delivered projects, website case studies",
  openGraph: {
    title: "Portfolio — Our Work & Client Success Stories | KVL TECH",
    description:
      "Humara kaam dekhein — restaurants, schools, hospitals ke liye delivered websites aur software. Real results, real clients.",
    url: "https://kvlbusinesssolutions.com/portfolio",
    siteName: "KVL TECH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio — Our Work & Client Success Stories | KVL TECH",
    description: "Humara kaam dekhein — real clients, real results.",
  },
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
