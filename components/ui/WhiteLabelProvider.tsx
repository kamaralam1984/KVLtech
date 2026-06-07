"use client"
import { createContext, useContext, useEffect, useRef, useState } from "react"

type WLConfig = {
  companyName: string
  logo: string
  primaryColor: string
  secondaryColor: string
  footerText: string
  supportEmail: string
}

const defaultConfig: WLConfig = {
  companyName: "KVL TECH",
  logo: "/kvl-tech-logo.png",
  primaryColor: "#C9A227",
  secondaryColor: "#0B1437",
  footerText: "KVL Business Solutions",
  supportEmail: "support@kvlbusinesssolutions.com",
}

const WLContext = createContext<WLConfig>(defaultConfig)
export const useWhiteLabel = () => useContext(WLContext)

export function WhiteLabelProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<WLConfig>(defaultConfig)
  const prevJson = useRef(JSON.stringify(defaultConfig))

  useEffect(() => {
    fetch("/api/white-label")
      .then(r => r.json())
      .then(data => {
        const merged = { ...defaultConfig, ...data }
        // Apply CSS vars always (cheap, no re-render)
        document.documentElement.style.setProperty("--wl-primary", merged.primaryColor)
        document.documentElement.style.setProperty("--wl-secondary", merged.secondaryColor)
        // Only trigger React re-render if something actually changed
        const json = JSON.stringify(merged)
        if (json !== prevJson.current) {
          prevJson.current = json
          setConfig(merged)
        }
      })
      .catch(() => {})
  }, [])

  return <WLContext.Provider value={config}>{children}</WLContext.Provider>
}
