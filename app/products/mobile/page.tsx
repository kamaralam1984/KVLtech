"use client";

import { motion } from "framer-motion";
import {
  Smartphone,
  ShoppingCart,
  GraduationCap,
  HeartPulse,
  Store,
  Building2,
  MapPin,
  Bell,
  WifiOff,
  CreditCard,
  BarChart2,
  LayoutDashboard,
  RefreshCw,
  Fingerprint,
  CheckCircle,
  ChevronDown,
  Star,
  ArrowRight,
  Download,
  Shield,
  Zap,
  Users,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { useState } from "react";

const featuredApps = [
  {
    icon: Store,
    name: "Restaurant Ordering App",
    category: "Food & Dining",
    features: [
      "Online menu with photos",
      "Cart & checkout",
      "Table booking",
      "Order tracking",
      "Loyalty points",
      "Push notifications",
    ],
    priceBasic: "$599",
    pricePro: "$999",
    color: "#f59e0b",
  },
  {
    icon: GraduationCap,
    name: "School Parent App",
    category: "Education",
    features: [
      "Attendance alerts",
      "Fee payment",
      "Homework portal",
      "Exam results",
      "Teacher communication",
      "School calendar",
    ],
    priceBasic: "$479",
    pricePro: "$899",
    color: "#3b82f6",
  },
  {
    icon: HeartPulse,
    name: "Hospital Patient App",
    category: "Healthcare",
    features: [
      "Appointment booking",
      "Doctor profiles",
      "Medical records",
      "Prescription",
      "Lab reports",
      "Emergency contact",
    ],
    priceBasic: "$799",
    pricePro: "$1,499",
    color: "#ef4444",
  },
  {
    icon: ShoppingCart,
    name: "E-commerce Shopping App",
    category: "Retail",
    features: [
      "Product catalog",
      "Cart & wishlist",
      "Payment gateway",
      "Order tracking",
      "Reviews & ratings",
      "Push notifications",
    ],
    priceBasic: "$599",
    pricePro: "$1,199",
    color: "#8b5cf6",
  },
  {
    icon: Building2,
    name: "Hotel Booking App",
    category: "Hospitality",
    features: [
      "Room booking",
      "Virtual tour",
      "Amenities info",
      "Check-in/out",
      "Room service",
      "Loyalty program",
    ],
    priceBasic: "$479",
    pricePro: "$899",
    color: "#10b981",
  },
  {
    icon: MapPin,
    name: "Real Estate App",
    category: "Property",
    features: [
      "Property listings",
      "Virtual tours",
      "Mortgage calculator",
      "Agent chat",
      "Saved properties",
      "Map view",
    ],
    priceBasic: "$699",
    pricePro: "$1,299",
    color: "#f97316",
  },
];

const coreFeatures = [
  { icon: Bell, label: "Push Notifications", desc: "Re-engage customers instantly with targeted alerts" },
  { icon: WifiOff, label: "Offline Functionality", desc: "App works even without internet connection" },
  { icon: CreditCard, label: "Payment Gateway", desc: "Razorpay & Stripe integration out of the box" },
  { icon: BarChart2, label: "Analytics Dashboard", desc: "Track installs, sessions, and revenue in real time" },
  { icon: LayoutDashboard, label: "Admin Panel", desc: "Manage content, users, and orders from one place" },
  { icon: RefreshCw, label: "Real-time Updates", desc: "Live data sync across all user devices" },
  { icon: Fingerprint, label: "Biometric Login", desc: "Face ID and fingerprint authentication built in" },
  { icon: Shield, label: "Secure Architecture", desc: "End-to-end encryption and OWASP-compliant code" },
];

const faqs = [
  {
    q: "Do you build for iOS only, or Android only?",
    a: "We build both simultaneously at no extra cost. Using React Native or Flutter, we deliver a single codebase that runs natively on both Android and iOS. You get two fully functional apps for the price of one.",
  },
  {
    q: "How long does App Store and Play Store approval take?",
    a: "Apple App Store approval typically takes 3-5 business days, and Google Play Store takes 1-3 days. In total, your app will be live for users within 5-7 business days after development is complete. We handle the entire submission process for you.",
  },
  {
    q: "What happens after launch — who handles updates?",
    a: "You get 3 months of free bug fixes after launch. After that, we offer flexible maintenance packages that cover OS compatibility updates, feature additions, and security patches. We will never leave your app stranded on an outdated version.",
  },
  {
    q: "Can users pay directly inside the app?",
    a: "Yes, in-app payment integration is included in every app we build. We support Razorpay for India-based businesses and Stripe for international payments. Customers can pay by card, UPI, wallet, or net banking.",
  },
  {
    q: "Do I need my own Apple and Google developer accounts?",
    a: "We guide you through setting up developer accounts — it is straightforward and costs $99/year for Apple and $25 one-time for Google. Alternatively, we can manage the accounts on your behalf so you never need to touch the technical side.",
  },
  {
    q: "What if the app crashes after launch?",
    a: "We provide emergency support within 2 hours for any critical bugs that affect core app functionality. Our monitoring system alerts our team the moment an issue is detected, often before your users even notice something is wrong.",
  },
];

const stats = [
  { label: "App Templates", value: "20+", icon: Smartphone },
  { label: "Platforms Covered", value: "Android + iOS", icon: Zap },
  { label: "Demo Delivery", value: "48 Hours", icon: Clock },
  { label: "Avg Store Rating", value: "4.8★", icon: Star },
];

export default function MobileAppsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main className="pt-[104px]">

        {/* Hero Section */}
        <section className="bg-[var(--color-bg)] py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
              style={{ background: "var(--color-gold)" }}
            />
            <div
              className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-5 blur-3xl"
              style={{ background: "var(--color-gold)" }}
            />
          </div>
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="section-badge">Mobile Applications</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-4xl md:text-6xl font-bold leading-tight"
              style={{ color: "var(--color-text)" }}
            >
              Native Mobile Apps That Keep{" "}
              <span className="text-gold-gradient">Customers Coming Back</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-xl max-w-3xl mx-auto"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Android and iOS apps built with push notifications, offline mode, and payment integration —
              fully branded with your company identity. From idea to App Store in days, not months.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              <Link href="#apps" className="btn-gold">
                View App Templates <ArrowRight className="inline w-4 h-4 ml-1" />
              </Link>
              <Link href="#cta" className="btn-outline">
                Get Free Demo
              </Link>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="card text-center py-6"
                >
                  <stat.icon
                    className="w-7 h-7 mx-auto mb-2"
                    style={{ color: "var(--color-gold)" }}
                  />
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "var(--color-text)" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-sm mt-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Featured Apps Section */}
        <section id="apps" className="bg-[var(--color-bg-secondary)] py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <span className="section-badge">Ready-to-Launch Templates</span>
              <h2
                className="mt-4 text-3xl md:text-4xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                6 Industry-Specific App Templates
              </h2>
              <p
                className="mt-4 text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Each template is pre-built with industry-specific features. We customize it to your brand,
                add your content, and deliver a production-ready app — not a prototype.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredApps.map((app, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="card flex flex-col"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="p-3 rounded-xl flex-shrink-0"
                      style={{ background: `${app.color}20` }}
                    >
                      <app.icon
                        className="w-7 h-7"
                        style={{ color: app.color }}
                      />
                    </div>
                    <div>
                      <h3
                        className="font-bold text-lg leading-tight"
                        style={{ color: "var(--color-text)" }}
                      >
                        {app.name}
                      </h3>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: `${app.color}20`,
                          color: app.color,
                        }}
                      >
                        {app.category}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6 flex-grow">
                    {app.features.map((feature, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-2 text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        <CheckCircle
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: "var(--color-gold)" }}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div
                    className="border-t pt-4"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div
                          className="text-xs"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          Basic
                        </div>
                        <div
                          className="text-xl font-bold"
                          style={{ color: "var(--color-gold)" }}
                        >
                          {app.priceBasic}
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className="text-xs"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          Pro
                        </div>
                        <div
                          className="text-xl font-bold"
                          style={{ color: "var(--color-text)" }}
                        >
                          {app.pricePro}
                        </div>
                      </div>
                      <Link href="#cta" className="btn-gold text-sm px-4 py-2">
                        Get Quote
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="bg-[var(--color-bg)] py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="section-badge">Technology</span>
                <h2
                  className="mt-4 text-3xl md:text-4xl font-bold"
                  style={{ color: "var(--color-text)" }}
                >
                  React Native and Flutter —{" "}
                  <span className="text-gold-gradient">One Codebase, Two Platforms</span>
                </h2>
                <p
                  className="mt-6 text-lg leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  We use React Native and Flutter to build cross-platform mobile apps that run natively on
                  both Android and iOS from a single codebase. This means faster delivery, significantly
                  lower development costs, and the same native performance your customers expect.
                </p>
                <p
                  className="mt-4 text-lg leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Unlike outdated hybrid apps that feel sluggish, our apps compile to native code —
                  delivering smooth 60fps animations, instant load times, and full access to device
                  features like camera, GPS, biometrics, and notifications.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {[
                    { label: "Faster Delivery", desc: "Build once, ship to both stores simultaneously" },
                    { label: "Lower Cost", desc: "No separate iOS and Android teams needed" },
                    { label: "Native Performance", desc: "Compiles to true native code, not a web wrapper" },
                    { label: "Easier Maintenance", desc: "One codebase means one update fixes both platforms" },
                  ].map((item, i) => (
                    <div key={i} className="card p-4">
                      <div
                        className="font-semibold text-sm mb-1"
                        style={{ color: "var(--color-gold)" }}
                      >
                        {item.label}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="card p-8"
              >
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{ color: "var(--color-text)" }}
                >
                  App Store and Play Store Submission
                </h3>
                <p
                  className="mb-6"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  We handle the complete submission process so you do not have to navigate confusing
                  developer portals. Your app goes live in 5-7 business days after development is complete.
                </p>
                <div className="space-y-4">
                  {[
                    { step: "01", title: "App Development Complete", desc: "Full QA testing on real Android and iOS devices" },
                    { step: "02", title: "Developer Account Setup", desc: "We set up or configure your Apple and Google accounts" },
                    { step: "03", title: "Submission and Review", desc: "We prepare all assets, screenshots, and descriptions" },
                    { step: "04", title: "App Goes Live", desc: "Available for download on both stores within 5-7 days" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{
                          background: "var(--color-gold)",
                          color: "var(--color-navy)",
                        }}
                      >
                        {item.step}
                      </div>
                      <div>
                        <div
                          className="font-semibold"
                          style={{ color: "var(--color-text)" }}
                        >
                          {item.title}
                        </div>
                        <div
                          className="text-sm mt-0.5"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="bg-[var(--color-bg-secondary)] py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <span className="section-badge">Every App Includes</span>
              <h2
                className="mt-4 text-3xl md:text-4xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                Eight Powerful Features Included{" "}
                <span className="text-gold-gradient">in Every App</span>
              </h2>
              <p
                className="mt-4 text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Every mobile app we deliver — regardless of template or industry — comes with these
                professional-grade features included in the base price. No add-on fees, no surprises.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {coreFeatures.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="card text-center p-6"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "rgba(212,175,55,0.12)" }}
                  >
                    <feature.icon
                      className="w-7 h-7"
                      style={{ color: "var(--color-gold)" }}
                    />
                  </div>
                  <h3
                    className="font-bold text-base mb-2"
                    style={{ color: "var(--color-text)" }}
                  >
                    {feature.label}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Post-Launch Support Section */}
        <section className="bg-[var(--color-bg)] py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="card p-8"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: "rgba(212,175,55,0.12)" }}
                >
                  <Shield className="w-8 h-8" style={{ color: "var(--color-gold)" }} />
                </div>
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{ color: "var(--color-text)" }}
                >
                  Post-Launch Support Included
                </h3>
                <p
                  className="mb-6"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Your success after launch is our responsibility. Every mobile app comes with a structured
                  post-launch support plan designed to keep your app stable, up-to-date, and performing at
                  its best.
                </p>
                <ul className="space-y-4">
                  {[
                    {
                      title: "3 Months Free Bug Fixes",
                      desc: "Any bug or issue reported within 90 days of launch is fixed at no cost, guaranteed.",
                    },
                    {
                      title: "App Store and Play Store Account Management",
                      desc: "We manage reviews, handle rejection appeals, and keep your app listings optimized.",
                    },
                    {
                      title: "OS Compatibility Updates",
                      desc: "When Apple or Google releases a new OS version, we test and update your app to stay compatible.",
                    },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <CheckCircle
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                        style={{ color: "var(--color-gold)" }}
                      />
                      <div>
                        <div
                          className="font-semibold"
                          style={{ color: "var(--color-text)" }}
                        >
                          {item.title}
                        </div>
                        <div
                          className="text-sm mt-0.5"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <span className="section-badge">Client Results</span>
                <h2
                  className="mt-4 text-3xl md:text-4xl font-bold"
                  style={{ color: "var(--color-text)" }}
                >
                  Real Downloads.{" "}
                  <span className="text-gold-gradient">Real Revenue.</span>
                </h2>
                <p
                  className="mt-6 text-lg leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Twelve of our client apps have surpassed 10,000 downloads each on the App Store and
                  Play Store. Our restaurant app clients report a 35% increase in direct orders within
                  just 60 days of launch — because an app removes friction between the customer and the
                  purchase.
                </p>
                <p
                  className="mt-4 text-lg leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  When customers have your app on their phone, your business is always one tap away.
                  Push notifications bring them back. Loyalty programs keep them engaged. Smooth checkout
                  converts browsers into buyers. That is the compounding value of a well-built mobile app.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {[
                    { stat: "12", label: "Apps with 10K+ Downloads" },
                    { stat: "35%", label: "Average Order Increase" },
                    { stat: "4.8★", label: "Average Store Rating" },
                    { stat: "60 Days", label: "To Measurable ROI" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="card p-5 text-center"
                    >
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-gold)" }}
                      >
                        {item.stat}
                      </div>
                      <div
                        className="text-sm mt-1"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-[var(--color-bg-secondary)] py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <span className="section-badge">FAQ</span>
              <h2
                className="mt-4 text-3xl md:text-4xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                Questions About Mobile App Development
              </h2>
              <p
                className="mt-4 text-lg"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Straight answers to the questions every business owner asks before commissioning a mobile app.
              </p>
            </motion.div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="card overflow-hidden"
                >
                  <button
                    className="w-full text-left flex items-center justify-between p-6 gap-4"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span
                      className="font-semibold text-base"
                      style={{ color: "var(--color-text)" }}
                    >
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                      style={{ color: "var(--color-gold)" }}
                    />
                  </button>
                  {openFaq === i && (
                    <div
                      className="px-6 pb-6 text-base leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {faq.a}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="bg-[var(--color-bg)] py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8"
                style={{ background: "rgba(212,175,55,0.12)" }}
              >
                <Smartphone className="w-10 h-10" style={{ color: "var(--color-gold)" }} />
              </div>
              <span className="section-badge">Get Your App Demo</span>
              <h2
                className="mt-6 text-3xl md:text-5xl font-bold leading-tight"
                style={{ color: "var(--color-text)" }}
              >
                See Your Business App on a{" "}
                <span className="text-gold-gradient">Real Phone in 48 Hours</span>
              </h2>
              <p
                className="mt-6 text-xl max-w-2xl mx-auto leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Tell us your business type and we will send you a live demo of your app template —
                customized with your brand name and colors — running on a real Android and iOS device.
                No commitment required.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link href="/contact" className="btn-gold text-lg px-8 py-4">
                  Request Your Free Demo <Download className="inline w-5 h-5 ml-2" />
                </Link>
                <Link href="/contact" className="btn-outline text-lg px-8 py-4">
                  Talk to an App Specialist
                </Link>
              </div>
              <p
                className="mt-6 text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Demo delivered within 48 hours. No credit card. No contracts. Just results.
              </p>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Users,
                    title: "Dedicated App Team",
                    desc: "One developer, one designer, one QA tester — assigned to your app from day one",
                  },
                  {
                    icon: Zap,
                    title: "48-Hour Demo Guarantee",
                    desc: "See a working version of your app on a real phone within 48 hours of signing up",
                  },
                  {
                    icon: Shield,
                    title: "Launch Risk-Free",
                    desc: "3 months post-launch support included. We stand behind every app we ship",
                  },
                ].map((item, i) => (
                  <div key={i} className="card p-6 text-center">
                    <item.icon
                      className="w-8 h-8 mx-auto mb-3"
                      style={{ color: "var(--color-gold)" }}
                    />
                    <h4
                      className="font-bold mb-2"
                      style={{ color: "var(--color-text)" }}
                    >
                      {item.title}
                    </h4>
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {item.desc}
                    </p>
                  </div>
                ))}
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
