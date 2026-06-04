"use client";

import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  Mail,
  BarChart2,
  Smartphone,
  CheckCircle,
  Star,
  ArrowRight,
  Layers,
  MessageSquare,
  Calendar,
  CreditCard,
  Globe,
  Megaphone,
  ChevronDown,
  ChevronUp,
  Target,
  RefreshCw,
  Zap,
  Award,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const features = [
  {
    icon: <Layers className="w-7 h-7" />,
    title: "Lead Pipeline",
    description:
      "Visualise every deal's journey with a drag-and-drop pipeline board. Move prospects from first contact through qualification, proposal, negotiation, and closed-won with a single click. Get a bird's-eye view of every opportunity your team is working, spot bottlenecks before they stall revenue, and ensure no lead ever slips through the cracks again. Customise stages to match your exact sales process — whether you sell B2B services, real estate, or retail.",
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: "Contact Management",
    description:
      "Build rich, 360-degree customer profiles that store every call note, email thread, meeting log, purchase history, and support ticket in one searchable place. Tag contacts by industry, deal size, or relationship strength. Segment your database for targeted campaigns, surface the right follow-up at the right moment, and give every team member instant context before they pick up the phone — no more asking a customer to repeat themselves.",
  },
  {
    icon: <Mail className="w-7 h-7" />,
    title: "Email Integration",
    description:
      "Compose, send, and track emails without ever leaving the CRM. Connect your Gmail or Outlook in minutes and watch opens, clicks, and replies auto-log against the correct contact record. Set automated follow-up sequences that fire when a lead goes cold, use pre-built templates for common scenarios, and A/B test subject lines to maximise response rates. Your inbox and your pipeline finally live in the same place.",
  },
  {
    icon: <BarChart2 className="w-7 h-7" />,
    title: "Sales Forecasting",
    description:
      "Stop guessing next month's revenue. Our AI analyses historical win rates, average deal cycles, and current pipeline value to project accurate monthly and quarterly forecasts. Identify which deals are most likely to close, where pipeline coverage is thin, and how individual reps are tracking against quota. Feed the forecast into your cash-flow planning and walk into every board meeting with data-backed confidence.",
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: "Team Collaboration",
    description:
      "Assign leads to the right sales rep with one click, set task reminders, share deal notes, and review performance dashboards that show call volume, emails sent, meetings booked, and conversion rates for every team member. Managers can coach with real data rather than gut feel, spot top performers, and replicate winning behaviours across the team. Everyone stays aligned and accountable without endless status-update meetings.",
  },
  {
    icon: <Smartphone className="w-7 h-7" />,
    title: "Mobile CRM App",
    description:
      "Your pipeline travels with you. The full-featured Android and iOS app gives field sales reps instant access to contact records, deal stages, and task lists. Log a call the moment it ends, check in from a client site, or approve a proposal from the airport lounge. Push notifications alert you when a high-value lead opens your email or a task deadline approaches — so you always respond while the moment is hot.",
  },
];

const integrations = [
  { icon: <MessageSquare className="w-6 h-6" />, name: "WhatsApp" },
  { icon: <Mail className="w-6 h-6" />, name: "Email" },
  { icon: <Calendar className="w-6 h-6" />, name: "Google Calendar" },
  { icon: <CreditCard className="w-6 h-6" />, name: "Payment Gateways" },
  { icon: <Globe className="w-6 h-6" />, name: "Website Forms" },
  { icon: <Megaphone className="w-6 h-6" />, name: "Social Media Ads" },
];

