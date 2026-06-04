"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MousePointerClick,
  Mail,
  Share2,
  FileText,
  BarChart2,
  TrendingUp,
  CheckCircle,
  ChevronDown,
  Star,
  ArrowRight,
  Users,
  Award,
  Clock,
  HeartHandshake,
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
  visible: { transition: { staggerChildren: 0.12 } },
};

const services = [
  {
    icon: Search,
    title: "SEO Optimization",
    description:
      "Dominate page one and rank #1 on Google for your city and niche. We perform deep keyword research, on-page optimization, link building, and technical SEO audits so that customers who are actively searching for your products find you first — not your competitors. Our proven process has helped hundreds of local and national businesses climb to the top of search results and stay there.",
  },
  {
    icon: MousePointerClick,
    title: "PPC Advertising",
    description:
      "Google and Facebook ads engineered to convert — pay only for results that matter. Our certified ad specialists build laser-targeted campaigns, write high-converting copy, and continuously optimize bids and audiences so that every dollar of your ad budget goes further. From search and display to retargeting and lookalike audiences, we cover every paid channel that drives revenue for your business.",
  },
  {
    icon: Mail,
    title: "Email Marketing",
    description:
      "Automated email sequences that nurture cold subscribers and turn them into loyal, paying customers. We design, write, and deploy drip campaigns, welcome series, abandoned-cart flows, and re-engagement sequences that keep your brand top-of-mind and your revenue growing on autopilot — even while you sleep.",
  },
  {
    icon: Share2,
    title: "Social Media Management",
    description:
      "A complete content calendar, daily posting, and proactive community management across every major platform. Our creative team produces scroll-stopping graphics, short-form videos, and compelling captions that grow your following, spark conversations, and convert fans into customers. We handle the strategy, execution, and reporting so you can focus on running your business.",
  },
  {
    icon: FileText,
    title: "Content Marketing",
    description:
      "Blogs, videos, infographics, and guides that attract high-intent organic traffic and position you as the undisputed authority in your industry. Great content builds trust before a prospect ever speaks to your sales team — and it keeps driving traffic and leads for years after publication. We research topics, write expert content, and distribute it to the channels where your audience already spends time.",
  },
  {
    icon: BarChart2,
    title: "Analytics & Reporting",
    description:
      "Real-time dashboards that show you exactly which campaigns are working, what is driving revenue, and where every marketing dollar is going. We set up and maintain your Google Analytics, Meta Pixel, conversion tracking, and custom KPI dashboards so there are no surprises — only clear, actionable insights delivered every week in plain language you can act on immediately.",
  },
];

const packages = [
  {
    name: "Starter",
    price: "$199",
    period: "/month",
    highlight: false,
    features: [
      "Full SEO Optimization",
      "Social Media Management (2 platforms)",
      "Monthly analytics report",
      "Google Business Profile optimization",
      "Weekly performance summary",
      "Email support",
    ],
    cta: "Get Started",
  },
  {
    name: "Growth",
    price: "$399",
    period: "/month",
    highlight: true,
    features: [
      "Everything in Starter",
      "PPC Advertising (Google + Facebook)",
      "Email Marketing automation",
      "Content creation (4 blogs/month)",
      "Live reporting dashboard",
      "Priority support",
    ],
    cta: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "$799",
    period: "/month",
    highlight: false,
    features: [
      "Full-service marketing suite",
      "Dedicated marketing manager",
      "YouTube & WhatsApp campaigns",
      "Unlimited content creation",
      "Custom strategy sessions",
      "24/7 phone & chat support",
    ],
    cta: "Get Full Service",
  },
];

const whyChooseUs = [
  {
    icon: BarChart2,
    title: "Transparent Reporting",
    description:
      "You always know exactly what is happening with your campaigns. We provide weekly email reports and a live dashboard with zero vanity metrics — only the numbers that are connected to your revenue.",
  },
  {
    icon: Clock,
    title: "No Long-Term Contracts",
    description:
      "We earn your business every single month. Our month-to-month agreements mean you stay because results keep improving, not because a contract forces you to. Cancel any time with 30 days notice.",
  },
  {
    icon: Award,
    title: "Industry-Specific Expertise",
    description:
      "Our team has deep experience in restaurants, retail, professional services, e-commerce, and more. We understand the unique challenges of your industry and build campaigns specifically calibrated to your market.",
  },
  {
    icon: HeartHandshake,
    title: "Dedicated Marketing Manager",
    description:
      "Every client gets a single point of contact who knows your brand inside and out. Your dedicated marketing manager is available via phone, email, or WhatsApp and proactively brings you new ideas and optimizations every month.",
  },
];

