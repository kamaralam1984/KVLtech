"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "kvl-pwa-install-dismissed";

export function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Register service worker in production only — dev SW caches stale pages and breaks HMR
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }

    // Don't show if already dismissed
    if (localStorage.getItem(DISMISS_KEY)) return;

    // Don't show if already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Small delay so the page is fully loaded before showing the banner
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setInstallPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[360px] z-50 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-luxury)] p-4 flex items-start gap-3"
          role="dialog"
          aria-modal="false"
          aria-label="Install app prompt"
        >
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
            <Download size={22} className="text-[var(--color-gold)]" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text)]">
              Install KVL TECH App
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Quick access from your homescreen — works offline too.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="px-4 py-1.5 rounded-lg bg-[var(--color-gold)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-lg text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                Not now
              </button>
            </div>
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
