"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Users,
  Globe,
  CreditCard,
  Bell,
  BarChart2,
  Shield,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
  Briefcase,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Server,
  Lock,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] as unknown as never },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const stats = [
  { value: "10+", label: "SaaS Products" },
  { value: "100%", label: "White-Label Ready" },
  { value: "Multi-Tenant", label: "Architecture" },
  { value: "Built-In", label: "Payment Integration" },
];

const products = [
  {
    icon: Calendar,
    name: "Online Booking System",
    price: "$599",
    tagline: "Turn appointments into 24/7 revenue",
    description:
      "A fully-featured appointment scheduling platform built for clinics, salons, spas, restaurants, and service businesses. Your clients book themselves online — no phone calls, no back-and-forth. Automated WhatsApp and SMS reminders dramatically cut no-shows. White-label it as your own product, set your price, and build a loyal subscriber base.",
    features: [
      "24/7 online booking portal",
      "Automated WhatsApp & SMS reminders",
      "Staff calendar management",
      "Multi-location support",
      "Custom booking forms",
      "Cancellation & rescheduling",
    ],
    accent: "var(--color-gold)",
  },
  {
    icon: FileText,
    name: "Invoice & Billing Platform",
    price: "$479",
    tagline: "Professional billing software — branded yours",
    description:
      "A complete GST-compliant invoicing and billing platform perfect for accountants, freelancers, agencies, and small businesses. Generate professional invoices in seconds, set up subscription billing for retainer clients, send payment links, and access financial reports. Sell it to your accounting clients and collect a monthly fee — they will love the simplicity.",
    features: [
      "GST invoice generation",
      "Subscription & recurring billing",
      "Payment link sharing",
      "Financial dashboard & reports",
      "Expense tracking",
      "Multi-currency support",
    ],
    accent: "var(--color-gold)",
  },
  {
    icon: Briefcase,
    name: "Customer Portal",
    price: "$399",
    tagline: "Give your clients a branded home base",
    description:
      "A sleek branded client portal designed for agencies, consultants, and service businesses. Give each of your customers their own secure login where they can view project progress, download documents, approve deliverables, and pay invoices — all under your brand. Stop juggling emails and WhatsApp messages. Sell portal access as an add-on and increase your monthly revenue per client.",
    features: [
      "Branded client login portal",
      "Document upload & sharing",
      "Project progress tracking",
      "Invoice & payment history",
      "Approval workflows",
      "Secure messaging",
    ],
    accent: "var(--color-gold)",
  },
  {
    icon: UserCheck,
    name: "HR Management Portal",
    price: "$719",
    tagline: "Sell HR software to multiple companies",
    description:
      "A powerful multi-company HR SaaS platform that handles everything — attendance, payroll, leave management, and employee self-service. Perfect for HR consultants and payroll companies to white-label and sell to their SME clients. Each company gets its own isolated workspace. One platform, unlimited clients. The highest-ticket item in our SaaS lineup with massive recurring revenue potential.",
    features: [
      "Multi-company tenant isolation",
      "Attendance & biometric sync",
      "Payroll processing",
      "Leave & holiday management",
      "Employee self-service app",
      "Compliance reports",
    ],
    accent: "var(--color-gold)",
  },
];

const techFeatures = [
  { icon: Server, label: "Multi-Tenant Architecture", desc: "One codebase serves unlimited clients — each fully isolated." },
  { icon: Globe, label: "Custom Domain Per Client", desc: "Each of your customers gets their own branded subdomain or domain." },
  { icon: Lock, label: "Role-Based Access Control", desc: "Granular permissions for admins, managers, and end users." },
  { icon: Zap, label: "API-Ready", desc: "REST APIs to integrate with your clients' existing tools." },
  { icon: CreditCard, label: "Stripe, Razorpay & PayPal", desc: "Multiple payment gateways built-in and ready to collect money." },
  { icon: Bell, label: "Email & SMS Notifications", desc: "Automated messaging keeps your clients' customers engaged." },
  { icon: BarChart2, label: "Analytics Dashboard", desc: "Insightful dashboards so your clients see the value every day." },
  { icon: Shield, label: "Security & Backups", desc: "Encrypted data, daily backups, and enterprise-grade security." },
];

