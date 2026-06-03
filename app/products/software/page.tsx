"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  Hospital,
  Package,
  Users,
  BarChart3,
  Receipt,
  CheckCircle,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Globe,
  Server,
  HardDrive,
  ChevronDown,
  ChevronUp,
  Code2,
  Database,
  Layers,
  Lock,
  DollarSign,
  Wifi,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const softwareProducts = [
  {
    icon: GraduationCap,
    name: "School Management System",
    category: "Education",
    features: [
      "Student enrollment & admissions",
      "Fee management & receipts",
      "Attendance tracking",
      "Report cards & grade books",
      "Parent portal & notifications",
      "Staff & teacher management",
    ],
    priceBasic: "$359",
    priceAdvanced: "$719",
    popular: false,
  },
  {
    icon: Hospital,
    name: "Hospital Management System",
    category: "Healthcare",
    features: [
      "Patient records & history",
      "Appointment booking system",
      "Billing & insurance claims",
      "Pharmacy management",
      "Lab management & reports",
      "Doctor portal & scheduling",
    ],
    priceBasic: "$599",
    priceAdvanced: "$1,199",
    popular: true,
  },
  {
    icon: Package,
    name: "Inventory Management System",
    category: "Retail & Warehouse",
    features: [
      "Real-time stock tracking",
      "Purchase order management",
      "Low-stock alerts & reorder",
      "Supplier management",
      "Barcode scanning support",
      "Multi-location inventory",
    ],
    priceBasic: "$299",
    priceAdvanced: "$599",
    popular: false,
  },
  {
    icon: Users,
    name: "HR & Payroll Software",
    category: "Human Resources",
    features: [
      "Employee records & profiles",
      "Attendance & shift management",
      "Automated salary calculation",
      "Leave & holiday management",
      "ESI/PF compliance built-in",
      "Payslip generation & export",
    ],
    priceBasic: "$419",
    priceAdvanced: "$839",
    popular: false,
  },
  {
    icon: BarChart3,
    name: "CRM Software",
    category: "Sales & Marketing",
    features: [
      "Lead capture & management",
      "Centralized contact database",
      "Pipeline & deal tracking",
      "Email integration & campaigns",
      "Sales reports & analytics",
      "Follow-up reminders & tasks",
    ],
    priceBasic: "$239",
    priceAdvanced: "$479",
    popular: false,
  },
  {
    icon: Receipt,
    name: "Billing & Invoice Software",
    category: "Finance & Accounting",
    features: [
      "GST-compliant invoices",
      "Quotation & estimate builder",
      "Payment tracking & reminders",
      "Expense management",
      "Financial reports & P&L",
      "Multi-currency support",
    ],
    priceBasic: "$120",
    priceAdvanced: "$239",
    popular: false,
  },
];

const comparisonRows = [
  {
    feature: "Cost Structure",
    custom: "One-time payment, yours forever",
    saas: "Monthly/yearly fees forever",
    icon: DollarSign,
  },
  {
    feature: "Data Ownership",
    custom: "100% your data, on your terms",
    saas: "Vendor holds your data",
    icon: Lock,
  },
  {
    feature: "Customization",
    custom: "Fully customizable to your workflow",
    saas: "Locked into their feature set",
    icon: Settings,
  },
  {
    feature: "Internet Dependency",
    custom: "Works offline with local install",
    saas: "Requires constant internet",
    icon: Wifi,
  },
  {
    feature: "Branding",
    custom: "Your logo, colors, domain",
    saas: "Third-party branding everywhere",
    icon: Star,
  },
  {
    feature: "Source Code",
    custom: "Full source code included",
    saas: "Never — black box product",
    icon: Code2,
  },
];

const techStack = [
  { name: "Next.js", desc: "React framework for fast, SEO-friendly frontends", icon: Layers },
  { name: "React", desc: "Modern UI with component-based architecture", icon: Code2 },
  { name: "Node.js", desc: "High-performance server-side logic and APIs", icon: Zap },
  { name: "PostgreSQL", desc: "Enterprise-grade, open-source relational database", icon: Database },
  { name: "Redis", desc: "In-memory caching for lightning-fast performance", icon: Server },
];

