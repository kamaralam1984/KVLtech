"use client";

import { useState, useEffect, use } from "react";
import { SignaturePad } from "@/components/ui/SignaturePad";
import { CheckCircle, AlertTriangle, Clock, FileText, Loader2 } from "lucide-react";

interface Signatory {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  signedAt?: string;
}

interface SignatureRequest {
  id: string;
  title: string;
  description?: string;
  content?: string;
  status: string;
  expiresAt?: string;
  signatories: Signatory[];
}

interface PageData {
  signatory: Signatory;
  request: SignatureRequest;
}

export default function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/signatures?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); }
        else { setData(d); }
      })
      .catch(() => setError("Failed to load document"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSign() {
    if (!signatureData || !agreed) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, signatureData }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed to sign"); }
      else { setSuccess(true); }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <Loader2 className="animate-spin text-[var(--color-gold)]" size={32} />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">Invalid Link</h1>
          <p className="text-[var(--color-text-muted)]">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { signatory, request } = data;

  const isExpired = request.expiresAt && new Date() > new Date(request.expiresAt);
  const isAlreadySigned = signatory.status === "SIGNED";
  const isDeclined = signatory.status === "DECLINED";

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Document Signed!</h1>
          <p className="text-[var(--color-text-muted)] mb-4">
            You have successfully signed <strong>{request.title}</strong>.
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Signed at: {new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
          </p>
          <a
            href={`/api/signatures/${request.id}/certificate`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-gold)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Download Your Signed Certificate
          </a>
          <p className="text-xs text-[var(--color-text-muted)] mt-3">
            Certificate available once all parties have signed.
          </p>
        </div>
      </div>
    );
  }

  if (isAlreadySigned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-blue-500" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Already Signed</h1>
          <p className="text-[var(--color-text-muted)] mb-4">
            You signed <strong>{request.title}</strong> on{" "}
            {signatory.signedAt ? new Date(signatory.signedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "—"} IST
          </p>
        </div>
      </div>
    );
  }

  if (isExpired || signatory.status === "EXPIRED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <Clock className="text-red-500" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Link Expired</h1>
          <p className="text-[var(--color-text-muted)]">
            This signature request expired on{" "}
            {request.expiresAt ? new Date(request.expiresAt).toLocaleDateString("en-IN") : "an earlier date"}.
            Please contact the sender for a new link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-navy)] flex items-center justify-center">
            <FileText className="text-[var(--color-gold)]" size={20} />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wide">KVL TECH</p>
            <p className="text-sm font-semibold text-[var(--color-text)]">Electronic Signature</p>
          </div>
        </div>

        {/* Document info */}
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">{request.title}</h1>
          {request.description && (
            <p className="text-[var(--color-text-muted)] text-sm mb-4">{request.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
              Signing as: <strong className="text-[var(--color-text)]">{signatory.name}</strong> ({signatory.role})
            </span>
          </div>
          {request.expiresAt && (
            <p className="text-xs text-amber-600 mt-3">
              Expires: {new Date(request.expiresAt).toLocaleDateString("en-IN")}
            </p>
          )}
        </div>

        {/* Document content */}
        {request.content && (
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">Document Content</h2>
            <div
              className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap"
              style={{ maxHeight: "320px", overflowY: "auto" }}
            >
              {request.content}
            </div>
          </div>
        )}

        {/* Signatories list */}
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">All Signatories</h2>
          <div className="space-y-2">
            {request.signatories.map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{s.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{s.role}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  s.status === "SIGNED" ? "bg-green-100 text-green-700" :
                  s.status === "DECLINED" ? "bg-red-100 text-red-700" :
                  s.status === "EXPIRED" ? "bg-gray-100 text-gray-600" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {s.status === "SIGNED" && s.signedAt
                    ? `Signed ${new Date(s.signedAt).toLocaleDateString("en-IN")}`
                    : s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Signature section */}
        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-6 mb-6">
          <h2 className="text-base font-semibold text-[var(--color-text)] mb-1">Your Signature</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">Draw your signature below using your mouse or finger.</p>
          <SignaturePad
            onSave={(dataUrl) => setSignatureData(dataUrl)}
          />
          {signatureData && (
            <p className="text-xs text-green-600 mt-2 font-medium">Signature captured</p>
          )}
        </div>

        {/* Agreement checkbox */}
        <label className="flex items-start gap-3 cursor-pointer mb-6 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[var(--color-gold)]"
          />
          <span className="text-sm text-[var(--color-text)]">
            I agree to sign this document electronically. My electronic signature is legally binding and equivalent to my handwritten signature.
          </span>
        </label>

        {error && (
          <p className="text-sm text-red-500 mb-4 p-3 rounded-lg bg-red-50 border border-red-200">{error}</p>
        )}

        <button
          onClick={handleSign}
          disabled={!signatureData || !agreed || submitting}
          className="w-full py-3.5 rounded-xl bg-[var(--color-gold)] text-white font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <><Loader2 className="animate-spin" size={18} /> Signing...</>
          ) : (
            "I Agree and Sign"
          )}
        </button>
        <p className="text-xs text-center text-[var(--color-text-muted)] mt-3">
          By clicking "I Agree and Sign", you confirm your identity and agreement to the document above.
        </p>
      </div>
    </div>
  );
}
