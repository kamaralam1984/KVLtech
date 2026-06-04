"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Zap, ArrowRight, Phone, MessageCircle, ChevronDown, Shield, Clock, Star, Award } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const PLANS = [
  {
    name: "Basic",
    emoji: "🚀",
    tagline: "Perfect for startups & small businesses",
    oneTimePrice: 156,
    delivery: "3–5 days",
    support: "30 days",
    popular: false,
    features: [
      "Ready-made website / software",
      "Company logo & color branding",
      "Mobile responsive design",
      "SEO optimized (score 80+)",
      "Contact form integration",
      "Google Analytics setup",
      "WhatsApp button",
      "Full source code included",
      "30 days free support",
    ],
    notIncluded: [
      "Custom features",
      "Payment gateway",
      "Admin panel",
      "Free domain + hosting",
    ],
    cta: "Get Started with Basic",
    href: "/contact",
  },
  {
    name: "Premium",
    emoji: "⭐",
    tagline: "Most popular — built for growing businesses",
    oneTimePrice: 299,
    delivery: "1–2 days",
    support: "90 days",
    popular: true,
    features: [
      "Everything in Basic, plus:",
      "Full company branding package",
      "Custom domain setup",
      "Payment gateway (Stripe/Razorpay)",
      "Admin dashboard included",
      "SEO optimized (score 90+)",
      "WhatsApp chat widget",
      "FREE Domain + Hosting (1 year)",
      "Social media integration",
      "Email notifications",
      "90 days priority support",
    ],
    notIncluded: [
      "Custom API integrations",
    ],
    cta: "Start Premium Now",
    href: "/contact",
  },
  {
    name: "Custom",
    emoji: "💎",
    tagline: "Enterprise-grade — fully tailored to your needs",
    oneTimePrice: 599,
    delivery: "7–15 days",
    support: "1 year",
    popular: false,
    features: [
      "Everything in Premium, plus:",
      "Fully custom development",
      "Custom API integrations",
      "Multi-language support",
      "Advanced analytics dashboard",
      "AI chatbot integration",
      "Automated marketing tools",
      "Multi-location / multi-branch",
      "1 year dedicated support",
      "Free annual maintenance",
      "Priority deployment",
      "Custom feature development",
    ],
    notIncluded: [],
    cta: "Get a Custom Quote",
    href: "/contact",
  },
];

const PRODUCTS_PRICING = [
  { name: "Restaurant Website", basic: 156, premium: 299, icon: "🍽️" },
  { name: "School Management System", basic: 359, premium: 719, icon: "🏫" },
  { name: "Hospital Management System", basic: 599, premium: 1199, icon: "🏥" },
  { name: "E-commerce Platform", basic: 192, premium: 479, icon: "🛒" },
  { name: "Hotel Booking Website", basic: 179, premium: 323, icon: "🏨" },
  { name: "Real Estate Website", basic: 275, premium: 539, icon: "🏠" },
  { name: "Gym & Fitness Website", basic: 144, premium: 263, icon: "💪" },
  { name: "Portfolio Website", basic: 96, premium: 179, icon: "🎨" },
];

const COMPARE_ROWS = [
  { feature: "Delivery time", basic: "3–5 days", premium: "1–2 days", custom: "7–15 days" },
  { feature: "Support duration", basic: "30 days", premium: "90 days", custom: "1 year" },
  { feature: "Company branding", basic: "Basic", premium: "Full", custom: "Full" },
  { feature: "Mobile responsive", basic: true, premium: true, custom: true },
  { feature: "SEO optimization", basic: "Score 80+", premium: "Score 90+", custom: "Custom" },
  { feature: "Payment gateway", basic: false, premium: true, custom: true },
  { feature: "Admin dashboard", basic: false, premium: true, custom: true },
  { feature: "Domain + Hosting", basic: false, premium: "1 year free", custom: "1 year free" },
  { feature: "WhatsApp widget", basic: true, premium: true, custom: true },
  { feature: "Source code", basic: true, premium: true, custom: true },
  { feature: "Custom features", basic: false, premium: false, custom: true },
  { feature: "API integrations", basic: false, premium: false, custom: true },
  { feature: "Annual maintenance", basic: false, premium: false, custom: true },
  { feature: "Priority support", basic: false, premium: true, custom: true },
];

