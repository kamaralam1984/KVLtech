"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Star,
  Play,
  Mail,
  ChevronRight,
  Users,
  RefreshCw,
  Layers,
  Gift,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  Filter,
  Globe,
  Monitor,
  Megaphone,
  Bot,
  Zap,
  Code2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const filterTabs = [
  { label: "All", icon: <Layers size={15} /> },
  { label: "Getting Started", icon: <Star size={15} /> },
  { label: "Websites", icon: <Globe size={15} /> },
  { label: "Software", icon: <Monitor size={15} /> },
  { label: "Marketing", icon: <Megaphone size={15} /> },
  { label: "AI Tools", icon: <Bot size={15} /> },
  { label: "Advanced", icon: <Code2 size={15} /> },
];

const guides = [
  {
    category: "Getting Started",
    title: "Your First KVL TECH Project: From Purchase to Live in 24 Hours",
    description:
      "A complete walkthrough for brand-new customers. Activate your account, configure your first product, connect your domain, and go live — all within a single business day. No technical experience required.",
    readTime: "15 min read",
    difficulty: "Beginner",
    difficultyColor: "bg-green-500/20 text-green-400",
  },
  {
    category: "Websites",
    title: "Restaurant Website Complete Setup Guide: Menus, Orders, WhatsApp Integration",
    description:
      "Build a fully functional restaurant website with digital menus, an online ordering flow, table reservation forms, and direct WhatsApp ordering integration. Includes photo gallery and Google Maps embed.",
    readTime: "25 min read",
    difficulty: "Intermediate",
    difficultyColor: "bg-yellow-500/20 text-yellow-400",
  },
  {
    category: "Software",
    title: "School Management System: Complete Admin Manual for Principals",
    description:
      "Master the full School Management System: enrol students, create class schedules, manage teacher accounts, track attendance, generate progress reports, and communicate with parents — all from one dashboard.",
    readTime: "35 min read",
    difficulty: "Intermediate",
    difficultyColor: "bg-yellow-500/20 text-yellow-400",
  },
  {
    category: "Marketing",
    title: "The 30-Day SEO Checklist for Local Businesses",
    description:
      "A day-by-day action plan to dramatically improve your local search rankings. Covers Google Business Profile optimisation, on-page SEO, citation building, review generation, and monthly reporting routines.",
    readTime: "20 min read",
    difficulty: "Beginner",
    difficultyColor: "bg-green-500/20 text-green-400",
  },
  {
    category: "AI Tools",
    title: "Training Your AI Chatbot: Feed It, Test It, Launch It",
    description:
      "Learn how to upload your business knowledge base, write effective training prompts, handle edge cases, set escalation rules, and deploy your AI chatbot on your website and WhatsApp channel.",
    readTime: "18 min read",
    difficulty: "Intermediate",
    difficultyColor: "bg-yellow-500/20 text-yellow-400",
  },
  {
    category: "Marketing",
    title: "WhatsApp Marketing Automation: Send 1,000 Messages in 5 Minutes",
    description:
      "Set up broadcast lists, create message templates that pass WhatsApp approval, schedule campaigns, segment your audience by purchase history, and track open and reply rates — all without manual effort.",
    readTime: "12 min read",
    difficulty: "Beginner",
    difficultyColor: "bg-green-500/20 text-green-400",
  },
  {
    category: "Advanced",
    title: "API Integration Guide: Connect KVL TECH to Any Third-Party Tool",
    description:
      "Use the KVL TECH REST API to sync data with CRMs, payment gateways, accounting software, and custom applications. Includes authentication, webhook setup, rate limiting, and error-handling best practices.",
    readTime: "40 min read",
    difficulty: "Advanced",
    difficultyColor: "bg-red-500/20 text-red-400",
  },
  {
    category: "Websites",
    title: "SEO Optimisation: Get Your Website to Rank #1 in Your City",
    description:
      "A deep-dive into local SEO strategy specifically for KVL TECH websites. Covers schema markup, city-specific landing pages, Core Web Vitals, link-building outreach templates, and competitor analysis frameworks.",
    readTime: "30 min read",
    difficulty: "Intermediate",
    difficultyColor: "bg-yellow-500/20 text-yellow-400",
  },
  {
    category: "Software",
    title: "Hospital Management System: Doctor Portal and Patient Record Setup",
    description:
      "Configure doctor profiles, set appointment availability, enable digital prescriptions, manage patient records securely, set up billing workflows, and integrate lab reports — a full clinical operations walkthrough.",
    readTime: "28 min read",
    difficulty: "Intermediate",
    difficultyColor: "bg-yellow-500/20 text-yellow-400",
  },
];

const videoGuides = [
  { title: "Getting Started in 10 Minutes", duration: "10:24" },
  { title: "Complete Website Setup Walkthrough", duration: "22:15" },
  { title: "AI Chatbot Configuration", duration: "18:40" },
  { title: "Marketing Automation Setup", duration: "15:55" },
];

