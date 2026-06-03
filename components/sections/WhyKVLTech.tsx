"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Headphones, Award, GitBranch, TrendingUp } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

export function WhyKVLTech() {
  const { t } = useLanguage();

  const stats = [
    { value: 12500, suffix: "+", label: t.stat_delivered, icon: GitBranch },
    { value: 5000, suffix: "+", label: t.stat_clients, icon: Award },
    { value: 10, suffix: "+", label: t.stat_years, icon: TrendingUp },
    { value: 99.99, suffix: "%", label: t.stat_uptime, icon: Shield },
    { value: 24, suffix: "/7", label: t.stat_support, icon: Headphones },
    { value: 4.9, suffix: "/5", label: t.stat_rating, icon: Zap },
  ];

  const reasons = [
    { icon: Shield, title: t.why_r1_t, desc: t.why_r1_d },
    { icon: Award, title: t.why_r2_t, desc: t.why_r2_d },
    { icon: Zap, title: t.why_r3_t, desc: t.why_r3_d },
    { icon: Headphones, title: t.why_r4_t, desc: t.why_r4_d },
    { icon: TrendingUp, title: t.why_r5_t, desc: t.why_r5_d },
    { icon: GitBranch, title: t.why_r6_t, desc: t.why_r6_d },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[var(--color-bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT */}
          <div>
            <div className="section-badge">{t.why_badge}</div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[var(--color-text)] mb-5 leading-tight">
              {t.why_title}{" "}
              <span className="text-gold-gradient">{t.why_title_gold}</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg mb-8 leading-relaxed">
              {t.why_sub}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {reasons.map((r, i) => (
                <motion.div
                  key={r.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="flex gap-3 p-4 rounded-xl hover:bg-[var(--color-bg)] transition-colors duration-200"
                >
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <r.icon size={17} className="text-[var(--color-gold)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[var(--color-text)] mb-0.5">{r.title}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{r.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link href="/about" className="btn-primary">
              {t.why_cta}
            </Link>
          </div>

          {/* RIGHT — Stats grid */}
          <div>
            {/* Office photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl overflow-hidden mb-6 aspect-[4/3] relative shadow-[var(--shadow-luxury)]"
            >
              <Image
                src="/photos/office-meeting.jpg"
                alt="KVL TECH Team Meeting"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {stats.map(({ value, suffix, label, icon: Icon }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="card p-4 text-center"
                >
                  <Icon size={18} className="text-[var(--color-gold)] mx-auto mb-2" />
                  <p className="font-display font-bold text-xl text-[var(--color-text)]">
                    <AnimatedCounter end={value} suffix={suffix} />
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-tight">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
