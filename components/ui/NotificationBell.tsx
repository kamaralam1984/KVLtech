"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Bell, ShoppingCart, Users, CreditCard, Headphones, Settings, Check } from "lucide-react"

interface AdminNotification {
  id: string
  type: string
  title: string
  description?: string
  actorName?: string
  isSystem: boolean
  createdAt: string
}

function getIconConfig(type: string) {
  if (type?.startsWith("order"))
    return { Icon: ShoppingCart, color: "#C9A227" }
  if (type?.startsWith("lead"))
    return { Icon: Users, color: "#3B82F6" }
  if (type?.startsWith("payment"))
    return { Icon: CreditCard, color: "#16A34A" }
  if (type?.startsWith("ticket"))
    return { Icon: Headphones, color: "#F97316" }
  return { Icon: Settings, color: "#6B7280" }
}

function timeAgo(date: string) {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(date).toLocaleDateString()
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/activity-feed?limit=20", {
        credentials: "include",
      })
      if (!res.ok) return
      const data = await res.json()
      const events: AdminNotification[] = data.events || []
      setNotifications(events)
      setUnread(events.filter((e: AdminNotification) => !readIds.has(e.id)).length)
    } catch {
      // silent
    }
  }, [readIds])

  // Initial load + 30-second polling
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const handleOpen = () => {
    setOpen(v => !v)
  }

  const markAllRead = () => {
    const allIds = new Set(notifications.map(n => n.id))
    setReadIds(allIds)
    setUnread(0)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-all"
        aria-label="Notifications"
      >
        <Bell size={16} className="text-[var(--color-text-secondary)]" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-11 w-80 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
            <span className="font-semibold text-sm text-[var(--color-text)]">
              Notifications
              {unread > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold">
                  {unread} new
                </span>
              )}
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <Check size={12} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell size={28} className="text-[var(--color-text-muted)] opacity-30 mb-3" />
                <p className="text-sm text-[var(--color-text-muted)]">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => {
                const { Icon, color } = getIconConfig(notif.type)
                const isUnread = !readIds.has(notif.id)
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer ${isUnread ? "bg-[var(--color-bg-secondary)]/50" : ""}`}
                    onClick={() => {
                      setReadIds(prev => new Set([...prev, notif.id]))
                      setUnread(prev => Math.max(0, prev - (isUnread ? 1 : 0)))
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${color}18` }}
                    >
                      <Icon size={14} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-medium leading-snug ${isUnread ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}`}>
                          {notif.title}
                        </p>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1" />
                        )}
                      </div>
                      {notif.description && (
                        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed line-clamp-2">
                          {notif.description}
                        </p>
                      )}
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-1 opacity-60">
                        {timeAgo(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
