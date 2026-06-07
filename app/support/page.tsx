"use client";

import { motion } from "framer-motion";
import {
  MessageCircle,
  Mail,
  Phone,
  Video,
  Star,
  Clock,
  CheckCircle,
  Ticket,
  ChevronDown,
  Paperclip,
  Shield,
  Users,
  Zap,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  Info,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderId: "",
    issueType: "",
    priority: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNo, setTicketNo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stats = [
    { icon: <Star size={22} />, value: "4.9★", label: "Support Rating" },
    { icon: <Zap size={22} />, value: "2 Min", label: "Avg Response Time" },
    { icon: <CheckCircle size={22} />, value: "98%", label: "Same-Day Resolution" },
    { icon: <Ticket size={22} />, value: "5,000+", label: "Tickets Resolved" },
  ];

  const channels = [
    {
      icon: <MessageCircle size={28} />,
      title: "WhatsApp Support",
      responseTime: "Reply in 2 minutes",
      availability: "24/7 available",
      description:
        "Fastest response channel available. Send a message and get help immediately from our on-call engineers — no waiting, no queues.",
      btnLabel: "Chat on WhatsApp",
      btnClass: "bg-green-500 hover:bg-green-600 text-white",
      href: "https://wa.me/919876543210",
      accent: "#25D366",
    },
    {
      icon: <Mail size={28} />,
      title: "Email Support",
      responseTime: "Reply in 4 hours",
      availability: "24/7 available",
      description:
        "Detailed technical support with full screenshot and file sharing capabilities. Perfect for complex issues that need thorough documentation.",
      btnLabel: "Send an Email",
      btnClass: "bg-blue-600 hover:bg-blue-700 text-white",
      href: "mailto:support@kvlbusinesssolutions.com",
      accent: "#2563EB",
    },
    {
      icon: <Phone size={28} />,
      title: "Phone Support",
      responseTime: "Reply immediately",
      availability: "Mon–Sat, 9AM–7PM",
      description:
        "Talk directly to a live engineer for complex or time-sensitive issues. Our specialists diagnose and resolve problems in real time.",
      btnLabel: "Call Us Now",
      btnClass: "text-white",
      btnStyle: { backgroundColor: "var(--color-navy)" },
      href: "tel:+919876543210",
      accent: "var(--color-navy)",
    },
    {
      icon: <Video size={28} />,
      title: "Video Call Support",
      responseTime: "Scheduled",
      availability: "Available daily",
      description:
        "A dedicated screen-share session for hands-on technical help. Book a 30-minute slot and let our engineer walk through your issue directly.",
      btnLabel: "Book a Video Call",
      btnClass: "bg-purple-600 hover:bg-purple-700 text-white",
      href: "#ticket-form",
      accent: "#7C3AED",
    },
  ];

  const slaData = [
    {
      level: "Critical",
      sublabel: "System down",
      icon: <AlertTriangle size={16} />,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/20",
      firstResponse: "1 hour",
      resolution: "4 hours",
    },
    {
      level: "High",
      sublabel: "Major functionality broken",
      icon: <Zap size={16} />,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/20",
      firstResponse: "4 hours",
      resolution: "24 hours",
    },
    {
      level: "Medium",
      sublabel: "Minor issue",
      icon: <Info size={16} />,
      color: "text-yellow-600",
      bg: "bg-yellow-50 dark:bg-yellow-950/20",
      firstResponse: "24 hours",
      resolution: "72 hours",
    },
    {
      level: "Low",
      sublabel: "Question or request",
      icon: <HelpCircle size={16} />,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      firstResponse: "48 hours",
      resolution: "1 week",
    },
  ];

  const quickLinks = [
    "Reset my password",
    "Download invoice",
    "Update payment method",
    "Cancel or pause service",
    "Transfer ownership",
  ];

  const faqs = [
    {
      q: "How do I track my support ticket?",
      a: "As soon as your ticket is created, you will receive an email confirmation containing your unique ticket number. We send status update emails at every stage — when an engineer is assigned, when work begins, and when it is resolved. You can also reply to any update email to add more information.",
    },
    {
      q: "Can I escalate my ticket if the issue is urgent?",
      a: "Absolutely. Simply reply to your existing ticket email with the word 'ESCALATE' in the subject line or body. Our team will immediately reprioritize your case and assign a senior engineer. For production-critical emergencies, you can also call our emergency line directly.",
    },
    {
      q: "How are billing disputes and refund requests handled?",
      a: "All billing disputes are reviewed and resolved within 2 business days. Raise a ticket with the issue type 'Billing', include your order ID and a brief description, and our finance team will investigate immediately. Approved refunds are processed back to your original payment method within 5–7 business days.",
    },
    {
      q: "Can I cancel my service at any time?",
      a: "Yes — there are no lock-in contracts. You can cancel your service at any time by submitting a cancellation request via support ticket or WhatsApp. We will provide a full data export before account closure so you never lose your information.",
    },
    {
      q: "What happens if I accidentally deleted important data?",
      a: "Contact our support team immediately. We maintain a 7-day recovery window for most data deletions. The sooner you reach out, the higher the chance of a full recovery. Use WhatsApp for the fastest response in these situations.",
    },
    {
      q: "Is there emergency support for critical production issues?",
      a: "Yes. For critical production outages that cannot wait, call +91 98765 43210 — this line is staffed 24/7 by on-call engineers. You can also send a WhatsApp message marked 'URGENT' and it will be escalated to our emergency queue within minutes.",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-[104px]">
        {/* ── Hero ── */}
        <section className="bg-[var(--color-bg)] py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-[-80px] right-[-80px] w-[420px] h-[420px] rounded-full opacity-10 blur-3xl"
              style={{ background: "var(--color-gold)" }}
            />
            <div
              className="absolute bottom-[-60px] left-[-60px] w-[320px] h-[320px] rounded-full opacity-10 blur-3xl"
              style={{ background: "var(--color-gold)" }}
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="flex flex-col items-center gap-6"
            >
              <motion.span variants={fadeUp} className="section-badge">
                Technical Support
              </motion.span>
              <motion.h1
                variants={fadeUp}
                className="text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl"
                style={{ color: "var(--color-text)" }}
              >
                24/7 Expert Support —{" "}
                <span className="text-gold-gradient">We're In Your Corner</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-lg md:text-xl max-w-2xl"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Technical issues, billing questions, or just need guidance — our team responds in minutes, not days. Real engineers, real answers, real fast.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="flex flex-wrap justify-center gap-4 mt-2"
              >
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold"
                >
                  <MessageCircle size={18} className="inline mr-2" />
                  Chat on WhatsApp
                </a>
                <a href="#ticket-form" className="btn-outline">
                  Submit a Ticket
                </a>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
            >
              {stats.map((s, i) => (
                <motion.div key={i} variants={fadeUp} className="card text-center py-6">
                  <div
                    className="flex items-center justify-center mb-2"
                    style={{ color: "var(--color-gold)" }}
                  >
                    {s.icon}
                  </div>
                  <p
                    className="text-2xl font-extrabold"
                    style={{ color: "var(--color-text)" }}
                  >
                    {s.value}
                  </p>
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {s.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Support Channels ── */}
        <section className="bg-[var(--color-bg-secondary)] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">
                Contact Channels
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold mt-4"
                style={{ color: "var(--color-text)" }}
              >
                Choose How You Reach Us
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-3 max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Every channel is staffed by real engineers. Pick what works best for your situation — speed, detail, or hands-on help.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {channels.map((c, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="card flex flex-col gap-4 p-7"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-xl"
                      style={{ background: "var(--color-bg-secondary)", color: c.accent }}
                    >
                      {c.icon}
                    </div>
                    <div>
                      <h3
                        className="text-xl font-bold"
                        style={{ color: "var(--color-text)" }}
                      >
                        {c.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-1">
                        <span
                          className="flex items-center gap-1 text-sm"
                          style={{ color: "var(--color-gold)" }}
                        >
                          <Clock size={14} />
                          {c.responseTime}
                        </span>
                        <span
                          className="text-sm"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          · {c.availability}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p style={{ color: "var(--color-text-secondary)" }}>{c.description}</p>
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all duration-200 w-full md:w-auto ${c.btnClass}`}
                    style={c.btnStyle}
                  >
                    {c.btnLabel}
                    <ArrowRight size={16} />
                  </a>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Support Ticket Form ── */}
        <section id="ticket-form" className="bg-[var(--color-bg)] py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.span variants={fadeUp} className="section-badge">
                Submit a Ticket
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold mt-4"
                style={{ color: "var(--color-text)" }}
              >
                Describe Your Issue
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-3"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Fill in the form below and our team will respond within the SLA window for your priority level. The more detail you provide, the faster we resolve.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="card p-8"
            >
              {submitted && ticketNo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-6 rounded-xl border flex flex-col items-center text-center gap-3"
                  style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-gold)" }}
                >
                  <CheckCircle size={36} style={{ color: "#16A34A" }} />
                  <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>Ticket Submitted!</h3>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Your support ticket has been created. You will receive a reply within the SLA window.
                  </p>
                  <div className="px-6 py-3 rounded-xl font-mono font-bold text-lg" style={{ background: "var(--color-bg)", color: "var(--color-gold)" }}>
                    {ticketNo}
                  </div>
                  <button
                    onClick={() => { setSubmitted(false); setTicketNo(null); setFormData({ name: "", email: "", orderId: "", issueType: "", priority: "", description: "" }); }}
                    className="text-sm font-semibold underline"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Submit another ticket
                  </button>
                </motion.div>
              )}
              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                  {error}
                </div>
              )}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSubmitting(true);
                  setError(null);
                  try {
                    const res = await fetch("/api/support", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({
                        subject: formData.issueType
                          ? `${formData.issueType.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}: ${formData.description.slice(0, 60)}`
                          : formData.description.slice(0, 80),
                        orderId: formData.orderId || undefined,
                        priority: formData.priority || "MEDIUM",
                        message: `Name: ${formData.name}\nEmail: ${formData.email}\nIssue Type: ${formData.issueType}\n\n${formData.description}`,
                      }),
                    });
                    const data = await res.json();
                    if (res.ok && data.ticket?.ticketNo) {
                      setTicketNo(data.ticket.ticketNo);
                      setSubmitted(true);
                    } else if (res.status === 401) {
                      setError("Please log in to your client account to submit a support ticket. Or reach us via WhatsApp for immediate help.");
                    } else {
                      setError(data.error || "Failed to submit ticket. Please try again.");
                    }
                  } catch {
                    setError("Network error. Please try again or contact us via WhatsApp.");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="flex flex-col gap-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-text)" }}
                    >
                      Full Name <span style={{ color: "var(--color-gold)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="px-4 py-3 rounded-lg border text-sm outline-none transition-all"
                      style={{
                        borderColor: "var(--color-border)",
                        background: "var(--color-bg-secondary)",
                        color: "var(--color-text)",
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-text)" }}
                    >
                      Email Address <span style={{ color: "var(--color-gold)" }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="px-4 py-3 rounded-lg border text-sm outline-none transition-all"
                      style={{
                        borderColor: "var(--color-border)",
                        background: "var(--color-bg-secondary)",
                        color: "var(--color-text)",
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    Order ID{" "}
                    <span
                      className="font-normal text-xs"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KVL-20248-XYZ"
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    className="px-4 py-3 rounded-lg border text-sm outline-none transition-all"
                    style={{
                      borderColor: "var(--color-border)",
                      background: "var(--color-bg-secondary)",
                      color: "var(--color-text)",
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-text)" }}
                    >
                      Issue Type <span style={{ color: "var(--color-gold)" }}>*</span>
                    </label>
                    <select
                      required
                      value={formData.issueType}
                      onChange={(e) =>
                        setFormData({ ...formData, issueType: e.target.value })
                      }
                      className="px-4 py-3 rounded-lg border text-sm outline-none transition-all"
                      style={{
                        borderColor: "var(--color-border)",
                        background: "var(--color-bg-secondary)",
                        color: "var(--color-text)",
                      }}
                    >
                      <option value="">Select issue type…</option>
                      <option value="technical-bug">Technical Bug</option>
                      <option value="billing">Billing</option>
                      <option value="feature-request">Feature Request</option>
                      <option value="account-access">Account Access</option>
                      <option value="performance">Performance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-text)" }}
                    >
                      Priority <span style={{ color: "var(--color-gold)" }}>*</span>
                    </label>
                    <select
                      required
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                      className="px-4 py-3 rounded-lg border text-sm outline-none transition-all"
                      style={{
                        borderColor: "var(--color-border)",
                        background: "var(--color-bg-secondary)",
                        color: "var(--color-text)",
                      }}
                    >
                      <option value="">Select priority…</option>
                      <option value="critical">Critical — System Down</option>
                      <option value="high">High — Major Impact</option>
                      <option value="medium">Medium — Minor Issue</option>
                      <option value="low">Low — Question</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    Describe the Issue <span style={{ color: "var(--color-gold)" }}>*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Provide as much detail as possible — steps to reproduce, error messages, expected vs actual behavior…"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="px-4 py-3 rounded-lg border text-sm outline-none transition-all resize-none"
                    style={{
                      borderColor: "var(--color-border)",
                      background: "var(--color-bg-secondary)",
                      color: "var(--color-text)",
                    }}
                  />
                </div>

                {/* File attachment UI */}
                <div
                  className="flex items-center gap-3 border border-dashed rounded-lg px-4 py-4 cursor-pointer hover:opacity-80 transition-all"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-bg-secondary)",
                  }}
                >
                  <Paperclip size={18} style={{ color: "var(--color-gold)" }} />
                  <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Attach screenshots or files{" "}
                    <span
                      className="font-semibold"
                      style={{ color: "var(--color-text)" }}
                    >
                      (click to browse)
                    </span>{" "}
                    — PNG, JPG, PDF up to 20 MB
                  </span>
                </div>

                <button type="submit" disabled={submitting} className="btn-gold w-full py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitting ? "Submitting..." : <>Submit Support Ticket <ArrowRight size={18} className="inline ml-2" /></>}
                </button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* ── SLA Table ── */}
        <section className="bg-[var(--color-bg-secondary)] py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.span variants={fadeUp} className="section-badge">
                Response SLA
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold mt-4"
                style={{ color: "var(--color-text)" }}
              >
                We Hold Ourselves to Clear Standards
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-3 max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Our Service Level Agreements are not aspirational — they are commitments. Every ticket is tracked against these targets automatically so nothing falls through the cracks.
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
                    <tr
                      style={{
                        borderBottom: "1px solid var(--color-border)",
                        background: "var(--color-bg)",
                      }}
                    >
                      <th
                        className="text-left px-6 py-4 font-semibold"
                        style={{ color: "var(--color-text)" }}
                      >
                        Priority Level
                      </th>
                      <th
                        className="text-left px-6 py-4 font-semibold"
                        style={{ color: "var(--color-text)" }}
                      >
                        Description
                      </th>
                      <th
                        className="text-left px-6 py-4 font-semibold"
                        style={{ color: "var(--color-text)" }}
                      >
                        First Response
                      </th>
                      <th
                        className="text-left px-6 py-4 font-semibold"
                        style={{ color: "var(--color-text)" }}
                      >
                        Resolution Target
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {slaData.map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom:
                            i < slaData.length - 1
                              ? "1px solid var(--color-border)"
                              : "none",
                        }}
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 font-semibold ${row.color}`}
                          >
                            {row.icon}
                            {row.level}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {row.sublabel}
                        </td>
                        <td
                          className="px-6 py-4 font-semibold"
                          style={{ color: "var(--color-text)" }}
                        >
                          {row.firstResponse}
                        </td>
                        <td
                          className="px-6 py-4 font-semibold"
                          style={{ color: "var(--color-gold)" }}
                        >
                          {row.resolution}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Self-Help Quick Links ── */}
        <section className="bg-[var(--color-bg)] py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.span variants={fadeUp} className="section-badge">
                Self-Help
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold mt-4"
                style={{ color: "var(--color-text)" }}
              >
                Instant Answers for Common Tasks
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-3 max-w-xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Many of the most common account and billing tasks can be handled instantly through our self-service portal — no waiting required.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
            >
              {quickLinks.map((link, i) => (
                <motion.button
                  key={i}
                  variants={fadeUp}
                  className="card flex items-center gap-3 px-4 py-4 text-left hover:shadow-md transition-all duration-200 group"
                >
                  <RefreshCw
                    size={16}
                    style={{ color: "var(--color-gold)", flexShrink: 0 }}
                    className="group-hover:rotate-180 transition-transform duration-300"
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    {link}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Team Section ── */}
        <section className="bg-[var(--color-bg-secondary)] py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="flex flex-col md:flex-row items-center gap-12"
            >
              <motion.div variants={fadeUp} className="flex-1 text-center md:text-left">
                <span className="section-badge">Our Team</span>
                <h2
                  className="text-3xl md:text-4xl font-bold mt-4 mb-4"
                  style={{ color: "var(--color-text)" }}
                >
                  Engineers Who Know Your Products Inside Out
                </h2>
                <p
                  className="text-lg leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Our support team comprises 10 dedicated engineers, each specializing in different products and technology stacks. With an average of 4 years of hands-on experience across web development, cloud infrastructure, and digital marketing platforms, our team doesn't just read from scripts — they build and maintain the very products they support. When you reach us, you're speaking to someone who genuinely understands your environment and can act immediately.
                </p>
              </motion.div>
              <motion.div
                variants={fadeUp}
                className="flex-shrink-0 grid grid-cols-2 gap-5 w-full md:w-auto"
              >
                {[
                  { icon: <Users size={28} />, value: "10", label: "Dedicated Engineers" },
                  { icon: <Star size={28} />, value: "4 Yrs", label: "Avg Experience" },
                  { icon: <Shield size={28} />, value: "100%", label: "Specialists" },
                  { icon: <CheckCircle size={28} />, value: "24/7", label: "Coverage" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="card flex flex-col items-center gap-2 py-6 px-5 text-center"
                  >
                    <span style={{ color: "var(--color-gold)" }}>{item.icon}</span>
                    <p
                      className="text-2xl font-extrabold"
                      style={{ color: "var(--color-text)" }}
                    >
                      {item.value}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {item.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="bg-[var(--color-bg)] py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.span variants={fadeUp} className="section-badge">
                FAQ
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold mt-4"
                style={{ color: "var(--color-text)" }}
              >
                Frequently Asked Questions
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-3"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Answers to questions our customers ask most often about support, escalation, billing, and account management.
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
                    className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span
                      className="font-semibold text-base"
                      style={{ color: "var(--color-text)" }}
                    >
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      style={{
                        color: "var(--color-gold)",
                        flexShrink: 0,
                        transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s",
                      }}
                    />
                  </button>
                  {openFaq === i && (
                    <div
                      className="px-6 pb-5 text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {faq.a}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-[var(--color-bg-secondary)] py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="flex flex-col items-center gap-6"
            >
              <motion.div
                variants={fadeUp}
                className="p-4 rounded-full"
                style={{ background: "var(--color-bg)" }}
              >
                <MessageCircle size={36} style={{ color: "var(--color-gold)" }} />
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-4xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                Can't Find Your Answer?
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-lg"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Our engineers are online right now. One message is all it takes to get expert help — no bots, no waiting, no runaround.
              </motion.p>
              <motion.a
                variants={fadeUp}
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold text-lg px-8 py-4 flex items-center gap-2"
              >
                Chat with us on WhatsApp right now
                <ArrowRight size={20} />
              </motion.a>
              <motion.p
                variants={fadeUp}
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Average response time: under 2 minutes · Available 24/7
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
