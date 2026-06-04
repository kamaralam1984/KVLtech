import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Basic, Premium & Custom Plans | KVL TECH",
  description:
    "KVL TECH ke transparent pricing plans dekhein — Basic se lekar Custom tak. Restaurant websites ₹12,999 se, School systems ₹29,999 se. No hidden charges.",
  keywords: "KVL TECH pricing, website development cost India, software pricing, basic premium custom plans, affordable website",
  openGraph: {
    title: "Pricing — Basic, Premium & Custom Plans | KVL TECH",
    description:
      "Transparent pricing — Basic, Premium ya Custom plan choose karein. Restaurant ₹12,999 se, School ₹29,999 se. No hidden charges.",
    url: "https://kvlbusinesssolutions.com/pricing",
    siteName: "KVL TECH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — Basic, Premium & Custom Plans | KVL TECH",
    description: "Transparent pricing — Basic se Custom tak. No hidden charges.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