const journeySteps = [
  {
    stage: "Awareness",
    color: "bg-blue-500",
    description: "Prospect sees your ad or fills out a web form. CRM auto-creates a lead record and notifies the assigned rep within seconds.",
  },
  {
    stage: "Engagement",
    color: "bg-indigo-500",
    description: "Rep sends a personalised email sequence. Every open and click is tracked, triggering smart follow-up tasks automatically.",
  },
  {
    stage: "Proposal",
    color: "bg-purple-500",
    description: "A quote is generated inside the CRM and emailed. The system logs when the prospect views it and alerts the rep to follow up at the perfect time.",
  },
  {
    stage: "Closed Deal",
    color: "bg-yellow-500",
    description: "Contract signed and payment linked. The customer record transitions to account management, with renewal reminders set for 11 months ahead.",
  },
  {
    stage: "Repeat Purchase",
    color: "bg-green-500",
    description: "Automated loyalty touchpoints keep the relationship warm — birthdays, anniversaries, and product updates sent on autopilot.",
  },
];

const setupSteps = [
  {
    step: "01",
    icon: <RefreshCw className="w-8 h-8" />,
    title: "Import Existing Contacts",
    description:
      "Upload your existing contacts from Excel, Google Sheets, or any previous CRM via CSV. Our migration team handles the data mapping and cleanup for free — zero downtime, zero data loss.",
  },
  {
    step: "02",
    icon: <Layers className="w-8 h-8" />,
    title: "Customise Pipeline Stages",
    description:
      "Rename, reorder, and colour-code pipeline stages to reflect your actual sales process. Add custom fields, set probability percentages, and define the entry criteria for each stage — the CRM adapts to you, not the other way around.",
  },
  {
    step: "03",
    icon: <Zap className="w-8 h-8" />,
    title: "Connect Your Channels",
    description:
      "Integrate WhatsApp, Gmail, Google Calendar, and your website forms in under 30 minutes. Three live onboarding sessions with a dedicated specialist ensure your team hits the ground running from day one.",
  },
];

const faqs = [
  {
    q: "How do I migrate my existing data into the CRM?",
    a: "Free data migration is included with every plan. Our onboarding team imports your contacts, deals, and notes from Excel, Google Sheets, Salesforce, HubSpot, or any CSV-compatible source. The migration is completed before your go-live date, so your team starts with a fully populated CRM — no manual re-entry required.",
  },
  {
    q: "How many users can access the CRM?",
    a: "The Basic plan supports 2 users, Premium supports 10 users, and the Enterprise plan scales to unlimited seats. You can add individual user licences at any time without changing your base plan. Role-based permissions ensure every team member sees exactly what they need.",
  },
  {
    q: "Does it integrate with WhatsApp?",
    a: "Yes — native WhatsApp Business API integration is built in, not bolted on. Send and receive WhatsApp messages directly from a contact's record, log conversations automatically, and set auto-reply triggers for common queries. All message history is searchable and linked to the deal timeline.",
  },
  {
    q: "Can I access the CRM on my mobile phone?",
    a: "Absolutely. A full-featured iOS and Android app is included with every plan at no extra cost. It mirrors the desktop experience — pipeline board, contact records, task lists, email composer, and reporting dashboards are all available on the go.",
  },
  {
    q: "Is training and onboarding provided?",
    a: "Three live onboarding sessions with a dedicated CRM specialist are included with every plan. Sessions cover data migration, pipeline setup, channel connections, and team administration. Recordings are provided so new joiners can self-onboard. Ongoing support is available via email and WhatsApp six days a week.",
  },
  {
    q: "Can I customise fields and pipeline stages for my industry?",
    a: "Yes, the CRM is fully customisable. Add custom fields to contact, deal, and company records — dropdowns, date pickers, numeric fields, or free text. Rename and reorder pipeline stages, create multiple pipelines for different product lines, and build custom reports on any data point. Whether you are in real estate, manufacturing, consulting, or e-commerce, the CRM shapes itself to your workflow.",
  },
];

