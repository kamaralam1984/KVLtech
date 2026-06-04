"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight, Clock, User, Tag } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const CATEGORIES = ["All", "Website Tips", "Business Growth", "Software", "Marketing", "SEO", "AI & Automation"];

const POSTS = [
  { slug: "restaurant-website-online-orders", title: "Restaurant Website Se 300% Zyada Online Orders Kaise Milein", excerpt: "Ek simple restaurant website se Rajesh ne apne online orders 3x kar liye. Jaanein kaunsi features sabse zyada convert karti hain.", category: "Website Tips", photo: "/photos/restaurant.jpg", author: "Kavya Mehta", date: "Dec 28, 2024", readTime: "5 min", featured: true },
  { slug: "school-management-system-benefits", title: "School Management System: 80% Kam Kaam, 95% Zyada Satisfaction", excerpt: "Manual attendance, fee collection, exam results — sab ek jagah. Jaanein kaise school management software ne GreenValley School ko transform kiya.", category: "Software", photo: "/photos/school.jpg", author: "Amit Verma", date: "Dec 25, 2024", readTime: "7 min", featured: false },
  { slug: "seo-tips-small-business-india", title: "2025 Mein India Ke Small Businesses Ke Liye Top SEO Tips", excerpt: "Google pe pehle page pe aana ab sirf bade companies ka kaam nahi — jaanein kaise local SEO se aap bhi top par aa sakte hain.", category: "SEO", photo: "/photos/office-meeting.jpg", author: "Priya Singh", date: "Dec 22, 2024", readTime: "6 min", featured: false },
  { slug: "ecommerce-whatsapp-automation", title: "WhatsApp Automation Se E-commerce Sales Kaise Badhayein", excerpt: "Abandoned cart recovery, order updates, customer follow-up — sab WhatsApp pe automatic. Apni sales 2x karein.", category: "Marketing", photo: "/photos/fashion.jpg", author: "Sneha Joshi", date: "Dec 20, 2024", readTime: "4 min", featured: false },
  { slug: "hospital-management-paperless", title: "Paperless Hospital: HMS Se Operations 70% Fast Karo", excerpt: "Patient registration se billing tak — sab digital. Jaanein kaise MediLife Hospital ne apni efficiency dramatically badhaayi.", category: "Software", photo: "/photos/hospital.jpg", author: "Rahul Sharma", date: "Dec 18, 2024", readTime: "8 min", featured: false },
  { slug: "ai-chatbot-website-leads", title: "AI Chatbot Se Website Leads 5X Kaise Karein", excerpt: "24/7 available, human-like conversation, automatic lead qualification — AI chatbot aapki sales team ka best member ban sakta hai.", category: "AI & Automation", photo: "/photos/office-meeting.jpg", author: "Sneha Joshi", date: "Dec 15, 2024", readTime: "5 min", featured: false },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = POSTS.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = POSTS.find(p => p.featured);
  const rest = filtered.filter(p => !p.featured || activeCategory !== "All" || search);

  return (
    <>
      <Navbar />
      <main className="pt-[104px]">
        {/* Hero */}
        <section className="py-16 bg-[var(--color-bg-secondary)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-10">
              <div className="flex justify-center mb-6">
                <img src="/kvl-tech-logo-tight.png" alt="KVL TECH" className="h-10 w-auto object-contain dark:hidden" />
                <img src="/kvl-tech-logo-white.png" alt="KVL TECH" className="h-10 w-auto object-contain hidden dark:block" />
              </div>
              <div className="section-badge mx-auto">KVL TECH Blog</div>
              <h1 className="font-display font-bold text-4xl sm:text-5xl text-[var(--color-text)] mb-4 leading-tight">
                Business Growth{" "}
                <span className="text-gold-gradient">Insights</span>
              </h1>
              <p className="text-[var(--color-text-secondary)] text-lg">
                Digital transformation tips, SEO guides, marketing strategies — sabkuch apni language mein.
              </p>
            </div>
            <div className="max-w-lg mx-auto relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all shadow-[var(--shadow-card)]" />
            </div>
          </div>
        </section>

        <section className="py-12 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Category filters */}
            <div className="flex items-center gap-2 flex-wrap mb-10">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat ? "bg-[var(--color-navy)] text-white" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"}`}>
                  {cat !== "All" && <Tag size={12} />} {cat}
                </button>
              ))}
            </div>

            {/* Featured post */}
            {featured && activeCategory === "All" && !search && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden mb-10 group cursor-pointer">
                <div className="grid lg:grid-cols-2">
                  <div className="h-64 lg:h-auto relative overflow-hidden">
                    <Image src={featured.photo} alt={featured.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="50vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <span className="absolute top-4 left-4 px-3 py-1.5 bg-[var(--color-gold)] text-white text-xs font-bold rounded-full">Featured</span>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-gold)] mb-3">
                      <Tag size={12} /> {featured.category}
                    </span>
                    <h2 className="font-display font-bold text-2xl text-[var(--color-text)] mb-3 leading-tight">{featured.title}</h2>
                    <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-5">{featured.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)] mb-6">
                      <span className="flex items-center gap-1"><User size={12} /> {featured.author}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {featured.readTime} read</span>
                      <span>{featured.date}</span>
                    </div>
                    <Link href={`/blog/${featured.slug}`} className="btn-gold inline-flex items-center gap-2 self-start">
                      Read Article <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Articles grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post, i) => (
                <motion.div key={post.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="card overflow-hidden group">
                  <div className="h-44 relative overflow-hidden">
                    <Image src={post.photo} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="33vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-gold)]/90 text-white">{post.category}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-2 leading-snug line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-4 leading-relaxed line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-1"><Clock size={10} /> {post.readTime}</span>
                        <span>·</span>
                        <span>{post.date}</span>
                      </div>
                      <Link href={`/blog/${post.slug}`} className="text-xs font-semibold text-[var(--color-gold)] flex items-center gap-1 hover:gap-2 transition-all">
                        Read <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-[var(--color-text-muted)]">
                <p className="text-lg mb-3">No articles found</p>
                <button onClick={() => { setSearch(""); setActiveCategory("All"); }} className="btn-outline">Clear filters</button>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
          <div className="max-w-xl mx-auto text-center px-4">
            <h2 className="font-display font-bold text-2xl text-[var(--color-text)] mb-3">Weekly Business Tips Subscribe Karein</h2>
            <p className="text-[var(--color-text-secondary)] text-sm mb-6">Every week ek actionable tip — bilkul free. 2,000+ business owners already subscribed hain.</p>
            <div className="flex gap-3">
              <input type="email" placeholder="aap@example.com"
                className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
              <button className="btn-gold shrink-0">Subscribe</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
    </>
  );
}
