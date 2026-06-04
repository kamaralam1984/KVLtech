import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ExitIntentPopup } from "@/components/ui/ExitIntentPopup";
import { SocialProofToast } from "@/components/ui/SocialProofToast";
import { UrgencyBanner } from "@/components/ui/UrgencyBanner";
import { LanguageProvider } from "@/contexts/LanguageContext";
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
    images: [{ url: "https://kvlbusinesssolutions.com/api/og?title=Premium Digital Business Solutions&subtitle=Websites, Software, AI and Automation", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KVL TECH — Build, Automate & Scale Your Business",
    description: "Premium digital solutions for modern businesses",
    images: ["https://kvlbusinesssolutions.com/api/og?title=Premium Digital Business Solutions&subtitle=Websites, Software, AI and Automation"],
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
      style={{ '--banner-h': '40px' } as React.CSSProperties}
    >
      <head>
        {/* Preconnect to font origins for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preconnect to Razorpay so checkout loads faster */}
        <link rel="preconnect" href="https://checkout.razorpay.com" />
        {/* DNS prefetch for Razorpay and WhatsApp */}
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://api.razorpay.com" />
        <link rel="dns-prefetch" href="https://wa.me" />
        <link rel="dns-prefetch" href="https://web.whatsapp.com" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <LanguageProvider>
          <UrgencyBanner />
          <SocialProofToast />
          <ExitIntentPopup />
          <ThemeProvider>{children}</ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
