"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Target, Eye, Heart, Award, Users, TrendingUp, Zap,
  Shield, Code2, CheckCircle2, Globe, Headphones, Star, MessageCircle
} from "lucide-react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const TEAM = [
  { name: "Rahul Sharma", role: "CEO & Founder", initial: "R", color: "#0F172A", bio: "10+ years in software development with a passion for delivering scalable, affordable digital solutions to businesses of all sizes." },
  { name: "Priya Singh", role: "CTO", initial: "P", color: "#0891B2", bio: "Full-stack architect with deep expertise in Next.js, Node.js, and cloud infrastructure. Leads our engineering roadmap." },
  { name: "Kavya Mehta", role: "Head of Design", initial: "K", color: "#C9A227", bio: "Award-winning UI/UX designer who ensures every product looks premium and converts visitors into loyal customers." },
  { name: "Amit Verma", role: "Head of Sales", initial: "A", color: "#16A34A", bio: "5+ years building strong client relationships and delivering measurable business growth through digital transformation." },
  { name: "Sneha Joshi", role: "AI & Automation Lead", initial: "S", color: "#7C3AED", bio: "ML engineer specialising in AI chatbots, marketing automation, and intelligent workflow systems." },
  { name: "Ravi Kumar", role: "Lead Developer", initial: "R", color: "#EF4444", bio: "Backend specialist with expertise in high-performance databases, REST APIs, and production-grade optimisation." },
];

const TIMELINE = [
  { year: "2014", title: "Company Founded", desc: "KVL BUSINESS SOLUTION was established with a clear mission: make world-class digital solutions accessible to every business in India." },
  { year: "2016", title: "First 100 Clients", desc: "Reached the 100 happy clients milestone, serving restaurants, schools, and retail shops across multiple cities." },
  { year: "2018", title: "Software Products Launch", desc: "Launched our ready-made software suite for schools, hospitals, and enterprises — delivered in days, not months." },
  { year: "2020", title: "AI Integration", desc: "Integrated AI chatbots and marketing automation tools, helping clients run their businesses 24/7 without extra staff." },
  { year: "2022", title: "5,000+ Clients", desc: "Celebrated 5,000+ satisfied clients across India — from small dhabas to large hospital chains." },
  { year: "2024", title: "Global Platform Launch", desc: "Launched kvlbusinesssolutions.com — a digital solutions marketplace serving clients in 40+ countries." },
];

const VALUES = [
  {
    icon: Target, title: "Our Mission", color: "#C9A227",
    desc: "To provide every small and large business with world-class digital solutions at affordable prices — so that geography and budget are never barriers to going online.",
  },
  {
    icon: Eye, title: "Our Vision", color: "#0F172A",
    desc: "To become the #1 trusted digital solutions platform globally — serving 50,000+ businesses by 2026 with websites, software, SaaS, and AI tools.",
  },
  {
    icon: Heart, title: "Our Values", color: "#EF4444",
    desc: "Honesty, quality, and a relentless client-first approach. We don't disappear after delivery — we're your long-term digital partner.",
  },
];

const WHY_US = [
  { icon: Shield, title: "100% Source Code Ownership", desc: "You own every line of code. No vendor lock-in, no recurring platform fees. Take it anywhere, modify anything — it's yours forever." },
  { icon: Zap, title: "Industry-Leading Delivery Speed", desc: "Basic plans delivered in 3–5 business days. Premium plans in 1–2 days. Custom enterprise projects in 7–15 days. No other agency matches this." },
  { icon: Code2, title: "Modern, Scalable Tech Stack", desc: "Built with Next.js, React, Node.js, and PostgreSQL — the same technologies powering Fortune 500 companies, now accessible to you." },
  { icon: Headphones, title: "Post-Delivery Support", desc: "24/7 support via WhatsApp, call, and email. Our team is available even after delivery to ensure your business runs smoothly." },
  { icon: Globe, title: "Serving 40+ Countries", desc: "From India to Saudi Arabia, USA to UK — our solutions work globally with multi-language support and international payment gateways." },
  { icon: CheckCircle2, title: "Dedicated Post-Delivery Support", desc: "We don't disappear after delivery. Every client gets 30–365 days of priority support via WhatsApp, call, and email — so your business always runs smoothly." },
];

