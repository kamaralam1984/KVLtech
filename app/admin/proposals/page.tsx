"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import {
  Loader2, Zap, Copy, Download, Mail, RefreshCw, FileText, Clock,
  Mic, Play, Pause, Square, ChevronRight, ChevronLeft, Maximize2,
  X, Volume2, AlignLeft,
} from "lucide-react"
import { AdminTopbar } from "@/components/admin/AdminSidebar"

const BUSINESS_TYPES = [
  "Restaurant", "School", "Hospital", "Hotel", "Real Estate",
  "E-commerce", "Gym", "Retail", "Other",
]
const SERVICES = ["Website", "Software", "Mobile App", "SaaS", "Custom"]
const PLANS = ["Basic", "Premium", "Custom"]
const BUDGETS = ["₹10K-25K", "₹25K-50K", "₹50K-1L", "₹1L+"]
const TONES = ["Professional", "Friendly", "Formal"]
const NARRATION_DURATIONS = [
  { value: "short", label: "Short", sub: "~2 min" },
  { value: "medium", label: "Medium", sub: "~5 min" },
  { value: "long", label: "Long", sub: "~10 min" },
]
const NARRATION_TONES = [
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
  { value: "enthusiastic", label: "Enthusiastic" },
]

interface RecentProposal {
  id: string
  details: string | null
  createdAt: string
}

interface NarrationSection {
  title: string
  text: string
  estimatedSeconds: number
}

interface NarrationData {
  script: string
  sections: NarrationSection[]
  totalDurationMinutes: number
}

// ─── Voice Narration Panel ───────────────────────────────────────────────────

interface NarrationPanelProps {
  proposal: string
  clientName: string
  onClose: () => void
}

