"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, Search, RefreshCw, Loader2, X, Trash2, Edit2,
  Copy, Check, Eye, EyeOff, Download, Image, FileText,
  Video, Layout, Maximize2, Star, Tag,
} from "lucide-react"
import { AdminTopbar } from "@/components/admin/AdminSidebar"

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
  isPublic: boolean
  tags: string[]
  createdAt: string
}

const ASSET_TYPES: { value: AssetType | ""; label: string }[] = [
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

const INPUT = "w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all placeholder:text-[var(--color-text-muted)]"
const LABEL = "block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5"

const EMPTY_FORM = {
  title: "",
  description: "",
  fileType: "IMAGE" as AssetType,
  url: "",
  thumbnail: "",
  category: "",
  tags: "",
  isPublic: true,
  fileSize: "",
}

export default function MarketingAssetsPage() {
  const [assets, setAssets] = useState<MarketingAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<AssetType | "">("")
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editAsset, setEditAsset] = useState<MarketingAsset | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [copied, setCopied] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.set("type", typeFilter)
      if (search) params.set("q", search)
      const res = await fetch(`/api/admin/marketing-assets?${params}`, { credentials: "include" })
      if (res.ok) setAssets(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [typeFilter, search])

  useEffect(() => { fetchAssets() }, [fetchAssets])

  const openCreate = () => {
    setEditAsset(null)
    setForm(EMPTY_FORM)
    setFormError("")
    setShowModal(true)
  }

  const openEdit = (asset: MarketingAsset) => {
    setEditAsset(asset)
    setForm({
      title: asset.title,
      description: asset.description || "",
      fileType: asset.fileType,
      url: asset.url,
      thumbnail: asset.thumbnail || "",
      category: asset.category || "",
      tags: asset.tags.join(", "),
      isPublic: asset.isPublic,
      fileSize: asset.fileSize ? String(asset.fileSize) : "",
    })
    setFormError("")
    setShowModal(true)
  }

  const saveAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    if (!form.title || !form.url) { setFormError("Title and URL are required"); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        fileSize: form.fileSize ? parseInt(form.fileSize) : null,
      }

      let res: Response
      if (editAsset) {
        res = await fetch("/api/admin/marketing-assets", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id: editAsset.id, ...payload }),
        })
      } else {
        res = await fetch("/api/admin/marketing-assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (!res.ok) { setFormError(data.error || "Failed to save"); setSaving(false); return }
      setShowModal(false)
      await fetchAssets()
    } catch { setFormError("Server error") }
    setSaving(false)
  }

  const deleteAsset = async (id: string) => {
    if (!confirm("Delete this asset?")) return
    setDeleting(id)
    try {
      await fetch(`/api/admin/marketing-assets?id=${id}`, { method: "DELETE", credentials: "include" })
      await fetchAssets()
    } catch { /* ignore */ }
    setDeleting(null)
  }

  const togglePublic = async (asset: MarketingAsset) => {
    setToggling(asset.id)
    try {
      await fetch("/api/admin/marketing-assets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: asset.id, isPublic: !asset.isPublic }),
      })
      await fetchAssets()
    } catch { /* ignore */ }
    setToggling(null)
  }

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <>
      <AdminTopbar title="Marketing Assets Library" />
      <div className="p-6 space-y-5 max-w-[1400px]">

        {/* Top bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all placeholder:text-[var(--color-text-muted)]"
            />
          </div>
          <button onClick={fetchAssets}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={openCreate}
            className="btn-gold flex items-center gap-2">
            <Plus size={15} /> Upload Asset
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {ASSET_TYPES.map(t => (
            <button key={t.value} onClick={() => setTypeFilter(t.value as AssetType | "")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${typeFilter === t.value ? "bg-[var(--color-navy)] text-white" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Asset grid */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-[var(--color-gold)]" /></div>
        ) : assets.length === 0 ? (
          <div className="card p-16 text-center text-[var(--color-text-muted)]">
            <Tag size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No assets found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {assets.map((asset, i) => {
              const IconComp = FILE_TYPE_ICONS[asset.fileType] || FileText
              const iconColor = FILE_TYPE_COLORS[asset.fileType] || "#C9A227"
              return (
                <motion.div key={asset.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="card overflow-hidden flex flex-col group">
                  {/* Thumbnail */}
                  <div className="relative h-36 bg-[var(--color-bg-secondary)] flex items-center justify-center border-b border-[var(--color-border)] overflow-hidden">
                    {asset.thumbnail && asset.fileType === "IMAGE" ? (
                      <img src={asset.thumbnail} alt={asset.title} className="w-full h-full object-cover" />
                    ) : asset.fileType === "IMAGE" && !asset.thumbnail ? (
                      <img src={asset.url} alt={asset.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                    ) : (
                      <div className="flex flex-col items-center gap-2" style={{ color: iconColor }}>
                        <IconComp size={36} />
                        <span className="text-xs font-semibold" style={{ color: iconColor }}>{asset.fileType}</span>
                      </div>
                    )}
                    {/* Public badge */}
                    <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${asset.isPublic ? "bg-green-500/15 text-green-500 border border-green-500/20" : "bg-[var(--color-border)] text-[var(--color-text-muted)]"}`}>
                      {asset.isPublic ? "Public" : "Private"}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--color-text)] leading-snug line-clamp-2">{asset.title}</p>
                      <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{ color: iconColor, background: `${iconColor}15`, borderColor: `${iconColor}30` }}>
                        {asset.fileType}
                      </span>
                    </div>
                    {asset.category && (
                      <p className="text-[11px] text-[var(--color-text-muted)]">{asset.category}</p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)] mt-auto pt-2 border-t border-[var(--color-border)]">
                      <span className="flex items-center gap-1"><Download size={11} /> {asset.downloads}</span>
                      {asset.fileSize && <span>{formatSize(asset.fileSize)}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 flex items-center gap-2">
                    <button onClick={() => openEdit(asset)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all">
                      <Edit2 size={11} /> Edit
                    </button>
                    <button onClick={() => copyUrl(asset.id, asset.url)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all">
                      {copied === asset.id ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                      URL
                    </button>
                    <button onClick={() => togglePublic(asset)} disabled={toggling === asset.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all disabled:opacity-50">
                      {toggling === asset.id ? <Loader2 size={11} className="animate-spin" /> : asset.isPublic ? <EyeOff size={11} /> : <Eye size={11} />}
                    </button>
                    <button onClick={() => deleteAsset(asset.id)} disabled={deleting === asset.id}
                      className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50">
                      {deleting === asset.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Upload/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }}
              className="bg-[var(--color-bg)] rounded-2xl w-full max-w-xl shadow-[var(--shadow-luxury)] overflow-hidden max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                <h3 className="font-display font-bold text-lg text-[var(--color-text)]">
                  {editAsset ? "Edit Asset" : "Upload Asset"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={saveAsset} className="overflow-y-auto p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={LABEL}>Title *</label>
                    <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Asset title" className={INPUT} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={LABEL}>Description</label>
                    <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="What is this asset for?" className={INPUT + " resize-none"} />
                  </div>
                  <div>
                    <label className={LABEL}>File Type *</label>
                    <select value={form.fileType} onChange={e => setForm(f => ({ ...f, fileType: e.target.value as AssetType }))} className={INPUT}>
                      {(["IMAGE", "PDF", "VIDEO", "TEMPLATE", "BANNER", "LOGO"] as AssetType[]).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Category</label>
                    <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      placeholder="e.g. Social Media" className={INPUT} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={LABEL}>Asset URL *</label>
                    <input required value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                      placeholder="https://... or /uploads/..." className={INPUT} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={LABEL}>Thumbnail URL</label>
                    <input value={form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))}
                      placeholder="Preview image URL (for non-image assets)" className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>File Size (bytes)</label>
                    <input type="number" min="0" value={form.fileSize} onChange={e => setForm(f => ({ ...f, fileSize: e.target.value }))}
                      placeholder="e.g. 204800" className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Tags (comma-separated)</label>
                    <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                      placeholder="logo, brand, white" className={INPUT} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isPublic} onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))}
                        className="w-4 h-4 rounded accent-[var(--color-gold)]" />
                      <span className="text-sm font-medium text-[var(--color-text)]">Make this asset public (visible to affiliates/clients)</span>
                    </label>
                  </div>
                </div>

                {formError && (
                  <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{formError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                    {saving ? "Saving..." : editAsset ? "Save Changes" : "Create Asset"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
