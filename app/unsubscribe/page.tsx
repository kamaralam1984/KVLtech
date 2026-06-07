"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const email = searchParams.get("email")
    const token = searchParams.get("token")

    if (!email || !token) {
      setStatus("error")
      setMessage("Invalid unsubscribe link. Please check the link in your email.")
      return
    }

    fetch(`/api/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const text = await res.text()
        if (res.ok) {
          setStatus("success")
          setMessage("You have been unsubscribed. We're sorry to see you go.")
        } else {
          setStatus("error")
          const match = text.match(/<p>(.*?)<\/p>/)
          setMessage(match ? match[1] : "Something went wrong. Please try again.")
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("Network error. Please try again later.")
      })
  }, [searchParams])

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center px-4">
      <div className="bg-[var(--color-bg)] rounded-2xl shadow-[var(--shadow-luxury)] p-10 max-w-md w-full text-center">
        <div className="mb-3">
          <span className="text-sm font-bold tracking-widest text-[var(--color-gold)] uppercase">KVL TECH</span>
        </div>

        {status === "loading" && (
          <>
            <div className="w-16 h-16 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-6">
              <Loader2 size={28} className="text-[var(--color-gold)] animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3">Unsubscribing...</h1>
            <p className="text-[var(--color-text-muted)] text-sm">Please wait while we process your request.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={28} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3">Unsubscribed</h1>
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-2">{message}</p>
            <p className="text-[var(--color-text-muted)] text-xs leading-relaxed mb-8">
              You will no longer receive marketing emails from KVL TECH.
              If this was a mistake, please contact us at{" "}
              <a href="mailto:kvlbusinesssolution@gmail.com" className="text-[var(--color-gold)] hover:underline">
                kvlbusinesssolution@gmail.com
              </a>
            </p>
            <a
              href="/"
              className="inline-block bg-[var(--color-gold)] text-white font-semibold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              Return to Homepage
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <XCircle size={28} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3">Something went wrong</h1>
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-8">{message}</p>
            <a
              href="/"
              className="inline-block bg-[var(--color-gold)] text-white font-semibold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              Return to Homepage
            </a>
          </>
        )}

        <p className="mt-8 text-xs text-[var(--color-text-muted)]">KVL TECH Pvt. Ltd. | kvlbusinesssolutions.com</p>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[var(--color-gold)]" />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  )
}
