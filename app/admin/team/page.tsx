"use client"

import {
  useState, useEffect, useRef, useCallback, KeyboardEvent,
} from "react"
import dynamic from "next/dynamic"
import {
  Hash, Plus, Send, X, Lock, Users, SmilePlus,
  Reply, ChevronDown, Loader2, MessageSquare,
  CheckSquare, FileText, Calendar, ChevronLeft, ChevronRight,
  Pin, PinOff, Trash2, Search, CalendarDays,
} from "lucide-react"
import { AdminTopbar } from "@/components/admin/AdminSidebar"

const TeamChat = dynamic(() => import("@/components/admin/TeamChat"), { ssr: false })

// ── Shared Types ─────────────────────────────────────────────────

interface TeamChannel {
  id: string
  name: string
  description?: string
  isPrivate: boolean
  createdBy: string
  members: string[]
  createdAt: string
  messages?: TeamMessage[]
}

interface TeamMessage {
  id: string
  channelId: string
  senderId: string
  senderName: string
  text: string
  fileUrl?: string
  mentions: string[]
  reactions?: string
  replyToId?: string
  isEdited: boolean
  createdAt: string
}

interface TeamTask {
  id: string
  title: string
  description?: string
  assignedTo?: string
  assignedBy: string
  dueDate?: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "CANCELLED"
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface TeamNote {
  id: string
  title: string
  content: string
  createdBy: string
  creatorName: string
  isPinned: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface CalendarEvent {
  id: string
  title: string
  date: string
  endDate: string | null
  color: string
  type: "event" | "meeting"
  allDay: boolean
  attendees: string[]
  location: string | null
  description?: string | null
  meetingLink?: string | null
}

type Tab = "chat" | "tasks" | "notes" | "calendar"

// ── Shared Utilities ─────────────────────────────────────────────

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "👏"]

function getInitials(name: string) {
  return name
    .split(/[@._\s]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join("") || name[0]?.toUpperCase() || "?"
}

function getAvatarColor(name: string) {
  const colors = [
    "#C9A227", "#3B82F6", "#8B5CF6", "#EF4444",
    "#10B981", "#F97316", "#06B6D4", "#EC4899",
  ]
  let hash = 0
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function timeAgo(date: string) {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (secs < 60) return "just now"
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(date).toLocaleDateString()
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const bg = getAvatarColor(name)
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.35 }}
    >
      {getInitials(name)}
    </div>
  )
}

// ── Priority helpers ─────────────────────────────────────────────