const compareRows = [
  { feature: "Time to Launch", whitelabel: "2 Days", scratch: "6 Months" },
  { feature: "Total Cost", whitelabel: "From $399", scratch: "$50,000+" },
  { feature: "Technical Risk", whitelabel: "Zero", scratch: "Very High" },
  { feature: "Ongoing Maintenance", whitelabel: "Handled by KVL TECH", scratch: "Your Responsibility" },
  { feature: "First Revenue", whitelabel: "Within a Week", scratch: "After 6+ Months" },
  { feature: "Support & Updates", whitelabel: "Included", scratch: "Additional Cost" },
];

const faqs = [
  {
    q: "Can I put my own logo and name on the product?",
    a: "Yes — completely. Every SaaS product we sell is 100% white-labeled. You replace our logo with yours, set your own product name, use your own domain, and apply your own brand colors. Your customers will never know the technology was built by KVL TECH. It is entirely your product.",
  },
  {
    q: "How many clients can I onboard onto the platform?",
    a: "Unlimited. Our multi-tenant architecture is designed so that a single deployment can serve hundreds or even thousands of separate client accounts simultaneously, each fully isolated from one another. There is no per-seat or per-tenant licensing fee from our side — onboard as many clients as you can sell to.",
  },
  {
    q: "Will my clients ever see 'KVL TECH' anywhere in the product?",
    a: "No. After you complete the white-labeling setup, every trace of KVL TECH branding is removed. Login pages, email notifications, invoices, support links — everything carries your brand. Your clients experience it as your proprietary software, not a third-party platform.",
  },
  {
    q: "Which payment gateways are supported?",
    a: "All our SaaS platforms come with built-in integrations for Stripe (international), Razorpay (India-focused), PayPal, and manual bank transfer. Your clients can accept payments from customers globally. Gateway credentials are configured under your account — all payment flows through you.",
  },
  {
    q: "Can I set my own pricing and charge whatever I want?",
    a: "Absolutely. You buy the platform once from us at a fixed price, and from that point on you set every pricing decision yourself. Charge $20/month, $200/month, or $2,000/month — entirely up to you and your market. We have no revenue share, no royalties, and no ongoing licensing fees.",
  },
  {
    q: "What if I need custom features added to the platform?",
    a: "We offer additional development at $50 per hour. Many clients start with the base platform, launch to their first customers, and then come back to us for feature enhancements once they are generating revenue. We prioritize existing white-label clients for development slots.",
  },
];

