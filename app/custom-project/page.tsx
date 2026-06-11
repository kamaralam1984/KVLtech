"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Building2,
  User,
  Phone,
  Mail,
  Palette,
  Globe,
  FileText,
  Briefcase,
  DollarSign,
  ClipboardList,
  Send,
  LayoutDashboard,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1
  businessName: string;
  businessType: string;
  projectType: string;
  description: string;
  budget: string;
  // Step 2
  contactName: string;
  phone: string;
  email: string;
  logoDescription: string;
  primaryColor: string;
  secondaryColor: string;
  referenceWebsites: string;
}

const INITIAL: FormData = {
  businessName: "",
  businessType: "",
  projectType: "",
  description: "",
  budget: "",
  contactName: "",
  phone: "",
  email: "",
  logoDescription: "",
  primaryColor: "#C9A227",
  secondaryColor: "#0F172A",
  referenceWebsites: "",
};

// ─── Constants ────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = ["Restaurant", "School", "Hospital", "E-commerce", "Real Estate", "Other"];
const PROJECT_TYPES = ["Website", "Mobile App", "Software", "CRM", "Other"];
const BUDGET_RANGES = [
  "Under ₹5,000",
  "₹5,000–₹15,000",
  "₹15,000–₹50,000",
  "₹50,000+",
];

const STEPS = ["Project Details", "Contact & Branding", "Confirmation"];

// ─── Helper components ────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-text)" }}>
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function InputField({
  icon: Icon,
  label,
  required,
  children,
}: {
  icon: React.ElementType;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="relative">
        <Icon
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: "#C9A227" }}
        />
        {children}
      </div>
    </div>
  );
}

const inputCls =
  "w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227]";
const inputStyle = {
  background: "var(--color-bg-secondary)",
  borderColor: "var(--color-border)",
  color: "var(--color-text)",
};

const selectCls =
  "w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227] appearance-none cursor-pointer";

