"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Play, CheckCircle2, TrendingUp, Users, Star, Zap,
  ShoppingCart, GraduationCap, Utensils, Hospital, Building2, X,
  ChevronLeft, ChevronRight, Hotel, Dumbbell, Briefcase,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useLanguage } from "@/contexts/LanguageContext";

const DEMO_VIDEO_ID = "UL76TS335Vs";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

const PRODUCT_SLIDES = [
  {
    icon: Utensils,
    name: "Restaurant Website",
    siteName: "Spice Garden",
    url: "spicegarden.com",
    tag: "Most Popular",
    basic: 156,
    premium: 299,
    clients: 234,
    rating: 4.9,
    color: "#FF6B35",
    bgColor: "#FFF8F5",
    features: ["Online Menu", "Table Booking", "Food Delivery"],
  },
  {
    icon: GraduationCap,
    name: "School Management",
    siteName: "EduSmart Portal",
    url: "edusmart.school",
    tag: "Best Seller",
    basic: 359,
    premium: 719,
    clients: 189,
    rating: 4.8,
    color: "#16A34A",
    bgColor: "#F0FFF4",
    features: ["Student Portal", "Fee System", "Attendance"],
  },
  {
    icon: Hospital,
    name: "Hospital System",
    siteName: "MediCare Pro",
    url: "medicare.health",
    tag: "Enterprise",
    basic: 599,
    premium: 1199,
    clients: 98,
    rating: 5.0,
    color: "#0891B2",
    bgColor: "#F0FAFF",
    features: ["Patient Records", "Appointments", "Lab Reports"],
  },
  {
    icon: ShoppingCart,
    name: "E-commerce Store",
    siteName: "ShopEasy",
    url: "shopeasy.store",
    tag: "New",
    basic: 192,
    premium: 479,
    clients: 156,
    rating: 4.7,
    color: "#7C3AED",
    bgColor: "#FAF5FF",
    features: ["Product Catalog", "Cart & Pay", "Order Tracking"],
  },
  {
    icon: Building2,
    name: "Real Estate Site",
    siteName: "PropFinder",
    url: "propfinder.in",
    tag: "Premium",
    basic: 275,
    premium: 539,
    clients: 112,
    rating: 4.9,
    color: "#C9A227",
    bgColor: "#FFFBEF",
    features: ["Property Search", "Virtual Tours", "Lead Gen"],
  },
  {
    icon: Hotel,
    name: "Hotel Booking",
    siteName: "StayLux Hotels",
    url: "staylux.hotel",
    tag: "Popular",
    basic: 319,
    premium: 649,
    clients: 87,
    rating: 4.8,
    color: "#DB2777",
    bgColor: "#FFF0F7",
    features: ["Room Booking", "Online Payment", "Review System"],
  },
  {
    icon: Dumbbell,
    name: "Gym & Fitness",
    siteName: "FitZone Club",
    url: "fitzone.gym",
    tag: "Trending",
    basic: 189,
    premium: 399,
    clients: 143,
    rating: 4.7,
    color: "#EA580C",
    bgColor: "#FFF7F0",
    features: ["Member Portal", "Class Schedule", "Trainer Booking"],
  },
  {
    icon: Briefcase,
    name: "CRM Software",
    siteName: "BizCRM Pro",
    url: "bizcrm.app",
    tag: "Enterprise",
    basic: 499,
    premium: 999,
    clients: 67,
    rating: 4.9,
    color: "#4F46E5",
    bgColor: "#F5F3FF",
    features: ["Lead Tracking", "Sales Pipeline", "Auto Reports"],
  },
];

