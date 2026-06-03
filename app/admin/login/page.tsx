"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Eye, EyeOff, LogIn, Shield, AlertCircle, Loader2 } from "lucide-react";

const INPUT = "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all placeholder:text-[var(--color-text-muted)]";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid credentials. Please try again.");
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
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--color-navy)] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[var(--color-gold)]/5 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/3 blur-[60px]" />
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <div className="mb-10">
            <Image src="/kvl-tech-logo-white.png" alt="KVL TECH" width={180} height={80} className="h-14 w-auto object-contain mx-auto" />
          </div>

          <h1 className="font-display font-bold text-3xl text-white mb-4 leading-tight">
            Admin Dashboard
          </h1>
          <p className="text-white/50 text-sm leading-relaxed mb-10">
            KVL TECH ka complete business management system. Orders, leads, clients — sab ek jagah manage karein.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "2", label: "Orders" },
              { value: "1", label: "Clients" },
              { value: "1", label: "Lead" },
            ].map(({ value, label }) => (
              <div key={label} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="font-display font-bold text-2xl text-[var(--color-gold)]">{value}</p>
                <p className="text-white/50 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom attribution */}
        <p className="absolute bottom-8 text-white/20 text-xs">
          © 2024 KVL TECH Pvt. Ltd.
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Image src="/kvl-tech-logo-tight.png" alt="KVL TECH" width={160} height={70} className="h-10 w-auto object-contain mx-auto dark:hidden" />
            <Image src="/kvl-tech-logo-white.png" alt="KVL TECH" width={160} height={70} className="h-10 w-auto object-contain mx-auto hidden dark:block" />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="card p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-7">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center shadow-[0_0_0_6px_rgba(201,162,39,0.05)]">
                  <Shield size={24} className="text-[var(--color-gold)]" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-[var(--color-text)]">Admin Login</h2>
                  <p className="text-xs text-[var(--color-text-muted)]">KVL TECH Dashboard Access</p>
                </div>
              </div>

              {/* Error */}
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
                    placeholder="admin@kvlbusinesssolutions.com"
                    className={INPUT}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Password</label>
                    <button type="button" className="text-[10px] text-[var(--color-gold)] hover:underline">Forgot password?</button>
                  </div>
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
                  className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 mt-2 text-base">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                  {loading ? "Signing in..." : "Sign In to Dashboard"}
                </button>
              </form>

              {/* Demo credentials hint */}
              <div className="mt-6 p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Demo Credentials</p>
                <div className="space-y-1">
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Email: <span className="font-mono text-[var(--color-gold)]">admin@kvlbusinesssolutions.com</span>
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Password: <span className="font-mono text-[var(--color-gold)]">admin@kvl2024</span>
                  </p>
                </div>
              </div>

              <p className="text-center text-xs text-[var(--color-text-muted)] mt-5">
                Authorized personnel only. All activity is monitored and logged.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
