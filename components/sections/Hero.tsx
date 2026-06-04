"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, TrendingUp, Users, Star, Zap, ShoppingCart, GraduationCap, Utensils, Hospital, Building2, Globe } from "lucide-react";
import Link from "next/link";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

const PRODUCT_CARDS = [
  { icon: Utensils, name: "Restaurant Website", tag: "Most Popular", basic: 156, premium: 299, clients: 234, rating: 4.9, color: "#FF6B35", delay: 0, x: 0, y: 0 },
  { icon: GraduationCap, name: "School Management", tag: "Best Seller", basic: 359, premium: 719, clients: 189, rating: 4.8, color: "#16A34A", delay: 0.15, x: 60, y: 100 },
  { icon: Hospital, name: "Hospital System", tag: "Enterprise", basic: 599, premium: 1199, clients: 98, rating: 5.0, color: "#0891B2", delay: 0.3, x: -40, y: 200 },
  { icon: ShoppingCart, name: "E-commerce Store", tag: "New", basic: 192, premium: 479, clients: 156, rating: 4.7, color: "#7C3AED", delay: 0.45, x: 80, y: 310 },
  { icon: Building2, name: "Real Estate Site", tag: "Premium", basic: 275, premium: 539, clients: 112, rating: 4.9, color: "#C9A227", delay: 0.6, x: -20, y: 420 },
];

export function Hero() {
  const { t } = useLanguage();

  const stats = [
    { icon: Users, value: 5000, suffix: "+", label: t.stat_clients },
    { icon: TrendingUp, value: 12500, suffix: "+", label: t.stat_projects },
    { icon: CheckCircle2, value: 99.99, suffix: "%", label: t.stat_uptime },
    { icon: Star, value: 24, suffix: "/7", label: t.stat_support },
  ];

  const highlights = [t.hero_h1, t.hero_h2, t.hero_h3];

  return (
    <section className="relative min-h-screen flex flex-col justify-start lg:justify-center overflow-hidden pt-[104px]">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[var(--color-gold)]/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[var(--color-navy)]/5 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(circle, var(--color-text) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT — Content */}
          <div>
            {/* Badge */}
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="section-badge w-fit"
            >
              <Zap size={12} />
              {t.hero_badge}
            </motion.div>

            {/* Headline */}
            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="font-display font-bold text-4xl sm:text-5xl lg:text-[3.4rem] xl:text-[3.8rem] leading-[1.08] tracking-tight text-[var(--color-text)] mb-4"
            >
              {t.hero_headline}{" "}
              <span className="text-gold-gradient">{t.hero_headline_gold}</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="text-[var(--color-text-secondary)] text-lg leading-relaxed mb-8 max-w-lg"
            >
              {t.hero_subtitle}
            </motion.p>

            {/* Highlights */}
            <motion.ul
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="flex flex-wrap gap-x-6 gap-y-2 mb-8"
            >
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <CheckCircle2 size={15} className="text-[var(--color-success)] shrink-0" />
                  {h}
                </li>
              ))}
            </motion.ul>

            {/* CTA Buttons */}
            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="flex flex-wrap gap-3 mb-10"
            >
              <Link href="/products" className="btn-primary">
                {t.hero_explore} <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="btn-gold">
                {t.hero_consult}
              </Link>
              <button className="btn-outline flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[var(--color-navy)] flex items-center justify-center shrink-0">
                  <Play size={12} className="text-white ml-0.5" fill="white" />
                </span>
                {t.hero_watch_demo}
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              custom={5}
              variants={fadeUp}
              initial="hidden"
              animate="show"
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
          </div>

          {/* RIGHT — Floating Product Cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative hidden lg:flex items-center justify-center"
            style={{ minHeight: "560px" }}
          >
            {/* Central glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[var(--color-gold)]/10 blur-[80px]" />
              <div className="absolute top-1/4 right-0 w-48 h-48 rounded-full bg-blue-500/8 blur-[60px]" />
              <div className="absolute bottom-1/4 left-0 w-40 h-40 rounded-full bg-purple-500/8 blur-[60px]" />
            </div>

            {/* Product cards stacked with offset */}
            <div className="relative w-full max-w-sm">
              {PRODUCT_CARDS.map((card, i) => (
                <motion.div
                  key={card.name}
                  initial={{ opacity: 0, x: 60, scale: 0.85 }}
                  animate={{
                    opacity: 1,
                    x: card.x,
                    scale: 1,
                    y: [0, -8, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.5, delay: 0.4 + card.delay },
                    x: { duration: 0.6, delay: 0.4 + card.delay },
                    scale: { duration: 0.6, delay: 0.4 + card.delay },
                    y: {
                      duration: 3 + i * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: card.delay,
                    },
                  }}
                  whileHover={{ scale: 1.04, zIndex: 50 }}
                  className="absolute w-64 cursor-pointer"
                  style={{ top: card.y, zIndex: 10 - i }}
                >
                  <div
                    className="rounded-2xl p-4 border shadow-[var(--shadow-luxury)]"
                    style={{
                      background: "var(--color-bg)",
                      borderColor: i === 0 ? `${card.color}40` : "var(--color-border)",
                      boxShadow: i === 0 ? `0 8px 32px ${card.color}25` : undefined,
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${card.color}18` }}
                        >
                          <card.icon size={18} style={{ color: card.color }} />
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-[var(--color-text)] leading-tight">{card.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star size={10} fill="#C9A227" className="text-[var(--color-gold)]" />
                            <span className="text-[10px] text-[var(--color-text-muted)]">{card.rating} · {card.clients} clients</span>
                          </div>
                        </div>
                      </div>
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: `${card.color}18`, color: card.color }}
                      >
                        {card.tag}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                        <p className="text-[9px] text-[var(--color-text-muted)] mb-0.5">Basic</p>
                        <p className="font-bold text-sm text-[var(--color-text)]">${card.basic}</p>
                      </div>
                      <div
                        className="p-2 rounded-lg border"
                        style={{ background: `${card.color}10`, borderColor: `${card.color}30` }}
                      >
                        <p className="text-[9px] mb-0.5" style={{ color: card.color }}>Premium</p>
                        <p className="font-bold text-sm" style={{ color: card.color }}>${card.premium}</p>
                      </div>
                    </div>

                    {i === 0 && (
                      <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-[var(--color-border)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[9px] text-[var(--color-text-muted)]">3 people viewing now</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Spacer to keep container height */}
              <div style={{ height: "540px" }} />
            </div>

            {/* Floating badge — Live orders */}
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
    </section>
  );
}
