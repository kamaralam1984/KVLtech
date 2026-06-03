"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Code2,
  Palette,
  TrendingUp,
  HeadphonesIcon,
  Layers,
  CheckCircle,
  Star,
  ArrowRight,
  Monitor,
  Shield,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const templates = [
  {
    id: 1,
    name: "Restaurant Website",
    category: "Restaurant",
    tag: "Most Popular",
    tagColor: "bg-orange-500",
    accentColor: "#f97316",
    accentBg: "bg-orange-500/10",
    basicPrice: 156,
    premiumPrice: 299,
    features: ["Online Menu", "Table Reservations", "Order System"],
  },
  {
    id: 2,
    name: "School Management System",
    category: "School",
    tag: "Best Seller",
    tagColor: "bg-green-600",
    accentColor: "#16a34a",
    accentBg: "bg-green-500/10",
    basicPrice: 359,
    premiumPrice: 719,
    features: ["Student Portal", "Fee Management", "Timetable"],
  },
  {
    id: 3,
    name: "Hospital System",
    category: "Hospital",
    tag: "Enterprise",
    tagColor: "bg-blue-600",
    accentColor: "#2563eb",
    accentBg: "bg-blue-500/10",
    basicPrice: 599,
    premiumPrice: 1199,
    features: ["Doctor Profiles", "Appointment Booking", "Patient Portal"],
  },
  {
    id: 4,
    name: "Hotel Booking Website",
    category: "Hotel",
    tag: "Popular",
    tagColor: "bg-teal-600",
    accentColor: "#0d9488",
    accentBg: "bg-teal-500/10",
    basicPrice: 179,
    premiumPrice: 323,
    features: ["Room Listings", "Booking Engine", "Gallery"],
  },
  {
    id: 5,
    name: "Real Estate Website",
    category: "Real Estate",
    tag: "Premium",
    tagColor: "bg-yellow-600",
    accentColor: "#ca8a04",
    accentBg: "bg-yellow-500/10",
    basicPrice: 275,
    premiumPrice: 539,
    features: ["Property Listings", "Search Filters", "Agent Profiles"],
  },
  {
    id: 6,
    name: "E-commerce Platform",
    category: "E-commerce",
    tag: "New",
    tagColor: "bg-purple-600",
    accentColor: "#9333ea",
    accentBg: "bg-purple-500/10",
    basicPrice: 192,
    premiumPrice: 479,
    features: ["Product Catalog", "Cart & Checkout", "Payment Gateway"],
  },
  {
    id: 7,
    name: "Gym & Fitness Website",
    category: "Gym",
    tag: "Trending",
    tagColor: "bg-red-600",
    accentColor: "#dc2626",
    accentBg: "bg-red-500/10",
    basicPrice: 144,
    premiumPrice: 263,
    features: ["Class Schedule", "Membership Plans", "Trainer Profiles"],
  },
  {
    id: 8,
    name: "Portfolio Website",
    category: "Portfolio",
    tag: "Starter",
    tagColor: "bg-slate-600",
    accentColor: "#1e3a5f",
    accentBg: "bg-slate-500/10",
    basicPrice: 96,
    premiumPrice: 179,
    features: ["Project Showcase", "Contact Form", "About Section"],
  },
];

const categories = [
  "All",
  "Restaurant",
  "School",
  "Hospital",
  "Hotel",
  "Real Estate",
  "E-commerce",
  "Portfolio",
  "Gym",
];

const included = [
  "Mobile responsive design",
  "SEO optimized (90+ score)",
  "Full source code",
  "Your company branding",
  "30 days support",
  "Hosting guidance",
  "Google Analytics setup",
  "Contact form",
  "Social media links",
];

