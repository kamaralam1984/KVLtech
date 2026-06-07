"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Mail } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  if (success === "true") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-8 max-w-md w-full text-center shadow-xl"
      >
        <CheckCircle2 className="mx-auto mb-4 text-green-500" size={56} strokeWidth={1.5} />
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Email Verified!</h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          Your account is now fully active.
        </p>
        <Link
          href="/client-portal"
          className="btn-gold inline-block px-6 py-3 rounded-lg font-semibold"
        >
          Go to Client Portal
        </Link>
        <div className="mt-6">
          <Link href="/" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    );
  }

  if (error === "invalid") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-8 max-w-md w-full text-center shadow-xl"
      >
        <AlertCircle className="mx-auto mb-4 text-red-500" size={56} strokeWidth={1.5} />
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Invalid or Expired Link</h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          This verification link has expired or already been used.
        </p>
        <div className="mt-2">
          <Link href="/" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-8 max-w-md w-full text-center shadow-xl"
    >
      <Mail className="mx-auto mb-4 text-[var(--color-gold)]" size={56} strokeWidth={1.5} />
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Verify Your Email</h1>
      <p className="text-[var(--color-text-muted)] mb-6">
        We sent a verification link to your email address. Please check your inbox and click the link.
      </p>
      <div className="mt-2">
        <Link href="/" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors">
          ← Back to Home
        </Link>
      </div>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <Suspense
        fallback={
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
            <Mail className="mx-auto mb-4 text-[var(--color-gold)]" size={56} strokeWidth={1.5} />
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Verify Your Email</h1>
            <p className="text-[var(--color-text-muted)]">Loading…</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
