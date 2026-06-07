"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  Sparkles, Loader2, Copy, Check, Download,
  Globe, Code2, Eye, Braces, Save, Share2, ExternalLink, Plus,
  LayoutTemplate, Rocket, ChevronDown, ChevronUp, Clock, RefreshCw,
} from "lucide-react"
import { AdminTopbar } from "@/components/admin/AdminSidebar"
import type { GeneratedWebsite, WebsiteSection } from "@/lib/website-builder"
import { INDUSTRY_TEMPLATES, INDUSTRY_LIST } from "@/lib/website-templates"
import { WebsiteBuilderEditor } from "@/components/admin/WebsiteBuilderEditor"
import { WebsitePreviewFrame } from "@/components/admin/WebsitePreviewFrame"
import { Confetti } from "@/components/ui/Confetti"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useToast() {
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const show = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }
  return { toast, show }
}

function useCopy() {
  const [copied, setCopied] = useState(false)
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return { copied, copy }
}

const SECTION_TYPES: WebsiteSection["type"][] = [
  "hero", "about", "services", "portfolio", "testimonials", "pricing", "faq", "contact", "cta",
]

const STYLE_OPTIONS = [
  { value: "modern", label: "Modern", desc: "Clean & bold" },
  { value: "classic", label: "Classic", desc: "Timeless elegance" },
  { value: "minimal", label: "Minimal", desc: "Less is more" },
  { value: "corporate", label: "Corporate", desc: "Professional trust" },
] as const

const QUICK_PROMPTS = [
  { label: "Restaurant in Jaipur", prompt: "A traditional Rajasthani thali restaurant in Jaipur serving authentic Rajasthani cuisine with a royal ambience, catering services, and home delivery" },
  { label: "CA Firm in Mumbai", prompt: "A CA firm in Mumbai providing GST filing, income tax returns, company registration, startup advisory, and audit services for SMEs and startups" },
  { label: "Tech Startup in Bangalore", prompt: "A SaaS startup in Bangalore building AI-powered tools for small businesses including automated invoicing, CRM, and inventory management solutions" },
]

const EXAMPLE_PLACEHOLDERS = [
  "A restaurant in Delhi serving North Indian cuisine, perfect for family dining and corporate events...",
  "A CA firm in Mumbai offering GST filing, income tax, and startup registration...",
  "A yoga and wellness center in Pune with certified instructors, online and offline classes...",
  "A fashion boutique in Jaipur specializing in bridal wear and ethnic collections...",
]

const LS_DRAFT_KEY = "kvl_website_builder_draft"

interface DraftData {
  website: GeneratedWebsite
  htmlPreview: string
  savedAt: string
}

interface SavedSite {
  fileName: string
  businessName: string
  industry: string
  tagline: string
  jsonUrl: string
  htmlUrl: string
  previewUrl: string
  savedAt: string
  size: number
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WebsiteBuilderPage() {
  const { toast, show } = useToast()
  const jsonCopy = useCopy()
  const htmlCopy = useCopy()
  const deployUrlCopy = useCopy()

  // Form state
  const [prompt, setPrompt] = useState("")
  const [industry, setIndustry] = useState("")
  const [style, setStyle] = useState<"modern" | "classic" | "minimal" | "corporate">("modern")
  const [language, setLanguage] = useState<"english" | "hindi" | "both">("english")
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    new Set(["hero", "about", "services", "pricing", "testimonials", "faq", "contact"])
  )

