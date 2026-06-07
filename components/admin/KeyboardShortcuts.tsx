"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";

const SHORTCUTS = [
  { key: "Ctrl+K", action: "Open Search" },
  { key: "Ctrl+H", action: "Go to Dashboard" },
  { key: "Ctrl+O", action: "Go to Orders" },
  { key: "Ctrl+L", action: "Go to Leads / CRM" },
  { key: "Ctrl+S", action: "Go to Support" },
  { key: "Ctrl+?", action: "Show Keyboard Shortcuts" },
  { key: "?", action: "Show Keyboard Shortcuts" },
  { key: "Escape", action: "Close modal / dialog" },
  { key: "G then D", action: "Dashboard" },
  { key: "G then O", action: "Orders" },
  { key: "G then C", action: "Clients" },
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // For two-key sequences like "G then D"
  const [pendingG, setPendingG] = useState(false);

  const closeModal = useCallback(() => setOpen(false), []);
  const openModal = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = tag === "input" || tag === "textarea" || tag === "select";

      // Escape always closes modal
      if (e.key === "Escape") {
        setOpen(false);
        setPendingG(false);
        return;
      }

      // --- Two-key sequences (only when not in an input) ---
      if (!isInput) {
        if (pendingG) {
          setPendingG(false);
          if (e.key === "d" || e.key === "D") { router.push("/admin"); return; }
          if (e.key === "o" || e.key === "O") { router.push("/admin/orders"); return; }
          if (e.key === "c" || e.key === "C") { router.push("/admin/clients"); return; }
        }

        if (e.key === "g" || e.key === "G") {
          setPendingG(true);
          // Reset pending after 2 s
          setTimeout(() => setPendingG(false), 2000);
          return;
        }

        // "?" — open shortcuts modal
        if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
          openModal();
          return;
        }
      }

      // --- Ctrl shortcuts ---
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "h":
            e.preventDefault();
            router.push("/admin");
            break;
          case "o":
            e.preventDefault();
            router.push("/admin/orders");
            break;
          case "l":
            e.preventDefault();
            router.push("/admin/crm");
            break;
          case "s":
            e.preventDefault();
            router.push("/admin/support");
            break;
          case "/":
          case "?":
            e.preventDefault();
            openModal();
            break;
          // Ctrl+K is handled by GlobalSearch — no need to duplicate
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, pendingG, openModal]);

  return (
    <>
      {/* Floating "?" help button */}
      <div className="fixed bottom-20 left-4 z-30 md:bottom-6" title="Keyboard shortcuts (?)">
        <button
          onClick={openModal}
          aria-label="Keyboard shortcuts"
          className="group w-10 h-10 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-all"
        >
          <Keyboard size={16} />
          {/* Tooltip */}
          <span className="absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2 py-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Keyboard shortcuts (?)
          </span>
        </button>
      </div>

      {/* Shortcuts modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="ks-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={closeModal}
              aria-hidden="true"
            />
            <motion.div
              key="ks-modal"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="pointer-events-auto w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-luxury)] overflow-hidden"
                role="dialog"
                aria-modal="true"
                aria-label="Keyboard shortcuts"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <Keyboard size={18} className="text-[var(--color-gold)]" />
                    <span className="font-semibold text-[var(--color-text)]">Keyboard Shortcuts</span>
                  </div>
                  <button
                    onClick={closeModal}
                    aria-label="Close shortcuts"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Shortcut grid */}
                <div className="p-4 grid gap-2 max-h-[60vh] overflow-y-auto">
                  {SHORTCUTS.map(({ key, action }) => (
                    <div
                      key={`${key}-${action}`}
                      className="flex items-center justify-between gap-4 px-3 py-2.5 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors"
                    >
                      <span className="text-sm text-[var(--color-text-secondary)]">{action}</span>
                      <kbd className="px-2 py-0.5 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] font-mono text-[var(--color-text)] whitespace-nowrap shrink-0">
                        {key}
                      </kbd>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
                  Press <kbd className="px-1.5 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] font-mono text-[9px]">Esc</kbd> to close
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