const whyWin = [
  {
    icon: Zap,
    title: "Lightning Fast Delivery",
    desc: "Your fully branded website is ready within 24-48 hours of purchase. We work fast so you can launch fast and start attracting customers immediately.",
  },
  {
    icon: Code2,
    title: "Full Code Ownership",
    desc: "You receive the complete source code. No monthly licensing fees, no vendor lock-in. Your website, your code, forever. Modify it however you want.",
  },
  {
    icon: Palette,
    title: "Professional Branding",
    desc: "We apply your exact logo, brand colors, company name, and contact details before delivery. The site looks like it was built from scratch just for you.",
  },
  {
    icon: TrendingUp,
    title: "SEO Built-In",
    desc: "Every template scores 90+ on Google PageSpeed and includes structured data, meta tags, and best practices so your business ranks on Google from day one.",
  },
  {
    icon: HeadphonesIcon,
    title: "Expert Support",
    desc: "Basic plans include 30 days of support; Premium plans include 90 days. We fix bugs, answer questions, and make minor tweaks — all included at no extra charge.",
  },
  {
    icon: Layers,
    title: "Modern Tech Stack",
    desc: "Built with Next.js and React — the same technology used by Fortune 500 companies. Fast, secure, scalable, and easy to extend as your business grows.",
  },
];

const testimonials = [
  {
    name: "Rajesh Mehta",
    business: "Spice Garden Restaurant, Mumbai",
    quote:
      "I ordered the Restaurant template on Monday and by Tuesday evening my website was live with my menu, logo, and our signature brand colors. We started getting online reservations the very next day. Best investment I made for my restaurant.",
    rating: 5,
    icon: "🍽️",
  },
  {
    name: "Principal Sunita Sharma",
    business: "Bright Future School, Pune",
    quote:
      "The School Management System has completely transformed how we communicate with parents. The student portal, fee receipts, and timetable features work flawlessly. The KVL team set up everything with our school's branding in under 24 hours.",
    rating: 5,
    icon: "🏫",
  },
  {
    name: "Dr. Arun Patel",
    business: "City Care Hospital, Ahmedabad",
    quote:
      "We needed a professional hospital website with appointment booking urgently. KVL delivered the full Hospital System branded for us in one day. Our patient inquiries have doubled and the online appointment system saves hours of phone calls every week.",
    rating: 5,
    icon: "🏥",
  },
];

