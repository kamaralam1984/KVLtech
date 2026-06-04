import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal — Track Orders & Manage Your Project | KVL TECH",
  description:
    "KVL TECH client portal — apne orders track karein, branding submit karein, support tickets raise karein aur project updates real-time mein dekhein.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Client Portal | KVL TECH",
    description: "Apne orders track karein aur project manage karein — KVL TECH client portal.",
    url: "https://kvlbusinesssolutions.com/client-portal",
    siteName: "KVL TECH",
    type: "website",
  },
};

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
