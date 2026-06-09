"use client";

import { motion } from "framer-motion";
import {
  Globe, Cpu, Smartphone, BarChart3, Bot, ShoppingCart,
  GraduationCap, Hospital, Building2, Utensils, ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

// Category → icon + color mapping
const CAT_META: Record<string, { icon: any; color: string }> = {
  WEBSITE:  { icon: Globe,         color: "#0891B2" },
  SOFTWARE: { icon: Cpu,           color: "#7C3AED" },
  SAAS:     { icon: BarChart3,     color: "#16A34A" },
  MOBILE:   { icon: Smartphone,    color: "#F59E0B" },
};

// Fallback hardcoded products (shown if DB has no featured products yet)
const FALLBACK_PRODUCTS = [
  { icon: Utensils,     name: "Restaurant Website",        tag: "Most Popular", basicINR: 12999, premiumINR: 24999, category: "Food & Hospitality", photo: "/photos/restaurant.jpg",    accentColor: "#FF6B35", slug: "restaurant-website" },
  { icon: GraduationCap, name: "School Management System", tag: "Best Seller",  basicINR: 29999, premiumINR: 59999, category: "Education",          photo: "/photos/school.jpg",         accentColor: "#16A34A", slug: "school-management-system" },
  { icon: Hospital,     name: "Hospital Management System", tag: "Enterprise",  basicINR: 49999, premiumINR: 99999, category: "Healthcare",          photo: "/photos/hospital.jpg",       accentColor: "#0891B2", slug: "hospital-management-system" },
  { icon: ShoppingCart, name: "E-commerce Platform",        tag: "New",         basicINR: 19999, premiumINR: 39999, category: "Retail",              photo: "/photos/fashion.jpg",        accentColor: "#7C3AED", slug: "e-commerce-platform" },
  { icon: Building2,    name: "Real Estate Website",         tag: "Premium",    basicINR: 22999, premiumINR: 44999, category: "Real Estate",         photo: "/photos/office-meeting.jpg", accentColor: "#C9A227", slug: "real-estate-website" },
  { icon: Globe,        name: "Hotel Booking Website",       tag: "Popular",    basicINR: 24999, premiumINR: 49999, category: "Hospitality",         photo: "/photos/person-laptop.jpg",  accentColor: "#0F172A", slug: "hotel-booking-website" },
];

export function ProductsEcosystem() {
  const { t, formatPrice } = useLanguage();
  const [dbProducts, setDbProducts] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/products?featured=true")
      .then(r => r.json())
      .then(d => { if (d.products?.length) setDbProducts(d.products); })
      .catch(() => {});
  }, []);

  // Map DB products to display shape; fallback to hardcoded if none featured in DB
  const featuredProducts = dbProducts
    ? dbProducts.map(p => {
        const meta = CAT_META[p.category] || { icon: Globe, color: "#0F172A" };
        return {
          icon: meta.icon,
          name: p.name,
          tag: p.tag || "",
          basicINR: p.basicPrice,
          premiumINR: p.premiumPrice,
          category: p.tagline || p.category,
          photo: p.photo || "/photos/office-meeting.jpg",
          accentColor: meta.color,
          slug: p.slug,
          demoUrl: p.demoUrl || null,
        };
      })
    : FALLBACK_PRODUCTS;

  const categories = [
    { icon: Globe, title: t.cat_web_t, desc: t.cat_web_d, color: "#0F172A", count: t.cat_web_c, href: "/products/websites" },
    { icon: Cpu, title: t.cat_soft_t, desc: t.cat_soft_d, color: "#16A34A", count: t.cat_soft_c, href: "/products/software" },
    { icon: BarChart3, title: t.cat_saas_t, desc: t.cat_saas_d, color: "#7C3AED", count: t.cat_saas_c, href: "/products/saas" },
    { icon: Smartphone, title: t.cat_mobile_t, desc: t.cat_mobile_d, color: "#0891B2", count: t.cat_mobile_c, href: "/products/mobile" },
    { icon: BarChart3, title: t.cat_mktg_t, desc: t.cat_mktg_d, color: "#DC2626", count: t.cat_mktg_c, href: "/solutions/marketing" },
    { icon: Bot, title: t.cat_ai_t, desc: t.cat_ai_d, color: "#C9A227", count: t.cat_ai_c, href: "/solutions/ai" },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="section-badge mx-auto">{t.eco_badge}</div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[var(--color-text)] mb-4">
            {t.eco_title}{" "}
            <span className="text-gold-gradient">{t.eco_title_gold}</span>
          </h2>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
            {t.eco_sub}
          </p>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <Link
                href={cat.href}
                className="card flex flex-col items-center text-center p-5 gap-3 group cursor-pointer block"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                  style={{ background: `${cat.color}15` }}
                >
                  <cat.icon size={22} style={{ color: cat.color }} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[var(--color-text)] leading-tight mb-1">{cat.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{cat.desc}</p>
                </div>
                <span className="text-xs font-medium text-[var(--color-gold)] mt-auto">{cat.count}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Featured products grid */}
        <div className="mb-8">
          <h3 className="font-display font-semibold text-xl text-[var(--color-text)] mb-6">
            {t.eco_featured}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProducts.map((product, i) => (
              <motion.div
                key={product.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <div className="card group cursor-pointer relative overflow-hidden">
                  {/* Image */}
                  <div className="h-40 relative overflow-hidden">
                    <Image
                      src={product.photo}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/20">
                      {product.tag}
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: product.accentColor }} />
                  </div>

                  <div className="p-5">
                    {/* Icon + name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{ background: `${product.accentColor}18` }}>
                        <product.icon size={18} style={{ color: product.accentColor }} />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--color-text)] text-sm leading-tight">{product.name}</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">{product.category}</p>
                      </div>
                    </div>

                    {/* Pricing — converted to user's currency */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="p-2.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                        <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5">{t.product_basic}</p>
                        <p className="font-bold text-sm text-[var(--color-text)]">{formatPrice(product.basicINR)}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[var(--color-gold)]/8 border border-[var(--color-gold)]/20">
                        <p className="text-[10px] text-[var(--color-gold)] mb-0.5">{t.product_premium}</p>
                        <p className="font-bold text-sm text-[var(--color-gold)]">{formatPrice(product.premiumINR)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={(product as any).demoUrl || `/products/${product.slug}`}
                        target={(product as any).demoUrl ? "_blank" : undefined}
                        rel={(product as any).demoUrl ? "noopener noreferrer" : undefined}
                        className="flex-1 py-2 text-center text-xs font-semibold rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-navy)] hover:text-[var(--color-navy)] transition-all"
                      >
                        {t.eco_view_demo}
                      </Link>
                      <Link
                        href={`/products/${product.slug}#buy`}
                        className="flex-1 py-2 text-center text-xs font-semibold rounded-lg bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-light)] transition-all"
                      >
                        {t.btn_buy_now}
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/products" className="btn-outline inline-flex items-center gap-2">
            {t.eco_explore} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
