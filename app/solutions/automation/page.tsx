"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Target,
  RefreshCw,
  FileText,
  Share2,
  MessageCircle,
  Plug,
  Layers,
  Play,
  Utensils,
  GraduationCap,
  HeartPulse,
  Building2,
  ShoppingCart,
  Hotel,
  AlertCircle,
  Bell,
  Megaphone,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as unknown as never } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const stats = [
  { value: "20+", label: "Hours/Week Saved" },
  { value: "3x", label: "Faster Operations" },
  { value: "500+", label: "Businesses Automated" },
  { value: "99.9%", label: "Uptime Guaranteed" },
];

const features = [
  {
    icon: Mail,
    title: "Email Marketing Automation",
    description:
      "Send precisely targeted email campaigns automatically based on customer behavior, purchase history, and engagement patterns. Nurture leads with personalized sequences that convert without manual effort.",
  },
  {
    icon: Target,
    title: "Lead Capture & Scoring",
    description:
      "Capture inbound leads 24 hours a day, 7 days a week from your website, social media, and ads. Our intelligent scoring engine ranks leads by purchase intent so your sales team always focuses on the hottest prospects first.",
  },
  {
    icon: RefreshCw,
    title: "CRM Auto-Sync",
    description:
      "Customer data updates instantly and consistently across every platform you use — your CRM, email tool, billing system, and support desk — eliminating double entry and costly data mismatches.",
  },
  {
    icon: FileText,
    title: "Invoice & Billing Automation",
    description:
      "Generate professional invoices, send payment reminders, and reconcile payments automatically. Reduce your accounts-receivable cycle and get paid faster without chasing every client manually.",
  },
  {
    icon: Share2,
    title: "Social Media Scheduling",
    description:
      "Plan your content once and let automation publish it across every channel — Instagram, Facebook, LinkedIn, Twitter/X — at the perfect time for maximum reach and engagement, completely on autopilot.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Bot Integration",
    description:
      "Deploy a smart WhatsApp bot that answers customer queries, confirms orders, sends booking reminders, and collects feedback round the clock — delivering instant responses even when your team is offline.",
  },
];

const steps = [
  {
    number: "01",
    icon: Plug,
    title: "Connect Your Tools",
    description:
      "We integrate with your existing software stack in minutes — no ripping and replacing what already works. WhatsApp, email, CRM, payment gateways, accounting software, and 200+ other apps connect seamlessly through our integration layer.",
  },
  {
    number: "02",
    icon: Layers,
    title: "Set Up Workflows",
    description:
      "Use our intuitive drag-and-drop automation builder to design exactly how your business should run. No coding knowledge required. We handle the technical heavy lifting and walk you through every workflow until you feel completely confident.",
  },
  {
    number: "03",
    icon: Play,
    title: "Watch It Run",
    description:
      "Once live, your automation engine works 24 hours a day, 7 days a week without breaks, sick days, or human errors. You get real-time dashboards showing every workflow in action while you focus entirely on growing your business.",
  },
];

const industries = [
  {
    icon: Utensils,
    name: "Restaurant",
    benefit:
      "Automate online orders, WhatsApp confirmations, table booking reminders, and customer loyalty follow-ups to fill seats and increase repeat visits.",
  },
  {
    icon: GraduationCap,
    name: "School",
    benefit:
      "Streamline fee collection reminders, parent communication, attendance notifications, and admission inquiry follow-ups without burdening your administrative staff.",
  },
  {
    icon: HeartPulse,
    name: "Hospital & Clinic",
    benefit:
      "Send appointment reminders, post-visit follow-ups, prescription renewal alerts, and health-check notifications automatically to improve patient adherence and reduce no-shows.",
  },
  {
    icon: Building2,
    name: "Real Estate",
    benefit:
      "Nurture property leads with automated drip campaigns, schedule site visit reminders, and send EMI and document collection alerts to close deals faster.",
  },
  {
    icon: ShoppingCart,
    name: "E-commerce",
    benefit:
      "Recover abandoned carts, send order status updates, automate review requests, and run targeted re-engagement campaigns to maximize customer lifetime value.",
  },
  {
    icon: Hotel,
    name: "Hotel",
    benefit:
      "Automate booking confirmations, check-in instructions, upsell offers, and post-stay review requests to deliver a frictionless guest experience at scale.",
  },
];