const faqs = [
  {
    question: "Can I customize the website after purchase?",
    answer:
      "Absolutely. You receive the full source code, which means you own it completely and can modify every line. Our developer-friendly Next.js codebase is well-commented, so any developer can make changes. We also provide quotes for additional feature development if needed.",
  },
  {
    question: "How exactly is my branding applied?",
    answer:
      "After purchase, you share your logo (PNG/SVG), brand colors (hex codes or reference image), company name, tagline, phone, email, address, and social media links. Our team applies all of this to the template before delivering the finished code to you — typically within 24 hours.",
  },
  {
    question: "What is included in 'support'?",
    answer:
      "Support covers bug fixes, technical questions, display issues, and minor text or image changes within the support window (30 days for Basic, 90 days for Premium). It does not cover major new feature development, but we are happy to quote separately for that.",
  },
  {
    question: "Do I need to arrange my own hosting?",
    answer:
      "Yes, you will need a hosting plan, but we make it easy. We provide detailed hosting guidance and recommend affordable providers. Premium plan customers also have the option of our managed hosting service at a small additional monthly fee — we handle server setup and maintenance for you.",
  },
  {
    question: "Can I add new features to the website later?",
    answer:
      "Yes. Since you own the source code, any developer can extend it. Alternatively, contact us with your requirements and we will provide a fixed-price quote for new feature development, API integrations, payment gateways, multi-language support, or anything else your business needs.",
  },
  {
    question: "What if I am not satisfied with the website?",
    answer:
      "We offer a 30-day money-back guarantee. If the delivered website does not match the agreed requirements or has unfixable issues within the support window, we will issue a full refund. We stand behind the quality of our work — your satisfaction is our priority.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function WebsiteTemplatesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-[var(--color-bg)] py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 blur-3xl"
              style={{ background: "var(--color-gold)" }}
            />
            <div
              className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-5 blur-3xl"
              style={{ background: "var(--color-gold)" }}
            />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={fadeUp}>
                <span className="section-badge">Website Templates</span>
              </motion.div>
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mt-6 mb-6 leading-tight"
                style={{ color: "var(--color-text)" }}
                variants={fadeUp}
              >
                25+ Premium Website Templates —{" "}
                <span className="text-gold-gradient">
                  Ready to Launch in 24 Hours
                </span>
              </motion.h1>
              <motion.p
                className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
                variants={fadeUp}
              >
                Fully branded with your company name, logo, and colors. Source
                code included. No recurring fees. Your business online —
                faster and more professionally than you thought possible.
              </motion.p>

              {/* Stats Row */}
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 mb-10"
                variants={stagger}
              >
                {[
                  { value: "25+", label: "Premium Templates" },
                  { value: "24h", label: "Delivery Time" },
                  { value: "100%", label: "Source Code Ownership" },
                  { value: "5,000+", label: "Sites Launched" },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    className="card text-center py-4 px-3"
                    variants={fadeUp}
                  >
                    <div
                      className="text-3xl font-bold text-gold-gradient"
                    >
                      {stat.value}
                    </div>
                    <div
                      className="text-sm mt-1"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                variants={fadeUp}
              >
                <Link href="#templates" className="btn-gold">
                  Browse All Templates <ArrowRight className="inline ml-2 w-4 h-4" />
                </Link>
                <Link href="#cta" className="btn-outline">
                  Book Free Demo
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Category Filter Pills */}
        <section className="bg-[var(--color-bg-secondary)] py-8 border-b border-[var(--color-border)]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((cat, i) => (
                <button
                  key={cat}
                  className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                    i === 0
                      ? "border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/10"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section id="templates" className="bg-[var(--color-bg)] py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span className="section-badge" variants={fadeUp}>
                Our Templates
              </motion.span>
              <motion.h2
                className="text-3xl md:text-4xl font-bold mt-4 mb-4"
                style={{ color: "var(--color-text)" }}
                variants={fadeUp}
              >
                Choose Your Industry Template
              </motion.h2>
              <motion.p
                className="max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
                variants={fadeUp}
              >
                Every template is professionally designed, fully responsive, and
                ready to be branded with your company identity within 24 hours of
                purchase. Pick the one that fits your business.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {templates.map((t) => (
                <motion.div
                  key={t.id}
                  className="card flex flex-col overflow-hidden"
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Photo Placeholder */}
                  <div
                    className={`w-full h-40 ${t.accentBg} flex items-center justify-center relative`}
                  >
                    <Monitor
                      className="w-14 h-14 opacity-40"
                      style={{ color: t.accentColor }}
                    />
                    <span
                      className={`absolute top-3 right-3 ${t.tagColor} text-white text-xs font-semibold px-2 py-1 rounded-full`}
                    >
                      {t.tag}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <p
                      className="text-xs font-medium uppercase tracking-wider mb-1"
                      style={{ color: t.accentColor }}
                    >
                      {t.category}
                    </p>
                    <h3
                      className="font-bold text-base mb-3"
                      style={{ color: "var(--color-text)" }}
                    >
                      {t.name}
                    </h3>

                    <ul className="mb-4 space-y-1">
                      {t.features.map((f) => (
                        <li
                          key={f}
                          className="text-xs flex items-center gap-1"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          <CheckCircle
                            className="w-3 h-3 flex-shrink-0"
                            style={{ color: t.accentColor }}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div
                      className="flex justify-between items-center py-3 border-t border-[var(--color-border)] mb-4 mt-auto"
                    >
                      <div>
                        <p
                          className="text-xs"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          Basic
                        </p>
                        <p
                          className="text-lg font-bold"
                          style={{ color: "var(--color-text)" }}
                        >
                          ${t.basicPrice}
                        </p>
                      </div>
                      <div className="text-center">
                        <p
                          className="text-xs"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          Premium
                        </p>
                        <p
                          className="text-lg font-bold text-gold-gradient"
                        >
                          ${t.premiumPrice}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href="#cta"
                        className="btn-outline text-xs py-2 px-3 flex-1 text-center"
                      >
                        View Demo
                      </Link>
                      <Link
                        href="#cta"
                        className="btn-gold text-xs py-2 px-3 flex-1 text-center"
                      >
                        Buy Now
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* What's Included */}
        <section className="bg-[var(--color-bg-secondary)] py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span className="section-badge" variants={fadeUp}>
                Included With Every Plan
              </motion.span>
              <motion.h2
                className="text-3xl md:text-4xl font-bold mt-4 mb-4"
                style={{ color: "var(--color-text)" }}
                variants={fadeUp}
              >
                Everything You Need to Go Live
              </motion.h2>
              <motion.p
                className="max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
                variants={fadeUp}
              >
                There are no hidden fees or add-ons that are technically
                "required but not included." Every single item below is
                delivered to you with every template purchase, regardless of
                plan.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {included.map((item) => (
                <motion.div
                  key={item}
                  className="card flex items-center gap-4 py-4 px-5"
                  variants={fadeUp}
                >
                  <CheckCircle
                    className="w-6 h-6 flex-shrink-0"
                    style={{ color: "var(--color-gold)" }}
                  />
                  <span
                    className="font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    {item}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing Comparison Table */}
        <section className="bg-[var(--color-bg)] py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span className="section-badge" variants={fadeUp}>
                Plans & Pricing
              </motion.span>
              <motion.h2
                className="text-3xl md:text-4xl font-bold mt-4 mb-4"
                style={{ color: "var(--color-text)" }}
                variants={fadeUp}
              >
                Basic vs Premium vs Custom
              </motion.h2>
              <motion.p
                className="max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
                variants={fadeUp}
              >
                Every plan delivers a fully branded, production-ready website.
                Choose the level of support and features that suits your business
                stage and budget.
              </motion.p>
            </motion.div>

            <motion.div
              className="overflow-x-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <table className="w-full max-w-4xl mx-auto border-collapse">
                <thead>
                  <tr>
                    <th
                      className="text-left py-4 px-6 font-semibold"
                      style={{
                        color: "var(--color-text-secondary)",
                        borderBottom: "2px solid var(--color-border)",
                      }}
                    >
                      Feature
                    </th>
                    <th
                      className="text-center py-4 px-6 font-semibold"
                      style={{
                        color: "var(--color-text)",
                        borderBottom: "2px solid var(--color-border)",
                      }}
                    >
                      Basic
                    </th>
                    <th
                      className="text-center py-4 px-6 font-semibold text-gold-gradient"
                      style={{
                        borderBottom: "2px solid var(--color-gold)",
                        background: "var(--color-gold)08",
                      }}
                    >
                      Premium ★
                    </th>
                    <th
                      className="text-center py-4 px-6 font-semibold"
                      style={{
                        color: "var(--color-text)",
                        borderBottom: "2px solid var(--color-border)",
                      }}
                    >
                      Custom
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      feature: "Full Source Code",
                      basic: true,
                      premium: true,
                      custom: true,
                    },
                    {
                      feature: "Mobile Responsive",
                      basic: true,
                      premium: true,
                      custom: true,
                    },
                    {
                      feature: "Company Branding Applied",
                      basic: true,
                      premium: true,
                      custom: true,
                    },
                    {
                      feature: "SEO Optimization",
                      basic: true,
                      premium: true,
                      custom: true,
                    },
                    {
                      feature: "Google Analytics",
                      basic: true,
                      premium: true,
                      custom: true,
                    },
                    {
                      feature: "Support Period",
                      basic: "30 days",
                      premium: "90 days",
                      custom: "6 months",
                    },
                    {
                      feature: "Pages Included",
                      basic: "Up to 7",
                      premium: "Up to 15",
                      custom: "Unlimited",
                    },
                    {
                      feature: "Advanced Animations",
                      basic: false,
                      premium: true,
                      custom: true,
                    },
                    {
                      feature: "Custom Feature Development",
                      basic: false,
                      premium: false,
                      custom: true,
                    },
                    {
                      feature: "Priority Delivery",
                      basic: false,
                      premium: true,
                      custom: true,
                    },
                    {
                      feature: "Managed Hosting Option",
                      basic: false,
                      premium: true,
                      custom: true,
                    },
                    {
                      feature: "Delivery Time",
                      basic: "48 hours",
                      premium: "24 hours",
                      custom: "Custom",
                    },
                  ].map((row, idx) => (
                    <tr
                      key={row.feature}
                      style={{
                        background:
                          idx % 2 === 0
                            ? "transparent"
                            : "var(--color-bg-secondary)",
                      }}
                    >
                      <td
                        className="py-3 px-6 font-medium"
                        style={{ color: "var(--color-text)" }}
                      >
                        {row.feature}
                      </td>
                      {["basic", "premium", "custom"].map((plan) => (
                        <td
                          key={plan}
                          className="text-center py-3 px-6"
                          style={{
                            background:
                              plan === "premium"
                                ? "var(--color-gold)05"
                                : undefined,
                          }}
                        >
                          {typeof row[plan as keyof typeof row] === "boolean" ? (
                            row[plan as keyof typeof row] ? (
                              <CheckCircle
                                className="w-5 h-5 mx-auto"
                                style={{ color: "var(--color-gold)" }}
                              />
                            ) : (
                              <span
                                className="text-lg"
                                style={{ color: "var(--color-text-secondary)" }}
                              >
                                —
                              </span>
                            )
                          ) : (
                            <span
                              className="text-sm font-medium"
                              style={{
                                color:
                                  plan === "premium"
                                    ? "var(--color-gold)"
                                    : "var(--color-text)",
                              }}
                            >
                              {row[plan as keyof typeof row] as string}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="py-5 px-6">
                      <span
                        className="font-bold"
                        style={{ color: "var(--color-text)" }}
                      >
                        Starting Price
                      </span>
                    </td>
                    <td className="text-center py-5 px-6">
                      <span
                        className="text-xl font-bold"
                        style={{ color: "var(--color-text)" }}
                      >
                        $96
                      </span>
                    </td>
                    <td
                      className="text-center py-5 px-6"
                      style={{ background: "var(--color-gold)08" }}
                    >
                      <span className="text-xl font-bold text-gold-gradient">
                        $179
                      </span>
                    </td>
                    <td className="text-center py-5 px-6">
                      <span
                        className="text-xl font-bold"
                        style={{ color: "var(--color-text)" }}
                      >
                        Custom Quote
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </motion.div>

            <motion.div
              className="text-center mt-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <Link href="#cta" className="btn-gold">
                Get Your Template Now <ArrowRight className="inline ml-2 w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Why Our Templates Win */}
        <section className="bg-[var(--color-bg-secondary)] py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span className="section-badge" variants={fadeUp}>
                Why Choose Us
              </motion.span>
              <motion.h2
                className="text-3xl md:text-4xl font-bold mt-4 mb-4"
                style={{ color: "var(--color-text)" }}
                variants={fadeUp}
              >
                Why Our Templates Win Every Time
              </motion.h2>
              <motion.p
                className="max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
                variants={fadeUp}
              >
                There are hundreds of template sellers online. Here is why
                thousands of businesses across India and internationally have
                chosen KVL Tech — and keep coming back for their next project.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {whyWin.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.title} className="card p-6" variants={fadeUp}>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{
                        background: "var(--color-gold)15",
                      }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: "var(--color-gold)" }}
                      />
                    </div>
                    <h3
                      className="text-lg font-bold mb-3"
                      style={{ color: "var(--color-text)" }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {item.desc}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Success Stories / Testimonials */}
        <section className="bg-[var(--color-bg)] py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span className="section-badge" variants={fadeUp}>
                Success Stories
              </motion.span>
              <motion.h2
                className="text-3xl md:text-4xl font-bold mt-4 mb-4"
                style={{ color: "var(--color-text)" }}
                variants={fadeUp}
              >
                Real Businesses. Real Results.
              </motion.h2>
              <motion.p
                className="max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
                variants={fadeUp}
              >
                From local restaurants to multi-branch hospitals, our templates
                have helped thousands of businesses establish a credible,
                professional online presence quickly and affordably.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {testimonials.map((t) => (
                <motion.div key={t.name} className="card p-6" variants={fadeUp}>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-current"
                        style={{ color: "var(--color-gold)" }}
                      />
                    ))}
                  </div>
                  <p
                    className="text-sm leading-relaxed mb-5 italic"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border)]">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ background: "var(--color-bg-secondary)" }}
                    >
                      {t.icon}
                    </div>
                    <div>
                      <p
                        className="font-bold text-sm"
                        style={{ color: "var(--color-text)" }}
                      >
                        {t.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {t.business}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[var(--color-bg-secondary)] py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span className="section-badge" variants={fadeUp}>
                FAQ
              </motion.span>
              <motion.h2
                className="text-3xl md:text-4xl font-bold mt-4 mb-4"
                style={{ color: "var(--color-text)" }}
                variants={fadeUp}
              >
                Questions We Hear Every Day
              </motion.h2>
              <motion.p
                className="max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
                variants={fadeUp}
              >
                We want you to feel confident before you buy. Here are honest,
                detailed answers to the questions our customers ask most often.
              </motion.p>
            </motion.div>

            <motion.div
              className="max-w-3xl mx-auto space-y-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {faqs.map((faq, idx) => (
                <motion.div key={idx} className="card p-6" variants={fadeUp}>
                  <div className="flex items-start gap-4">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                      style={{
                        background: "var(--color-gold)20",
                        color: "var(--color-gold)",
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <h3
                        className="font-bold mb-2"
                        style={{ color: "var(--color-text)" }}
                      >
                        {faq.question}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="bg-[var(--color-bg)] py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="card max-w-3xl mx-auto text-center py-14 px-8 relative overflow-hidden"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, var(--color-gold), transparent 70%)",
                }}
              />
              <motion.div className="relative z-10" variants={stagger}>
                <motion.div variants={fadeUp}>
                  <Shield
                    className="w-12 h-12 mx-auto mb-4"
                    style={{ color: "var(--color-gold)" }}
                  />
                </motion.div>
                <motion.span className="section-badge" variants={fadeUp}>
                  Free Demo Available
                </motion.span>
                <motion.h2
                  className="text-3xl md:text-4xl font-bold mt-6 mb-4"
                  style={{ color: "var(--color-text)" }}
                  variants={fadeUp}
                >
                  Book a Free Demo — See Any Template Live With Your Branding in
                  24 Hours
                </motion.h2>
                <motion.p
                  className="mb-4"
                  style={{ color: "var(--color-text-secondary)" }}
                  variants={fadeUp}
                >
                  Not sure which template is right for you? Tell us your business
                  type and we will set up a live demo using your actual company
                  name, logo, and colors — completely free, with no obligation to
                  buy. See exactly what your website will look like before
                  spending a single dollar.
                </motion.p>
                <motion.p
                  className="mb-8 text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                  variants={fadeUp}
                >
                  Join 5,000+ businesses who already trust KVL Tech to deliver
                  fast, professional, code-owned websites. Protected by our
                  30-day money-back guarantee — zero risk to you.
                </motion.p>
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                  variants={fadeUp}
                >
                  <Link href="/contact" className="btn-gold">
                    Book Free Demo Now <ArrowRight className="inline ml-2 w-4 h-4" />
                  </Link>
                  <Link href="/contact" className="btn-outline">
                    Contact Us
                  </Link>
                </motion.div>
                <motion.div
                  className="flex flex-wrap justify-center gap-6 mt-8"
                  variants={fadeUp}
                >
                  {[
                    { icon: Clock, text: "24-hour delivery" },
                    { icon: Shield, text: "30-day money-back" },
                    { icon: Code2, text: "Full source code" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.text}
                        className="flex items-center gap-2 text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{ color: "var(--color-gold)" }}
                        />
                        {item.text}
                      </div>
                    );
                  })}
                </motion.div>
              </motion.div>
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
