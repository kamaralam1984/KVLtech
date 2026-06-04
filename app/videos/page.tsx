"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Eye,
  Clock,
  Star,
  Mail,
  ChevronDown,
  ChevronUp,
  Video,
  List,
  CheckCircle,
  Bell,
  Subtitles,
  Download,
  Monitor,
  Calendar,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const CATEGORIES = [
  { label: "All", count: 50 },
  { label: "Getting Started", count: 8 },
  { label: "Websites", count: 14 },
  { label: "Software", count: 12 },
  { label: "Marketing", count: 8 },
  { label: "AI Tools", count: 5 },
  { label: "Advanced", count: 6 },
  { label: "Live Sessions", count: 4 },
];

const STATS = [
  { value: "50+", label: "Tutorial Videos", icon: Video },
  { value: "100K+", label: "Total Views", icon: Eye },
  { value: "4.9★", label: "Average Rating", icon: Star },
  { value: "Weekly", label: "New Video", icon: Calendar },
];

const THUMBNAIL_COLORS = [
  "from-blue-900 to-blue-700",
  "from-purple-900 to-purple-700",
  "from-emerald-900 to-emerald-700",
  "from-orange-900 to-orange-700",
  "from-rose-900 to-rose-700",
  "from-cyan-900 to-cyan-700",
  "from-indigo-900 to-indigo-700",
  "from-amber-900 to-amber-700",
  "from-teal-900 to-teal-700",
];

const VIDEOS = [
  {
    title: "Restaurant Website: Complete Setup Walkthrough",
    duration: "22:15",
    views: "8,200",
    category: "Websites",
    color: THUMBNAIL_COLORS[0],
  },
  {
    title: "School Management System: Full Demo",
    duration: "35:40",
    views: "6,800",
    category: "Software",
    color: THUMBNAIL_COLORS[1],
  },
  {
    title: "WhatsApp Bot: From Zero to Live in 1 Hour",
    duration: "18:30",
    views: "12,400",
    category: "AI Tools",
    color: THUMBNAIL_COLORS[2],
  },
  {
    title: "Marketing Automation: Send 1000 Messages Automatically",
    duration: "15:55",
    views: "9,100",
    category: "Marketing",
    color: THUMBNAIL_COLORS[3],
  },
  {
    title: "Hospital System: Patient Registration to Billing",
    duration: "28:20",
    views: "4,500",
    category: "Software",
    color: THUMBNAIL_COLORS[4],
  },
  {
    title: "SEO Setup: Rank Your Website on Google",
    duration: "20:10",
    views: "11,200",
    category: "Marketing",
    color: THUMBNAIL_COLORS[5],
  },
  {
    title: "E-commerce Store: Products, Cart, Payments Setup",
    duration: "32:45",
    views: "7,300",
    category: "Websites",
    color: THUMBNAIL_COLORS[6],
  },
  {
    title: "AI Chatbot Training: Feed Custom Data",
    duration: "14:20",
    views: "8,900",
    category: "AI Tools",
    color: THUMBNAIL_COLORS[7],
  },
  {
    title: "CRM Setup: Leads, Pipeline, Automation",
    duration: "25:00",
    views: "5,600",
    category: "Software",
    color: THUMBNAIL_COLORS[8],
  },
];

const PLAYLISTS = [
  {
    title: "Complete Beginner Series",
    description:
      "Everything you need to launch your first KVL TECH product. Start here if you are brand new to our platform — this series walks you through account setup, dashboard navigation, and your first deployment.",
    videos: 8,
    totalTime: "85 min",
    icon: "🚀",
    color: "from-blue-600 to-indigo-600",
  },
  {
    title: "Restaurant Business Toolkit",
    description:
      "A dedicated series for restaurant owners. Covers menu management, online ordering, table reservations, customer loyalty programs, and automated marketing campaigns to bring diners back.",
    videos: 6,
    totalTime: "72 min",
    icon: "🍽️",
    color: "from-orange-600 to-rose-600",
  },
  {
    title: "Marketing Mastery",
    description:
      "Learn how to market your business online using the KVL TECH suite. Topics include WhatsApp bulk campaigns, email automation, social media scheduling, and analysing your campaign results with built-in reports.",
    videos: 7,
    totalTime: "95 min",
    icon: "📈",
    color: "from-emerald-600 to-teal-600",
  },
];

