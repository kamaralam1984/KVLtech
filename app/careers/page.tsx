"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Globe,
  TrendingUp,
  Zap,
  Shield,
  Heart,
  BookOpen,
  Gift,
  Plane,
  Monitor,
  Star,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
  ArrowRight,
  Code2,
  Palette,
  BarChart2,
  Headphones,
  Brain,
  Handshake,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const STATS = [
  { value: "50+", label: "Team Members" },
  { value: "100%", label: "Remote-Friendly" },
  { value: "10+", label: "Years in Business" },
  { value: "40+", label: "Countries Served" },
];

const CULTURE = [
  {
    icon: Zap,
    title: "Innovation First",
    desc: "We experiment relentlessly, fail fast, and ship weekly. Every team member is encouraged to propose bold ideas and test them in the real world. Stagnation is the only thing we fear — we celebrate learning from every mistake and use it to move forward smarter and faster.",
    color: "#C9A227",
  },
  {
    icon: Shield,
    title: "Full Ownership",
    desc: "You own your work — no micro-management, no hand-holding. We hire talented people and trust them completely. From architecture decisions to client deliverables, you drive the outcome. With great ownership comes great recognition: your wins are visible and rewarded.",
    color: "#0F172A",
  },
  {
    icon: BookOpen,
    title: "Continuous Growth",
    desc: "We invest ₹50,000 per employee per year in learning and development. Courses, certifications, conferences, books — you choose what helps you grow. Our internal knowledge-sharing sessions, bi-weekly tech talks, and mentorship programmes keep every team member sharp and ahead of the curve.",
    color: "#0891B2",
  },
  {
    icon: Heart,
    title: "Real Impact",
    desc: "Your code ships to 5,000+ businesses every single day. From a restaurant in Rajasthan to a school in Maharashtra, real entrepreneurs rely on what you build. That sense of purpose is not a talking point — it is something you will feel every time you open your laptop.",
    color: "#16A34A",
  },
];

const JOBS = [
  {
    icon: Code2,
    title: "Senior Full Stack Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    experience: "3+ years",
    skills: ["Next.js", "Node.js", "PostgreSQL"],
    color: "#C9A227",
  },
  {
    icon: Palette,
    title: "UI/UX Designer",
    department: "Design",
    location: "Remote / Noida",
    type: "Full-time",
    experience: "2+ years",
    skills: ["Figma", "User Research", "Prototyping"],
    color: "#7C3AED",
  },
  {
    icon: BarChart2,
    title: "Digital Marketing Manager",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    experience: "3+ years",
    skills: ["SEO", "PPC", "Social Media"],
    color: "#0891B2",
  },
  {
    icon: Handshake,
    title: "Sales Executive",
    department: "Sales",
    location: "Noida / Delhi",
    type: "Full-time",
    experience: "1+ year",
    skills: ["B2B Sales", "CRM", "Communication"],
    color: "#EF4444",
  },
  {
    icon: Brain,
    title: "AI/ML Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    experience: "2+ years",
    skills: ["Python", "LLMs", "NLP"],
    color: "#16A34A",
  },
  {
    icon: Headphones,
    title: "Customer Success Lead",
    department: "Operations",
    location: "Remote",
    type: "Full-time",
    experience: "2+ years",
    skills: ["Client Onboarding", "Retention"],
    color: "#F59E0B",
  },
];

const BENEFITS = [
  { icon: TrendingUp, label: "Competitive salary + equity", desc: "Market-leading pay with meaningful equity participation so you share in the upside." },
  { icon: Globe, label: "100% remote option", desc: "Work from anywhere in the world. Our async-first culture makes remote the default, not the exception." },
  { icon: BookOpen, label: "₹50,000 learning budget/year", desc: "Courses, certifications, conferences — invest in yourself on us, every single year." },
  { icon: Heart, label: "Health insurance for family", desc: "Comprehensive medical coverage for you and your entire family from day one." },
  { icon: Plane, label: "30 days paid leave", desc: "Rest is productive. Take 30 days off without any questions asked — recharge fully." },
  { icon: Star, label: "Stock option plan", desc: "Earn equity that grows with the company. We believe the people who build it should own a piece of it." },
  { icon: Monitor, label: "Free KVL TECH software suite", desc: "Full access to every product we make — use them for your business, side projects, or family needs." },
  { icon: Gift, label: "Annual team retreat", desc: "Once a year, the whole team gathers for a multi-day offsite — to bond, brainstorm, and celebrate wins." },
];

