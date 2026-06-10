"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Play, CheckCircle2, TrendingUp, Users, Star, Zap, X,
  ChevronLeft, ChevronRight, Globe, Cpu, BarChart3, Smartphone, Bot,
  Utensils, GraduationCap, Hospital, Building2, ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { FloatingOrbs } from "@/components/ui/FloatingOrbs";
import { AnimatedGradientBorder } from "@/components/ui/AnimatedGradientBorder";
import { useLanguage } from "@/contexts/LanguageContext";

const SLIDE_PRODUCTS = [
  { icon: Cpu,           name: "CRM Software",              category: "SaaS",               tag: "Enterprise",    basicINR: 49900,  premiumINR: 99900,  photo: "/photos/person-laptop.jpg",  accentColor: "#7C3AED" },
  { icon: Utensils,      name: "Restaurant Website",        category: "Food & Hospitality",  tag: "Most Popular",  basicINR: 12999,  premiumINR: 24999,  photo: "/photos/restaurant.jpg",     accentColor: "#FF6B35" },
  { icon: GraduationCap, name: "School Management System",  category: "Education",           tag: "Best Seller",   basicINR: 29999,  premiumINR: 59999,  photo: "/photos/school.jpg",         accentColor: "#16A34A" },
  { icon: ShoppingCart,  name: "E-commerce Platform",       category: "Retail",              tag: "New",           basicINR: 19999,  premiumINR: 39999,  photo: "/photos/fashion.jpg",        accentColor: "#7C3AED" },
  { icon: Hospital,      name: "Hospital Management",       category: "Healthcare",          tag: "Enterprise",    basicINR: 49999,  premiumINR: 99999,  photo: "/photos/hospital.jpg",       accentColor: "#0891B2" },
  { icon: Building2,     name: "Real Estate Website",       category: "Real Estate",         tag: "Premium",       basicINR: 22999,  premiumINR: 44999,  photo: "/photos/office-meeting.jpg", accentColor: "#C9A227" },
];

const SLIDE_DURATION_MS   = 4500;   // time on each product slide
const INITIAL_IMAGE_MS    = 30000;  // home.png shown for 30s on first load
const LOOP_IMAGE_MS       = 60000;  // home.png shown for 1 min after slider completes

const DEMO_VIDEO_ID = "UL76TS335Vs";

function fadeUp(i: number, mounted: boolean) {
  return {
    opacity: mounted ? 1 : 0,
    y: mounted ? 0 : 20,
    transition: { duration: 0.55, delay: mounted ? i * 0.08 : 0, ease: [0.25, 0.1, 0.25, 1] as const },
  };
}