const ADDONS = [
  { name: "Annual Maintenance", price: "$36/yr", desc: "Bug fixes, updates, minor changes", icon: "🔧" },
  { name: "Extended Support (1yr)", price: "$60/yr", desc: "Priority support + same-day response", icon: "🎯" },
  { name: "Google Ads Setup", price: "$48", desc: "Campaign setup + $24 ad credit", icon: "📢" },
  { name: "WhatsApp Marketing", price: "$24/mo", desc: "Bulk messages to 1,000 contacts", icon: "💬" },
  { name: "Extra Language", price: "$60", desc: "Add Hindi / Arabic / regional language", icon: "🌐" },
  { name: "Mobile App (Basic)", price: "$180", desc: "Android APK for your website", icon: "📱" },
  { name: "Social Media Kit", price: "$30", desc: "20 branded posts + templates", icon: "📸" },
  { name: "Logo Design", price: "$24", desc: "Professional logo + 3 revisions", icon: "🎨" },
];

const FAQS = [
  {
    q: "Is this a one-time payment or a monthly subscription?",
    a: "This is a one-time payment — no monthly fees, no hidden charges ever. The only recurring cost is domain + hosting renewal (approx $12–$24/year), which is FREE for your first year with any Premium plan.",
  },
  {
    q: "Can I upgrade from Basic to Premium later?",
    a: "Absolutely! You can upgrade at any time. The upgrade cost is just the price difference — so if you paid $156 for Basic and want Premium, you only pay the remaining $143.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major payment methods — Credit/Debit cards, UPI, Net Banking, PayPal, Wire Transfer, and EMI options. 50% advance and 50% on delivery. Custom projects support milestone-based payments.",
  },
  {
    q: "Do I get the source code?",
    a: "Yes! Every plan includes complete source code — you can host it on any server, give it to other developers, or modify it freely. Zero lock-in. Complete ownership is yours.",
  },
  {
    q: "What if I'm not satisfied with the result?",
    a: "Every plan includes dedicated post-delivery support — 30 days for Basic, 90 days for Premium, and 1 year for Custom. Our team is available via WhatsApp, email, and phone to ensure your product works perfectly. In our 10+ year history we have maintained 1,200+ happy clients.",
  },
  {
    q: "What can be built with the Custom plan?",
    a: "Literally anything! Mobile apps, multi-vendor marketplaces, ERP systems, AI tools, custom booking platforms, SaaS products — anything your business needs. Discuss your requirements in a free consultation call.",
  },
  {
    q: "How long does delivery take?",
    a: "Basic plan: 3–5 business days. Premium plan: 1–2 business days. Custom plan: 7–15 business days depending on complexity. Urgent delivery available on request (extra charges may apply).",
  },
  {
    q: "Is hosting included?",
    a: "Basic plan does not include hosting but we guide you through setup. Premium and Custom plans include 1 year of free managed hosting on our servers, with 99.9% uptime guarantee.",
  },
];

