"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Headphones, Award, GitBranch, TrendingUp } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import Link from "next/link";
import Image from "next/image";

const stats = [
  { value: 12500, suffix: "+", label: "Projects Delivered", icon: GitBranch },
  { value: 5000, suffix: "+", label: "Happy Clients", icon: Award },
  { value: 10, suffix: "+", label: "Years of Excellence", icon: TrendingUp },
  { value: 99.99, suffix: "%", label: "Uptime Guarantee", icon: Shield },
  { value: 24, suffix: "/7", label: "Expert Support", icon: Headphones },
  { value: 4.9, suffix: "/5", label: "Client Rating", icon: Zap },
];

const reasons = [
  {
    icon: Shield,
    title: "Full Source Code Ownership",
    desc: "You own 100% of the code. No lock-in, no recurring fees. Your product, forever.",
  },
  {
    icon: Award,
    title: "Complete Company Branding",
    desc: "Every product is fully customized with your company name, logo, colors, and domain.",
  },
  {
    icon: Zap,
    title: "Lightning Fast Delivery",
    desc: "Basic plans delivered in 3-5 days. Premium in 1-2 days. Custom in 7-15 days.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support Team",
    desc: "24/7 expert support via phone, WhatsApp, and email throughout your entire journey.",
  },
  {
    icon: TrendingUp,
    title: "SEO-Optimized by Default",
    desc: "Every product ships with 90+ Lighthouse score, structured data, and technical SEO.",
  },
  {
    icon: GitBranch,
    title: "Modern Tech Stack",
    desc: "Built with Next.js, React, Node.js — scalable architecture for any business size.",
  },
];

export function WhyKVLTech() {
  return (
    <section className="py-20 lg:py-28 bg-[var(--color-bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT */}
          <div>
            <div className="section-badge">Why Choose KVL TECH</div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[var(--color-text)] mb-5 leading-tight">
              Results That Drive{" "}
              <span className="text-gold-gradient">Growth</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg mb-8 leading-relaxed">
              We don&apos;t just build websites or software. We build long-term growth
              engines for your business — with full ownership, branding, and support.
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
              Know More About Us
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
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              {/* Gold accent bar */}
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
