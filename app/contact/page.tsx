"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle2, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslations } from "@/lib/i18n/translations";

const SERVICES = [
  "Website Development", "School Management System", "Hospital Management System",
  "E-commerce Platform", "Hotel Booking Website", "Real Estate Website",
  "Mobile Application", "Custom Software", "Marketing Automation", "Other",
];

export default function ContactPage() {
  const { language } = useLanguage();
  // Language-aware translations for this page
  const lt = getTranslations(language.code);

  const [form, setForm] = useState({ name: "", phone: "", email: "", service: "", budget: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const CONTACT_INFO = [
    { icon: Phone, label: lt.contact_info_call, value: "+91 9942000413", href: "tel:+919942000413", color: "#16A34A" },
    { icon: MessageCircle, label: lt.contact_info_wa, value: "+91 9942000413", href: "https://wa.me/919942000413", color: "#25D366" },
    { icon: Mail, label: lt.contact_info_email, value: "kvlbusinesssolution@gmail.com", href: "mailto:kvlbusinesssolution@gmail.com", color: "#0891B2" },
    { icon: MapPin, label: lt.contact_info_office, value: "INDIA", href: "#map", color: "#C9A227" },
    { icon: Clock, label: lt.contact_info_hours, value: lt.contact_hours_val, href: "#", color: "#7C3AED" },
  ];

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
        setError(data.error || lt.error_try_again);
      } else {
        setSubmitted(true);
        setForm({ name: "", phone: "", email: "", service: "", budget: "", message: "" });
      }
    } catch {
      setError(lt.error_try_again);
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
                <img src="/kvl-tech-logo-tight.png" alt="KVL TECH" className="h-12 w-auto object-contain dark:hidden" />
                <img src="/kvl-tech-logo-white.png" alt="KVL TECH" className="h-12 w-auto object-contain hidden dark:block" />
              </div>
              <div className="section-badge">{lt.contact_badge}</div>
              <h1 className="font-display font-bold text-4xl sm:text-5xl text-[var(--color-text)] mb-4 leading-tight">
                {lt.contact_title}{" "}
                <span className="text-gold-gradient">{lt.contact_title_gold}</span>
              </h1>
              <p className="text-[var(--color-text-secondary)] text-lg">{lt.contact_subtitle}</p>
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="py-16 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-10">

              {/* Left — Contact info */}
              <div className="space-y-5">
                <h2 className="font-display font-bold text-2xl text-[var(--color-text)]">{lt.contact_get_in_touch}</h2>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{lt.contact_touch_sub}</p>

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

                {/* WhatsApp CTA */}
                <a
                  href={`https://wa.me/919942000413?text=${encodeURIComponent(lt.wa_message)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl text-white transition-all hover:shadow-[0_8px_30px_rgba(37,211,102,0.35)] hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
                >
                  <MessageCircle size={22} fill="white" />
                  <div>
                    <p className="font-semibold text-sm">{lt.contact_wa_title}</p>
                    <p className="text-white/70 text-xs">{lt.contact_wa_sub}</p>
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
                      <h3 className="font-display font-bold text-2xl text-[var(--color-text)] mb-3">{lt.contact_success_title}</h3>
                      <p className="text-[var(--color-text-secondary)] mb-2">{lt.contact_success_msg}</p>
                      <p className="text-sm text-[var(--color-text-muted)] mb-8">{lt.contact_wa_sub}</p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a href="https://wa.me/919942000413" target="_blank" rel="noopener noreferrer" className="btn-gold">
                          <MessageCircle size={16} /> {lt.contact_success_wa}
                        </a>
                        <button onClick={() => setSubmitted(false)} className="btn-outline">{lt.contact_send_another}</button>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <h2 className="font-display font-bold text-2xl text-[var(--color-text)] mb-6">{lt.contact_form_title}</h2>
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">{lt.contact_full_name}</label>
                            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                              placeholder={lt.form_name}
                              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">{lt.contact_phone_label}</label>
                            <input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                              placeholder="+91 XXXXX XXXXX"
                              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">{lt.contact_email_label}</label>
                            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                              placeholder="you@example.com"
                              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">{lt.contact_budget_label}</label>
                            <select value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all">
                              <option value="">{lt.contact_budget_select}</option>
                              <option>{lt.contact_budget_1}</option>
                              <option>{lt.contact_budget_2}</option>
                              <option>{lt.contact_budget_3}</option>
                              <option>{lt.contact_budget_4}</option>
                              <option>{lt.contact_budget_5}</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">{lt.contact_service_label}</label>
                          <select required value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all">
                            <option value="">{lt.contact_service_select}</option>
                            {SERVICES.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">{lt.contact_msg_label}</label>
                          <textarea rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                            placeholder={lt.contact_msg_placeholder}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all resize-none" />
                        </div>
                        {error && (
                          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">{error}</p>
                        )}
                        <button type="submit" disabled={loading} className="btn-gold w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-70">
                          {loading ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Send size={18} />}
                          {loading ? lt.contact_sending : lt.contact_send_btn}
                        </button>
                        <p className="text-center text-xs text-[var(--color-text-muted)]">{lt.contact_reply_note}</p>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map */}
        <section id="map" className="h-72 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] flex items-center justify-center">
          <div className="text-center">
            <MapPin size={36} className="text-[var(--color-gold)] mx-auto mb-3" />
            <p className="font-semibold text-[var(--color-text)]">KVL TECH Pvt. Ltd.</p>
            <p className="text-[var(--color-text-secondary)] text-sm mt-1">INDIA</p>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-[var(--color-gold)] hover:underline">
              {lt.contact_map_open} <ArrowRight size={14} />
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