function NarrationPanel({ proposal, clientName, onClose }: NarrationPanelProps) {
  const [duration, setDuration] = useState<"short" | "medium" | "long">("medium")
  const [tone, setTone] = useState("friendly")
  const [loading, setLoading] = useState(false)
  const [narration, setNarration] = useState<NarrationData | null>(null)
  const [activeSection, setActiveSection] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [presentationMode, setPresentationMode] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const generate = useCallback(async () => {
    setLoading(true)
    setNarration(null)
    setActiveSection(0)
    try {
      const res = await fetch("/api/admin/proposals/narrate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: "inline",
          duration,
          tone,
          clientName,
          // Pass inline content via a separate field the API falls back to
          proposalContent: proposal,
        }),
      })
      const data = await res.json()
      if (res.ok && data.script) {
        setNarration(data)
      }
    } catch {}
    setLoading(false)
  }, [duration, tone, clientName, proposal])

  // Auto-generate on mount
  useEffect(() => {
    generate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stopSpeech = () => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel()
    }
    setPlaying(false)
  }

  const playSectionText = (text: string) => {
    if (typeof window === "undefined") return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.0
    const voices = window.speechSynthesis.getVoices()
    const enIN = voices.find((v) => v.lang === "en-IN")
    const enUS = voices.find((v) => v.lang.startsWith("en"))
    utterance.voice = enIN || enUS || null
    utterance.onend = () => setPlaying(false)
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setPlaying(true)
  }

  const playPause = () => {
    if (typeof window === "undefined") return
    if (playing) {
      window.speechSynthesis.pause()
      setPlaying(false)
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setPlaying(true)
    } else {
      const textToPlay = narration?.sections[activeSection]?.text || narration?.script || ""
      playSectionText(textToPlay)
    }
  }

  const playFull = () => {
    if (!narration) return
    playSectionText(narration.script)
  }

  const downloadScript = () => {
    if (!narration) return
    const blob = new Blob([narration.script], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `narration-${clientName.replace(/\s+/g, "-").toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyScript = () => {
    if (!narration) return
    navigator.clipboard.writeText(narration.script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const goSection = (delta: number) => {
    if (!narration) return
    stopSpeech()
    setActiveSection((prev) => Math.max(0, Math.min(narration.sections.length - 1, prev + delta)))
  }

  // Keyboard navigation in presentation mode
  useEffect(() => {
    if (!presentationMode) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goSection(1)
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goSection(-1)
      if (e.key === "Escape") setPresentationMode(false)
      if (e.key === " ") { e.preventDefault(); playPause() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [presentationMode, playing, narration, activeSection]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => () => stopSpeech(), [])

  // ── Presentation Mode ──────────────────────────────────────────────────────
  if (presentationMode && narration) {
    const sec = narration.sections[activeSection]
    return (
      <div className="fixed inset-0 z-[100] bg-[#0A1628] flex flex-col items-center justify-center p-8">
        <button
          onClick={() => { setPresentationMode(false); stopSpeech() }}
          className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X size={18} className="text-white" />
        </button>

        <div className="max-w-3xl w-full text-center">
          <p className="text-sm font-semibold text-[#C9A227] mb-3 uppercase tracking-widest">
            {activeSection + 1} / {narration.sections.length}
          </p>
          <h2 className="text-3xl font-bold text-white mb-8">{sec?.title}</h2>
          <p className="text-xl text-white/80 leading-relaxed">{sec?.text}</p>

          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              onClick={() => goSection(-1)}
              disabled={activeSection === 0}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={22} className="text-white" />
            </button>
            <button
              onClick={playPause}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: "#C9A227" }}
            >
              {playing ? <Pause size={26} className="text-white" /> : <Play size={26} className="text-white" />}
            </button>
            <button
              onClick={() => goSection(1)}
              disabled={activeSection === narration.sections.length - 1}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={22} className="text-white" />
            </button>
          </div>
          <p className="text-white/30 text-sm mt-4">← → arrow keys to navigate · Space to play/pause · Esc to exit</p>
        </div>
      </div>
    )
  }

  // ── Normal Narration Panel ──────────────────────────────────────────────────
  return (
    <div className="card p-5 mt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)]/15 flex items-center justify-center">
            <Mic size={16} className="text-[var(--color-gold)]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-[var(--color-text)]">Voice Narration</h3>
            {narration && (
              <p className="text-[10px] text-[var(--color-text-muted)]">
                ~{narration.totalDurationMinutes} min · {narration.sections.length} sections
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-colors"
        >
          <X size={14} className="text-[var(--color-text-muted)]" />
        </button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">Duration</label>
          <div className="flex gap-1.5">
            {NARRATION_DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value as "short" | "medium" | "long")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  duration === d.value
                    ? "bg-[var(--color-gold)] text-white border-[var(--color-gold)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)]/50"
                }`}
              >
                <div>{d.label}</div>
                <div className="text-[9px] opacity-70">{d.sub}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">Tone</label>
          <div className="flex gap-1.5">
            {NARRATION_TONES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  tone === t.value
                    ? "bg-[var(--color-gold)] text-white border-[var(--color-gold)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)]/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all disabled:opacity-60"
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
        {loading ? "Generating narration..." : "Regenerate"}
      </button>

      {loading && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Loader2 size={24} className="animate-spin text-[var(--color-gold)]" />
          <p className="text-xs text-[var(--color-text-muted)]">Creating voice script with AI...</p>
        </div>
      )}

      {!loading && narration && (
        <>
          {/* Playback Controls */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <button
              onClick={playFull}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
              style={{ backgroundColor: "#C9A227" }}
            >
              <Volume2 size={12} /> Full Script
            </button>
            <button
              onClick={playPause}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
            >
              {playing ? <Pause size={12} /> : <Play size={12} />}
              {playing ? "Pause" : "Play Section"}
            </button>
            <button
              onClick={stopSpeech}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-red-400 hover:text-red-400 transition-all"
            >
              <Square size={12} /> Stop
            </button>
            <div className="flex-1" />
            <button
              onClick={copyScript}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
            >
              <Copy size={12} /> {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={downloadScript}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
            >
              <Download size={12} /> .txt
            </button>
            <button
              onClick={() => setPresentationMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
            >
              <Maximize2 size={12} /> Present
            </button>
          </div>

          {/* Section navigation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-1">
              <span className="font-semibold uppercase tracking-wide">Sections</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goSection(-1)}
                  disabled={activeSection === 0}
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-[var(--color-bg-secondary)] disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={13} />
                </button>
                <span>{activeSection + 1}/{narration.sections.length}</span>
                <button
                  onClick={() => goSection(1)}
                  disabled={activeSection === narration.sections.length - 1}
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-[var(--color-bg-secondary)] disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {narration.sections.map((sec, i) => (
              <button
                key={i}
                onClick={() => { setActiveSection(i); stopSpeech() }}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  i === activeSection
                    ? "border-[var(--color-gold)] bg-[var(--color-gold)]/5"
                    : "border-[var(--color-border)] hover:border-[var(--color-gold)]/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[var(--color-text)]">{sec.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]">
                    ~{sec.estimatedSeconds}s
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                  {sec.text}
                </p>
              </button>
            ))}
          </div>

          {/* Full script toggle */}
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors list-none">
              <AlignLeft size={13} /> View full script
            </summary>
            <div className="mt-2 p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
              {narration.script}
            </div>
          </details>
        </>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProposalsPage() {
  const [clientName, setClientName] = useState("")
  const [clientBusiness, setClientBusiness] = useState(BUSINESS_TYPES[0])
  const [service, setService] = useState(SERVICES[0])
  const [plan, setPlan] = useState(PLANS[0])
  const [budget, setBudget] = useState(BUDGETS[0])
  const [requirements, setRequirements] = useState("")
  const [tone, setTone] = useState(TONES[0])
  const [loading, setLoading] = useState(false)
  const [proposal, setProposal] = useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const [recentProposals, setRecentProposals] = useState<RecentProposal[]>([])
  const [copied, setCopied] = useState(false)
  const [showNarration, setShowNarration] = useState(false)
  const proposalRef = useRef<HTMLDivElement>(null)

  const fetchRecent = async () => {
    try {
      const res = await fetch("/api/admin/proposals", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setRecentProposals(data.proposals || [])
      }
    } catch {}
  }

  useEffect(() => { fetchRecent() }, [])

  const generate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim() || !requirements.trim()) return
    setLoading(true)
    setProposal(null)
    setShowNarration(false)
    try {
      const res = await fetch("/api/admin/proposals", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName, clientBusiness, service, plan, budget, requirements, tone }),
      })
      const data = await res.json()
      if (res.ok) {
        setProposal(data.proposal)
        setGeneratedAt(data.generatedAt)
        fetchRecent()
      } else {
        setProposal(`Error: ${data.error || "Failed to generate"}`)
      }
    } catch {
      setProposal("Error: Network failure")
    }
    setLoading(false)
  }

  const copyToClipboard = () => {
    if (!proposal) return
    navigator.clipboard.writeText(proposal)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadPdf = () => {
    window.print()
  }

  const sendEmail = () => {
    if (!proposal) return
    const subject = encodeURIComponent(`Business Proposal — ${clientName} | KVL TECH`)
    const body = encodeURIComponent(proposal.slice(0, 1500) + "\n\n[Full proposal attached]")
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const regenerate = () => {
    generate({ preventDefault: () => {} } as React.FormEvent)
  }

  const renderMarkdown = (md: string) => {
    return md
      .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-[var(--color-text)] mt-5 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-[var(--color-gold)] mt-6 mb-3 pb-1 border-b border-[var(--color-border)]">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-[var(--color-text)] mt-4 mb-4">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-[var(--color-text)]">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      .replace(/^\| (.+) \|$/gm, (row) => {
        const cells = row.split("|").slice(1, -1).map((c) => c.trim())
        return '<tr class="border-b border-[var(--color-border)]">' + cells.map((c) =>
          `<td class="px-3 py-2 text-xs text-[var(--color-text-secondary)]">${c}</td>`
        ).join("") + "</tr>"
      })
      .replace(/^---+$/gm, '<hr class="border-[var(--color-border)] my-4" />')
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm text-[var(--color-text-secondary)] list-disc mb-1">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-sm text-[var(--color-text-secondary)] list-decimal mb-1">$1</li>')
      .replace(/\n\n/g, '</p><p class="text-sm text-[var(--color-text-secondary)] mb-3">')
      .replace(/^(?!<[h|t|l|h|p|d])(.+)$/gm, '<p class="text-sm text-[var(--color-text-secondary)] mb-2">$1</p>')
  }

  return (
    <>
      <AdminTopbar title="AI Proposal Generator" />
      <div className="p-6 max-w-[1400px]">
        <div className="flex gap-6">
          {/* Left column */}
          <div className="w-[40%] shrink-0">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)]/15 flex items-center justify-center">
                  <Zap size={16} className="text-[var(--color-gold)]" />
                </div>
                <h2 className="font-display font-bold text-base text-[var(--color-text)]">Generate Proposal</h2>
              </div>

              <form onSubmit={generate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Client Name *</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Sharma Restaurant"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Business Type</label>
                  <select
                    value={clientBusiness}
                    onChange={(e) => setClientBusiness(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                  >
                    {BUSINESS_TYPES.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Service</label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                    >
                      {SERVICES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Plan</label>
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                    >
                      {PLANS.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Budget Range</label>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                    >
                      {BUDGETS.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Tone</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                    >
                      {TONES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Key Requirements *</label>
                  <textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="What does the client specifically need? e.g. Online menu, table booking system, WhatsApp integration, delivery tracking..."
                    required
                    rows={5}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-gold)] text-[var(--color-navy)] font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Generating...</>
                  ) : (
                    <><Zap size={16} /> Generate Proposal</>
                  )}
                </button>
              </form>
            </div>

            {recentProposals.length > 0 && (
              <div className="card p-5 mt-4">
                <h3 className="font-display font-bold text-sm text-[var(--color-text)] mb-3 flex items-center gap-2">
                  <Clock size={14} className="text-[var(--color-gold)]" /> Recent Proposals
                </h3>
                <div className="space-y-2">
                  {recentProposals.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-text)] truncate max-w-[180px]">
                          {p.details?.split("—")[0]?.replace("Proposal generated for ", "").trim() || "Proposal"}
                        </p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">
                          {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex-1">
            <div className="card p-5 min-h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-base text-[var(--color-text)] flex items-center gap-2">
                  <FileText size={16} className="text-[var(--color-gold)]" /> Proposal Preview
                </h2>
                {proposal && !loading && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setShowNarration((v) => !v)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
                    >
                      <Mic size={12} /> {showNarration ? "Hide Narration" : "Generate Narration"}
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
                    >
                      <Copy size={12} /> {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={downloadPdf}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
                    >
                      <Download size={12} /> PDF
                    </button>
                    <button
                      onClick={sendEmail}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
                    >
                      <Mail size={12} /> Email
                    </button>
                    <button
                      onClick={regenerate}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-gold)]/10 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20 transition-all"
                    >
                      <RefreshCw size={12} /> Regenerate
                    </button>
                  </div>
                )}
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                  <Loader2 size={32} className="animate-spin text-[var(--color-gold)]" />
                  <p className="text-sm text-[var(--color-text-muted)]">Generating your proposal with AI...</p>
                  <p className="text-xs text-[var(--color-text-muted)]">This may take 10-20 seconds</p>
                </div>
              )}

              {!loading && !proposal && (
                <div className="flex flex-col items-center justify-center h-[500px] gap-3 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center">
                    <FileText size={28} className="text-[var(--color-gold)]" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-text-secondary)]">No proposal generated yet</p>
                  <p className="text-xs text-[var(--color-text-muted)] max-w-xs">
                    Fill in the form on the left and click Generate Proposal to create a professional AI-powered proposal.
                  </p>
                </div>
              )}

              {!loading && proposal && (
                <div>
                  {generatedAt && (
                    <p className="text-[10px] text-[var(--color-text-muted)] mb-3">
                      Generated: {new Date(generatedAt).toLocaleString("en-IN")}
                    </p>
                  )}
                  <div
                    ref={proposalRef}
                    className="prose max-w-none text-[var(--color-text)] bg-[var(--color-bg-secondary)] rounded-xl p-5 overflow-auto max-h-[680px]"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(proposal) }}
                  />
                </div>
              )}
            </div>

            {/* Voice Narration Panel */}
            {showNarration && proposal && (
              <NarrationPanel
                proposal={proposal}
                clientName={clientName}
                onClose={() => setShowNarration(false)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