const painPoints = [
  {
    icon: AlertCircle,
    problem: "Manual Errors",
    solution:
      "Human data entry mistakes cost businesses thousands every year. Automation eliminates manual entry entirely, ensuring every record is accurate, consistent, and up to date across all your systems.",
  },
  {
    icon: Bell,
    problem: "Missed Follow-Ups",
    solution:
      "Studies show 80% of sales require five or more follow-ups, yet most businesses stop after one. Automated sequences ensure every lead, every customer, and every inquiry receives a timely, personalized response — always.",
  },
  {
    icon: Megaphone,
    problem: "Inconsistent Communication",
    solution:
      "Your brand voice and messaging stay consistent whether a customer contacts you at 2 PM on Monday or 2 AM on Sunday. Every automated touchpoint reflects your brand standards without variation.",
  },
  {
    icon: Clock,
    problem: "Wasted Time on Repetitive Tasks",
    solution:
      "Your skilled team members should focus on strategy, creativity, and relationship-building — not copying data between spreadsheets or sending the same email for the hundredth time. Automation reclaims those hours permanently.",
  },
];

const faqs = [
  {
    question: "How long does setup take?",
    answer:
      "Most automation setups are fully live within 2 to 3 business days. We handle the complete technical configuration, testing, and team training so you can start benefiting immediately without disrupting your current operations.",
  },
  {
    question: "Do I need any technical knowledge?",
    answer:
      "Absolutely not. We manage every aspect of the setup, integration, and ongoing maintenance. Our team handles all the technical complexity so you never need to write code, configure APIs, or troubleshoot software. You just tell us how you want your business to run.",
  },
  {
    question: "Which tools and platforms does it integrate with?",
    answer:
      "We integrate with WhatsApp Business, all major email platforms, popular CRM systems, payment gateways including Stripe, Razorpay, and PayPal, accounting software, Google Workspace, and over 200 additional applications. If you use it, we can almost certainly connect it.",
  },
  {
    question: "What happens if something breaks or stops working?",
    answer:
      "Our infrastructure includes 24/7 automated monitoring with instant alerts the moment any workflow deviates from expected behavior. Critical issues trigger immediate notifications to our support team who resolve problems often before you even notice them.",
  },
  {
    question: "Can I customize the workflows for my specific business?",
    answer:
      "Yes — every workflow is built specifically for your business requirements. You get unlimited customization as your needs evolve, add new tools, or launch new services. Nothing is locked into a one-size-fits-all template.",
  },
  {
    question: "What kind of return on investment can I expect?",
    answer:
      "Most clients see a positive ROI within their first 30 days. On average, our clients save 23 hours per week in labor and reduce operational errors by over 90%. At standard labor rates, that translates to roughly $1,200 or more per month back into your business.",
  },
];

