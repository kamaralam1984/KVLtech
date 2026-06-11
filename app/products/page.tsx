"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight, Star, SlidersHorizontal, X, Sparkles, LayoutGrid } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { ProductRecommender } from "@/components/ui/ProductRecommender";
import { useLanguage } from "@/contexts/LanguageContext";

const STATIC_PRODUCTS = [
  // WEBSITE
  { slug: "restaurant-website", name: "Restaurant Website", tagline: "Grow your restaurant business online", category: "WEBSITE", photo: "/photos/restaurant.jpg", basicPrice: 14999, premiumPrice: 29999, tag: "Popular", highlights: ["Online ordering", "Table reservation", "+300% orders"] },
  { slug: "ecommerce-platform", name: "E-commerce Platform", tagline: "Launch your online store in days", category: "WEBSITE", photo: "/photos/fashion.jpg", basicPrice: 24999, premiumPrice: 49999, tag: "Hot", highlights: ["250% sales increase", "Razorpay integration", "Inventory management"] },
  { slug: "hotel-booking-website", name: "Hotel Booking Website", tagline: "Boost direct bookings, cut OTA commissions", category: "WEBSITE", photo: "/photos/restaurant.jpg", basicPrice: 19999, premiumPrice: 39999, highlights: ["Direct bookings +180%", "No OTA commission"] },
  { slug: "real-estate-website", name: "Real Estate Website", tagline: "Showcase properties, generate quality leads", category: "WEBSITE", photo: "/photos/office-meeting.jpg", basicPrice: 17999, premiumPrice: 34999, highlights: ["3X more leads", "Property search", "Virtual tour"] },
  { slug: "gym-fitness-website", name: "Gym & Fitness Website", tagline: "Grow your fitness business online", category: "WEBSITE", photo: "/photos/gym.png", basicPrice: 12999, premiumPrice: 24999, highlights: ["Membership management", "Class booking"] },
  { slug: "portfolio-website", name: "Portfolio Website", tagline: "Stand out with a stunning portfolio", category: "WEBSITE", photo: "/photos/office-meeting.jpg", basicPrice: 7999, premiumPrice: 14999, highlights: ["Stunning design", "Fast loading", "SEO optimized"] },
  // SOFTWARE
  { slug: "school-management-system", name: "School Management System", tagline: "Complete digital transformation for your school", category: "SOFTWARE", photo: "/photos/school.jpg", basicPrice: 29999, premiumPrice: 59999, tag: "Best Seller", highlights: ["80% workload reduction", "95% parent satisfaction"] },
  { slug: "hospital-management-system", name: "Hospital Management System", tagline: "Streamline patient care with smart automation", category: "SOFTWARE", photo: "/photos/hospital.jpg", basicPrice: 49999, premiumPrice: 99999, tag: "Enterprise", highlights: ["70% faster operations", "90% patient satisfaction"] },
  { slug: "inventory-management", name: "Inventory Management System", tagline: "Track stock, reduce waste, boost profits", category: "SOFTWARE", photo: "/photos/office-meeting.jpg", basicPrice: 19999, premiumPrice: 39999, highlights: ["Barcode scanning", "Real-time alerts"] },
  { slug: "hr-payroll-software", name: "HR & Payroll Software", tagline: "Automate HR, save hours every month", category: "SOFTWARE", photo: "/photos/person-laptop.jpg", basicPrice: 24999, premiumPrice: 49999, highlights: ["Payroll automation", "Tax compliance"] },
  { slug: "crm-software", name: "CRM Software", tagline: "Convert more leads, retain more clients", category: "SOFTWARE", photo: "/photos/person-laptop.jpg", basicPrice: 22999, premiumPrice: 44999, highlights: ["Lead pipeline", "Follow-up automation"] },
  { slug: "billing-software", name: "Billing & Invoice Software", tagline: "Professional invoices, faster payments", category: "SOFTWARE", photo: "/photos/office-meeting.jpg", basicPrice: 14999, premiumPrice: 29999, highlights: ["GST compliant", "Auto payment reminders"] },
  // SAAS
  { slug: "kvl-crm-saas", name: "KVL CRM Cloud", tagline: "Cloud CRM — use instantly, no installation needed", category: "SAAS", photo: "/photos/person-laptop.jpg", basicPrice: 999, premiumPrice: 2499, tag: "New", highlights: ["Start in 5 minutes", "No server needed", "Auto updates"] },
  { slug: "kvl-billing-saas", name: "KVL Billing Cloud", tagline: "GST billing from any device, anywhere", category: "SAAS", photo: "/photos/office-meeting.jpg", basicPrice: 499, premiumPrice: 1299, highlights: ["GST compliant", "Cloud invoices", "Multi-user"] },
  { slug: "kvl-hr-saas", name: "KVL HR Cloud", tagline: "HR & payroll management in the cloud", category: "SAAS", photo: "/photos/school.jpg", basicPrice: 799, premiumPrice: 1999, highlights: ["Payroll automation", "Leave management", "Employee portal"] },
  { slug: "kvl-inventory-saas", name: "KVL Inventory Cloud", tagline: "Real-time stock tracking from any device", category: "SAAS", photo: "/photos/fashion.jpg", basicPrice: 699, premiumPrice: 1799, tag: "Popular", highlights: ["Real-time sync", "Multi-branch", "Barcode support"] },
  // MOBILE
  { slug: "restaurant-mobile-app", name: "Restaurant Mobile App", tagline: "Orders, reservations & loyalty — on mobile", category: "MOBILE", photo: "/photos/restaurant.jpg", basicPrice: 24999, premiumPrice: 49999, tag: "Popular", highlights: ["iOS + Android", "Online ordering", "Push notifications"] },
  { slug: "ecommerce-mobile-app", name: "E-commerce Mobile App", tagline: "Sell more with your own branded shopping app", category: "MOBILE", photo: "/photos/fashion.jpg", basicPrice: 34999, premiumPrice: 69999, tag: "Hot", highlights: ["iOS + Android", "Razorpay", "Product catalog"] },
  { slug: "hospital-patient-app", name: "Hospital Patient App", tagline: "Appointments, reports & prescriptions on mobile", category: "MOBILE", photo: "/photos/hospital.jpg", basicPrice: 39999, premiumPrice: 79999, highlights: ["OPD booking", "Lab reports", "Doctor chat"] },
  { slug: "school-parent-app", name: "School Parent App", tagline: "Connect parents, teachers & students on mobile", category: "MOBILE", photo: "/photos/school.jpg", basicPrice: 29999, premiumPrice: 59999, highlights: ["Attendance alerts", "Fee payment", "Homework tracking"] },
];