const faqs = [
  {
    question: "How long will it take to see results?",
    answer:
      "For SEO, you can expect meaningful movement in rankings within 3 to 6 months, with compounding growth thereafter. PPC advertising can begin generating leads within 24 to 48 hours of launching a campaign. Email marketing typically shows strong open and click-through improvements within the first two weeks. We set clear milestones at the start of every engagement so you always know what to expect and when.",
  },
  {
    question: "Which platforms do you work on?",
    answer:
      "We run campaigns across all major digital channels: Google Search, Google Display, Facebook, Instagram, YouTube, and WhatsApp. We also manage LinkedIn campaigns for B2B clients. Our platform selection is always guided by where your specific target audience is most active and where your budget will generate the highest return on investment.",
  },
  {
    question: "Do you create the content, or do I need to supply it?",
    answer:
      "Full content creation is included in all of our plans. Our in-house copywriters, designers, and video editors handle everything — from blog articles and social media posts to ad creatives and email sequences. You simply review and approve before anything goes live. We do ask for a brief onboarding session to understand your brand voice, tone, and goals so every piece of content sounds authentically yours.",
  },
  {
    question: "What is the minimum ad spend budget required?",
    answer:
      "We recommend a minimum ad spend of $200 per month to generate statistically meaningful data and reliable lead volume. Our management fees are separate from your ad spend and go directly to Google, Facebook, or whichever platform you are advertising on. For competitive niches or faster scaling, we typically recommend a higher budget — we will advise you honestly during your free audit.",
  },
  {
    question: "Can I cancel my plan at any time?",
    answer:
      "Yes, absolutely. All of our plans are month-to-month with no long-term lock-in. Simply give us 30 days notice and we will wrap up all active campaigns cleanly, hand over all assets and login credentials, and ensure a smooth transition. We believe that if we are doing our job well, you will never want to leave — and our 98% client satisfaction rate reflects that.",
  },
  {
    question: "What kind of reporting and data will I receive?",
    answer:
      "You will receive a detailed weekly email report covering key metrics such as traffic, leads, conversions, cost per lead, return on ad spend, and keyword rankings. In addition, you get access to a live, real-time dashboard that you can check any time of day. Your dedicated marketing manager will also walk you through the numbers on a monthly strategy call and present actionable recommendations for the following month.",
  },
];