export default function AutomationPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main className="pt-[104px]">
        {/* Hero Section */}
        <section className="bg-[var(--color-bg)] py-24 px-4 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-10 blur-3xl"
              style={{ background: "var(--color-gold)" }}
            />
          </div>
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.span variants={fadeUp} className="section-badge">
                Business Automation
              </motion.span>
              <motion.h1
                variants={fadeUp}
                className="mt-6 text-4xl md:text-6xl font-bold leading-tight"
                style={{ color: "var(--color-text)" }}
              >
                Automate Your Business,{" "}
                <span className="text-gold-gradient">Amplify Your Growth</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg md:text-xl max-w-3xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Save 20+ hours per week with intelligent workflow automation
                that runs your business 24/7. From lead capture to invoice
                generation, we automate the repetitive so you can focus on what
                truly moves the needle.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/contact" className="btn-gold">
                  Get Free Automation Audit
                </Link>
                <Link href="/pricing" className="btn-outline">
                  View Pricing
                </Link>
              </motion.div>

              {/* Hero Image */}
              <motion.div
                variants={fadeUp}
                className="mt-14 relative"
              >
                <div className="absolute inset-0 rounded-3xl blur-2xl opacity-20 scale-95" style={{ background: 'var(--color-gold)' }} />
                <Image
                  src="/images/automate-amplify.png"
                  alt="Automate Your Business, Amplify Your Growth"
                  width={1100}
                  height={620}
                  priority
                  className="relative rounded-3xl shadow-2xl w-full object-cover border border-white/10"
                  style={{ maxHeight: 520 }}
                />
              </motion.div>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  className="card text-center py-6 px-4"
                >
                  <p
                    className="text-3xl font-bold text-gold-gradient"
                  >
                    {stat.value}
                  </p>
                  <p
                    className="mt-1 text-sm font-medium"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-[var(--color-bg-secondary)] py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">
                Core Automations
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="mt-4 text-3xl md:text-4xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                Everything Your Business Needs, Running Automatically
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Our automation suite covers every critical business function —
                from marketing and sales to operations and customer service.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  className="card p-6 group hover:border-[var(--color-gold)] transition-colors duration-300"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(212,175,55,0.12)" }}
                  >
                    <feature.icon
                      size={24}
                      style={{ color: "var(--color-gold)" }}
                    />
                  </div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: "var(--color-text)" }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-[var(--color-bg)] py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">
                How It Works
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="mt-4 text-3xl md:text-4xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                Up and Running in 3 Simple Steps
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                We make getting started with automation effortless. No
                technical background required — our team does the heavy
                lifting from day one.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  variants={fadeUp}
                  className="relative text-center"
                >
                  {index < steps.length - 1 && (
                    <div
                      className="hidden md:block absolute top-10 left-full w-full h-px z-0"
                      style={{
                        background:
                          "linear-gradient(to right, var(--color-gold), transparent)",
                        width: "calc(100% - 2rem)",
                        left: "calc(50% + 2rem)",
                      }}
                    />
                  )}
                  <div className="relative z-10">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: "rgba(212,175,55,0.12)" }}
                    >
                      <step.icon
                        size={32}
                        style={{ color: "var(--color-gold)" }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold tracking-widest uppercase"
                      style={{ color: "var(--color-gold)" }}
                    >
                      Step {step.number}
                    </span>
                    <h3
                      className="mt-2 text-xl font-bold"
                      style={{ color: "var(--color-text)" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="mt-3 text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Industries Section */}
        <section className="bg-[var(--color-bg-secondary)] py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">
                Industries We Serve
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="mt-4 text-3xl md:text-4xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                Automation Tailored for Your Industry
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Every sector has unique workflows. We build automation specific
                to your industry's challenges and growth opportunities.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {industries.map((industry) => (
                <motion.div
                  key={industry.name}
                  variants={fadeUp}
                  className="card p-6 flex gap-4 items-start hover:border-[var(--color-gold)] transition-colors duration-300"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{ background: "rgba(212,175,55,0.12)" }}
                  >
                    <industry.icon
                      size={22}
                      style={{ color: "var(--color-gold)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="font-semibold mb-1"
                      style={{ color: "var(--color-text)" }}
                    >
                      {industry.name}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {industry.benefit}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Why Automate Section */}
        <section className="bg-[var(--color-bg)] py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">
                Why Automate
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="mt-4 text-3xl md:text-4xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                Stop Letting These Problems Cost You Money
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Every day you operate manually is a day you lose revenue, time,
                and competitive advantage. Automation eliminates these four
                critical pain points permanently.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {painPoints.map((item) => (
                <motion.div
                  key={item.problem}
                  variants={fadeUp}
                  className="card p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <item.icon
                      size={20}
                      style={{ color: "var(--color-gold)" }}
                    />
                    <h3
                      className="font-semibold text-lg"
                      style={{ color: "var(--color-text)" }}
                    >
                      {item.problem}
                    </h3>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {item.solution}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ROI Calculator Callout */}
        <section className="bg-[var(--color-bg-secondary)] py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="card p-8 text-center border-2"
              style={{ borderColor: "var(--color-gold)" }}
            >
              <span className="section-badge">ROI Calculator</span>
              <h2
                className="mt-4 text-2xl md:text-3xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                The Numbers Are Hard to Ignore
              </h2>
              <p
                className="mt-4 text-base md:text-lg leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                The average KVL client saves{" "}
                <span
                  className="font-bold"
                  style={{ color: "var(--color-gold)" }}
                >
                  23 hours per week
                </span>{" "}
                through our automation solutions. At a conservative labor rate
                of $12/hour, that translates to over{" "}
                <span
                  className="font-bold"
                  style={{ color: "var(--color-gold)" }}
                >
                  $1,200 per month
                </span>{" "}
                reclaimed — money that goes directly back into growing your
                business rather than maintaining inefficient manual processes.
                Many clients also report a significant reduction in costly human
                errors and faster customer response times that directly impact
                sales conversion rates.
              </p>
              <Link href="/contact" className="btn-gold mt-6 inline-block">
                Calculate My Savings
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="bg-[var(--color-bg)] py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="card p-8 text-center"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold"
                style={{
                  background: "rgba(212,175,55,0.15)",
                  color: "var(--color-gold)",
                }}
              >
                R
              </div>
              <blockquote
                className="text-lg md:text-xl font-medium leading-relaxed italic"
                style={{ color: "var(--color-text)" }}
              >
                "Our restaurant now gets online orders and WhatsApp order
                confirmations automatically without any staff involvement. The
                automation handles everything from order receipt to kitchen
                notification to customer confirmation. Our revenue is up 40%
                in just two months and we've actually reduced our staffing
                costs at the same time."
              </blockquote>
              <p
                className="mt-4 font-semibold"
                style={{ color: "var(--color-gold)" }}
              >
                Ramesh K.
              </p>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Restaurant Owner, Delhi
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing CTA */}
        <section className="bg-[var(--color-bg-secondary)] py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.span variants={fadeUp} className="section-badge">
                Transparent Pricing
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="mt-4 text-2xl md:text-3xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                Automation Packages Starting From{" "}
                <span className="text-gold-gradient">$299</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-base md:text-lg"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Every package includes complete setup, testing, team training,
                and 30-day post-launch support. No hidden fees, no surprise
                invoices. You know exactly what you are investing before you
                commit. Custom enterprise packages are available for larger
                organizations with more complex automation requirements.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="mt-6 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/pricing" className="btn-gold">
                  View All Packages
                </Link>
                <Link href="/contact" className="btn-outline">
                  Request Custom Quote
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-[var(--color-bg)] py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-12"
            >
              <motion.span variants={fadeUp} className="section-badge">
                FAQ
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="mt-4 text-3xl md:text-4xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                Frequently Asked Questions
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-lg"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Everything you need to know before getting started with
                business automation.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-4"
            >
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  className="card overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenFaq(openFaq === index ? null : index)
                    }
                    className="w-full flex items-center justify-between p-5 text-left"
                    aria-expanded={openFaq === index}
                  >
                    <span
                      className="font-semibold pr-4"
                      style={{ color: "var(--color-text)" }}
                    >
                      {faq.question}
                    </span>
                    {openFaq === index ? (
                      <ChevronUp
                        size={18}
                        className="flex-shrink-0"
                        style={{ color: "var(--color-gold)" }}
                      />
                    ) : (
                      <ChevronDown
                        size={18}
                        className="flex-shrink-0"
                        style={{ color: "var(--color-text-secondary)" }}
                      />
                    )}
                  </button>
                  {openFaq === index && (
                    <div
                      className="px-5 pb-5 text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          className="py-24 px-4"
          style={{ background: "var(--color-navy)" }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div
                variants={fadeUp}
                className="flex justify-center mb-6"
              >
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
                  style={{
                    background: "rgba(212,175,55,0.15)",
                    color: "var(--color-gold)",
                    border: "1px solid rgba(212,175,55,0.3)",
                  }}
                >
                  Get Started Today
                </span>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-5xl font-bold text-white leading-tight"
              >
                Ready to Put Your Business{" "}
                <span className="text-gold-gradient">on Autopilot?</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto"
              >
                Join over 500 businesses that have transformed their operations
                with KVL automation. Book your free audit today and discover
                exactly how much time and money you can reclaim starting this
                week.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
                  Get Free Automation Audit
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/pricing"
                  className="btn-outline inline-flex items-center gap-2"
                  style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}
                >
                  View Pricing
                </Link>
              </motion.div>
              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/60 text-sm"
              >
                {[
                  "No credit card required",
                  "Setup in 2-3 business days",
                  "expert support included",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle2
                      size={14}
                      style={{ color: "var(--color-gold)" }}
                    />
                    {item}
                  </span>
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
