"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Play, CheckCircle2, TrendingUp, Users, Star, Zap, X,
  ChevronLeft, ChevronRight, Globe, Cpu, BarChart3, Bot,
  Utensils, GraduationCap, Hospital, Building2, ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { FloatingOrbs } from "@/components/ui/FloatingOrbs";
import { AnimatedGradientBorder } from "@/components/ui/AnimatedGradientBorder";
import { useLanguage } from "@/contexts/LanguageContext";

const SLIDE_PRODUCTS = [
  {
    icon: Cpu,
    name: "CRM Software",
    category: "SaaS",
    tag: "Enterprise",
    basicINR: 49900,
    premiumINR: 99900,
    accentColor: "#7C3AED",
    browserUrl: "bizcrm.app",
    browserTitle: "BizCRM Pro",
    photo: "/photos/person-laptop.jpg",
    features: [
      { icon: Users,    label: "Lead Tracking"  },
      { icon: BarChart3, label: "Sales Pipeline" },
      { icon: Bot,      label: "Auto Reports"   },
    ],
    liveLabel: "Live Orders +12 today",
    tierLabel: "Enterprise",
    clients: 67,
    rating: 4.9,
  },
  {
    icon: Utensils,
    name: "Restaurant Website",
    category: "Food & Hospitality",
    tag: "Most Popular",
    basicINR: 12999,
    premiumINR: 24999,
    accentColor: "#FF6B35",
    browserUrl: "restropro.app",
    browserTitle: "RestroPro",
    photo: "/photos/restaurant.jpg",
    features: [
      { icon: ShoppingCart, label: "Online Orders"  },
      { icon: Globe,        label: "Menu Builder"   },
      { icon: Users,        label: "Reservations"   },
    ],
    liveLabel: "Orders +8 today",
    tierLabel: "Popular",
    clients: 124,
    rating: 4.8,
  },
  {
    icon: GraduationCap,
    name: "School Management",
    category: "Education",
    tag: "Best Seller",
    basicINR: 29999,
    premiumINR: 59999,
    accentColor: "#16A34A",
    browserUrl: "edumanage.app",
    browserTitle: "EduManage Pro",
    photo: "/photos/school.jpg",
    features: [
      { icon: Users,    label: "Student Portal"  },
      { icon: BarChart3, label: "Attendance"      },
      { icon: Globe,    label: "Fee Management"  },
    ],
    liveLabel: "Students +45 today",
    tierLabel: "Best Seller",
    clients: 89,
    rating: 4.9,
  },
  {
    icon: ShoppingCart,
    name: "E-commerce Platform",
    category: "Retail",
    tag: "New Launch",
    basicINR: 19999,
    premiumINR: 39999,
    accentColor: "#0891B2",
    browserUrl: "shopflow.app",
    browserTitle: "ShopFlow",
    photo: "/photos/fashion.jpg",
    features: [
      { icon: ShoppingCart, label: "Product Catalog" },
      { icon: BarChart3,    label: "Analytics"       },
      { icon: Bot,          label: "Auto Inventory"  },
    ],
    liveLabel: "Sales +18 today",
    tierLabel: "New Launch",
    clients: 43,
    rating: 4.7,
  },
  {
    icon: Hospital,
    name: "Hospital Management",
    category: "Healthcare",
    tag: "Enterprise",
    basicINR: 49999,
    premiumINR: 99999,
    accentColor: "#0891B2",
    browserUrl: "healthpro.app",
    browserTitle: "HealthPro",
    photo: "/photos/hospital.jpg",
    features: [
      { icon: Users,    label: "Patient Records" },
      { icon: BarChart3, label: "Appointments"   },
      { icon: Bot,      label: "Billing System"  },
    ],
    liveLabel: "Patients +6 today",
    tierLabel: "Enterprise",
    clients: 31,
    rating: 4.9,
  },
  {
    icon: Building2,
    name: "Real Estate Website",
    category: "Real Estate",
    tag: "Premium",
    basicINR: 22999,
    premiumINR: 44999,
    accentColor: "#C9A227",
    browserUrl: "propmanage.app",
    browserTitle: "PropManage",
    photo: "/photos/office-meeting.jpg",
    features: [
      { icon: Building2, label: "Property List" },
      { icon: Users,     label: "Client CRM"   },
      { icon: BarChart3, label: "Deal Tracker"  },
    ],
    liveLabel: "Inquiries +3 today",
    tierLabel: "Premium",
    clients: 28,
    rating: 4.8,
  },
];

