"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight, Loader2, X, CheckCircle2 } from "lucide-react";

const BUSINESS_TYPES = [
  "Restaurant / Cafe / Hotel",
  "School / College",
  "Hospital / Clinic",
  "E-commerce / Online Store",
  "Real Estate Agency",
  "Gym / Fitness Center",
  "Freelancer / Portfolio",
  "Manufacturing / Factory",
  "Retail Shop",
  "Other Business",
];

const BUDGETS = [
  "₹5,000 – ₹15,000",
  "₹15,000 – ₹30,000",
  "₹30,000 – ₹60,000",
  "₹60,000+",
];

const INPUT = "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all";

export function ProductRecommender() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ businessType: "", budget: "", requirement: "", timeline: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.businessType) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) { setResult(data); setStep(3); }
      else setError(data.error || "Try again");
    } catch { setError("Network error — please retry"); }
    setLoading(false);
  };

  const reset = () => { setStep(1); setResult(null); setError(""); setForm({ businessType: "", budget: "", requirement: "", timeline: "" }); };

  return (
    <>
      {/* Floating trigger button */}
      <button onClick={() => { setOpen(true); reset(); }}
        className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
        style={{ background: "linear-gradient(135deg, #7C3AED, #C9A227)" }}>
        <Sparkles size={16} />
        AI Recommend
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setOpen(false)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-md bg-[var(--color-bg)] rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]"
                style={{ background: "linear-gradient(135deg, #0B1437, #1a2a5e)" }}>
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[var(--color-gold)]" />
                  <div>
                    <h3 className="font-display font-bold text-white text-base">AI Product Advisor</h3>
                    <p className="text-white/50 text-[11px]">3 sawal → perfect solution</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {/* Step 1 — Business type + budget */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">What is your business? *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {BUSINESS_TYPES.map(bt => (
                          <button key={bt} onClick={() => setForm(f => ({ ...f, businessType: bt }))}
                            className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all border ${form.businessType === bt ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]" : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]/50"}`}>
                            {bt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Budget range?</label>
                      <div className="grid grid-cols-2 gap-2">
                        {BUDGETS.map(b => (
                          <button key={b} onClick={() => setForm(f => ({ ...f, budget: b }))}
                            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${form.budget === b ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]" : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]/50"}`}>
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setStep(2)} disabled={!form.businessType}
                      className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50">
                      Next <ArrowRight size={15} />
                    </button>
                  </motion.div>
                )}

                {/* Step 2 — Requirements */}
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Any specific requirements? (optional)</label>
                      <textarea value={form.requirement} onChange={e => setForm(f => ({ ...f, requirement: e.target.value }))}
                        rows={3} placeholder="e.g. Online booking, payment gateway, admin panel, mobile app..."
                        className={INPUT + " resize-none"} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Timeline?</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["Urgent (1-3 days)", "1-2 weeks", "1 month+"].map(t => (
                          <button key={t} onClick={() => setForm(f => ({ ...f, timeline: t }))}
                            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${form.timeline === t ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]" : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]/50"}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
                      <button onClick={handleSubmit} disabled={loading}
                        className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                        {loading ? <><Loader2 size={15} className="animate-spin" /> Analyzing...</> : <><Sparkles size={15} /> Get Recommendation</>}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3 — Result */}
                {step === 3 && result && (
                  <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <div className="flex items-center gap-2 text-green-500 mb-1">
                      <CheckCircle2 size={18} />
                      <span className="text-sm font-semibold">Perfect match found!</span>
                    </div>

                    <div className="rounded-2xl overflow-hidden border-2 border-[var(--color-gold)] shadow-[var(--shadow-gold)]">
                      <div className="bg-[var(--color-gold)]/10 px-5 py-3 flex items-center justify-between">
                        <div>
                          <p className="font-display font-bold text-base text-[var(--color-text)]">{result.name}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{result.tagline}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--color-gold)] text-white">{result.plan} Plan</span>
                          <p className="text-sm font-bold text-[var(--color-gold)] mt-1">
                            ₹{(result.plan === "Basic" ? result.basicPrice : result.premiumPrice).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="text-sm text-[var(--color-text-secondary)]">{result.reason}</p>
                        <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 dark:bg-green-500/10 rounded-lg px-3 py-2">
                          <CheckCircle2 size={12} />
                          {result.saving}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={reset} className="btn-outline flex-1 text-sm">Start Over</button>
                      <Link href={`/products/${result.slug}`} onClick={() => setOpen(false)}
                        className="btn-gold flex-1 flex items-center justify-center gap-2 text-sm">
                        View Product <ArrowRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Progress dots */}
              {step < 3 && (
                <div className="flex justify-center gap-1.5 pb-4">
                  {[1, 2].map(s => (
                    <div key={s} className={`w-2 h-2 rounded-full transition-all ${step === s ? "bg-[var(--color-gold)] w-4" : "bg-[var(--color-border)]"}`} />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
