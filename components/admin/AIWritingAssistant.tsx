"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Loader2, Check, ChevronDown } from "lucide-react";

type Action = "improve" | "shorter" | "longer" | "grammar" | "hindi";

const ACTIONS: { key: Action; label: string; desc: string }[] = [
  { key: "improve",  label: "Improve Writing",   desc: "More professional & clear" },
  { key: "shorter",  label: "Make Shorter",       desc: "Condense while keeping key points" },
  { key: "longer",   label: "Make Longer",        desc: "Expand with more detail" },
  { key: "grammar",  label: "Fix Grammar",        desc: "Correct grammar & spelling" },
  { key: "hindi",    label: "Translate to Hindi", desc: "For WhatsApp messages" },
];

export interface AIWritingAssistantProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  context?: string;
  className?: string;
}

export function AIWritingAssistant({
  value,
  onChange,
  placeholder,
  context,
  className = "",
}: AIWritingAssistantProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<Action | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleAction = async (action: Action) => {
    if (!value.trim()) return;
    setLoading(action);
    setLastResult(null);
    setAccepted(false);
    try {
      const res = await fetch("/api/admin/ai-write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: value, action, context }),
      });
      const data = await res.json();
      if (data.result) {
        setLastResult(data.result);
      }
    } catch {
      // silently fail
    }
    setLoading(null);
  };

  const accept = () => {
    if (lastResult) {
      onChange(lastResult);
      setAccepted(true);
      setLastResult(null);
      setTimeout(() => { setAccepted(false); setOpen(false); }, 800);
    }
  };

  const discard = () => {
    setLastResult(null);
    setAccepted(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Textarea rendered by parent — this component adds the AI panel below */}
      <div className="mt-1 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          disabled={!value.trim()}
          className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all disabled:opacity-40"
        >
          <Sparkles size={11} />
          AI
          <ChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {accepted && (
          <span className="flex items-center gap-1 text-[10px] text-green-500 font-medium">
            <Check size={11} /> Applied
          </span>
        )}
        {loading && (
          <span className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
            <Loader2 size={11} className="animate-spin" /> Working...
          </span>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 mt-1 w-72 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-luxury)] overflow-hidden"
          >
            {/* Result preview */}
            {lastResult && (
              <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                <p className="text-[10px] font-semibold text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wide">AI Result</p>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-4">{lastResult}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={accept}
                    className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 rounded-lg bg-[var(--color-gold)] text-white hover:opacity-90 transition-opacity"
                  >
                    <Check size={10} /> Use This
                  </button>
                  <button
                    onClick={discard}
                    className="flex-1 text-[10px] font-semibold py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-1">
              {ACTIONS.map(({ key, label, desc }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleAction(key)}
                  disabled={loading !== null}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors text-left disabled:opacity-50 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                    {loading === key ? (
                      <Loader2 size={12} className="animate-spin text-[var(--color-gold)]" />
                    ) : (
                      <Sparkles size={12} className="text-[var(--color-gold)]" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text)]">{label}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="px-3 py-2 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              <p className="text-[9px] text-[var(--color-text-muted)] text-center">Powered by Groq · llama3-8b-8192</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
