"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, Building2, ExternalLink } from "lucide-react";

const INPUT =
  "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all";

export default function AgencyLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/agency/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.push("/agency/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 flex items-center justify-center mx-auto">
            <Building2 size={26} className="text-[var(--color-gold)]" />
          </div>
          <h1 className="font-display font-bold text-2xl text-[var(--color-text)]">
            Agency Portal
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Sign in to your KVL TECH partner dashboard
          </p>
        </div>

        {/* Form card */}
        <div className="card p-8 space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={INPUT + " pl-10"}
                  placeholder="you@agency.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className={INPUT + " pl-10"}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--color-text-muted)]">
          New partner or forgot your password?{" "}
          <a
            href="/contact"
            className="text-[var(--color-gold)] hover:underline inline-flex items-center gap-1"
          >
            Contact KVL TECH <ExternalLink size={10} />
          </a>
        </p>
      </div>
    </div>
  );
}
