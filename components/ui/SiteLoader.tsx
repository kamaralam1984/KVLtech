"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

/* ─── Initial page load ────────────────────────────────────────────────────── */
function useInitialLoad() {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
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

/* ─── Orbiting particle dots ───────────────────────────────────────────────── */
function OrbitDots({ radius, count, duration, color, size = 4 }: {
  radius: number; count: number; duration: number; color: string; size?: number
}) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={{ rotate: 360 }}
      transition={{ duration, ease: "linear", repeat: Infinity }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i
        const rad = (angle * Math.PI) / 180
        const x = radius * Math.cos(rad)
        const y = radius * Math.sin(rad)
        return (
          <motion.span
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 ${size * 2}px ${color}`,
              transform: `translate(${x}px, ${y}px)`,
            }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.4, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: (i / count) * 1.5, ease: "easeInOut" }}
          />
        )
      })}
    </motion.div>
  )
}

/* ─── KVL Ring Logo ────────────────────────────────────────────────────────── */
function KvlRing() {
  const r1 = 66
  const r2 = 52
  const r3 = 40
  const c1 = 2 * Math.PI * r1
  const c2 = 2 * Math.PI * r2

  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>

      {/* Outer ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(201,162,39,0.25) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity }}
      />

      {/* Extra wide outer pulse */}
      <motion.div
        className="absolute rounded-full"
        style={{ inset: -20, background: "radial-gradient(circle, rgba(201,162,39,0.08) 0%, transparent 60%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, delay: 0.5 }}
      />

      {/* Ring 1 — fast clockwise arc */}
      <motion.svg
        width={200} height={200} viewBox="0 0 200 200"
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, ease: "linear", repeat: Infinity }}
      >
        <defs>
          <filter id="glow1">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={100} cy={100} r={r1} fill="none" stroke="rgba(201,162,39,0.12)" strokeWidth={2} />
        <circle cx={100} cy={100} r={r1} fill="none" stroke="#C9A227" strokeWidth={3}
          strokeLinecap="round" strokeDasharray={c1} strokeDashoffset={c1 * 0.65}
          filter="url(#glow1)" />
      </motion.svg>

      {/* Ring 2 — medium counter-clockwise */}
      <motion.svg
        width={200} height={200} viewBox="0 0 200 200"
        className="absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{ duration: 3.5, ease: "linear", repeat: Infinity }}
      >
        <defs>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={100} cy={100} r={r2} fill="none" stroke="rgba(232,197,71,0.08)" strokeWidth={1.5} />
        <circle cx={100} cy={100} r={r2} fill="none" stroke="#E8C547" strokeWidth={2}
          strokeLinecap="round" strokeDasharray={c2} strokeDashoffset={c2 * 0.45}
          filter="url(#glow2)" />
      </motion.svg>

      {/* Ring 3 — slow dashed clockwise */}
      <motion.svg
        width={200} height={200} viewBox="0 0 200 200"
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 7, ease: "linear", repeat: Infinity }}
      >
        <circle cx={100} cy={100} r={r3} fill="none"
          stroke="rgba(201,162,39,0.18)" strokeWidth={1.5} strokeDasharray="3 9" />
      </motion.svg>

      {/* Orbiting particles — outer ring */}
      <OrbitDots radius={66} count={6} duration={4} color="#C9A227" size={4} />

      {/* Orbiting particles — inner ring */}
      <OrbitDots radius={40} count={4} duration={6} color="#E8C547" size={3} />

      {/* Centre KVL TECH logo */}
      <motion.div
        className="relative flex flex-col items-center justify-center rounded-full z-10"
        style={{
          width: 76, height: 76,
          background: "linear-gradient(135deg, #0B1437 0%, #162054 50%, #0B1437 100%)",
          boxShadow: "0 0 0 2px rgba(201,162,39,0.5), 0 0 20px rgba(201,162,39,0.3), 0 8px 32px rgba(11,20,55,0.8)",
        }}
        animate={{ scale: [1, 1.06, 1], boxShadow: [
          "0 0 0 2px rgba(201,162,39,0.4), 0 0 20px rgba(201,162,39,0.2), 0 8px 32px rgba(11,20,55,0.8)",
          "0 0 0 3px rgba(201,162,39,0.7), 0 0 35px rgba(201,162,39,0.5), 0 8px 40px rgba(11,20,55,0.9)",
          "0 0 0 2px rgba(201,162,39,0.4), 0 0 20px rgba(201,162,39,0.2), 0 8px 32px rgba(11,20,55,0.8)",
        ] }}
        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
      >
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800, fontSize: 19, letterSpacing: 2,
          background: "linear-gradient(135deg, #C9A227, #E8C547, #C9A227)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text", lineHeight: 1,
        }}>KVL</span>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600, fontSize: 9, letterSpacing: 3.5,
          color: "rgba(255,255,255,0.85)", textTransform: "uppercase", marginTop: 3,
        }}>TECH</span>
      </motion.div>

    </div>
  )
}

/* ─── Animated loading dots ────────────────────────────────────────────────── */
function LoadingDots() {
  return (
    <div className="flex items-center gap-2 mt-4">
      {[0, 1, 2, 3, 4].map(i => (
        <motion.span
          key={i}
          style={{
            width: i === 2 ? 8 : 5,
            height: i === 2 ? 8 : 5,
            borderRadius: "50%",
            background: i === 2 ? "#C9A227" : "rgba(201,162,39,0.4)",
            display: "block",
          }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7], y: [0, -4, 0] }}
          transition={{
            duration: 1, repeat: Infinity,
            delay: i * 0.15, ease: "easeInOut",
          }}
        />
      ))}
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
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 0,
            background: "var(--color-bg, #fff)",
          }}
        >
          <KvlRing />
          <LoadingDots />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─── Slim top progress bar ────────────────────────────────────────────────── */
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
            position: "fixed", top: 0, left: 0, right: 0, height: 3,
            background: "linear-gradient(90deg, #C9A227, #E8C547, #C9A227)",
            transformOrigin: "left center", zIndex: 99999,
            boxShadow: "0 0 10px rgba(201,162,39,0.8)",
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
