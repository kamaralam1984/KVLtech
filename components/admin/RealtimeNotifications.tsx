"use client"
import { useEffect, useState } from "react"
import { useWebSocket } from "@/hooks/useWebSocket"
import { Bell } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: "order" | "lead" | "ticket" | "team"
  ts: number
  read: boolean
}

export function RealtimeNotifications({ adminId }: { adminId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const { isConnected, addHandler } = useWebSocket({
    userId: adminId,
    role: "admin",
    channels: ["dashboard", "crm", `user:${adminId}`],
  })

  useEffect(() => {
    const cleanup = addHandler((msg) => {
      if (["new_order", "new_lead", "ticket_updated", "team_activity"].includes(msg.type)) {
        const notification: Notification = {
          id: `${Date.now()}`,
          title:
            msg.type === "new_order"
              ? "New Order"
              : msg.type === "new_lead"
              ? "New Lead"
              : msg.type === "ticket_updated"
              ? "Ticket Updated"
              : "Team Activity",
          message:
            msg.type === "new_order"
              ? `${msg.clientName} — ₹${msg.amount}`
              : msg.type === "new_lead"
              ? `${msg.name} — ${msg.service}`
              : String(msg.status || msg.reply || "Update"),
          type:
            msg.type === "new_order"
              ? "order"
              : msg.type === "new_lead"
              ? "lead"
              : "ticket",
          ts: Number(msg.ts) || Date.now(),
          read: false,
        }
        setNotifications(prev => [notification, ...prev.slice(0, 19)])
      }
    })
    return () => { cleanup() }
  }, [addHandler])

  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open)
          setNotifications(p => p.map(n => ({ ...n, read: true })))
        }}
        className="relative p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors"
      >
        <Bell size={20} className="text-[var(--color-text-muted)]" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
        <span
          className={`absolute bottom-1 right-1 h-2 w-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-gray-400"
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--color-border)] flex justify-between items-center">
            <span className="font-semibold text-sm">Live Notifications</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                isConnected
                  ? "bg-green-500/10 text-green-500"
                  : "bg-gray-500/10 text-gray-500"
              }`}
            >
              {isConnected ? "Live" : "Offline"}
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-[var(--color-text-muted)] text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className="px-4 py-3 border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
                >
                  <div className="font-semibold text-sm">{n.title}</div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{n.message}</div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-1">
                    {new Date(n.ts).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
