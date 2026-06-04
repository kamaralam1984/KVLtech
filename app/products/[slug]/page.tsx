import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { getProduct, getRelated, PRODUCTS } from "@/lib/products";
import { ProductDetail } from "./ProductDetail";

export function generateStaticParams() {
  return PRODUCTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} — Buy, Rent or Customize | KVL TECH`,
    description: product.description,
    openGraph: {
      title: `${product.name} | KVL TECH`,
      description: product.description,
      url: `https://kvlbusinesssolutions.com/products/${slug}`,
      siteName: "KVL TECH",
      images: [{ url: `https://kvlbusinesssolutions.com${product.photo}`, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | KVL TECH`,
      description: product.description,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelated(slug, product.category);

  return (
    <>
      <Navbar />
      <main className="pt-[104px]">
        <ProductDetail product={product} related={related} />
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
    </>
  );
}
