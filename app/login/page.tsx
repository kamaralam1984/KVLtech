"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, LogIn, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

const INPUT = "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all placeholder:text-[var(--color-text-muted)]";

const FEATURES = [
  "Track your orders in real-time",
  "Submit branding details",
  "Raise support tickets",
  "Download invoices anytime",
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/client-portal";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
      } else {
        router.push(from);
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] flex">

      {/* Left panel — branding */}
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
            Welcome to the<br />
            <span className="text-[var(--color-gold)]">Client Portal</span>
          </h1>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            Track your orders, submit branding details and get real-time project updates — all in one place.
          </p>

          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--color-gold)]/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={12} className="text-[var(--color-gold)]" />
                </div>
                <p className="text-white/60 text-sm">{f}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-white/10">
            <p className="text-white/30 text-xs">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[var(--color-gold)] hover:underline">
                Register for free
              </Link>
            </p>
          </div>
        </div>

        <p className="absolute bottom-8 text-white/20 text-xs">© 2024 KVL TECH Pvt. Ltd.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <Image src="/kvl-tech-logo-tight.png" alt="KVL TECH" width={160} height={70} className="h-10 w-auto object-contain mx-auto dark:hidden" />
              <Image src="/kvl-tech-logo-white.png" alt="KVL TECH" width={160} height={70} className="h-10 w-auto object-contain mx-auto hidden dark:block" />
            </Link>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="card p-8">
              <div className="mb-7">
                <h2 className="font-display font-bold text-2xl text-[var(--color-text)] mb-1">Sign In</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Sign in to your KVL TECH account</p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm mb-5">
                    <AlertCircle size={15} className="shrink-0" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Email Address</label>
                  <input
                    required type="email"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    className={INPUT}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      required type={showPass ? "text" : "password"}
                      value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      className={INPUT + " pr-12"}
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                      {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 mt-2 text-base !font-bold !text-black">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-[var(--color-gold)] font-semibold hover:underline">
                    Sign Up
                  </Link>
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--color-border)] text-center">
                <Link href="/" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  ← Back to KVL TECH website
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-bg-secondary)]" />}>
      <LoginForm />
    </Suspense>
  );
}