  // Generation state
  const [loading, setLoading] = useState(false)
  const [website, setWebsite] = useState<GeneratedWebsite | null>(null)
  const [htmlPreview, setHtmlPreview] = useState<string>("")
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null)

  // UI state
  const [activeTab, setActiveTab] = useState<"preview" | "json" | "html">("preview")
  const [saving, setSaving] = useState(false)
  const [savedUrl, setSavedUrl] = useState<string>("")
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [unsaved, setUnsaved] = useState(false)

  // Deploy state
  const [deploying, setDeploying] = useState(false)
  const [deployResult, setDeployResult] = useState<{ deployUrl: string; downloadUrl: string } | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  // Saved sites panel
  const [showSavedSites, setShowSavedSites] = useState(false)
  const [savedSites, setSavedSites] = useState<SavedSite[]>([])
  const [loadingSites, setLoadingSites] = useState(false)

  // Draft state
  const [hasDraft, setHasDraft] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Rotate placeholder
  useEffect(() => {
    const id = setInterval(() => setPlaceholderIdx(i => (i + 1) % EXAMPLE_PLACEHOLDERS.length), 4000)
    return () => clearInterval(id)
  }, [])

  // Check for draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_DRAFT_KEY)
      if (raw) setHasDraft(true)
    } catch {}
  }, [])

  // Auto-save to localStorage every 30s when there's a website
  useEffect(() => {
    if (!website) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      try {
        const draft: DraftData = { website, htmlPreview, savedAt: new Date().toISOString() }
        localStorage.setItem(LS_DRAFT_KEY, JSON.stringify(draft))
      } catch {}
    }, 30_000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [website, htmlPreview])

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(LS_DRAFT_KEY)
      if (!raw) return
      const draft: DraftData = JSON.parse(raw)
      setWebsite(draft.website)
      setHtmlPreview(draft.htmlPreview)
      setActiveTab("preview")
      setHasDraft(false)
      show("Draft restored!")
    } catch {
      show("Failed to restore draft", false)
    }
  }

  const clearDraft = () => {
    try { localStorage.removeItem(LS_DRAFT_KEY) } catch {}
    setHasDraft(false)
  }

  const toggleSection = (s: string) => {
    setSelectedSections(prev => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })
  }

  const applyTemplate = (key: string) => {
    const tpl = INDUSTRY_TEMPLATES[key]
    if (!tpl) return
    setIndustry(key)
    setStyle(tpl.style)
    setPrompt(tpl.samplePrompt)
    setSelectedSections(new Set(tpl.sections))
  }

  const refreshHtml = useCallback(async (updated: GeneratedWebsite) => {
    try {
      const res = await fetch("/api/admin/website-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export", website: updated }),
        credentials: "include",
      })
      const text = await res.text()
      if (text.startsWith("<!DOCTYPE")) setHtmlPreview(text)
    } catch {}
  }, [])

  const handleWebsiteChange = useCallback((updated: GeneratedWebsite) => {
    setWebsite(updated)
    setUnsaved(true)
    refreshHtml(updated)
  }, [refreshHtml])

  const handleRegenerateSection = useCallback(async (sectionType: string) => {
    if (!website) return
    setRegeneratingSection(sectionType)
    try {
      const res = await fetch("/api/admin/website-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "regenerate-section",
          sectionType,
          businessName: website.businessName,
          industry: website.industry,
        }),
        credentials: "include",
      })
      const data = await res.json()
      if (data.section) {
        const updatedSections = website.sections.map(s =>
          s.type === sectionType ? data.section : s
        )
        handleWebsiteChange({ ...website, sections: updatedSections })
        show(`${sectionType} section regenerated!`)
      }
    } catch {
      show("Regeneration failed", false)
    } finally {
      setRegeneratingSection(null)
    }
  }, [website, handleWebsiteChange, show])

  const generate = useCallback(async () => {
    if (!prompt.trim()) { show("Please describe the business first.", false); return }
    setLoading(true)
    setSavedUrl("")
    setDeployResult(null)

    try {
      const res = await fetch("/api/admin/website-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, industry, style, language }),
        credentials: "include",
      })

      const data = await res.json()

      if (!res.ok) {
        show(data.error || "Generation failed", false)
        return
      }

      setWebsite(data.website)
      setHtmlPreview(data.htmlPreview)
      setActiveTab("preview")
      setUnsaved(true)
      setHasDraft(false)
      show("Website generated successfully!")
    } catch {
      show("Network error. Please try again.", false)
    } finally {
      setLoading(false)
    }
  }, [prompt, industry, style, language, show])

  const downloadHTML = () => {
    if (!htmlPreview || !website) return
    const blob = new Blob([htmlPreview], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${website.businessName.replace(/\s+/g, "-").toLowerCase()}-website.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const saveWebsite = async () => {
    if (!website) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/website-builder/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website }),
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok) {
        setSavedUrl(data.previewUrl)
        setUnsaved(false)
        show("Saved! Preview link ready.")
        // Save draft timestamp
        try {
          const draft: DraftData = { website, htmlPreview, savedAt: new Date().toISOString() }
          localStorage.setItem(LS_DRAFT_KEY, JSON.stringify(draft))
        } catch {}
      } else {
        show(data.error || "Save failed", false)
      }
    } catch {
      show("Save failed", false)
    } finally {
      setSaving(false)
    }
  }

  const deployPreview = async () => {
    if (!website) return
    setDeploying(true)
    try {
      const res = await fetch("/api/admin/website-builder/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website }),
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok) {
        setDeployResult({ deployUrl: data.deployUrl, downloadUrl: data.downloadUrl })
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 4000)
        show("Preview deployed!")
      } else {
        show(data.error || "Deploy failed", false)
      }
    } catch {
      show("Deploy failed", false)
    } finally {
      setDeploying(false)
    }
  }

  const copyShareLink = () => {
    if (!savedUrl) { show("Save the website first to get a share link.", false); return }
    const full = `${window.location.origin}${savedUrl}`
    navigator.clipboard.writeText(full)
    show("Share link copied!")
  }

  const loadSavedSites = async () => {
    setLoadingSites(true)
    try {
      const res = await fetch("/api/admin/website-builder/save", { credentials: "include" })
      const data = await res.json()
      if (res.ok) setSavedSites(data.sites || [])
    } catch {}
    setLoadingSites(false)
  }

  const loadSite = async (jsonUrl: string) => {
    try {
      const res = await fetch(jsonUrl)
      const w: GeneratedWebsite = await res.json()
      setWebsite(w)
      setUnsaved(false)
      await refreshHtml(w)
      setActiveTab("preview")
      show(`Loaded: ${w.businessName}`)
    } catch {
      show("Failed to load site", false)
    }
  }

  const toggleSavedSites = () => {
    if (!showSavedSites) loadSavedSites()
    setShowSavedSites(v => !v)
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-[var(--color-bg)]">
      <AdminTopbar title="AI Website Builder" />

      {/* Confetti */}
      {showConfetti && <Confetti trigger={showConfetti} />}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT PANEL ────────────────────────────────────────────────────── */}
        <div className="w-[400px] shrink-0 border-r border-[var(--color-border)] flex flex-col overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[var(--color-gold)]/10">
                <Sparkles size={20} className="text-[var(--color-gold)]" />
              </div>
              <div>
                <h1 className="font-bold text-base text-[var(--color-text)]">AI Website Builder</h1>
                <p className="text-xs text-[var(--color-text-muted)]">Generate complete websites from a description</p>
              </div>
            </div>

            {/* Draft restore banner */}
            {hasDraft && !website && (
              <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-yellow-300 bg-yellow-50">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-yellow-600 shrink-0" />
                  <p className="text-xs font-medium text-yellow-800">You have an unsaved draft</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={restoreDraft} className="text-xs font-semibold text-yellow-700 hover:text-yellow-900 transition-colors">Restore</button>
                  <span className="text-yellow-400">·</span>
                  <button onClick={clearDraft} className="text-xs text-yellow-500 hover:text-yellow-700 transition-colors">Dismiss</button>
                </div>
              </div>
            )}

            {/* Autosave indicator */}
            {website && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${unsaved ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`} />
                <span className="text-xs text-[var(--color-text-muted)]">
                  {unsaved ? "Unsaved changes" : "All saved"}
                </span>
              </div>
            )}

            {/* Prompt */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5 uppercase tracking-wide">
                Business Description
              </label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value.slice(0, 500))}
                  placeholder={EXAMPLE_PLACEHOLDERS[placeholderIdx]}
                  rows={5}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all placeholder:text-[var(--color-text-muted)] resize-none"
                />
                <span className="absolute bottom-2 right-3 text-[10px] text-[var(--color-text-muted)]">{prompt.length}/500</span>
              </div>
            </div>

            {/* Quick start chips */}
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2 uppercase tracking-wide">Quick Start</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map(q => (
                  <button
                    key={q.label}
                    onClick={() => setPrompt(q.prompt)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
                  >
                    <Plus size={10} /> {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Industry Templates */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5 uppercase tracking-wide">
                Industry
              </label>
              <select
                value={industry}
                onChange={e => {
                  setIndustry(e.target.value)
                  if (e.target.value) applyTemplate(e.target.value)
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all"
              >
                <option value="">Select industry (optional)</option>
                {INDUSTRY_LIST.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Style Selector */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5 uppercase tracking-wide">
                Visual Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setStyle(opt.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${style === opt.value ? "border-[var(--color-gold)] bg-[var(--color-gold)]/5" : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-gold)]/50"}`}
                  >
                    <p className="text-sm font-semibold text-[var(--color-text)]">{opt.label}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5 uppercase tracking-wide">
                Content Language
              </label>
              <div className="flex gap-2">
                {(["english", "hindi", "both"] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition-all ${language === lang ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]" : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)]/50"}`}
                  >
                    {lang === "both" ? "Both" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5 uppercase tracking-wide">
                Sections to Include
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SECTION_TYPES.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSection(s)}
                    className={`py-2 px-1 rounded-xl border text-xs font-medium capitalize transition-all ${selectedSections.has(s) ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]" : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)]/40"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generate}
              disabled={loading || !prompt.trim()}
              className="w-full py-3 rounded-xl bg-[var(--color-gold)] text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Generating Website...</>
              ) : (
                <><Sparkles size={16} /> Generate Website</>
              )}
            </button>

            {/* Industry Template Cards (only when no website) */}
            {!website && (
              <div>
                <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-3 uppercase tracking-wide flex items-center gap-1">
                  <LayoutTemplate size={12} /> Industry Templates
                </p>
                <div className="space-y-2">
                  {Object.entries(INDUSTRY_TEMPLATES).slice(0, 5).map(([key, tpl]) => (
                    <button
                      key={key}
                      onClick={() => applyTemplate(key)}
                      className="w-full text-left px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-gold)] transition-all group"
                    >
                      <p className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-gold)] transition-colors">{tpl.label}</p>
                      <p className="text-xs text-[var(--color-text-muted)] line-clamp-1 mt-0.5">{tpl.samplePrompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section Editor (shown after generation) */}
          {website && (
            <div className="border-t border-[var(--color-border)] p-5 flex-1 flex flex-col min-h-0">
              <WebsiteBuilderEditor
                website={website}
                onChange={handleWebsiteChange}
                onRegenerateSection={handleRegenerateSection}
                regeneratingSection={regeneratingSection}
              />
            </div>
          )}

          {/* Saved Sites Panel */}
          <div className="border-t border-[var(--color-border)]">
            <button
              onClick={toggleSavedSites}
              className="w-full flex items-center justify-between px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              <span className="flex items-center gap-2"><Save size={12} /> Saved Sites</span>
              {showSavedSites ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {showSavedSites && (
              <div className="px-5 pb-5 space-y-2">
                {loadingSites && (
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] py-2">
                    <Loader2 size={12} className="animate-spin" /> Loading...
                  </div>
                )}
                {!loadingSites && savedSites.length === 0 && (
                  <p className="text-xs text-[var(--color-text-muted)] py-2">No saved sites yet.</p>
                )}
                {savedSites.map(site => (
                  <div
                    key={site.fileName}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--color-text)] truncate">{site.businessName}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        {new Date(site.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => loadSite(site.jsonUrl)}
                        className="px-2 py-1 text-[10px] font-semibold bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-lg hover:bg-[var(--color-gold)]/20 transition-colors"
                      >
                        Load
                      </button>
                      <a
                        href={site.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
                <button
                  onClick={loadSavedSites}
                  className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  <RefreshCw size={11} /> Refresh
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!website ? (
            // Empty state
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-4">
                  <Globe size={28} className="text-[var(--color-gold)]" />
                </div>
                <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Build a Website with AI</h2>
                <p className="text-sm text-[var(--color-text-muted)] mb-6">
                  Describe any business on the left panel and click Generate. The AI will create a complete website with content, sections, SEO, and a downloadable HTML file — in seconds.
                </p>
                <div className="space-y-2">
                  {QUICK_PROMPTS.map(q => (
                    <button
                      key={q.label}
                      onClick={() => setPrompt(q.prompt)}
                      className="w-full px-4 py-2.5 text-left rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm hover:border-[var(--color-gold)] transition-all"
                    >
                      <span className="font-medium text-[var(--color-text)]">{q.label}</span>
                      <p className="text-xs text-[var(--color-text-muted)] line-clamp-1 mt-0.5">{q.prompt.slice(0, 70)}...</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Tab bar */}
              <div className="border-b border-[var(--color-border)] px-4 py-2 flex items-center justify-between shrink-0 bg-[var(--color-bg-secondary)]">
                <div className="flex gap-1">
                  {([
                    { id: "preview", label: "Preview", icon: Eye },
                    { id: "json", label: "JSON", icon: Braces },
                    { id: "html", label: "HTML Code", icon: Code2 },
                  ] as const).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-[var(--color-gold)] text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}
                    >
                      <tab.icon size={13} /> {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deploy result banner */}
              {deployResult && (
                <div className="shrink-0 px-4 py-2.5 bg-green-50 border-b border-green-200 flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-semibold text-green-800">Preview live at:</span>
                    <a
                      href={deployResult.deployUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-700 hover:text-green-900 underline truncate"
                    >
                      {window.location.origin}{deployResult.deployUrl}
                    </a>
                  </div>
                  <button
                    onClick={() => deployUrlCopy.copy(`${window.location.origin}${deployResult.deployUrl}`)}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors shrink-0"
                  >
                    {deployUrlCopy.copied ? <Check size={11} /> : <Copy size={11} />}
                    {deployUrlCopy.copied ? "Copied!" : "Copy"}
                  </button>
                  <a
                    href={deployResult.deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shrink-0"
                  >
                    <ExternalLink size={11} /> Open
                  </a>
                </div>
              )}

              {/* Tab content */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {activeTab === "preview" && (
                  <WebsitePreviewFrame htmlContent={htmlPreview} />
                )}

                {activeTab === "json" && (
                  <div className="p-4 flex-1 overflow-auto">
                    <div className="relative h-full">
                      <div className="absolute top-3 right-3 z-10">
                        <button
                          onClick={() => jsonCopy.copy(JSON.stringify(website, null, 2))}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs font-medium hover:border-[var(--color-gold)] transition-all"
                        >
                          {jsonCopy.copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                          {jsonCopy.copied ? "Copied!" : "Copy JSON"}
                        </button>
                      </div>
                      <pre className="bg-[var(--color-bg)] rounded-xl p-4 text-xs overflow-auto h-full border border-[var(--color-border)] text-[var(--color-text)] leading-relaxed pt-12">
                        {JSON.stringify(website, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {activeTab === "html" && (
                  <div className="p-4 flex-1 overflow-auto">
                    <div className="relative h-full">
                      <div className="absolute top-3 right-3 z-10 flex gap-2">
                        <button
                          onClick={() => htmlCopy.copy(htmlPreview)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs font-medium hover:border-[var(--color-gold)] transition-all"
                        >
                          {htmlCopy.copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                          {htmlCopy.copied ? "Copied!" : "Copy HTML"}
                        </button>
                        <button
                          onClick={downloadHTML}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-gold)] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                        >
                          <Download size={12} /> Download HTML
                        </button>
                      </div>
                      <pre className="bg-[var(--color-bg)] rounded-xl p-4 text-xs overflow-auto h-full border border-[var(--color-border)] text-[var(--color-text)] leading-relaxed pt-12 font-mono">
                        {htmlPreview}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom action bar */}
              <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-3 flex items-center gap-3 shrink-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--color-text)] truncate">{website.businessName}</p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{website.tagline}</p>
                </div>

                {savedUrl && (
                  <a
                    href={savedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-green-300 bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-all"
                  >
                    <ExternalLink size={12} /> View Live
                  </a>
                )}

                <button
                  onClick={copyShareLink}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
                >
                  <Share2 size={14} /> Share
                </button>

                <button
                  onClick={downloadHTML}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
                >
                  <Download size={14} /> Download
                </button>

                {/* Deploy Preview button */}
                <button
                  onClick={deployPreview}
                  disabled={deploying}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)] text-[var(--color-gold)] text-sm font-semibold hover:bg-[var(--color-gold)]/20 disabled:opacity-50 transition-all"
                >
                  {deploying ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                  Deploy Preview
                </button>

                <button
                  onClick={saveWebsite}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-gold)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Template
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