const industries = [
  { count: "50+", label: "Schools & Colleges" },
  { count: "30+", label: "Hospitals & Clinics" },
  { count: "100+", label: "Retail Shops" },
  { count: "20+", label: "Real Estate Agencies" },
  { count: "40+", label: "Restaurants & Cafes" },
  { count: "60+", label: "Service Businesses" },
];

const deploymentOptions = [
  {
    icon: Globe,
    title: "Cloud Hosting",
    desc: "We deploy and manage everything on our high-availability cloud servers. No technical setup needed on your end. Your software is live within 3–5 days and we handle all updates, backups, and uptime monitoring.",
  },
  {
    icon: Server,
    title: "Self-Hosted",
    desc: "We deploy on your own VPS, AWS, or DigitalOcean server. You own the environment, control costs, and maintain full independence. Our team handles the initial setup and hands over the server credentials.",
  },
  {
    icon: HardDrive,
    title: "Local Installation",
    desc: "Ideal for businesses with unreliable internet or strict data privacy requirements. Your software runs entirely on your local machine or office network — no internet required after installation.",
  },
];

const deploymentSteps = [
  { step: "01", title: "Payment & Brief", desc: "Complete purchase and fill out your business requirements form. Tell us your logo, color scheme, business name, and any specific configurations." },
  { step: "02", title: "Customization", desc: "Our development team applies your branding, configures your business data, sets up user roles, and adapts the system to your industry-specific needs." },
  { step: "03", title: "Testing & QA", desc: "We rigorously test the full system under realistic conditions — checking workflows, data accuracy, user permissions, and edge cases specific to your business." },
  { step: "04", title: "Delivery & Deployment", desc: "Your fully configured software is deployed to your chosen environment (cloud, server, or local). You receive login credentials and deployment documentation." },
  { step: "05", title: "Training & Support", desc: "We conduct two live training sessions with your team and provide detailed video tutorials. Our support team stays available for 30 days post-launch." },
];

const testimonials = [
  {
    name: "Rajesh Mehta",
    title: "Principal, Sunrise Public School",
    city: "Ahmedabad, Gujarat",
    text: "We've been managing fees and attendance manually for years. After deploying KVL's School Management System, our admin team saves 4 hours every single day. Parent communication is now automated and our fee collection rate improved by 35%. The ROI was clear within the first month.",
    rating: 5,
  },
  {
    name: "Dr. Priya Nair",
    title: "Director, LifeCare Multi-Specialty Clinic",
    city: "Kochi, Kerala",
    text: "We evaluated three SaaS hospital software options before choosing KVL. The one-time cost made financial sense, but what sealed it was owning our patient data entirely. The system went live in 4 days and the pharmacy module alone reduced dispensing errors by 60%. Excellent investment.",
    rating: 5,
  },
  {
    name: "Sanjay Gupta",
    title: "Owner, Gupta Electronics Wholesale",
    city: "Indore, Madhya Pradesh",
    text: "Running three warehouse locations meant our inventory was always out of sync. KVL's Inventory Management System gave us a unified view across all locations in real time. We cut overstock by 28% in the first quarter and our staff picked up the system in a single training session.",
    rating: 5,
  },
];

