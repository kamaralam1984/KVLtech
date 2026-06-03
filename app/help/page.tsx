"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Package,
  CreditCard,
  Wrench,
  Plug,
  Code2,
  ArrowRight,
  Play,
  MessageCircle,
  Mail,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  FileText,
  Video,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { useState } from "react";

const CATEGORIES = [
  {
    icon: BookOpen,
    title: "Getting Started",
    count: 18,
    desc: "First steps, account setup, onboarding guides",
    color: "#C9A227",
  },
  {
    icon: Package,
    title: "Products & Features",
    count: 52,
    desc: "Detailed guides for all products",
    color: "#0891B2",
  },
  {
    icon: CreditCard,
    title: "Account & Billing",
    count: 24,
    desc: "Payments, invoices, plan changes, refunds",
    color: "#16A34A",
  },
  {
    icon: Wrench,
    title: "Technical Support",
    count: 38,
    desc: "Errors, bugs, troubleshooting, performance",
    color: "#EF4444",
  },
  {
    icon: Plug,
    title: "Integrations",
    count: 28,
    desc: "WhatsApp, payment gateways, third-party tools",
    color: "#7C3AED",
  },
  {
    icon: Code2,
    title: "Developer API",
    count: 16,
    desc: "REST API, webhooks, SDK documentation",
    color: "#0F172A",
  },
];

const POPULAR_ARTICLES = [
  "How to set up your restaurant website",
  "Connecting WhatsApp to your account",
  "Adding team members and setting permissions",
  "How to process a refund",
  "Customizing your branding and colors",
  "Setting up payment gateway",
  "Exporting reports and data",
  "Resetting your admin password",
];

const VIDEOS = [
  {
    title: "Getting Started in 10 Minutes",
    duration: "10:24",
    desc: "A complete walkthrough to get your KVL TECH account up and running from scratch.",
  },
  {
    title: "Complete Website Setup",
    duration: "18:05",
    desc: "Configure your restaurant or business website with custom branding, menus, and pages.",
  },
  {
    title: "WhatsApp Bot Configuration",
    duration: "12:47",
    desc: "Set up automated WhatsApp replies, lead capture flows, and notification triggers.",
  },
  {
    title: "Marketing Automation Setup",
    duration: "15:33",
    desc: "Build automated campaigns, drip sequences, and customer re-engagement workflows.",
  },
];

const SUPPORT_CHANNELS = [
  {
    icon: MessageCircle,
    title: "WhatsApp Chat",
    desc: "Get instant help from our support team. We reply within 2 minutes during active hours and have agents available around the clock.",
    cta: "Chat on WhatsApp",
    badge: "Fastest",
    badgeColor: "#16A34A",
    href: "https://wa.me/919310726473",
  },
  {
    icon: Mail,
    title: "Email Support",
    desc: "Send us a detailed description of your issue with screenshots or files. Our technical team replies within 4 hours with a comprehensive solution.",
    cta: "Send an Email",
    badge: "Detailed",
    badgeColor: "#0891B2",
    href: "mailto:support@kvlbusinesssolutions.com",
  },
  {
    icon: Calendar,
    title: "Schedule a Call",
    desc: "Book a dedicated 30-minute session with a KVL TECH specialist. We will walk through your issue live and ensure everything is resolved before ending the call.",
    cta: "Book a Session",
    badge: "In-Depth",
    badgeColor: "#C9A227",
    href: "/contact",
  },
];

