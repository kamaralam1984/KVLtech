"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Cookie, ChevronDown, ChevronUp, Shield } from "lucide-react";

interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  necessary: true;
}

const STORAGE_KEY = "cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    analytics: false,
    marketing: false,
    necessary: true,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const save = async (data: ConsentState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
    } catch {}
    setVisible(false);
    try {
      await fetch("/api/cookie-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {}
  };

  const acceptAll = () =>
    save({ analytics: true, marketing: true, necessary: true });

  const acceptNecessary = () =>
    save({ analytics: false, marketing: false, necessary: true });

  const acceptCustom = () => save(consent);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] max-w-xl mx-auto"
        >
          <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-start gap-3 p-5 pb-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie size={20} className="text-[var(--color-gold)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-base text-gray-900 dark:text-white">
                  We use cookies
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                  We use cookies to improve your experience and analyze traffic.
                  See our{" "}
                  <Link
                    href="/privacy"
                    className="text-[var(--color-gold)] hover:underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  for details. GDPR compliant.
                </p>
              </div>
              <button
                onClick={acceptNecessary}
                className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Customize panel */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-3 space-y-3">
                    <div className="h-px bg-gray-100 dark:bg-white/10" />

                    {/* Necessary */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <Shield size={15} className="text-green-500" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            Necessary
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Required for basic site functionality
                          </p>
                        </div>
                      </div>
                      <div className="w-10 h-5 rounded-full bg-green-500 relative shrink-0">
                        <div className="w-4 h-4 rounded-full bg-white absolute right-0.5 top-0.5 shadow-sm" />
                      </div>
                    </div>

                    {/* Analytics */}
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Analytics
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Helps us understand how visitors use our site
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setConsent((c) => ({ ...c, analytics: !c.analytics }))
                        }
                        className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${
                          consent.analytics ? "bg-[var(--color-gold)]" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white absolute top-0.5 shadow-sm transition-all ${
                            consent.analytics ? "right-0.5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Marketing */}
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Marketing
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Used for personalized advertisements
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setConsent((c) => ({ ...c, marketing: !c.marketing }))
                        }
                        className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${
                          consent.marketing ? "bg-[var(--color-gold)]" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white absolute top-0.5 shadow-sm transition-all ${
                            consent.marketing ? "right-0.5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="px-5 pb-5 pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={acceptAll}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--color-gold)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Accept All
              </button>
              <button
                onClick={acceptNecessary}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-white/20 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
              >
                Necessary Only
              </button>
              {expanded ? (
                <button
                  onClick={acceptCustom}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--color-gold)] text-[var(--color-gold)] text-sm font-semibold hover:bg-[var(--color-gold)]/10 transition-all"
                >
                  Save Preferences
                </button>
              ) : (
                <button
                  onClick={() => setExpanded(true)}
                  className="flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-[var(--color-gold)] transition-colors px-2"
                >
                  Customize <ChevronDown size={14} />
                </button>
              )}
              {expanded && (
                <button
                  onClick={() => setExpanded(false)}
                  className="flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors px-2"
                >
                  <ChevronUp size={14} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
