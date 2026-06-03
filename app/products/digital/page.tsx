"use client";

import { motion } from "framer-motion";
import {
  Palette,
  Layout,
  Share2,
  Printer,
  Mail,
  Presentation,
  Download,
  CheckCircle,
  Star,
  Package,
  FileType,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Clock,
  Users,
  Award,
  Sparkles,
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

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const assetCategories = [
  {
    icon: Palette,
    name: "Logo & Brand Identity",
    description:
      "Build a brand that commands attention. Each logo pack includes vector source files, a curated color palette, typography guide, business card templates, and letterhead designs. Everything you need to launch a cohesive, professional brand from day one.",
    priceRange: "$49 – $199",
    highlights: ["Vector logos (SVG/AI/EPS)", "Color palette guide", "Typography system", "Business card templates", "Letterhead & envelope designs"],
  },
  {
    icon: Layout,
    name: "Website UI Kit",
    description:
      "Accelerate your web projects with 100+ ready-to-use UI components built in Figma. Includes both dark and light mode variants, mobile-responsive layouts, and fully organized layers. Plug directly into your next web or app project.",
    priceRange: "$79 – $149",
    highlights: ["100+ UI components", "Figma source file included", "Dark & light mode", "Mobile responsive layouts", "Organized layer structure"],
  },
  {
    icon: Share2,
    name: "Social Media Kit",
    description:
      "Dominate every platform with 50 professionally designed templates covering Instagram posts, stories, reels, YouTube thumbnails, and LinkedIn banners. Consistent branding across all channels has never been this easy or this affordable.",
    priceRange: "$39 – $89",
    highlights: ["50 editable templates", "Instagram posts & stories", "YouTube thumbnails", "LinkedIn banners", "Reels & short-video formats"],
  },
  {
    icon: Printer,
    name: "Marketing Materials",
    description:
      "Take your brand offline with print-ready marketing collateral. Brochures, flyers, posters, and roll-up banners at 300 DPI resolution — fully print-shop ready. Hand these files directly to your printer and get stunning results every time.",
    priceRange: "$49 – $129",
    highlights: ["Brochures & tri-folds", "Flyers & event posters", "Roll-up banner designs", "300 DPI print-ready files", "Bleed & crop marks included"],
  },
  {
    icon: Mail,
    name: "Email Templates",
    description:
      "Convert more subscribers with 20 professionally coded HTML email templates. Covers newsletters, promotional campaigns, and transactional emails. Tested across all major email clients including Gmail, Outlook, and Apple Mail.",
    priceRange: "$29 – $79",
    highlights: ["20 HTML email designs", "Newsletter templates", "Promotional campaigns", "Transactional email formats", "Tested on Gmail & Outlook"],
  },
  {
    icon: Presentation,
    name: "Presentation Templates",
    description:
      "Close deals and impress stakeholders with 50-slide PowerPoint and Google Slides templates featuring smooth animations and built-in data visualization charts. Polished, professional, and ready to customize with your content in minutes.",
    priceRange: "$49 – $99",
    highlights: ["50 slides per template", "PowerPoint & Google Slides", "Smooth slide animations", "Data visualization charts", "Easy content replacement"],
  },
];

const fileFormats = ["SVG", "PNG", "PDF", "PSD", "AI", "Figma", "PowerPoint", "HTML"];

const whyUs = [
  {
    icon: Award,
    title: "Certified Professional Designers",
    desc: "Every asset is crafted by designers with 5+ years of experience and industry certifications. No amateurs, no stock rehashes — original, high-quality work every time.",
  },
  {
    icon: Zap,
    title: "Pixel-Perfect & Print-Ready",
    desc: "Our assets meet the highest technical standards — razor-sharp at any size on screen, and perfectly prepared at 300 DPI for physical printing. Zero rework needed.",
  },
  {
    icon: Star,
    title: "Optimized for Web and Print",
    desc: "Each file format is purpose-built for its use case. SVGs scale infinitely for web, PDFs are press-ready, and PSDs give you full creative control in Photoshop.",
  },
  {
    icon: Users,
    title: "Industry-Specific Design Themes",
    desc: "Find assets tailored to your niche — restaurant & hospitality, medical & healthcare, education & school, corporate & finance. Your industry, your aesthetic.",
  },
];

const faqs = [
  {
    question: "Can I use these assets for commercial projects?",
    answer:
      "Absolutely. Every asset comes with a full commercial license. You can use them in client work, commercial websites, paid advertisements, and business materials without any restrictions or additional fees.",
  },
  {
    question: "What software do I need to open the files?",
    answer:
      "It depends on the format. Figma files open in the free Figma app (browser-based). AI and PSD files require Adobe Illustrator or Photoshop. However, most packs also include PNG and PDF versions that require no special software at all.",
  },
  {
    question: "Can I resell the assets to my clients as part of a project?",
    answer:
      "Yes. Our commercial license explicitly covers this. If you are a freelancer or agency delivering a brand package to a client, you are fully licensed to include these assets as part of your deliverables.",
  },
  {
    question: "Are revisions included with digital asset purchases?",
    answer:
      "Standard digital asset downloads are final as displayed — what you see in the preview is what you receive. If you need changes, our Custom Design Service includes 3 revision rounds to ensure you are completely satisfied.",
  },
  {
    question: "What if I have trouble downloading or the files are corrupted?",
    answer:
      "Your purchase is saved to your account and you can re-download at any time. If you encounter any technical issue, contact our support team and we will resolve it within 24 hours — guaranteed.",
  },
  {
    question: "Can I get a refund after downloading?",
    answer:
      "Because digital products are delivered instantly and cannot be 'returned,' we are unable to offer refunds after download. However, we stand behind every asset. If something does not match its description, we will make it right.",
  },
];

const deliverySteps = [
  { step: "01", title: "Purchase", desc: "Choose your asset pack and add to cart." },
  { step: "02", title: "Secure Payment", desc: "Checkout via credit card or PayPal." },
  { step: "03", title: "Download ZIP", desc: "Instant access to your files after payment." },
  { step: "04", title: "Use Immediately", desc: "All files ready — no waiting, no approval." },
];

export default function DigitalAssetsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    assetType: "",
    brief: "",
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Navbar />
      <main className="pt-16">

        {/* Hero Section */}
        <section className="relative bg-[var(--color-bg)] overflow-hidden py-24 md:py-32">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[var(--color-gold)] opacity-5 blur-3xl" />
          </div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <span className="section-badge">Digital Assets</span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-[var(--color-text)]"
            >
              Premium Digital Assets That Make Your{" "}
              <span className="text-gold-gradient">Brand Unforgettable</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto leading-relaxed"
            >
              Logos, UI kits, templates, and brand packages designed by professionals — instant download, commercial license included. Stop settling for generic. Start standing out.
            </motion.p>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap justify-center gap-4"
            >
              <a href="#categories" className="btn-gold inline-flex items-center gap-2">
                Browse Asset Categories <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#custom" className="btn-outline inline-flex items-center gap-2">
                Request Custom Design
              </a>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6"
            >
              {[
                { value: "500+", label: "Assets Available" },
                { value: "Instant", label: "Download" },
                { value: "Commercial", label: "License Included" },
                { value: "24–48h", label: "Custom Design" },
              ].map((stat) => (
                <motion.div key={stat.label} variants={fadeUp} className="card text-center py-6 px-4">
                  <div className="text-2xl font-extrabold text-gold-gradient">{stat.value}</div>
                  <div className="mt-1 text-sm text-[var(--color-text-secondary)]">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Asset Categories */}
        <section id="categories" className="bg-[var(--color-bg-secondary)] py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
              <span className="section-badge">Our Collections</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[var(--color-text)]">
                Six Categories. Every Asset Your Business Needs.
              </h2>
              <p className="mt-4 text-[var(--color-text-secondary)] max-w-2xl mx-auto text-lg">
                From first impression to final presentation — our asset library covers every touchpoint of your brand experience. Browse by category and download what you need, when you need it.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {assetCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <motion.div key={cat.name} variants={fadeUp} className="card group hover:border-[var(--color-gold)] transition-all duration-300 flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-[var(--color-gold)] bg-opacity-10 shrink-0">
                        <Icon className="w-6 h-6" style={{ color: "var(--color-gold)" }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[var(--color-text)]">{cat.name}</h3>
                        <span className="text-sm font-semibold text-gold-gradient">{cat.priceRange}</span>
                      </div>
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-4">{cat.description}</p>
                    <ul className="mt-auto space-y-2">
                      {cat.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                          <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "var(--color-gold)" }} />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <button className="btn-primary mt-6 w-full text-sm">
                      View Collection
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Featured Bundle */}
        <section className="bg-[var(--color-bg)] py-20 md:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
              <span className="section-badge">Best Value</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[var(--color-text)]">
                The Business Starter Bundle
              </h2>
              <p className="mt-4 text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
                Get everything a new or growing business needs to look professional across every channel — at one unbeatable price.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="card border-2 border-[var(--color-gold)] relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 bg-[var(--color-gold)] text-[var(--color-navy)] text-xs font-bold px-3 py-1 rounded-full">
                SAVE $48
              </div>
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <h3 className="text-2xl font-extrabold text-[var(--color-text)] mb-2">Business Starter Bundle</h3>
                  <p className="text-[var(--color-text-secondary)] mb-6">
                    The smartest way to launch your brand. This bundle combines three of our most popular packs — Logo & Brand Identity, Social Media Kit, and Email Templates — at a steep discount. You get a unified visual identity across print, social, and email from day one.
                  </p>
                  <div className="space-y-3 mb-8">
                    {[
                      "Logo & Brand Identity pack (normally $49+)",
                      "Social Media Kit — 50 templates (normally $39+)",
                      "Email Templates — 20 HTML designs (normally $29+)",
                      "Full commercial license on all three packs",
                      "Instant download, no subscription",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm text-[var(--color-text-secondary)]">
                        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--color-gold)" }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-extrabold text-gold-gradient mb-2">$129</div>
                  <div className="text-[var(--color-text-secondary)] line-through text-xl mb-1">$177 if bought separately</div>
                  <div className="text-sm text-[var(--color-text-secondary)] mb-6">One-time payment. No subscription. No expiry.</div>
                  <button className="btn-gold w-full text-base flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" /> Get the Bundle — $129
                  </button>
                  <p className="mt-3 text-xs text-[var(--color-text-secondary)]">Instant ZIP download after payment</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* File Formats */}
        <section className="bg-[var(--color-bg-secondary)] py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <span className="section-badge">Compatibility</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[var(--color-text)]">
                Every File Format You Could Ever Need
              </h2>
              <p className="mt-4 text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
                We do not make you choose. Our packs include all major formats so you can open, edit, and deliver your assets regardless of which tools you use — no format hunting, no conversions, no frustration.
              </p>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              {fileFormats.map((fmt) => (
                <motion.div
                  key={fmt}
                  variants={fadeUp}
                  className="card px-6 py-4 text-center min-w-[80px] font-bold text-[var(--color-text)]"
                >
                  <FileType className="w-5 h-5 mx-auto mb-2" style={{ color: "var(--color-gold)" }} />
                  {fmt}
                </motion.div>
              ))}
            </motion.div>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-8 text-[var(--color-text-secondary)]"
            >
              SVG scales infinitely for web. PNG exports for quick sharing. PDF and AI are press-ready. Figma, PSD, and PowerPoint give you full editing control. HTML templates drop straight into your email platform.
            </motion.p>
          </div>
        </section>

        {/* Commercial License */}
        <section className="bg-[var(--color-bg)] py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="card border-l-4 border-[var(--color-gold)] md:flex items-start gap-8">
              <div className="shrink-0 mb-6 md:mb-0">
                <ShieldCheck className="w-16 h-16" style={{ color: "var(--color-gold)" }} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-4">
                  Full Commercial License — Use Everywhere, Forever
                </h2>
                <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed mb-4">
                  Every asset you purchase comes with a lifetime commercial license. Use it in unlimited client projects, paid advertisements, product packaging, merchandise, and commercial websites. No attribution required. No annual renewals. No per-project fees.
                </p>
                <div className="grid sm:grid-cols-3 gap-4 mt-6">
                  {[
                    "Unlimited client projects",
                    "No attribution required",
                    "Lifetime license — never expires",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--color-gold)" }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why Our Assets */}
        <section className="bg-[var(--color-bg-secondary)] py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
              <span className="section-badge">Why KVL Digital</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[var(--color-text)]">
                Quality You Can See. Results You Can Measure.
              </h2>
              <p className="mt-4 text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
                There is no shortage of cheap templates online. Here is why thousands of businesses choose KVL Tech assets for their brand instead.
              </p>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {whyUs.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.title} variants={fadeUp} className="card flex gap-5 items-start">
                    <div className="p-3 rounded-xl shrink-0" style={{ background: "color-mix(in srgb, var(--color-gold) 12%, transparent)" }}>
                      <Icon className="w-6 h-6" style={{ color: "var(--color-gold)" }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--color-text)] mb-2">{item.title}</h3>
                      <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Delivery Process */}
        <section className="bg-[var(--color-bg)] py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
              <span className="section-badge">How It Works</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[var(--color-text)]">
                Purchase to Production in 4 Steps
              </h2>
              <p className="mt-4 text-[var(--color-text-secondary)] text-lg">
                No account setup required. No waiting period. Your files are ready the moment payment is confirmed.
              </p>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
            >
              {deliverySteps.map((s) => (
                <motion.div key={s.step} variants={fadeUp} className="card text-center">
                  <div className="text-4xl font-extrabold text-gold-gradient mb-3">{s.step}</div>
                  <h3 className="font-bold text-[var(--color-text)] mb-2">{s.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">{s.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Custom Design Service */}
        <section id="custom" className="bg-[var(--color-bg-secondary)] py-20 md:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <span className="section-badge">Custom Design Service</span>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[var(--color-text)]">
                  Need Something Unique? We Build It for You.
                </h2>
                <p className="mt-4 text-[var(--color-text-secondary)] text-lg leading-relaxed">
                  Our pre-made assets cover the essentials — but sometimes your brand demands something one-of-a-kind. Our professional design team creates fully custom assets tailored to your business, industry, and audience in just 24–48 hours.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Bespoke logo and full brand identity system",
                    "Custom social media template pack",
                    "Tailored presentation and pitch decks",
                    "3 revision rounds included",
                    "All source files delivered",
                    "Starting from just $99",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-[var(--color-text-secondary)]">
                      <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--color-gold)" }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                  <Clock className="w-5 h-5" style={{ color: "var(--color-gold)" }} />
                  <span>Delivery in 24–48 hours. Starting from <strong className="text-[var(--color-text)]">$99</strong>.</span>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="card">
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-6">Submit Your Design Brief</h3>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Your Name</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      type="text"
                      placeholder="John Smith"
                      className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Email Address</label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      type="email"
                      placeholder="john@company.com"
                      className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Asset Type Needed</label>
                    <select
                      name="assetType"
                      value={formData.assetType}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] transition-colors text-sm"
                    >
                      <option value="">Select asset type</option>
                      <option value="logo">Logo & Brand Identity</option>
                      <option value="social">Social Media Kit</option>
                      <option value="ui">Website UI Kit</option>
                      <option value="marketing">Marketing Materials</option>
                      <option value="email">Email Templates</option>
                      <option value="presentation">Presentation Templates</option>
                      <option value="other">Other / Full Brand Package</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Your Brief</label>
                    <textarea
                      name="brief"
                      value={formData.brief}
                      onChange={handleFormChange}
                      rows={4}
                      placeholder="Describe your business, preferred style, colors, and what you need..."
                      className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors text-sm resize-none"
                    />
                  </div>
                  <button type="submit" className="btn-gold w-full">
                    Send My Brief
                  </button>
                  <p className="text-xs text-[var(--color-text-secondary)] text-center">
                    We will respond with a quote within 2–4 hours on business days.
                  </p>
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[var(--color-bg)] py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
              <span className="section-badge">FAQ</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[var(--color-text)]">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-[var(--color-text-secondary)] text-lg">
                Everything you need to know before you buy. Still have a question? Chat with us — we respond instantly.
              </p>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-3"
            >
              {faqs.map((faq, i) => (
                <motion.div key={i} variants={fadeUp} className="card overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between text-left gap-4 py-1"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-semibold text-[var(--color-text)]">{faq.question}</span>
                    {openFaq === i ? (
                      <ChevronUp className="w-5 h-5 shrink-0" style={{ color: "var(--color-gold)" }} />
                    ) : (
                      <ChevronDown className="w-5 h-5 shrink-0" style={{ color: "var(--color-gold)" }} />
                    )}
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-3 pt-3 border-t border-[var(--color-border)]"
                    >
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-[var(--color-bg-secondary)] py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <span className="section-badge">Get Started</span>
              <h2 className="mt-4 text-3xl md:text-5xl font-extrabold text-[var(--color-text)]">
                Browse All Digital Assets — <span className="text-gold-gradient">Instant Download</span>, No Subscription Required
              </h2>
              <p className="mt-6 text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
                Over 500 professionally designed assets ready to download and use today. One-time purchase. Commercial license included. No ongoing fees, no account required, no waiting. Your brand upgrade is one click away.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <a href="#categories" className="btn-gold inline-flex items-center gap-2 text-base px-8 py-4">
                  <Package className="w-5 h-5" /> Browse All Collections
                </a>
                <Link href="/contact" className="btn-outline inline-flex items-center gap-2 text-base px-8 py-4">
                  Talk to a Designer
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-[var(--color-text-secondary)]">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" style={{ color: "var(--color-gold)" }} /> Instant download after payment</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" style={{ color: "var(--color-gold)" }} /> Full commercial license</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" style={{ color: "var(--color-gold)" }} /> No subscription needed</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" style={{ color: "var(--color-gold)" }} /> 500+ assets available</span>
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
