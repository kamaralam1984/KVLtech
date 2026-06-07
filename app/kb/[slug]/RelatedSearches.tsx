"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

interface RelatedSearchesProps {
  slug: string;
}

export function RelatedSearches({ slug }: RelatedSearchesProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchRelated() {
      try {
        const res = await fetch(`/api/kb/related?slug=${encodeURIComponent(slug)}`);
        if (res.ok) {
          const d = await res.json();
          if (Array.isArray(d.questions)) setQuestions(d.questions);
        }
      } catch (e) {
        console.error("[RelatedSearches]", e);
      } finally {
        setLoading(false);
      }
    }
    fetchRelated();
  }, [slug]);

  if (!loading && questions.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
      <h3 className="font-display font-bold text-sm text-[var(--color-text)] mb-3 flex items-center gap-2">
        <Sparkles size={14} className="text-[var(--color-gold)]" />
        Related Searches
      </h3>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <Loader2 size={12} className="animate-spin" />
          Generating related questions...
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {questions.map((q, i) => (
            <button
              key={i}
              onClick={() => router.push(`/kb?q=${encodeURIComponent(q)}`)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--color-border)] text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/5 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
