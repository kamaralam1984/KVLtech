"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, TrendingUp, Users, Award } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const CATEGORIES = ["All", "Websites", "Software", "E-commerce", "Healthcare", "Education"];

const PROJECTS = [
  { name: "Spice Heaven", type: "Restaurant Website", category: "Websites", photo: "/photos/restaurant.jpg", client: "Rajesh Kumar", city: "Mumbai", color: "#FF6B35", stats: [{ label: "Online Orders", value: "+300%" }, { label: "Revenue Growth", value: "2X" }], desc: "Complete restaurant website with online ordering, table booking, and WhatsApp integration." },
  { name: "GreenValley School", type: "School Management System", category: "Education", photo: "/photos/school.jpg", client: "Principal Sharma", city: "Delhi", color: "#16A34A", stats: [{ label: "Workload Reduction", value: "80%" }, { label: "Parent Satisfaction", value: "95%" }], desc: "Full ERP system for 2000+ students with parent app, fee management, and attendance tracking." },
  { name: "MediLife Hospital", type: "Hospital Management System", category: "Healthcare", photo: "/photos/hospital.jpg", client: "Dr. Rajesh Verma", city: "Bangalore", color: "#0891B2", stats: [{ label: "Faster Operations", value: "70%" }, { label: "Patient Satisfaction", value: "90%" }], desc: "Complete HMS with OPD, pharmacy, lab, billing, and patient portal." },
  { name: "FashionHub", type: "eCommerce Platform", category: "E-commerce", photo: "/photos/fashion.jpg", client: "Pooja Malhotra", city: "Noida", color: "#7C3AED", stats: [{ label: "Sales Increase", value: "250%" }, { label: "Customer Engagement", value: "3X" }], desc: "Multi-category fashion store with Razorpay, inventory management, and mobile app." },
  { name: "Sunrise Hotels", type: "Hotel Booking Website", category: "Websites", photo: "/photos/restaurant.jpg", client: "Arvind Patel", city: "Jaipur", color: "#C9A227", stats: [{ label: "Direct Bookings", value: "+180%" }, { label: "OTA Commission Saved", value: "₹2.4L/yr" }], desc: "Premium hotel website with real-time booking engine, payment gateway, and admin dashboard." },
  { name: "TechNova Solutions", type: "Corporate Website", category: "Websites", photo: "/photos/office-meeting.jpg", client: "Vikram Singh", city: "Hyderabad", color: "#0F172A", stats: [{ label: "Lead Generation", value: "+400%" }, { label: "Bounce Rate Reduced", value: "60%" }], desc: "Premium B2B corporate website with lead capture, case studies, and client portal." },
];

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState<typeof PROJECTS[0] | null>(null);
  const [dbProjects, setDbProjects] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/portfolio")
      .then(r => r.json())
      .then(data => { if (data.projects) setDbProjects(data.projects); })
      .catch(() => {});
  }, []);

  const filtered = activeCategory === "All" ? PROJECTS : PROJECTS.filter(p => p.category === activeCategory);

  return (
    <>
      <Navbar />
      <main className="pt-[104px]">
        {/* Hero */}
        <section className="py-16 bg-[var(--color-bg-secondary)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[var(--color-gold)]/5 blur-[80px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex justify-center mb-6">
              <img src="/kvl-tech-logo-tight.png" alt="KVL TECH" className="h-10 w-auto object-contain dark:hidden" />
              <img src="/kvl-tech-logo-white.png" alt="KVL TECH" className="h-10 w-auto object-contain hidden dark:block" />
            </div>
            <div className="section-badge">Our Portfolio</div>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <h1 className="font-display font-bold text-4xl sm:text-5xl text-[var(--color-text)] mb-3 leading-tight">
                  Real Projects.{" "}
                  <span className="text-gold-gradient">Real Results.</span>
                </h1>
                <p className="text-[var(--color-text-secondary)] text-lg max-w-xl">
                  12,500+ projects delivered across India. Har project mein hum client ki success ko apni success maante hain.
                </p>
              </div>
              <div className="flex gap-6 shrink-0">
                {[{ icon: Award, value: "12,500+", label: "Projects" }, { icon: Users, value: "5,000+", label: "Clients" }, { icon: TrendingUp, value: "4.9★", label: "Rating" }].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="text-center">
                    <Icon size={20} className="text-[var(--color-gold)] mx-auto mb-1" />
                    <p className="font-display font-bold text-xl text-[var(--color-text)]">{value}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Filter + Grid */}
        <section className="py-12 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 flex-wrap mb-10">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat ? "bg-[var(--color-navy)] text-white" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"}`}>
                  {cat}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeCategory} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((project, i) => (
                  <motion.div key={project.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="card overflow-hidden group cursor-pointer" onClick={() => setSelected(project)}>
                    <div className="h-52 relative overflow-hidden">
                      <Image src={project.photo} alt={project.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="33vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="font-display font-bold text-white text-lg">{project.name}</p>
                        <p className="text-white/70 text-xs">{project.type} · {project.city}</p>
                      </div>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="px-3 py-1.5 bg-white text-[var(--color-text)] text-xs font-semibold rounded-full flex items-center gap-1">
                          View Case <ArrowRight size={11} />
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: project.color }} />
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-[var(--color-text-secondary)] mb-3 leading-relaxed">{project.desc}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {project.stats.map(stat => (
                          <div key={stat.label} className="p-2 rounded-lg bg-[var(--color-bg-secondary)] text-center">
                            <p className="font-display font-bold text-sm" style={{ color: project.color }}>{stat.value}</p>
                            <p className="text-[10px] text-[var(--color-text-muted)]">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* DB Projects */}
                {dbProjects.map((project, i) => {
                  let metrics: Record<string, string> = {};
                  try { if (project.metrics) metrics = JSON.parse(project.metrics); } catch {}
                  const metricEntries = Object.entries(metrics).slice(0, 2);
                  return (
                    <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (filtered.length + i) * 0.08 }}
                      className="card overflow-hidden group">
                      <Link href={`/portfolio/${project.slug}`} className="block">
                        <div className="h-52 relative overflow-hidden">
                          <Image src={project.coverImage} alt={project.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="33vw" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className="font-display font-bold text-white text-lg">{project.title}</p>
                            <p className="text-white/70 text-xs">{project.industry} · {project.clientName}</p>
                          </div>
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="px-3 py-1.5 bg-white text-[var(--color-text)] text-xs font-semibold rounded-full flex items-center gap-1">
                              View Case <ArrowRight size={11} />
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-gold)]" />
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-[var(--color-text-secondary)] mb-3 leading-relaxed line-clamp-2">{project.description}</p>
                          {metricEntries.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                              {metricEntries.map(([key, value]) => (
                                <div key={key} className="p-2 rounded-lg bg-[var(--color-bg-secondary)] text-center">
                                  <p className="font-display font-bold text-sm text-[var(--color-gold)]">{value as string}</p>
                                  <p className="text-[10px] text-[var(--color-text-muted)]">{key}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Case study modal */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelected(null)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-[var(--color-bg)] rounded-2xl max-w-lg w-full overflow-hidden shadow-[var(--shadow-luxury)]"
                onClick={e => e.stopPropagation()}>
                <div className="h-48 relative">
                  <Image src={selected.photo} alt={selected.name} fill className="object-cover" sizes="500px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <button onClick={() => setSelected(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-all">✕</button>
                  <div className="absolute bottom-4 left-4">
                    <p className="font-display font-bold text-white text-xl">{selected.name}</p>
                    <p className="text-white/70 text-sm">{selected.type} · {selected.city}</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: selected.color }}>{selected.client[0]}</div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">{selected.client}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Client</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={14} fill="#C9A227" className="text-[var(--color-gold)]" />)}</div>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-5">{selected.desc}</p>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {selected.stats.map(stat => (
                      <div key={stat.label} className="p-3 rounded-xl bg-[var(--color-bg-secondary)] text-center">
                        <p className="font-display font-bold text-lg" style={{ color: selected.color }}>{stat.value}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <Link href="/contact" className="btn-gold w-full justify-center" onClick={() => setSelected(null)}>
                    Want Similar Results? <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <section className="py-16 bg-[var(--color-navy)]">
          <div className="max-w-3xl mx-auto text-center px-4">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              Aapka Project Next Ho Sakta Hai
            </h2>
            <p className="text-white/60 mb-7">Join 5,000+ businesses that transformed their digital presence with KVL TECH.</p>
            <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
              Start Your Project <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
    </>
  );
}