const pricing = [
  {
    name: "Basic",
    price: "$239",
    period: "/month",
    highlight: false,
    features: [
      "2 user seats",
      "1,000 contacts",
      "Lead pipeline & deal tracking",
      "Email integration",
      "Mobile app (iOS & Android)",
      "Free data migration",
      "3 onboarding sessions",
      "Email & WhatsApp support",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Premium",
    price: "$479",
    period: "/month",
    highlight: true,
    features: [
      "10 user seats",
      "Unlimited contacts",
      "AI sales forecasting",
      "WhatsApp CRM integration",
      "Team performance dashboards",
      "Custom fields & pipelines",
      "Priority support",
      "All Basic features",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    highlight: false,
    features: [
      "Unlimited user seats",
      "Unlimited contacts",
      "Dedicated account manager",
      "Custom integrations & API",
      "SLA-backed uptime",
      "On-site training",
      "White-label option",
      "All Premium features",
    ],
    cta: "Contact Sales",
  },
];

export default function CRMSolutionsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main className="pt-[104px]">

        {/* Hero */}
        <section className="bg-[var(--color-bg)] py-24 px-4 overflow-hidden relative">
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle at 70% 40%, var(--color-gold) 0%, transparent 60%)" }} />
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.span variants={fadeUp} className="section-badge mb-4 inline-block">
                CRM Solutions
              </motion.span>
              <motion.h1
                variants={fadeUp}
                className="text-4xl md:text-6xl font-extrabold leading-tight mb-6"
                style={{ color: "var(--color-text)" }}
              >
                Never Lose a Lead Again —{" "}
                <span className="text-gold-gradient">CRM Built for Indian Businesses</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-lg md:text-xl max-w-3xl mx-auto mb-10"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Track every customer interaction, automate follow-ups, and close 40% more deals with our intelligent CRM platform — designed from the ground up for the way Indian businesses sell.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="btn-gold px-8 py-4 text-lg font-semibold rounded-xl">
                  Start Free 30-Day Trial
                </Link>
                <Link href="#pricing" className="btn-outline px-8 py-4 text-lg font-semibold rounded-xl">
                  View Pricing
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-[var(--color-bg-secondary)] py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {[
                { value: "360°", label: "Customer View" },
                { value: "40%", label: "Increase in Sales" },
                { value: "5,000+", label: "Deals Tracked" },
                { value: "2-Day", label: "Deployment" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  className="card text-center py-8 px-4"
                >
                  <div className="text-3xl md:text-4xl font-extrabold text-gold-gradient mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-[var(--color-bg)] py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.span variants={fadeUp} className="section-badge mb-4 inline-block">
                Core Features
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: "var(--color-text)" }}
              >
                Everything Your Sales Team Needs to Win
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Six powerful modules working together to give your business a complete, end-to-end sales engine — no stitching together separate tools, no data falling between the cracks.
              </motion.p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((f) => (
                <motion.div key={f.title} variants={fadeUp} className="card p-8 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--color-gold)", color: "var(--color-navy)" }}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    {f.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CRM vs Competitors */}
        <section className="bg-[var(--color-bg-secondary)] py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.span variants={fadeUp} className="section-badge mb-4 inline-block">
                Why KVL CRM?
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: "var(--color-text)" }}
              >
                See How We Stack Up Against the Big Names
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Salesforce and HubSpot are built for Silicon Valley companies with enterprise budgets. KVL CRM is built for Indian businesses — with local support, India-specific features, and a price that makes sense.
              </motion.p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="card overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "var(--color-gold)", color: "var(--color-navy)" }}>
                      <th className="py-4 px-6 text-left font-bold">Feature</th>
                      <th className="py-4 px-6 text-center font-bold">KVL CRM</th>
                      <th className="py-4 px-6 text-center font-bold">Salesforce</th>
                      <th className="py-4 px-6 text-center font-bold">HubSpot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Starting Price", "$239/month", "$1,200+/month", "$890+/month"],
                      ["India-Specific Features", "✓ Built-in", "✗ Add-on", "✗ Limited"],
                      ["WhatsApp Integration", "✓ Native", "✗ Third-party", "✗ Third-party"],
                      ["Local Support (IST)", "✓ 6 days/week", "✗ US hours", "✗ US hours"],
                      ["Setup Time", "2 days", "4–8 weeks", "2–4 weeks"],
                      ["Free Data Migration", "✓ Included", "✗ Paid add-on", "✗ Paid add-on"],
                      ["GST-Ready Invoicing", "✓ Built-in", "✗ Not available", "✗ Not available"],
                      ["Onboarding Sessions", "3 live sessions", "Self-serve only", "1 session"],
                    ].map(([feature, kvl, sf, hs], i) => (
                      <tr
                        key={feature}
                        style={{
                          background: i % 2 === 0 ? "var(--color-bg)" : "var(--color-bg-secondary)",
                          color: "var(--color-text)",
                        }}
                      >
                        <td className="py-4 px-6 font-medium">{feature}</td>
                        <td className="py-4 px-6 text-center font-semibold" style={{ color: "var(--color-gold)" }}>
                          {kvl}
                        </td>
                        <td className="py-4 px-6 text-center" style={{ color: "var(--color-text-secondary)" }}>
                          {sf}
                        </td>
                        <td className="py-4 px-6 text-center" style={{ color: "var(--color-text-secondary)" }}>
                          {hs}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Customer Journey */}
        <section className="bg-[var(--color-bg)] py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.span variants={fadeUp} className="section-badge mb-4 inline-block">
                Customer Journey
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: "var(--color-text)" }}
              >
                Track Every Prospect From First Click to Loyal Customer
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                The CRM maps the entire customer lifecycle automatically — so you always know where each prospect stands and exactly what action to take next to move them forward.
              </motion.p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="relative"
            >
              <div className="hidden md:block absolute left-6 top-0 bottom-0 w-0.5"
                style={{ background: "var(--color-border)" }} />
              <div className="flex flex-col gap-8">
                {journeySteps.map((step, i) => (
                  <motion.div
                    key={step.stage}
                    variants={fadeUp}
                    className="flex gap-6 items-start"
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full ${step.color} flex items-center justify-center text-white font-bold text-sm z-10`}>
                      {i + 1}
                    </div>
                    <div className="card p-6 flex-1">
                      <h3 className="text-lg font-bold mb-2" style={{ color: "var(--color-text)" }}>
                        {step.stage}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Success Story */}
        <section className="bg-[var(--color-bg-secondary)] py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="card p-10 md:p-16 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-5"
                style={{ backgroundImage: "radial-gradient(circle at 50% 50%, var(--color-gold), transparent 70%)" }} />
              <motion.div variants={fadeUp} className="relative z-10">
                <Award className="w-12 h-12 mx-auto mb-6" style={{ color: "var(--color-gold)" }} />
                <div className="flex justify-center mb-4 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" style={{ color: "var(--color-gold)" }} />
                  ))}
                </div>
                <blockquote
                  className="text-xl md:text-2xl font-semibold leading-relaxed mb-8 italic"
                  style={{ color: "var(--color-text)" }}
                >
                  "Before KVL CRM, our sales team was juggling WhatsApp chats, spreadsheets, and sticky notes. Leads were falling through the gaps every single week. Within 60 days of deploying the pipeline automation, our lead conversion rate jumped from 10% to 35%. That's not a small improvement — that's a business transformation. The ROI was visible in the first month."
                </blockquote>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                    style={{ background: "var(--color-gold)", color: "var(--color-navy)" }}>
                    VS
                  </div>
                  <p className="font-bold text-lg" style={{ color: "var(--color-text)" }}>
                    Vikram Sharma
                  </p>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Founder, Vikram's Real Estate Agency, Pune
                  </p>
                  <div className="mt-3 px-5 py-2 rounded-full text-sm font-semibold"
                    style={{ background: "rgba(var(--color-gold-rgb, 212,175,55), 0.15)", color: "var(--color-gold)" }}>
                    10% → 35% lead conversion in 60 days
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Integrations */}
        <section className="bg-[var(--color-bg)] py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge mb-4 inline-block">
                Integrations
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: "var(--color-text)" }}
              >
                Connect the Tools Your Business Already Uses
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                KVL CRM integrates with the platforms Indian businesses rely on every day — no middleware, no developers required. Every connection is set up during your onboarding session.
              </motion.p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6"
            >
              {integrations.map((int) => (
                <motion.div
                  key={int.name}
                  variants={fadeUp}
                  className="card p-6 flex flex-col items-center gap-3 text-center hover:scale-105 transition-transform"
                >
                  <div style={{ color: "var(--color-gold)" }}>{int.icon}</div>
                  <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                    {int.name}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-[var(--color-bg-secondary)] py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge mb-4 inline-block">
                Transparent Pricing
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: "var(--color-text)" }}
              >
                Simple Pricing, Serious Results
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                No hidden fees, no per-feature add-ons, no surprise invoices. Every plan includes free data migration, onboarding sessions, and our mobile app.
              </motion.p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {pricing.map((plan) => (
                <motion.div
                  key={plan.name}
                  variants={fadeUp}
                  className={`card p-8 flex flex-col relative ${plan.highlight ? "ring-2" : ""}`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full text-xs font-bold"
                      style={{ background: "var(--color-gold)", color: "var(--color-navy)" }}>
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
                    {plan.name}
                  </h3>
                  <div className="flex items-end gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-gold-gradient">{plan.price}</span>
                    <span className="text-sm pb-1" style={{ color: "var(--color-text-secondary)" }}>
                      {plan.period}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--color-gold)" }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={plan.highlight ? "btn-gold text-center py-3 rounded-xl font-semibold" : "btn-outline text-center py-3 rounded-xl font-semibold"}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Setup Process */}
        <section className="bg-[var(--color-bg)] py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.span variants={fadeUp} className="section-badge mb-4 inline-block">
                Simple Setup
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: "var(--color-text)" }}
              >
                Live in 3 Steps, Running in 2 Days
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Our guided onboarding process is designed to get your team selling inside 48 hours — not 48 days. Here is exactly what happens after you sign up.
              </motion.p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {setupSteps.map((step) => (
                <motion.div key={step.step} variants={fadeUp} className="card p-8 text-center flex flex-col items-center gap-4">
                  <div className="text-5xl font-extrabold text-gold-gradient">{step.step}</div>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: "var(--color-gold)", color: "var(--color-navy)" }}>
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[var(--color-bg-secondary)] py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge mb-4 inline-block">
                FAQ
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: "var(--color-text)" }}
              >
                Common Questions Answered
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Everything you need to know before you commit — and we make it easy to ask more.
              </motion.p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="flex flex-col gap-4"
            >
              {faqs.map((faq, i) => (
                <motion.div key={i} variants={fadeUp} className="card overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-6 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-semibold pr-4" style={{ color: "var(--color-text)" }}>
                      {faq.q}
                    </span>
                    {openFaq === i ? (
                      <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: "var(--color-gold)" }} />
                    ) : (
                      <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: "var(--color-gold)" }} />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                      {faq.a}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-[var(--color-bg)] py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span variants={fadeUp} className="section-badge mb-4 inline-block">
                Get Started Today
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-5xl font-extrabold mb-6"
                style={{ color: "var(--color-text)" }}
              >
                Start Your Free 30-Day Trial —{" "}
                <span className="text-gold-gradient">Full Access, No Commitment</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg mb-4 max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                No credit card required. No setup fee. No long-term contract. Get your entire sales pipeline running in 48 hours with our hands-on onboarding team guiding every step.
              </motion.p>
              <motion.p
                variants={fadeUp}
                className="text-base mb-10"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Join hundreds of Indian businesses that have already replaced scattered spreadsheets and missed follow-ups with a single, powerful CRM that works the way they work.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="btn-gold px-10 py-4 text-lg font-semibold rounded-xl flex items-center gap-2 justify-center">
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/contact" className="btn-outline px-10 py-4 text-lg font-semibold rounded-xl">
                  Talk to a CRM Specialist
                </Link>
              </motion.div>
              <motion.p
                variants={fadeUp}
                className="mt-6 text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Questions? WhatsApp us directly or book a free 30-minute demo call.
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