export default function MarketingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main className="pt-[104px]">

        {/* Hero Section */}
        <section className="relative bg-[var(--color-bg)] overflow-hidden py-24 md:py-32">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
              style={{ background: "var(--color-gold)" }}
            />
            <div
              className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl"
              style={{ background: "var(--color-gold)" }}
            />
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="flex flex-col items-center gap-6"
            >
              <motion.div variants={fadeUp}>
                <span className="section-badge">Marketing Solutions</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-4xl md:text-6xl font-extrabold leading-tight"
                style={{ color: "var(--color-text)" }}
              >
                Marketing That{" "}
                <span className="text-gold-gradient">Converts Visitors</span>{" "}
                Into Paying Customers
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-lg md:text-xl max-w-2xl"
                style={{ color: "var(--color-text-secondary)" }}
              >
                AI-powered marketing campaigns that generate leads, nurture
                prospects, and close deals automatically. Stop guessing — start
                growing with a strategy built on data and delivered by experts
                who are obsessed with your results.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-4 mt-2"
              >
                <Link href="/contact" className="btn-gold">
                  Get Your Free Marketing Audit
                </Link>
                <Link href="#packages" className="btn-outline">
                  View Packages
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="max-w-5xl mx-auto px-4 sm:px-6 mt-16"
          >
            <div className="card grid grid-cols-2 md:grid-cols-4 gap-6 text-center py-8">
              {[
                { value: "10x", label: "Average ROI" },
                { value: "50,000+", label: "Leads Generated" },
                { value: "98%", label: "Client Satisfaction" },
                { value: "24/7", label: "Campaign Monitoring" },
              ].map((stat, i) => (
                <div key={i}>
                  <div
                    className="text-3xl font-extrabold text-gold-gradient"
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
            </div>
          </motion.div>
        </section>

        {/* Services Section */}
        <section
          id="services"
          className="bg-[var(--color-bg-secondary)] py-24"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">
                What We Do
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-5xl font-extrabold mt-4"
                style={{ color: "var(--color-text)" }}
              >
                Every Channel. One Team. One Goal.
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Our integrated marketing services work together to build a
                consistent pipeline of qualified leads that your sales team can
                close. From organic traffic to paid ads to automated email flows
                — we cover every touchpoint in the modern customer journey.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {services.map((service, i) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="card p-6 flex flex-col gap-4 hover:scale-[1.02] transition-transform duration-300"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--color-gold) 0%, #b8860b 100%)",
                      }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3
                      className="text-xl font-bold"
                      style={{ color: "var(--color-text)" }}
                    >
                      {service.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {service.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Results / Before & After Section */}
        <section className="bg-[var(--color-bg)] py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">
                Real Results
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-5xl font-extrabold mt-4"
                style={{ color: "var(--color-text)" }}
              >
                The KVL Marketing Difference
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Our clients do not just see vanity metric improvements — they
                see measurable revenue growth. Here is a typical transformation
                within the first six months of partnering with KVL TECH.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Before */}
              <motion.div
                variants={fadeUp}
                className="card p-8 border-2"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-red-500 rotate-180" />
                  </div>
                  <h3
                    className="text-xl font-bold"
                    style={{ color: "var(--color-text)" }}
                  >
                    Before KVL Marketing
                  </h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "50 website visitors per month",
                    "2 leads per month",
                    "$500 monthly revenue from digital",
                    "No clear strategy or reporting",
                    "Inconsistent social media presence",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        ✕
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* After */}
              <motion.div
                variants={fadeUp}
                className="card p-8 border-2"
                style={{ borderColor: "var(--color-gold)" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "var(--color-gold)" }}
                  >
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3
                    className="text-xl font-bold text-gold-gradient"
                  >
                    After KVL Marketing
                  </h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "2,000 website visitors per month",
                    "80 qualified leads per month",
                    "$8,000 monthly revenue from digital",
                    "Live dashboard with weekly reports",
                    "Consistent brand presence across all channels",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <CheckCircle
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                        style={{ color: "var(--color-gold)" }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>

            {/* Case Study */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              className="mt-10 card p-8 border-l-4"
              style={{ borderColor: "var(--color-gold)" }}
            >
              <div className="flex items-start gap-4">
                <Star
                  className="w-8 h-8 flex-shrink-0 mt-1"
                  style={{ color: "var(--color-gold)" }}
                />
                <div>
                  <h4
                    className="text-lg font-bold mb-2"
                    style={{ color: "var(--color-text)" }}
                  >
                    Case Study: Priya's Restaurant in Mumbai
                  </h4>
                  <p style={{ color: "var(--color-text-secondary)" }}>
                    Priya's Restaurant was struggling with low online visibility
                    and inconsistent customer flow despite having outstanding
                    food and service. After partnering with KVL TECH, we
                    launched a comprehensive SEO campaign targeting local search
                    terms combined with an automated WhatsApp marketing sequence
                    that re-engaged past customers with offers and new menu
                    items. Within 90 days, Priya's saw a{" "}
                    <strong style={{ color: "var(--color-text)" }}>
                      3x increase in revenue
                    </strong>{" "}
                    — growing from 10 daily orders to 35 daily orders. The
                    restaurant now ranks #1 on Google Maps for its locality and
                    has a 4.9-star rating backed by over 200 new verified
                    reviews generated through our post-visit follow-up campaign.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Packages Section */}
        <section
          id="packages"
          className="bg-[var(--color-bg-secondary)] py-24"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">
                Pricing
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-5xl font-extrabold mt-4"
                style={{ color: "var(--color-text)" }}
              >
                Straightforward Marketing Packages
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                No hidden fees, no surprise invoices, and no long-term
                lock-ins. Choose the plan that fits your current growth stage
                and upgrade at any time as your business scales.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {packages.map((pkg, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`card p-8 flex flex-col gap-5 relative ${
                    pkg.highlight
                      ? "border-2"
                      : "border border-[var(--color-border)]"
                  }`}
                  style={
                    pkg.highlight
                      ? { borderColor: "var(--color-gold)" }
                      : {}
                  }
                >
                  {pkg.highlight && (
                    <div
                      className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: "var(--color-gold)" }}
                    >
                      Most Popular
                    </div>
                  )}
                  <div>
                    <h3
                      className="text-xl font-bold"
                      style={{ color: "var(--color-text)" }}
                    >
                      {pkg.name}
                    </h3>
                    <div className="flex items-end gap-1 mt-2">
                      <span className="text-4xl font-extrabold text-gold-gradient">
                        {pkg.price}
                      </span>
                      <span
                        className="text-sm mb-1"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {pkg.period}
                      </span>
                    </div>
                  </div>
                  <ul className="flex flex-col gap-3 flex-1">
                    {pkg.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle
                          className="w-4 h-4 flex-shrink-0 mt-0.5"
                          style={{ color: "var(--color-gold)" }}
                        />
                        <span style={{ color: "var(--color-text-secondary)" }}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={pkg.highlight ? "btn-gold" : "btn-outline"}
                  >
                    {pkg.cta}
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center text-sm mt-8"
              style={{ color: "var(--color-text-secondary)" }}
            >
              All prices in USD. Ad spend budget is separate and goes directly
              to the advertising platforms. Cancel any time with 30 days notice.
            </motion.p>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="bg-[var(--color-bg)] py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">
                Why KVL TECH
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-5xl font-extrabold mt-4"
                style={{ color: "var(--color-text)" }}
              >
                We Treat Your Budget Like It Is Our Own
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Hundreds of businesses have trusted KVL TECH with their
                marketing because we combine the strategy of a large agency with
                the personal attention of a boutique firm. Here is what sets us
                apart.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {whyChooseUs.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="card p-6 flex gap-5"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--color-gold) 0%, #b8860b 100%)",
                      }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3
                        className="text-lg font-bold mb-2"
                        style={{ color: "var(--color-text)" }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-[var(--color-bg-secondary)] py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">
                FAQ
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-5xl font-extrabold mt-4"
                style={{ color: "var(--color-text)" }}
              >
                Common Questions Answered
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-lg"
                style={{ color: "var(--color-text-secondary)" }}
              >
                We believe informed clients are the best clients. Here are the
                questions we hear most often before businesses decide to partner
                with us.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
              className="flex flex-col gap-3"
            >
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="card overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left gap-4"
                  >
                    <span
                      className="font-semibold text-sm md:text-base"
                      style={{ color: "var(--color-text)" }}
                    >
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                      style={{ color: "var(--color-gold)" }}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p
                          className="px-5 pb-5 text-sm leading-relaxed"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[var(--color-bg)] py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="flex flex-col items-center gap-6"
            >
              <motion.span variants={fadeUp} className="section-badge">
                Limited Offer
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-5xl font-extrabold"
                style={{ color: "var(--color-text)" }}
              >
                Get Your Free Marketing Audit
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-xl font-semibold text-gold-gradient"
              >
                Worth $299 — Yours Free This Month
              </motion.p>
              <motion.p
                variants={fadeUp}
                className="text-lg max-w-xl"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Our marketing specialists will analyse your current online
                presence, identify the biggest growth opportunities specific to
                your industry and location, and present a custom strategy to
                double your leads within 90 days — completely free, with no
                obligation to buy anything. Spots are limited each month, so
                claim yours today before they fill up.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/contact" className="btn-gold flex items-center gap-2">
                  Claim Your Free Audit
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/contact" className="btn-outline">
                  Talk to a Strategist
                </Link>
              </motion.div>
              <motion.p
                variants={fadeUp}
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                No credit card required. No commitment. Just actionable
                insights you can use immediately.
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
