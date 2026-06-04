import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact KVL TECH — Get a Free Demo & Consultation | +91 9942000413",
  description:
    "KVL TECH se contact karein — free demo book karein, pricing jaanein ya apna project discuss karein. Call, WhatsApp, ya online form se hum se baat karein.",
  keywords: "contact KVL TECH, book demo, website development consultation, free demo, KVL business solutions contact",
  openGraph: {
    title: "Contact KVL TECH — Free Demo & Consultation",
    description:
      "Free demo book karein ya project discuss karein — KVL TECH team 24/7 available hai aapki help ke liye.",
    url: "https://kvlbusinesssolutions.com/contact",
    siteName: "KVL TECH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact KVL TECH — Free Demo & Consultation",
    description: "Free demo book karein ya project discuss karein — KVL TECH team 24/7 available hai.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
