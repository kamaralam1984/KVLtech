"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, KeyRound, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

const INPUT = "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all placeholder:text-[var(--color-text-muted)]";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setTokenValid(false); return; }
    fetch(`/api/auth/reset-password?token=${token}`)
      .then(r => r.json())
      .then(d => setTokenValid(d.valid))
      .catch(() => setTokenValid(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[var(--color-gold)]" />
      </div>
    );
  }

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

            {!tokenValid ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
                </div>
                <h2 className="font-display font-bold text-xl text-[var(--color-text)] mb-2">Invalid Reset Link</h2>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">
                  This password reset link is invalid or has expired. Reset links are valid for 1 hour only.
                </p>
                <Link href="/forgot-password" className="btn-gold inline-flex items-center gap-2 py-2.5 px-5 !text-black !font-bold text-sm">
                  Request New Link
                </Link>
              </div>
            ) : done ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="font-display font-bold text-xl text-[var(--color-text)] mb-2">Password Reset Successful</h2>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-2">
                  Your new password has been set. You can now sign in.
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">Redirecting to sign in page in 3 seconds...</p>
              </div>
            ) : (
              <>
                <div className="mb-7">
                  <h2 className="font-display font-bold text-2xl text-[var(--color-text)] mb-1">Set New Password</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Choose a new password. It must be at least 8 characters.
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
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        required
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className={INPUT + " pr-12"}
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                        {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                            password.length >= i * 3
                              ? i <= 1 ? "bg-red-400" : i <= 2 ? "bg-yellow-400" : i <= 3 ? "bg-blue-400" : "bg-green-400"
                              : "bg-[var(--color-border)]"
                          }`} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <input
                        required
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder="Enter password again"
                        className={INPUT + " pr-12"}
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                        {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {confirm.length > 0 && (
                      <p className={`text-xs mt-1 ${password === confirm ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                        {password === confirm ? "✓ Passwords match" : "✗ Passwords do not match"}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 mt-2 text-base !font-bold !text-black"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              </>
            )}

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-bg-secondary)]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
