import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustedBy } from "@/components/sections/TrustedBy";
import { ProductsEcosystem } from "@/components/sections/ProductsEcosystem";
import { WhyKVLTech } from "@/components/sections/WhyKVLTech";
import { Portfolio } from "@/components/sections/Portfolio";
import { Testimonials } from "@/components/sections/Testimonials";
import { Pricing } from "@/components/sections/Pricing";
import { CTASection } from "@/components/sections/CTASection";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="w-full overflow-x-hidden">
        <Hero />
        <TrustedBy />
        <ProductsEcosystem />
        <WhyKVLTech />
        <Portfolio />
        <Testimonials />
        <Pricing />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
    </>
  );
}
