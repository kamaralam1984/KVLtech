"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, ArrowLeft, Check, Loader2, Globe, Smartphone, ShoppingCart,
  LayoutDashboard, BarChart3, Megaphone, Package, MessageSquare, HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { OnboardingProgress } from "@/components/ui/OnboardingProgress";

const TOTAL_STEPS = 5;

const STEP_LABELS = ["Welcome", "Company", "Contact", "Goals", "Done"];

const INPUT =
  "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all placeholder:text-[var(--color-text-muted)]";
const LABEL = "block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 280 : -280,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 280 : -280,
    opacity: 0,
  }),
};

const transition = { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] };

// ── Service cards data
const SERVICES = [
  { id: "website", label: "Business Website", icon: Globe },
  { id: "mobile", label: "Mobile App", icon: Smartphone },
  { id: "ecommerce", label: "E-Commerce Store", icon: ShoppingCart },
  { id: "crm", label: "CRM / ERP System", icon: LayoutDashboard },
  { id: "saas", label: "SaaS Platform", icon: BarChart3 },
  { id: "marketing", label: "Digital Marketing", icon: Megaphone },
];

const BUDGETS = [
  { id: "under25k", label: "Under ₹25K" },
  { id: "25k-1l", label: "₹25K – ₹1L" },
  { id: "1l-5l", label: "₹1L – ₹5L" },
  { id: "5lplus", label: "₹5L+" },
];

const QUICK_LINKS = [
  { label: "Track Your Orders", desc: "View live project status", href: "/client-portal?tab=orders", icon: Package },
  { label: "Chat with Us", desc: "Direct messaging with our team", href: "/client-portal?tab=messages", icon: MessageSquare },
  { label: "Get Support", desc: "Raise a support ticket", href: "/client-portal?tab=support", icon: HelpCircle },
];

interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<ClientUser | null>(null);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Step 2 fields
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");

  // Step 3 fields
  const [phone, setPhone] = useState("");
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [contactMethod, setContactMethod] = useState("WhatsApp");

  // Step 4 fields
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");

  // Auth check on mount
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then(async (data) => {
        if (!data.user) {
          router.replace("/login");
          return;
        }
        setUser(data.user);

        // Check onboarding status
        const onbRes = await fetch("/api/onboarding", { credentials: "include" });
        const onbData = await onbRes.json();

        if (onbData.completed) {
          router.replace("/client-portal");
          return;
        }

        // Pre-fill from existing user data
        if (data.user.phone) setPhone(data.user.phone);
        if (data.user.company) setCompany(data.user.company);
      })
      .catch(() => router.replace("/login"))
      .finally(() => setChecking(false));
  }, [router]);

  const goNext = async (nextStep: number) => {
    setDirection(1);
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
    setError("");
  };

  const saveStep = async (stepNum: number, data: Record<string, unknown>) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ step: stepNum, data }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Something went wrong. Please try again.");
        setSaving(false);
        return false;
      }
      return true;
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Step submission handlers
  const handleStep1 = () => goNext(2);

  const handleStep2 = async () => {
    if (!company.trim()) {
      setError("Company name is required.");
      return;
    }
    const ok = await saveStep(2, { company: company.trim(), city: city.trim() });
    if (ok) goNext(3);
  };

  const handleStep3 = async () => {
    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    const ok = await saveStep(3, { phone: phone.trim(), contactMethod });
    if (ok) goNext(4);
  };

  const handleStep4 = async () => {
    const ok = await saveStep(4, {
      serviceInterest: selectedServices,
      projectBudget: budget,
      projectTimeline: timeline,
    });
    if (ok) goNext(5);
  };

  // Step 5 save on mount
  useEffect(() => {
    if (step === 5) {
      saveStep(5, {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-secondary)]">
        <Loader2 size={32} className="text-[var(--color-gold)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--color-bg-secondary)]">

      {/* ── Left decorative panel (desktop only) */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 bg-[var(--color-navy)] flex-col relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[var(--color-gold)]/8 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/4 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <Link href="/" className="mb-auto">
            <Image
              src="/kvl-tech-logo-white.png"
              alt="KVL TECH"
              width={180}
              height={80}
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/20 flex items-center justify-center mb-6">
                <span className="text-2xl">
                  {step === 1 ? "👋" : step === 2 ? "🏢" : step === 3 ? "📞" : step === 4 ? "🚀" : "🎉"}
                </span>
              </div>

              <h2 className="font-display font-bold text-2xl text-white mb-3 leading-snug">
                {step === 1 && "Welcome aboard!"}
                {step === 2 && "Tell us about your business"}
                {step === 3 && "Stay connected with ease"}
                {step === 4 && "Let's plan your project"}
                {step === 5 && "You're all set!"}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">
                {step === 1 && "We're excited to have you. Let's take 2 minutes to personalise your experience."}
                {step === 2 && "Your business details help us tailor everything to your needs."}
                {step === 3 && "We'll use this to keep you updated on your projects."}
                {step === 4 && "Understanding your goals helps us deliver faster and better."}
                {step === 5 && "Your portal is ready. Explore your dashboard and track your projects."}
              </p>
            </motion.div>

            {/* Progress dots */}
            <div className="flex gap-2 mt-10">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i + 1 === step ? 28 : 8,
                    backgroundColor: i + 1 <= step ? "var(--color-gold)" : "rgba(255,255,255,0.2)",
                  }}
                  transition={{ duration: 0.35 }}
                  className="h-2 rounded-full"
                />
              ))}
            </div>
          </div>

          <p className="text-white/20 text-xs mt-12">
            Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
          </p>
        </div>
      </div>

      {/* ── Right content panel */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Progress bar */}
        <div className="h-1 bg-[var(--color-border)] w-full">
          <motion.div
            className="h-full bg-[var(--color-gold)]"
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Step indicator (mobile) */}
        <div className="lg:hidden px-6 pt-6 pb-0">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Image
                src="/kvl-tech-logo-tight.png"
                alt="KVL TECH"
                width={120}
                height={60}
                className="h-8 w-auto object-contain dark:hidden"
              />
              <Image
                src="/kvl-tech-logo-white.png"
                alt="KVL TECH"
                width={120}
                height={60}
                className="h-8 w-auto object-contain hidden dark:block"
              />
            </Link>
            <span className="text-xs text-[var(--color-text-muted)] font-medium">
              {step}/{TOTAL_STEPS}
            </span>
          </div>
          <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} labels={STEP_LABELS} />
        </div>

        {/* Step content */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-lg">
            {/* Desktop progress */}
            <div className="hidden lg:block mb-8">
              <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} labels={STEP_LABELS} />
            </div>

            {/* Animated step container */}
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                >

                  {/* ── STEP 1: Welcome */}
                  {step === 1 && (
                    <div className="card p-8">
                      <div className="text-center mb-8">
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
                          className="text-5xl mb-4"
                        >
                          🎉
                        </motion.div>
                        <h1 className="font-display font-bold text-2xl text-[var(--color-text)] mb-2">
                          Welcome to KVL TECH!
                        </h1>
                        <p className="text-[var(--color-text-muted)] text-sm">
                          Let&apos;s set up your account in 2 minutes
                        </p>
                      </div>

                      {user && (
                        <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-5 mb-6 border border-[var(--color-border)]">
                          <p className="text-lg font-semibold text-[var(--color-text)] mb-4">
                            Hi, <span className="text-[var(--color-gold)]">{user.name}!</span>
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)] mb-3">
                            Here&apos;s what you&apos;ll get access to:
                          </p>
                          <div className="space-y-2.5">
                            {[
                              "Project tracking with live status updates",
                              "Direct messaging with our team",
                              "Invoice downloads anytime",
                              "Design approvals & file sharing",
                            ].map((item) => (
                              <div key={item} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center shrink-0">
                                  <Check size={11} className="text-[var(--color-gold)]" strokeWidth={2.5} />
                                </div>
                                <p className="text-sm text-[var(--color-text-secondary)]">{item}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button onClick={handleStep1} className="btn-gold w-full py-4 flex items-center justify-center gap-2 text-base">
                        Let&apos;s Get Started <ArrowRight size={18} />
                      </button>
                    </div>
                  )}

                  {/* ── STEP 2: Company Info */}
                  {step === 2 && (
                    <div className="card p-8">
                      <div className="mb-6">
                        <h2 className="font-display font-bold text-xl text-[var(--color-text)] mb-1">
                          Tell us about your business
                        </h2>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          Help us personalise your portal experience
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className={LABEL}>Company Name *</label>
                          <input
                            type="text"
                            value={company}
                            onChange={(e) => { setCompany(e.target.value); setError(""); }}
                            placeholder="Acme Technologies Pvt. Ltd."
                            className={INPUT}
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className={LABEL}>City</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Mumbai, Chennai, Bangalore..."
                            className={INPUT}
                          />
                        </div>

                        <div>
                          <label className={LABEL}>Industry</label>
                          <select
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className={INPUT}
                          >
                            <option value="">Select your industry</option>
                            {["Restaurant", "Retail", "Healthcare", "Education", "Real Estate", "Manufacturing", "Technology", "Other"].map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={LABEL}>Team Size</label>
                          <select
                            value={teamSize}
                            onChange={(e) => setTeamSize(e.target.value)}
                            className={INPUT}
                          >
                            <option value="">Select team size</option>
                            {["1-5", "6-20", "21-50", "50+"].map((opt) => (
                              <option key={opt} value={opt}>{opt} employees</option>
                            ))}
                          </select>
                        </div>

                        {error && (
                          <p className="text-xs text-red-500 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                            {error}
                          </p>
                        )}

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={goBack}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-gold)]/40 transition-all"
                          >
                            <ArrowLeft size={15} /> Back
                          </button>
                          <button
                            onClick={handleStep2}
                            disabled={saving}
                            className="btn-gold flex-1 py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
                          >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                            Continue <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 3: Contact Details */}
                  {step === 3 && (
                    <div className="card p-8">
                      <div className="mb-6">
                        <h2 className="font-display font-bold text-xl text-[var(--color-text)] mb-1">
                          How can we reach you?
                        </h2>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          We use this to send project updates and alerts
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className={LABEL}>Phone Number *</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => { setPhone(e.target.value); setError(""); }}
                            placeholder="+91 98765 43210"
                            className={INPUT}
                            autoFocus
                          />
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                          <input
                            type="checkbox"
                            id="sameAsPhone"
                            checked={sameAsPhone}
                            onChange={(e) => setSameAsPhone(e.target.checked)}
                            className="w-4 h-4 accent-[var(--color-gold)] rounded"
                          />
                          <label htmlFor="sameAsPhone" className="text-sm text-[var(--color-text-secondary)] cursor-pointer">
                            WhatsApp number is same as phone number
                          </label>
                        </div>

                        <div>
                          <label className={LABEL}>Preferred Contact Method</label>
                          <div className="grid grid-cols-3 gap-2">
                            {["WhatsApp", "Email", "Phone Call"].map((method) => (
                              <button
                                key={method}
                                type="button"
                                onClick={() => setContactMethod(method)}
                                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                                  contactMethod === method
                                    ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                                    : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]/40"
                                }`}
                              >
                                {method}
                              </button>
                            ))}
                          </div>
                        </div>

                        {error && (
                          <p className="text-xs text-red-500 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                            {error}
                          </p>
                        )}

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={goBack}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-gold)]/40 transition-all"
                          >
                            <ArrowLeft size={15} /> Back
                          </button>
                          <button
                            onClick={handleStep3}
                            disabled={saving}
                            className="btn-gold flex-1 py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
                          >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                            Continue <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 4: Project Goals */}
                  {step === 4 && (
                    <div className="card p-8">
                      <div className="mb-6">
                        <h2 className="font-display font-bold text-xl text-[var(--color-text)] mb-1">
                          What are you looking to build?
                        </h2>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          Select all that apply — helps us match you with the right team
                        </p>
                      </div>

                      <div className="space-y-5">
                        {/* Service cards */}
                        <div className="grid grid-cols-2 gap-2.5">
                          {SERVICES.map(({ id, label, icon: Icon }) => {
                            const selected = selectedServices.includes(id);
                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => toggleService(id)}
                                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                                  selected
                                    ? "border-[var(--color-gold)] bg-[var(--color-gold)]/8 shadow-[0_0_0_2px_var(--color-gold)]/10"
                                    : "border-[var(--color-border)] hover:border-[var(--color-gold)]/40 bg-[var(--color-bg-secondary)]"
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                    selected ? "bg-[var(--color-gold)]/20" : "bg-[var(--color-bg)]"
                                  }`}
                                >
                                  <Icon
                                    size={16}
                                    className={selected ? "text-[var(--color-gold)]" : "text-[var(--color-text-muted)]"}
                                  />
                                </div>
                                <span
                                  className={`text-xs font-semibold leading-snug ${
                                    selected ? "text-[var(--color-text)]" : "text-[var(--color-text-secondary)]"
                                  }`}
                                >
                                  {label}
                                </span>
                                {selected && (
                                  <Check size={12} className="text-[var(--color-gold)] ml-auto shrink-0" strokeWidth={2.5} />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Budget */}
                        <div>
                          <label className={LABEL}>Budget Range</label>
                          <div className="grid grid-cols-2 gap-2">
                            {BUDGETS.map(({ id, label }) => (
                              <button
                                key={id}
                                type="button"
                                onClick={() => setBudget(id)}
                                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                                  budget === id
                                    ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                                    : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]/40"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Timeline */}
                        <div>
                          <label className={LABEL}>Project Timeline</label>
                          <select value={timeline} onChange={(e) => setTimeline(e.target.value)} className={INPUT}>
                            <option value="">When do you need it?</option>
                            <option value="asap">ASAP</option>
                            <option value="1-3months">1 – 3 months</option>
                            <option value="3-6months">3 – 6 months</option>
                            <option value="6plus">6+ months</option>
                          </select>
                        </div>

                        {error && (
                          <p className="text-xs text-red-500 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                            {error}
                          </p>
                        )}

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={goBack}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-gold)]/40 transition-all"
                          >
                            <ArrowLeft size={15} /> Back
                          </button>
                          <button
                            onClick={handleStep4}
                            disabled={saving}
                            className="btn-gold flex-1 py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
                          >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                            Continue <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 5: All Set */}
                  {step === 5 && (
                    <div className="card p-8 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 180, damping: 12 }}
                        className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6"
                      >
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.35, duration: 0.3 }}
                        >
                          <CheckCircle2 size={40} className="text-green-500" />
                        </motion.div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.4 }}
                      >
                        <h2 className="font-display font-bold text-2xl text-[var(--color-text)] mb-2">
                          You&apos;re all set! 🚀
                        </h2>
                        <p className="text-sm text-[var(--color-text-muted)] mb-8">
                          Your account is ready. Explore your portal below.
                        </p>

                        {/* Quick-start cards */}
                        <div className="grid gap-3 mb-8">
                          {QUICK_LINKS.map(({ label, desc, href, icon: Icon }, i) => (
                            <motion.div
                              key={label}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.55 + i * 0.1, duration: 0.35 }}
                            >
                              <Link
                                href={href}
                                className="flex items-center gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-gold)]/50 hover:shadow-[var(--shadow-card)] transition-all group text-left"
                              >
                                <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-gold)]/20 transition-colors">
                                  <Icon size={18} className="text-[var(--color-gold)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-[var(--color-text)]">{label}</p>
                                  <p className="text-xs text-[var(--color-text-muted)]">{desc}</p>
                                </div>
                                <ArrowRight size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-gold)] transition-colors shrink-0" />
                              </Link>
                            </motion.div>
                          ))}
                        </div>

                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9, duration: 0.35 }}
                        >
                          <Link href="/client-portal" className="btn-gold w-full py-4 flex items-center justify-center gap-2 text-base">
                            Go to Dashboard <ArrowRight size={18} />
                          </Link>
                        </motion.div>
                      </motion.div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
