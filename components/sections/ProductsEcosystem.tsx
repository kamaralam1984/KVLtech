"use client";

import { motion } from "framer-motion";
import {
  Globe, Cpu, Smartphone, BarChart3, Bot, ShoppingCart,
  GraduationCap, Hospital, Building2, Utensils, ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    icon: Globe,
    title: "Website Development",
    desc: "Stunning, fast & SEO-friendly websites that convert visitors into customers.",
    color: "#0F172A",
    count: "25+ templates",
    href: "/products/websites",
  },
  {
    icon: Cpu,
    title: "Software Solutions",
    desc: "Custom software to automate and streamline your business operations.",
    color: "#16A34A",
    count: "15+ solutions",
    href: "/products/software",
  },
  {
    icon: BarChart3,
    title: "SaaS Products",
    desc: "Ready-to-use SaaS platforms to boost productivity and grow faster.",
    color: "#7C3AED",
    count: "10+ products",
    href: "/products/saas",
  },
  {
    icon: Smartphone,
    title: "Mobile Applications",
    desc: "Android & iOS apps that engage your customers and grow your brand.",
    color: "#0891B2",
    count: "20+ apps",
    href: "/products/mobile",
  },
  {
    icon: BarChart3,
    title: "Marketing Automation",
    desc: "Automate marketing, generate leads, and close deals on autopilot.",
    color: "#DC2626",
    count: "Full suite",
    href: "/solutions/marketing",
  },
  {
    icon: Bot,
    title: "AI Business Tools",
    desc: "AI-powered tools to scale your operations faster and smarter.",
    color: "#C9A227",
    count: "8+ tools",
    href: "/solutions/ai",
  },
];

const featuredProducts = [
  {
    icon: Utensils,
    name: "Restaurant Website",
    tag: "Most Popular",
    basic: "₹12,999",
    premium: "₹24,999",
    category: "Food & Hospitality",
    photo: "/photos/restaurant.jpg",
    accentColor: "#FF6B35",
  },
  {
    icon: GraduationCap,
    name: "School Management System",
    tag: "Best Seller",
    basic: "₹29,999",
    premium: "₹59,999",
    category: "Education",
    photo: "/photos/school.jpg",
    accentColor: "#16A34A",
  },
  {
    icon: Hospital,
    name: "Hospital Management System",
    tag: "Enterprise",
    basic: "₹49,999",
    premium: "₹99,999",
    category: "Healthcare",
    photo: "/photos/hospital.jpg",
    accentColor: "#0891B2",
  },
  {
    icon: ShoppingCart,
    name: "E-commerce Platform",
    tag: "New",
    basic: "₹19,999",
    premium: "₹39,999",
    category: "Retail",
    photo: "/photos/fashion.jpg",
    accentColor: "#7C3AED",
  },
  {
    icon: Building2,
    name: "Real Estate Website",
    tag: "Premium",
    basic: "₹22,999",
    premium: "₹44,999",
    category: "Real Estate",
    photo: "/photos/office-meeting.jpg",
    accentColor: "#C9A227",
  },
  {
    icon: Globe,
    name: "Hotel Booking Website",
    tag: "Popular",
    basic: "₹24,999",
    premium: "₹49,999",
    category: "Hospitality",
    photo: "/photos/person-laptop.jpg",
    accentColor: "#0F172A",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

export function ProductsEcosystem() {
  return (
    <section className="py-20 lg:py-28 bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="section-badge mx-auto">Our Solutions</div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[var(--color-text)] mb-4">
            Everything You Need to{" "}
            <span className="text-gold-gradient">Grow Your Business</span>
          </h2>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
            One Platform, Unlimited Possibilities. Buy, rent, or customize any solution
            — fully branded with your company identity.
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
            Featured Products
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
                    {/* Tag badge */}
                    <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/20">
                      {product.tag}
                    </span>
                    {/* Accent line */}
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

                  {/* Pricing */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-2.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                      <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5">Basic</p>
                      <p className="font-bold text-sm text-[var(--color-text)]">{product.basic}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--color-gold)]/8 border border-[var(--color-gold)]/20">
                      <p className="text-[10px] text-[var(--color-gold)] mb-0.5">Premium</p>
                      <p className="font-bold text-sm text-[var(--color-gold)]">{product.premium}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/products/${product.name.toLowerCase().replace(/\s+/g, "-")}`}
                      className="flex-1 py-2 text-center text-xs font-semibold rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-navy)] hover:text-[var(--color-navy)] transition-all"
                    >
                      View Demo
                    </Link>
                    <Link
                      href={`/products/${product.name.toLowerCase().replace(/\s+/g, "-")}#buy`}
                      className="flex-1 py-2 text-center text-xs font-semibold rounded-lg bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-light)] transition-all"
                    >
                      Buy Now
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
            Explore All Products <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
