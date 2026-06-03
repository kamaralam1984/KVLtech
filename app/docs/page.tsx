"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Zap,
  Code2,
  Webhook,
  Download,
  Terminal,
  Shield,
  Clock,
  GitBranch,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  HelpCircle,
  Package,
  Globe,
  Key,
  Activity,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as unknown as never } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const quickStartCards = [
  {
    icon: <Zap size={28} />,
    title: "5-Minute Quickstart",
    description:
      "Get your API key and make your very first authenticated call in under five minutes. Follow our step-by-step guide to authenticate, choose an endpoint, and receive your first JSON response. No prior experience required — if you can run a terminal command, you can integrate with KVL TECH.",
    cta: "Start Now",
    color: "var(--color-gold)",
  },
  {
    icon: <Code2 size={28} />,
    title: "API Reference",
    description:
      "Browse the complete endpoint documentation with full request and response examples, parameter descriptions, error codes, and live try-it-out panels. Every endpoint is documented with real-world use cases so you always know exactly what to expect.",
    cta: "View Reference",
    color: "#4f9cf9",
  },
  {
    icon: <Webhook size={28} />,
    title: "Webhook Integration",
    description:
      "Subscribe to real-time event notifications delivered directly to your server the instant something happens — a new order, a lead capture, a client registration. Webhooks eliminate polling and let you build truly reactive, event-driven applications.",
    cta: "Setup Webhooks",
    color: "#a78bfa",
  },
  {
    icon: <Download size={28} />,
    title: "SDK Downloads",
    description:
      "Skip the raw HTTP layer entirely. Our officially maintained SDKs for JavaScript/Node.js, Python, PHP, and Ruby wrap every endpoint in idiomatic, typed, well-documented functions. All SDKs are MIT licensed and actively maintained on GitHub.",
    cta: "Get SDKs",
    color: "#34d399",
  },
];

const endpoints = [
  {
    method: "GET",
    path: "/products",
    description: "List all products with optional filters, pagination, and sorting.",
  },
  {
    method: "GET",
    path: "/products/:id",
    description: "Retrieve full details for a single product by its unique identifier.",
  },
  {
    method: "POST",
    path: "/orders",
    description: "Create a new order, link it to a client, and trigger fulfillment workflows.",
  },
  {
    method: "GET",
    path: "/orders/:id",
    description: "Fetch the current status, line items, and payment details of an order.",
  },
  {
    method: "POST",
    path: "/leads",
    description: "Submit a new sales lead directly into the KVL CRM pipeline.",
  },
  {
    method: "GET",
    path: "/clients",
    description: "Retrieve your full client list including contact info and account status.",
  },
];

const sdks = [
  {
    lang: "JavaScript / Node.js",
    install: "npm install kvltech-sdk",
    pkg: "npm",
    color: "#f7df1e",
    icon: "JS",
  },
  {
    lang: "Python",
    install: "pip install kvltech",
    pkg: "pip",
    color: "#3776ab",
    icon: "PY",
  },
  {
    lang: "PHP",
    install: "composer require kvltech/sdk",
    pkg: "composer",
    color: "#777bb3",
    icon: "PHP",
  },
  {
    lang: "Ruby",
    install: "gem install kvltech",
    pkg: "gem",
    color: "#cc342d",
    icon: "RB",
  },
];

const webhookEvents = [
  { event: "order.created", description: "Fired when a new order is placed." },
  { event: "order.paid", description: "Fired when payment is confirmed." },
  { event: "lead.new", description: "Fired when a new lead enters the CRM." },
  { event: "client.registered", description: "Fired when a new client account is created." },
];

const changelog = [
  {
    version: "v1.4.0",
    date: "June 2026",
    notes:
      "Added AI-powered endpoints for product recommendations, lead scoring, and automated client insights. Introduced streaming responses for large dataset queries.",
  },
  {
    version: "v1.3.0",
    date: "April 2026",
    notes:
      "Overhauled webhook delivery with guaranteed at-least-once semantics, exponential backoff retries, and a webhook log dashboard in the developer portal.",
  },
  {
    version: "v1.2.0",
    date: "February 2026",
    notes:
      "Launched new CRM endpoints for contacts, pipeline stages, and task management. Bulk operations now supported on /clients and /leads.",
  },
  {
    version: "v1.1.0",
    date: "December 2025",
    notes:
      "Increased free-tier rate limit from 500 to 1,000 requests per hour. Added per-endpoint rate limit headers in every response.",
  },
];