export function Hero() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  // Right-side timed display: 'image' shows home.png, 'slider' shows product carousel
  const [rightMode, setRightMode] = useState<"image" | "slider">("image");
  const [slideIndex, setSlideIndex] = useState(0);
  const imageDurationRef = useRef(INITIAL_IMAGE_MS);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setVideoOpen(false); };
    if (videoOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [videoOpen]);

  // Timer: image mode → switch to slider after duration
  useEffect(() => {
    if (rightMode !== "image") return;
    const t = setTimeout(() => {
      setSlideIndex(0);
      setRightMode("slider");
    }, imageDurationRef.current);
    return () => clearTimeout(t);
  }, [rightMode]);

  // Timer: slider auto-advance; on last slide → switch back to image (1 min)
  useEffect(() => {
    if (rightMode !== "slider") return;
    const isLast = slideIndex >= SLIDE_PRODUCTS.length - 1;
    const delay = isLast ? SLIDE_DURATION_MS + 500 : SLIDE_DURATION_MS;
    const t = setTimeout(() => {
      if (isLast) {
        imageDurationRef.current = LOOP_IMAGE_MS;
        setRightMode("image");
      } else {
        setSlideIndex(prev => prev + 1);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [rightMode, slideIndex]);

  const goSlide = (dir: 1 | -1) => {
    setSlideIndex(prev =>
      Math.max(0, Math.min(SLIDE_PRODUCTS.length - 1, prev + dir))
    );
  };

  const stats = [
    { icon: Users, value: 5000, suffix: "+", label: t.stat_clients },
    { icon: TrendingUp, value: 12500, suffix: "+", label: t.stat_projects },
    { icon: CheckCircle2, value: 99.99, suffix: "%", label: t.stat_uptime },
    { icon: Star, value: 24, suffix: "/7", label: t.stat_support },
  ];

  const highlights = [t.hero_h1, t.hero_h2, t.hero_h3];

  return (
    <section className="relative min-h-screen flex flex-col justify-start lg:justify-center overflow-hidden pt-[104px] grid-bg">
      {/* Floating orbs background */}
      <FloatingOrbs count={5} />

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[280px] sm:w-[600px] h-[280px] sm:h-[600px] rounded-full bg-[var(--color-gold)]/5 blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] rounded-full bg-[var(--color-navy)]/5 blur-[60px] sm:blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: `radial-gradient(circle, var(--color-text) 1px, transparent 1px)`, backgroundSize: "32px 32px" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">

          {/* LEFT — Content */}
          <div className="min-w-0">
            <motion.div animate={fadeUp(0, mounted)} className="section-badge w-fit">
              <Zap size={12} />
              {t.hero_badge}
            </motion.div>

            <motion.h1
              animate={fadeUp(1, mounted)}
              className="font-display font-bold text-[2rem] sm:text-4xl lg:text-[3.4rem] xl:text-[3.8rem] leading-[1.1] tracking-tight text-[var(--color-text)] mb-4 text-glow-gold"
            >
              {t.hero_headline}{" "}
              <span className="text-gold-gradient">{t.hero_headline_gold}</span>
            </motion.h1>

            <motion.ul
              animate={fadeUp(3, mounted)}
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
              animate={fadeUp(4, mounted)}
              className="flex flex-col sm:flex-row flex-wrap gap-3 mb-10"
            >
              <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.18 }}>
                <Link href="/products" className="btn-primary justify-center sm:justify-start">
                  {t.hero_explore} <ArrowRight size={16} />
                </Link>
              </motion.div>
              <AnimatedGradientBorder borderWidth={2}>
                <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.18 }}>
                  <Link href="/contact" className="btn-gold text-center sm:text-left glow-gold-hover">
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

            <motion.div
              animate={fadeUp(5, mounted)}
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

            {/* Mobile — hero image */}
            <motion.div
              animate={fadeUp(6, mounted)}
              className="lg:hidden mt-8"
            >
              <Image
                src="/images/home-hero.png"
                alt="KVL TECH Business Solutions"
                width={600}
                height={480}
                className="w-full h-auto rounded-2xl shadow-[var(--shadow-luxury)]"
                priority
              />
            </motion.div>
          </div>

          {/* RIGHT — Timed display: home.png ↔ product slider (desktop only) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[100px] bg-[var(--color-gold)]/10" />
            </div>

            <AnimatePresence mode="wait">
              {rightMode === "image" ? (
                <motion.div
                  key="home-image"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                  className="relative z-10 w-full"
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
              ) : (
                <motion.div
                  key="product-slider"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                  className="relative z-10 w-full"
                >
                  {/* Slider card */}
                  <div className="relative rounded-3xl overflow-hidden shadow-[var(--shadow-luxury)] bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)]">

                    {/* Nav arrows */}
                    <button
                      onClick={() => goSlide(-1)}
                      disabled={slideIndex === 0}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 dark:bg-black/60 shadow flex items-center justify-center text-[var(--color-text)] disabled:opacity-30 hover:bg-white transition"
                      aria-label="Previous"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => goSlide(1)}
                      disabled={slideIndex === SLIDE_PRODUCTS.length - 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 dark:bg-black/60 shadow flex items-center justify-center text-[var(--color-text)] disabled:opacity-30 hover:bg-white transition"
                      aria-label="Next"
                    >
                      <ChevronRight size={18} />
                    </button>

                    {/* Slide content */}
                    <AnimatePresence mode="wait">
                      {SLIDE_PRODUCTS.map((product, i) =>
                        i === slideIndex ? (
                          <motion.div
                            key={product.name}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
                          >
                            {/* Product image */}
                            <div className="relative h-56 w-full overflow-hidden">
                              <Image
                                src={product.photo}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="680px"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                              {/* Tag badge */}
                              <span
                                className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
                                style={{ background: product.accentColor }}
                              >
                                {product.tag}
                              </span>
                              {/* Live badge */}
                              <span className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 dark:bg-black/70 text-[var(--color-text)] text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Live Website
                              </span>
                            </div>

                            {/* Product info */}
                            <div className="p-5">
                              <div className="flex items-center gap-2.5 mb-1">
                                <span
                                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                                  style={{ background: product.accentColor + "22" }}
                                >
                                  <product.icon size={16} style={{ color: product.accentColor }} />
                                </span>
                                <div>
                                  <p className="font-bold text-[var(--color-text)] text-base leading-tight">{product.name}</p>
                                  <p className="text-xs text-[var(--color-text-muted)]">{product.category}</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                <div>
                                  <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Basic / Premium</p>
                                  <p className="text-sm font-semibold text-[var(--color-text)]">
                                    ₹{product.basicINR.toLocaleString("en-IN")}
                                    <span className="text-[var(--color-gold)] font-bold ml-2">
                                      ₹{product.premiumINR.toLocaleString("en-IN")}
                                    </span>
                                  </p>
                                </div>
                                <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                                  <Star size={12} fill="currentColor" /> 4.9/5
                                </span>
                              </div>

                              {/* Progress bar for auto-advance */}
                              <div className="mt-4 h-1 rounded-full bg-[var(--color-border)] overflow-hidden">
                                <motion.div
                                  key={`${slideIndex}-progress`}
                                  className="h-full rounded-full"
                                  style={{ background: product.accentColor }}
                                  initial={{ width: "0%" }}
                                  animate={{ width: "100%" }}
                                  transition={{ duration: SLIDE_DURATION_MS / 1000, ease: "linear" }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        ) : null
                      )}
                    </AnimatePresence>

                    {/* Dot navigation */}
                    <div className="flex justify-center gap-1.5 pb-4">
                      {SLIDE_PRODUCTS.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSlideIndex(i)}
                          className="transition-all duration-300"
                          aria-label={`Slide ${i + 1}`}
                        >
                          <span
                            className="block rounded-full transition-all duration-300"
                            style={{
                              width: i === slideIndex ? 20 : 6,
                              height: 6,
                              background: i === slideIndex
                                ? SLIDE_PRODUCTS[slideIndex].accentColor
                                : "var(--color-border)",
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