const faqs = [
  {
    q: "Is the source code really mine after purchase?",
    a: "Yes, 100%. When you purchase any software product from KVL TECH, we hand over the complete, unencrypted source code with no licensing restrictions, no usage fees, and no dependencies on our servers. You can modify it, extend it, hand it to any developer, or resell it as your own product. Once you pay, it is yours permanently.",
  },
  {
    q: "How is the software customized for my specific business?",
    a: "After purchase, you fill out a detailed requirements form — covering your business name, logo, color scheme, user roles, initial data setup, and any workflow preferences. Our team then applies all branding changes, configures your business settings, imports any initial data you provide, and delivers a system that looks and behaves like it was built specifically for you.",
  },
  {
    q: "Can I add more features after the initial purchase?",
    a: "Absolutely. The initial product is a comprehensive, production-ready system, but every business evolves. Additional custom features are quoted separately based on complexity and scope. Many of our clients return for feature additions as their business grows. Having the source code means any developer — including our team — can extend it efficiently.",
  },
  {
    q: "What database does the software use and why?",
    a: "All our software products use PostgreSQL, an enterprise-grade, open-source relational database trusted by companies like Apple, Instagram, and Spotify. PostgreSQL is free to use, handles millions of records efficiently, supports advanced queries, and has exceptional reliability. You will never pay a database licensing fee, and your data will always be fully accessible.",
  },
  {
    q: "Do I need to purchase a server or hosting separately?",
    a: "It depends on your preference. If you choose cloud hosting, we provide managed hosting on our servers for a small annual fee. If you choose self-hosted, we deploy to your own VPS (DigitalOcean, AWS, Azure, etc.) which typically costs $10–$20/month. For local installation, no server is needed at all — the software runs on your existing office hardware.",
  },
  {
    q: "What training and after-sales support is provided?",
    a: "Every purchase includes a comprehensive video tutorial library covering all features and workflows, two live training sessions (conducted over video call) for you and your team, and 30 days of priority email and WhatsApp support after deployment. We also provide detailed admin documentation so you can train new staff independently after the initial handover.",
  },
];

