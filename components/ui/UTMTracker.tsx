"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

function generateSessionId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function UTMTracker() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const utm_source = searchParams.get("utm_source")
    const utm_medium = searchParams.get("utm_medium")
    const utm_campaign = searchParams.get("utm_campaign")
    const utm_content = searchParams.get("utm_content")

    if (utm_source || utm_medium || utm_campaign) {
      const utmData = { utm_source, utm_medium, utm_campaign, utm_content }
      sessionStorage.setItem("utm_data", JSON.stringify(utmData))

      let sessionId = sessionStorage.getItem("session_id")
      if (!sessionId) {
        sessionId = generateSessionId()
        sessionStorage.setItem("session_id", sessionId)
      }

      fetch("/api/utm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...utmData,
          page: window.location.pathname,
          sessionId,
        }),
      }).catch(console.error)
    }
  }, [searchParams])

  return null
}
