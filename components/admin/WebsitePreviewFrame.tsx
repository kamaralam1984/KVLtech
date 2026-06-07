"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  Globe,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

type Viewport = "mobile" | "tablet" | "desktop"

export interface WebsitePreviewFrameProps {
  htmlContent: string
  onViewportChange?: (viewport: Viewport) => void
}

// ── Viewport config ───────────────────────────────────────────────────────────

const VIEWPORTS: { id: Viewport; label: string; icon: typeof Monitor; width: string }[] = [
  { id: "mobile", label: "Mobile", icon: Smartphone, width: "375px" },
  { id: "tablet", label: "Tablet", icon: Tablet, width: "768px" },
  { id: "desktop", label: "Desktop", icon: Monitor, width: "100%" },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function WebsitePreviewFrame({
  htmlContent,
  onViewportChange,
}: WebsitePreviewFrameProps) {
  const [viewport, setViewport] = useState<Viewport>("desktop")
  const [fullscreen, setFullscreen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleViewport = (v: Viewport) => {
    setViewport(v)
    onViewportChange?.(v)
  }

  const handleReload = () => {
    setReloadKey((k) => k + 1)
    triggerProgress()
  }

  const triggerProgress = useCallback(() => {
    setLoading(true)
    setProgress(0)
    if (progressTimer.current) clearTimeout(progressTimer.current)

    // Animate 0 → 90% quickly, then finish on load
    let p = 0
    const tick = () => {
      p = Math.min(p + Math.random() * 15, 90)
      setProgress(p)
      if (p < 90) {
        progressTimer.current = setTimeout(tick, 120)
      }
    }
    tick()

    // Force finish after 1.2s
    setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 300)
    }, 1200)
  }, [])

  // Trigger progress on content change
  useEffect(() => {
    if (htmlContent) triggerProgress()
  }, [htmlContent, triggerProgress])

  // Escape to exit fullscreen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const openNewTab = () => {
    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank", "noopener,noreferrer")
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  const vp = VIEWPORTS.find((v) => v.id === viewport) ?? VIEWPORTS[2]

  const frameContent = (
    <div className="flex flex-col h-full bg-[var(--color-bg-secondary)]">
      {/* Mock browser chrome */}
      <div className="shrink-0 bg-[var(--color-bg)] border-b border-[var(--color-border)] px-3 py-2">
        {/* Progress bar */}
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 z-50">
            <motion.div
              className="h-full bg-[var(--color-gold)]"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.15 }}
            />
          </div>
        )}

        {/* Browser dots + URL */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>

          <div className="flex-1 flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] min-w-0">
            <Globe size={11} className="text-[var(--color-text-muted)] shrink-0" />
            <span className="text-xs text-[var(--color-text-muted)] truncate">
              kvlbusinesssolutions.com/preview
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            {/* Viewport switcher */}
            {VIEWPORTS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleViewport(id)}
                title={label}
                className={`p-1.5 rounded-lg transition-all ${
                  viewport === id
                    ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                <Icon size={14} />
              </button>
            ))}

            <div className="w-px h-4 bg-[var(--color-border)] mx-1" />

            {/* Reload */}
            <button
              onClick={handleReload}
              title="Reload preview"
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              <RefreshCw size={14} />
            </button>

            {/* Open in new tab */}
            <button
              onClick={openNewTab}
              title="Open in new tab"
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              <ExternalLink size={14} />
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setFullscreen((v) => !v)}
              title={fullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto flex justify-center p-4">
        <motion.div
          animate={{ width: vp.width }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-[var(--color-border)]"
          style={{ minHeight: 600, flexShrink: 0 }}
        >
          <iframe
            key={reloadKey}
            srcDoc={htmlContent}
            title="Website Preview"
            sandbox="allow-scripts allow-same-origin"
            className="w-full"
            style={{ height: 680, border: "none", display: "block" }}
            onLoad={() => {
              setProgress(100)
              setTimeout(() => { setLoading(false); setProgress(0) }, 200)
            }}
          />
        </motion.div>
      </div>
    </div>
  )

  return (
    <>
      {/* Normal view */}
      {!fullscreen && (
        <div className="relative flex-1 flex flex-col overflow-hidden">
          {frameContent}
        </div>
      )}

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            key="fullscreen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex flex-col bg-[var(--color-bg)]"
          >
            {frameContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Placeholder when fullscreen is active (so layout doesn't collapse) */}
      {fullscreen && <div className="flex-1" />}
    </>
  )
}