export default function SaaSProductsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main className="pt-16">

        {/* ── HERO ── */}
        <section className="relative bg-[var(--color-bg)] py-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, var(--color-gold) 0%, transparent 70%)" }}
            />
          </div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.span className="section-badge" variants={fadeUp}>
                SaaS Products
              </motion.span>

              <motion.h1
                className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
                variants={fadeUp}
                custom={1}
              >
                Launch Your Own SaaS Business —{" "}
                <span className="text-gold-gradient">White-Label Platforms Ready to Go</span>
              </motion.h1>

              <motion.p
                className="mt-6 text-xl leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
                variants={fadeUp}
                custom={2}
              >
                Buy once, brand it yours, charge your own customers monthly. Build your own recurring revenue stream without writing a single line of code. Our battle-tested SaaS platforms are production-ready — you just add your logo and start selling.
              </motion.p>

              <motion.div
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
                variants={fadeUp}
                custom={3}
              >
                <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
                  Book a Free Consultation <ArrowRight size={18} />
                </Link>
                <Link href="#products" className="btn-outline inline-flex items-center gap-2">
                  See All Products <ArrowRight size={18} />
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6"
                variants={fadeUp}
                custom={4}
              >
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="card text-center py-6"
                  >
                    <p className="text-2xl font-extrabold text-gold-gradient">{s.value}</p>
                    <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── WHAT IS WHITE-LABEL SAAS? ── */}
        <section className="bg-[var(--color-bg-secondary)] py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              className="text-center mb-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <span className="section-badge">The Model Explained</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold">What Is White-Label SaaS?</h2>
            </motion.div>

            <motion.div
              className="card p-8 sm:p-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
            >
              <div className="grid sm:grid-cols-3 gap-8 items-center text-center">
                <div>
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: "rgba(var(--color-gold-rgb, 212,175,55), 0.12)" }}
                  >
                    <DollarSign size={28} style={{ color: "var(--color-gold)" }} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Step 1: Buy Once</h3>
                  <p style={{ color: "var(--color-text-secondary)" }}>
                    Purchase our fully-built SaaS platform with a single one-time payment. No subscription, no royalties, no revenue share — ever.
                  </p>
                </div>
                <div>
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: "rgba(var(--color-gold-rgb, 212,175,55), 0.12)" }}
                  >
                    <Globe size={28} style={{ color: "var(--color-gold)" }} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Step 2: Brand It Yours</h3>
                  <p style={{ color: "var(--color-text-secondary)" }}>
                    Add your logo, your domain, your brand colors. Your customers see your product name — KVL TECH is invisible.
                  </p>
                </div>
                <div>
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: "rgba(var(--color-gold-rgb, 212,175,55), 0.12)" }}
                  >
                    <TrendingUp size={28} style={{ color: "var(--color-gold)" }} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Step 3: Collect Monthly Revenue</h3>
                  <p style={{ color: "var(--color-text-secondary)" }}>
                    Sell access to your customers and charge a monthly fee. You keep 100% of the recurring revenue.
                  </p>
                </div>
              </div>

              <div
                className="mt-10 p-6 rounded-xl border text-center"
                style={{ borderColor: "var(--color-gold)", background: "rgba(var(--color-gold-rgb, 212,175,55), 0.06)" }}
              >
                <p className="text-lg font-semibold" style={{ color: "var(--color-gold)" }}>
                  "Buy our SaaS platform, brand it as your own (your logo, domain, colors), then sell access to your customers for a monthly fee. You keep 100% of the recurring revenue."
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FEATURED PRODUCTS ── */}
        <section id="products" className="bg-[var(--color-bg)] py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div
              className="text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <span className="section-badge">Our Products</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold">Featured SaaS Platforms</h2>
              <p className="mt-4 max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                Four high-demand platforms that businesses actually pay for — each one white-labeled, production-ready, and built to generate you recurring revenue from day one.
              </p>
            </motion.div>

            <motion.div
              className="grid sm:grid-cols-2 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {products.map((p) => {
                const Icon = p.icon;
                return (
                  <motion.div key={p.name} className="card p-8 flex flex-col" variants={fadeUp}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(var(--color-gold-rgb, 212,175,55), 0.12)" }}
                        >
                          <Icon size={22} style={{ color: "var(--color-gold)" }} />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl">{p.name}</h3>
                          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{p.tagline}</p>
                        </div>
                      </div>
                      <span className="text-2xl font-extrabold text-gold-gradient whitespace-nowrap">{p.price}</span>
                    </div>

                    <p className="mb-6 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                      {p.description}
                    </p>

                    <ul className="space-y-2 mb-8">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <CheckCircle size={16} style={{ color: "var(--color-gold)" }} className="flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto">
                      <Link href="/contact" className="btn-gold w-full text-center inline-flex items-center justify-center gap-2">
                        Get This Platform <ArrowRight size={16} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ── REVENUE MODEL ── */}
        <section className="bg-[var(--color-bg-secondary)] py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              className="text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <span className="section-badge">Revenue Model</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold">
                How Clients Make{" "}
                <span className="text-gold-gradient">$2,000 – $10,000/Month</span>{" "}
                With Our SaaS
              </h2>
              <p className="mt-4 max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                The math is simple. The more clients you onboard, the more recurring revenue you collect. Here is a real-world example using our Booking System.
              </p>
            </motion.div>

            <motion.div
              className="card p-8 sm:p-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
            >
              <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap justify-center text-center sm:text-left">
                {[
                  { step: "01", text: "Buy Booking System for $599", sub: "One-time investment" },
                  { step: "→", text: null, sub: null, arrow: true },
                  { step: "02", text: 'Brand it "BookEasy"', sub: "Your logo, your domain" },
                  { step: "→", text: null, sub: null, arrow: true },
                  { step: "03", text: "Sell to 20 clinics at $50/mo", sub: "Only 20 clients needed" },
                  { step: "→", text: null, sub: null, arrow: true },
                  { step: "04", text: "$1,000/month revenue", sub: "ROI recovered in Month 1" },
                ].map((item, i) =>
                  item.arrow ? (
                    <ArrowRight key={i} size={28} style={{ color: "var(--color-gold)" }} className="flex-shrink-0 hidden sm:block" />
                  ) : (
                    <div key={i} className="flex-1 min-w-[140px]">
                      <div
                        className="text-3xl font-extrabold mb-1 text-gold-gradient"
                      >
                        {item.step}
                      </div>
                      <p className="font-semibold">{item.text}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>{item.sub}</p>
                    </div>
                  )
                )}
              </div>

              <div
                className="mt-10 p-6 rounded-xl text-center"
                style={{ background: "rgba(var(--color-gold-rgb, 212,175,55), 0.08)", border: "1px solid var(--color-gold)" }}
              >
                <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
                  Scale to 40 clients at $50/month = <strong style={{ color: "var(--color-gold)" }}>$2,000/month</strong>. Scale to 100 clients = <strong style={{ color: "var(--color-gold)" }}>$5,000/month</strong>. The platform handles the load — your revenue grows without extra effort.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── TECH FEATURES ── */}
        <section className="bg-[var(--color-bg)] py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div
              className="text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <span className="section-badge">Built for Scale</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold">Enterprise-Grade Technical Foundation</h2>
              <p className="mt-4 max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                Every platform is built with the technical architecture needed to serve dozens or hundreds of clients without performance degradation.
              </p>
            </motion.div>

            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {techFeatures.map((tf) => {
                const Icon = tf.icon;
                return (
                  <motion.div key={tf.label} className="card p-6 text-center" variants={fadeUp}>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: "rgba(var(--color-gold-rgb, 212,175,55), 0.12)" }}
                    >
                      <Icon size={22} style={{ color: "var(--color-gold)" }} />
                    </div>
                    <h3 className="font-bold mb-2">{tf.label}</h3>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{tf.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ── SUCCESS STORY ── */}
        <section className="bg-[var(--color-bg-secondary)] py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div
              className="text-center mb-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <span className="section-badge">Success Story</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold">Real Results From a Real Client</h2>
            </motion.div>

            <motion.div
              className="card p-10 sm:p-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
            >
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-2xl font-bold"
                  style={{ background: "var(--color-gold)", color: "var(--color-navy)" }}
                >
                  M
                </div>
                <div>
                  <p className="font-bold text-lg">Mohammed</p>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>HR Consultant — Hyderabad, India</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="var(--color-gold)" style={{ color: "var(--color-gold)" }} />
                    ))}
                  </div>
                </div>
              </div>

              <blockquote className="text-lg leading-relaxed mb-6" style={{ color: "var(--color-text)" }}>
                "I bought the HR Management Portal from KVL TECH for $719. Within a week I had rebranded it completely as <strong>HRSmith</strong> — my own logo, my own domain, my own pricing. I reached out to small businesses in my network who were still doing HR manually on spreadsheets. Within two months I had 15 company clients, each paying ₹3,000 per month. That is <strong>₹45,000 per month in recurring revenue</strong> from a single $719 investment. The platform handles everything — I just focus on getting new clients."
              </blockquote>

              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { val: "15", label: "Client Companies" },
                  { val: "₹45,000", label: "Monthly Revenue" },
                  { val: "2 Months", label: "To Break Even" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl py-4 px-2"
                    style={{ background: "rgba(var(--color-gold-rgb, 212,175,55), 0.08)", border: "1px solid var(--color-border)" }}
                  >
                    <p className="text-xl font-extrabold text-gold-gradient">{m.val}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>{m.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── COMPARISON ── */}
        <section className="bg-[var(--color-bg)] py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div
              className="text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <span className="section-badge">Why White-Label?</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold">
                White-Label vs. Building From Scratch
              </h2>
              <p className="mt-4 max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                Building a SaaS product from scratch takes a team, months of development, and tens of thousands of dollars — with no guarantee of success. White-labeling lets you skip all of that and go straight to making money.
              </p>
            </motion.div>

            <motion.div
              className="card overflow-hidden"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
            >
              <div className="grid grid-cols-3 text-sm font-bold p-4 sm:p-6" style={{ background: "var(--color-navy)", color: "#fff" }}>
                <div>Feature</div>
                <div className="text-center" style={{ color: "var(--color-gold)" }}>Our White-Label</div>
                <div className="text-center opacity-60">Build From Scratch</div>
              </div>
              {compareRows.map((row, idx) => (
                <div
                  key={row.feature}
                  className="grid grid-cols-3 p-4 sm:p-6 text-sm items-center"
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    background: idx % 2 === 0 ? "transparent" : "rgba(var(--color-gold-rgb, 212,175,55), 0.03)",
                  }}
                >
                  <div className="font-medium">{row.feature}</div>
                  <div className="text-center font-semibold" style={{ color: "var(--color-gold)" }}>
                    <CheckCircle size={16} className="inline mr-1" />
                    {row.whitelabel}
                  </div>
                  <div className="text-center" style={{ color: "var(--color-text-secondary)" }}>
                    {row.scratch}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="bg-[var(--color-bg-secondary)] py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <motion.div
              className="text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <span className="section-badge">FAQ</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold">Frequently Asked Questions</h2>
              <p className="mt-4" style={{ color: "var(--color-text-secondary)" }}>
                Everything you need to know before launching your white-label SaaS business.
              </p>
            </motion.div>

            <motion.div
              className="space-y-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {faqs.map((faq, i) => (
                <motion.div key={i} className="card overflow-hidden" variants={fadeUp}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left font-semibold gap-4"
                  >
                    <span>{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp size={20} style={{ color: "var(--color-gold)" }} className="flex-shrink-0" />
                    ) : (
                      <ChevronDown size={20} style={{ color: "var(--color-gold)" }} className="flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div
                      className="px-6 pb-6 leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {faq.a}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-[var(--color-bg)] py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span className="section-badge" variants={fadeUp}>
                Get Started Today
              </motion.span>

              <motion.h2
                className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-extrabold"
                variants={fadeUp}
                custom={1}
              >
                Start Your SaaS Business Today —{" "}
                <span className="text-gold-gradient">Free Business Consultation Included</span>
              </motion.h2>

              <motion.p
                className="mt-6 text-lg max-w-2xl mx-auto leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
                variants={fadeUp}
                custom={2}
              >
                Every SaaS platform purchase includes a free 60-minute business consultation with our team. We will help you identify your target market, set your pricing, and build your go-to-market plan so you start generating revenue as quickly as possible.
              </motion.p>

              <motion.div
                className="mt-6 p-5 rounded-xl max-w-xl mx-auto"
                style={{ background: "rgba(var(--color-gold-rgb, 212,175,55), 0.08)", border: "1px solid var(--color-gold)" }}
                variants={fadeUp}
                custom={3}
              >
                <ul className="text-sm space-y-2 text-left">
                  {[
                    "Free 60-minute business strategy call",
                    "Complete white-label setup assistance",
                    "Domain & branding configuration support",
                    "First 3 client onboarding guidance",
                    "Ongoing email support included",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle size={16} style={{ color: "var(--color-gold)" }} className="flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
                variants={fadeUp}
                custom={4}
              >
                <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
                  Book Free Consultation <ArrowRight size={18} />
                </Link>
                <Link href="/products" className="btn-outline inline-flex items-center gap-2">
                  View All Products <ArrowRight size={18} />
                </Link>
              </motion.div>

              <motion.p
                className="mt-8 text-sm"
                style={{ color: "var(--color-text-secondary)" }}
                variants={fadeUp}
                custom={5}
              >
                One-time payment. No monthly fees to KVL TECH. No revenue share. All yours.
              </motion.p>
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
