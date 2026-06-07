"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-[var(--color-bg)]">
      <div className="text-6xl mb-4" role="img" aria-label="Satellite dish">
        📡
      </div>
      <h1 className="text-2xl font-bold mb-2 text-[var(--color-text)]">
        You&apos;re Offline
      </h1>
      <p className="text-[var(--color-text-muted)] mb-6 max-w-sm">
        Check your internet connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 rounded-xl bg-[var(--color-gold)] text-white font-semibold hover:opacity-90 transition-opacity"
      >
        Try Again
      </button>
      <a
        href="/"
        className="mt-3 text-sm text-[var(--color-text-muted)] underline underline-offset-2 hover:text-[var(--color-text)] transition-colors"
      >
        Go to Homepage
      </a>
    </div>
  );
}
