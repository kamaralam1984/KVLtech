"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { LANGUAGES } from "@/lib/i18n/languages";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-gold)] transition-all text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
      >
        <span className="text-base leading-none">{language.flag}</span>
        <span className="hidden sm:block">{language.nativeName}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] z-50 overflow-hidden p-1.5"
          >
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                  language.code === lang.code
                    ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                    : "hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                }`}
              >
                <span className="text-xl leading-none shrink-0">{lang.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{lang.nativeName}</p>
                  <p className="text-[10px] opacity-60">{lang.name}</p>
                </div>
                {language.code === lang.code && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)] shrink-0" />
                )}
              </button>
            ))}
            <div className="px-3 pt-2 pb-1 border-t border-[var(--color-border)] mt-1">
              <p className="text-[10px] text-[var(--color-text-muted)] text-center">
                Kaviya speaks your language 💬
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
