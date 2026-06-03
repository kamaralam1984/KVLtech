"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Zap, Star, ArrowRight, Phone, MessageCircle, HelpCircle, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ── Data ─────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: "Basic",
    emoji: "🚀",
    tagline: "Startups & small businesses ke liye",
    monthlyPrice: null,
    oneTimePrice: 12999,
    delivery: "3-5 din",
    support: "30 din",
    popular: false,
    color: "var(--color-navy)",
    gradient: "from-slate-800 to-slate-900",
    features: [
      "Ready-made website / software",
      "Aapki company logo + colors",
      "Mobile responsive design",
      "SEO optimized (score 80+)",
      "Contact form integration",
      "Google Analytics setup",
      "WhatsApp button",
      "Source code included",
      "30 din free support",
    ],
    notIncluded: [
      "Custom features",
      "Payment gateway",
      "Admin panel",
      "Domain + Hosting",
    ],
    cta: "Basic Se Shuru Karein",
    href: "/contact",
  },
  {
    name: "Premium",
    emoji: "⭐",
    tagline: "Sabse popular — growing businesses ke liye",
    monthlyPrice: null,
    oneTimePrice: 24999,
    delivery: "1-2 din",
    support: "90 din",
    popular: true,
    color: "#C9A227",
    gradient: "from-amber-500 to-amber-700",
    features: [
      "Sab kuch Basic mein +",
      "Full company branding",
      "Custom domain setup",
      "Payment gateway (Razorpay/UPI)",
      "Admin dashboard",
      "SEO optimized (score 90+)",
      "WhatsApp chat widget",
      "FREE Domain + Hosting (1 year)",
      "Social media integration",
      "Email notifications",
      "90 din priority support",
    ],
    notIncluded: [
      "Custom API integrations",
    ],
    cta: "Premium Start Karein",
    href: "/contact",
  },
  {
    name: "Custom",
    emoji: "💎",
    tagline: "Enterprise-grade — apni marzi ka sab kuch",
    monthlyPrice: null,
    oneTimePrice: 49999,
    delivery: "7-15 din",
    support: "1 saal",
    popular: false,
    color: "var(--color-navy)",
    gradient: "from-slate-800 to-slate-900",
    features: [
      "Sab kuch Premium mein +",
      "Fully custom development",
      "Custom API integrations",
      "Multi-language support",
      "Advanced analytics dashboard",
      "AI chatbot integration",
      "Automated marketing tools",
      "Multi-location / multi-branch",
      "1 saal dedicated support",
      "Free annual maintenance",
      "Priority deployment",
      "Custom feature development",
    ],
    notIncluded: [],
    cta: "Quote Maangein",
    href: "/contact",
  },
];

const PRODUCTS_PRICING = [
  { name: "Restaurant Website", basic: 12999, premium: 24999, icon: "🍽️" },
  { name: "School Management System", basic: 18999, premium: 34999, icon: "🏫" },
  { name: "Hospital Management System", basic: 22999, premium: 44999, icon: "🏥" },
  { name: "E-commerce Platform", basic: 15999, premium: 29999, icon: "🛒" },
  { name: "Hotel Booking Website", basic: 14999, premium: 27999, icon: "🏨" },
  { name: "Real Estate Website", basic: 13999, premium: 25999, icon: "🏠" },
];

const COMPARE_ROWS = [
  { feature: "Delivery time", basic: "3-5 din", premium: "1-2 din", custom: "7-15 din" },
  { feature: "Support duration", basic: "30 din", premium: "90 din", custom: "1 saal" },
  { feature: "Company branding", basic: "Basic", premium: "Full", custom: "Full" },
  { feature: "Mobile responsive", basic: true, premium: true, custom: true },
  { feature: "SEO optimization", basic: "80+ score", premium: "90+ score", custom: "Custom" },
  { feature: "Payment gateway", basic: false, premium: true, custom: true },
  { feature: "Admin dashboard", basic: false, premium: true, custom: true },
  { feature: "Domain + Hosting", basic: false, premium: "1 saal free", custom: "1 saal free" },
  { feature: "WhatsApp widget", basic: true, premium: true, custom: true },
  { feature: "Source code", basic: true, premium: true, custom: true },
  { feature: "Custom features", basic: false, premium: false, custom: true },
  { feature: "API integrations", basic: false, premium: false, custom: true },
  { feature: "Annual maintenance", basic: false, premium: false, custom: true },
  { feature: "Priority support", basic: false, premium: true, custom: true },
];