const PROCESS = [
  {
    step: "01",
    icon: Send,
    title: "Apply Online",
    desc: "Fill out our 5-minute application form below. Tell us who you are, what you have built, and why you want to join KVL TECH. No lengthy cover letters — just honest answers. We review every application personally within 48 hours.",
  },
  {
    step: "02",
    icon: Users,
    title: "2 Interviews",
    desc: "One technical interview to assess skills relevant to the role, and one culture-fit conversation with the team lead. Both rounds are conducted entirely online at your convenience. No trick questions — we want to understand how you think and work.",
  },
  {
    step: "03",
    icon: CheckCircle,
    title: "Get Your Offer",
    desc: "We move fast. You will receive a formal offer letter within 7 days of your final interview. Salary, equity, benefits, and start date are all discussed transparently — no games, no lowball tactics. We want you excited from day one.",
  },
];

const FAQS = [
  {
    q: "Is the interview process long?",
    a: "No. Our entire process consists of just 2 rounds — one technical and one culture fit. Most candidates complete the full process within 1 week of applying. We respect your time and keep things efficient and focused.",
  },
  {
    q: "What is the tech stack at KVL TECH?",
    a: "Our primary stack is Next.js 16, Node.js, PostgreSQL, Redis, and AWS. We also work with Python for AI/ML workloads, Figma for design, and a range of SaaS and automation tools. We keep our stack modern and pragmatic.",
  },
  {
    q: "Do you sponsor work visas?",
    a: "We do not sponsor work visas at this time. However, we warmly welcome international remote workers. If you are based outside India and are eligible to work remotely for an Indian company, you are absolutely welcome to apply.",
  },
  {
    q: "Is the remote work policy really flexible?",
    a: "Yes, genuinely 100% remote. We have an optional office in Noida for those who prefer working in person, but there is absolutely no pressure to use it. Our team is spread across 15 Indian states and multiple countries — remote is our default culture.",
  },
  {
    q: "How often are salaries reviewed?",
    a: "Salaries are reviewed every 6 months based on individual performance, market benchmarks, and company growth. High performers consistently see above-market increments. We do not believe in yearly-only reviews — your growth should be continuous.",
  },
  {
    q: "Do interns receive pre-placement offers (PPOs)?",
    a: "Yes. Top-performing interns receive pre-placement offers at the end of their internship. We actively scout for talent early and prefer to grow people from within. Many of our current senior team members started as interns at KVL TECH.",
  },
];

