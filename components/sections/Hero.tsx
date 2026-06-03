"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, CheckCircle2, TrendingUp, Users, Star, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

const stats = [
  { icon: Users, value: 5000, suffix: "+", label: "Happy Clients" },
  { icon: TrendingUp, value: 12500, suffix: "+", label: "Projects Completed" },
  { icon: CheckCircle2, value: 99.99, suffix: "%", label: "Uptime Guarantee" },
  { icon: Star, value: 24, suffix: "/7", label: "Expert Support" },
];

const liveActivities = [
  "Rajesh from Mumbai just purchased Restaurant Website",
  "Priya from Delhi purchased School Management System",
  "Amit from Bangalore upgraded to Premium Plan",
  "Sunita from Pune purchased Hotel Booking Website",
];

const highlights = [
  "Full source code ownership",
  "Company branding included",
  "30-day money back guarantee",
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[var(--color-gold)]/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[var(--color-navy)]/5 blur-[100px]" />
        {/* Dot grid */}
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
              All-in-One Digital Business Ecosystem
            </motion.div>

            {/* Headline */}
            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="font-display font-bold text-4xl sm:text-5xl lg:text-[3.4rem] xl:text-[3.8rem] leading-[1.08] tracking-tight text-[var(--color-text)] mb-4"
            >
              Build, Automate &{" "}
              <br className="hidden sm:block" />
              Scale Your Business{" "}
              <span className="text-gold-gradient">With Confidence</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="text-[var(--color-text-secondary)] text-lg leading-relaxed mb-8 max-w-lg"
            >
              Websites, Software, SaaS, Marketing, Automation and AI Solutions
              Built For Modern Businesses. Purchase once, brand it yours.
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
                Explore Solutions <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="btn-gold">
                Book Free Consultation
              </Link>
              <button className="btn-outline flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[var(--color-navy)] flex items-center justify-center shrink-0">
                  <Play size={12} className="text-white ml-0.5" fill="white" />
                </span>
                Watch Demo
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

          {/* RIGHT — Laptop + Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            {/* Glow */}
            <div className="absolute -inset-6 rounded-3xl bg-[var(--color-gold)]/6 blur-3xl" />
            {/* Laptop body bottom */}
            <div className="absolute bottom-[-14px] left-[5%] right-[5%] h-4 bg-[#d4d4d4] dark:bg-[#3a3a3a] rounded-b-2xl shadow-lg z-10" />
            <div className="absolute bottom-[-18px] left-[-2%] right-[-2%] h-2 bg-[#c0c0c0] dark:bg-[#2e2e2e] rounded-full z-10" />

            {/* Main laptop frame */}
            <div
              className="relative rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(15,23,42,0.2)] border border-[var(--color-border)] bg-[var(--color-bg)] animate-float"
            >
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 mx-4 h-7 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center px-3 gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-gold)]/40" />
                  <span className="text-xs text-[var(--color-text-muted)]">kvlbusinesssolutions.com</span>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-5 bg-[var(--color-bg)]">
                {/* Welcome bar */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Welcome back,</p>
                    <p className="font-display font-semibold text-[var(--color-text)]">John! 👋</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="section-badge !mb-0 !text-[10px] !py-1">Live</span>
                  </div>
                </div>

                {/* Revenue cards */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: "Total Revenue", value: "₹34,68,850", change: "+15.5%", up: true },
                    { label: "New Orders", value: "12,458", change: "+3.2%", up: true },
                    { label: "Active Clients", value: "842", change: "+22%", up: true },
                  ].map((card) => (
                    <div key={card.label} className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                      <p className="text-[10px] text-[var(--color-text-muted)] mb-1">{card.label}</p>
                      <p className="font-display font-bold text-sm text-[var(--color-text)]">{card.value}</p>
                      <span className="text-[10px] text-[var(--color-success)] font-medium">{card.change}</span>
                    </div>
                  ))}
                </div>

                {/* Chart placeholder */}
                <div className="rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-4 mb-4">
                  <div className="flex items-end justify-between gap-1 h-16">
                    {[35, 55, 45, 70, 60, 80, 65, 90, 75, 95, 85, 100].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h}%`,
                          background: i === 11
                            ? "linear-gradient(180deg, #C9A227, #E8C547)"
                            : "var(--color-bg-tertiary)",
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[9px] text-[var(--color-text-muted)]">Revenue Overview</span>
                    <span className="text-[9px] text-[var(--color-gold)] font-semibold">+28% this month</span>
                  </div>
                </div>

                {/* Recent orders */}
                <div className="space-y-2">
                  {[
                    { name: "Restaurant Website", type: "Premium", amount: "₹24,999", status: "Delivered" },
                    { name: "School Management", type: "Custom", amount: "₹89,999", status: "In Progress" },
                    { name: "Hotel Booking App", type: "Basic", amount: "₹12,999", status: "Delivered" },
                  ].map((order) => (
                    <div key={order.name} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                      <div>
                        <p className="text-xs font-medium text-[var(--color-text)]">{order.name}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{order.type} Plan</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-[var(--color-text)]">{order.amount}</p>
                        <span
                          className={`text-[10px] font-medium ${
                            order.status === "Delivered"
                              ? "text-[var(--color-success)]"
                              : "text-[var(--color-gold)]"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating live activity card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -bottom-4 -left-8 glass-card px-4 py-3 flex items-center gap-3 shadow-[var(--shadow-card)] max-w-xs"
            >
              <div className="live-dot shrink-0" />
              <p className="text-xs text-[var(--color-text-secondary)]">
                <strong className="text-[var(--color-text)]">Rajesh</strong> from Mumbai just purchased{" "}
                <strong className="text-[var(--color-gold)]">Restaurant Website</strong>
              </p>
              <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">2m ago</span>
            </motion.div>

            {/* Floating rating card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute -top-4 -right-6 glass-card px-4 py-3 text-center shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center gap-0.5 justify-center mb-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#C9A227" className="text-[var(--color-gold)]" />)}
              </div>
              <p className="text-xs font-bold text-[var(--color-text)]">4.9/5</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Client Rating</p>
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