export function Hero() {
  const { t } = useLanguage();
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [sliderHovered, setSliderHovered] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setVideoOpen(false); };
    if (videoOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [videoOpen]);

  const goNext = useCallback(() => setActiveSlide(i => (i + 1) % PRODUCT_SLIDES.length), []);
  const goPrev = useCallback(() => setActiveSlide(i => (i - 1 + PRODUCT_SLIDES.length) % PRODUCT_SLIDES.length), []);

  useEffect(() => {
    if (sliderHovered) return;
    const timer = setInterval(goNext, 3500);
    return () => clearInterval(timer);
  }, [sliderHovered, goNext]);

  const slide = PRODUCT_SLIDES[activeSlide];

  const stats = [
    { icon: Users, value: 5000, suffix: "+", label: t.stat_clients },
    { icon: TrendingUp, value: 12500, suffix: "+", label: t.stat_projects },
    { icon: CheckCircle2, value: 99.99, suffix: "%", label: t.stat_uptime },
    { icon: Star, value: 24, suffix: "/7", label: t.stat_support },
  ];

  const highlights = [t.hero_h1, t.hero_h2, t.hero_h3];

  return (
    <section className="relative min-h-screen flex flex-col justify-start lg:justify-center overflow-hidden pt-[104px]">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[280px] sm:w-[600px] h-[280px] sm:h-[600px] rounded-full bg-[var(--color-gold)]/5 blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] rounded-full bg-[var(--color-navy)]/5 blur-[60px] sm:blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: `radial-gradient(circle, var(--color-text) 1px, transparent 1px)`, backgroundSize: "32px 32px" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">

          {/* LEFT — Content */}
          <div className="min-w-0">
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="section-badge w-fit">
              <Zap size={12} />
              {t.hero_badge}
            </motion.div>

            <motion.h1
              custom={1} variants={fadeUp} initial="hidden" animate="show"
              className="font-display font-bold text-[2rem] sm:text-4xl lg:text-[3.4rem] xl:text-[3.8rem] leading-[1.1] tracking-tight text-[var(--color-text)] mb-4"
            >
              {t.hero_headline}{" "}
              <span className="text-gold-gradient">{t.hero_headline_gold}</span>
            </motion.h1>

            <motion.p
              custom={2} variants={fadeUp} initial="hidden" animate="show"
              className="text-[var(--color-text-secondary)] text-base sm:text-lg leading-relaxed mb-8 max-w-lg"
            >
              {t.hero_subtitle}
            </motion.p>

            <motion.ul
              custom={3} variants={fadeUp} initial="hidden" animate="show"
              className="flex flex-wrap gap-x-6 gap-y-2 mb-8"
            >
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <CheckCircle2 size={15} className="text-[var(--color-success)] shrink-0" />
                  {h}
                </li>
              ))}
            </motion.ul>

            <motion.div
              custom={4} variants={fadeUp} initial="hidden" animate="show"
              className="flex flex-col sm:flex-row flex-wrap gap-3 mb-10"
            >
              <Link href="/products" className="btn-primary justify-center sm:justify-start">
                {t.hero_explore} <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="btn-gold text-center sm:text-left">
                {t.hero_consult}
              </Link>
              <button
                onClick={() => setVideoOpen(true)}
                className="btn-outline flex items-center justify-center gap-2"
              >
                <span className="w-8 h-8 rounded-full bg-[var(--color-navy)] flex items-center justify-center shrink-0">
                  <Play size={12} className="text-white ml-0.5" fill="white" />
                </span>
                {t.hero_watch_demo}
              </button>
            </motion.div>

            <motion.div
              custom={5} variants={fadeUp} initial="hidden" animate="show"
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-[var(--color-border)]"
            >
              {stats.map(({ icon: Icon, value, suffix, label }) => (
                <div key={label} className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
                    <Icon size={14} className="text-[var(--color-gold)]" />
                    <span className="font-display font-bold text-xl text-[var(--color-text)]">
                      <AnimatedCounter end={value} suffix={suffix} />
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
                </div>
              ))}
            </motion.div>

            {/* Mobile — slider */}
            <motion.div
              custom={6} variants={fadeUp} initial="hidden" animate="show"
              className="lg:hidden mt-8"
            >
              <div className="relative rounded-2xl overflow-hidden border shadow-[var(--shadow-card)]"
                style={{ borderColor: "var(--color-border)" }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.35 }}
                  >
                    {/* Browser bar */}
                    <div className="h-8 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] flex items-center px-3 gap-2">
                      <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 mx-3">
                        <div className="h-4 rounded bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center px-2 gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: slide.color }} />
                          <span className="text-[9px] text-[var(--color-text-muted)]">{slide.url}</span>
                        </div>
                      </div>
                    </div>
                    {/* Website preview */}
                    <div style={{ background: slide.bgColor }}>
                      <div className="flex items-center justify-between px-3 py-2" style={{ background: slide.color }}>
                        <div className="flex items-center gap-1.5">
                          <slide.icon size={13} className="text-white" />
                          <span className="text-white font-bold text-[10px]">{slide.siteName}</span>
                        </div>
                        <div className="flex gap-2">
                          {["Home", "About", "Contact"].map(n => (
                            <span key={n} className="text-white/70 text-[8px]">{n}</span>
                          ))}
                        </div>
                      </div>
                      <div className="px-3 py-4" style={{ background: `linear-gradient(135deg, ${slide.color}18 0%, ${slide.color}05 100%)` }}>
                        <div className="h-2 rounded-full w-3/5 mb-1" style={{ background: slide.color }} />
                        <div className="h-1.5 rounded-full w-2/5 bg-gray-300 mb-2" />
                        <div className="flex gap-1.5">
                          <div className="h-6 rounded-md px-3 flex items-center text-[8px] font-bold text-white" style={{ background: slide.color }}>
                            Get Started
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 px-3 pb-3">
                        {slide.features.map((f, fi) => (
                          <div key={fi} className="rounded-lg p-2 border bg-white/50" style={{ borderColor: `${slide.color}30` }}>
                            <p className="text-[7px] font-semibold leading-tight" style={{ color: slide.color }}>{f}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Mobile slide info */}
              <div className="flex items-center justify-between mt-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${slide.color}15` }}>
                    <slide.icon size={16} style={{ color: slide.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-[var(--color-text)]">{slide.name}</p>
                    <div className="flex items-center gap-1">
                      <Star size={9} fill="#C9A227" className="text-[var(--color-gold)]" />
                      <span className="text-[9px] text-[var(--color-text-muted)]">{slide.rating} · {slide.clients} clients</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 text-right">
                  <div>
                    <p className="text-[8px] text-[var(--color-text-muted)]">Basic</p>
                    <p className="font-bold text-xs text-[var(--color-text)]">${slide.basic}</p>
                  </div>
                  <div className="px-2 py-1 rounded-lg" style={{ background: `${slide.color}15` }}>
                    <p className="text-[8px]" style={{ color: slide.color }}>Premium</p>
                    <p className="font-bold text-xs" style={{ color: slide.color }}>${slide.premium}</p>
                  </div>
                </div>
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                {PRODUCT_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{ width: i === activeSlide ? "20px" : "6px", background: i === activeSlide ? slide.color : "var(--color-border)" }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT — Service Image Slider (desktop only) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative hidden lg:flex flex-col items-center justify-center"
            style={{ minHeight: "560px" }}
            onMouseEnter={() => setSliderHovered(true)}
            onMouseLeave={() => setSliderHovered(false)}
          >
            {/* Ambient glow that changes per slide */}
            <motion.div
              key={`glow-${activeSlide}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 pointer-events-none"
            >
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[100px]"
                style={{ background: `${slide.color}18` }}
              />
              <div className="absolute top-1/4 right-4 w-40 h-40 rounded-full blur-[60px]"
                style={{ background: `${slide.color}10` }} />
            </motion.div>

            {/* Browser frame + website mockup */}
            <div className="relative w-full max-w-md z-10">

              {/* Arrow — Prev */}
              <button
                onClick={goPrev}
                className="absolute -left-5 top-[45%] -translate-y-1/2 z-30 w-9 h-9 rounded-full glass-card flex items-center justify-center shadow-[var(--shadow-card)] hover:scale-110 transition-transform"
              >
                <ChevronLeft size={16} className="text-[var(--color-text)]" />
              </button>

              {/* Arrow — Next */}
              <button
                onClick={goNext}
                className="absolute -right-5 top-[45%] -translate-y-1/2 z-30 w-9 h-9 rounded-full glass-card flex items-center justify-center shadow-[var(--shadow-card)] hover:scale-110 transition-transform"
              >
                <ChevronRight size={16} className="text-[var(--color-text)]" />
              </button>

              {/* Browser frame */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, x: 50, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  className="rounded-2xl overflow-hidden border shadow-[var(--shadow-luxury)]"
                  style={{ borderColor: `${slide.color}30` }}
                >
                  {/* Browser top bar */}
                  <div className="h-10 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] flex items-center px-4 gap-3">
                    <div className="flex gap-1.5 shrink-0">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                      <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                      <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                    </div>
                    <div className="flex-1">
                      <div className="h-6 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center px-3 gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: slide.color }} />
                        <span className="text-[10px] text-[var(--color-text-muted)] truncate">{slide.url}</span>
                        <div className="ml-auto flex gap-1">
                          <div className="w-3 h-2 rounded-sm bg-[var(--color-border)]" />
                          <div className="w-3 h-2 rounded-sm bg-[var(--color-border)]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Website content */}
                  <div style={{ background: slide.bgColor }}>

                    {/* Website nav/header */}
                    <div
                      className="flex items-center justify-between px-5 py-3"
                      style={{ background: slide.color }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                          <slide.icon size={13} className="text-white" />
                        </div>
                        <span className="text-white font-bold text-xs">{slide.siteName}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {["Home", "About", "Services", "Contact"].map(n => (
                          <span key={n} className="text-white/75 text-[9px] font-medium">{n}</span>
                        ))}
                        <div className="h-5 px-2.5 rounded-full bg-white/20 flex items-center">
                          <span className="text-white text-[8px] font-bold">Book Now</span>
                        </div>
                      </div>
                    </div>

                    {/* Hero section of the website */}
                    <div
                      className="px-5 py-6"
                      style={{ background: `linear-gradient(135deg, ${slide.color}14 0%, ${slide.color}04 100%)` }}
                    >
                      <div className="mb-1">
                        <span
                          className="text-[8px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${slide.color}20`, color: slide.color }}
                        >
                          {slide.tag}
                        </span>
                      </div>
                      <div className="h-3 rounded-full w-3/4 mt-2 mb-1.5" style={{ background: `${slide.color}80` }} />
                      <div className="h-2 rounded-full w-1/2 bg-gray-300/60 mb-1" />
                      <div className="h-2 rounded-full w-2/5 bg-gray-300/40 mb-4" />
                      <div className="flex gap-2">
                        <div
                          className="h-8 rounded-xl px-4 flex items-center text-[9px] font-bold text-white shadow-sm"
                          style={{ background: slide.color }}
                        >
                          Get Started
                        </div>
                        <div
                          className="h-8 rounded-xl px-4 flex items-center text-[9px] font-bold border"
                          style={{ borderColor: slide.color, color: slide.color }}
                        >
                          View Demo
                        </div>
                      </div>
                    </div>

                    {/* Feature cards row */}
                    <div className="grid grid-cols-3 gap-2.5 px-5 pb-4 pt-1">
                      {slide.features.map((feat, fi) => (
                        <div
                          key={fi}
                          className="rounded-xl p-3 border bg-white/60 shadow-sm"
                          style={{ borderColor: `${slide.color}20` }}
                        >
                          <div
                            className="w-6 h-6 rounded-lg mb-2 flex items-center justify-center"
                            style={{ background: `${slide.color}20` }}
                          >
                            <slide.icon size={12} style={{ color: slide.color }} />
                          </div>
                          <p className="text-[9px] font-bold leading-tight" style={{ color: slide.color }}>
                            {feat}
                          </p>
                          <div className="h-1 rounded-full bg-gray-200 mt-1.5 w-4/5" />
                          <div className="h-1 rounded-full bg-gray-200 mt-1 w-3/5" />
                        </div>
                      ))}
                    </div>

                    {/* Footer strip */}
                    <div
                      className="flex items-center justify-between px-5 py-2.5 border-t"
                      style={{ borderColor: `${slide.color}20`, background: `${slide.color}08` }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Star size={9} fill="#C9A227" className="text-yellow-500" />
                        <span className="text-[8px] font-bold text-gray-600">{slide.rating}</span>
                        <span className="text-[7px] text-gray-400">({slide.clients} clients)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[8px] text-gray-500">Live website</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Service info + pricing below the browser */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`info-${activeSlide}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 flex items-center justify-between px-1"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${slide.color}15` }}
                    >
                      <slide.icon size={20} style={{ color: slide.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[var(--color-text)]">{slide.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Star size={10} fill="#C9A227" className="text-[var(--color-gold)]" />
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          {slide.rating} · {slide.clients} clients
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <div className="text-right">
                      <p className="text-[9px] text-[var(--color-text-muted)]">Basic</p>
                      <p className="font-bold text-base text-[var(--color-text)]">${slide.basic}</p>
                    </div>
                    <div
                      className="text-center px-3 py-1.5 rounded-xl"
                      style={{ background: `${slide.color}12` }}
                    >
                      <p className="text-[9px] font-medium" style={{ color: slide.color }}>Premium</p>
                      <p className="font-bold text-base" style={{ color: slide.color }}>${slide.premium}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dot navigation */}
              <div className="flex justify-center gap-1.5 mt-4">
                {PRODUCT_SLIDES.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === activeSlide ? "24px" : "6px",
                      background: i === activeSlide ? slide.color : "var(--color-border)",
                    }}
                    title={s.name}
                  />
                ))}
              </div>
            </div>

            {/* Floating badge — Live Orders */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="absolute top-8 -left-6 glass-card px-3 py-2.5 shadow-[var(--shadow-card)] flex items-center gap-2 z-20"
            >
              <div className="live-dot shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-[var(--color-text)]">Live Orders</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">+12 today</p>
              </div>
            </motion.div>

            {/* Floating badge — Rating */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              className="absolute bottom-28 -right-4 glass-card px-3 py-2.5 shadow-[var(--shadow-card)] text-center z-20"
            >
              <div className="flex gap-0.5 justify-center mb-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} size={11} fill="#C9A227" className="text-[var(--color-gold)]" />)}
              </div>
              <p className="text-xs font-bold text-[var(--color-text)]">4.9/5</p>
              <p className="text-[9px] text-[var(--color-text-muted)]">1,200+ reviews</p>
            </motion.div>

            {/* Floating badge — Delivery */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.5 }}
              className="absolute top-1/2 -right-8 glass-card px-3 py-2.5 shadow-[var(--shadow-card)] z-20"
            >
              <p className="text-[10px] font-bold text-[var(--color-text)]">⚡ Fast Delivery</p>
              <p className="text-[9px] text-[var(--color-text-muted)]">1–5 business days</p>
            </motion.div>
          </motion.div>
        </div>
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