const SLIDE_DURATION_MS = 4500;
const DEMO_VIDEO_ID = "UL76TS335Vs";

function fadeUp(i: number, mounted: boolean) {
  return {
    opacity: mounted ? 1 : 0,
    y: mounted ? 0 : 24,
    transition: { duration: 0.55, delay: mounted ? i * 0.08 : 0, ease: [0.25, 0.1, 0.25, 1] as const },
  };
}

export function Hero() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setVideoOpen(false); };
    if (videoOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [videoOpen]);

  // Auto-advance slider in an infinite loop
  useEffect(() => {
    const timer = setTimeout(() => {
      setSlideIndex(prev => (prev + 1) % SLIDE_PRODUCTS.length);
    }, SLIDE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [slideIndex]);

  const goSlide = (dir: 1 | -1) =>
    setSlideIndex(prev => (prev + dir + SLIDE_PRODUCTS.length) % SLIDE_PRODUCTS.length);

  const stats = [
    { icon: Users,        value: 5000,  suffix: "+",  label: t.stat_clients  },
    { icon: TrendingUp,   value: 12500, suffix: "+",  label: t.stat_projects },
    { icon: CheckCircle2, value: 99.99, suffix: "%",  label: t.stat_uptime   },
    { icon: Star,         value: 24,    suffix: "/7", label: t.stat_support  },
  ];

  const highlights = [t.hero_h1, t.hero_h2, t.hero_h3];
  const product = SLIDE_PRODUCTS[slideIndex];

  return (
    <section className="relative flex flex-col overflow-hidden pt-[104px] grid-bg">
      <FloatingOrbs count={5} />

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[280px] sm:w-[600px] h-[280px] sm:h-[600px] rounded-full bg-[var(--color-gold)]/5 blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] rounded-full bg-[var(--color-navy)]/5 blur-[60px] sm:blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: `radial-gradient(circle, var(--color-text) 1px, transparent 1px)`, backgroundSize: "32px 32px" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14 relative z-10 w-full">

        {/* ── TOP: Badge + Heading + Highlights + Buttons ── */}
        <div className="text-center mb-10 lg:mb-14">
          <motion.div animate={fadeUp(0, mounted)} className="section-badge w-fit mx-auto mb-5">
            <Zap size={12} /> {t.hero_badge}
          </motion.div>

          <motion.h1
            animate={fadeUp(1, mounted)}
            className="font-display font-bold text-[2rem] sm:text-4xl lg:text-[3.4rem] xl:text-[3.8rem] leading-[1.1] tracking-tight text-[var(--color-text)] mb-5 text-glow-gold"
          >
            {t.hero_headline}{" "}
            <span className="text-gold-gradient">{t.hero_headline_gold}</span>
          </motion.h1>

          <motion.ul
            animate={fadeUp(2, mounted)}
            className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-7"
          >
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <CheckCircle2 size={15} className="text-[var(--color-success)] shrink-0" />
                {h}
              </li>
            ))}
          </motion.ul>

          <motion.div
            animate={fadeUp(3, mounted)}
            className="flex flex-col sm:flex-row flex-wrap justify-center gap-3"
          >
            <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.18 }}>
              <Link href="/products" className="btn-primary justify-center">
                {t.hero_explore} <ArrowRight size={16} />
              </Link>
            </motion.div>
            <AnimatedGradientBorder borderWidth={2}>
              <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.18 }}>
                <Link href="/contact" className="btn-gold text-center glow-gold-hover">
                  {t.hero_consult}
                </Link>
              </motion.div>
            </AnimatedGradientBorder>
            <motion.button
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.18 }}
              onClick={() => setVideoOpen(true)}
              className="btn-outline flex items-center justify-center gap-2"
            >
              <span className="w-8 h-8 rounded-full bg-[var(--color-navy)] flex items-center justify-center shrink-0">
                <Play size={12} className="text-white ml-0.5" fill="white" />
              </span>
              {t.hero_watch_demo}
            </motion.button>
          </motion.div>
        </div>

        {/* ── BOTTOM: home.png (left) + Browser mockup slider (right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">

          {/* LEFT — home.png */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Image
              src="/home.png"
              alt="KVL TECH Business Solutions"
              width={680}
              height={560}
              className="w-full h-auto rounded-3xl shadow-[var(--shadow-luxury)]"
              priority
            />
          </motion.div>

          {/* RIGHT — Browser mockup slider */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative pt-5 pb-8"
          >
            {/* Floating — Live Orders badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`live-${slideIndex}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="absolute top-0 left-4 z-30 flex items-center gap-2 bg-white dark:bg-[var(--color-surface)] shadow-lg rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] border border-[var(--color-border)]"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {product.liveLabel}
              </motion.div>
            </AnimatePresence>

            {/* Floating — Fast Delivery badge */}
            <div className="absolute top-0 right-4 z-30 flex items-center gap-1.5 bg-[var(--color-navy)] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
              <Zap size={11} className="text-[var(--color-gold)]" />
              Fast Delivery · 1–5 days
            </div>

            {/* Floating — Rating badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`rating-${slideIndex}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-0 right-4 z-30 bg-white dark:bg-[var(--color-surface)] shadow-lg rounded-full px-3 py-1.5 text-xs font-bold text-[var(--color-text)] border border-[var(--color-border)] flex items-center gap-1"
              >
                <Star size={11} className="text-amber-400" fill="currentColor" />
                {product.rating}/5
              </motion.div>
            </AnimatePresence>

            {/* Nav arrow — Left */}
            <button
              onClick={() => goSlide(-1)}
              aria-label="Previous"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-white dark:bg-[var(--color-surface)] shadow-lg flex items-center justify-center text-[var(--color-text)] hover:scale-110 transition border border-[var(--color-border)]"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Nav arrow — Right */}
            <button
              onClick={() => goSlide(1)}
              aria-label="Next"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full bg-white dark:bg-[var(--color-surface)] shadow-lg flex items-center justify-center text-[var(--color-text)] hover:scale-110 transition border border-[var(--color-border)]"
            >
              <ChevronRight size={18} />
            </button>

            {/* Browser mockup */}
            <AnimatePresence mode="wait">
              <motion.div
                key={slideIndex}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="rounded-2xl overflow-hidden shadow-[var(--shadow-luxury)] border border-[var(--color-border)] bg-white dark:bg-gray-900"
              >
                {/* Browser chrome */}
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2.5 flex items-center gap-3 border-b border-[var(--color-border)]">
                  <div className="flex gap-1.5 shrink-0">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 bg-white dark:bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-400 flex items-center gap-1.5 min-w-0">
                    <Globe size={10} className="shrink-0" />
                    <span className="truncate">{product.browserUrl}</span>
                  </div>
                </div>

                {/* App navbar */}
                <div
                  className="px-4 py-2.5 flex items-center justify-between gap-2"
                  style={{ background: product.accentColor }}
                >
                  <span className="text-white font-bold text-sm shrink-0">{product.browserTitle}</span>
                  <div className="hidden sm:flex items-center gap-3 text-white/80 text-xs">
                    <span>Home</span><span>About</span><span>Services</span><span>Contact</span>
                  </div>
                  <button
                    className="bg-white text-xs font-bold px-3 py-1 rounded-full shrink-0"
                    style={{ color: product.accentColor }}
                  >
                    Book Now
                  </button>
                </div>

                {/* App content */}
                <div className="p-4" style={{ background: product.accentColor + "08" }}>
                  {/* Website screenshot image */}
                  <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3 shadow-sm">
                    <Image
                      src={product.photo}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="600px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span
                      className="absolute bottom-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: product.accentColor }}
                    >
                      {product.tag}
                    </span>
                  </div>

                  {/* Tier + progress bar */}
                  <div className="mb-4">
                    <span
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ background: product.accentColor + "20", color: product.accentColor }}
                    >
                      {product.tierLabel}
                    </span>
                    <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <motion.div
                        key={`bar-${slideIndex}`}
                        className="h-full rounded-full"
                        style={{ background: product.accentColor }}
                        initial={{ width: "0%" }}
                        animate={{ width: "68%" }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* CTA buttons */}
                  <div className="flex gap-2 mb-4">
                    <button
                      className="px-4 py-2 text-xs text-white font-semibold rounded-lg"
                      style={{ background: product.accentColor }}
                    >
                      Get Started
                    </button>
                    <button
                      className="px-4 py-2 text-xs font-semibold rounded-lg border"
                      style={{ borderColor: product.accentColor, color: product.accentColor }}
                    >
                      View Demo
                    </button>
                  </div>

                  {/* Feature cards */}
                  <div className="grid grid-cols-3 gap-2">
                    {product.features.map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center border border-gray-100 dark:border-gray-700"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5"
                          style={{ background: product.accentColor + "20" }}
                        >
                          <Icon size={14} style={{ color: product.accentColor }} />
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] font-medium leading-tight">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                      <Star size={11} className="text-amber-400" fill="currentColor" />
                      <span>{product.rating} · {product.clients} clients</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Live website
                    </div>
                  </div>
                </div>

                {/* Bottom: product name + pricing */}
                <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-[var(--color-border)] flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: product.accentColor + "20" }}
                    >
                      <product.icon size={15} style={{ color: product.accentColor }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--color-text)] leading-none truncate">{product.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">★ {product.rating} · {product.clients} clients</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold text-[var(--color-text)]">
                      ₹{product.basicINR.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs font-bold text-[var(--color-gold)]">
                      Premium ₹{product.premiumINR.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dot navigation */}
            <div className="flex justify-center gap-1.5 mt-4">
              {SLIDE_PRODUCTS.map((_, i) => (
                <button key={i} onClick={() => setSlideIndex(i)} aria-label={`Slide ${i + 1}`}>
                  <span
                    className="block rounded-full transition-all duration-300"
                    style={{
                      width: i === slideIndex ? 20 : 6,
                      height: 6,
                      background: i === slideIndex ? SLIDE_PRODUCTS[slideIndex].accentColor : "var(--color-border)",
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Auto-advance progress bar */}
            <div className="mt-2 h-0.5 rounded-full bg-[var(--color-border)] overflow-hidden">
              <motion.div
                key={`prog-${slideIndex}`}
                className="h-full rounded-full"
                style={{ background: product.accentColor }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: SLIDE_DURATION_MS / 1000, ease: "linear" }}
              />
            </div>
          </motion.div>
        </div>

        {/* ── Stats row ── */}
        <motion.div
          animate={fadeUp(5, mounted)}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 mt-10 border-t border-[var(--color-border)]"
        >
          {stats.map(({ icon: Icon, value, suffix, label }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Icon size={14} className="text-[var(--color-gold)]" />
                <span className="font-display font-bold text-xl text-[var(--color-text)]">
                  <AnimatedCounter end={value} suffix={suffix} />
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
            </div>
          ))}
        </motion.div>

      </div>

      {/* Bottom divider */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <hr className="divider-gold" />
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {videoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[300] flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
            onClick={() => setVideoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative w-full max-w-4xl"
              style={{ aspectRatio: "16/9" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setVideoOpen(false)}
                className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
              >
                <X size={18} /> Close
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${DEMO_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
                title="KVL TECH Demo"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                className="w-full h-full rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
                style={{ border: "none" }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
