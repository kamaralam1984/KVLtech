"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, AlertCircle, Loader2, CheckCircle2, ArrowLeft, Shield, Mail, RefreshCw } from "lucide-react";

const INPUT = "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all placeholder:text-[var(--color-text-muted)]";

const BENEFITS = [
  { title: "Free Registration", desc: "No hidden charges" },
  { title: "Real-time Updates", desc: "Notified at every step" },
  { title: "Direct Support", desc: "24/7 dedicated help" },
  { title: "Secure Portal", desc: "Bank-level encryption" },
];

type Step = "form" | "otp" | "success";

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP step
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (step !== "otp") return;
    setResendTimer(60);
    setCanResend(false);
    const interval = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Step 1: Submit form → send OTP
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP. Please try again.");
      } else {
        setStep("otp");
        setTimeout(() => otpRefs.current[0]?.focus(), 300);
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  // OTP input handler — auto-advance
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  // Step 2: Verify OTP → create account
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: form.email, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid OTP. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      } else {
        setStep("success");
        setTimeout(() => { router.push("/client-portal"); router.refresh(); }, 2000);
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend) return;
    setError("");
    setOtp(["", "", "", "", "", ""]);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email,
          phone: form.phone, company: form.company, password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resend OTP.");
      } else {
        setResendTimer(60);
        setCanResend(false);
        const interval = setInterval(() => {
          setResendTimer(t => {
            if (t <= 1) { clearInterval(interval); setCanResend(true); return 0; }
            return t - 1;
          });
        }, 1000);
        otpRefs.current[0]?.focus();
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-[var(--color-navy)] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[var(--color-gold)]/6 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/3 blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative z-10 max-w-sm w-full">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-10 transition-colors">
            <ArrowLeft size={14} /> Back to website
          </Link>
          <div className="mb-8">
            <Image src="/kvl-tech-logo-white.png" alt="KVL TECH" width={180} height={80} className="h-12 w-auto object-contain" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-3 leading-tight">
            Join the <span style={{ color: "#C9A227" }}>KVL TECH</span><br />Client Family
          </h1>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            Create a free account and manage your digital project — track orders, submit branding, and get dedicated support.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: "rgba(201,162,39,0.2)" }}>
                  <CheckCircle2 size={14} style={{ color: "#C9A227" }} />
                </div>
                <p className="text-white font-semibold text-sm">{b.title}</p>
                <p className="text-white/40 text-xs mt-0.5">{b.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-white/30 text-xs">
              Already have an account?{" "}
              <Link href="/login" className="hover:underline" style={{ color: "#C9A227" }}>Sign In</Link>
            </p>
          </div>
        </div>
        <p className="absolute bottom-8 text-white/20 text-xs">© 2024 KVL TECH Pvt. Ltd.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <Image src="/kvl-tech-logo-tight.png" alt="KVL TECH" width={160} height={70} className="h-10 w-auto object-contain mx-auto dark:hidden" />
              <Image src="/kvl-tech-logo-white.png" alt="KVL TECH" width={160} height={70} className="h-10 w-auto object-contain mx-auto hidden dark:block" />
            </Link>
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Registration Form ── */}
            {step === "form" && (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }}>
                <div className="card p-8">
                  <div className="mb-6">
                    <h2 className="font-display font-bold text-2xl text-[var(--color-text)] mb-1">Create Account</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">Register for free — no credit card required</p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm mb-5">
                        <AlertCircle size={15} className="shrink-0" /> {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Full Name *</label>
                      <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Your full name" className={INPUT} autoComplete="name" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Email Address *</label>
                      <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="your@email.com" className={INPUT} autoComplete="email" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Phone</label>
                        <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                          placeholder="+91 9999999999" className={INPUT} autoComplete="tel" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Company</label>
                        <input type="text" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                          placeholder="Business name" className={INPUT} autoComplete="organization" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Password *</label>
                      <div className="relative">
                        <input required type={showPass ? "text" : "password"} value={form.password}
                          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                          placeholder="Min 6 characters" className={INPUT + " pr-12"} autoComplete="new-password" />
                        <button type="button" onClick={() => setShowPass(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                          {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Confirm Password *</label>
                      <div className="relative">
                        <input required type={showConfirm ? "text" : "password"} value={form.confirmPassword}
                          onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                          placeholder="Re-enter your password" className={INPUT + " pr-12"} autoComplete="new-password" />
                        <button type="button" onClick={() => setShowConfirm(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                          {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" disabled={loading}
                      className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 mt-2 text-base !font-bold !text-black">
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                      {loading ? "Sending verification code..." : "Continue"}
                    </button>
                  </form>

                  <div className="mt-5 flex items-center gap-2 p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                    <Shield size={14} className="text-[var(--color-gold)] shrink-0" />
                    <p className="text-xs text-[var(--color-text-muted)]">Your data is secure — 256-bit encryption, no spam.</p>
                  </div>

                  <div className="mt-5 text-center space-y-3">
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Already have an account?{" "}
                      <Link href="/login" className="text-[var(--color-gold)] font-semibold hover:underline">Sign In</Link>
                    </p>
                    <Link href="/" className="block text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                      ← Back to KVL TECH website
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: OTP Verification ── */}
            {step === "otp" && (
              <motion.div key="otp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35 }}>
                <div className="card p-8">
                  {/* Email icon */}
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center mb-6">
                    <Mail size={28} className="text-[var(--color-gold)]" />
                  </div>

                  <h2 className="font-display font-bold text-2xl text-[var(--color-text)] mb-2">Check your email</h2>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">
                    We sent a 6-digit verification code to
                  </p>
                  <p className="text-sm font-semibold text-[var(--color-text)] mb-6">{form.email}</p>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm mb-5">
                        <AlertCircle size={15} className="shrink-0" /> {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleVerifyOtp}>
                    {/* 6-digit OTP input boxes */}
                    <div className="flex gap-2 justify-between mb-6" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={el => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all"
                        />
                      ))}
                    </div>

                    <button type="submit" disabled={loading || otp.join("").length !== 6}
                      className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 text-base !font-bold !text-black mb-4">
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                      {loading ? "Verifying..." : "Verify & Create Account"}
                    </button>
                  </form>

                  {/* Resend */}
                  <div className="text-center space-y-3">
                    <button onClick={handleResend} disabled={!canResend}
                      className="flex items-center gap-1.5 mx-auto text-sm text-[var(--color-text-muted)] disabled:opacity-50 hover:text-[var(--color-text)] transition-colors">
                      <RefreshCw size={13} />
                      {canResend ? "Resend code" : `Resend in ${resendTimer}s`}
                    </button>

                    <button onClick={() => { setStep("form"); setError(""); setOtp(["", "", "", "", "", ""]); }}
                      className="block w-full text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                      ← Change email address
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Success ── */}
            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                <div className="card p-10 text-center">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={40} className="text-green-600 dark:text-green-400" />
                  </motion.div>
                  <h2 className="font-display font-bold text-2xl text-[var(--color-text)] mb-2">Account Created!</h2>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Welcome to KVL TECH, <strong>{form.name}</strong>!</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Redirecting to your Client Portal...</p>
                  <div className="mt-6">
                    <Loader2 size={20} className="animate-spin text-[var(--color-gold)] mx-auto" />
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
