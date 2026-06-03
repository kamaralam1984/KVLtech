"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const plans = [
  {
    name: "Basic",
    price: "₹12,999",
    tagline: "Perfect for startups & small businesses",
    delivery: "3-5 business days",
    support: "30 days",
    features: [
      "Ready-made website/software",
      "Basic logo & color branding",
      "Mobile responsive design",
      "SEO optimized (score 80+)",
      "Contact form integration",
      "Google Analytics setup",
      "30 days free support",
      "Source code included",
    ],
    notIncluded: ["Custom features", "Payment gateway", "Admin panel"],
    cta: "Get Started",
    href: "/contact",
    popular: false,
    color: "#0F172A",
  },
  {
    name: "Premium",
    price: "₹24,999",
    tagline: "Most popular for growing businesses",
    delivery: "1-2 business days",
    support: "90 days",
    features: [
      "Everything in Basic",
      "Full company branding",
      "Custom domain setup",
      "Payment gateway integration",
      "Admin dashboard",
      "SEO optimized (score 90+)",
      "WhatsApp chat widget",
      "90 days priority support",
      "Free hosting setup",
      "Social media integration",
    ],
    notIncluded: ["Custom API integrations"],
    cta: "Start Premium",
    href: "/contact",
    popular: true,
    color: "#C9A227",
  },
  {
    name: "Custom",
    price: "₹49,999+",
    tagline: "Enterprise-grade custom solutions",
    delivery: "7-15 business days",
    support: "1 year",
    features: [
      "Everything in Premium",
      "Fully custom development",
      "Custom API integrations",
      "Multi-language support",
      "Advanced analytics dashboard",
      "Automated marketing tools",
      "AI chatbot integration",
      "1 year dedicated support",
      "Free annual maintenance",
      "Priority deployment",
      "Custom feature development",
    ],
    notIncluded: [],
    cta: "Request Proposal",
    href: "/contact",
    popular: false,
    color: "#0F172A",
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="py-20 lg:py-28 bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="section-badge mx-auto">Transparent Pricing</div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[var(--color-text)] mb-4">
            Simple, Honest{" "}
            <span className="text-gold-gradient">Pricing</span>
          </h2>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto mb-6">
            No hidden fees. No surprises. Choose the plan that fits your business and
            get started today.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                !annual
                  ? "bg-[var(--color-bg)] shadow-sm text-[var(--color-text)]"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              One-Time Purchase
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                annual
                  ? "bg-[var(--color-bg)] shadow-sm text-[var(--color-text)]"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              Monthly Rental
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-gold)]/15 text-[var(--color-gold)]">
                SAVE 30%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--color-gold)] text-white text-xs font-bold rounded-full shadow-[var(--shadow-gold)]">
                    <Star size={11} fill="white" /> Most Popular
                  </span>
                </div>
              )}
              <div
                className={`card h-full flex flex-col p-7 ${
                  plan.popular
                    ? "border-[var(--color-gold)] border-2 shadow-[var(--shadow-gold)]"
                    : ""
                }`}
              >
                {/* Plan name */}
                <div className="mb-5">
                  <h3 className="font-display font-bold text-xl text-[var(--color-text)] mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">{plan.tagline}</p>
                </div>

                {/* Price */}
                <div className="mb-5 pb-5 border-b border-[var(--color-border)]">
                  <div className="flex items-end gap-2">
                    <span className="font-display font-bold text-3xl text-[var(--color-text)]">
                      {annual
                        ? `₹${Math.round(parseInt(plan.price.replace(/[₹,+]/g, "")) * 0.7 / 100) * 100}`
                        : plan.price}
                    </span>
                    <span className="text-[var(--color-text-muted)] text-sm mb-1">
                      {plan.name === "Custom" ? "onwards" : annual ? "/month" : "one-time"}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      ⚡ {plan.delivery}
                    </span>
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      🛡️ {plan.support} support
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check size={15} className="text-[var(--color-success)] shrink-0 mt-0.5" />
                      <span className="text-[var(--color-text-secondary)]">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={`w-full py-3 rounded-xl font-semibold text-sm text-center flex items-center justify-center gap-2 transition-all ${
                    plan.popular
                      ? "btn-gold"
                      : "btn-primary"
                  }`}
                >
                  {plan.cta} <ArrowRight size={15} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-[var(--color-text-muted)] mt-8">
          All plans include full source code ownership & company branding.
          <Link href="/contact" className="text-[var(--color-gold)] hover:underline ml-1">
            Need a custom quote?
          </Link>
        </p>
      </div>
    </section>
  );
}
