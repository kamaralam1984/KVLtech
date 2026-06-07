"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Loader2, AlertCircle } from "lucide-react";

export default function SignatureCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCert() {
      try {
        const res = await fetch(`/api/admin/signatures?id=${id}&format=certificate`, {
          credentials: "include",
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setError(d.error || "Failed to load certificate");
          return;
        }
        const text = await res.text();
        setHtml(text);
      } catch (e) {
        console.error(e);
        setError("Network error loading certificate");
      } finally {
        setLoading(false);
      }
    }
    fetchCert();
  }, [id]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Toolbar — hidden when printing */}
      <div className="no-print flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg)] sticky top-0 z-10">
        <Link
          href="/admin/signatures"
          className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Signatures
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--color-text-muted)]">Certificate ID: {id}</span>
          {html && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-gold)] text-white text-sm font-semibold hover:bg-[#b8911f] transition-colors"
            >
              <Printer size={15} /> Download PDF
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-[var(--color-gold)]" />
          </div>
        )}

        {error && (
          <div className="max-w-lg mx-auto mt-16 p-6 rounded-2xl border border-red-200 bg-red-50 text-center">
            <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="font-semibold text-red-700">{error}</p>
            <Link href="/admin/signatures" className="mt-4 inline-block text-sm text-[var(--color-gold)] hover:underline">
              Go back to signatures
            </Link>
          </div>
        )}

        {html && !error && (
          <iframe
            srcDoc={html}
            title="Signature Certificate"
            className="w-full rounded-xl border border-[var(--color-border)] shadow-lg"
            style={{ minHeight: "calc(100vh - 120px)", height: "900px" }}
          />
        )}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          iframe { border: none !important; box-shadow: none !important; height: 100vh !important; }
        }
      `}</style>
    </div>
  );
}
