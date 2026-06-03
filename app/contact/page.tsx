"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle2, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const SERVICES = [
  "Website Development", "School Management System", "Hospital Management System",
  "E-commerce Platform", "Hotel Booking Website", "Real Estate Website",
  "Mobile Application", "Custom Software", "Marketing Automation", "Other",
];

const CONTACT_INFO = [
  { icon: Phone, label: "Call Us", value: "+91 98765 43210", href: "tel:+919876543210", color: "#16A34A" },
  { icon: MessageCircle, label: "WhatsApp", value: "+91 98765 43210", href: "https://wa.me/919876543210", color: "#25D366" },
  { icon: Mail, label: "Email", value: "info@kvlbusinesssolutions.com", href: "mailto:info@kvlbusinesssolutions.com", color: "#0891B2" },
  { icon: MapPin, label: "Office", value: "Noida, Uttar Pradesh, India", href: "#map", color: "#C9A227" },
  { icon: Clock, label: "Working Hours", value: "Mon–Sat: 9AM – 7PM", href: "#", color: "#7C3AED" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: "", budget: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
        setForm({ name: "", phone: "", email: "", service: "", budget: "", message: "" });
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="py-16 bg-[var(--color-bg-secondary)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[var(--color-gold)]/5 blur-[80px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-2xl">
              <div className="flex justify-start mb-6">
                <img
                  src="/kvl-tech-logo-tight.png"
                  alt="KVL TECH"
                  className="h-12 w-auto object-contain dark:hidden"
                />
                <img
                  src="/kvl-tech-logo-white.png"
                  alt="KVL TECH"
                  className="h-12 w-auto object-contain hidden dark:block"
                />
              </div>
              <div className="section-badge">Contact Us</div>
              <h1 className="font-display font-bold text-4xl sm:text-5xl text-[var(--color-text)] mb-4 leading-tight">
                Let&apos;s Build Something{" "}
                <span className="text-gold-gradient">Amazing Together</span>
              </h1>
              <p className="text-[var(--color-text-secondary)] text-lg">
                Hamaari team 24 hours ke andar respond karti hai. Free consultation ke liye aaj hi contact karein.
              </p>
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="py-16 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-10">

              {/* Left — Contact info */}
              <div className="space-y-5">
                <h2 className="font-display font-bold text-2xl text-[var(--color-text)]">Get in Touch</h2>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  Koi bhi question ya project requirement ho — hum yahan hain. WhatsApp pe instant reply milta hai.
                </p>

                <div className="space-y-3">
                  {CONTACT_INFO.map(({ icon: Icon, label, value, href, color }) => (
                    <motion.a
                      key={label}
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-gold)]/50 hover:shadow-[var(--shadow-card)] transition-all group"
                    >
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ background: `${color}15` }}>
                        <Icon size={20} style={{ color }} />
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)] mb-0.5">{label}</p>
                        <p className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-gold)] transition-colors">{value}</p>
                      </div>
                    </motion.a>
                  ))}
                </div>

                {/* Quick WhatsApp CTA */}
                <a
                  href="https://wa.me/919876543210?text=Hi! I want to discuss my project with KVL TECH."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl text-white transition-all hover:shadow-[0_8px_30px_rgba(37,211,102,0.35)] hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
                >
                  <MessageCircle size={22} fill="white" />
                  <div>
                    <p className="font-semibold text-sm">Chat on WhatsApp</p>
                    <p className="text-white/70 text-xs">Instant reply guaranteed</p>
                  </div>
                  <ArrowRight size={18} className="ml-auto" />
                </a>
              </div>

              {/* Right — Form */}
              <div className="lg:col-span-2">
                <div className="card p-8">
                  {submitted ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                      <div className="w-20 h-20 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-[var(--color-success)]" />
                      </div>
                      <h3 className="font-display font-bold text-2xl text-[var(--color-text)] mb-3">Message Sent! 🎉</h3>
                      <p className="text-[var(--color-text-secondary)] mb-2">
                        Shukriya! Hamaari team aapko <strong className="text-[var(--color-text)]">24 hours</strong> mein contact karegi.
                      </p>
                      <p className="text-sm text-[var(--color-text-muted)] mb-8">Jaldi reply chahiye? WhatsApp karein — instant response!</p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="btn-gold">
                          <MessageCircle size={16} /> WhatsApp Now
                        </a>
                        <button onClick={() => setSubmitted(false)} className="btn-outline">Send Another</button>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <h2 className="font-display font-bold text-2xl text-[var(--color-text)] mb-6">Send Us a Message</h2>
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Full Name *</label>
                            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Aapka naam"
                              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Phone Number *</label>
                            <input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX"
                              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Email Address</label>
                            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="aap@example.com"
                              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Budget Range</label>
                            <select value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all">
                              <option value="">Select budget</option>
                              <option>Under ₹15,000</option>
                              <option>₹15,000 – ₹30,000</option>
                              <option>₹30,000 – ₹60,000</option>
                              <option>₹60,000 – ₹1,00,000</option>
                              <option>Above ₹1,00,000</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Service Interested In *</label>
                          <select required value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all">
                            <option value="">Choose a service</option>
                            {SERVICES.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Your Message</label>
                          <textarea rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Apni requirement detail mein batayein..."
                            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all resize-none" />
                        </div>
                        {error && (
                          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
                            {error}
                          </p>
                        )}
                        <button type="submit" disabled={loading} className="btn-gold w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-70">
                          {loading ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Send size={18} />}
                          {loading ? "Sending..." : "Send Message"}
                        </button>
                        <p className="text-center text-xs text-[var(--color-text-muted)]">We reply within 24 hours. Your data is safe with us. 🔒</p>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map placeholder */}
        <section id="map" className="h-72 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] flex items-center justify-center">
          <div className="text-center">
            <MapPin size={36} className="text-[var(--color-gold)] mx-auto mb-3" />
            <p className="font-semibold text-[var(--color-text)]">KVL TECH Pvt. Ltd.</p>
            <p className="text-[var(--color-text-secondary)] text-sm mt-1">Sector 62, Noida, Uttar Pradesh – 201309</p>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-[var(--color-gold)] hover:underline">
              Open in Google Maps <ArrowRight size={14} />
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
    </>
  );
}
