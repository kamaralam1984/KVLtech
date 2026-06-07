import type { Metadata } from "next";

// ISR: regenerate every hour (KB articles update periodically)
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Knowledge Base — Guides & Help Articles | KVL TECH",
  description:
    "KVL TECH Knowledge Base — setup guides, troubleshooting articles, aur FAQs jo aapko apna digital solution manage karne mein help karein.",
  keywords: "KVL TECH help, knowledge base, setup guide, troubleshooting, FAQ",
  openGraph: {
    title: "Knowledge Base — Guides & Help Articles | KVL TECH",
    description:
      "Setup guides, troubleshooting articles, aur FAQs — KVL TECH Knowledge Base pe.",
    url: "https://kvlbusinesssolutions.com/kb",
    siteName: "KVL TECH",
    type: "website",
  },
};

export default function KBLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
