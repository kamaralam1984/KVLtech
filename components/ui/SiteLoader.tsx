"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

/* ─── Initial page load ────────────────────────────────────────────────────── */
function useInitialLoad() {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    // Show for at least 300ms, then fade out
    const id = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(id)
  }, [])
  return loading
}

/* ─── Route transition ─────────────────────────────────────────────────────── */
function useRouteLoader() {
  const pathname = usePathname()
  const [busy, setBusy] = useState(false)
  const prev = useRef(pathname)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (prev.current === pathname) return
    prev.current = pathname
    setBusy(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setBusy(false), 400)
  }, [pathname])

  return busy
}

/* ─── SVG Ring with spinning text ─────────────────────────────────────────── */
function KvlRing() {
  const r = 54
  const circumference = 2 * Math.PI * r

  return (
    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>

      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(201,162,39,0.18) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* Rotating dashed ring */}
      <motion.svg
        width={160} height={160}
        viewBox="0 0 160 160"
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, ease: "linear", repeat: Infinity }}
      >
        <circle
          cx={80} cy={80} r={r}
          fill="none"
          stroke="rgba(201,162,39,0.25)"
          strokeWidth={2}
        />
        <motion.circle
          cx={80} cy={80} r={r}
          fill="none"
          stroke="#C9A227"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.3}
        />
      </motion.svg>

      {/* Counter-rotating slow ring */}
      <motion.svg
        width={160} height={160}
        viewBox="0 0 160 160"
        className="absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{ duration: 6, ease: "linear", repeat: Infinity }}
      >
        <circle
          cx={80} cy={80} r={44}
          fill="none"
          stroke="rgba(201,162,39,0.12)"
          strokeWidth={1.5}
          strokeDasharray="4 8"
        />
      </motion.svg>

      {/* Centre logo */}
      <motion.div
        className="relative flex flex-col items-center justify-center"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
      >
        {/* Logo circle */}
        <div
          className="flex flex-col items-center justify-center rounded-full"
          style={{
            width: 72, height: 72,
            background: "linear-gradient(135deg, #0B1437 0%, #162054 100%)",
            boxShadow: "0 0 0 2px rgba(201,162,39,0.4), 0 8px 32px rgba(11,20,55,0.6)",
          }}
        >
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: 2,
              background: "linear-gradient(135deg, #C9A227, #E8C547, #C9A227)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1,
            }}
          >
            KVL
          </span>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 9,
              letterSpacing: 3,
              color: "rgba(255,255,255,0.7)",
              textTransform: "uppercase",
              marginTop: 2,
            }}
          >
            TECH
          </span>
        </div>
      </motion.div>
    </div>
  )
}

/* ─── Full-screen overlay ──────────────────────────────────────────────────── */
function Overlay({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="site-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeOut" } }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            background: "var(--color-bg, #fff)",
          }}
        >
          <KvlRing />

          {/* Loading dots */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                style={{
                  width: 6, height: 6,
                  borderRadius: "50%",
                  background: "#C9A227",
                  display: "block",
                }}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─── Slim top progress bar (route transitions) ────────────────────────────── */
function TopBar({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="top-bar"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.85 }}
          exit={{ scaleX: 1, opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0,
            height: 3,
            background: "linear-gradient(90deg, #C9A227, #E8C547, #C9A227)",
            transformOrigin: "left center",
            zIndex: 99999,
            boxShadow: "0 0 8px rgba(201,162,39,0.6)",
          }}
        />
      )}
    </AnimatePresence>
  )
}

/* ─── Export ───────────────────────────────────────────────────────────────── */
export function SiteLoader() {
  const initial = useInitialLoad()
  const route = useRouteLoader()

  return (
    <>
      <Overlay show={initial} />
      <TopBar show={!initial && route} />
    </>
  )
}
