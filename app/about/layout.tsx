import type { Metadata } from "next";

// ISR: regenerate every 24 hours (relatively static content)
export const revalidate = 86400

export const metadata: Metadata = {
  title: "About KVL TECH — Our Story, Mission & Team | kvlbusinesssolutions.com",
  description:
    "KVL TECH ke baare mein jaanein — humari journey, mission, aur team jo businesses ko digital success dilati hai. Premium websites, software aur AI solutions ke saath aapka growth partner.",
  keywords: "about KVL TECH, KVL business solutions, digital agency India, website development company, software company",
  openGraph: {
    title: "About KVL TECH — Our Story, Mission & Team",
    description:
      "KVL TECH — India ka trusted digital solutions partner. Websites, software, AI aur automation se businesses ka digital future shape karte hain.",
    url: "https://kvlbusinesssolutions.com/about",
    siteName: "KVL TECH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About KVL TECH — Our Story, Mission & Team",
    description: "KVL TECH ke baare mein jaanein — humari journey, mission aur team.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