// Map URL param values → internal category values
const PARAM_TO_CAT: Record<string, string> = {
  websites: "WEBSITE",
  website: "WEBSITE",
  software: "SOFTWARE",
  saas: "SAAS",
  mobile: "MOBILE",
  "mobile-apps": "MOBILE",
  digital: "WEBSITE",
};

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

function ProductsContent() {
  const { t, formatPrice } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Read category from URL on mount and when URL changes
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      const mapped = PARAM_TO_CAT[cat.toLowerCase()];
      if (mapped) setActiveCategory(mapped);
      else setActiveCategory("all");
    } else {
      setActiveCategory("all");
    }
  }, [searchParams]);

  // Update URL when category button clicked
  const handleCategoryChange = (cat: string) => {
    if (cat === "SAAS") { router.push("/products/saas"); return; }
    if (cat === "MOBILE") { router.push("/products/mobile"); return; }
    setActiveCategory(cat);
    const catToParam: Record<string, string> = {
      WEBSITE: "websites", SOFTWARE: "software",
    };
    if (cat === "all") {
      router.push("/products", { scroll: false });
    } else {
      router.push(`/products?category=${catToParam[cat] || cat.toLowerCase()}`, { scroll: false });
    }
  };

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(data => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          setProducts(STATIC_PRODUCTS as any[]);
        }
      })
      .catch(() => { setProducts(STATIC_PRODUCTS as any[]); })
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
        <section className="py-12 bg-[var(--color-bg)] relative overflow-hidden">
          {/* Page-level nakkashi background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <svg className="absolute top-0 left-0 w-full h-full opacity-[0.025] dark:opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="nakk" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M30 2L58 30L30 58L2 30Z" stroke="#C9A227" strokeWidth="0.8" fill="none"/>
                  <circle cx="30" cy="30" r="6" stroke="#C9A227" strokeWidth="0.6" fill="none"/>
                  <circle cx="30" cy="30" r="1.5" fill="#C9A227"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#nakk)"/>
            </svg>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              {/* Category tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
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
                  <button onClick={() => { setSearch(""); handleCategoryChange("all"); }} className="btn-outline">
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
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full"
                    >
                      <div className="relative h-full flex flex-col group bg-white dark:bg-[#0D1628] rounded-3xl overflow-hidden border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_24px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_48px_rgba(201,162,39,0.18)] dark:hover:shadow-[0_12px_48px_rgba(201,162,39,0.12)] transition-all duration-500 hover:-translate-y-1.5">

                        {/* ── Nakkashi background ornaments ── */}
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                          {/* Top-right concentric arcs */}
                          <svg className="absolute -top-6 -right-6 opacity-[0.07] dark:opacity-[0.1]" width="120" height="120" viewBox="0 0 120 120" fill="none">
                            <circle cx="120" cy="0" r="40"  stroke="#C9A227" strokeWidth="1.2"/>
                            <circle cx="120" cy="0" r="60"  stroke="#C9A227" strokeWidth="0.9"/>
                            <circle cx="120" cy="0" r="80"  stroke="#C9A227" strokeWidth="0.7"/>
                            <circle cx="120" cy="0" r="100" stroke="#C9A227" strokeWidth="0.5"/>
                          </svg>
                          {/* Bottom-left tiny diamond lattice */}
                          <svg className="absolute bottom-0 left-0 opacity-[0.05] dark:opacity-[0.08]" width="80" height="80" viewBox="0 0 80 80" fill="none">
                            {[0,20,40,60,80].map(x => [0,20,40,60,80].map(y => (
                              <rect key={`${x}-${y}`} x={x-4} y={y-4} width="8" height="8" rx="1" transform={`rotate(45 ${x} ${y})`} stroke="#C9A227" strokeWidth="0.8"/>
                            )))}
                          </svg>
                          {/* Soft gold radial glow */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,rgba(201,162,39,0.08)_0%,transparent_70%)]" />
                        </div>

                        {/* ── Image ── */}
                        <div className="relative h-52 overflow-hidden shrink-0">
                          <Image
                            src={product.photo}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                          {product.tag && (
                            <span className="absolute top-3.5 left-3.5 px-3 py-1 text-[10px] font-bold tracking-wide bg-[#C9A227] text-black rounded-full shadow-lg">
                              {product.tag}
                            </span>
                          )}
                          <span className="absolute top-3.5 right-3.5 px-2.5 py-1 text-[10px] font-semibold text-white bg-white/15 backdrop-blur-md rounded-full border border-white/20">
                            {CAT_LABEL[product.category] || product.category}
                          </span>
                          {/* Product name overlay on image bottom */}
                          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-6">
                            <h3 className="font-display font-bold text-base text-white leading-snug drop-shadow-sm">
                              {product.name}
                            </h3>
                          </div>
                        </div>

                        {/* ── Gold ornamental divider ── */}
                        <div className="flex items-center gap-1.5 px-5 pt-4 pb-0">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C9A227]/40 to-transparent" />
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 opacity-60">
                            <path d="M7 0L8.5 5.5H14L9.5 8.5L11 14L7 10.5L3 14L4.5 8.5L0 5.5H5.5L7 0Z" fill="#C9A227"/>
                          </svg>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C9A227]/40 to-transparent" />
                        </div>

                        {/* ── Content ── */}
                        <div className="px-5 pt-3 pb-5 flex flex-col flex-1 relative">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed line-clamp-2 flex-1">
                            {product.tagline}
                          </p>

                          {/* Highlights */}
                          {(product.highlights || []).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {(product.highlights || []).slice(0, 2).map((h: string) => (
                                <span key={h} className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-[#C9A227]/10 text-amber-700 dark:text-[#C9A227] border border-amber-200/60 dark:border-[#C9A227]/20">
                                  <Star size={8} fill="currentColor" /> {h}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Pricing */}
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="text-center p-2.5 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.07]">
                              <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 font-semibold">Basic</p>
                              <p className="font-display font-bold text-sm text-gray-800 dark:text-white">
                                {formatPrice(product.basicPrice)}
                              </p>
                            </div>
                            <div className="text-center p-2.5 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50/50 dark:from-[#C9A227]/12 dark:to-[#C9A227]/5 border border-amber-200/50 dark:border-[#C9A227]/25">
                              <p className="text-[9px] text-amber-600 dark:text-[#C9A227] uppercase tracking-widest mb-0.5 font-semibold">{t.product_premium}</p>
                              <p className="font-display font-bold text-sm text-amber-700 dark:text-[#C9A227]">
                                {formatPrice(product.premiumPrice)}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Link
                              href={`/products/${product.slug}`}
                              className="flex-1 py-2.5 text-center text-xs font-semibold rounded-xl border border-gray-200 dark:border-white/[0.1] text-gray-600 dark:text-gray-300 hover:border-[#C9A227] hover:text-amber-700 dark:hover:text-[#C9A227] transition-all duration-300"
                            >
                              View Details
                            </Link>
                            <Link
                              href={`/products/${product.slug}#buy`}
                              className="flex-1 py-2.5 text-center text-xs font-bold rounded-xl bg-[#1B2A4A] dark:bg-[#C9A227] text-white dark:text-black hover:bg-[#253d6e] dark:hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              Buy Now <ArrowRight size={12} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* ── Special Option Card: Custom Project ── */}
                  <motion.div
                    key="custom-project"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: filtered.length * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full"
                  >
                    <div className="relative h-full flex flex-col group bg-white dark:bg-[#0D1628] rounded-3xl overflow-hidden border-2 border-[#C9A227] shadow-[0_2px_16px_rgba(201,162,39,0.12)] dark:shadow-[0_2px_24px_rgba(201,162,39,0.18)] hover:shadow-[0_12px_48px_rgba(201,162,39,0.30)] dark:hover:shadow-[0_12px_48px_rgba(201,162,39,0.22)] transition-all duration-500 hover:-translate-y-1.5">

                      {/* Background glow */}
                      <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle,rgba(201,162,39,0.12)_0%,transparent_70%)]" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[radial-gradient(circle,rgba(201,162,39,0.08)_0%,transparent_70%)]" />
                        <svg className="absolute -top-4 -right-4 opacity-[0.12] dark:opacity-[0.18]" width="120" height="120" viewBox="0 0 120 120" fill="none">
                          <circle cx="120" cy="0" r="40"  stroke="#C9A227" strokeWidth="1.5"/>
                          <circle cx="120" cy="0" r="65"  stroke="#C9A227" strokeWidth="1"/>
                          <circle cx="120" cy="0" r="90"  stroke="#C9A227" strokeWidth="0.6"/>
                        </svg>
                      </div>

                      {/* Icon area */}
                      <div className="relative flex items-center justify-center h-52 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100/60 dark:from-[#C9A227]/10 dark:via-[#C9A227]/6 dark:to-[#C9A227]/3 shrink-0">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C9A227] to-amber-600 flex items-center justify-center shadow-[0_8px_32px_rgba(201,162,39,0.4)]">
                            <Sparkles size={36} className="text-white" />
                          </div>
                          <span className="px-3 py-1 text-[10px] font-bold tracking-wide bg-[#C9A227] text-black rounded-full shadow-lg">
                            Any Budget
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-6">
                          <h3 className="font-display font-bold text-base text-[#1B2A4A] dark:text-white leading-snug drop-shadow-sm">
                            Custom Project
                          </h3>
                        </div>
                      </div>

                      {/* Gold ornamental divider */}
                      <div className="flex items-center gap-1.5 px-5 pt-4 pb-0">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C9A227]/60 to-transparent" />
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 opacity-80">
                          <path d="M7 0L8.5 5.5H14L9.5 8.5L11 14L7 10.5L3 14L4.5 8.5L0 5.5H5.5L7 0Z" fill="#C9A227"/>
                        </svg>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C9A227]/60 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="px-5 pt-3 pb-5 flex flex-col flex-1 relative">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed flex-1">
                          Tell us exactly what you need — we&apos;ll build it from scratch
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-[#C9A227]/10 text-amber-700 dark:text-[#C9A227] border border-amber-200/60 dark:border-[#C9A227]/20">
                            <Star size={8} fill="currentColor" /> Fully tailored to you
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-[#C9A227]/10 text-amber-700 dark:text-[#C9A227] border border-amber-200/60 dark:border-[#C9A227]/20">
                            <Star size={8} fill="currentColor" /> Any industry
                          </span>
                        </div>

                        <Link
                          href="/custom-project"
                          className="w-full py-3 text-center text-sm font-bold rounded-xl bg-gradient-to-r from-[#C9A227] to-amber-600 text-black hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(201,162,39,0.35)]"
                        >
                          Start Custom Order <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>

                  {/* ── Special Option Card: Website Templates ── */}
                  <motion.div
                    key="website-templates"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (filtered.length + 1) * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full"
                  >
                    <div className="relative h-full flex flex-col group bg-white dark:bg-[#0D1628] rounded-3xl overflow-hidden border-2 border-indigo-400 dark:border-indigo-500 shadow-[0_2px_16px_rgba(99,102,241,0.12)] dark:shadow-[0_2px_24px_rgba(99,102,241,0.18)] hover:shadow-[0_12px_48px_rgba(99,102,241,0.28)] dark:hover:shadow-[0_12px_48px_rgba(99,102,241,0.22)] transition-all duration-500 hover:-translate-y-1.5">

                      {/* Background glow */}
                      <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle,rgba(99,102,241,0.10)_0%,transparent_70%)]" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_70%)]" />
                        <svg className="absolute -top-4 -right-4 opacity-[0.12] dark:opacity-[0.18]" width="120" height="120" viewBox="0 0 120 120" fill="none">
                          <circle cx="120" cy="0" r="40"  stroke="#6366F1" strokeWidth="1.5"/>
                          <circle cx="120" cy="0" r="65"  stroke="#6366F1" strokeWidth="1"/>
                          <circle cx="120" cy="0" r="90"  stroke="#6366F1" strokeWidth="0.6"/>
                        </svg>
                      </div>

                      {/* Icon area */}
                      <div className="relative flex items-center justify-center h-52 bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-100/60 dark:from-indigo-500/10 dark:via-purple-500/6 dark:to-violet-500/3 shrink-0">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_8px_32px_rgba(99,102,241,0.4)]">
                            <LayoutGrid size={36} className="text-white" />
                          </div>
                          <span className="px-3 py-1 text-[10px] font-bold tracking-wide bg-indigo-500 text-white rounded-full shadow-lg">
                            From ₹999
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-6">
                          <h3 className="font-display font-bold text-base text-[#1B2A4A] dark:text-white leading-snug drop-shadow-sm">
                            Website Templates
                          </h3>
                        </div>
                      </div>

                      {/* Indigo ornamental divider */}
                      <div className="flex items-center gap-1.5 px-5 pt-4 pb-0">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 opacity-70">
                          <path d="M7 0L8.5 5.5H14L9.5 8.5L11 14L7 10.5L3 14L4.5 8.5L0 5.5H5.5L7 0Z" fill="#6366F1"/>
                        </svg>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="px-5 pt-3 pb-5 flex flex-col flex-1 relative">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed flex-1">
                          Choose from 50+ ready templates, customize &amp; download
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20">
                            <Star size={8} fill="currentColor" /> 50+ templates
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20">
                            <Star size={8} fill="currentColor" /> Instant download
                          </span>
                        </div>

                        <Link
                          href="/templates"
                          className="w-full py-3 text-center text-sm font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(99,102,241,0.35)]"
                        >
                          Browse Templates <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ProductsContent />
    </Suspense>
  );
}