const faqs = [
  {
    question: "Are the guides completely free?",
    answer:
      "Yes — every guide on this page is 100% free forever. We believe that when you succeed with our products, we succeed as a company. You will never be asked to pay or create an account just to read a guide.",
  },
  {
    question: "Are the guides kept up to date?",
    answer:
      "Absolutely. Our product experts review and update guides every time a product feature changes. Each guide displays a 'last updated' date so you always know how fresh the content is. New guides are published every week.",
  },
  {
    question: "Are there video versions of the guides?",
    answer:
      "Most of our most popular guides have a companion video walkthrough. You can find the full video library at /videos. The video guides section on this page is a curated shortlist of the most-watched tutorials.",
  },
  {
    question: "In which languages are the guides available?",
    answer:
      "Guides are currently available in English, Hindi, and Arabic. We are actively working on additional languages and expect to add Swahili, French, and Urdu in the coming months. Check back regularly for updates.",
  },
  {
    question: "Can I download a guide as a PDF?",
    answer:
      "PDF downloads are coming very soon. We are building a one-click PDF export for every guide. Sign up to our weekly newsletter above and we will notify you the moment PDF downloads go live.",
  },
  {
    question: "Can I request a guide on a specific topic?",
    answer:
      "Absolutely — we build guides based on what our users actually need. Send your request to guides@kvlbusinesssolutions.com with the subject line 'Guide Request'. Our team reviews every email and prioritises the most-requested topics.",
  },
];

const categoryIcon: Record<string, React.ReactNode> = {
  "Getting Started": <Star size={12} />,
  Websites: <Globe size={12} />,
  Software: <Monitor size={12} />,
  Marketing: <Megaphone size={12} />,
  "AI Tools": <Bot size={12} />,
  Advanced: <Code2 size={12} />,
};

const categoryColor: Record<string, string> = {
  "Getting Started": "bg-blue-500/20 text-blue-400",
  Websites: "bg-purple-500/20 text-purple-400",
  Software: "bg-cyan-500/20 text-cyan-400",
  Marketing: "bg-orange-500/20 text-orange-400",
  "AI Tools": "bg-pink-500/20 text-pink-400",
  Advanced: "bg-red-500/20 text-red-400",
};