const faqs = [
  {
    q: "How do I get API access?",
    a: "API access is available on our Premium and Enterprise plans. Once you upgrade, you will find your API key in the Developer section of your account dashboard. Free accounts can explore our sandbox environment with limited read-only access.",
  },
  {
    q: "Is there a sandbox environment for testing?",
    a: "Yes. Our sandbox is available at test.api.kvlbusinesssolutions.com. Use your test credentials (provided in the developer portal) to safely experiment without affecting live data. The sandbox mirrors production endpoints and resets every 24 hours.",
  },
  {
    q: "What are the rate limits?",
    a: "The free tier allows 1,000 requests per hour. Paid plans increase this to 10,000 requests per hour. Enterprise customers receive unlimited requests with dedicated infrastructure. Every API response includes X-RateLimit-Remaining and X-RateLimit-Reset headers so you can monitor usage in real time.",
  },
  {
    q: "Do you introduce breaking changes?",
    a: "We are committed to backward compatibility. We maintain each major API version for a minimum of two years. When breaking changes are necessary, we release a new major version (e.g., /v2) and give all developers at least 6 months notice with a migration guide before deprecating the old version.",
  },
  {
    q: "How does authentication work?",
    a: "We use JWT (JSON Web Token) Bearer authentication. Exchange your API key for a JWT by calling POST /auth/token. Include that token in the Authorization: Bearer <token> header on every subsequent request. Tokens are valid for 24 hours and can be refreshed via POST /auth/refresh.",
  },
  {
    q: "Are the SDKs open source?",
    a: "Yes, all official KVL TECH SDKs are MIT licensed and hosted on GitHub. We welcome community contributions, bug reports, and feature requests. Check each SDK's CONTRIBUTING.md for guidelines on submitting pull requests.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      className="card border border-[var(--color-border)] overflow-hidden"
    >
      <button
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-semibold text-[var(--color-text)] text-base">{q}</span>
        {open ? (
          <ChevronUp size={18} className="shrink-0 text-[var(--color-gold)]" />
        ) : (
          <ChevronDown size={18} className="shrink-0 text-[var(--color-gold)]" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 text-[var(--color-text-secondary)] text-sm leading-relaxed border-t border-[var(--color-border)] pt-4">
          {a}
        </div>
      )}
    </motion.div>
  );
}

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="bg-[var(--color-bg)] py-24 px-4 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% 0%, var(--color-gold), transparent)",
            }}
          />
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl mx-auto relative"
          >
            <motion.div variants={fadeUp}>
              <span className="section-badge inline-flex items-center gap-2 mb-4">
                <BookOpen size={14} />
                Documentation
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight"
            >
              Complete{" "}
              <span className="text-gold-gradient">Developer Documentation</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10"
            >
              Everything you need to integrate, extend, and build on top of KVL TECH. REST API,
              webhooks, SDKs, and more — all documented in one place so you ship faster and debug
              less.
            </motion.p>

            {/* Stats bar */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap justify-center gap-6 md:gap-10"
            >
              {[
                { icon: <Globe size={16} />, label: "REST API" },
                { icon: <Code2 size={16} />, label: "JSON + Webhooks" },
                { icon: <Clock size={16} />, label: "1,000 req/hour" },
                { icon: <Shield size={16} />, label: "JWT Authentication" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm font-medium text-[var(--color-text)]"
                >
                  <span className="text-[var(--color-gold)]">{s.icon}</span>
                  {s.label}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ── QUICK START CARDS ─────────────────────────────────────── */}
        <section className="bg-[var(--color-bg-secondary)] py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.span variants={fadeUp} className="section-badge inline-block mb-3">
                Get Started
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4">
                Where do you want to <span className="text-gold-gradient">begin?</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-[var(--color-text-secondary)] max-w-xl mx-auto"
              >
                Whether you are brand-new to the API or looking for advanced integration guides,
                pick the section that matches your goal and we will get you there fast.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={stagger}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {quickStartCards.map((card) => (
                <motion.div
                  key={card.title}
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="card p-6 flex flex-col gap-4 cursor-pointer group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${card.color}20`, color: card.color }}
                  >
                    {card.icon}
                  </div>
                  <h3 className="font-bold text-lg text-[var(--color-text)]">{card.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed flex-1">
                    {card.description}
                  </p>
                  <button
                    className="flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all"
                    style={{ color: card.color }}
                  >
                    {card.cta} <ArrowRight size={14} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── API OVERVIEW ──────────────────────────────────────────── */}
        <section className="bg-[var(--color-bg)] py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="grid lg:grid-cols-2 gap-12 items-start"
            >
              <div>
                <motion.span variants={fadeUp} className="section-badge inline-block mb-3">
                  API Overview
                </motion.span>
                <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4">
                  A clean, predictable{" "}
                  <span className="text-gold-gradient">REST API</span>
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  className="text-[var(--color-text-secondary)] leading-relaxed mb-6"
                >
                  The KVL TECH API follows RESTful conventions. Every resource is addressable by
                  a URL, every operation maps to an HTTP verb, and every response is JSON. There
                  are no surprises — what you read in these docs is exactly what you get in
                  production.
                </motion.p>

                <motion.div variants={stagger} className="space-y-4">
                  {[
                    {
                      icon: <Globe size={16} />,
                      label: "Base URL",
                      value: "https://api.kvlbusinesssolutions.com/v1",
                    },
                    { icon: <Code2 size={16} />, label: "Format", value: "JSON (request & response)" },
                    {
                      icon: <Key size={16} />,
                      label: "Auth",
                      value: "Bearer token (JWT) in Authorization header",
                    },
                    {
                      icon: <Activity size={16} />,
                      label: "Rate Limits",
                      value: "1,000/hr free · 10,000/hr paid · Unlimited enterprise",
                    },
                    {
                      icon: <GitBranch size={16} />,
                      label: "Versioning",
                      value: "v1 (current) · v2 (beta)",
                    },
                  ].map((item) => (
                    <motion.div
                      key={item.label}
                      variants={fadeUp}
                      className="flex gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
                    >
                      <span className="text-[var(--color-gold)] mt-0.5 shrink-0">{item.icon}</span>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                          {item.label}
                        </span>
                        <p className="text-sm text-[var(--color-text)] font-mono">{item.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Code example */}
              <motion.div variants={fadeUp}>
                <div className="rounded-xl overflow-hidden border border-[var(--color-border)] shadow-lg">
                  <div className="flex items-center gap-2 px-4 py-3 bg-[#0d1117] border-b border-[#30363d]">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                    <span className="ml-3 text-xs text-[#8b949e] font-mono">example.js</span>
                  </div>
                  <pre className="bg-[#0d1117] text-[#e6edf3] text-sm leading-relaxed p-6 overflow-x-auto font-mono">
{`// Fetch all products
const response = await fetch(
  'https://api.kvlbusinesssolutions.com/v1/products',
  {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_JWT_TOKEN',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  }
);

const data = await response.json();
// { products: [...], total: 42, page: 1 }
console.log(data.products);`}
                  </pre>
                </div>
                <p className="mt-3 text-xs text-[var(--color-text-secondary)] text-center">
                  Replace <code className="bg-[var(--color-bg-secondary)] px-1 py-0.5 rounded text-[var(--color-gold)]">YOUR_JWT_TOKEN</code> with the token returned by <code className="bg-[var(--color-bg-secondary)] px-1 py-0.5 rounded">POST /auth/token</code>
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── ENDPOINTS TABLE ───────────────────────────────────────── */}
        <section className="bg-[var(--color-bg-secondary)] py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.span variants={fadeUp} className="section-badge inline-block mb-3">
                Endpoints
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4">
                Core <span className="text-gold-gradient">API Endpoints</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-[var(--color-text-secondary)] max-w-xl mx-auto"
              >
                Every endpoint supports HTTPS only. All responses include a status code, a data
                object, and pagination metadata where applicable. Error responses follow RFC 7807
                (Problem Details) so your error handling stays consistent.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={stagger}
            >
              <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                      <th className="text-left px-5 py-3 font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider text-xs w-24">
                        Method
                      </th>
                      <th className="text-left px-5 py-3 font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider text-xs w-48">
                        Endpoint
                      </th>
                      <th className="text-left px-5 py-3 font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider text-xs">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoints.map((ep, i) => (
                      <motion.tr
                        key={ep.path}
                        variants={fadeUp}
                        className={`border-b border-[var(--color-border)] last:border-0 ${
                          i % 2 === 0 ? "bg-[var(--color-bg-secondary)]" : "bg-[var(--color-bg)]"
                        } hover:bg-[var(--color-bg)] transition-colors`}
                      >
                        <td className="px-5 py-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-mono ${
                              ep.method === "GET"
                                ? "bg-[#1a3a2a] text-[#34d399]"
                                : "bg-[#2a1a3a] text-[#a78bfa]"
                            }`}
                          >
                            {ep.method}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-[var(--color-gold)] text-xs">
                          {ep.path}
                        </td>
                        <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                          {ep.description}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── SDKs ─────────────────────────────────────────────────── */}
        <section className="bg-[var(--color-bg)] py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.span variants={fadeUp} className="section-badge inline-block mb-3">
                SDKs
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4">
                Official <span className="text-gold-gradient">Client Libraries</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-[var(--color-text-secondary)] max-w-xl mx-auto"
              >
                Stop writing boilerplate HTTP code. Our officially maintained SDKs handle
                authentication, retries, rate-limit back-off, and response parsing so you can focus
                purely on building your product. Install in seconds, integrate in minutes.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {sdks.map((sdk) => (
                <motion.div
                  key={sdk.lang}
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="card p-6 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0"
                      style={{ backgroundColor: sdk.color }}
                    >
                      {sdk.icon}
                    </div>
                    <h3 className="font-bold text-[var(--color-text)]">{sdk.lang}</h3>
                  </div>
                  <div className="bg-[#0d1117] rounded-lg px-3 py-2 font-mono text-xs text-[#e6edf3] border border-[#30363d]">
                    {sdk.install}
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button className="btn-outline text-xs py-1.5 px-3 flex-1 flex items-center justify-center gap-1">
                      <Terminal size={12} /> Docs
                    </button>
                    <button className="btn-outline text-xs py-1.5 px-3 flex-1 flex items-center justify-center gap-1">
                      <Code2 size={12} /> GitHub
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── WEBHOOKS ─────────────────────────────────────────────── */}
        <section className="bg-[var(--color-bg-secondary)] py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="grid lg:grid-cols-2 gap-12 items-start"
            >
              <div>
                <motion.span variants={fadeUp} className="section-badge inline-block mb-3">
                  Webhooks
                </motion.span>
                <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4">
                  Real-time <span className="text-gold-gradient">Event Notifications</span>
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  className="text-[var(--color-text-secondary)] leading-relaxed mb-6"
                >
                  Webhooks push events to your server the moment they occur — no polling required.
                  Register an HTTPS endpoint in your developer dashboard and we will send a signed
                  POST request containing a full JSON payload whenever a subscribed event fires.
                  Every delivery is signed with HMAC-SHA256 so you can verify authenticity before
                  processing.
                </motion.p>
                <motion.div variants={stagger} className="space-y-3">
                  {webhookEvents.map((we) => (
                    <motion.div
                      key={we.event}
                      variants={fadeUp}
                      className="flex items-start gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]"
                    >
                      <CheckCircle size={16} className="text-[var(--color-gold)] mt-0.5 shrink-0" />
                      <div>
                        <code className="text-xs font-mono text-[var(--color-gold)]">{we.event}</code>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                          {we.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <motion.div variants={fadeUp}>
                <p className="text-xs text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider mb-2">
                  Example Payload — order.created
                </p>
                <div className="rounded-xl overflow-hidden border border-[var(--color-border)] shadow-lg">
                  <div className="flex items-center gap-2 px-4 py-3 bg-[#0d1117] border-b border-[#30363d]">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                    <span className="ml-3 text-xs text-[#8b949e] font-mono">webhook-payload.json</span>
                  </div>
                  <pre className="bg-[#0d1117] text-[#e6edf3] text-sm leading-relaxed p-6 overflow-x-auto font-mono">
{`{
  "event": "order.created",
  "timestamp": "2026-06-03T14:22:11Z",
  "webhook_id": "wh_abc123def456",
  "data": {
    "order_id": "ord_987xyz",
    "client_id": "cli_555abc",
    "total_usd": 299.00,
    "currency": "USD",
    "status": "pending",
    "items": [
      {
        "product_id": "prod_001",
        "quantity": 1,
        "price_usd": 299.00
      }
    ]
  }
}`}
                  </pre>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── CHANGELOG ────────────────────────────────────────────── */}
        <section className="bg-[var(--color-bg)] py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.span variants={fadeUp} className="section-badge inline-block mb-3">
                Changelog
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4">
                What&apos;s <span className="text-gold-gradient">New</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-[var(--color-text-secondary)] max-w-xl mx-auto"
              >
                We ship improvements every month. Read the full release notes to stay current with
                new endpoints, performance improvements, and deprecation notices.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={stagger}
              className="relative"
            >
              <div className="absolute left-6 top-0 bottom-0 w-px bg-[var(--color-border)] hidden md:block" />
              <div className="space-y-6">
                {changelog.map((entry) => (
                  <motion.div key={entry.version} variants={fadeUp} className="flex gap-6">
                    <div className="hidden md:flex flex-col items-center">
                      <div
                        className="w-3 h-3 rounded-full border-2 mt-5 shrink-0"
                        style={{
                          borderColor: "var(--color-gold)",
                          backgroundColor: "var(--color-bg)",
                        }}
                      />
                    </div>
                    <div className="card p-5 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-[var(--color-gold)] font-mono">
                          {entry.version}
                        </span>
                        <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] px-2 py-0.5 rounded-full">
                          {entry.date}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        {entry.notes}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── COMMUNITY ────────────────────────────────────────────── */}
        <section className="bg-[var(--color-bg-secondary)] py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.span variants={fadeUp} className="section-badge inline-block mb-3">
                Community
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4">
                Build with the <span className="text-gold-gradient">KVL TECH Community</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-[var(--color-text-secondary)] max-w-xl mx-auto"
              >
                You are never alone. Join thousands of developers who integrate, contribute, and
                help each other get the most out of the KVL TECH platform. Ask questions, share
                projects, and influence the API roadmap.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={stagger}
              className="grid sm:grid-cols-3 gap-6"
            >
              {[
                {
                  icon: <Code2 size={28} />,
                  title: "GitHub Repository",
                  description:
                    "Browse source code for all official SDKs, report bugs, and submit pull requests. Stars and contributions are always welcome.",
                  cta: "View on GitHub",
                  href: "https://github.com/kvltech",
                  color: "#e6edf3",
                },
                {
                  icon: <HelpCircle size={28} />,
                  title: "Stack Overflow",
                  description:
                    "Search existing Q&A or post your question using the kvltech tag. Our developer advocates monitor the tag and respond within 24 hours.",
                  cta: "Ask a Question",
                  href: "https://stackoverflow.com/questions/tagged/kvltech",
                  color: "#f48024",
                },
                {
                  icon: <MessageSquare size={28} />,
                  title: "Discord Community",
                  description:
                    "Join real-time discussions in our Discord server. Get help from fellow developers, share what you built, and chat directly with the KVL TECH team.",
                  cta: "Join Discord",
                  href: "#",
                  color: "#5865f2",
                },
              ].map((item) => (
                <motion.a
                  key={item.title}
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card p-6 flex flex-col gap-4 group no-underline"
                >
                  <div style={{ color: item.color }}>{item.icon}</div>
                  <h3 className="font-bold text-lg text-[var(--color-text)]">{item.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed flex-1">
                    {item.description}
                  </p>
                  <span
                    className="flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all"
                    style={{ color: item.color }}
                  >
                    {item.cta} <ExternalLink size={13} />
                  </span>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section className="bg-[var(--color-bg)] py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.span variants={fadeUp} className="section-badge inline-block mb-3">
                FAQ
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked <span className="text-gold-gradient">Questions</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-[var(--color-text-secondary)] max-w-xl mx-auto"
              >
                Have a question that is not answered here? Reach us via the chat widget below or
                post in the community Discord and we will get back to you promptly.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={stagger}
              className="space-y-3"
            >
              {faqs.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <section className="bg-[var(--color-bg-secondary)] py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{ background: "var(--color-gold)20", color: "var(--color-gold)" }}
                >
                  <Package size={32} />
                </div>
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4">
                Ready to <span className="text-gold-gradient">Get API Access?</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-[var(--color-text-secondary)] leading-relaxed mb-3 max-w-2xl mx-auto"
              >
                API access is available on our <strong>Premium</strong> and{" "}
                <strong>Enterprise</strong> plans. Upgrade today to unlock your API key, full
                endpoint access, webhook subscriptions, and priority developer support. Enterprise
                customers also receive a dedicated account manager and custom rate limits tailored
                to their infrastructure.
              </motion.p>
              <motion.p
                variants={fadeUp}
                className="text-[var(--color-text-secondary)] text-sm mb-8 max-w-xl mx-auto"
              >
                Not ready to upgrade? Explore the sandbox at{" "}
                <code className="text-[var(--color-gold)] font-mono bg-[var(--color-bg)] px-1.5 py-0.5 rounded">
                  test.api.kvlbusinesssolutions.com
                </code>{" "}
                — free, no credit card required.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/pricing" className="btn-gold px-8 py-3 text-base font-semibold">
                  View Pricing Plans
                </Link>
                <Link href="/contact" className="btn-outline px-8 py-3 text-base font-semibold">
                  Talk to Sales
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
