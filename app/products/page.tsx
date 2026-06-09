"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight, Star, SlidersHorizontal, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { ProductRecommender } from "@/components/ui/ProductRecommender";
import { useLanguage } from "@/contexts/LanguageContext";

const CATEGORIES = [
  { value: "all", label: "All Products" },
  { value: "WEBSITE", label: "Websites" },
  { value: "SOFTWARE", label: "Software" },
  { value: "SAAS", label: "SaaS" },
  { value: "MOBILE", label: "Mobile Apps" },
];

const CAT_LABEL: Record<string, string> = {
  WEBSITE: "Website", SOFTWARE: "Software", SAAS: "SaaS", MOBILE: "Mobile",
};

export default function ProductsPage() {
  const { t, formatPrice } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(data => { if (data.products) setProducts(data.products); })
      .catch(() => {})
      .finally(() => setProductsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCategory !== "all") list = list.filter(p => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        (CAT_LABEL[p.category] || "").toLowerCase().includes(q)
      );
    }
    if (sortBy === "price-asc") list.sort((a, b) => a.basicPrice - b.basicPrice);
    if (sortBy === "price-desc") list.sort((a, b) => b.basicPrice - a.basicPrice);
    return list;
  }, [products, activeCategory, search, sortBy]);

  return (
    <>
      <Navbar />
      <main className="pt-[104px]">
        {/* Hero */}
        <section className="py-16 lg:py-20 bg-[var(--color-bg-secondary)] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[var(--color-gold)]/5 blur-[80px]" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-2xl mx-auto text-center mb-10">
              <div className="flex justify-center mb-6">
                <Image src="/kvl-tech-logo-tight.png" alt="KVL TECH" width={160} height={60} className="h-[60px] w-auto object-contain dark:hidden" priority />
                <Image src="/kvl-tech-logo-white.png" alt="KVL TECH" width={160} height={60} className="h-[60px] w-auto object-contain hidden dark:block" priority />
              </div>
              <div className="section-badge mx-auto">Our Products</div>
              <h1 className="font-display font-bold text-4xl sm:text-5xl text-[var(--color-text)] mb-4 leading-tight">
                <span className="text-gold-gradient">Ready-to-Launch</span>{" "}
                Digital Solutions
              </h1>
              <p className="text-[var(--color-text-secondary)] text-lg">
                {t.products_subtitle}
              </p>
            </div>

            {/* Search bar */}
            <div className="max-w-xl mx-auto relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search website, software, hospital, school..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-gold)] transition-all shadow-[var(--shadow-card)]"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X size={16} className="text-[var(--color-text-muted)]" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Filters + Grid */}
        <section className="py-12 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              {/* Category tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeCategory === cat.value
                        ? "bg-[var(--color-navy)] text-white shadow-sm"
                        : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Sort + count */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--color-text-muted)]">
                  {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-2 border border-[var(--color-border)] rounded-xl px-3 py-2">
                  <SlidersHorizontal size={14} className="text-[var(--color-text-muted)]" />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="text-sm text-[var(--color-text-secondary)] bg-transparent outline-none cursor-pointer"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products grid */}
            <AnimatePresence mode="wait">
              {productsLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                  <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-[var(--color-text-muted)]">Loading products...</p>
                </motion.div>
              ) : filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <p className="text-[var(--color-text-muted)] text-lg mb-4">{search ? `No products found for "${search}"` : "No products available."}</p>
                  <button onClick={() => { setSearch(""); setActiveCategory("all"); }} className="btn-outline">
                    Clear filters
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={activeCategory + search}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filtered.map((product, i) => (
                    <motion.div
                      key={product.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.4 }}
                      className="h-full"
                    >
                      <GlassCard
                        variant="dark"
                        tilt
                        lift
                        glow={product.tag === "Most Popular" || product.tag === "Best Seller"}
                        className="h-full flex flex-col group"
                      >
                        {/* Photo */}
                        <div className="h-48 relative overflow-hidden rounded-t-2xl">
                          <Image
                            src={product.photo}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105 animate-float-slow"
                            sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          {product.tag && (
                            <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold bg-[var(--color-gold)] text-white rounded-full">
                              {product.tag}
                            </span>
                          )}
                          <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-semibold bg-black/40 text-white rounded-full backdrop-blur-sm">
                            {CAT_LABEL[product.category] || product.category}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="font-display font-bold text-lg text-[var(--color-text)] mb-1 leading-tight">
                            {product.name}
                          </h3>
                          <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed flex-1">
                            {product.tagline}
                          </p>

                          {/* Highlights */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {(product.highlights || []).slice(0, 2).map((h: string) => (
                              <span key={h} className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
                                <Star size={9} fill="currentColor" /> {h}
                              </span>
                            ))}
                          </div>

                          {/* Pricing */}
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="p-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-center">
                              <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5">Basic</p>
                              <p className="font-display font-bold text-sm text-[var(--color-text)]">
                                {formatPrice(product.basicPrice)}
                              </p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-[var(--color-gold)]/8 border border-[var(--color-gold)]/20 text-center">
                              <p className="text-[10px] text-[var(--color-gold)] mb-0.5">{t.product_premium}</p>
                              <p className="font-display font-bold text-sm text-[var(--color-gold)]">
                                {formatPrice(product.premiumPrice)}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Link
                              href={`/products/${product.slug}`}
                              className="flex-1 py-2.5 text-center text-sm font-semibold rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-navy)] hover:text-[var(--color-navy)] transition-all"
                            >
                              View Details
                            </Link>
                            <Link
                              href={`/products/${product.slug}#buy`}
                              className="flex-1 py-2.5 text-center text-sm font-semibold rounded-xl bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-light)] transition-all flex items-center justify-center gap-1.5"
                            >
                              Buy Now <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
          <div className="max-w-3xl mx-auto text-center px-4">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--color-text)] mb-3">
              Can&apos;t find what you need?
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              We build custom solutions for any business. Tell us your requirements and
              we&apos;ll deliver exactly what you need.
            </p>
            <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
              Request Custom Solution <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
      <ProductRecommender />
    </>
  );
}