const FAQS = [
  {
    q: "Kya ek baar payment karne ke baad koi monthly charge hoga?",
    a: "Bilkul nahi! Yeh ek baar ki payment hai — no monthly fees, no hidden charges. Sirf domain + hosting renewal hoti hai yearly (approx ₹2,000-3,000), jo Premium plan ke saath pehle saal FREE milti hai.",
  },
  {
    q: "Kya main baad mein Basic se Premium upgrade kar sakta hoon?",
    a: "Haan! Aap kabhi bhi upgrade kar sakte hain. Upgrade cost sirf difference amount hogi — matlab agar aapne ₹12,999 ka Basic liya tha, toh Premium ke liye sirf ₹12,000 aur dene honge.",
  },
  {
    q: "Payment kaise hogi?",
    a: "Razorpay se online payment — UPI, Credit/Debit Card, Net Banking, EMI sab available hai. 50% advance, 50% delivery pe. Custom projects ke liye milestone-based payment bhi possible hai.",
  },
  {
    q: "Kya source code milega?",
    a: "Haan! Sab plans mein complete source code milta hai — aap apne server pe host kar sakte hain, future developers ko de sakte hain. No lock-in, complete ownership aapki.",
  },
  {
    q: "Agar website pasand na aaye toh?",
    a: "100% money-back guarantee! Delivery ke 7 din ke andar agar aap satisfied nahi hain toh full refund. Abhi tak kisi bhi client ne refund nahi maanga — 1,200+ happy clients!",
  },
  {
    q: "Custom plan mein kya-kya ban sakta hai?",
    a: "Literally kuch bhi! Mobile app, multi-vendor marketplace, ERP system, custom AI tools, booking platforms — jo bhi aapke business ko chahiye. Free consultation mein discuss karein.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeProduct, setActiveProduct] = useState<string | null>(null);

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="section-padding" style={{ background: "var(--color-bg-secondary)" }}>
        <div className="container-kvl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image src="/kvl-tech-logo-tight.png" alt="KVL TECH" width={130} height={44} className="h-11 w-auto object-contain dark:hidden" />
              <Image src="/kvl-tech-logo-white.png" alt="KVL TECH" width={130} height={44} className="h-11 w-auto object-contain hidden dark:block" />
            </div>

            <span className="section-badge mb-4">PRICING</span>

            <h1 className="heading-xl mb-4">
              Simple,{" "}
              <span style={{ color: "var(--color-gold)" }}>Honest Pricing</span>
            </h1>
            <p className="body-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-8">
              Koi hidden charges nahi. Koi monthly subscription nahi. Ek baar invest karo, lifetime results pao.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-2">
              {[
                { icon: "✅", text: "100% Money-back Guarantee" },
                { icon: "🔒", text: "Secure Payment" },
                { icon: "⚡", text: "3-5 Din Delivery" },
                { icon: "🏆", text: "1,200+ Happy Clients" },
              ].map((b) => (
                <span key={b.text} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full glass-card">
                  {b.icon} {b.text}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section className="section-padding">
        <div className="container-kvl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`relative rounded-2xl overflow-hidden ${plan.popular ? "shadow-[var(--shadow-gold)] scale-105" : "shadow-[var(--shadow-card)]"}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 py-2 text-center text-sm font-bold text-white z-10"
                    style={{ background: "var(--color-gold)" }}>
                    ⭐ SABSE POPULAR
                  </div>
                )}

                {/* Header */}
                <div className={`p-8 ${plan.popular ? "pt-12" : ""} text-white`}
                  style={{ background: plan.popular ? "linear-gradient(135deg, #1a2035, #2d3a5f)" : "linear-gradient(135deg, #1a2035, #2d3a5f)" }}>
                  <div className="text-4xl mb-3">{plan.emoji}</div>
                  <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-6">{plan.tagline}</p>

                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black" style={{ color: plan.popular ? "#d4a017" : "white" }}>
                        ₹{plan.oneTimePrice.toLocaleString("en-IN")}
                      </span>
                      {plan.name === "Custom" && <span className="text-gray-400 text-lg mb-1">+</span>}
                    </div>
                    <p className="text-gray-400 text-sm">ek baar ki payment • no monthly fee</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <div className="text-white font-bold text-lg">{plan.delivery}</div>
                      <div className="text-gray-400 text-xs">Delivery</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <div className="text-white font-bold text-lg">{plan.support}</div>
                      <div className="text-gray-400 text-xs">Support</div>
                    </div>
                  </div>

                  <Link href={plan.href}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-3 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2"
                      style={{
                        background: plan.popular ? "linear-gradient(135deg, #d4a017, #b8860b)" : "rgba(255,255,255,0.1)",
                        color: "white",
                        border: plan.popular ? "none" : "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      {plan.cta} <ArrowRight size={16} />
                    </motion.button>
                  </Link>
                </div>

                {/* Features */}
                <div className="p-8 bg-[var(--color-bg)] space-y-3">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#22c55e" }} />
                      <span className="text-sm text-[var(--color-text-secondary)]">{f}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <div key={f} className="flex items-start gap-3 opacity-40">
                      <X size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
                      <span className="text-sm text-[var(--color-text-secondary)] line-through">{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA below plans */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-[var(--color-text-secondary)] mb-4">
              Kaunsa plan sahi hai? Free consultation mein discuss karein —{" "}
              <strong>koi obligation nahi!</strong>
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <button className="btn-primary flex items-center gap-2">
                  <Phone size={16} /> Free Consultation Book Karein
                </button>
              </Link>
              <a href="https://wa.me/919876543210?text=Pricing ke baare mein poochna tha" target="_blank" rel="noopener noreferrer">
                <button className="btn-secondary flex items-center gap-2">
                  <MessageCircle size={16} /> WhatsApp Pe Poochein
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Product-wise Pricing Table ── */}
      <section className="section-padding" style={{ background: "var(--color-bg-secondary)" }}>
        <div className="container-kvl">
          <div className="text-center mb-12">
            <span className="section-badge mb-3">PRODUCT-WISE PRICING</span>
            <h2 className="heading-lg mb-3">
              Har Product Ka{" "}
              <span style={{ color: "var(--color-gold)" }}>Alag Price</span>
            </h2>
            <p className="body-md text-[var(--color-text-secondary)]">
              Basic plans ₹12,999 se shuru — aapke business type ke hisaab se
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl shadow-[var(--shadow-card)]">
            <table className="w-full">
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #1a2035, #2d3a5f)" }}>
                  <th className="text-left p-5 text-white font-semibold text-sm">Product</th>
                  <th className="text-center p-5 text-white font-semibold text-sm">Basic Plan</th>
                  <th className="text-center p-5 font-semibold text-sm" style={{ color: "#d4a017" }}>Premium Plan ⭐</th>
                  <th className="text-center p-5 text-white font-semibold text-sm">Custom Plan</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCTS_PRICING.map((p, i) => (
                  <motion.tr
                    key={p.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer"
                    onClick={() => setActiveProduct(activeProduct === p.name ? null : p.name)}
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.icon}</span>
                        <span className="font-semibold text-[var(--color-text)]">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className="font-bold text-lg text-[var(--color-text)]">₹{p.basic.toLocaleString("en-IN")}</span>
                    </td>
                    <td className="p-5 text-center">
                      <span className="font-bold text-lg" style={{ color: "#d4a017" }}>₹{p.premium.toLocaleString("en-IN")}</span>
                    </td>
                    <td className="p-5 text-center">
                      <Link href="/contact">
                        <span className="text-sm font-semibold text-[var(--color-text-secondary)] underline underline-offset-2 hover:text-[var(--color-gold)]">
                          Quote Maangein →
                        </span>
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-sm text-[var(--color-text-secondary)] mt-4">
            * Sab prices ek-baar ki payment hain. GST applicable. Domain/Hosting Premium mein free.
          </p>
        </div>
      </section>

      {/* ── Feature Comparison Table ── */}
      <section className="section-padding">
        <div className="container-kvl">
          <div className="text-center mb-12">
            <span className="section-badge mb-3">COMPARISON</span>
            <h2 className="heading-lg mb-3">
              Plan-wise{" "}
              <span style={{ color: "var(--color-gold)" }}>Feature Comparison</span>
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl shadow-[var(--shadow-card)]">
            <table className="w-full">
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #1a2035, #2d3a5f)" }}>
                  <th className="text-left p-5 text-white font-semibold text-sm w-2/5">Feature</th>
                  <th className="text-center p-5 text-white font-semibold text-sm">Basic</th>
                  <th className="text-center p-5 font-semibold text-sm" style={{ color: "#d4a017" }}>Premium ⭐</th>
                  <th className="text-center p-5 text-white font-semibold text-sm">Custom</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-[var(--color-border)] ${i % 2 === 0 ? "bg-[var(--color-bg)]" : "bg-[var(--color-bg-secondary)]"}`}>
                    <td className="p-4 text-sm font-medium text-[var(--color-text)]">{row.feature}</td>
                    {[row.basic, row.premium, row.custom].map((val, j) => (
                      <td key={j} className="p-4 text-center">
                        {val === true ? (
                          <Check size={18} className="mx-auto" style={{ color: "#22c55e" }} />
                        ) : val === false ? (
                          <X size={18} className="mx-auto text-red-400 opacity-50" />
                        ) : (
                          <span className="text-sm font-medium text-[var(--color-text-secondary)]">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "linear-gradient(135deg, #1a2035, #2d3a5f)" }}>
                  <td className="p-5 text-white font-bold">Price (starting)</td>
                  <td className="p-5 text-center text-white font-bold">₹12,999</td>
                  <td className="p-5 text-center font-bold text-xl" style={{ color: "#d4a017" }}>₹24,999</td>
                  <td className="p-5 text-center text-white font-bold">₹49,999+</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* ── Add-ons ── */}
      <section className="section-padding" style={{ background: "var(--color-bg-secondary)" }}>
        <div className="container-kvl">
          <div className="text-center mb-10">
            <span className="section-badge mb-3">ADD-ONS</span>
            <h2 className="heading-lg mb-2">
              Extra Features{" "}
              <span style={{ color: "var(--color-gold)" }}>Add Karein</span>
            </h2>
            <p className="body-md text-[var(--color-text-secondary)]">Kisi bhi plan ke saath add kar sakte hain</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Annual Maintenance", price: "₹2,999/yr", desc: "Bug fixes, updates, minor changes", icon: "🔧" },
              { name: "Extra Support (1 yr)", price: "₹4,999/yr", desc: "Priority support + same-day response", icon: "🎯" },
              { name: "Google Ads Setup", price: "₹3,999", desc: "Campaign setup + ₹2,000 ad credit", icon: "📢" },
              { name: "WhatsApp Marketing", price: "₹1,999/mo", desc: "Bulk messages to 1,000 contacts", icon: "💬" },
              { name: "Extra Language", price: "₹4,999", desc: "Hindi/English/Regional language add", icon: "🌐" },
              { name: "Mobile App (basic)", price: "₹14,999", desc: "Android APK for your website", icon: "📱" },
              { name: "Social Media Kit", price: "₹2,499", desc: "20 branded posts + templates", icon: "📸" },
              { name: "Logo Design", price: "₹1,999", desc: "Professional logo + 3 revisions", icon: "🎨" },
            ].map((addon, i) => (
              <motion.div
                key={addon.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5 hover:shadow-[var(--shadow-luxury)] transition-shadow"
              >
                <div className="text-3xl mb-3">{addon.icon}</div>
                <h4 className="font-bold text-[var(--color-text)] mb-1 text-sm">{addon.name}</h4>
                <p className="text-xs text-[var(--color-text-secondary)] mb-3">{addon.desc}</p>
                <span className="font-black text-lg" style={{ color: "var(--color-gold)" }}>{addon.price}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-padding">
        <div className="container-kvl max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="section-badge mb-3">FAQ</span>
            <h2 className="heading-lg mb-2">
              Aksar Pooche Jaane Wale{" "}
              <span style={{ color: "var(--color-gold)" }}>Sawaal</span>
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                className="card overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-[var(--color-text)] pr-4 text-sm">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={18} className="flex-shrink-0 text-[var(--color-text-secondary)]" />
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
      <section className="section-padding" style={{ background: "linear-gradient(135deg, #1a2035, #2d3a5f)" }}>
        <div className="container-kvl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-center mb-6">
              <Image src="/kvl-tech-logo-white.png" alt="KVL TECH" width={130} height={44} className="h-11 w-auto object-contain" />
            </div>
            <h2 className="heading-lg text-white mb-4">
              Ready to{" "}
              <span style={{ color: "#d4a017" }}>Get Started?</span>
            </h2>
            <p className="body-lg text-gray-400 mb-8 max-w-xl mx-auto">
              Aaj hi apni website ka safar shuru karein. Free consultation mein batao kya chahiye — hum best plan suggest karenge.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="btn-primary flex items-center gap-2 text-base px-8 py-4"
                >
                  <Zap size={18} /> Abhi Start Karein
                </motion.button>
              </Link>
              <Link href="/products">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 text-base px-8 py-4 rounded-xl font-semibold border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  Products Dekhein <ArrowRight size={18} />
                </motion.button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-gray-400">
              <span>✅ 100% Money-back Guarantee</span>
              <span>🔒 Secure Payment</span>
              <span>⚡ Fast Delivery</span>
              <span>🏆 1,200+ Happy Clients</span>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