const FAQS = [
  {
    q: "How fast do you respond to support requests?",
    a: "Response times vary by channel. WhatsApp chat is the fastest at under 2 minutes for active conversations. Email support is handled within 4 hours for all tickets. Phone support is available during business hours, Monday through Saturday, 9AM to 7PM IST. For critical or priority issues, we escalate and respond within 1 hour regardless of channel.",
  },
  {
    q: "Are your support channels available 24/7?",
    a: "Yes — WhatsApp chat and email support operate 24 hours a day, 7 days a week, including weekends and public holidays. Our AI-assisted triage ensures your message is routed to the right team immediately. Phone support is available Monday through Saturday from 9AM to 7PM IST. If you need help outside phone hours, WhatsApp or email will always get you a response.",
  },
  {
    q: "Can I screen-share my screen for live help?",
    a: "Absolutely. For complex issues that are difficult to describe over chat or email, we offer live screen-sharing sessions via Google Meet. Simply request a screen-share session in your WhatsApp conversation or email ticket, and we will send you a Google Meet link within minutes. Our specialists can observe your screen and guide you step by step.",
  },
  {
    q: "Is there a ticketing system to track my issues?",
    a: "Yes, KVL TECH has a full ticketing system where every support request is logged with a unique ticket number. You can view the status of all your open and resolved tickets, add comments, and upload files at any time by visiting /support in your client portal. You will also receive email notifications whenever your ticket status changes or a reply is added.",
  },
  {
    q: "What if my issue is critical and needs immediate attention?",
    a: "When raising a ticket via email or the support portal, you can mark the priority as 'Critical' or 'Priority'. Our team monitors the priority queue separately and guarantees a response within 1 hour. For production outages or revenue-impacting issues, we also offer a dedicated emergency WhatsApp line available to all active subscribers. Details are in your welcome email.",
  },
  {
    q: "Do you have community forums or a user community?",
    a: "A full community forum is currently in development and coming soon. It will feature peer-to-peer support, shared templates, integration tips, and direct Q&A with the KVL TECH product team. To be among the first to access it, you can join the waitlist today. Early access members will receive exclusive onboarding resources and bonus credits.",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="card cursor-pointer"
      style={{ padding: "1.5rem", marginBottom: "0.75rem" }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between gap-4">
        <p style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "1rem" }}>{q}</p>
        {open ? (
          <ChevronUp size={20} style={{ color: "var(--color-gold)", flexShrink: 0 }} />
        ) : (
          <ChevronDown size={20} style={{ color: "var(--color-gold)", flexShrink: 0 }} />
        )}
      </div>
      {open && (
        <p
          style={{
            marginTop: "1rem",
            color: "var(--color-text-secondary)",
            lineHeight: "1.75",
            fontSize: "0.95rem",
          }}
        >
          {a}
        </p>
      )}
    </div>
  );
}

