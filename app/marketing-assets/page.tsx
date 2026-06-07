"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Download, Loader2, Image, FileText, Video, Layout,
  Maximize2, Star, Tag,
} from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { useRouter } from "next/navigation"

type AssetType = "IMAGE" | "PDF" | "VIDEO" | "TEMPLATE" | "BANNER" | "LOGO"

interface MarketingAsset {
  id: string
  title: string
  description?: string
  fileType: AssetType
  url: string
  thumbnail?: string
  category?: string
  fileSize?: number
  downloads: number
  tags: string[]
  createdAt: string
}

const FILTERS: { value: AssetType | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "IMAGE", label: "Images" },
  { value: "PDF", label: "PDFs" },
  { value: "VIDEO", label: "Videos" },
  { value: "TEMPLATE", label: "Templates" },
  { value: "BANNER", label: "Banners" },
  { value: "LOGO", label: "Logos" },
]

const FILE_TYPE_ICONS: Record<AssetType, typeof Image> = {
  IMAGE: Image,
  PDF: FileText,
  VIDEO: Video,
  TEMPLATE: Layout,
  BANNER: Maximize2,
  LOGO: Star,
}

const FILE_TYPE_COLORS: Record<AssetType, string> = {
  IMAGE: "#0891B2",
  PDF: "#EF4444",
  VIDEO: "#7C3AED",
  TEMPLATE: "#F59E0B",
  BANNER: "#16A34A",
  LOGO: "#C9A227",
}

function formatSize(bytes?: number | null): string {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MarketingAssetsPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [assets, setAssets] = useState<MarketingAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<AssetType | "">("")
  const [downloading, setDownloading] = useState<string | null>(null)

  // Auth check
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (data.user) setAuthed(true)
        else router.replace("/login?next=/marketing-assets")
      })
      .catch(() => router.replace("/login?next=/marketing-assets"))
      .finally(() => setAuthChecked(true))
  }, [router])

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.set("type", typeFilter)
      const res = await fetch(`/api/marketing-assets?${params}`, { credentials: "include" })
      if (res.ok) setAssets(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [typeFilter])

  useEffect(() => {
    if (authed) fetchAssets()
  }, [authed, fetchAssets])

  const handleDownload = async (asset: MarketingAsset) => {
    setDownloading(asset.id)
    try {
      // Increment download count
      await fetch("/api/admin/marketing-assets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: asset.id, incrementDownload: true }),
      })
      // Open download
      window.open(asset.url, "_blank", "noopener,noreferrer")
      // Optimistically update local count
      setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, downloads: a.downloads + 1 } : a))
    } catch { /* ignore */ }
    setDownloading(null)
  }

  if (!authChecked) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-[90vh] flex items-center justify-center bg-[var(--color-bg-secondary)]">
          <Loader2 size={32} className="text-[var(--color-gold)] animate-spin" />
        </main>
        <Footer />
      </>
    )
  }

  if (!authed) return null

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-20 min-h-screen bg-[var(--color-bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 text-[var(--color-gold)] text-xs font-semibold mb-4">
              <Tag size={13} /> Affiliate Resources
            </div>
            <h1 className="font-display font-bold text-3xl text-[var(--color-text)] mb-3">
              Marketing Kit — Promote KVL TECH
            </h1>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto text-sm">
              Download ready-to-use marketing assets to share with your audience and earn commissions on every successful referral.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap justify-center mb-8">
            {FILTERS.map(f => (
              <button key={f.value} onClick={() => setTypeFilter(f.value as AssetType | "")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${typeFilter === f.value ? "bg-[var(--color-navy)] text-white shadow-sm" : "bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]/40"}`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Assets grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={28} className="animate-spin text-[var(--color-gold)]" />
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-20 text-[var(--color-text-muted)]">
              <Tag size={36} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No assets available in this category yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {assets.map((asset, i) => {
                const IconComp = FILE_TYPE_ICONS[asset.fileType] || FileText
                const iconColor = FILE_TYPE_COLORS[asset.fileType] || "#C9A227"
                return (
                  <motion.div key={asset.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] overflow-hidden flex flex-col hover:shadow-[var(--shadow-card)] transition-shadow group">

                    {/* Thumbnail */}
                    <div className="relative h-40 bg-[var(--color-bg-secondary)] flex items-center justify-center overflow-hidden">
                      {asset.fileType === "IMAGE" && (asset.thumbnail || asset.url) ? (
                        <img src={asset.thumbnail || asset.url} alt={asset.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="flex flex-col items-center gap-2" style={{ color: iconColor }}>
                          <IconComp size={40} />
                          <span className="text-xs font-bold tracking-wider" style={{ color: iconColor }}>{asset.fileType}</span>
                        </div>
                      )}
                      <span className="absolute bottom-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: `${iconColor}20`, color: iconColor }}>
                        {asset.fileType}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col gap-2">
                      <p className="text-sm font-semibold text-[var(--color-text)] leading-snug">{asset.title}</p>
                      {asset.description && (
                        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">{asset.description}</p>
                      )}
                      {asset.category && (
                        <span className="text-[11px] text-[var(--color-text-muted)]">{asset.category}</span>
                      )}
                      {asset.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {asset.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-auto pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-1"><Download size={11} /> {asset.downloads} downloads</span>
                        {asset.fileSize && <span>{formatSize(asset.fileSize)}</span>}
                      </div>
                    </div>

                    {/* Download button */}
                    <div className="px-4 pb-4">
                      <button onClick={() => handleDownload(asset)} disabled={downloading === asset.id}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/20 hover:bg-[var(--color-gold)] hover:text-white transition-all disabled:opacity-60">
                        {downloading === asset.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        {downloading === asset.id ? "Opening..." : "Download"}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