const PRIORITY_CONFIG = {
  URGENT: { label: "Urgent", bg: "bg-red-500/15", text: "text-red-500", border: "border-red-500/30" },
  HIGH:   { label: "High",   bg: "bg-orange-500/15", text: "text-orange-500", border: "border-orange-500/30" },
  MEDIUM: { label: "Medium", bg: "bg-yellow-500/15", text: "text-yellow-500", border: "border-yellow-500/30" },
  LOW:    { label: "Low",    bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
}

const STATUS_COLUMNS: Array<{ key: TeamTask["status"]; label: string }> = [
  { key: "TODO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "REVIEW", label: "Review" },
  { key: "DONE", label: "Done" },
]

// ── Message Bubble ───────────────────────────────────────────────

function MessageBubble({
  msg, allMessages, onReact, onReply,
}: {
  msg: TeamMessage
  allMessages: TeamMessage[]
  onReact: (msgId: string, emoji: string) => void
  onReply: (msg: TeamMessage) => void
}) {
  const [showReactions, setShowReactions] = useState(false)
  const replyTo = msg.replyToId ? allMessages.find(m => m.id === msg.replyToId) : null

  let reactions: Record<string, string[]> = {}
  try { if (msg.reactions) reactions = JSON.parse(msg.reactions) } catch { /* ignore */ }

  return (
    <div
      className="group flex items-start gap-3 px-4 py-2 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors relative"
      onMouseLeave={() => setShowReactions(false)}
    >
      <Avatar name={msg.senderName} size={34} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-sm font-semibold text-[var(--color-text)]">{msg.senderName}</span>
          <span className="text-[11px] text-[var(--color-text-muted)]">{timeAgo(msg.createdAt)}</span>
          {msg.isEdited && <span className="text-[10px] text-[var(--color-text-muted)] italic">(edited)</span>}
        </div>
        {replyTo && (
          <div className="mb-1.5 pl-3 border-l-2 border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
            <span className="font-medium text-[var(--color-text)]">{replyTo.senderName}: </span>
            {replyTo.text.slice(0, 80)}{replyTo.text.length > 80 ? "..." : ""}
          </div>
        )}
        <p className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap break-words">
          {msg.text}
        </p>
        {Object.keys(reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {Object.entries(reactions).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => onReact(msg.id, emoji)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs hover:border-[var(--color-gold)] transition-colors"
              >
                <span>{emoji}</span>
                <span className="text-[var(--color-text-muted)]">{users.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="absolute right-4 top-2 hidden group-hover:flex items-center gap-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg shadow-sm px-1 py-0.5">
        <div className="relative">
          <button
            onClick={() => setShowReactions(v => !v)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <SmilePlus size={14} />
          </button>
          {showReactions && (
            <div className="absolute right-0 bottom-8 flex gap-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-2 py-1.5 shadow-lg z-20">
              {REACTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => { onReact(msg.id, emoji); setShowReactions(false) }}
                  className="text-lg hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => onReply(msg)}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <Reply size={14} />
        </button>
      </div>
    </div>
  )
}

// ── New Channel Modal ────────────────────────────────────────────

function NewChannelModal({
  onClose, onCreate,
}: {
  onClose: () => void
  onCreate: (data: { name: string; description: string; isPrivate: boolean }) => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await onCreate({ name: name.trim(), description, isPrivate })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[var(--color-text)]">Create Channel</h3>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Channel Name</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              <Hash size={14} className="text-[var(--color-text-muted)] shrink-0" />
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. design-feedback"
                className="flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
                autoFocus
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Description (optional)</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this channel about?"
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setIsPrivate(v => !v)}
              className={`w-10 h-5 rounded-full transition-colors relative ${isPrivate ? "bg-[var(--color-navy)]" : "bg-[var(--color-border)]"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${isPrivate ? "left-5" : "left-0.5"}`} />
            </div>
            <span className="flex items-center gap-1.5 text-sm text-[var(--color-text)]">
              <Lock size={13} />
              Private channel
            </span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving || !name.trim()} className="flex-1 py-2 rounded-xl bg-[var(--color-navy)] text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50">
              {saving ? "Creating..." : "Create Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Task Modal ───────────────────────────────────────────────────

function TaskModal({
  task,
  onClose,
  onSave,
}: {
  task?: TeamTask | null
  onClose: () => void
  onSave: () => void
}) {
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo || "")
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.slice(0, 10) : "")
  const [priority, setPriority] = useState<TeamTask["priority"]>(task?.priority || "MEDIUM")
  const [status, setStatus] = useState<TeamTask["status"]>(task?.status || "TODO")
  const [tagsInput, setTagsInput] = useState(task?.tags?.join(", ") || "")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean)
      if (task) {
        await fetch("/api/admin/team/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            id: task.id, title, description: description || undefined,
            assignedTo: assignedTo || undefined, dueDate: dueDate || undefined,
            priority, status,
          }),
        })
      } else {
        await fetch("/api/admin/team/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title, description: description || undefined,
            assignedTo: assignedTo || undefined, dueDate: dueDate || undefined,
            priority, tags,
          }),
        })
      }
      onSave()
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[var(--color-text)]">{task ? "Edit Task" : "Add Task"}</h3>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title"
              required
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-gold)]"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] resize-none focus:border-[var(--color-gold)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Assigned To</label>
              <input
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                placeholder="Name or email"
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-gold)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TeamTask["priority"])}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)]"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            {task && (
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as TeamTask["status"])}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)]"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="DONE">Done</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            )}
          </div>
          {!task && (
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Tags (comma-separated)</label>
              <input
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="e.g. frontend, urgent, bug"
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-gold)]"
              />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving || !title.trim()} className="flex-1 py-2 rounded-xl bg-[var(--color-gold)] text-black text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50">
              {saving ? "Saving..." : task ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Task Card ────────────────────────────────────────────────────

function TaskCard({
  task,
  onStatusChange,
  onEdit,
}: {
  task: TeamTask
  onStatusChange: (id: string, status: TeamTask["status"]) => void
  onEdit: (task: TeamTask) => void
}) {
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM
  const now = new Date()
  const due = task.dueDate ? new Date(task.dueDate) : null
  const isOverdue = due && due < now && task.status !== "DONE"
  const isToday = due && due.toDateString() === now.toDateString()
  const dueDateColor = isOverdue ? "text-red-500" : isToday ? "text-orange-500" : "text-[var(--color-text-muted)]"

  return (
    <div
      className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 cursor-pointer hover:border-[var(--color-gold)]/50 transition-all group"
      onClick={() => onEdit(task)}
    >
      {/* Priority + status change */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priority.bg} ${priority.text} ${priority.border}`}>
          {priority.label}
        </span>
        <select
          value={task.status}
          onClick={e => e.stopPropagation()}
          onChange={e => onStatusChange(task.id, e.target.value as TeamTask["status"])}
          className="text-[10px] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-1.5 py-0.5 text-[var(--color-text-muted)] outline-none cursor-pointer"
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">Review</option>
          <option value="DONE">Done</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <p className="text-sm font-medium text-[var(--color-text)] leading-snug mb-2">{task.title}</p>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        {task.assignedTo ? (
          <div className="flex items-center gap-1.5">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold shrink-0"
              style={{ background: getAvatarColor(task.assignedTo), fontSize: 8 }}
            >
              {getInitials(task.assignedTo)}
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)] truncate max-w-[80px]">{task.assignedTo}</span>
          </div>
        ) : (
          <span className="text-[10px] text-[var(--color-text-muted)] italic">Unassigned</span>
        )}
        {due && (
          <span className={`text-[10px] font-medium ${dueDateColor}`}>
            {due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Tasks Tab ────────────────────────────────────────────────────

function TasksTab() {
  const [tasks, setTasks] = useState<TeamTask[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<TeamTask | null | undefined>(undefined) // undefined = closed, null = new
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [filterAssigned, setFilterAssigned] = useState<string>("")

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.set("status", filterStatus)
      if (filterAssigned) params.set("assignedTo", filterAssigned)
      const res = await fetch(`/api/admin/team/tasks?${params}`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || [])
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [filterStatus, filterAssigned])

  useEffect(() => { loadTasks() }, [loadTasks])

  const handleStatusChange = async (id: string, status: TeamTask["status"]) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    try {
      await fetch("/api/admin/team/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      })
    } catch (e) { console.error(e) }
  }

  const tasksByStatus = STATUS_COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter(t => t.status === col.key)
    return acc
  }, {} as Record<string, TeamTask[]>)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--color-border)] shrink-0 bg-[var(--color-bg)]">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">Review</option>
          <option value="DONE">Done</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <input
          value={filterAssigned}
          onChange={e => setFilterAssigned(e.target.value)}
          placeholder="Filter by assignee..."
          className="px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] w-48"
        />
        <button
          onClick={() => setEditingTask(null)}
          className="ml-auto flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[var(--color-gold)] text-black text-sm font-medium hover:opacity-90 transition-all"
        >
          <Plus size={14} />
          Add Task
        </button>
      </div>

      {/* Kanban board */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 py-4">
          <div className="flex gap-4 h-full min-w-max">
            {STATUS_COLUMNS.map(col => {
              const colTasks = tasksByStatus[col.key] || []
              return (
                <div key={col.key} className="flex flex-col w-72 shrink-0">
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-sm font-semibold text-[var(--color-text)]">{col.label}</h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                      {colTasks.length}
                    </span>
                  </div>
                  {/* Cards */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {colTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        onEdit={t => setEditingTask(t)}
                      />
                    ))}
                    {colTasks.length === 0 && (
                      <div className="text-center py-8 text-[var(--color-text-muted)] text-xs border border-dashed border-[var(--color-border)] rounded-xl">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {editingTask !== undefined && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(undefined)}
          onSave={loadTasks}
        />
      )}
    </div>
  )
}

// ── Note Modal ───────────────────────────────────────────────────

function NoteModal({
  note,
  onClose,
  onSave,
}: {
  note?: TeamNote | null
  onClose: () => void
  onSave: () => void
}) {
  const [title, setTitle] = useState(note?.title || "")
  const [content, setContent] = useState(note?.content || "")
  const [isPinned, setIsPinned] = useState(note?.isPinned || false)
  const [tagsInput, setTagsInput] = useState(note?.tags?.join(", ") || "")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    try {
      const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean)
      if (note) {
        await fetch("/api/admin/team/notes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id: note.id, title, content, isPinned }),
        })
      } else {
        await fetch("/api/admin/team/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title, content, isPinned, tags }),
        })
      }
      onSave()
      onClose()
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl w-full max-w-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[var(--color-text)]">{note ? "Edit Note" : "New Note"}</h3>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Note title..."
            required
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-base font-medium text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-gold)]"
            autoFocus
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your note here..."
            required
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] resize-none focus:border-[var(--color-gold)]"
            style={{ minHeight: 150 }}
          />
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Tags (comma-separated)</label>
              <input
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="e.g. design, process"
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-gold)]"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none mt-5">
              <div
                onClick={() => setIsPinned(v => !v)}
                className={`w-10 h-5 rounded-full transition-colors relative ${isPinned ? "bg-[var(--color-gold)]" : "bg-[var(--color-border)]"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${isPinned ? "left-5" : "left-0.5"}`} />
              </div>
              <span className="text-sm text-[var(--color-text)]">Pin note</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving || !title.trim() || !content.trim()} className="flex-1 py-2 rounded-xl bg-[var(--color-gold)] text-black text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50">
              {saving ? "Saving..." : note ? "Save Changes" : "Create Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Notes Tab ────────────────────────────────────────────────────

function NotesTab() {
  const [notes, setNotes] = useState<TeamNote[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editingNote, setEditingNote] = useState<TeamNote | null | undefined>(undefined)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadNotes = useCallback(async (q?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set("q", q)
      const res = await fetch(`/api/admin/team/notes?${params}`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setNotes(data.notes || [])
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadNotes() }, [loadNotes])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => { loadNotes(search || undefined) }, 300)
    return () => clearTimeout(timer)
  }, [search, loadNotes])

  const handlePin = async (note: TeamNote) => {
    const newPinned = !note.isPinned
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, isPinned: newPinned } : n))
    try {
      await fetch("/api/admin/team/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: note.id, isPinned: newPinned }),
      })
      loadNotes(search || undefined)
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/team/notes?id=${id}`, { method: "DELETE", credentials: "include" })
      setNotes(prev => prev.filter(n => n.id !== id))
      setDeleteConfirm(null)
    } catch (e) { console.error(e) }
  }

  const pinned = notes.filter(n => n.isPinned)
  const unpinned = notes.filter(n => !n.isPinned)

  const NoteCard = ({ note }: { note: TeamNote }) => (
    <div
      className={`bg-[var(--color-bg)] border rounded-xl p-4 flex flex-col gap-2 relative group ${
        note.isPinned ? "border-[var(--color-gold)]/50" : "border-[var(--color-border)]"
      }`}
    >
      {/* Actions */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => handlePin(note)}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors"
          title={note.isPinned ? "Unpin" : "Pin"}
        >
          {note.isPinned ? <PinOff size={12} /> : <Pin size={12} />}
        </button>
        <button
          onClick={() => setEditingNote(note)}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors text-[11px] font-medium"
          title="Edit"
        >
          ✎
        </button>
        <button
          onClick={() => setDeleteConfirm(note.id)}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
          title="Delete"
        >
          <Trash2 size={11} />
        </button>
      </div>

      <div className="flex items-start gap-2 pr-16">
        {note.isPinned && <Pin size={12} className="text-[var(--color-gold)] shrink-0 mt-0.5" />}
        <h4 className="text-sm font-semibold text-[var(--color-text)] leading-snug">{note.title}</h4>
      </div>

      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed flex-1">
        {note.content.slice(0, 100)}{note.content.length > 100 ? "..." : ""}
      </p>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.map(tag => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
        <span className="text-[10px] text-[var(--color-text-muted)]">{note.creatorName}</span>
        <span className="text-[10px] text-[var(--color-text-muted)]">
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--color-border)] shrink-0 bg-[var(--color-bg)]">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex-1 max-w-xs">
          <Search size={14} className="text-[var(--color-text-muted)] shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
          />
        </div>
        <button
          onClick={() => setEditingNote(null)}
          className="ml-auto flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[var(--color-gold)] text-black text-sm font-medium hover:opacity-90 transition-all"
        >
          <Plus size={14} />
          New Note
        </button>
      </div>

      {/* Notes grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {notes.length === 0 ? (
            <div className="text-center py-16 text-[var(--color-text-muted)]">
              <FileText size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">{search ? "No notes match your search" : "No notes yet. Create your first one!"}</p>
            </div>
          ) : (
            <>
              {/* Pinned section */}
              {pinned.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Pin size={11} className="text-[var(--color-gold)]" />
                    Pinned
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pinned.map(note => <NoteCard key={note.id} note={note} />)}
                  </div>
                </div>
              )}

              {/* All other notes */}
              {unpinned.length > 0 && (
                <div>
                  {pinned.length > 0 && (
                    <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                      Notes
                    </h3>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {unpinned.map(note => <NoteCard key={note.id} note={note} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {editingNote !== undefined && (
        <NoteModal
          note={editingNote}
          onClose={() => setEditingNote(undefined)}
          onSave={() => loadNotes(search || undefined)}
        />
      )}

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-[var(--color-text)] mb-2">Delete Note?</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-all">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:opacity-90 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Event Modal ──────────────────────────────────────────────────

function EventModal({
  defaultDate,
  event,
  onClose,
  onSave,
}: {
  defaultDate?: string
  event?: CalendarEvent | null
  onClose: () => void
  onSave: () => void
}) {
  const [title, setTitle] = useState(event?.title || "")
  const [description, setDescription] = useState(event?.description || "")
  const [date, setDate] = useState(
    event?.date ? event.date.slice(0, 16) : (defaultDate ? `${defaultDate}T09:00` : "")
  )
  const [endDate, setEndDate] = useState(event?.endDate ? event.endDate.slice(0, 16) : "")
  const [allDay, setAllDay] = useState(event?.allDay || false)
  const [color, setColor] = useState(event?.color || "#C9A227")
  const [attendeesInput, setAttendeesInput] = useState(event?.attendees?.join(", ") || "")
  const [location, setLocation] = useState(event?.location || "")
  const [meetingLink, setMeetingLink] = useState(event?.meetingLink || "")
  const [saving, setSaving] = useState(false)

  const COLORS = ["#C9A227", "#3B82F6", "#8B5CF6", "#EF4444", "#10B981", "#F97316", "#EC4899"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !date) return
    setSaving(true)
    try {
      const attendees = attendeesInput.split(",").map(a => a.trim()).filter(Boolean)
      if (event && !event.id.startsWith("meeting-")) {
        await fetch("/api/admin/team/calendar", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            id: event.id, title, description: description || undefined,
            date, endDate: endDate || undefined, allDay, color,
            attendees, location: location || undefined, meetingLink: meetingLink || undefined,
          }),
        })
      } else {
        await fetch("/api/admin/team/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title, description: description || undefined,
            date, endDate: endDate || undefined, allDay, color,
            attendees, location: location || undefined, meetingLink: meetingLink || undefined,
          }),
        })
      }
      onSave()
      onClose()
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const isReadOnly = event?.id.startsWith("meeting-")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[var(--color-text)]">
            {isReadOnly ? "Meeting Details" : event ? "Edit Event" : "Add Event"}
          </h3>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <X size={18} />
          </button>
        </div>

        {isReadOnly ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Title</p>
              <p className="text-sm text-[var(--color-text)] font-medium">{event?.title}</p>
            </div>
            {event?.description && (
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Notes</p>
                <p className="text-sm text-[var(--color-text)]">{event.description}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Date & Time</p>
              <p className="text-sm text-[var(--color-text)]">{new Date(event!.date).toLocaleString()}</p>
            </div>
            {event?.attendees && event.attendees.length > 0 && (
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Attendees</p>
                <p className="text-sm text-[var(--color-text)]">{event.attendees.join(", ")}</p>
              </div>
            )}
            {event?.meetingLink && (
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Meeting Link</p>
                <a href={event.meetingLink} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline">
                  {event.meetingLink}
                </a>
              </div>
            )}
            <button onClick={onClose} className="w-full mt-2 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-all">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Event title"
              required
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-gold)]"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
                  {allDay ? "Date" : "Start"}
                </label>
                <input
                  type={allDay ? "date" : "datetime-local"}
                  value={allDay ? date.slice(0, 10) : date}
                  onChange={e => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)]"
                />
              </div>
              {!allDay && (
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">End</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)]"
                  />
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} className="w-4 h-4 accent-[var(--color-gold)]" />
              <span className="text-sm text-[var(--color-text)]">All day event</span>
            </label>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Color</label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${color === c ? "ring-2 ring-offset-2 ring-[var(--color-text)]" : ""}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-gold)]"
            />
            <input
              value={attendeesInput}
              onChange={e => setAttendeesInput(e.target.value)}
              placeholder="Attendees (comma-separated)"
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-gold)]"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Location (optional)"
                className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-gold)]"
              />
              <input
                value={meetingLink}
                onChange={e => setMeetingLink(e.target.value)}
                placeholder="Meeting link (optional)"
                className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-gold)]"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-all">
                Cancel
              </button>
              <button type="submit" disabled={saving || !title.trim()} className="flex-1 py-2 rounded-xl bg-[var(--color-gold)] text-black text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50">
                {saving ? "Saving..." : event ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Calendar Tab ─────────────────────────────────────────────────

function CalendarTab() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null | undefined>(undefined)
  const [newEventDate, setNewEventDate] = useState<string | undefined>(undefined)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/team/calendar?month=${monthStr}`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setEvents(data.events || [])
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [monthStr])

  useEffect(() => { loadEvents() }, [loadEvents])

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => { setCurrentDate(new Date()); setSelectedDay(null) }

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7

  const days: Array<{ date: string; day: number | null }> = []
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstDayOfMonth + 1
    if (dayNum < 1 || dayNum > daysInMonth) {
      days.push({ date: "", day: null })
    } else {
      const d = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`
      days.push({ date: d, day: dayNum })
    }
  }

  const eventsByDay = events.reduce((acc, e) => {
    const d = e.date.slice(0, 10)
    if (!acc[d]) acc[d] = []
    acc[d].push(e)
    return acc
  }, {} as Record<string, CalendarEvent[]>)

  const todayStr = new Date().toISOString().slice(0, 10)
  const selectedEvents = selectedDay ? (eventsByDay[selectedDay] || []) : []

  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"]
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--color-border)] shrink-0 bg-[var(--color-bg)]">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] transition-colors">
          <ChevronLeft size={16} />
        </button>
        <h2 className="text-base font-bold text-[var(--color-text)] min-w-[160px] text-center">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] transition-colors">
          <ChevronRight size={16} />
        </button>
        <button onClick={goToday} className="px-3 py-1 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors ml-1">
          Today
        </button>
        <button
          onClick={() => { setNewEventDate(undefined); setEditingEvent(null) }}
          className="ml-auto flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[var(--color-gold)] text-black text-sm font-medium hover:opacity-90 transition-all"
        >
          <Plus size={14} />
          Add Event
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Calendar grid */}
        <div className="flex-1 flex flex-col overflow-hidden p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-[var(--color-text-muted)] py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grid cells */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-px flex-1 bg-[var(--color-border)]">
              {days.map((cell, i) => {
                const cellEvents = cell.date ? (eventsByDay[cell.date] || []) : []
                const isToday = cell.date === todayStr
                const isSelected = cell.date === selectedDay
                return (
                  <div
                    key={i}
                    onClick={() => cell.date && setSelectedDay(isSelected ? null : cell.date)}
                    className={`bg-[var(--color-bg)] p-1.5 flex flex-col min-h-[80px] ${
                      cell.date ? "cursor-pointer hover:bg-[var(--color-bg-secondary)]" : "opacity-30"
                    } ${isSelected ? "bg-[var(--color-bg-secondary)] ring-1 ring-inset ring-[var(--color-gold)]" : ""} transition-colors`}
                  >
                    {cell.day !== null && (
                      <>
                        <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                          isToday ? "bg-[var(--color-gold)] text-black" : "text-[var(--color-text)]"
                        }`}>
                          {cell.day}
                        </span>
                        <div className="flex flex-col gap-0.5 overflow-hidden">
                          {cellEvents.slice(0, 3).map(ev => (
                            <div
                              key={ev.id}
                              className="text-[10px] px-1 py-0.5 rounded truncate text-white font-medium leading-tight"
                              style={{ background: ev.color }}
                            >
                              {ev.type === "meeting" && "📅 "}
                              {ev.title}
                            </div>
                          ))}
                          {cellEvents.length > 3 && (
                            <span className="text-[9px] text-[var(--color-text-muted)] px-1">
                              +{cellEvents.length - 3} more
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar: selected day events */}
        {selectedDay && (
          <div className="w-72 border-l border-[var(--color-border)] flex flex-col shrink-0 bg-[var(--color-bg)]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
              <h3 className="text-sm font-bold text-[var(--color-text)]">
                {new Date(selectedDay + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "long", month: "short", day: "numeric"
                })}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setNewEventDate(selectedDay); setEditingEvent(null) }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--color-gold)] text-black hover:opacity-90 transition-all"
                  title="Add event for this day"
                >
                  <Plus size={13} />
                </button>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {selectedEvents.length === 0 ? (
                <p className="text-xs text-[var(--color-text-muted)] text-center py-6">
                  No events for this day.
                </p>
              ) : (
                selectedEvents.map(ev => (
                  <div
                    key={ev.id}
                    onClick={() => setEditingEvent(ev)}
                    className="p-3 rounded-xl border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-gold)]/50 transition-colors"
                    style={{ borderLeftWidth: 3, borderLeftColor: ev.color }}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      {ev.type === "meeting" ? (
                        <CalendarDays size={12} className="text-blue-400 mt-0.5 shrink-0" />
                      ) : (
                        <Calendar size={12} className="mt-0.5 shrink-0" style={{ color: ev.color }} />
                      )}
                      <p className="text-sm font-medium text-[var(--color-text)] leading-snug">{ev.title}</p>
                    </div>
                    {!ev.allDay && (
                      <p className="text-[11px] text-[var(--color-text-muted)] mb-1 ml-4">
                        {new Date(ev.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        {ev.endDate && ` – ${new Date(ev.endDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}
                      </p>
                    )}
                    {ev.location && (
                      <p className="text-[11px] text-[var(--color-text-muted)] ml-4">{ev.location}</p>
                    )}
                    {ev.attendees.length > 0 && (
                      <p className="text-[11px] text-[var(--color-text-muted)] ml-4 truncate">
                        {ev.attendees.join(", ")}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {editingEvent !== undefined && (
        <EventModal
          defaultDate={newEventDate}
          event={editingEvent}
          onClose={() => { setEditingEvent(undefined); setNewEventDate(undefined) }}
          onSave={loadEvents}
        />
      )}
    </div>
  )
}

// ── Chat Tab — delegates to TeamChat component ────────────────────

function ChatTab() {
  return <TeamChat />
}

// ── Main Page ────────────────────────────────────────────────────

const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
  { key: "chat", label: "Chat", icon: <MessageSquare size={15} /> },
  { key: "tasks", label: "Tasks", icon: <CheckSquare size={15} /> },
  { key: "notes", label: "Notes", icon: <FileText size={15} /> },
  { key: "calendar", label: "Calendar", icon: <Calendar size={15} /> },
]

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<Tab>("chat")

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AdminTopbar title="Team" />

      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 pt-2 border-b border-[var(--color-border)] bg-[var(--color-bg)] shrink-0">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all ${
              activeTab === tab.key
                ? "border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-bg-secondary)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex flex-1 overflow-hidden">
        {activeTab === "chat" && <ChatTab />}
        {activeTab === "tasks" && <TasksTab />}
        {activeTab === "notes" && <NotesTab />}
        {activeTab === "calendar" && <CalendarTab />}
      </div>
    </div>
  )
}