export default function HelpCenterPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section
          className="bg-[var(--color-bg)]"
          style={{ padding: "5rem 1.5rem 4rem" }}
        >
          <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={fadeInUp}>
                <span className="section-badge">Help Center</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.25rem)",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  marginTop: "1rem",
                  marginBottom: "1rem",
                  lineHeight: 1.2,
                }}
              >
                How Can We{" "}
                <span className="text-gold-gradient">Help You Today?</span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                style={{
                  fontSize: "1.15rem",
                  color: "var(--color-text-secondary)",
                  marginBottom: "2.5rem",
                  maxWidth: "600px",
                  margin: "0 auto 2.5rem",
                  lineHeight: 1.7,
                }}
              >
                Find answers, tutorials, and support resources for all KVL TECH products
                and services. Everything you need is right here — no waiting, no friction.
              </motion.p>

              {/* Search Bar */}
              <motion.div
                variants={fadeInUp}
                style={{ position: "relative", maxWidth: "640px", margin: "0 auto" }}
              >
                <Search
                  size={22}
                  style={{
                    position: "absolute",
                    left: "1.25rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-text-secondary)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search 200+ articles..."
                  readOnly
                  style={{
                    width: "100%",
                    padding: "1rem 1.25rem 1rem 3.5rem",
                    fontSize: "1.05rem",
                    border: "2px solid var(--color-border)",
                    borderRadius: "0.75rem",
                    backgroundColor: "var(--color-bg-secondary)",
                    color: "var(--color-text)",
                    outline: "none",
                    cursor: "text",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  className="btn-gold"
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    padding: "0.5rem 1.25rem",
                    fontSize: "0.9rem",
                  }}
                >
                  Search
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Quick Stats */}
        <section
          className="bg-[var(--color-bg-secondary)]"
          style={{ padding: "3rem 1.5rem" }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1.5rem",
                textAlign: "center",
              }}
            >
              {[
                { icon: FileText, value: "200+", label: "Help Articles" },
                { icon: Video, value: "50+", label: "Video Tutorials" },
                { icon: Clock, value: "2-Min", label: "Average Resolution" },
                { icon: Users, value: "98%", label: "Issues Solved Self-Service" },
              ].map((stat) => (
                <motion.div key={stat.label} variants={fadeInUp} className="card" style={{ padding: "1.75rem 1rem" }}>
                  <stat.icon size={28} style={{ color: "var(--color-gold)", margin: "0 auto 0.75rem" }} />
                  <div
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: 800,
                      color: "var(--color-text)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Category Cards */}
        <section className="bg-[var(--color-bg)]" style={{ padding: "5rem 1.5rem" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              style={{ textAlign: "center", marginBottom: "3rem" }}
            >
              <span className="section-badge">Browse by Category</span>
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  marginTop: "1rem",
                }}
              >
                Find Answers Fast
              </h2>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginTop: "0.75rem",
                  maxWidth: "550px",
                  margin: "0.75rem auto 0",
                  lineHeight: 1.7,
                }}
              >
                Browse our organized knowledge base covering every aspect of KVL TECH
                products, billing, integrations, and developer resources.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {CATEGORIES.map((cat) => (
                <motion.div
                  key={cat.title}
                  variants={fadeInUp}
                  className="card"
                  style={{ padding: "2rem", cursor: "pointer" }}
                  whileHover={{ y: -4 }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                    <div
                      style={{
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "0.75rem",
                        backgroundColor: cat.color + "20",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <cat.icon size={22} style={{ color: cat.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "0.4rem",
                        }}
                      >
                        <h3
                          style={{
                            fontWeight: 700,
                            fontSize: "1.05rem",
                            color: "var(--color-text)",
                          }}
                        >
                          {cat.title}
                        </h3>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: cat.color,
                            backgroundColor: cat.color + "15",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "999px",
                          }}
                        >
                          {cat.count} articles
                        </span>
                      </div>
                      <p
                        style={{
                          color: "var(--color-text-secondary)",
                          fontSize: "0.9rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {cat.desc}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: "1.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      color: "var(--color-gold)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    Browse articles <ArrowRight size={15} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Popular Articles */}
        <section
          className="bg-[var(--color-bg-secondary)]"
          style={{ padding: "5rem 1.5rem" }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              style={{ textAlign: "center", marginBottom: "3rem" }}
            >
              <span className="section-badge">Most Helpful</span>
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  marginTop: "1rem",
                }}
              >
                Popular Articles
              </h2>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginTop: "0.75rem",
                  maxWidth: "520px",
                  margin: "0.75rem auto 0",
                  lineHeight: 1.7,
                }}
              >
                The most-read help articles used by thousands of KVL TECH customers
                every week. These cover the most common questions and tasks.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {POPULAR_ARTICLES.map((article, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <Link
                    href="/help"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1.1rem 1.5rem",
                      borderRadius: "0.75rem",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-bg)",
                      textDecoration: "none",
                      gap: "1rem",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--color-text)",
                        fontWeight: 500,
                        fontSize: "0.95rem",
                      }}
                    >
                      {article}
                    </span>
                    <ArrowRight
                      size={17}
                      style={{ color: "var(--color-gold)", flexShrink: 0 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Video Tutorials */}
        <section className="bg-[var(--color-bg)]" style={{ padding: "5rem 1.5rem" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              style={{ textAlign: "center", marginBottom: "3rem" }}
            >
              <span className="section-badge">Video Guides</span>
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  marginTop: "1rem",
                }}
              >
                Learn by Watching
              </h2>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginTop: "0.75rem",
                  maxWidth: "540px",
                  margin: "0.75rem auto 0",
                  lineHeight: 1.7,
                }}
              >
                Our step-by-step video tutorials make it easy to master KVL TECH
                features at your own pace. No technical background required.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {VIDEOS.map((video) => (
                <motion.div
                  key={video.title}
                  variants={fadeInUp}
                  className="card"
                  style={{ padding: "0", overflow: "hidden", cursor: "pointer" }}
                  whileHover={{ y: -4 }}
                >
                  <div
                    style={{
                      backgroundColor: "var(--color-navy)",
                      height: "160px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-gold)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Play size={22} fill="white" style={{ color: "white", marginLeft: "3px" }} />
                    </div>
                    <span
                      style={{
                        position: "absolute",
                        bottom: "0.75rem",
                        right: "0.75rem",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        color: "white",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        padding: "0.2rem 0.6rem",
                        borderRadius: "0.4rem",
                      }}
                    >
                      {video.duration}
                    </span>
                  </div>
                  <div style={{ padding: "1.25rem" }}>
                    <h3
                      style={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "var(--color-text)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {video.title}
                    </h3>
                    <p
                      style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "0.875rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {video.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Still Need Help */}
        <section
          className="bg-[var(--color-bg-secondary)]"
          style={{ padding: "5rem 1.5rem" }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              style={{ textAlign: "center", marginBottom: "3rem" }}
            >
              <span className="section-badge">Direct Support</span>
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  marginTop: "1rem",
                }}
              >
                Still Need Help?
              </h2>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginTop: "0.75rem",
                  maxWidth: "520px",
                  margin: "0.75rem auto 0",
                  lineHeight: 1.7,
                }}
              >
                Our real human support team is here for you. Choose the channel that
                works best and we will take care of the rest — fast, friendly, and thorough.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {SUPPORT_CHANNELS.map((ch) => (
                <motion.div
                  key={ch.title}
                  variants={fadeInUp}
                  className="card"
                  style={{ padding: "2rem", textAlign: "center" }}
                  whileHover={{ y: -4 }}
                >
                  <div style={{ position: "relative", display: "inline-block", marginBottom: "1.25rem" }}>
                    <div
                      style={{
                        width: "3.5rem",
                        height: "3.5rem",
                        borderRadius: "50%",
                        backgroundColor: ch.badgeColor + "20",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                      }}
                    >
                      <ch.icon size={24} style={{ color: ch.badgeColor }} />
                    </div>
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: ch.badgeColor,
                      backgroundColor: ch.badgeColor + "15",
                      padding: "0.2rem 0.7rem",
                      borderRadius: "999px",
                      marginBottom: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {ch.badge}
                  </span>
                  <h3
                    style={{
                      fontWeight: 700,
                      fontSize: "1.15rem",
                      color: "var(--color-text)",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {ch.title}
                  </h3>
                  <p
                    style={{
                      color: "var(--color-text-secondary)",
                      fontSize: "0.9rem",
                      lineHeight: 1.65,
                      marginBottom: "1.5rem",
                    }}
                  >
                    {ch.desc}
                  </p>
                  <Link href={ch.href} className="btn-primary" style={{ display: "inline-block" }}>
                    {ch.cta}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* System Status */}
        <section className="bg-[var(--color-bg)]" style={{ padding: "3rem 1.5rem" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="card"
              style={{
                padding: "2rem",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <CheckCircle size={28} style={{ color: "#16A34A" }} />
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: "var(--color-text)",
                    }}
                  >
                    All Systems Operational
                  </div>
                  <div style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    No incidents or outages reported
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "2rem",
                  alignItems: "center",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      color: "#16A34A",
                    }}
                  >
                    99.9%
                  </div>
                  <div style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem" }}>
                    Uptime
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "var(--color-text)",
                    }}
                  >
                    Today
                  </div>
                  <div style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem" }}>
                    Last Checked
                  </div>
                </div>
                <span
                  style={{
                    backgroundColor: "#16A34A20",
                    color: "#16A34A",
                    fontWeight: 700,
                    padding: "0.4rem 1rem",
                    borderRadius: "999px",
                    fontSize: "0.875rem",
                  }}
                >
                  Operational
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section
          className="bg-[var(--color-bg-secondary)]"
          style={{ padding: "5rem 1.5rem" }}
        >
          <div style={{ maxWidth: "820px", margin: "0 auto" }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              style={{ textAlign: "center", marginBottom: "3rem" }}
            >
              <span className="section-badge">FAQ</span>
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  marginTop: "1rem",
                }}
              >
                Frequently Asked Questions
              </h2>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  marginTop: "0.75rem",
                  lineHeight: 1.7,
                }}
              >
                Quick answers to the questions we hear most often from our customers
                about support, availability, and how to get the fastest resolution.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {FAQS.map((faq, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <FAQItem q={faq.q} a={faq.a} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-[var(--color-bg)]" style={{ padding: "5rem 1.5rem" }}>
          <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeInUp}>
                <span className="section-badge">We Are Here</span>
              </motion.div>
              <motion.h2
                variants={fadeInUp}
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  marginTop: "1rem",
                  marginBottom: "1rem",
                }}
              >
                Your Success Is Our{" "}
                <span className="text-gold-gradient">Priority</span>
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "1.05rem",
                  lineHeight: 1.75,
                  marginBottom: "2rem",
                }}
              >
                At KVL TECH, support is not an afterthought — it is core to everything
                we do. Whether you are setting up your first product or scaling your
                operations, our team is always just a message away. We do not rest until
                your issue is fully resolved and you are moving forward with confidence.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}
              >
                <Link href="https://wa.me/919310726473" className="btn-gold">
                  Chat with Support
                </Link>
                <Link href="/contact" className="btn-outline">
                  Contact Us
                </Link>
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
