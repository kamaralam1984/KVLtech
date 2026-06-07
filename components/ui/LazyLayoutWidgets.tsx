"use client"
import dynamic from "next/dynamic"

const ExitIntentPopup = dynamic(() => import("@/components/ui/ExitIntentPopup").then(m => ({ default: m.ExitIntentPopup })), { ssr: false })
const SocialProofToast = dynamic(() => import("@/components/ui/SocialProofToast").then(m => ({ default: m.SocialProofToast })), { ssr: false })
const CookieConsent = dynamic(() => import("@/components/ui/CookieConsent").then(m => ({ default: m.CookieConsent })), { ssr: false })
const PWARegister = dynamic(() => import("@/components/ui/PWARegister").then(m => ({ default: m.PWARegister })), { ssr: false })
const ScrollToTop = dynamic(() => import("@/components/ui/ScrollToTop").then(m => ({ default: m.ScrollToTop })), { ssr: false })

export function LazyLayoutWidgets() {
  return (
    <>
      <ExitIntentPopup />
      <SocialProofToast />
      <CookieConsent />
      <PWARegister />
      <ScrollToTop />
    </>
  )
}
