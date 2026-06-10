"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Play, CheckCircle2, TrendingUp, Users, Star, Zap, X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { FloatingOrbs } from "@/components/ui/FloatingOrbs";
import { AnimatedGradientBorder } from "@/components/ui/AnimatedGradientBorder";
import { useLanguage } from "@/contexts/LanguageContext";

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

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setVideoOpen(false); };
    if (videoOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [videoOpen]);

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

          {/* RIGHT — Hero Image (desktop only) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[100px] bg-[var(--color-gold)]/10" />
            </div>
            <Image
              src="/images/home-hero.png"
              alt="KVL TECH Business Solutions"
              width={680}
              height={560}
              className="w-full h-auto rounded-3xl relative z-10"
              priority
            />
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