// ─── Summary Row ─────────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-0.5 py-2 border-b last:border-b-0" style={{ borderColor: "var(--color-border)" }}>
      <span className="w-40 shrink-0 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </span>
      <span className="flex-1 text-sm break-words" style={{ color: "var(--color-text)" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  done
                    ? "text-white"
                    : active
                    ? "text-white"
                    : "text-gray-400"
                }`}
                style={{
                  background: done ? "#C9A227" : active ? "#C9A227" : "var(--color-bg-secondary)",
                  border: done || active ? "none" : "2px solid var(--color-border)",
                  boxShadow: active ? "0 0 0 4px rgba(201,162,39,0.2)" : "none",
                }}
              >
                {done ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
              </div>
              <span
                className={`mt-1 text-xs font-medium hidden sm:block ${active ? "text-[#C9A227]" : done ? "text-[#C9A227]" : ""}`}
                style={{ color: active || done ? "#C9A227" : "var(--color-text-muted)" }}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="w-12 sm:w-20 h-0.5 mx-1 transition-all duration-500"
                style={{ background: i < current ? "#C9A227" : "var(--color-border)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateStep1 = () => {
    if (!form.businessName.trim()) return "Business name is required.";
    if (!form.businessType) return "Please select a business type.";
    if (!form.projectType) return "Please select a project type.";
    if (!form.budget) return "Please select a budget range.";
    return "";
  };

  const validateStep2 = () => {
    if (!form.contactName.trim()) return "Your name is required.";
    if (!form.phone.trim()) return "Phone number is required.";
    return "";
  };

  const next = () => {
    const err = step === 0 ? validateStep1() : step === 1 ? validateStep2() : "";
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => s + 1);
  };

  const back = () => { setError(""); setStep((s) => s - 1); };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/custom-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Animations ──────────────────────────────────────────────────────────────

  const variants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-20 px-4" style={{ background: "var(--color-bg)" }}>
        <div className="max-w-2xl mx-auto">

          {/* Back button + Header */}
          <div className="mb-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-medium mb-4 transition-colors hover:text-[#C9A227]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
            <h1
              className="text-3xl sm:text-4xl font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
            >
              Custom{" "}
              <span style={{ color: "#C9A227" }}>Project Request</span>
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Tell us about your vision — our team will craft a tailored solution for you.
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-6 sm:p-8 shadow-lg"
            style={{
              background: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
            }}
          >
            {/* Success state */}
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                  style={{ background: "rgba(201,162,39,0.12)" }}
                >
                  <CheckCircle2 className="w-10 h-10" style={{ color: "#C9A227" }} />
                </motion.div>
                <h2
                  className="text-2xl font-extrabold mb-3"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
                >
                  Request Submitted!
                </h2>
                <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
                  Our team will contact you within{" "}
                  <strong style={{ color: "#C9A227" }}>24 hours</strong> to discuss your project.
                </p>
                <button
                  onClick={() => router.push("/client-portal")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "#C9A227", color: "#fff" }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                </button>
              </motion.div>
            ) : (
              <>
                <StepIndicator current={step} />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    {/* ── STEP 1 ── */}
                    {step === 0 && (
                      <div className="space-y-5">
                        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--color-text)" }}>
                          Step 1 — Project Details
                        </h2>

                        <InputField icon={Building2} label="Business Name" required>
                          <input
                            type="text"
                            value={form.businessName}
                            onChange={set("businessName")}
                            placeholder="e.g. Sharma Enterprises"
                            className={inputCls}
                            style={inputStyle}
                          />
                        </InputField>

                        <div className="grid sm:grid-cols-2 gap-5">
                          <div>
                            <Label required>Business Type</Label>
                            <div className="relative">
                              <Briefcase
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                                style={{ color: "#C9A227" }}
                              />
                              <select
                                value={form.businessType}
                                onChange={set("businessType")}
                                className={selectCls}
                                style={inputStyle}
                              >
                                <option value="">Select type…</option>
                                {BUSINESS_TYPES.map((t) => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <Label required>Project Type</Label>
                            <div className="relative">
                              <ClipboardList
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                                style={{ color: "#C9A227" }}
                              />
                              <select
                                value={form.projectType}
                                onChange={set("projectType")}
                                className={selectCls}
                                style={inputStyle}
                              >
                                <option value="">Select type…</option>
                                {PROJECT_TYPES.map((t) => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Description</Label>
                          <div className="relative">
                            <FileText
                              className="absolute left-3 top-3 w-4 h-4 pointer-events-none"
                              style={{ color: "#C9A227" }}
                            />
                            <textarea
                              rows={4}
                              value={form.description}
                              onChange={set("description")}
                              placeholder="Describe your project requirements…"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227] resize-none"
                              style={inputStyle}
                            />
                          </div>
                        </div>

                        <div>
                          <Label required>Budget Range</Label>
                          <div className="relative">
                            <DollarSign
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                              style={{ color: "#C9A227" }}
                            />
                            <select
                              value={form.budget}
                              onChange={set("budget")}
                              className={selectCls}
                              style={inputStyle}
                            >
                              <option value="">Select budget…</option>
                              {BUDGET_RANGES.map((b) => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── STEP 2 ── */}
                    {step === 1 && (
                      <div className="space-y-5">
                        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--color-text)" }}>
                          Step 2 — Contact & Branding
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-5">
                          <InputField icon={User} label="Your Name" required>
                            <input
                              type="text"
                              value={form.contactName}
                              onChange={set("contactName")}
                              placeholder="Full name"
                              className={inputCls}
                              style={inputStyle}
                            />
                          </InputField>

                          <InputField icon={Phone} label="Phone Number" required>
                            <input
                              type="tel"
                              value={form.phone}
                              onChange={set("phone")}
                              placeholder="+91 98765 43210"
                              className={inputCls}
                              style={inputStyle}
                            />
                          </InputField>
                        </div>

                        <InputField icon={Mail} label="Email">
                          <input
                            type="email"
                            value={form.email}
                            onChange={set("email")}
                            placeholder="you@example.com"
                            className={inputCls}
                            style={inputStyle}
                          />
                        </InputField>

                        <div>
                          <Label>Company Logo Description</Label>
                          <div className="relative">
                            <Palette
                              className="absolute left-3 top-3 w-4 h-4 pointer-events-none"
                              style={{ color: "#C9A227" }}
                            />
                            <textarea
                              rows={3}
                              value={form.logoDescription}
                              onChange={set("logoDescription")}
                              placeholder="Describe your logo or brand identity…"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227] resize-none"
                              style={inputStyle}
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-5">
                          <div>
                            <Label>Primary Color</Label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={form.primaryColor}
                                onChange={set("primaryColor")}
                                className="w-10 h-10 rounded-lg border cursor-pointer p-0.5"
                                style={{ borderColor: "var(--color-border)", background: "var(--color-bg-secondary)" }}
                              />
                              <span className="text-sm font-mono" style={{ color: "var(--color-text-secondary)" }}>
                                {form.primaryColor}
                              </span>
                            </div>
                          </div>

                          <div>
                            <Label>Secondary Color</Label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={form.secondaryColor}
                                onChange={set("secondaryColor")}
                                className="w-10 h-10 rounded-lg border cursor-pointer p-0.5"
                                style={{ borderColor: "var(--color-border)", background: "var(--color-bg-secondary)" }}
                              />
                              <span className="text-sm font-mono" style={{ color: "var(--color-text-secondary)" }}>
                                {form.secondaryColor}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Reference Websites</Label>
                          <div className="relative">
                            <Globe
                              className="absolute left-3 top-3 w-4 h-4 pointer-events-none"
                              style={{ color: "#C9A227" }}
                            />
                            <textarea
                              rows={3}
                              value={form.referenceWebsites}
                              onChange={set("referenceWebsites")}
                              placeholder="Any websites you like for reference…"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227] resize-none"
                              style={inputStyle}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── STEP 3 ── */}
                    {step === 2 && (
                      <div>
                        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--color-text)" }}>
                          Step 3 — Confirmation
                        </h2>
                        <p className="text-sm mb-5" style={{ color: "var(--color-text-secondary)" }}>
                          Please review your details before submitting.
                        </p>

                        {/* Summary card */}
                        <div
                          className="rounded-xl p-5 mb-6"
                          style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)" }}
                        >
                          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C9A227" }}>
                            Project Details
                          </p>
                          <SummaryRow label="Business Name" value={form.businessName} />
                          <SummaryRow label="Business Type" value={form.businessType} />
                          <SummaryRow label="Project Type" value={form.projectType} />
                          <SummaryRow label="Budget" value={form.budget} />
                          <SummaryRow label="Description" value={form.description} />
                        </div>

                        <div
                          className="rounded-xl p-5 mb-6"
                          style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)" }}
                        >
                          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C9A227" }}>
                            Contact & Branding
                          </p>
                          <SummaryRow label="Name" value={form.contactName} />
                          <SummaryRow label="Phone" value={form.phone} />
                          <SummaryRow label="Email" value={form.email} />
                          <SummaryRow label="Logo" value={form.logoDescription} />
                          <SummaryRow label="Reference URLs" value={form.referenceWebsites} />
                          <div className="flex flex-wrap gap-x-4 gap-y-1 py-2">
                            <span className="w-40 shrink-0 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                              Colors
                            </span>
                            <div className="flex items-center gap-3">
                              <span
                                className="inline-block w-5 h-5 rounded-full border"
                                style={{ background: form.primaryColor, borderColor: "var(--color-border)" }}
                              />
                              <span className="text-xs font-mono" style={{ color: "var(--color-text-secondary)" }}>
                                {form.primaryColor}
                              </span>
                              <span
                                className="inline-block w-5 h-5 rounded-full border"
                                style={{ background: form.secondaryColor, borderColor: "var(--color-border)" }}
                              />
                              <span className="text-xs font-mono" style={{ color: "var(--color-text-secondary)" }}>
                                {form.secondaryColor}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Submit */}
                        <button
                          onClick={handleSubmit}
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{ background: "#C9A227", color: "#fff" }}
                        >
                          {loading ? (
                            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          {loading ? "Submitting…" : "Submit Custom Request"}
                        </button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Error */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-sm text-red-500 font-medium"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Nav buttons */}
                {step < 2 && (
                  <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
                    {step > 0 ? (
                      <button
                        onClick={back}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-[#C9A227]"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      onClick={next}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
                      style={{ background: "#C9A227", color: "#fff" }}
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="flex items-center mt-4 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
                    <button
                      onClick={back}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-[#C9A227]"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <ChatWidget />
      <WhatsAppButton />
    </>
  );
}