const LIFE_STATS = [
  { value: "27", label: "Average Team Age" },
  { value: "40%", label: "Women in Tech" },
  { value: "15", label: "States Represented" },
  { value: "12", label: "Open-Source Contributions" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function CareersPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    experience: "",
    portfolio: "",
    why: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          position: formData.role,
          experience: formData.experience,
          portfolio: formData.portfolio,
          coverLetter: formData.why,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setToast({ msg: "Application submitted successfully!", type: "success" });
      } else {
        const d = await res.json();
        setToast({ msg: d.error || "Something went wrong. Please try again.", type: "error" });
      }
    } catch {
      setToast({ msg: "Network error. Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 5000);
    }
  }

  return (
    <>
      <Navbar />
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold transition-all ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
      <main className="pt-[104px]">

        {/* ── Hero ── */}
        <section className="py-20 lg:py-28 bg-[var(--color-bg-secondary)] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[var(--color-gold)]/5 blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[var(--color-navy)]/5 blur-[100px]" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeInUp} className="flex justify-center mb-6">
                <span className="section-badge">We&apos;re Hiring</span>
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-[var(--color-text)] mb-6"
              >
                Join KVL TECH —{" "}
                <span className="text-gold-gradient">Build the Future</span>
                <br className="hidden sm:block" /> of Digital Business
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto mb-10 leading-relaxed"
              >
                We are a fast-growing team of builders, designers, and dreamers. Come help 10,000+ businesses go digital and experience the power of technology that truly changes lives. Every line of code you write reaches thousands of entrepreneurs across India and the world.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#open-positions" className="btn-gold">
                  View Open Positions <ArrowRight className="inline ml-2 w-4 h-4" />
                </a>
                <a href="#apply" className="btn-outline">
                  Apply Now
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
              {STATS.map((s) => (
                <motion.div key={s.label} variants={fadeInUp} className="card text-center py-6">
                  <p className="text-3xl font-extrabold text-gold-gradient">{s.value}</p>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Culture ── */}
        <section className="py-20 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeInUp} className="section-badge mb-4 inline-block">
                Our Culture
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)]">
                Why Exceptional People Choose <span className="text-gold-gradient">KVL TECH</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-4 text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                We have spent 10 years building not just great products, but a workplace where talented people thrive, grow, and do the best work of their careers.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {CULTURE.map((c) => (
                <motion.div key={c.title} variants={fadeInUp} className="card p-6 flex flex-col gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${c.color}20` }}
                  >
                    <c.icon className="w-6 h-6" style={{ color: c.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-text)]">{c.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{c.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Open Positions ── */}
        <section id="open-positions" className="py-20 bg-[var(--color-bg-secondary)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeInUp} className="section-badge mb-4 inline-block">
                Open Positions
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)]">
                Find Your <span className="text-gold-gradient">Perfect Role</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-4 text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                We are hiring across engineering, design, marketing, sales, and operations. Remote-first positions open to candidates across India and internationally.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {JOBS.map((job) => (
                <motion.div
                  key={job.title}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className="card p-6 flex flex-col gap-4 hover:border-[var(--color-gold)] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${job.color}20` }}
                    >
                      <job.icon className="w-6 h-6" style={{ color: job.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--color-text)] leading-snug">{job.title}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">{job.department}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-[var(--color-text-secondary)]">
                    <span className="flex items-center gap-1 bg-[var(--color-bg-secondary)] px-2 py-1 rounded-full border border-[var(--color-border)]">
                      <MapPin className="w-3 h-3" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1 bg-[var(--color-bg-secondary)] px-2 py-1 rounded-full border border-[var(--color-border)]">
                      <Clock className="w-3 h-3" /> {job.type}
                    </span>
                    <span className="flex items-center gap-1 bg-[var(--color-bg-secondary)] px-2 py-1 rounded-full border border-[var(--color-border)]">
                      <Briefcase className="w-3 h-3" /> {job.experience}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{ background: `${job.color}15`, color: job.color }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <a
                    href="#apply"
                    className="mt-auto text-sm font-semibold flex items-center gap-1"
                    style={{ color: job.color }}
                  >
                    Apply for this role <ArrowRight className="w-4 h-4" />
                  </a>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Benefits ── */}
        <section className="py-20 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeInUp} className="section-badge mb-4 inline-block">
                Benefits & Perks
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)]">
                Everything You Need to <span className="text-gold-gradient">Do Your Best Work</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-4 text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                We designed our benefits package around one principle: remove every obstacle between you and great work. Here is what every KVL TECH team member gets from day one.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {BENEFITS.map((b) => (
                <motion.div key={b.label} variants={fadeInUp} className="card p-6 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-gold)]/15 flex items-center justify-center">
                    <b.icon className="w-5 h-5" style={{ color: "var(--color-gold)" }} />
                  </div>
                  <h4 className="font-bold text-[var(--color-text)] text-sm leading-snug">{b.label}</h4>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{b.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Life at KVL TECH ── */}
        <section className="py-20 bg-[var(--color-bg-secondary)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeInUp} className="section-badge mb-4 inline-block">
                Life at KVL TECH
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)]">
                A Team as Diverse as the <span className="text-gold-gradient">Businesses We Serve</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-4 text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                We believe diversity of thought, background, and experience builds better products. Our team reflects the richness and variety of India — and the world.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
            >
              {LIFE_STATS.map((s) => (
                <motion.div
                  key={s.label}
                  variants={fadeInUp}
                  className="card text-center py-8 px-4"
                  style={{ borderTop: "3px solid var(--color-gold)" }}
                >
                  <p className="text-4xl font-extrabold text-gold-gradient mb-2">{s.value}</p>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="card p-8 lg:p-12 text-center max-w-3xl mx-auto"
            >
              <p className="text-lg text-[var(--color-text)] leading-relaxed">
                &ldquo;At KVL TECH, you are not just an employee — you are a co-owner of the mission. We celebrate every culture, support every ambition, and champion every voice. Whether you are a first-generation tech professional from a small town or a seasoned engineer from a metro city, you belong here.&rdquo;
              </p>
              <p className="mt-6 font-bold text-[var(--color-gold)]">— Rahul Sharma, CEO & Founder</p>
            </motion.div>
          </div>
        </section>

        {/* ── Application Process ── */}
        <section className="py-20 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeInUp} className="section-badge mb-4 inline-block">
                How to Join
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)]">
                Our <span className="text-gold-gradient">Simple 3-Step</span> Process
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-4 text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                We hire fast, hire right, and make sure you feel respected at every step. From application to offer in as little as 7 days — because great candidates should not wait.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid md:grid-cols-3 gap-8 relative"
            >
              {PROCESS.map((p, i) => (
                <motion.div key={p.title} variants={fadeInUp} className="card p-8 flex flex-col gap-4 text-center relative">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center">
                      <p.icon className="w-7 h-7" style={{ color: "var(--color-gold)" }} />
                    </div>
                  </div>
                  <span className="text-5xl font-extrabold text-[var(--color-gold)]/20 absolute top-4 right-6 select-none">
                    {p.step}
                  </span>
                  <h3 className="text-xl font-bold text-[var(--color-text)]">{p.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{p.desc}</p>
                  {i < PROCESS.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 z-10">
                      <ArrowRight className="w-6 h-6 text-[var(--color-gold)]" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Application Form ── */}
        <section id="apply" className="py-20 bg-[var(--color-bg-secondary)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.span variants={fadeInUp} className="section-badge mb-4 inline-block">
                Apply Today
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)]">
                Start Your <span className="text-gold-gradient">KVL TECH Journey</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-4 text-[var(--color-text-secondary)]">
                Takes 5 minutes. We read every application. No automated rejections — a real human will review your submission and respond within 48 hours.
              </motion.p>
            </motion.div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-12 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">Application Received!</h3>
                <p className="text-[var(--color-text-secondary)]">
                  Thank you for applying to KVL TECH. Our hiring team will review your application and reach out within 48 hours. Get ready — your next big chapter might be just around the corner.
                </p>
              </motion.div>
            ) : (
              <motion.form
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                onSubmit={handleSubmit}
                className="card p-8 space-y-6"
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Rahul Sharma"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="rahul@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">Years of Experience *</label>
                    <input
                      type="text"
                      name="experience"
                      required
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="e.g. 3 years"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">Role Applying For *</label>
                  <select
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                  >
                    <option value="">Select a role...</option>
                    {JOBS.map((j) => (
                      <option key={j.title} value={j.title}>
                        {j.title}
                      </option>
                    ))}
                    <option value="Other">Other / General Application</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">LinkedIn / Portfolio URL</label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">Why KVL TECH? *</label>
                  <textarea
                    name="why"
                    required
                    rows={4}
                    value={formData.why}
                    onChange={handleChange}
                    placeholder="Tell us what excites you about joining KVL TECH and what you would bring to the team..."
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none"
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn-gold w-full py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitting ? "Submitting..." : <>Submit Application <Send className="inline ml-2 w-4 h-4" /></>}
                </button>
                <p className="text-xs text-center text-[var(--color-text-secondary)]">
                  We respond to every application within 48 hours. No spam, ever.
                </p>
              </motion.form>
            )}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 bg-[var(--color-bg)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.span variants={fadeInUp} className="section-badge mb-4 inline-block">
                FAQs
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)]">
                Questions We Hear <span className="text-gold-gradient">Most Often</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-4 text-[var(--color-text-secondary)]">
                Transparent answers about how we work, how we hire, and what it is really like to be part of the KVL TECH team.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="space-y-3"
            >
              {FAQS.map((faq, i) => (
                <motion.div key={i} variants={fadeInUp} className="card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left gap-4"
                  >
                    <span className="font-semibold text-[var(--color-text)]">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className="w-5 h-5 text-[var(--color-gold)] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[var(--color-text-secondary)] shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-6"
                    >
                      <p className="text-[var(--color-text-secondary)] leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 bg-[var(--color-bg-secondary)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.span variants={fadeInUp} className="section-badge mb-6 inline-block">
                Don&apos;t See Your Role?
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] mb-6">
                We Create Roles for <span className="text-gold-gradient">Exceptional People</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-8 leading-relaxed">
                If you are talented and passionate about building great digital products, we want to hear from you — even if there is no open position that matches your profile today. We have created entire new roles for the right people before, and we will do it again.
              </motion.p>
              <motion.div variants={fadeInUp} className="card p-8 max-w-xl mx-auto">
                <p className="text-[var(--color-text)] font-medium mb-4">
                  Send your resume and a short note about what you do best to:
                </p>
                <a
                  href="mailto:careers@kvlbusinesssolutions.com"
                  className="btn-gold inline-flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  careers@kvlbusinesssolutions.com
                </a>
                <p className="text-xs text-[var(--color-text-secondary)] mt-4">
                  We personally read every email and promise a response within 72 hours.
                </p>
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