const FAQS = [
  {
    question: "Are the tutorial videos free to watch?",
    answer:
      "Yes, completely free. Every video in the KVL TECH library is available to watch at no cost. There is no subscription required — simply visit our YouTube channel or watch directly on this page. We believe that learning should never be a barrier to success, so all educational content is openly accessible to every business owner.",
  },
  {
    question: "Are there subtitles or translations available?",
    answer:
      "English, Hindi, and Arabic subtitles are available on all major tutorial videos. We are actively expanding subtitle coverage to more languages including Tamil, Telugu, and Urdu. If you need a video subtitled in a specific language that is not yet available, please let us know and we will prioritise it.",
  },
  {
    question: "Can I download videos to watch offline?",
    answer:
      "Videos are available for online streaming on YouTube and this website. Offline download access is available for premium plan subscribers who can save tutorials directly to their devices for viewing without an internet connection — ideal for team training sessions or areas with limited connectivity.",
  },
  {
    question: "What video quality is available?",
    answer:
      "All tutorials are recorded and published in 1080p Full HD. Select advanced and live session recordings are available in 4K resolution for maximum clarity. We use professional screen recording equipment so you can read every label, button, and menu item on screen, even on large displays.",
  },
  {
    question: "Are live sessions recorded and available to watch later?",
    answer:
      "Yes, every live session is recorded in full. Recordings are processed and uploaded within 24 hours of the session ending. Live session recordings include the Q&A portion, so you can benefit from the questions other participants asked — often covering edge cases that standalone tutorials do not address.",
  },
  {
    question: "Can I request a specific tutorial topic?",
    answer:
      "Absolutely. We create new videos every week and actively prioritise topics based on viewer requests. If you have a specific workflow, feature, or use-case you would like us to cover, email us at support@kvlbusinesssolutions.com with the subject line 'Video Request'. The most-requested topics are scheduled first, so every request counts.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as unknown as never } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function VideosPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredVideos =
    activeCategory === "All"
      ? VIDEOS
      : VIDEOS.filter((v) => v.category === activeCategory);

  return (
    <>
      <Navbar />
      <main className="pt-[104px]">
        {/* ─── Hero ─── */}
        <section className="bg-[var(--color-bg)] py-24 px-4 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[var(--color-gold)] opacity-5 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-blue-500 opacity-5 blur-3xl" />
          </div>
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="mb-4">
                <span className="section-badge">Video Tutorials</span>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight"
              >
                Learn Faster With Video —{" "}
                <span className="text-gold-gradient">50+ Tutorial Videos</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto mb-10"
              >
                Visual, step-by-step tutorials covering every KVL TECH product.
                Watch on any device, at your own pace. No experience required —
                our instructors guide you from first click to fully working
                solution, every single time.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://youtube.com/@kvltech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Watch on YouTube
                </a>
                <a href="#videos" className="btn-outline flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Browse All Videos
                </a>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats Bar */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {STATS.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="card text-center py-6"
              >
                <stat.icon
                  className="w-7 h-7 mx-auto mb-2"
                  style={{ color: "var(--color-gold)" }}
                />
                <div
                  className="text-3xl font-extrabold"
                  style={{ color: "var(--color-gold)" }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ─── Featured Video ─── */}
        <section className="bg-[var(--color-bg-secondary)] py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="text-center mb-10">
                <span className="section-badge">Featured Video</span>
                <h2 className="text-3xl md:text-4xl font-bold mt-4">
                  Start Here — The Essential Onboarding
                </h2>
                <p className="text-[var(--color-text-secondary)] mt-3 max-w-2xl mx-auto">
                  New to KVL TECH? This single video covers everything you need
                  to hit the ground running. Thousands of business owners
                  started their journey right here.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="card overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Thumbnail */}
                  <div
                    className="relative flex items-center justify-center min-h-64 md:min-h-80"
                    style={{ background: "var(--color-navy, #0a1628)" }}
                  >
                    <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-blue-500 to-indigo-700" />
                    <button
                      className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{ background: "var(--color-gold)" }}
                      aria-label="Play featured video"
                    >
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </button>
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white text-sm px-2 py-1 rounded font-mono">
                      10:24
                    </div>
                    <div className="absolute top-4 left-4 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      HD
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-8 flex flex-col justify-center">
                    <span className="section-badge mb-4 inline-block w-fit">
                      Getting Started
                    </span>
                    <h3 className="text-2xl font-bold mb-3">
                      Getting Started with KVL TECH — Complete Onboarding
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-6">
                      A comprehensive walkthrough of every core feature in the
                      KVL TECH platform. By the end of this 10-minute guide you
                      will have your account configured, your first product live,
                      and a clear roadmap for what to explore next. Perfect for
                      day one.
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)] mb-6">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" /> 15,000 views
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> 10:24
                      </span>
                      <span className="flex items-center gap-1">
                        <Subtitles className="w-4 h-4" /> English + Hindi
                      </span>
                      <span className="flex items-center gap-1">
                        <Monitor className="w-4 h-4" /> 1080p HD
                      </span>
                    </div>
                    <a
                      href="https://youtube.com/@kvltech"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold flex items-center gap-2 w-fit"
                    >
                      <Play className="w-4 h-4" fill="currentColor" />
                      Watch Now
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ─── Video Grid with Category Tabs ─── */}
        <section id="videos" className="bg-[var(--color-bg)] py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="text-center mb-12">
                <span className="section-badge">Browse Videos</span>
                <h2 className="text-3xl md:text-4xl font-bold mt-4">
                  Find the Tutorial You Need
                </h2>
                <p className="text-[var(--color-text-secondary)] mt-3 max-w-2xl mx-auto">
                  Filter by category to jump straight to the topic that matters
                  most to your business right now. Every video is self-contained
                  so you can watch in any order.
                </p>
              </motion.div>

              {/* Category Tabs */}
              <motion.div
                variants={fadeUp}
                className="flex flex-wrap justify-center gap-3 mb-10"
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setActiveCategory(cat.label)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                      activeCategory === cat.label
                        ? "border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/10"
                        : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                    }`}
                  >
                    {cat.label}{" "}
                    <span className="opacity-60 ml-1">({cat.count})</span>
                  </button>
                ))}
              </motion.div>

              {/* Video Cards */}
              <motion.div
                variants={stagger}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredVideos.map((video, i) => (
                  <motion.div
                    key={video.title}
                    variants={fadeUp}
                    className="card overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                  >
                    {/* Thumbnail */}
                    <div
                      className={`relative h-44 bg-gradient-to-br ${video.color} flex items-center justify-center`}
                    >
                      <div className="w-14 h-14 rounded-full bg-white bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
                        <Play
                          className="w-6 h-6 text-white ml-0.5"
                          fill="white"
                        />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-0.5 rounded font-mono">
                        {video.duration}
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className="section-badge text-xs py-0.5 px-2">
                          {video.category}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3 className="font-semibold text-base leading-snug mb-3 group-hover:text-[var(--color-gold)] transition-colors">
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {video.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {video.duration}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp} className="text-center mt-10">
                <a
                  href="https://youtube.com/@kvltech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline inline-flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  View All 50+ Videos on YouTube
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ─── Playlists ─── */}
        <section className="bg-[var(--color-bg-secondary)] py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="text-center mb-12">
                <span className="section-badge">Curated Playlists</span>
                <h2 className="text-3xl md:text-4xl font-bold mt-4">
                  Follow a Learning Path
                </h2>
                <p className="text-[var(--color-text-secondary)] mt-3 max-w-2xl mx-auto">
                  Not sure where to start? Our curated playlists group the most
                  relevant videos into a structured, logical sequence. Follow a
                  playlist from beginning to end and go from zero to confident in
                  under two hours.
                </p>
              </motion.div>

              <motion.div
                variants={stagger}
                className="grid md:grid-cols-3 gap-6"
              >
                {PLAYLISTS.map((playlist) => (
                  <motion.div
                    key={playlist.title}
                    variants={fadeUp}
                    className="card overflow-hidden hover:scale-[1.02] transition-transform duration-300"
                  >
                    <div
                      className={`h-28 bg-gradient-to-br ${playlist.color} flex items-center justify-center text-5xl`}
                    >
                      {playlist.icon}
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-2">
                        {playlist.title}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                        {playlist.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm mb-5">
                        <span
                          className="flex items-center gap-1 font-semibold"
                          style={{ color: "var(--color-gold)" }}
                        >
                          <Video className="w-4 h-4" />
                          {playlist.videos} videos
                        </span>
                        <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
                          <Clock className="w-4 h-4" />
                          {playlist.totalTime} total
                        </span>
                      </div>
                      <a
                        href="https://youtube.com/@kvltech"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-sm flex items-center gap-2 w-fit"
                      >
                        <List className="w-4 h-4" />
                        Start Playlist
                      </a>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ─── YouTube Channel CTA ─── */}
        <section className="bg-[var(--color-bg)] py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="card text-center py-14 px-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none opacity-5">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-red-500 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[var(--color-gold)] blur-3xl" />
              </div>
              <motion.div variants={fadeUp} className="relative z-10">
                <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Play className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Subscribe to KVL TECH on YouTube
                </h2>
                <p className="text-[var(--color-text-secondary)] text-lg mb-3 max-w-2xl mx-auto">
                  New tutorials drop every Tuesday. From beginner walkthroughs to
                  advanced automation strategies — there is always something new
                  to learn that will help you grow your business faster.
                </p>
                <p className="text-2xl font-extrabold mb-8" style={{ color: "var(--color-gold)" }}>
                  12,000+ Subscribers and Growing
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="https://youtube.com/@kvltech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold flex items-center gap-2"
                  >
                    <Bell className="w-5 h-5" />
                    Subscribe + Enable Notifications
                  </a>
                  <Link href="/contact" className="btn-outline flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Talk to Our Team
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ─── Request a Video ─── */}
        <section className="bg-[var(--color-bg-secondary)] py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="card p-10 text-center"
            >
              <motion.div variants={fadeUp}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "var(--color-gold)" }}>
                  <Video className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Can't Find What You Need? Request a Tutorial
                </h2>
                <p className="text-[var(--color-text-secondary)] text-lg mb-4 leading-relaxed">
                  Our library grows every week based on real requests from real
                  business owners just like you. If there is a specific workflow,
                  feature, or industry scenario you would like us to cover, tell
                  us. We review every request and schedule the most popular ones
                  first, so your voice directly shapes what we create next.
                </p>
                <p className="text-[var(--color-text-secondary)] mb-6">
                  Send your request to{" "}
                  <a
                    href="mailto:support@kvlbusinesssolutions.com?subject=Video%20Request"
                    className="font-semibold hover:opacity-80 transition-opacity"
                    style={{ color: "var(--color-gold)" }}
                  >
                    support@kvlbusinesssolutions.com
                  </a>{" "}
                  with the subject line <strong>"Video Request"</strong> and
                  describe the topic you want covered. We aim to respond within
                  48 hours to confirm whether your request has been scheduled.
                </p>
                <a
                  href="mailto:support@kvlbusinesssolutions.com?subject=Video%20Request"
                  className="btn-gold inline-flex items-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Send a Video Request
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="bg-[var(--color-bg)] py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="text-center mb-12">
                <span className="section-badge">FAQ</span>
                <h2 className="text-3xl md:text-4xl font-bold mt-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-[var(--color-text-secondary)] mt-3 max-w-xl mx-auto">
                  Everything you need to know about watching and using the KVL
                  TECH video library. Still have a question? Email us any time.
                </p>
              </motion.div>

              <motion.div variants={stagger} className="space-y-3">
                {FAQS.map((faq, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="card overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-6 text-left"
                    >
                      <span className="font-semibold pr-4">{faq.question}</span>
                      {openFaq === i ? (
                        <ChevronUp
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: "var(--color-gold)" }}
                        />
                      ) : (
                        <ChevronDown className="w-5 h-5 flex-shrink-0 text-[var(--color-text-secondary)]" />
                      )}
                    </button>
                    {openFaq === i && (
                      <div className="px-6 pb-6 text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)] pt-4">
                        {faq.answer}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="bg-[var(--color-bg-secondary)] py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeUp}>
                <span className="section-badge">Get Started Today</span>
                <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">
                  Subscribe and Never Miss a Tutorial
                </h2>
                <p className="text-[var(--color-text-secondary)] text-lg mb-6 max-w-2xl mx-auto">
                  Subscribe to our YouTube channel and receive a notification
                  every time a new tutorial is published. Every video is designed
                  to save you hours of trial and error, so you can implement
                  faster and grow your business with confidence.
                </p>
                <p className="text-[var(--color-text-secondary)] mb-8 max-w-xl mx-auto">
                  Join over 12,000 business owners who are already learning
                  smarter with KVL TECH videos. New content every Tuesday — from
                  quick 10-minute tips to comprehensive 35-minute deep dives.
                  Whatever your schedule, there is a format that works for you.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="https://youtube.com/@kvltech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Subscribe on YouTube — It's Free
                  </a>
                  <Link href="/products" className="btn-outline flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Explore Our Products
                  </Link>
                </div>
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