const TRUST = [
  { icon: Shield, label: "100% Quality Guaranteed", sub: "30 days free support" },
  { icon: Clock, label: "Fast Delivery", sub: "Basic in 3–5 days" },
  { icon: Star, label: "4.9★ Rating", sub: "From 1,200+ clients" },
  { icon: Award, label: "Full Source Code", sub: "Zero lock-in" },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main className="pt-[104px]">

        {/* ── Hero ── */}
        <section className="py-16 lg:py-24 bg-[var(--color-bg-secondary)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--color-gold)]/5 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[var(--color-navy)]/5 blur-[80px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex justify-center mb-6">
                <Image src="/kvl-tech-logo-tight.png" alt="KVL TECH" width={130} height={44} className="h-11 w-auto object-contain dark:hidden" />
                <Image src="/kvl-tech-logo-white.png" alt="KVL TECH" width={130} height={44} className="h-11 w-auto object-contain hidden dark:block" />
              </div>
              <div className="section-badge mx-auto mb-4">Transparent Pricing</div>
              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[var(--color-text)] mb-4 leading-tight">
                Simple,{" "}
                <span className="text-gold-gradient">Honest Pricing</span>
              </h1>
              <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto mb-10">
                No hidden charges. No monthly subscriptions. Pay once, own it forever.
                Full source code — your product, your rules.
              </p>

              {/* Trust badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {TRUST.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="card p-4 text-center">
                    <Icon size={22} className="text-[var(--color-gold)] mx-auto mb-2" />
                    <p className="text-xs font-semibold text-[var(--color-text)] leading-tight">{label}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Plans ── */}
        <section className="py-16 lg:py-24 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text)] mb-3">
                Choose Your <span className="text-gold-gradient">Plan</span>
              </h2>
              <p className="text-[var(--color-text-secondary)]">All plans include full source code + complete company branding</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {PLANS.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className={`relative rounded-2xl overflow-hidden ${
                    plan.popular
                      ? "shadow-[0_0_0_2px_#C9A227,0_24px_60px_rgba(201,162,39,0.2)] md:scale-105"
                      : "shadow-[var(--shadow-card)]"
                  }`}
                >
                  {plan.popular && (
                    <div className="py-2 text-center text-sm font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #C9A227, #E8C547)" }}>
                      ⭐ MOST POPULAR
                    </div>
                  )}

                  {/* Header */}
                  <div className={`p-8 ${plan.popular ? "" : ""} text-white`}
                    style={{ background: "linear-gradient(135deg, #0A1628, #1E293B)" }}>
                    <div className="text-4xl mb-3">{plan.emoji}</div>
                    <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                    <p className="text-white/50 text-sm mb-6">{plan.tagline}</p>

                    <div className="mb-6">
                      <div className="flex items-end gap-1">
                        <span className="text-lg text-white/60 mb-1">from</span>
                        <span className="text-5xl font-black"
                          style={{ color: plan.popular ? "#E8C547" : "white" }}>
                          ${plan.oneTimePrice}
                        </span>
                        {plan.name === "Custom" && <span className="text-white/60 text-xl mb-1">+</span>}
                      </div>
                      <p className="text-white/40 text-sm mt-1">one-time payment · no monthly fee</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white/8 rounded-xl p-3 text-center border border-white/10">
                        <div className="text-white font-bold">{plan.delivery}</div>
                        <div className="text-white/40 text-xs mt-0.5">Delivery</div>
                      </div>
                      <div className="bg-white/8 rounded-xl p-3 text-center border border-white/10">
                        <div className="text-white font-bold">{plan.support}</div>
                        <div className="text-white/40 text-xs mt-0.5">Support</div>
                      </div>
                    </div>

                    <Link href={plan.href} className="block">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                        style={{
                          background: plan.popular
                            ? "linear-gradient(135deg, #C9A227, #E8C547)"
                            : "rgba(255,255,255,0.08)",
                          color: "white",
                          border: plan.popular ? "none" : "1px solid rgba(255,255,255,0.15)",
                        }}
                      >
                        {plan.cta} <ArrowRight size={15} />
                      </motion.button>
                    </Link>
                  </div>

                  {/* Features list */}
                  <div className="p-8 bg-[var(--color-bg)] space-y-2.5">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-3">
                        <Check size={15} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                        <span className="text-sm text-[var(--color-text-secondary)]">{f}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((f) => (
                      <div key={f} className="flex items-start gap-3 opacity-35">
                        <X size={15} className="mt-0.5 shrink-0 text-red-400" />
                        <span className="text-sm text-[var(--color-text-muted)] line-through">{f}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-center mt-12"
            >
              <p className="text-[var(--color-text-secondary)] mb-5">
                Not sure which plan is right? Get a <strong className="text-[var(--color-text)]">free consultation</strong> — no obligation.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact" className="btn-primary flex items-center gap-2">
                  <Phone size={16} /> Book Free Consultation
                </Link>
                <a href="https://wa.me/919942000413?text=I have a question about pricing" target="_blank" rel="noopener noreferrer"
                  className="btn-outline flex items-center gap-2">
                  <MessageCircle size={16} /> Ask on WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Product-wise Pricing Table ── */}
        <section className="py-16 lg:py-24 bg-[var(--color-bg-secondary)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="section-badge mx-auto mb-3">Per Product Pricing</div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text)] mb-3">
                Every Product, <span className="text-gold-gradient">Every Price</span>
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                Website and software pricing by product type — Basic from $96
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)]">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "linear-gradient(135deg, #0A1628, #1E293B)" }}>
                    <th className="text-left p-5 text-white font-semibold text-sm">Product</th>
                    <th className="text-center p-5 text-white font-semibold text-sm">Basic Plan</th>
                    <th className="text-center p-5 font-semibold text-sm" style={{ color: "#E8C547" }}>
                      Premium Plan ⭐
                    </th>
                    <th className="text-center p-5 text-white font-semibold text-sm">Custom</th>
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTS_PRICING.map((p, i) => (
                    <motion.tr
                      key={p.name}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className={`border-b border-[var(--color-border)] hover:bg-[var(--color-gold)]/3 transition-colors ${
                        i % 2 === 0 ? "bg-[var(--color-bg)]" : "bg-[var(--color-bg-secondary)]"
                      }`}
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{p.icon}</span>
                          <span className="font-semibold text-sm text-[var(--color-text)]">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <span className="font-bold text-lg text-[var(--color-text)]">${p.basic}</span>
                      </td>
                      <td className="p-5 text-center">
                        <span className="font-bold text-lg" style={{ color: "#C9A227" }}>${p.premium}</span>
                      </td>
                      <td className="p-5 text-center">
                        <Link href="/contact"
                          className="text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] underline underline-offset-2 transition-colors">
                          Get Quote →
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: "linear-gradient(135deg, #0A1628, #1E293B)" }}>
                    <td className="p-5 text-white font-bold text-sm">Starting price</td>
                    <td className="p-5 text-center text-white font-bold">$96</td>
                    <td className="p-5 text-center font-bold text-lg" style={{ color: "#E8C547" }}>$179</td>
                    <td className="p-5 text-center text-white font-bold">$599+</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-center text-xs text-[var(--color-text-muted)] mt-3">
              * All prices are one-time payments. Domain + Hosting included FREE for 1 year with Premium plan.
            </p>
          </div>
        </section>

        {/* ── Feature Comparison ── */}
        <section className="py-16 lg:py-24 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="section-badge mx-auto mb-3">Plan Comparison</div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text)] mb-3">
                What&apos;s Included in <span className="text-gold-gradient">Each Plan</span>
              </h2>
            </div>

            <div className="overflow-x-auto rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)]">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "linear-gradient(135deg, #0A1628, #1E293B)" }}>
                    <th className="text-left p-5 text-white font-semibold text-sm w-2/5">Feature</th>
                    <th className="text-center p-5 text-white font-semibold text-sm">Basic</th>
                    <th className="text-center p-5 font-semibold text-sm" style={{ color: "#E8C547" }}>Premium ⭐</th>
                    <th className="text-center p-5 text-white font-semibold text-sm">Custom</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row, i) => (
                    <tr key={row.feature}
                      className={`border-b border-[var(--color-border)] ${
                        i % 2 === 0 ? "bg-[var(--color-bg)]" : "bg-[var(--color-bg-secondary)]"
                      }`}>
                      <td className="p-4 text-sm font-medium text-[var(--color-text)]">{row.feature}</td>
                      {[row.basic, row.premium, row.custom].map((val, j) => (
                        <td key={j} className="p-4 text-center">
                          {val === true ? (
                            <Check size={18} className="mx-auto text-[var(--color-success)]" />
                          ) : val === false ? (
                            <X size={18} className="mx-auto text-red-400 opacity-40" />
                          ) : (
                            <span className="text-sm font-medium text-[var(--color-text-secondary)]">{val}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: "linear-gradient(135deg, #0A1628, #1E293B)" }}>
                    <td className="p-5 text-white font-bold text-sm">Starting price</td>
                    <td className="p-5 text-center text-white font-bold">$96</td>
                    <td className="p-5 text-center font-bold text-xl" style={{ color: "#E8C547" }}>$179</td>
                    <td className="p-5 text-center text-white font-bold">$599+</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>

        {/* ── Add-ons ── */}
        <section className="py-16 lg:py-24 bg-[var(--color-bg-secondary)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="section-badge mx-auto mb-3">Optional Add-ons</div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text)] mb-3">
                Power Up Your <span className="text-gold-gradient">Project</span>
              </h2>
              <p className="text-[var(--color-text-secondary)]">Add any of these to any plan at checkout or after delivery</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-5">
              {ADDONS.map((addon, i) => (
                <motion.div
                  key={addon.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-5 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="text-3xl mb-3">{addon.icon}</div>
                  <h4 className="font-bold text-sm text-[var(--color-text)] mb-1 leading-tight">{addon.name}</h4>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-3 leading-relaxed">{addon.desc}</p>
                  <span className="font-black text-base" style={{ color: "var(--color-gold)" }}>{addon.price}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Value Proposition ── */}
        <section className="py-16 lg:py-20 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="section-badge mb-4">Why KVL TECH?</div>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text)] mb-5 leading-tight">
                  More Value for{" "}
                  <span className="text-gold-gradient">Every Dollar You Spend</span>
                </h2>
                <p className="text-[var(--color-text-secondary)] text-lg mb-8 leading-relaxed">
                  While competitors charge $2,000–$15,000 for basic websites with monthly fees,
                  KVL TECH delivers the same quality from $96 — with full source code and zero recurring charges.
                </p>
                <div className="space-y-4">
                  {[
                    { title: "One-time payment", desc: "No monthly subscriptions. Your investment is made once — ROI from day one." },
                    { title: "Full source code ownership", desc: "You own 100% of the code. No vendor lock-in. Take it anywhere." },
                    { title: "Lightning-fast delivery", desc: "Websites delivered in 1–5 days — not weeks or months." },
                    { title: "Expert support included", desc: "30–365 days of dedicated support from senior developers." },
                  ].map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4 p-4 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={16} className="text-[var(--color-gold)]" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[var(--color-text)]">{item.title}</p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Comparison card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="card p-8"
              >
                <h3 className="font-display font-bold text-xl text-[var(--color-text)] mb-6 text-center">
                  KVL TECH vs The Market
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Restaurant Website", them: "$2,500–$8,000", us: "$156", savings: "Save $2,300+" },
                    { label: "School Management", them: "$5,000–$20,000", us: "$359", savings: "Save $4,600+" },
                    { label: "E-commerce Store", them: "$3,000–$12,000", us: "$192", savings: "Save $2,800+" },
                    { label: "Monthly fees", them: "$99–$499/mo", us: "$0/mo", savings: "Save $1,200/yr" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-secondary)]">
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-text)]">{row.label}</p>
                        <p className="text-xs text-red-400 line-through mt-0.5">{row.them}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg text-[var(--color-gold)]">{row.us}</p>
                        <p className="text-[10px] text-[var(--color-success)] font-semibold">{row.savings}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-xl text-center"
                  style={{ background: "linear-gradient(135deg, #C9A227/10, #E8C547/10)", border: "1px solid rgba(201,162,39,0.3)" }}>
                  <p className="font-bold text-[var(--color-gold)]">Average client saves $5,000+ vs market rates</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">Same quality. Professional delivery. Full ownership.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 lg:py-24 bg-[var(--color-bg-secondary)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="section-badge mx-auto mb-3">FAQ</div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text)] mb-3">
                Frequently Asked <span className="text-gold-gradient">Questions</span>
              </h2>
              <p className="text-[var(--color-text-secondary)]">Everything you need to know before you buy</p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="card overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between p-5 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-semibold text-sm text-[var(--color-text)] pr-4 leading-snug">{faq.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={18} className="shrink-0 text-[var(--color-text-secondary)]" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 text-sm text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)] pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Bottom ── */}
        <section className="py-20 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0A1628 0%, #1E2D4A 50%, #0A1628 100%)" }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-1/3 w-80 h-80 rounded-full bg-[var(--color-gold)]/8 blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-blue-600/10 blur-[80px]" />
          </div>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex justify-center mb-6">
                <Image src="/kvl-tech-logo-white.png" alt="KVL TECH" width={130} height={44} className="h-10 w-auto object-contain" />
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
                Ready to <span style={{ color: "#E8C547" }}>Get Started?</span>
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                Launch your website or software today. Free consultation included — tell us what you need and we&apos;ll recommend the perfect plan.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="btn-gold flex items-center gap-2 text-base px-8 py-4">
                    <Zap size={18} /> Start Your Project
                  </motion.button>
                </Link>
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 text-base px-8 py-4 rounded-xl font-semibold border border-white/20 text-white hover:bg-white/10 transition-colors">
                    Browse Products <ArrowRight size={18} />
                  </motion.button>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-white/40">
                <span>✅ dedicated post-delivery support</span>
                <span>🔒 Secure payment</span>
                <span>⚡ Delivery in days, not months</span>
                <span>🏆 1,200+ happy clients</span>
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
