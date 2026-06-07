"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  X,
  User,
  ShoppingCart,
  Headphones,
  MessageSquare,
  BookOpen,
  FileText,
  Zap,
  Loader2,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

type ResultType = "client" | "order" | "ticket" | "lead" | "kb" | "blog" | "command"

interface SearchResult {
  type: ResultType
  id: string
  label: string
  sub?: string
  meta?: string
  url: string
}

interface SearchResults {
  clients: SearchResult[]
  orders: SearchResult[]
  tickets: SearchResult[]
  leads: SearchResult[]
  kbArticles: SearchResult[]
  blogPosts: SearchResult[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COMMANDS: SearchResult[] = [
  { type: "command", id: "cmd-new-lead",    label: "/new-lead",    sub: "Open CRM with new lead form",        url: "/admin/crm?new=lead" },
  { type: "command", id: "cmd-new-order",   label: "/new-order",   sub: "Go to orders page",                  url: "/admin/orders" },
  { type: "command", id: "cmd-new-ticket",  label: "/new-ticket",  sub: "Go to support tickets",              url: "/admin/support" },
  { type: "command", id: "cmd-analytics",   label: "/analytics",   sub: "Open analytics dashboard",           url: "/admin/analytics" },
  { type: "command", id: "cmd-settings",    label: "/settings",    sub: "Go to admin settings",               url: "/admin/settings" },
]

const SECTION_META: Record<
  string,
  { label: string; Icon: React.ElementType; iconColor: string }
> = {
  client:  { label: "Clients",         Icon: User,          iconColor: "#3B82F6" },
  order:   { label: "Orders",          Icon: ShoppingCart,  iconColor: "#16A34A" },
  ticket:  { label: "Support Tickets", Icon: Headphones,    iconColor: "#F97316" },
  lead:    { label: "Leads",           Icon: MessageSquare, iconColor: "#8B5CF6" },
  kb:      { label: "KB Articles",     Icon: BookOpen,      iconColor: "#0D9488" },
  blog:    { label: "Blog",            Icon: FileText,      iconColor: "#6B7280" },
  command: { label: "Commands",        Icon: Zap,           iconColor: "#C9A227" },
}

const RECENT_KEY = "kvl-search-recent"
const MAX_RECENT = 5

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]")
  } catch {
    return []
  }
}

function saveRecent(q: string) {
  try {
    const prev = getRecent().filter(x => x !== q)
    const next = [q, ...prev].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

// ─── ResultItem ──────────────────────────────────────────────────────────────

function ResultItem({
  result,
  active,
  onClick,
  onMouseEnter,
}: {
  result: SearchResult
  active: boolean
  onClick: () => void
  onMouseEnter: () => void
}) {
  const meta = SECTION_META[result.type]
  const Icon = meta?.Icon ?? Search

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
        active ? "bg-[var(--color-bg-secondary)]" : "hover:bg-[var(--color-bg-secondary)]"
      }`}
    >
      {/* Type icon */}
      <span
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${meta?.iconColor}18` }}
      >
        <Icon size={15} style={{ color: meta?.iconColor }} />
      </span>

      {/* Label + sub */}
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-[var(--color-text)] truncate">
          {result.label}
        </span>
        {result.sub && (
          <span className="block text-xs text-[var(--color-text-muted)] truncate mt-0.5">
            {result.sub}
          </span>
        )}
      </span>

      {/* Meta */}
      {result.meta && (
        <span className="text-xs text-[var(--color-text-muted)] shrink-0 hidden sm:block">
          {result.meta}
        </span>
      )}
    </button>
  )
}

