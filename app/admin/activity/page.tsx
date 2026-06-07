"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  ShoppingCart, Users, CreditCard, Headphones,
  Settings, Activity, RefreshCw, ChevronDown, Search, X,
} from "lucide-react"
import { AdminTopbar } from "@/components/admin/AdminSidebar"

interface ActivityEvent {
  id: string
  type: string
  title: string
  description?: string
  actorName?: string
  actorType?: string
  resourceType?: string
  resourceId?: string
  isSystem: boolean
  createdAt: string
}

const TYPE_TABS = [
  { key: "all", label: "All" },
  { key: "order", label: "Orders" },
  { key: "lead", label: "Leads" },
  { key: "ticket", label: "Tickets" },
  { key: "payment", label: "Revenue" },
  { key: "system", label: "Team" },
]

function getIconConfig(type: string): { Icon: React.ElementType; color: string; bg: string } {
  if (type.startsWith("order"))
    return { Icon: ShoppingCart, color: "#C9A227", bg: "#C9A22718" }
  if (type.startsWith("lead"))
    return { Icon: Users, color: "#3B82F6", bg: "#3B82F618" }
  if (type.startsWith("payment"))
    return { Icon: CreditCard, color: "#16A34A", bg: "#16A34A18" }
  if (type.startsWith("ticket"))
    return { Icon: Headphones, color: "#F97316", bg: "#F9731618" }
  return { Icon: Settings, color: "#6B7280", bg: "#6B728018" }
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function EventRow({ event }: { event: ActivityEvent }) {
  const { Icon, color, bg } = getIconConfig(event.type)
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors group">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: bg }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--color-text)] leading-snug">
            {event.title}
          </p>
          <span className="text-xs text-[var(--color-text-muted)] shrink-0 mt-0.5">
            {timeAgo(event.createdAt)}
          </span>
        </div>
        {event.description && (
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
            {event.description}
          </p>
        )}
        {event.actorName && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-4 h-4 rounded-full bg-[var(--color-navy)] flex items-center justify-center text-white text-[9px] font-bold">
              {event.actorName[0]?.toUpperCase()}
            </div>
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {event.actorName}
              {event.actorType && (
                <span className="ml-1 opacity-60">· {event.actorType}</span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ActivityFeedPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [filterQuery, setFilterQuery] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const isFirstLoad = useRef(true)

  const fetchEvents = useCallback(
    async (cursor?: string, replace = false) => {
      try {
        const params = new URLSearchParams()
        if (activeTab !== "all") params.set("type", activeTab)
        if (cursor) params.set("cursor", cursor)
        params.set("limit", "20")

        const res = await fetch(`/api/admin/activity-feed?${params}`, {
          credentials: "include",
        })
        if (!res.ok) return

        const data = await res.json()
        setEvents(prev => (replace ? data.events : [...prev, ...data.events]))
        setNextCursor(data.nextCursor)

        // Auto-scroll to top on fresh load
        if (replace && !isFirstLoad.current) {
          listRef.current?.scrollTo({ top: 0, behavior: "smooth" })
        }
        isFirstLoad.current = false
      } catch (e) {
        console.error(e)
      }
    },
    [activeTab]
  )

  // Initial + tab change load
  useEffect(() => {
    setLoading(true)
    setEvents([])
    setNextCursor(null)
    isFirstLoad.current = true
    fetchEvents(undefined, true).finally(() => setLoading(false))
  }, [fetchEvents])

  // SSE live updates
  useEffect(() => {
    const es = new EventSource("/api/stream")
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === "activity" && data.event) {
          const ev: ActivityEvent = data.event
          const matchesTab =
            activeTab === "all" || ev.type.startsWith(activeTab)
          if (matchesTab) {
            setEvents(prev => {
              if (prev.some(x => x.id === ev.id)) return prev
              return [ev, ...prev]
            })
          }
        }
      } catch {
        // ignore
      }
    }
    return () => es.close()
  }, [activeTab])

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    await fetchEvents(nextCursor)
    setLoadingMore(false)
  }

  const filteredEvents = filterQuery.trim().length > 0
    ? events.filter(ev => {
        const q = filterQuery.toLowerCase()
        return (
          ev.title.toLowerCase().includes(q) ||
          ev.type.toLowerCase().includes(q) ||
          ev.description?.toLowerCase().includes(q) ||
          ev.actorName?.toLowerCase().includes(q) ||
          ev.resourceType?.toLowerCase().includes(q)
        )
      })
    : events

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AdminTopbar title="Activity Feed" />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity size={20} className="text-[var(--color-gold)]" />
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Company Activity Feed
            </h2>
            {/* Live indicator */}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              <span className="text-xs text-green-600 font-medium">Live</span>
            </div>
          </div>

          <button
            onClick={() => fetchEvents(undefined, true)}
            className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Local search filter */}
        <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] w-full max-w-sm">
          <Search size={14} className="text-[var(--color-text-muted)] shrink-0" />
          <input
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            placeholder="Filter activities..."
            className="flex-1 bg-transparent outline-none text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery("")}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-6 bg-[var(--color-bg-secondary)] p-1 rounded-xl w-fit">
          {TYPE_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-[var(--color-navy)] text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Event list */}
        <div
          ref={listRef}
          className="card divide-y divide-[var(--color-border)] overflow-hidden"
        >
          {loading ? (
            <div className="flex flex-col gap-0 divide-y divide-[var(--color-border)]">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-secondary)] shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-[var(--color-bg-secondary)]" />
                    <div className="h-3 w-72 rounded bg-[var(--color-bg-secondary)]" />
                    <div className="h-3 w-24 rounded bg-[var(--color-bg-secondary)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Activity size={40} className="text-[var(--color-text-muted)] mb-4 opacity-40" />
              {filterQuery ? (
                <>
                  <p className="text-[var(--color-text-muted)] font-medium">No activities match &ldquo;{filterQuery}&rdquo;</p>
                  <p className="text-sm text-[var(--color-text-muted)] opacity-60 mt-1">Try a different search term</p>
                </>
              ) : (
                <>
                  <p className="text-[var(--color-text-muted)] font-medium">No activity yet</p>
                  <p className="text-sm text-[var(--color-text-muted)] opacity-60 mt-1">
                    Events will appear here as they happen
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              {filteredEvents.map(event => (
                <EventRow key={event.id} event={event} />
              ))}
              {nextCursor && !filterQuery && (
                <div className="p-4 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 mx-auto px-5 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-all disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown size={13} />
                        Load more
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
