"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Target, Eye, Heart, Award, Users, TrendingUp, Zap, Shield, Code2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const TEAM = [
  { name: "Rahul Sharma", role: "CEO & Founder", initial: "R", color: "#0F172A", bio: "10+ years in software development. IIT graduate with passion for building scalable digital solutions." },
  { name: "Priya Singh", role: "CTO", initial: "P", color: "#0891B2", bio: "Full-stack architect with expertise in Next.js, Node.js, and cloud infrastructure." },
  { name: "Kavya Mehta", role: "Head of Design", initial: "K", color: "#C9A227", bio: "Award-winning UI/UX designer. Previously worked at leading design agencies in Mumbai." },
  { name: "Amit Verma", role: "Head of Sales", initial: "A", color: "#16A34A", bio: "5+ years building client relationships and delivering business growth solutions." },
  { name: "Sneha Joshi", role: "AI & Automation Lead", initial: "S", color: "#7C3AED", bio: "ML engineer specializing in chatbots, marketing automation, and AI integration." },
  { name: "Ravi Kumar", role: "Lead Developer", initial: "R", color: "#EF4444", bio: "Backend specialist with expertise in databases, APIs, and performance optimization." },
];

const TIMELINE = [
  { year: "2014", title: "Company Founded", desc: "KVL TECH started in a small office in Noida with 3 developers and a big dream." },
  { year: "2016", title: "First 100 Clients", desc: "Crossed 100 happy clients milestone with website and software solutions." },
  { year: "2018", title: "Software Products Launch", desc: "Launched ready-made software solutions for schools, hospitals, and businesses." },
  { year: "2020", title: "AI Integration", desc: "Integrated AI chatbots and automation tools into our product ecosystem." },
  { year: "2022", title: "5,000+ Clients", desc: "Celebrated 5,000+ happy clients across India — restaurants, schools, hospitals, shops." },
  { year: "2024", title: "Platform Launch", desc: "Launched kvlbusinesssolutions.com — India's first digital solutions marketplace." },
];

const VALUES = [
  { icon: Target, title: "Mission", desc: "Har chhote aur bade business ko world-class digital solutions provide karna — affordable prices pe.", color: "#C9A227" },
  { icon: Eye, title: "Vision", desc: "India ka #1 trusted digital solutions marketplace banna — 2026 tak 50,000+ businesses serve karna.", color: "#0F172A" },
  { icon: Heart, title: "Values", desc: "Honesty, quality, and client-first approach. Hum delivery ke baad bhi aapke saath hain.", color: "#EF4444" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="py-16 lg:py-24 bg-[var(--color-bg-secondary)] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--color-gold)]/5 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[var(--color-navy)]/5 blur-[80px]" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <div className="flex justify-center mb-6 lg:justify-start">
                  <img
                    src="/kvl-tech-logo-tight.png"
                    alt="KVL TECH"
                    className="h-12 w-auto object-contain dark:hidden"
                  />
                  <img
                    src="/kvl-tech-logo-white.png"
                    alt="KVL TECH"
                    className="h-12 w-auto object-contain hidden dark:block"
                  />
                </div>
                <div className="section-badge">About KVL TECH</div>
                <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[var(--color-text)] mb-5 leading-tight">
                  Empowering India&apos;s{" "}
                  <span className="text-gold-gradient">Digital Future</span>
                </h1>
                <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed mb-6">
                  2014 se hum Indian businesses ko world-class digital solutions de rahe hain. Websites, software, SaaS, aur AI tools — sab kuch ek jagah, aapki company ke naam se.
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
                <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
                  Work With Us <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
                className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-[var(--shadow-luxury)]">
                <Image src="/photos/office-meeting.jpg" alt="KVL TECH Team" fill className="object-cover" sizes="50vw" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 glass-card p-4">
                  <p className="font-semibold text-sm text-[var(--color-text)]">Our Noida Office 📍</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Sector 62, Noida — Where innovation meets execution</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission/Vision/Values */}
        <section className="py-16 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-6">
              {VALUES.map(({ icon: Icon, title, desc, color }, i) => (
                <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="card p-7">
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

        {/* Stats banner */}
        <section className="py-16 bg-[var(--color-navy)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Users, value: 5000, suffix: "+", label: "Happy Clients" },
                { icon: Award, value: 12500, suffix: "+", label: "Projects Delivered" },
                { icon: TrendingUp, value: 99.99, suffix: "%", label: "Uptime Guarantee" },
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

        {/* Team */}
        <section className="py-16 lg:py-20 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="section-badge mx-auto">Our Team</div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text)] mb-3">
                The People Behind <span className="text-gold-gradient">KVL TECH</span>
              </h2>
              <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">Passionate professionals dedicated to your digital success.</p>
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
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 bg-[var(--color-bg-secondary)]">
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
                  <motion.div key={item.year} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
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

        {/* Why us */}
        <section className="py-16 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="section-badge">Why KVL TECH</div>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text)] mb-5">
                  Why 5,000+ Businesses <span className="text-gold-gradient">Trust Us</span>
                </h2>
                <div className="space-y-4">
                  {[
                    { icon: Shield, title: "Full Ownership", desc: "Aapko 100% source code milta hai — koi lock-in nahi, koi hidden fees nahi." },
                    { icon: Zap, title: "Fast Delivery", desc: "Basic plans 3-5 din mein, Premium 1-2 din mein — India mein sabse fast." },
                    { icon: Code2, title: "Modern Tech", desc: "Next.js, React, Node.js — production-ready, scalable code." },
                    { icon: Users, title: "Post-delivery Support", desc: "Delivery ke baad bhi 24/7 support — WhatsApp, call, email par available." },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-[var(--color-gold)]" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[var(--color-text)]">{title}</p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-8 text-center">
                <p className="font-display font-bold text-5xl text-[var(--color-gold)] mb-2">4.9/5</p>
                <div className="flex justify-center gap-1 mb-4">
                  {[1,2,3,4,5].map(s => <span key={s} className="text-[var(--color-gold)] text-xl">★</span>)}
                </div>
                <p className="text-[var(--color-text-secondary)] text-sm mb-6">Average rating from 5,000+ clients across India</p>
                <Link href="/contact" className="btn-gold w-full justify-center">
                  Start Your Project <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
    </>
  );
}
