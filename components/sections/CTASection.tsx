"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

export function CTASection() {
  const { t } = useLanguage();

  const guarantees = [
    { icon: Zap, text: t.cta_g1 },
    { icon: Shield, text: t.cta_g2 },
    { icon: Clock, text: t.cta_g3 },
  ];

  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E2D4A 50%, #0F172A 100%)" }}>
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-80 h-80 rounded-full bg-[var(--color-gold)]/8 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-blue-600/10 blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-0 items-end min-h-[420px]">

          {/* LEFT — Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="py-16 lg:py-20"
          >
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white mb-3 leading-tight">
              {t.cta_title}{" "}
              <span className="text-gold-gradient">{t.cta_title_gold}</span>
            </h2>
            <p className="text-white/60 text-lg mb-8 leading-relaxed max-w-md">
              {t.cta_sub}
            </p>

            {/* Guarantees */}
            <div className="flex flex-col gap-4 mb-10">
              {guarantees.map((g) => (
                <div key={g.text} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-gold)]/15 flex items-center justify-center shrink-0">
                    <g.icon size={16} className="text-[var(--color-gold)]" />
                  </div>
                  <span className="text-white/75 text-sm">{g.text}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="btn-gold">
                {t.cta_consult} <ArrowRight size={16} />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
              >
                {t.cta_project}
              </Link>
            </div>
          </motion.div>

          {/* RIGHT — Person with laptop photo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:flex items-end justify-end h-full"
          >
            <div className="relative w-full h-[420px]">
              <Image
                src="/photos/person-laptop.jpg"
                alt="Business professional with laptop"
                fill
                className="object-cover object-top"
                sizes="50vw"
                style={{
                  maskImage: "linear-gradient(to right, transparent 0%, black 25%, black 85%, transparent 100%), linear-gradient(to top, transparent 0%, black 8%)",
                  WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 25%, black 85%, transparent 100%)",
                  maskComposite: "intersect",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
