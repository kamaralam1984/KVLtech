"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const INPUT = "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all placeholder:text-[var(--color-text-muted)]";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/kvl-tech-logo-tight.png" alt="KVL TECH" width={160} height={70} className="h-10 w-auto object-contain mx-auto dark:hidden" />
            <Image src="/kvl-tech-logo-white.png" alt="KVL TECH" width={160} height={70} className="h-10 w-auto object-contain mx-auto hidden dark:block" />
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="card p-8">

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="font-display font-bold text-xl text-[var(--color-text)] mb-2">Check Your Email</h2>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">
                    If <strong className="text-[var(--color-text)]">{email}</strong> is registered with us, you will receive a password reset link shortly. Please check your inbox.
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mb-6">
                    Did not receive the email? Check your spam/junk folder. The link expires in 1 hour.
                  </p>
                  <button
                    onClick={() => { setSent(false); setEmail(""); }}
                    className="text-sm text-[var(--color-gold)] font-semibold hover:underline"
                  >
                    Try again
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="mb-7">
                    <h2 className="font-display font-bold text-2xl text-[var(--color-text)] mb-1">Forgot Password?</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Enter your registered email and we will send you a reset link.
                    </p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm mb-5"
                      >
                        <AlertCircle size={15} className="shrink-0" /> {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                        <input
                          required
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className={INPUT + " pl-10"}
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 text-base !font-bold !text-black"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                      {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 pt-4 border-t border-[var(--color-border)] text-center">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-bg-secondary)]" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
