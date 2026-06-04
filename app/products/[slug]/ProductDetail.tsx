"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Check, ChevronDown, Star,
  Phone, MessageCircle, Zap, Shield, Clock, ArrowLeft, Loader2, CreditCard, ExternalLink
} from "lucide-react";
import type { Product } from "@/lib/products";
import { ADDONS } from "@/lib/products";
import { useLanguage } from "@/contexts/LanguageContext";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const YEARLY_MSGS = [
  "🎉 Recurring add-ons billed annually at 50% discount!",
  "💰 Save up to 50% by switching to yearly billing!",
  "🚀 Best value — commit yearly, pay half!",
  "⚡ Yearly plan: double the time, half the price!",
  "🏆 Smart choice! Yearly = maximum savings!",
];

function YearlyTyping() {
  const [displayed, setDisplayed] = useState("");
  const [msgIdx, setMsgIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pause" | "erasing">("typing");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const msg = YEARLY_MSGS[msgIdx];

    if (phase === "typing") {
      if (displayed.length < msg.length) {
        const delay = 30 + Math.random() * 40; // random speed per char
        timerRef.current = setTimeout(() => setDisplayed(msg.slice(0, displayed.length + 1)), delay);
      } else {
        timerRef.current = setTimeout(() => setPhase("pause"), 2200);
      }
    } else if (phase === "pause") {
      timerRef.current = setTimeout(() => setPhase("erasing"), 400);
    } else {
      if (displayed.length > 0) {
        timerRef.current = setTimeout(() => setDisplayed(d => d.slice(0, -1)), 18);
      } else {
        setMsgIdx(i => (i + 1) % YEARLY_MSGS.length);
        setPhase("typing");
      }
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [displayed, phase, msgIdx]);

  // reset on mount
  useEffect(() => { setDisplayed(""); setPhase("typing"); setMsgIdx(0); }, []);

  return (
    <p className="text-xs text-green-600 font-medium mt-2 h-4 flex items-center justify-center gap-0.5">
      {displayed}
      <span className="inline-block w-0.5 h-3.5 bg-green-500 ml-0.5 animate-pulse" />
    </p>
  );
}

export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [activePlan, setActivePlan] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", business: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submittedOrderNo, setSubmittedOrderNo] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const toggleAddon = (id: string) =>
    setSelectedAddons(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const getAddonPrice = (addon: typeof ADDONS[0]) => {
    if (!addon.isRecurring) return addon.monthlyPrice;
    return billingCycle === "yearly"
      ? Math.round(addon.monthlyPrice * 12 * 0.5)  // 50% off yearly
      : addon.monthlyPrice;
  };

  const addonTotal = ADDONS.filter(a => selectedAddons.has(a.id)).reduce((sum, a) => sum + getAddonPrice(a), 0);

  const planPriceMap: Record<string, number> = {
    Basic: product.basicPrice,
    Premium: product.premiumPrice,
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayError("");
    const currentPlan = product.plans[activePlan];
    const isCustom = currentPlan.price === "Quote";

    // Custom plan — just show WhatsApp
    if (isCustom) {
      window.open(`https://wa.me/919942000413?text=Hi! I want a custom quote for ${product.name}.`, "_blank");
      return;
    }

    setPaying(true);
    const baseAmount = planPriceMap[currentPlan.name] || product.premiumPrice;
    const amount = baseAmount + addonTotal;
    const addonsSelected = ADDONS.filter(a => selectedAddons.has(a.id)).map(a => a.name);

    try {
      // 1. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) { setPayError("Payment gateway load nahi hua. Please refresh karein."); setPaying(false); return; }

      // 2. Create Razorpay order on server
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, productSlug: product.slug, plan: currentPlan.name, addons: addonsSelected, ...form }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) { setPayError(orderData.error || "Order create nahi hua."); setPaying(false); return; }

      // 3. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "KVL TECH",
        description: `${product.name} — ${currentPlan.name} Plan`,
        image: "/kvl-tech-logo-tight.png",
        prefill: { name: form.name, contact: form.phone, email: form.email },
        theme: { color: "#C9A227" },
        handler: async (response: any) => {
          // 4. Verify payment on server
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              productSlug: product.slug,
              plan: currentPlan.name,
              amount,
              ...form,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            setSubmittedOrderNo(verifyData.orderNumber);
            setSubmitted(true);
            setTimeout(() => router.push("/client-portal"), 3000);
          } else {
            setPayError("Payment verify nahi hua. Support se contact karein.");
          }
          setPaying(false);
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.open();
    } catch {
      setPayError("Kuch galat ho gaya. Please dobara try karein.");
      setPaying(false);
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <Link href="/" className="hover:text-[var(--color-text)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[var(--color-text)] transition-colors">Products</Link>
          <span>/</span>
          <span className="text-[var(--color-text)]">{product.name}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 lg:py-16 bg-[var(--color-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <Link href="/products" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-6 transition-colors">
                <ArrowLeft size={16} /> Back to Products
              </Link>
              <div className="section-badge">{product.categoryLabel}</div>
              <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[var(--color-text)] mb-3 leading-tight">
                {product.name}
              </h1>
              <p className="text-[var(--color-gold)] font-semibold text-lg mb-4">{product.tagline}</p>
              <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-6">{product.description}</p>

              {/* Highlights */}
              <div className="grid grid-cols-2 gap-3 mb-7">
                {product.highlights.map(h => (
                  <div key={h} className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                    <Star size={14} className="text-[var(--color-gold)] shrink-0" fill="currentColor" />
                    <span className="text-sm font-medium text-[var(--color-text)]">{h}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Starting from</p>
                  <p className="font-display font-bold text-3xl text-[var(--color-text)]">
                    ₹{product.basicPrice.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="h-10 w-px bg-[var(--color-border)]" />
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Premium plan</p>
                  <p className="font-display font-bold text-2xl text-[var(--color-gold)]">
                    ₹{product.premiumPrice.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {product.demoUrl && (
                  <a href={product.demoUrl} target="_blank" rel="noopener noreferrer"
                    className="btn-outline flex items-center gap-2">
                    Live Demo <ExternalLink size={15} />
                  </a>
                )}
                <a href="#buy" className="btn-gold">Buy Now <ArrowRight size={16} /></a>
                <a href={`https://wa.me/919942000413?text=Hi! I'm interested in ${product.name}.`} target="_blank" rel="noopener noreferrer" className="btn-outline flex items-center gap-2">
                  <MessageCircle size={16} /> WhatsApp Us
                </a>
                <a href="tel:+919942000413" className="btn-outline flex items-center gap-2">
                  <Phone size={16} /> Call Now
                </a>
              </div>
            </motion.div>

            {/* Right — Photo */}
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-[var(--color-gold)]/6 blur-2xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-[var(--shadow-luxury)] aspect-[4/3]">
                <Image src={product.photo} alt={product.name} fill className="object-cover" sizes="(max-width:1024px) 100vw,50vw" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                {product.tag && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-[var(--color-gold)] text-white text-xs font-bold rounded-full">
                    {product.tag}
                  </div>
                )}
              </div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                className="absolute -bottom-5 -left-5 glass-card p-4 shadow-[var(--shadow-luxury)] max-w-[200px]">
                <p className="text-xs font-bold text-[var(--color-text)] mb-2">What you get</p>
                {product.deliverables.slice(0, 4).map(d => (
                  <div key={d} className="flex items-center gap-1.5 mb-1">
                    <Check size={11} className="text-[var(--color-success)] shrink-0" />
                    <span className="text-[11px] text-[var(--color-text-secondary)]">{d}</span>
                  </div>
                ))}
                {product.deliverables.length > 4 && (
                  <p className="text-[10px] text-[var(--color-gold)] mt-1">+{product.deliverables.length - 4} more</p>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <hr className="divider-gold mx-8" />

      {/* Pricing Plans */}
      <section id="buy" className="py-16 lg:py-20 bg-[var(--color-bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="section-badge mx-auto">Pricing Plans</div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text)] mb-3">
              Choose Your <span className="text-gold-gradient">Plan</span>
            </h2>
            <p className="text-[var(--color-text-secondary)]">All plans include full source code + complete company branding</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-10">
            {product.plans.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative">
                {i === 1 && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--color-gold)] text-white text-xs font-bold rounded-full shadow-[var(--shadow-gold)]">
                      <Star size={11} fill="white" /> Most Popular
                    </span>
                  </div>
                )}
                <div
                  className={`card p-7 h-full flex flex-col cursor-pointer transition-all ${i === 1 ? "border-2 border-[var(--color-gold)] shadow-[var(--shadow-gold)]" : ""} ${activePlan === i ? "ring-2 ring-[var(--color-gold)]/40" : ""}`}
                  onClick={() => setActivePlan(i)}
                >
                  <div className="mb-5">
                    <h3 className="font-display font-bold text-xl text-[var(--color-text)] mb-1">{plan.name}</h3>
                    <div className="flex items-end gap-2">
                      <span className="font-display font-bold text-3xl text-[var(--color-text)]">{plan.price}</span>
                      {plan.price !== "Quote" && <span className="text-[var(--color-text-muted)] text-sm mb-1">one-time</span>}
                    </div>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs text-[var(--color-text-secondary)]">⚡ {plan.delivery}</span>
                      <span className="text-xs text-[var(--color-text-secondary)]">🛡️ {plan.support}</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check size={14} className="text-[var(--color-success)] shrink-0 mt-0.5" />
                        <span className="text-[var(--color-text-secondary)]">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#order-form" onClick={() => setActivePlan(i)}
                    className={`w-full py-3 rounded-xl font-semibold text-sm text-center flex items-center justify-center gap-2 transition-all ${i === 1 ? "btn-gold" : "btn-primary"}`}>
                    {plan.price === "Quote" ? "Request Quote" : "Get Started"} <ArrowRight size={15} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-[var(--color-border)]">
            {[
              { icon: Shield, text: "Full source code ownership" },
              { icon: Zap, text: "Fast delivery guaranteed" },
              { icon: Clock, text: "Free support included" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Icon size={16} className="text-[var(--color-gold)]" /> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech + Process */}
      <section className="py-16 bg-[var(--color-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="font-display font-bold text-2xl text-[var(--color-text)] mb-6">What&apos;s Included</h3>
            <div className="grid grid-cols-2 gap-3">
              {product.deliverables.map(d => (
                <div key={d} className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                  <Check size={15} className="text-[var(--color-success)] shrink-0" />
                  <span className="text-sm text-[var(--color-text)]">{d}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-[var(--color-text)] mb-4">Tech Stack</h3>
            <div className="flex flex-wrap gap-3 mb-8">
              {product.techStack.map(t => (
                <span key={t} className="px-4 py-2 rounded-xl bg-[var(--color-navy)] text-white text-sm font-medium">{t}</span>
              ))}
            </div>
            <h3 className="font-display font-bold text-xl text-[var(--color-text)] mb-4">How It Works</h3>
            <div className="space-y-4">
              {[
                { step: "01", title: "Choose & Pay", desc: "Select your plan and complete payment securely via Razorpay." },
                { step: "02", title: "Send Branding", desc: "Share your company name, logo, and colors with our team." },
                { step: "03", title: "We Customize", desc: "Our team fully brands the product with your identity." },
                { step: "04", title: "You Launch", desc: "Receive your ready product and go live — with our support." },
              ].map(s => (
                <div key={s.step} className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0 font-display font-bold text-sm text-[var(--color-gold)]">{s.step}</div>
                  <div>
                    <p className="font-semibold text-sm text-[var(--color-text)]">{s.title}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-[var(--color-bg-secondary)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="section-badge mx-auto">FAQs</div>
            <h2 className="font-display font-bold text-3xl text-[var(--color-text)]">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {product.faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-semibold text-sm text-[var(--color-text)] pr-4">{faq.q}</span>
                  <ChevronDown size={18} className="text-[var(--color-text-muted)] shrink-0 transition-transform duration-300"
                    style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0)" }} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 border-t border-[var(--color-border)]">
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed pt-4">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16 bg-[var(--color-bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="section-badge mx-auto">Optional Add-ons</div>
            <h2 className="font-display font-bold text-3xl text-[var(--color-text)] mb-2">
              Power Up Your <span className="text-gold-gradient">Package</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6">Select add-ons to include with your order — added to your total at checkout</p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-1 p-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${billingCycle === "monthly" ? "bg-[var(--color-navy)] text-white shadow-sm" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${billingCycle === "yearly" ? "bg-[var(--color-gold)] text-black shadow-sm" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"}`}
              >
                Yearly
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500 text-white">50% OFF</span>
              </button>
            </div>
            {billingCycle === "yearly" && <YearlyTyping />}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ADDONS.map(addon => {
              const checked = selectedAddons.has(addon.id);
              const price = getAddonPrice(addon);
              const originalPrice = addon.isRecurring && billingCycle === "yearly" ? addon.monthlyPrice * 12 : null;
              const label = addon.isRecurring
                ? billingCycle === "yearly" ? `$${price}/yr` : `$${price}/mo`
                : `$${price}`;
              return (
                <motion.div
                  key={addon.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  onClick={() => toggleAddon(addon.id)}
                  className={`card p-5 cursor-pointer transition-all select-none ${checked ? "border-2 border-[var(--color-gold)] shadow-[var(--shadow-gold)]" : "hover:border-[var(--color-gold)]/40"}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{addon.icon}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${checked ? "bg-[var(--color-gold)] border-[var(--color-gold)]" : "border-[var(--color-border)]"}`}>
                      {checked && <Check size={11} className="text-white" strokeWidth={3} />}
                    </div>
                  </div>
                  <p className="font-display font-bold text-sm text-[var(--color-text)] mb-1">{addon.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mb-3">{addon.description}</p>
                  <div className="flex items-end gap-2">
                    <p className="font-bold text-[var(--color-gold)] text-base">{label}</p>
                    {originalPrice && (
                      <p className="text-xs text-[var(--color-text-muted)] line-through mb-0.5">${originalPrice}/yr</p>
                    )}
                  </div>
                  {addon.isRecurring && billingCycle === "yearly" && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full mt-1 inline-block">Save 50%</span>
                  )}
                </motion.div>
              );
            })}
          </div>
          {selectedAddons.size > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-2xl border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">Selected: {selectedAddons.size} add-on{selectedAddons.size > 1 ? "s" : ""}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{ADDONS.filter(a => selectedAddons.has(a.id)).map(a => a.name).join(", ")}</p>
              </div>
              <p className="font-display font-bold text-xl text-[var(--color-gold)]">+${addonTotal} extra</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Order Form */}
      <section id="order-form" className="py-16 bg-[var(--color-bg)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8">
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-green-500" />
                </div>
                <h3 className="font-display font-bold text-2xl text-[var(--color-text)] mb-2">Payment Successful!</h3>
                {submittedOrderNo && (
                  <p className="text-sm font-mono font-semibold text-[var(--color-gold)] mb-2">Order #{submittedOrderNo}</p>
                )}
                <p className="text-[var(--color-text-secondary)] mb-2">
                  Aapka order confirm ho gaya hai. Client portal pe redirect ho raha hai...
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mb-6">Login details aapke email pe bhej diye gaye hain.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/client-portal" className="btn-gold">
                    Client Portal <ArrowRight size={16} />
                  </Link>
                  <Link href="/products" className="btn-outline">View More Products</Link>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="font-display font-bold text-2xl text-[var(--color-text)] mb-1">
                    {product.plans[activePlan].price === "Quote" ? "Request Custom Quote" : `Pay for ${product.plans[activePlan].name} Plan`}
                  </h2>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    {product.plans[activePlan].price === "Quote"
                      ? "Team aapko custom price degi"
                      : <>
                          Plan: <strong className="text-[var(--color-gold)]">{product.plans[activePlan].price}</strong>
                          {addonTotal > 0 && <> + Add-ons: <strong className="text-[var(--color-gold)]">${addonTotal}</strong> = <strong className="text-[var(--color-gold)]">${(planPriceMap[product.plans[activePlan].name] || 0) + addonTotal} total</strong></>}
                          {" · "}{product.plans[activePlan].delivery} delivery
                        </>
                    }
                  </p>
                </div>

                {/* Plan selector */}
                <div className="flex gap-2 mb-6">
                  {product.plans.map((p, i) => (
                    <button key={p.name} onClick={() => setActivePlan(i)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${activePlan === i ? "bg-[var(--color-navy)] text-white" : "border border-[var(--color-border)] text-[var(--color-text-secondary)]"}`}>
                      {p.name}
                    </button>
                  ))}
                </div>

                <form onSubmit={handlePay} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">{t.form_name} *</label>
                      <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder={t.form_name}
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">{t.form_phone} *</label>
                      <input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder={t.contact_phone_label.replace(" *", "")}
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">{t.form_email} *</label>
                    <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder={t.form_email}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">{t.form_business}</label>
                    <input type="text" value={form.business} onChange={e => setForm(f => ({ ...f, business: e.target.value }))}
                      placeholder={t.form_business}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                  </div>

                  {payError && (
                    <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{payError}</p>
                  )}

                  <button type="submit" disabled={paying}
                    className="btn-gold w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-60">
                    {paying
                      ? <><Loader2 size={18} className="animate-spin" /> Processing...</>
                      : product.plans[activePlan].price === "Quote"
                        ? <><MessageCircle size={18} /> Request Quote on WhatsApp</>
                        : <><CreditCard size={18} /> Pay {product.plans[activePlan].price} Securely</>
                    }
                  </button>
                  <p className="text-center text-xs text-[var(--color-text-muted)]">
                    Secured by Razorpay · UPI, Cards, Net Banking, Wallets
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-16 bg-[var(--color-bg-secondary)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display font-bold text-2xl text-[var(--color-text)] mb-8">Related Products</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map(p => (
                <div key={p.slug} className="card overflow-hidden group">
                  <div className="h-40 relative overflow-hidden">
                    <Image src={p.photo} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="33vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-[var(--color-text)] mb-1">{p.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mb-3">{p.tagline}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--color-gold)]">₹{p.basicPrice.toLocaleString("en-IN")}+</span>
                      <Link href={`/products/${p.slug}`} className="text-xs font-semibold text-[var(--color-navy)] hover:text-[var(--color-gold)] transition-colors flex items-center gap-1">
                        View Details <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
