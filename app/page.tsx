import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustedBy } from "@/components/sections/TrustedBy";

// Shared skeleton fallback for below-the-fold sections
const SectionSkeleton = () => (
  <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg mx-4 my-6" />
);

// Lazy-loaded below-the-fold sections
const ProductsEcosystem = dynamic(
  () =>
    import("@/components/sections/ProductsEcosystem").then((m) => ({
      default: m.ProductsEcosystem,
    })),
  { loading: () => <SectionSkeleton />, ssr: true }
);

const WhyKVLTech = dynamic(
  () =>
    import("@/components/sections/WhyKVLTech").then((m) => ({
      default: m.WhyKVLTech,
    })),
  { loading: () => <SectionSkeleton />, ssr: true }
);

const Portfolio = dynamic(
  () =>
    import("@/components/sections/Portfolio").then((m) => ({
      default: m.Portfolio,
    })),
  { loading: () => <SectionSkeleton />, ssr: true }
);

const Testimonials = dynamic(
  () =>
    import("@/components/sections/Testimonials").then((m) => ({
      default: m.Testimonials,
    })),
  { loading: () => <SectionSkeleton />, ssr: true }
);

const Pricing = dynamic(
  () =>
    import("@/components/sections/Pricing").then((m) => ({
      default: m.Pricing,
    })),
  { loading: () => <SectionSkeleton />, ssr: true }
);

const CTASection = dynamic(
  () =>
    import("@/components/sections/CTASection").then((m) => ({
      default: m.CTASection,
    })),
  { loading: () => <SectionSkeleton />, ssr: true }
);

import { LazyClientWidgets } from "@/components/ui/LazyClientWidgets";

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
      <LazyClientWidgets />
    </>
  );
}