const TECH_STACK = [
  { name: "Next.js 16", category: "Frontend" },
  { name: "React 19", category: "Frontend" },
  { name: "TypeScript", category: "Language" },
  { name: "Tailwind CSS", category: "Styling" },
  { name: "Node.js", category: "Backend" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Prisma ORM", category: "Database" },
  { name: "Redis", category: "Cache" },
  { name: "AWS / Vercel", category: "Cloud" },
  { name: "Stripe / Razorpay", category: "Payments" },
  { name: "OpenAI / Groq", category: "AI" },
  { name: "React Native", category: "Mobile" },
];

const TESTIMONIALS = [
  { name: "Ramesh Gupta", business: "Restaurant Owner, Delhi", text: "KVL TECH delivered our restaurant website in just 2 days. Orders increased 40% in the first month. Exceptional quality and support.", rating: 5, initial: "R", color: "#FF6B35" },
  { name: "Dr. Anjali Mehta", business: "Hospital Director, Mumbai", text: "The hospital management system transformed our operations. Patient records, billing, appointments — all in one place. Worth every penny.", rating: 5, initial: "A", color: "#0891B2" },
  { name: "Sunita Patel", business: "School Principal, Ahmedabad", text: "Our school management system handles 1,200 students seamlessly. Parents love the app. Our staff productivity doubled.", rating: 5, initial: "S", color: "#16A34A" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[104px]">

        {/* ── Hero ── */}
        <section className="py-16 lg:py-24 bg-[var(--color-bg-secondary)] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--color-gold)]/5 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[var(--color-navy)]/5 blur-[80px]" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <div className="flex mb-6">
                  <Image src="/kvl-tech-logo-tight.png" alt="KVL BUSINESS SOLUTION" width={180} height={48} className="h-12 w-auto object-contain dark:hidden" priority />
                  <Image src="/kvl-tech-logo-white.png" alt="KVL BUSINESS SOLUTION" width={180} height={48} className="h-12 w-auto object-contain hidden dark:block" priority />
                </div>
                <div className="section-badge">About KVL TECH</div>
                <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[var(--color-text)] mb-5 leading-tight">
                  Empowering Businesses with{" "}
                  <span className="text-gold-gradient">Digital Excellence</span>
                </h1>
                <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed mb-6">
                  Since 2014, KVL BUSINESS SOLUTION has been delivering world-class websites, software, SaaS products, and AI tools to businesses across India and 40+ countries. We believe every business — big or small — deserves a premium digital presence without the premium price tag.
                </p>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { value: 10, suffix: "+", label: "Years" },
                    { value: 5000, suffix: "+", label: "Clients" },
                    { value: 12500, suffix: "+", label: "Projects" },
                  ].map(({ value, suffix, label }) => (
                    <div key={label} className="text-center p-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                      <p className="font-display font-bold text-2xl text-[var(--color-text)]">
                        <AnimatedCounter end={value} suffix={suffix} />
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
                    Work With Us <ArrowRight size={16} />
                  </Link>
                  <a href="https://wa.me/919942000413" target="_blank" rel="noopener noreferrer"
                    className="btn-outline inline-flex items-center gap-2">
                    <MessageCircle size={16} /> WhatsApp Us
                  </a>
                </div>
              </motion.div>

              {/* Right — Stats card */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
                className="space-y-4">
                {[
                  { label: "Websites & Software Delivered", value: "12,500+", icon: Award, color: "#C9A227" },
                  { label: "Happy Clients Across 40+ Countries", value: "5,000+", icon: Users, color: "#16A34A" },
                  { label: "Average Client Rating", value: "4.9 / 5", icon: Star, color: "#0891B2" },
                  { label: "Average Delivery Time", value: "2.8 Days", icon: Zap, color: "#7C3AED" },
                  { label: "Uptime Guarantee", value: "99.9%", icon: Shield, color: "#EF4444" },
                ].map(({ label, value, icon: Icon, color }, i) => (
                  <motion.div key={label}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                    className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
                      <Icon size={22} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
                      <p className="font-display font-bold text-xl text-[var(--color-text)]">{value}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Mission / Vision / Values ── */}
        <section className="py-16 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="section-badge mx-auto">What Drives Us</div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text)]">
                Our <span className="text-gold-gradient">Purpose & Direction</span>
              </h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              {VALUES.map(({ icon: Icon, title, desc, color }, i) => (
                <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="card p-7 hover:shadow-[var(--shadow-luxury)] transition-all">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${color}15` }}>
                    <Icon size={24} style={{ color }} />
                  </div>
                  <h3 className="font-display font-bold text-xl text-[var(--color-text)] mb-3">{title}</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats Banner ── */}
        <section className="py-16" style={{ background: "linear-gradient(135deg, #0A1628 0%, #1E2D4A 100%)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Users, value: 5000, suffix: "+", label: "Happy Clients" },
                { icon: Award, value: 12500, suffix: "+", label: "Projects Delivered" },
                { icon: TrendingUp, value: 99.9, suffix: "%", label: "Uptime Guarantee" },
                { icon: Zap, value: 2.8, suffix: " days", label: "Avg Delivery Time" },
              ].map(({ icon: Icon, value, suffix, label }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="text-center">
                  <Icon size={28} className="text-[var(--color-gold)] mx-auto mb-3" />
                  <p className="font-display font-bold text-3xl text-white">
                    <AnimatedCounter end={value} suffix={suffix} />
                  </p>
                  <p className="text-white/60 text-sm mt-1">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Choose Us ── */}
        <section className="py-16 lg:py-24 bg-[var(--color-bg-secondary)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="section-badge mx-auto">Why KVL TECH</div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text)] mb-3">
                Why 5,000+ Businesses <span className="text-gold-gradient">Trust Us</span>
              </h2>
              <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                We're not just a development agency — we're your long-term digital growth partner. Here's what sets us apart.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {WHY_US.map(({ icon: Icon, title, desc }, i) => (
                <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="card p-6 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-[var(--color-gold)]" />
                  </div>
                  <h3 className="font-semibold text-sm text-[var(--color-text)] mb-2">{title}</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Team ── */}
        <section className="py-16 lg:py-20 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="section-badge mx-auto">Our Team</div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text)] mb-3">
                The People Behind <span className="text-gold-gradient">KVL TECH</span>
              </h2>
              <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
                A passionate team of 50+ engineers, designers, and business experts — united by one goal: your success.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEAM.map((member, i) => (
                <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="card p-6 text-center group hover:shadow-[var(--shadow-luxury)] transition-all">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-display font-bold text-2xl transition-transform group-hover:scale-110 duration-300"
                    style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}CC)` }}>
                    {member.initial}
                  </div>
                  <h3 className="font-display font-bold text-lg text-[var(--color-text)]">{member.name}</h3>
                  <p className="text-[var(--color-gold)] text-sm font-semibold mb-3">{member.role}</p>
                  <p className="text-[var(--color-text-secondary)] text-xs leading-relaxed">{member.bio}</p>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/careers" className="btn-outline inline-flex items-center gap-2">
                Join Our Team <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Tech Stack ── */}
        <section className="py-16 bg-[var(--color-bg-secondary)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="section-badge mx-auto">Technology</div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text)] mb-3">
                Built with <span className="text-gold-gradient">Enterprise-Grade Tech</span>
              </h2>
              <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
                The same technology stack used by the world's top companies — now powering your business.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {TECH_STACK.map(({ name, category }, i) => (
                <motion.div key={name}
                  initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                  className="card px-4 py-2.5 flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--color-text)]">{name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] font-medium">{category}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="py-16 lg:py-20 bg-[var(--color-bg)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="section-badge mx-auto">Our Journey</div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text)]">
                10 Years of <span className="text-gold-gradient">Excellence</span>
              </h2>
            </div>
            <div className="relative">
              <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-0.5 bg-[var(--color-border)] -translate-x-1/2" />
              <div className="space-y-8">
                {TIMELINE.map((item, i) => (
                  <motion.div key={item.year}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className={`relative flex items-start gap-6 ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}>
                    <div className="lg:w-1/2 flex-shrink-0" />
                    <div className="absolute left-6 lg:left-1/2 w-4 h-4 rounded-full bg-[var(--color-gold)] -translate-x-1/2 mt-1 shadow-[var(--shadow-gold)]" />
                    <div className={`flex-1 card p-5 ml-10 lg:ml-0 ${i % 2 === 0 ? "lg:mr-8" : "lg:ml-8"}`}>
                      <span className="text-xs font-bold text-[var(--color-gold)] mb-1 block">{item.year}</span>
                      <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-1">{item.title}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-16 bg-[var(--color-bg-secondary)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="section-badge mx-auto">Client Stories</div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text)]">
                What Our Clients <span className="text-gold-gradient">Say About Us</span>
              </h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="card p-6">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} size={14} fill="#C9A227" className="text-[var(--color-gold)]" />
                    ))}
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ background: t.color }}>
                      {t.initial}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[var(--color-text)]">{t.name}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">{t.business}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0A1628 0%, #1E2D4A 50%, #0A1628 100%)" }}>
          <div className="absolute top-0 right-1/3 w-80 h-80 rounded-full bg-[var(--color-gold)]/8 blur-[80px] pointer-events-none" />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Image src="/kvl-tech-logo-white.png" alt="KVL BUSINESS SOLUTION" width={160} height={40} className="h-10 w-auto object-contain mx-auto mb-6" />
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
                Ready to Transform <span style={{ color: "#E8C547" }}>Your Business?</span>
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                Join 5,000+ businesses that trust KVL TECH to power their digital growth.
                Free consultation — no obligation.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Link href="/contact" className="btn-gold flex items-center gap-2">
                  <Zap size={18} /> Start Your Project
                </Link>
                <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all">
                  Browse Products <ArrowRight size={16} />
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-white/40">
                <span>📍 KVL BUSINESS SOLUTION, INDIA</span>
                <span>📞 +91 9942000413</span>
                <span>✉️ kvlbusinesssolution@gmail.com</span>
              </div>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
    </>
  );
}
