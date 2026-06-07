"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";

export function HelpfulButtons({ slug }: { slug: string }) {
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);

  const vote = async (helpful: boolean) => {
    if (voted) return;
    setVoted(helpful ? "yes" : "no");
    try {
      await fetch(`/api/kb/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpful }),
      });
    } catch (e) { console.error(e); }
  };

  return (
    <div className="border-t border-[var(--color-border)] pt-8">
      <p className="text-sm font-semibold text-[var(--color-text)] mb-4">Was this article helpful?</p>
      {voted ? (
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <CheckCircle2 size={16} className="text-green-500" />
          {voted === "yes" ? "Thank you for your feedback!" : "Thanks! We'll work on improving this."}
        </div>
      ) : (
        <div className="flex gap-3">
          <button onClick={() => vote(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:border-green-500 hover:text-green-600 hover:bg-green-500/5 transition-all font-medium">
            <ThumbsUp size={15} /> Yes, helpful
          </button>
          <button onClick={() => vote(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:border-red-400 hover:text-red-500 hover:bg-red-500/5 transition-all font-medium">
            <ThumbsDown size={15} /> Not helpful
          </button>
        </div>
      )}
    </div>
  );
}