export default function GuidesPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");

  const filteredGuides =
    activeFilter === "All"
      ? guides
      : guides.filter((g) => g.category === activeFilter);

  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-[var(--color-bg)] py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[var(--color-gold)]/5 rounded-full blur-3xl" />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="section-badge inline-flex items-center gap-2 mb-6">
                <BookOpen size={14} />
                Guides &amp; Tutorials
              </span>
            </motion.div>
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Step-by-Step Guides to{" "}
              <span className="text-gold-gradient">Master Every KVL TECH Product</span>
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-[var(--color-text-secondary)] mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              From beginner setup to advanced automation — comprehensive guides written by our product experts so you can get the most out of every tool you own.
            </motion.p>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap justify-center gap-6 md:gap-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {[
                { icon: <BookOpen size={18} />, label: "60+ Guides" },
                { icon: <RefreshCw size={18} />, label: "Updated Weekly" },
                { icon: <Layers size={18} />, label: "Beginner to Advanced" },
                { icon: <Gift size={18} />, label: "Free Forever" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm font-medium"
                >
                  <span className="text-[var(--color-gold)]">{stat.icon}</span>
                  {stat.label}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Featured Guide */}
        <section className="bg-[var(--color-bg-secondary)] py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div
              className="card border-2 p-8 md:p-10 relative overflow-hidden"
              style={{ borderColor: "var(--color-gold)" }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-gold)]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="text-5xl">🚀</div>
                <div className="flex-1">
                  <p className="text-[var(--color-gold)] text-xs font-semibold uppercase tracking-widest mb-2">
                    Start Here — Featured Guide
                  </p>
                  <h2 className="text-xl md:text-2xl font-bold mb-3">
                    Complete Beginner's Guide to KVL TECH
                  </h2>
                  <p className="text-[var(--color-text-secondary)] mb-5">
                    Everything you need to know, packed into one 20-minute read. Account setup, full product overview, and a walkthrough of launching your very first project — step by step with screenshots.
                  </p>
                  <Link href="/guides/beginners-guide" className="btn-gold inline-flex items-center gap-2">
                    Read Guide <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filter Tabs + Guide Cards */}
        <section className="bg-[var(--color-bg)] py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="section-badge inline-flex items-center gap-2 mb-4">
                <Filter size={14} />
                Browse by Category
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">
                Find the Guide You Need
              </h2>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
              className="flex flex-wrap justify-center gap-3 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {filterTabs.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveFilter(tab.label)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                    activeFilter === tab.label
                      ? "border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/10"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]/50 hover:text-[var(--color-text)]"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </motion.div>

            {/* Guide Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide, index) => (
                <motion.div
                  key={guide.title}
                  className="card p-6 flex flex-col hover:border-[var(--color-gold)]/40 transition-all duration-300 group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.07 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        categoryColor[guide.category] || "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {categoryIcon[guide.category]}
                      {guide.category}
                    </span>
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${guide.difficultyColor}`}
                    >
                      {guide.difficulty}
                    </span>
                  </div>
                  <h3 className="text-base font-bold mb-3 leading-snug group-hover:text-[var(--color-gold)] transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed flex-1 mb-5">
                    {guide.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                      <Clock size={13} />
                      {guide.readTime}
                    </span>
                    <Link
                      href="#"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-gold)] hover:underline"
                    >
                      Read Guide <ChevronRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-[var(--color-text-secondary)] mb-4">
                Showing {filteredGuides.length} guides. More guides added every week.
              </p>
              <Link href="/guides/all" className="btn-outline inline-flex items-center gap-2">
                View All 60+ Guides <ChevronRight size={16} />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Video Guides */}
        <section className="bg-[var(--color-bg-secondary)] py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="section-badge inline-flex items-center gap-2 mb-4">
                <Play size={14} />
                Video Guides
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Watch, Learn, and Apply
              </h2>
              <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
                Prefer to learn by watching? Our screen-recorded video guides walk you through every step in real time. No fast-talking, no skipped steps — just clear, practical instruction.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {videoGuides.map((video, index) => (
                <motion.div
                  key={video.title}
                  className="card overflow-hidden group cursor-pointer hover:border-[var(--color-gold)]/40 transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Thumbnail Placeholder */}
                  <div className="relative bg-[var(--color-bg)] h-44 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/10 to-[var(--color-navy)]/20" />
                    <motion.div
                      className="relative z-10 w-14 h-14 rounded-full bg-[var(--color-gold)] flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Play size={22} className="text-black fill-black ml-1" />
                    </motion.div>
                    <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-semibold px-2 py-0.5 rounded">
                      {video.duration}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm leading-snug group-hover:text-[var(--color-gold)] transition-colors">
                      {video.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="text-center mt-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/videos" className="btn-primary inline-flex items-center gap-2">
                View Full Video Library <ChevronRight size={16} />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="bg-[var(--color-bg)] py-16 md:py-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-badge inline-flex items-center gap-2 mb-6">
                <Mail size={14} />
                Weekly Guides Newsletter
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Get New Guides Every Week
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-3 text-lg">
                Join <strong className="text-[var(--color-text)]">8,000+ subscribers</strong> who get a fresh, actionable guide delivered every Tuesday — free, no spam, unsubscribe any time.
              </p>
              <p className="text-[var(--color-text-secondary)] text-sm mb-8">
                Subscribers also get early access to new product launches, exclusive discount codes, and PDF downloads before they go public.
              </p>
              <form
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors text-sm"
                />
                <button type="submit" className="btn-gold whitespace-nowrap px-6">
                  Subscribe Free
                </button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Community Section */}
        <section className="bg-[var(--color-bg-secondary)] py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div
              className="card p-8 md:p-12 text-center border border-green-500/30 bg-green-500/5"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <MessageCircle size={28} className="text-green-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                You Are Not Learning Alone
              </h2>
              <p className="text-[var(--color-text-secondary)] text-lg mb-4 max-w-2xl mx-auto">
                Join <strong className="text-[var(--color-text)]">5,000+ KVL TECH users</strong> on our WhatsApp Community. Ask questions, share screenshots, get answers from real business owners who have already solved the same problems you are facing today.
              </p>
              <p className="text-[var(--color-text-secondary)] text-sm mb-8">
                Our community is active 24/7. Whether you are setting up your first website or building advanced automations, there is always someone ready to help. Our product experts also join weekly Q&amp;A sessions inside the group.
              </p>
              <Link
                href="https://wa.me/join-community"
                className="btn-primary inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 border-green-600"
              >
                <MessageCircle size={18} />
                Join the WhatsApp Community
              </Link>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-[var(--color-bg)] py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="section-badge inline-flex items-center gap-2 mb-4">
                <HelpCircle size={14} />
                Frequently Asked Questions
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Questions About Our Guides
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                Everything you need to know about how our guides work, what is available, and how to get the most out of them.
              </p>
            </motion.div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  className="card overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.07 }}
                >
                  <button
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--color-bg-secondary)] transition-colors"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-semibold pr-4">{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={`flex-shrink-0 text-[var(--color-gold)] transition-transform duration-200 ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-5 pb-5 text-[var(--color-text-secondary)] text-sm leading-relaxed border-t border-[var(--color-border)]">
                      <p className="pt-4">{faq.answer}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-[var(--color-bg-secondary)] py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-badge inline-flex items-center gap-2 mb-6">
                <Zap size={14} />
                Ready to Get Started?
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pick a Guide and Take Action Today
              </h2>
              <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-2xl mx-auto">
                Every guide is designed with one goal — to get you results faster. Stop guessing. Start with our beginner guide, follow the steps, and have your first project live within 24 hours.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/guides/beginners-guide" className="btn-gold inline-flex items-center gap-2">
                  Start With Beginner Guide <ChevronRight size={16} />
                </Link>
                <Link href="/products" className="btn-outline inline-flex items-center gap-2">
                  Browse Products <ChevronRight size={16} />
                </Link>
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
