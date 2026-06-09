"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Bot, Zap, TrendingUp, Users, BarChart3,
  ArrowRight, CheckCircle, Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { ChatWidget } from "@/components/ui/ChatWidget";

const SOLUTIONS = [
  {
    icon: Bot,
    title: "AI Solutions",
    subtitle: "Artificial Intelligence for your business",
    description: "Smart automation, AI chatbots, predictive analytics, and intelligent workflows that transform your operations.",
    href: "/solutions/ai",
    color: "#7C3AED",
    bg: "#7C3AED",
    stats: ["80% faster responses", "24/7 AI assistant", "Smart analytics"],
    tag: "Most Popular",
  },
  {
    icon: Zap,
    title: "Business Automation",
    subtitle: "Automate repetitive tasks",
    description: "End-to-end business process automation — from lead capture to delivery, everything runs on autopilot.",
    href: "/solutions/automation",
    color: "#F59E0B",
    bg: "#F59E0B",
    stats: ["90% less manual work", "Zero errors", "Real-time tracking"],
    tag: "Best Seller",
  },
  {
    icon: TrendingUp,
    title: "Marketing Solutions",
    subtitle: "Grow your customer base",
    description: "SEO, paid ads, email campaigns, WhatsApp marketing, and social media management — all in one platform.",
    href: "/solutions/marketing",
    color: "#10B981",
    bg: "#10B981",
    stats: ["3X more leads", "Higher conversions", "ROI tracking"],
    tag: null,
  },
  {
    icon: Users,
    title: "CRM Systems",
    subtitle: "Manage leads & clients",
    description: "Complete Customer Relationship Management — lead pipeline, follow-ups, deals tracking, and team performance.",
    href: "/solutions/crm",
    color: "#0891B2",
    bg: "#0891B2",
    stats: ["3X lead conversion", "Auto follow-ups", "Team insights"],
    tag: null,
  },
  {
    icon: BarChart3,
    title: "ERP Systems",
    subtitle: "Enterprise resource planning",
    description: "Integrated ERP covering inventory, HR, payroll, billing, procurement, and financial reporting.",
    href: "/solutions/erp",
    color: "#C9A227",
    bg: "#C9A227",
    stats: ["Full visibility", "Cost reduction", "GST compliant"],
    tag: "Enterprise",
  },
];

const BENEFITS = [
  "Custom-built for your business",
  "Delivered in 3–15 days",
  "Full source code included",
  "30–90 day support",
  "Mobile-first design",
  "Razorpay & UPI integrated",
];

export default function SolutionsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[104px]">

        {/* Hero */}
        <section className="relative py-20 overflow-hidden bg-[var(--color-bg-secondary)]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <svg className="absolute top-0 left-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="sol-nakk" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M30 2L58 30L30 58L2 30Z" stroke="#C9A227" strokeWidth="0.8" fill="none"/>
                  <circle cx="30" cy="30" r="6" stroke="#C9A227" strokeWidth="0.6" fill="none"/>
                  <circle cx="30" cy="30" r="1.5" fill="#C9A227"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#sol-nakk)"/>
            </svg>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(201,162,39,0.07)_0%,transparent_65%)]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(124,58,237,0.05)_0%,transparent_65%)]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="section-badge mx-auto mb-4">Our Solutions</div>
              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[var(--color-text)] mb-6 leading-tight">
                Digital Solutions for <br className="hidden sm:block" />
                <span className="text-gold-gradient">Every Business</span>
              </h1>
              <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-8">
                From AI-powered automation to complete ERP systems — we build custom digital solutions
                that transform the way your business operates.
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                {BENEFITS.map(b => (
                  <span key={b} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[var(--color-text-secondary)]">
                    <CheckCircle size={13} className="text-[var(--color-gold)] shrink-0" /> {b}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Solutions grid */}
        <section className="py-16 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SOLUTIONS.map((sol, i) => {
                const Icon = sol.icon;
                return (
                  <motion.div
                    key={sol.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className={i === 0 ? "md:col-span-2 lg:col-span-1" : ""}
                  >
                    <Link href={sol.href} className="group block h-full">
                      <div className="relative h-full bg-white dark:bg-[#0D1628] rounded-3xl overflow-hidden border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1.5 p-6 flex flex-col">

                        {/* Nakkashi corner ornament */}
                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                          <svg className="absolute -top-4 -right-4 opacity-[0.08]" width="100" height="100" viewBox="0 0 100 100" fill="none">
                            <circle cx="100" cy="0" r="35"  stroke={sol.color} strokeWidth="1.2"/>
                            <circle cx="100" cy="0" r="55"  stroke={sol.color} strokeWidth="0.8"/>
                            <circle cx="100" cy="0" r="75"  stroke={sol.color} strokeWidth="0.5"/>
                          </svg>
                          <div className="absolute bottom-0 left-0 right-0 h-1 opacity-60"
                            style={{ background: `linear-gradient(90deg, transparent, ${sol.color}40, transparent)` }} />
                        </div>

                        {/* Icon + Tag */}
                        <div className="flex items-start justify-between mb-5 relative">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
                            style={{ background: `${sol.bg}15` }}>
                            <Icon size={26} style={{ color: sol.color }} />
                          </div>
                          {sol.tag && (
                            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full text-white"
                              style={{ background: sol.color }}>
                              {sol.tag}
                            </span>
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 relative">
                          <p className="text-[11px] font-semibold uppercase tracking-widest mb-1"
                            style={{ color: sol.color }}>
                            {sol.subtitle}
                          </p>
                          <h2 className="font-display font-bold text-xl text-[var(--color-text)] mb-3 leading-snug">
                            {sol.title}
                          </h2>
                          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5">
                            {sol.description}
                          </p>

                          {/* Stats */}
                          <div className="flex flex-wrap gap-2 mb-5">
                            {sol.stats.map(s => (
                              <span key={s} className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border"
                                style={{ color: sol.color, background: `${sol.bg}0D`, borderColor: `${sol.color}30` }}>
                                <Sparkles size={8} /> {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-2 text-sm font-bold relative"
                          style={{ color: sol.color }}>
                          <span>Explore Solution</span>
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                        </div>

                        {/* Bottom color bar on hover */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ background: `linear-gradient(90deg, transparent, ${sol.color}, transparent)` }} />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
          <div className="max-w-3xl mx-auto text-center px-4">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--color-text)] mb-3">
              Need a custom solution?
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              Tell us your requirements — we build exactly what your business needs.
            </p>
            <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
              Talk to Our Team <ArrowRight size={16} />
            </Link>
          </div>
        </section>

      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
    </>
  );
}