// ─── GlobalSearch ─────────────────────────────────────────────────────────────

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [recent, setRecent] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Open/close helpers ────────────────────────────────────────────────────

  const openModal = useCallback(() => {
    setOpen(true)
    setQuery("")
    setResults([])
    setActiveIdx(0)
    setRecent(getRecent())
  }, [])

  const closeModal = useCallback(() => {
    setOpen(false)
    setQuery("")
    setResults([])
  }, [])

  // ── Keyboard shortcut: Ctrl+K / Cmd+K ────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        openModal()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [openModal])

  // ── Custom event from top bar button ─────────────────────────────────────

  useEffect(() => {
    const handler = () => openModal()
    document.addEventListener("open-search", handler)
    return () => document.removeEventListener("open-search", handler)
  }, [openModal])

  // ── Auto-focus when modal opens ───────────────────────────────────────────

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  // ── Escape closes ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, closeModal])

  // ── Debounced search / command mode ──────────────────────────────────────

  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = query.trim()

    // Command mode
    if (q.startsWith("/")) {
      const filtered = COMMANDS.filter(c =>
        c.label.startsWith(q) || c.sub?.toLowerCase().includes(q.slice(1).toLowerCase())
      )
      setResults(filtered)
      setActiveIdx(0)
      return
    }

    if (q.length < 2) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/admin/search?q=${encodeURIComponent(q)}&limit=5`,
          { credentials: "include" }
        )
        if (!res.ok) return
        const data = await res.json()
        const { clients = [], orders = [], tickets = [], leads = [], kbArticles = [], blogPosts = [] } =
          data.results ?? {}
        const flat: SearchResult[] = [
          ...clients,
          ...orders,
          ...tickets,
          ...leads,
          ...kbArticles,
          ...blogPosts,
        ]
        setResults(flat)
        setActiveIdx(0)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }, 200)
  }, [query, open])

  // ── Arrow navigation + Enter ──────────────────────────────────────────────

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIdx(i => Math.min(i + 1, results.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIdx(i => Math.max(i - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        const target = results[activeIdx]
        if (target) navigate(target)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, activeIdx])

  // ── Navigate to result ────────────────────────────────────────────────────

  const navigate = (result: SearchResult) => {
    if (query.trim().length >= 2 && !query.startsWith("/")) {
      saveRecent(query.trim())
    }
    closeModal()
    router.push(result.url)
  }

  // ── Group results by type for section headers ─────────────────────────────

  const grouped = groupResults(results)

  if (!open) return null

  // ── Render ─────────────────────────────────────────────────────────────────

  // Show recent searches when input is empty
  const showRecent = query.trim().length === 0 && recent.length > 0
  const showEmpty =
    !loading &&
    query.trim().length >= 2 &&
    !query.startsWith("/") &&
    results.length === 0
  const showCommands = query.startsWith("/") && results.length === 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
      onClick={e => {
        if (e.target === e.currentTarget) closeModal()
      }}
    >
      <div className="w-full max-w-2xl mx-4 bg-[var(--color-bg)] rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden">
        {/* ── Search Input ── */}
        <div className="flex items-center gap-3 px-4 border-b border-[var(--color-border)]">
          {loading ? (
            <Loader2 size={18} className="text-[var(--color-text-muted)] shrink-0 animate-spin" />
          ) : (
            <Search size={18} className="text-[var(--color-text-muted)] shrink-0" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Search clients, orders, tickets… or type "/" for commands'
            className="w-full px-0 py-4 text-base bg-transparent outline-none text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
          />
          <kbd
            className="hidden sm:inline-flex items-center px-2 py-1 text-xs rounded border border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] shrink-0"
          >
            ESC
          </kbd>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Results area ── */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* Recent searches (shown when input is empty) */}
          {showRecent && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Recent Searches
              </div>
              {recent.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setQuery(r)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors text-left"
                >
                  <Search size={13} className="text-[var(--color-text-muted)] shrink-0" />
                  {r}
                </button>
              ))}
            </div>
          )}

          {/* Command suggestions hint when input is empty */}
          {query.trim().length === 0 && !showRecent && (
            <div className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
              <Search size={32} className="mx-auto mb-3 opacity-20" />
              Start typing to search across clients, orders, tickets, leads, articles, and blog posts.
              <br />
              Type <kbd className="mx-1 px-1.5 py-0.5 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">/</kbd> to see quick commands.
            </div>
          )}

          {/* Grouped search results */}
          {grouped.map(({ type, items }) => (
            <div key={type}>
              <div className="px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider bg-[var(--color-bg-secondary)]/50 border-t border-[var(--color-border)] first:border-t-0">
                {SECTION_META[type]?.label ?? type}
              </div>
              {items.map(item => {
                const flatIdx = results.indexOf(item)
                return (
                  <ResultItem
                    key={item.id}
                    result={item}
                    active={flatIdx === activeIdx}
                    onClick={() => navigate(item)}
                    onMouseEnter={() => setActiveIdx(flatIdx)}
                  />
                )
              })}
            </div>
          ))}

          {/* Empty state */}
          {showEmpty && (
            <div className="px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
              <Search size={28} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">No results for &ldquo;{query}&rdquo;</p>
              <p className="mt-1 opacity-60">Try a different keyword or check your spelling.</p>
            </div>
          )}

          {/* Command mode: no commands matched */}
          {showCommands && (
            <div className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
              <Zap size={28} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">No commands match &ldquo;{query}&rdquo;</p>
              <p className="mt-1 opacity-60">Available: /new-lead, /new-order, /new-ticket, /analytics, /settings</p>
            </div>
          )}
        </div>

        {/* ── Footer hint ── */}
        <div className="px-4 py-2.5 border-t border-[var(--color-border)] flex items-center gap-4 text-[11px] text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">↵</kbd>
            Open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">ESC</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Helper: group flat results into sections ─────────────────────────────────

function groupResults(results: SearchResult[]): { type: ResultType; items: SearchResult[] }[] {
  const order: ResultType[] = ["command", "client", "order", "ticket", "lead", "kb", "blog"]
  const map = new Map<ResultType, SearchResult[]>()
  for (const r of results) {
    if (!map.has(r.type)) map.set(r.type, [])
    map.get(r.type)!.push(r)
  }
  return order.filter(t => map.has(t)).map(t => ({ type: t, items: map.get(t)! }))
}