export default function SoftwareSolutionsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main className="pt-16">

        {/* Hero Section */}
        <section className="bg-[var(--color-bg)] py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: "var(--color-gold)" }} />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-8" style={{ background: "var(--color-navy)" }} />
          </div>
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp}>
                <span className="section-badge">Software Solutions</span>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="text-4xl md:text-6xl font-bold mt-6 mb-6 leading-tight"
                style={{ color: "var(--color-text)" }}
              >
                Enterprise-Grade Business Software —{" "}
                <span className="text-gold-gradient">Fully Branded, Fully Yours</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-xl mb-10 max-w-3xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Ready-made software solutions for schools, hospitals, clinics, shops, and more. Stop paying monthly SaaS fees. Get a complete, branded system you own outright — and launch in days, not months.
              </motion.p>

              {/* Stats Row */}
              <motion.div
                variants={stagger}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10"
              >
                {[
                  { value: "15+", label: "Software Products" },
                  { value: "3–5 Days", label: "Delivery Time" },
                  { value: "1,200+", label: "Businesses Using" },
                  { value: "100%", label: "Source Code Ownership" },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={fadeUp}
                    className="card p-5 text-center"
                  >
                    <div className="text-3xl font-bold text-gold-gradient mb-1">{stat.value}</div>
                    <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="btn-gold px-8 py-4 text-lg font-semibold rounded-lg inline-flex items-center gap-2">
                  Get Free Consultation <ArrowRight size={20} />
                </Link>
                <Link href="#products" className="btn-outline px-8 py-4 text-lg font-semibold rounded-lg inline-flex items-center gap-2">
                  Browse All Products
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Software Products Grid */}
        <section id="products" className="bg-[var(--color-bg-secondary)] py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.span variants={fadeUp} className="section-badge">Our Products</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mt-4 mb-4" style={{ color: "var(--color-text)" }}>
                6 Industry-Specific Software Solutions
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                Each product is production-ready, fully customizable with your branding, and delivered with complete source code. Basic plan includes core features; Advanced adds full integration and unlimited users.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {softwareProducts.map((product) => (
                <motion.div
                  key={product.name}
                  variants={fadeUp}
                  className="card p-8 relative flex flex-col"
                  style={{ border: product.popular ? "2px solid var(--color-gold)" : undefined }}
                >
                  {product.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="btn-gold px-4 py-1 text-xs font-bold rounded-full">Most Popular</span>
                    </div>
                  )}
                  <div className="flex items-start gap-4 mb-5">
                    <div className="p-3 rounded-xl" style={{ background: "var(--color-gold)", opacity: 1 }}>
                      <product.icon size={24} color="var(--color-navy)" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>{product.name}</h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--color-border)", color: "var(--color-text-secondary)" }}>
                        {product.category}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        <CheckCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-gold)" }} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="border-t pt-5" style={{ borderColor: "var(--color-border)" }}>
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <div className="text-xs mb-1" style={{ color: "var(--color-text-secondary)" }}>Basic Plan</div>
                        <div className="text-2xl font-bold text-gold-gradient">{product.priceBasic}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs mb-1" style={{ color: "var(--color-text-secondary)" }}>Advanced Plan</div>
                        <div className="text-2xl font-bold text-gold-gradient">{product.priceAdvanced}</div>
                      </div>
                    </div>
                    <Link href="/contact" className="btn-primary w-full py-3 rounded-lg text-center font-semibold block">
                      Get This Software
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-8 text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              All prices are one-time payments in USD. No recurring fees. Full source code included with every purchase.
            </motion.p>
          </div>
        </section>

        {/* Why Custom Software vs SaaS */}
        <section className="bg-[var(--color-bg)] py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">Why Go Custom?</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mt-4 mb-4" style={{ color: "var(--color-text)" }}>
                Custom Software vs SaaS Subscriptions
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                SaaS tools seem affordable at first — but add up to enormous costs over time. Here's how a one-time custom software purchase stacks up against paying forever.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="overflow-x-auto"
            >
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>Feature</th>
                    <th className="p-4 text-center">
                      <span className="btn-gold px-4 py-2 rounded-lg text-sm font-bold inline-block">KVL Custom Software</span>
                    </th>
                    <th className="p-4 text-center text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>Typical SaaS Subscription</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <motion.tr
                      key={row.feature}
                      variants={fadeUp}
                      className="border-t"
                      style={{ borderColor: "var(--color-border)", background: i % 2 === 0 ? "var(--color-bg-secondary)" : "transparent" }}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <row.icon size={18} style={{ color: "var(--color-gold)" }} />
                          <span className="font-medium" style={{ color: "var(--color-text)" }}>{row.feature}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle size={16} style={{ color: "var(--color-gold)" }} />
                          <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{row.custom}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{row.saas}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 card p-8 text-center"
            >
              <p className="text-lg font-medium" style={{ color: "var(--color-text)" }}>
                A typical SaaS CRM costs $49–$149/month. Over 3 years, that's <span className="text-gold-gradient font-bold">$1,764–$5,364</span> for a product you never own.
                Our CRM starts at <span className="text-gold-gradient font-bold">$239 — one time</span>. The math is obvious.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="bg-[var(--color-bg-secondary)] py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">Technology</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mt-4 mb-4" style={{ color: "var(--color-text)" }}>
                Built on an Enterprise-Grade Tech Stack
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                We use the same technologies powering Fortune 500 companies. Your software is not built on outdated frameworks — it's ready to scale from 10 users to 10,000.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
            >
              {techStack.map((tech) => (
                <motion.div key={tech.name} variants={fadeUp} className="card p-6 text-center">
                  <div className="flex justify-center mb-3">
                    <tech.icon size={32} style={{ color: "var(--color-gold)" }} />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: "var(--color-text)" }}>{tech.name}</h3>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{tech.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Industries Served */}
        <section className="bg-[var(--color-bg)] py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">Industries Served</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mt-4 mb-4" style={{ color: "var(--color-text)" }}>
                Trusted Across Industries — From Education to Enterprise
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                Over 1,200 businesses have launched with KVL TECH software. Here's a snapshot of the industries we've transformed with custom, branded business software.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6"
            >
              {industries.map((industry) => (
                <motion.div key={industry.label} variants={fadeUp} className="card p-6 text-center">
                  <div className="text-3xl font-bold text-gold-gradient mb-2">{industry.count}</div>
                  <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{industry.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Deployment Options */}
        <section className="bg-[var(--color-bg-secondary)] py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">Deployment</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mt-4 mb-4" style={{ color: "var(--color-text)" }}>
                Three Flexible Deployment Options
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                Whether you want a fully managed cloud experience, control over your own server, or a completely offline setup — we have a deployment model that fits your business.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {deploymentOptions.map((option) => (
                <motion.div key={option.title} variants={fadeUp} className="card p-8">
                  <div className="p-3 rounded-xl inline-flex mb-5" style={{ background: "var(--color-gold)" }}>
                    <option.icon size={26} color="var(--color-navy)" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: "var(--color-text)" }}>{option.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{option.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* What Happens After Purchase */}
        <section className="bg-[var(--color-bg)] py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">Our Process</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mt-4 mb-4" style={{ color: "var(--color-text)" }}>
                From Purchase to Live in 5 Steps
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                We've refined our delivery process across hundreds of projects. You'll always know exactly where things stand and what comes next.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="space-y-6"
            >
              {deploymentSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  variants={fadeUp}
                  className="card p-6 flex items-start gap-6"
                >
                  <div className="text-4xl font-black flex-shrink-0 text-gold-gradient">{step.step}</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-text)" }}>{step.title}</h3>
                    <p className="leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-[var(--color-bg-secondary)] py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">Client Results</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mt-4 mb-4" style={{ color: "var(--color-text)" }}>
                Real Businesses. Real Results.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                Our clients don't just use the software — they measure the impact. Here's what three of them had to say after going live.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {testimonials.map((t) => (
                <motion.div key={t.name} variants={fadeUp} className="card p-8 flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={18} fill="var(--color-gold)" style={{ color: "var(--color-gold)" }} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: "var(--color-text-secondary)" }}>
                    "{t.text}"
                  </p>
                  <div>
                    <div className="font-bold" style={{ color: "var(--color-text)" }}>{t.name}</div>
                    <div className="text-xs mb-1" style={{ color: "var(--color-gold)" }}>{t.title}</div>
                    <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{t.city}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[var(--color-bg)] py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">FAQ</motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold mt-4 mb-4" style={{ color: "var(--color-text)" }}>
                Frequently Asked Questions
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                We've answered the most common questions below. Still have something specific? Reach out via WhatsApp or book a free consultation.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="space-y-4"
            >
              {faqs.map((faq, index) => (
                <motion.div key={index} variants={fadeUp} className="card overflow-hidden">
                  <button
                    className="w-full text-left p-6 flex items-start justify-between gap-4"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-semibold text-base" style={{ color: "var(--color-text)" }}>{faq.q}</span>
                    {openFaq === index
                      ? <ChevronUp size={20} style={{ color: "var(--color-gold)", flexShrink: 0 }} />
                      : <ChevronDown size={20} style={{ color: "var(--color-gold)", flexShrink: 0 }} />}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{faq.a}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[var(--color-bg-secondary)] py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span variants={fadeUp} className="section-badge">Get Started Today</motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-5xl font-bold mt-6 mb-6"
                style={{ color: "var(--color-text)" }}
              >
                Get a Free Software Consultation —{" "}
                <span className="text-gold-gradient">Find the Right Solution for Your Business</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-xl mb-10 max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Not sure which product fits your needs or whether you need custom features? Book a free 30-minute consultation and we'll map out the perfect software setup for your business — no sales pressure, just clarity.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="btn-gold px-10 py-4 text-lg font-bold rounded-lg inline-flex items-center gap-2">
                  Book Free Consultation <ArrowRight size={22} />
                </Link>
                <Link href="/products" className="btn-outline px-10 py-4 text-lg font-semibold rounded-lg inline-flex items-center gap-2">
                  View All Products
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} className="mt-8 flex items-center justify-center gap-6 flex-wrap">
                {[
                  "No commitment required",
                  "Response within 2 hours",
                  "Free source code demo",
                ].map((point) => (
                  <div key={point} className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    <CheckCircle size={16} style={{ color: "var(--color-gold)" }} />
                    {point}
                  </div>
                ))}
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
