"use client";

import { motion } from "framer-motion";
import {
  Bot,
  Brain,
  BarChart3,
  FileText,
  Headphones,
  Mic,
  Database,
  Cpu,
  Rocket,
  TrendingUp,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Utensils,
  GraduationCap,
  Heart,
  Building2,
  Zap,
  Star,
  DollarSign,
  MessageCircle,
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const aiProducts = [
  {
    icon: Bot,
    title: "AI Chatbot (Kaviya)",
    description:
      "Like our own Kaviya assistant, your branded AI chatbot answers customer questions instantly, qualifies incoming leads, and books appointments around the clock — without a single human agent required.",
    highlight: "Handles 90% of queries automatically",
  },
  {
    icon: Brain,
    title: "Smart Lead Scoring",
    description:
      "Our AI analyzes behavioral signals, purchase history, and engagement patterns to rank every lead by purchase intent. Your sales team focuses exclusively on hot prospects who are ready to buy, not time-wasters.",
    highlight: "3x higher conversion rates",
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description:
      "Stop reacting and start predicting. Our AI forecasts your sales pipeline, inventory requirements, and customer churn probability weeks in advance — giving you time to act before problems become crises.",
    highlight: "Predict churn 30 days early",
  },
  {
    icon: FileText,
    title: "AI Content Generator",
    description:
      "Generate compelling product descriptions, SEO-optimized blog articles, and engaging social media posts in seconds. Our AI writes in your brand voice, saving your team hundreds of hours every month.",
    highlight: "10x faster content production",
  },
  {
    icon: Headphones,
    title: "Automated Support Tickets",
    description:
      "AI reads every incoming support ticket, resolves the 70% that have standard answers immediately, and intelligently escalates complex issues to the right human agent — complete with full conversation context.",
    highlight: "Resolves 70% of tickets instantly",
  },
  {
    icon: Mic,
    title: "Voice Assistant Integration",
    description:
      "Your customers send WhatsApp voice messages — our AI reads them, understands intent, and sends a personalized automated response. No more missed voice messages, no more manual listening.",
    highlight: "Works with WhatsApp voice notes",
  },
];

const howItLearnSteps = [
  {
    step: "01",
    icon: Database,
    title: "Feed Your Data",
    description:
      "Upload your product catalog, FAQs, pricing sheets, and business policies. The more information you provide, the smarter your AI becomes from day one. Our onboarding team guides you through every step.",
  },
  {
    step: "02",
    icon: Cpu,
    title: "Train the Model",
    description:
      "Our AI engine processes your business data and learns your unique context, terminology, and customer patterns within 24 hours. We fine-tune accuracy across all your product categories and service areas.",
  },
  {
    step: "03",
    icon: Rocket,
    title: "Deploy & Improve",
    description:
      "Your AI goes live on your website, WhatsApp, and support channels. With every conversation it has, it gets smarter — learning from real interactions and continuously improving its accuracy and helpfulness.",
  },
];

const roiStats = [
  { icon: TrendingUp, value: "60%", label: "Reduction in support costs" },
  { icon: Clock, value: "24/7", label: "Lead capture, never miss a prospect" },
  { icon: Zap, value: "3x", label: "Faster customer onboarding" },
  { icon: Star, value: "90%", label: "Customer satisfaction rate" },
];

const industryApplications = [
  {
    icon: Utensils,
    industry: "Restaurant AI",
    description:
      "Takes online orders via chat, handles table reservations, sends order updates, manages menu queries, and upsells specials — all without bothering your front-of-house staff.",
    useCases: ["Order taking via chat", "Table reservations", "Menu questions", "Special promotions"],
  },
  {
    icon: GraduationCap,
    industry: "School & Education AI",
    description:
      "Answers parent queries about admissions, fee structures, and school events. Sends automated fee payment reminders and exam schedule updates to thousands of parents simultaneously.",
    useCases: ["Admissions queries", "Fee reminders", "Exam schedules", "Event notifications"],
  },
  {
    icon: Heart,
    industry: "Hospital & Clinic AI",
    description:
      "Manages appointment booking 24/7, provides a basic symptom checker, shares post-visit care instructions, and sends medication reminders — reducing front-desk load dramatically.",
    useCases: ["Appointment booking", "Symptom checker", "Care instructions", "Medication reminders"],
  },
  {
    icon: Building2,
    industry: "Real Estate AI",
    description:
      "Matches buyers with properties based on their preferences, schedules virtual tour appointments, answers property queries, and qualifies buyer budget and timeline before passing to an agent.",
    useCases: ["Property matching", "Virtual tour scheduling", "Price negotiations", "Buyer qualification"],
  },
];

const pricingPlans = [
  {
    name: "AI Starter",
    price: "$199",
    period: "/month",
    description: "Perfect for small businesses ready to automate their first customer touchpoint.",
    features: [
      "AI Chatbot for website & WhatsApp",
      "Up to 1,000 conversations/month",
      "Basic lead scoring",
      "English + 2 additional languages",
      "Email support",
      "14-day free trial",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "AI Professional",
    price: "$399",
    period: "/month",
    description: "For growing businesses that need the full power of AI across every channel.",
    features: [
      "Everything in AI Starter",
      "Up to 10,000 conversations/month",
      "Advanced lead scoring & analytics",
      "Predictive analytics dashboard",
      "AI content generator (50 pieces/month)",
      "Automated support ticketing",
      "Voice message integration",
      "10+ languages supported",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "AI Enterprise",
    price: "Custom",
    period: "pricing",
    description: "Fully bespoke AI solutions for large organizations and enterprise clients.",
    features: [
      "Everything in AI Professional",
      "Unlimited conversations",
      "Custom AI model training",
      "Full API access & integrations",
      "Dedicated AI success manager",
      "SLA guarantees",
      "On-premise deployment option",
      "All 20+ languages",
      "24/7 dedicated support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "How accurate is the AI?",
    answer:
      "After a 2-week training period using your business data, our AI achieves approximately 95% accuracy on customer queries. Accuracy improves continuously as the AI handles more real conversations. For the 5% it cannot resolve confidently, it performs a seamless handoff to a human agent.",
  },
  {
    question: "How long does setup take?",
    answer:
      "Most businesses are live within 24 to 48 hours. Our onboarding team handles the technical setup entirely. You only need to provide your business data — product lists, FAQs, pricing — and we handle everything from model training to deployment across your channels.",
  },
  {
    question: "What languages does the AI support?",
    answer:
      "Our AI supports English, Hindi, Arabic, Spanish, and 20+ additional languages out of the box. Multilingual support is especially important for businesses serving diverse regional markets. You can set a default language per channel or let the AI auto-detect the customer's language.",
  },
  {
    question: "Can the AI handle payments?",
    answer:
      "Yes. Our AI Professional and Enterprise plans include integrated payment collection. The AI can send payment links, process orders, confirm transactions, and issue digital receipts — all within the same conversation flow on WhatsApp or your website chat.",
  },
  {
    question: "Is my business data private and secure?",
    answer:
      "Absolutely. All data is encrypted at rest and in transit using AES-256 encryption. We are fully GDPR compliant and never share your business data or customer conversations with third parties. Your AI model is isolated to your account and cannot be accessed by other clients.",
  },
  {
    question: "What happens when the AI cannot answer a question?",
    answer:
      "The AI performs a seamless human handoff with full context. The human agent receives the entire conversation history, the AI's confidence score, and a summary of what the customer needs — so they can resolve it without asking the customer to repeat themselves.",
  },
];

export default function AISolutionsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main className="pt-[104px]">

        {/* Hero Section */}
        <section className="bg-[var(--color-bg)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, var(--color-gold) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--color-navy) 0%, transparent 50%)",
              }}
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="flex justify-center mb-6">
                <span className="section-badge">AI Solutions</span>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
                style={{ color: "var(--color-text)" }}
              >
                AI-Powered Tools That{" "}
                <span className="text-gold-gradient">Work While You Sleep</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-xl md:text-2xl mb-10 leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Intelligent automation that understands your customers, answers their questions, and converts them into
                buyers — 24/7. No staff required. No missed opportunities.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                <Link href="/contact" className="btn-gold">
                  Start Free 14-Day Trial
                  <ArrowRight className="inline ml-2 w-5 h-5" />
                </Link>
                <Link href="#how-it-works" className="btn-outline">
                  See How It Works
                </Link>
              </motion.div>

              {/* Hero Image */}
              <motion.div variants={fadeUp} className="relative mb-16">
                <div
                  className="absolute inset-0 rounded-3xl blur-2xl opacity-20 scale-95"
                  style={{ background: "var(--color-gold)" }}
                />
                <Image
                  src="/images/ai-powered-tools.png"
                  alt="AI-Powered Tools That Work While You Sleep"
                  width={1100}
                  height={620}
                  priority
                  className="relative rounded-3xl shadow-2xl w-full object-cover border border-[var(--color-border)]"
                  style={{ maxHeight: 520 }}
                />
              </motion.div>

              {/* Stats Bar */}
              <motion.div
                variants={stagger}
                className="grid grid-cols-2 md:grid-cols-4 gap-6"
              >
                {[
                  { value: "24/7", label: "Availability" },
                  { value: "90%", label: "Query Resolution" },
                  { value: "5x", label: "Faster Response" },
                  { value: "1,200+", label: "Businesses Using AI" },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={fadeUp}
                    className="card text-center py-6"
                  >
                    <div
                      className="text-3xl font-bold mb-1 text-gold-gradient"
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* AI Products Section */}
        <section className="bg-[var(--color-bg-secondary)] py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span variants={fadeUp} className="section-badge mb-4 inline-block">
                Our AI Product Suite
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-5xl font-bold mb-6"
                style={{ color: "var(--color-text)" }}
              >
                Six AI Tools. One Unified Platform.
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg max-w-3xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Each tool is designed to solve a specific business challenge. Together, they create an intelligent
                business ecosystem that works continuously — generating leads, serving customers, and driving growth
                around the clock.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {aiProducts.map((product) => (
                <motion.div
                  key={product.title}
                  variants={fadeUp}
                  className="card p-8 flex flex-col gap-4 group hover:border-[var(--color-gold)] transition-all duration-300"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "var(--color-gold)", opacity: 0.15 }}
                  >
                    <product.icon
                      className="w-7 h-7"
                      style={{ color: "var(--color-gold)" }}
                    />
                  </div>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center -mt-14 ml-0"
                    style={{ color: "var(--color-gold)" }}
                  >
                    <product.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
                    {product.title}
                  </h3>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--color-text-secondary)" }}>
                    {product.description}
                  </p>
                  <div
                    className="flex items-center gap-2 text-sm font-semibold"
                    style={{ color: "var(--color-gold)" }}
                  >
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    {product.highlight}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How AI Learns Section */}
        <section id="how-it-works" className="bg-[var(--color-bg)] py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span variants={fadeUp} className="section-badge mb-4 inline-block">
                How It Works
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-5xl font-bold mb-6"
                style={{ color: "var(--color-text)" }}
              >
                Your AI Learns Your Business in{" "}
                <span className="text-gold-gradient">24 Hours</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg max-w-3xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                We have made the onboarding process as simple as possible. In three straightforward steps, your
                business has a fully trained AI assistant deployed across every customer channel.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {howItLearnSteps.map((step, idx) => (
                <motion.div
                  key={step.step}
                  variants={fadeUp}
                  className="relative text-center"
                >
                  {idx < howItLearnSteps.length - 1 && (
                    <div
                      className="hidden md:block absolute top-10 left-full w-full h-0.5 -translate-y-1/2 z-0"
                      style={{ backgroundColor: "var(--color-border)" }}
                    />
                  )}
                  <div className="card p-8 relative z-10">
                    <div
                      className="text-5xl font-black mb-4 text-gold-gradient"
                    >
                      {step.step}
                    </div>
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                      style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 15%, transparent)" }}
                    >
                      <step.icon className="w-8 h-8" style={{ color: "var(--color-gold)" }} />
                    </div>
                    <h3 className="text-xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Demo Callout Section */}
        <section className="bg-[var(--color-bg-secondary)] py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="card p-10 text-center border-2"
              style={{ borderColor: "var(--color-gold)" }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div className="flex justify-center mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 20%, transparent)" }}
                >
                  <MessageCircle className="w-8 h-8" style={{ color: "var(--color-gold)" }} />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
                Try Kaviya — Our AI Consultant Is Live Right Now
              </h2>
              <p className="text-lg mb-6" style={{ color: "var(--color-text-secondary)" }}>
                Our AI assistant is live on this page right now in the bottom right corner. Ask her anything about
                our AI solutions, pricing, implementation timelines, or how AI could specifically help your business.
                That is exactly the experience your customers will have — powered by your own branded AI.
              </p>
              <div
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full font-semibold text-sm"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--color-gold) 15%, transparent)",
                  color: "var(--color-gold)",
                  border: "1px solid var(--color-gold)",
                }}
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Kaviya is online — chat available bottom right
              </div>
            </motion.div>
          </div>
        </section>

        {/* ROI of AI Section */}
        <section className="bg-[var(--color-bg)] py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span variants={fadeUp} className="section-badge mb-4 inline-block">
                Return on Investment
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-5xl font-bold mb-6"
                style={{ color: "var(--color-text)" }}
              >
                The Numbers Speak for Themselves
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg max-w-3xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Businesses that implement our AI solutions consistently report dramatic improvements across every
                key performance metric — from cost reduction to customer satisfaction. Here are the results our
                clients experience within the first 90 days.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {roiStats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  className="card p-8 text-center"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 15%, transparent)" }}
                  >
                    <stat.icon className="w-7 h-7" style={{ color: "var(--color-gold)" }} />
                  </div>
                  <div className="text-4xl font-black mb-2 text-gold-gradient">{stat.value}</div>
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Industry Applications Section */}
        <section className="bg-[var(--color-bg-secondary)] py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span variants={fadeUp} className="section-badge mb-4 inline-block">
                Industry Solutions
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-5xl font-bold mb-6"
                style={{ color: "var(--color-text)" }}
              >
                AI Tailored to Your Industry
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg max-w-3xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Generic AI does not cut it. We train your AI on industry-specific knowledge and workflows so it
                understands your customers the way an experienced human employee would — from day one.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {industryApplications.map((app) => (
                <motion.div
                  key={app.industry}
                  variants={fadeUp}
                  className="card p-8"
                >
                  <div className="flex items-start gap-5">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 15%, transparent)" }}
                    >
                      <app.icon className="w-7 h-7" style={{ color: "var(--color-gold)" }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
                        {app.industry}
                      </h3>
                      <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
                        {app.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {app.useCases.map((useCase) => (
                          <span
                            key={useCase}
                            className="text-xs px-3 py-1 rounded-full font-medium"
                            style={{
                              backgroundColor: "color-mix(in srgb, var(--color-gold) 10%, transparent)",
                              color: "var(--color-gold)",
                              border: "1px solid color-mix(in srgb, var(--color-gold) 30%, transparent)",
                            }}
                          >
                            {useCase}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-[var(--color-bg)] py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span variants={fadeUp} className="section-badge mb-4 inline-block">
                Pricing Plans
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-5xl font-bold mb-6"
                style={{ color: "var(--color-text)" }}
              >
                Simple, Transparent AI Pricing
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg max-w-3xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                All plans include a 14-day free trial with no credit card required. If the AI does not deliver
                measurable value in two weeks, you pay nothing. That is how confident we are.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {pricingPlans.map((plan) => (
                <motion.div
                  key={plan.name}
                  variants={fadeUp}
                  className={`card p-8 flex flex-col relative ${
                    plan.highlighted ? "border-2" : ""
                  }`}
                  style={
                    plan.highlighted
                      ? { borderColor: "var(--color-gold)" }
                      : {}
                  }
                >
                  {plan.highlighted && (
                    <div
                      className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                      style={{
                        backgroundColor: "var(--color-gold)",
                        color: "var(--color-navy)",
                      }}
                    >
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
                    {plan.name}
                  </h3>
                  <div className="flex items-end gap-1 mb-3">
                    <span className="text-4xl font-black text-gold-gradient">{plan.price}</span>
                    <span className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                    {plan.description}
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <CheckCircle
                          className="w-4 h-4 flex-shrink-0 mt-0.5"
                          style={{ color: "var(--color-gold)" }}
                        />
                        <span style={{ color: "var(--color-text-secondary)" }}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={plan.highlighted ? "btn-gold text-center" : "btn-outline text-center"}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              className="text-center mt-8 text-sm"
              style={{ color: "var(--color-text-secondary)" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              All prices in USD. Billed monthly. Annual billing available with 2 months free. Cancel anytime.
            </motion.p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-[var(--color-bg-secondary)] py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span variants={fadeUp} className="section-badge mb-4 inline-block">
                Frequently Asked Questions
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-5xl font-bold mb-6"
                style={{ color: "var(--color-text)" }}
              >
                Everything You Need to Know About Our AI
              </motion.h2>
            </motion.div>

            <motion.div
              className="space-y-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className="card overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between p-6 text-left"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    <span className="font-semibold pr-4" style={{ color: "var(--color-text)" }}>
                      {faq.question}
                    </span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: "var(--color-gold)" }} />
                    ) : (
                      <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: "var(--color-gold)" }} />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-6">
                      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[var(--color-bg)] py-20 md:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="card p-12 md:p-16 text-center"
              style={{ borderColor: "var(--color-gold)", border: "1px solid" }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="flex justify-center mb-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 15%, transparent)" }}
                >
                  <Rocket className="w-10 h-10" style={{ color: "var(--color-gold)" }} />
                </div>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-5xl font-bold mb-6"
                style={{ color: "var(--color-text)" }}
              >
                Start Your AI Journey Today
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-xl mb-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Free 14-Day Trial — No Credit Card Required
              </motion.p>
              <motion.p
                variants={fadeUp}
                className="text-base mb-10 max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Join over 1,200 businesses that have already automated their customer engagement with KVL AI.
                Set up takes less than 48 hours and our team handles everything technical. You just provide the
                business knowledge — we build the intelligence around it.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              >
                <Link href="/contact" className="btn-gold">
                  Get Started Free — No Credit Card
                  <ArrowRight className="inline ml-2 w-5 h-5" />
                </Link>
                <Link href="/contact" className="btn-outline">
                  Book a Demo Call
                </Link>
              </motion.div>
              <motion.div
                variants={fadeUp}
                className="flex flex-wrap justify-center gap-6 text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {[
                  "14-day free trial",
                  "No credit card needed",
                  "Live in 48 hours",
                  "Cancel anytime",
                  "GDPR compliant",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--color-gold)" }} />
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
