import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ExitIntentPopup } from "@/components/ui/ExitIntentPopup";
import { SocialProofToast } from "@/components/ui/SocialProofToast";
import { UrgencyBanner } from "@/components/ui/UrgencyBanner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KVL TECH — Build, Automate & Scale Your Business With Confidence",
  description:
    "KVL TECH provides premium websites, software, SaaS, marketing automation, and AI solutions for modern businesses. Buy, rent, or customize — full branding included.",
  keywords:
    "website development, software solutions, business automation, AI tools, SaaS, marketing automation, KVL TECH",
  icons: {
    icon: "/kvl-tech-logo.png",
    apple: "/kvl-tech-logo.png",
  },
  openGraph: {
    title: "KVL TECH — Premium Digital Business Solutions",
    description:
      "Websites, Software, SaaS, Marketing, Automation and AI Solutions Built For Modern Businesses.",
    url: "https://kvlbusinesssolutions.com",
    siteName: "KVL TECH",
    type: "website",
    images: [{ url: "https://kvlbusinesssolutions.com/kvl-tech-logo.png", width: 1320, height: 660 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KVL TECH — Build, Automate & Scale Your Business",
    description: "Premium digital solutions for modern businesses",
    images: ["https://kvlbusinesssolutions.com/kvl-tech-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col antialiased">
        <UrgencyBanner />
        <ExitIntentPopup />
        <SocialProofToast />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
