'use client'

import {
  useState, useEffect, useRef, useCallback,
  KeyboardEvent, ChangeEvent,
} from "react"
import {
  Hash, Plus, Lock, Send, X, SmilePlus, Reply,
  Loader2, Users, Settings, Mic, MicOff, Bold,
  Italic, Code, ChevronRight, Trash2, Edit2,
  MessageSquare, Search, Pin, Paperclip, FileText,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────

interface Channel {
  id: string
  name: string
  description: string
  isPrivate: boolean
  members: string[]
  createdAt: string
  createdBy?: string
}

interface ChatMessage {
  id: string
  channelId: string
  authorId: string
  authorName: string
  authorRole: string
  content: string
  mentions: string[]
  replyToId?: string
  replyTo?: { id: string; authorName: string; content: string } | null
  reactions: Record<string, string[]>
  type: "text" | "voice" | "file"
  attachmentUrl?: string
  attachmentDataUrl?: string
  attachmentName?: string
  attachmentType?: string
  createdAt: string
  editedAt?: string
  channelName?: string
}

interface Member {
  id: string
  name: string
  email: string
  role: string
}

interface DMConversation {
  id: string
  participants: string[]
  messages: ChatMessage[]
  unread: Record<string, number>
  lastMessage?: ChatMessage
  createdAt: string | Date
}

interface OnlineUser {
  adminId: string
  name: string
  lastSeen: string | Date
  status: "online" | "away" | "offline"
}

// ── Constants ─────────────────────────────────────────────────────

const EMOJI_REACTIONS = ["👍", "❤️", "😂", "😮", "🎉", "✅", "🔥", "💯"]
const LAST_READ_KEY = (channelId: string) => `kvl_chat_lastread_${channelId}`

// 40 common emojis for inline picker
const COMMON_EMOJIS = [
  "😀","😂","😍","🤔","😎","😢","😡","🤩",
  "👍","👎","❤️","💔","🔥","⭐","✅","❌",
  "🎉","🎊","🚀","💡","📌","📎","🔗","💬",
  "👋","🙏","💪","🤝","👀","🎯","💯","🏆",
  "😊","🤣","😅","😭","🙄","😴","🤯","🥳",
]

// ── Utilities ─────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(/[@._\s]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase() ?? "")
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

function timeAgo(dateStr: string): string {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (secs < 60) return "just now"
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
}

function renderContent(content: string, mentions: string[]): React.ReactNode {
  if (!content) return null
  const parts = content.split(/(@\w[\w.-]*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("@") && mentions.some(m => content.includes(part))) {
      return (
        <span key={i} className="px-1 rounded font-medium" style={{ background: "rgba(201,162,39,0.2)", color: "var(--color-gold)" }}>
          {part}
        </span>
      )
    }
    return part
  })
}

function highlightText(content: string, query: string): React.ReactNode {
  if (!query) return content
  const parts = content.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="rounded px-0.5" style={{ background: "rgba(201,162,39,0.35)", color: "var(--color-gold)" }}>{part}</mark>
      : part
  )
}

// ── Avatar ────────────────────────────────────────────────────────

function Avatar({ name, size = 32, online }: { name: string; size?: number; online?: boolean }) {
  return (
    <div className="relative shrink-0">
      <div
        className="rounded-full flex items-center justify-center text-white font-bold select-none"
        style={{
          width: size, height: size,
          background: getAvatarColor(name),
          fontSize: Math.round(size * 0.35),
        }}
      >
        {getInitials(name)}
      </div>
      {online !== undefined && (
        <div
          className="absolute bottom-0 right-0 rounded-full border-2"
          style={{
            width: Math.max(8, Math.round(size * 0.28)),
            height: Math.max(8, Math.round(size * 0.28)),
            background: online ? "#22c55e" : "#6b7280",
            borderColor: "var(--color-navy)",
          }}
        />
      )}
    </div>
  )
}

// ── Unread tracker ────────────────────────────────────────────────

function getLastRead(channelId: string): number {
  if (typeof window === "undefined") return 0
  return Number(localStorage.getItem(LAST_READ_KEY(channelId)) ?? "0")
}

function setLastRead(channelId: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(LAST_READ_KEY(channelId), String(Date.now()))
}

// ── Voice Recorder Hook ───────────────────────────────────────────

function useVoiceRecorder() {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [supported, setSupported] = useState(true)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && !window.MediaRecorder) {
      setSupported(false)
    }
  }, [])

  const start = useCallback(async () => {
    if (!supported || recording) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" })
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.start(100)
      mediaRef.current = mr
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } catch {
      setSupported(false)
    }
  }, [supported, recording])

  const stop = useCallback((): Promise<{ blob: Blob; duration: number }> => {
    return new Promise(resolve => {
      const mr = mediaRef.current
      if (!mr) return resolve({ blob: new Blob(), duration: 0 })
      const dur = seconds
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        mr.stream.getTracks().forEach(t => t.stop())
        resolve({ blob, duration: dur })
      }
      mr.stop()
      if (timerRef.current) clearInterval(timerRef.current)
      setRecording(false)
      setSeconds(0)
    })
  }, [seconds])

  return { recording, seconds, supported, start, stop }
}

// ── New Channel Modal ─────────────────────────────────────────────

function NewChannelModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (data: { name: string; description: string; isPrivate: boolean }) => Promise<void>
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
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Description</label>
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

// ── New DM Modal ──────────────────────────────────────────────────

function NewDMModal({
  members,
  currentAdminId,
  onlineUsers,
  onClose,
  onSelect,
}: {
  members: Member[]
  currentAdminId: string
  onlineUsers: OnlineUser[]
  onClose: () => void
  onSelect: (member: Member) => void
}) {
  const [search, setSearch] = useState("")
  const others = members.filter(m => m.id !== currentAdminId)
  const filtered = others.filter(
    m => m.name.toLowerCase().includes(search.toLowerCase()) ||
         m.email.toLowerCase().includes(search.toLowerCase())
  )

  const isOnline = (id: string) => onlineUsers.some(u => u.adminId === id && u.status === "online")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl w-full max-w-sm p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[var(--color-text)] text-sm">New Direct Message</h3>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <X size={16} />
          </button>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search team members..."
          autoFocus
          className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] mb-3"
        />
        <div className="space-y-0.5 max-h-64 overflow-y-auto">
          {filtered.length === 0
            ? <p className="text-xs text-[var(--color-text-muted)] text-center py-4">No members found</p>
            : filtered.map(m => (
              <button
                key={m.id}
                onClick={() => onSelect(m)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors text-left"
              >
                <Avatar name={m.name} size={28} online={isOnline(m.id)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{m.name}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] truncate capitalize">{m.role}</p>
                </div>
              </button>
            ))
          }
        </div>
      </div>
    </div>
  )
}

// ── Reaction Emoji Picker (for message reactions) ─────────────────

function EmojiPicker({ onPick, onClose }: { onPick: (emoji: string) => void; onClose: () => void }) {
  return (
    <div className="absolute z-30 right-0 bottom-full mb-1 flex gap-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-2 py-1.5 shadow-lg">
      {EMOJI_REACTIONS.map(emoji => (
        <button
          key={emoji}
          onClick={() => { onPick(emoji); onClose() }}
          className="text-lg hover:scale-125 transition-transform"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

// ── Inline Emoji Picker (for message input) ───────────────────────

function InlineEmojiPicker({
  onPick,
  onClose,
}: {
  onPick: (emoji: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const keyHandler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", handler)
    document.addEventListener("keydown", keyHandler)
    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("keydown", keyHandler)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute bottom-full mb-2 left-0 z-30 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2 shadow-xl"
      style={{ width: 260 }}
    >
      <div className="grid grid-cols-8 gap-0.5">
        {COMMON_EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={() => { onPick(emoji); onClose() }}
            className="text-xl h-8 w-8 flex items-center justify-center rounded hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Image Lightbox ────────────────────────────────────────────────

function ImageLightbox({ src, name, onClose }: { src: string; name?: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] p-2" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <X size={14} />
        </button>
        <img src={src} alt={name ?? "attachment"} className="max-w-full max-h-[85vh] rounded-xl object-contain" />
        {name && <p className="text-center text-xs text-white/60 mt-2">{name}</p>}
      </div>
    </div>
  )
}

// ── File Attachment Renderer ──────────────────────────────────────

function FileAttachment({ msg }: { msg: ChatMessage }) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  if (!msg.attachmentDataUrl) return null
  const isImage = msg.attachmentType?.startsWith("image/") ?? false
  const isPDF = msg.attachmentType === "application/pdf"

  return (
    <>
      {isImage && (
        <div className="mt-1.5">
          <img
            src={msg.attachmentDataUrl}
            alt={msg.attachmentName ?? "image"}
            className="rounded-lg cursor-zoom-in object-contain border border-[var(--color-border)]"
            style={{ maxWidth: 300, maxHeight: 200 }}
            onClick={() => setLightboxSrc(msg.attachmentDataUrl!)}
          />
          {msg.attachmentName && (
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{msg.attachmentName}</p>
          )}
        </div>
      )}
      {isPDF && (
        <a
          href={msg.attachmentDataUrl}
          download={msg.attachmentName ?? "document.pdf"}
          className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors"
        >
          <FileText size={13} className="text-red-400" />
          {msg.attachmentName ?? "document.pdf"}
        </a>
      )}
      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          name={msg.attachmentName}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </>
  )
}

// ── Message Bubble ────────────────────────────────────────────────

function MessageBubble({
  msg,
  currentAdminId,
  onReact,
  onReply,
  onEdit,
  onDelete,
  onThreadOpen,
  onPin,
  threadCount,
}: {
  msg: ChatMessage
  currentAdminId: string
  onReact: (msgId: string, emoji: string) => void
  onReply: (msg: ChatMessage) => void
  onEdit: (msg: ChatMessage) => void
  onDelete: (msg: ChatMessage) => void
  onThreadOpen: (msg: ChatMessage) => void
  onPin: (msg: ChatMessage) => void
  threadCount: number
}) {
  const [showEmoji, setShowEmoji] = useState(false)

  const totalReactions = Object.values(msg.reactions).reduce((s, u) => s + u.length, 0)

  return (
    <div
      className="group flex items-start gap-3 px-4 py-2 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors relative"
      onMouseLeave={() => setShowEmoji(false)}
    >
      <Avatar name={msg.authorName} size={34} />
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
          <span className="text-sm font-semibold text-[var(--color-text)]">{msg.authorName}</span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-muted)] capitalize">
            {msg.authorRole}
          </span>
          <span className="text-[11px] text-[var(--color-text-muted)]">{timeAgo(msg.createdAt)}</span>
          {msg.editedAt && <span className="text-[10px] text-[var(--color-text-muted)] italic">(edited)</span>}
        </div>

        {/* Reply preview */}
        {msg.replyTo && (
          <div className="mb-1.5 pl-3 border-l-2 border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
            <span className="font-medium text-[var(--color-text)]">{msg.replyTo.authorName}: </span>
            {msg.replyTo.content.slice(0, 80)}{msg.replyTo.content.length > 80 ? "..." : ""}
          </div>
        )}

        {/* Voice message */}
        {msg.type === "voice" && msg.attachmentUrl ? (
          <div className="flex items-center gap-2 mt-1 mb-1">
            <audio controls src={msg.attachmentUrl} className="h-8 max-w-xs" />
            {msg.content && msg.content !== "Voice message" && (
              <span className="text-xs text-[var(--color-text-muted)] italic">{msg.content}</span>
            )}
          </div>
        ) : msg.type === "file" ? (
          <>
            {msg.content && (
              <p className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap break-words">
                {msg.content}
              </p>
            )}
            <FileAttachment msg={msg} />
          </>
        ) : (
          <p className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap break-words">
            {renderContent(msg.content, msg.mentions)}
          </p>
        )}

        {/* Reactions */}
        {totalReactions > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {Object.entries(msg.reactions).map(([emoji, users]) => (
              users.length > 0 && (
                <button
                  key={emoji}
                  onClick={() => onReact(msg.id, emoji)}
                  title={users.join(", ")}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                    users.includes(currentAdminId)
                      ? "bg-[var(--color-gold)]/20 border-[var(--color-gold)] text-[var(--color-gold)]"
                      : "bg-[var(--color-bg-secondary)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)]"
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{users.length}</span>
                </button>
              )
            ))}
          </div>
        )}

        {/* Thread indicator */}
        {threadCount > 0 && (
          <button
            onClick={() => onThreadOpen(msg)}
            className="flex items-center gap-1.5 mt-1.5 text-xs text-[var(--color-gold)] hover:underline"
          >
            <ChevronRight size={12} />
            {threadCount} {threadCount === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {/* Hover action bar */}
      <div className="absolute right-4 top-2 hidden group-hover:flex items-center gap-0.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg shadow-sm px-1 py-0.5 z-10">
        {/* React */}
        <div className="relative">
          <button
            onClick={() => setShowEmoji(v => !v)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            title="React"
          >
            <SmilePlus size={13} />
          </button>
          {showEmoji && (
            <EmojiPicker
              onPick={emoji => onReact(msg.id, emoji)}
              onClose={() => setShowEmoji(false)}
            />
          )}
        </div>
        {/* Reply */}
        <button
          onClick={() => onReply(msg)}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          title="Reply"
        >
          <Reply size={13} />
        </button>
        {/* Thread */}
        <button
          onClick={() => onThreadOpen(msg)}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          title="Open thread"
        >
          <ChevronRight size={13} />
        </button>
        {/* Pin */}
        <button
          onClick={() => onPin(msg)}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors"
          title="Pin message"
        >
          <Pin size={13} />
        </button>
        {/* Edit (own only) */}
        {msg.authorId === currentAdminId && (
          <button
            onClick={() => onEdit(msg)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            title="Edit"
          >
            <Edit2 size={13} />
          </button>
        )}
        {/* Delete (own only) */}
        {msg.authorId === currentAdminId && (
          <button
            onClick={() => onDelete(msg)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Mention Dropdown ──────────────────────────────────────────────

function MentionDropdown({
  query,
  members,
  onSelect,
}: {
  query: string
  members: Member[]
  onSelect: (name: string) => void
}) {
  const filtered = members.filter(
    m => m.name.toLowerCase().includes(query.toLowerCase()) ||
         m.email.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8)

  if (filtered.length === 0) return null

  return (
    <div className="absolute bottom-full left-0 mb-1 w-56 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-xl z-20 overflow-hidden">
      {filtered.map(m => (
        <button
          key={m.id}
          onClick={() => onSelect(m.name)}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-bg-secondary)] transition-colors text-left"
        >
          <Avatar name={m.name} size={22} />
          <div className="min-w-0">
            <p className="text-xs font-medium text-[var(--color-text)] truncate">{m.name}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] truncate capitalize">{m.role}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

// ── Message Input ─────────────────────────────────────────────────

function MessageInput({
  channelName,
  replyTo,
  members,
  onSend,
  onSendVoice,
  onSendFile,
  onCancelReply,
  onTyping,
  isDM = false,
}: {
  channelName: string
  replyTo: ChatMessage | null
  members: Member[]
  onSend: (content: string, mentions: string[], replyToId?: string) => Promise<void>
  onSendVoice: (blob: Blob, duration: number) => Promise<void>
  onSendFile?: (file: File) => Promise<void>
  onCancelReply: () => void
  onTyping?: () => void
  isDM?: boolean
}) {
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionStart, setMentionStart] = useState(-1)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { recording, seconds, supported, start, stop } = useVoiceRecorder()

  const adjustHeight = () => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 4 * 24) + "px"
  }

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setText(val)
    adjustHeight()
    onTyping?.()

    if (!isDM) {
      const cursor = e.target.selectionStart
      const before = val.slice(0, cursor)
      const match = before.match(/@(\w*)$/)
      if (match) {
        setMentionQuery(match[1])
        setMentionStart(cursor - match[0].length)
      } else {
        setMentionQuery(null)
      }
    }
  }

  const insertMention = (name: string) => {
    const before = text.slice(0, mentionStart)
    const after = text.slice(textareaRef.current?.selectionStart ?? mentionStart)
    const newText = `${before}@${name} ${after}`
    setText(newText)
    setMentionQuery(null)
    setTimeout(() => {
      textareaRef.current?.focus()
      const pos = before.length + name.length + 2
      textareaRef.current?.setSelectionRange(pos, pos)
    }, 10)
  }

  const insertEmoji = (emoji: string) => {
    const ta = textareaRef.current
    if (!ta) {
      setText(prev => prev + emoji)
      return
    }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const before = text.slice(0, start)
    const after = text.slice(end)
    const newText = before + emoji + after
    setText(newText)
    setTimeout(() => {
      ta.focus()
      const pos = start + emoji.length
      ta.setSelectionRange(pos, pos)
    }, 10)
  }

  const extractMentions = (content: string): string[] => {
    const matches = content.match(/@\w[\w.-]*/g) ?? []
    return matches.map(m => m.slice(1))
  }

  const handleSend = async () => {
    if (!text.trim() || sending) return
    const content = text.trim()
    setText("")
    adjustHeight()
    setSending(true)
    try {
      const mentions = isDM ? [] : extractMentions(content)
      await onSend(content, mentions, replyTo?.id)
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (mentionQuery !== null) return
      handleSend()
    }
    if (e.key === "Escape") {
      if (mentionQuery !== null) setMentionQuery(null)
      else if (showEmojiPicker) setShowEmojiPicker(false)
    }
  }

  const handleVoice = async () => {
    if (recording) {
      const { blob, duration } = await stop()
      if (blob.size > 0) {
        setSending(true)
        try { await onSendVoice(blob, duration) } finally { setSending(false) }
      }
    } else {
      await start()
    }
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onSendFile) return
    // Size validation
    const isImage = file.type.startsWith("image/")
    const isPDF = file.type === "application/pdf"
    if (isImage && file.size > 2 * 1024 * 1024) {
      alert("Image files must be under 2MB")
      e.target.value = ""
      return
    }
    if (isPDF && file.size > 5 * 1024 * 1024) {
      alert("PDF files must be under 5MB")
      e.target.value = ""
      return
    }
    if (!isImage && !isPDF) {
      alert("Only images (JPG, PNG, GIF, WebP) and PDFs are supported")
      e.target.value = ""
      return
    }
    setSending(true)
    try {
      await onSendFile(file)
    } finally {
      setSending(false)
      e.target.value = ""
    }
  }

  const wrapText = (prefix: string, suffix: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = text.slice(start, end)
    const before = text.slice(0, start)
    const after = text.slice(end)
    setText(before + prefix + selected + suffix + after)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 10)
  }

  return (
    <div className="px-4 pb-4 pt-2 shrink-0">
      {/* Reply indicator */}
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs">
          <Reply size={12} className="text-[var(--color-text-muted)] shrink-0" />
          <span className="text-[var(--color-text-muted)] truncate">
            Replying to <span className="font-medium text-[var(--color-text)]">{replyTo.authorName}</span>
            {": "}{replyTo.content.slice(0, 60)}{replyTo.content.length > 60 ? "..." : ""}
          </span>
          <button onClick={onCancelReply} className="ml-auto text-[var(--color-text-muted)] hover:text-[var(--color-text)] shrink-0">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Recording indicator */}
      {recording && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Recording... {seconds}s — click mic to stop
        </div>
      )}

      {/* Input container */}
      <div className="border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-secondary)] overflow-hidden">
        {/* Toolbar */}
        {!isDM && (
          <div className="flex items-center gap-0.5 px-2 pt-1.5">
            <button onClick={() => wrapText("**", "**")} className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors" title="Bold">
              <Bold size={12} />
            </button>
            <button onClick={() => wrapText("_", "_")} className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors" title="Italic">
              <Italic size={12} />
            </button>
            <button onClick={() => wrapText("`", "`")} className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors" title="Code">
              <Code size={12} />
            </button>
          </div>
        )}

        {/* Textarea */}
        <div className="relative px-3 pt-1 pb-2">
          {mentionQuery !== null && !isDM && (
            <MentionDropdown
              query={mentionQuery}
              members={members}
              onSelect={name => insertMention(name)}
            />
          )}
          {showEmojiPicker && (
            <InlineEmojiPicker
              onPick={emoji => insertEmoji(emoji)}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={isDM ? "Write a message..." : `Message #${channelName}`}
            rows={1}
            className="w-full bg-transparent text-sm text-[var(--color-text)] outline-none resize-none placeholder:text-[var(--color-text-muted)]"
            style={{ minHeight: 24, maxHeight: 96 }}
          />
        </div>

        {/* Bottom bar */}
        <div className="flex items-center gap-2 px-3 pb-2">
          {/* Emoji button */}
          <button
            onClick={() => setShowEmojiPicker(v => !v)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors"
            title="Insert emoji"
          >
            <SmilePlus size={14} />
          </button>

          {/* File attachment button */}
          {onSendFile && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors"
                title="Attach file"
              >
                <Paperclip size={14} />
              </button>
            </>
          )}

          {/* Voice button */}
          {supported ? (
            <button
              onClick={handleVoice}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                recording
                  ? "bg-red-500 text-white"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]"
              }`}
              title={recording ? "Stop recording" : "Record voice message"}
            >
              {recording ? <MicOff size={13} /> : <Mic size={13} />}
            </button>
          ) : (
            <span className="text-[10px] text-[var(--color-text-muted)]">Voice not supported</span>
          )}

          <div className="flex-1" />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-navy)] text-white text-xs font-medium transition-all hover:opacity-90 disabled:opacity-40"
          >
            {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            Send
          </button>
        </div>
      </div>
      <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5 ml-1">
        Enter to send · Shift+Enter for new line{!isDM ? " · @ to mention" : ""}
      </p>
    </div>
  )
}

// ── Pinned Messages Panel ─────────────────────────────────────────

function PinnedMessagesPanel({
  pinned,
  onUnpin,
  onClose,
}: {
  pinned: ChatMessage[]
  onUnpin: (msgId: string) => void
  onClose: () => void
}) {
  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-gold)]">
          <Pin size={12} />
          {pinned.length} Pinned {pinned.length === 1 ? "Message" : "Messages"}
        </div>
        <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          <X size={14} />
        </button>
      </div>
      <div className="max-h-40 overflow-y-auto px-4 pb-2 space-y-1.5">
        {pinned.map(msg => (
          <div key={msg.id} className="flex items-start gap-2 group">
            <Avatar name={msg.authorName} size={20} />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-text)]">{msg.authorName}: </span>
              <span className="text-xs text-[var(--color-text-muted)] truncate">
                {msg.type === "file" ? `[File: ${msg.attachmentName ?? "attachment"}]` : msg.content.slice(0, 100)}
              </span>
            </div>
            <button
              onClick={() => onUnpin(msg.id)}
              className="opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-red-500 transition-all shrink-0"
              title="Unpin"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Search Results Panel ──────────────────────────────────────────

function SearchResultsPanel({
  results,
  query,
  loading,
  onSelectResult,
}: {
  results: ChatMessage[]
  query: string
  loading: boolean
  onSelectResult: (msg: ChatMessage) => void
}) {
  return (
    <div className="flex-1 overflow-y-auto py-3 px-4">
      {loading ? (
        <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm py-8 justify-center">
          <Loader2 size={16} className="animate-spin" /> Searching...
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-8 text-[var(--color-text-muted)] text-sm">
          {query.length >= 2 ? "No results found" : "Type at least 2 characters to search"}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-[var(--color-text-muted)] mb-3">{results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;</p>
          {results.map(msg => (
            <button
              key={msg.id}
              onClick={() => onSelectResult(msg)}
              className="w-full text-left flex items-start gap-3 p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors"
            >
              <Avatar name={msg.authorName} size={30} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-semibold text-[var(--color-text)]">{msg.authorName}</span>
                  {msg.channelName && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                      #{msg.channelName}
                    </span>
                  )}
                  <span className="text-[11px] text-[var(--color-text-muted)]">{timeAgo(msg.createdAt)}</span>
                </div>
                <p className="text-xs text-[var(--color-text)] leading-relaxed line-clamp-2">
                  {highlightText(msg.content, query)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Thread Panel ──────────────────────────────────────────────────

function ThreadPanel({
  parentMsg,
  messages,
  members,
  currentAdminId,
  onClose,
  onReact,
  onSendReply,
}: {
  parentMsg: ChatMessage
  messages: ChatMessage[]
  members: Member[]
  currentAdminId: string
  onClose: () => void
  onReact: (msgId: string, emoji: string) => void
  onSendReply: (content: string, mentions: string[]) => Promise<void>
}) {
  const replies = messages.filter(m => m.replyToId === parentMsg.id)

  return (
    <div className="w-80 shrink-0 border-l border-[var(--color-border)] flex flex-col bg-[var(--color-bg)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <h3 className="text-sm font-bold text-[var(--color-text)]">Thread</h3>
        <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          <X size={16} />
        </button>
      </div>

      {/* Parent message */}
      <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="flex items-center gap-2 mb-1">
          <Avatar name={parentMsg.authorName} size={20} />
          <span className="text-xs font-semibold text-[var(--color-text)]">{parentMsg.authorName}</span>
          <span className="text-[10px] text-[var(--color-text-muted)]">{timeAgo(parentMsg.createdAt)}</span>
        </div>
        <p className="text-xs text-[var(--color-text)] leading-relaxed">{parentMsg.content}</p>
      </div>

      {/* Replies */}
      <div className="flex-1 overflow-y-auto py-2">
        {replies.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] text-center py-6">No replies yet.</p>
        ) : (
          replies.map(r => (
            <div key={r.id} className="flex items-start gap-2 px-4 py-2 hover:bg-[var(--color-bg-secondary)] transition-colors group">
              <Avatar name={r.authorName} size={24} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <span className="text-xs font-semibold text-[var(--color-text)]">{r.authorName}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{timeAgo(r.createdAt)}</span>
                </div>
                <p className="text-xs text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">{r.content}</p>
                {Object.values(r.reactions).some(u => u.length > 0) && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(r.reactions).map(([emoji, users]) =>
                      users.length > 0 ? (
                        <button
                          key={emoji}
                          onClick={() => onReact(r.id, emoji)}
                          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border transition-colors ${
                            users.includes(currentAdminId)
                              ? "bg-[var(--color-gold)]/20 border-[var(--color-gold)] text-[var(--color-gold)]"
                              : "bg-[var(--color-bg-secondary)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                          }`}
                        >
                          {emoji} {users.length}
                        </button>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply input */}
      <div className="border-t border-[var(--color-border)]">
        <MessageInput
          channelName="thread"
          replyTo={null}
          members={members}
          onSend={onSendReply}
          onSendVoice={async () => {}}
          onCancelReply={() => {}}
          isDM
        />
      </div>
    </div>
  )
}

// ── DM Panel ──────────────────────────────────────────────────────

function DMPanel({
  dmConv,
  recipientName,
  recipientId,
  currentAdminId,
  onlineUsers,
  onClose,
  onSend,
  onSendFile,
}: {
  dmConv: DMConversation | null
  recipientName: string
  recipientId: string
  currentAdminId: string
  onlineUsers: OnlineUser[]
  onClose: () => void
  onSend: (content: string, replyToId?: string) => Promise<void>
  onSendFile: (file: File) => Promise<void>
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)

  const isOnline = onlineUsers.some(u => u.adminId === recipientId && u.status === "online")

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [dmConv?.messages.length])

  const messages = dmConv?.messages ?? []

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--color-bg)]">
      {/* DM Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--color-border)] shrink-0">
        <Avatar name={recipientName} size={32} online={isOnline} />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[var(--color-text)] text-sm">{recipientName}</h3>
          <p className="text-xs text-[var(--color-text-muted)]">{isOnline ? "Online" : "Offline"}</p>
        </div>
        <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: getAvatarColor(recipientName) }}>
              <span className="text-white font-bold">{getInitials(recipientName)}</span>
            </div>
            <p className="font-semibold text-[var(--color-text)] text-sm">Direct message with {recipientName}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Send a message to start the conversation.</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {messages.map(msg => (
              <div
                key={msg.id}
                className="flex items-start gap-3 px-4 py-2 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors group"
              >
                <Avatar name={msg.authorName} size={30} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[var(--color-text)]">{msg.authorName}</span>
                    <span className="text-[11px] text-[var(--color-text-muted)]">{timeAgo(msg.createdAt)}</span>
                    {msg.editedAt && <span className="text-[10px] text-[var(--color-text-muted)] italic">(edited)</span>}
                  </div>
                  {msg.replyTo && (
                    <div className="mb-1 pl-2 border-l-2 border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
                      <span className="font-medium text-[var(--color-text)]">{msg.replyTo.authorName}: </span>
                      {msg.replyTo.content.slice(0, 60)}
                    </div>
                  )}
                  {msg.type === "file" ? (
                    <>
                      {msg.content && <p className="text-sm text-[var(--color-text)] leading-relaxed">{msg.content}</p>}
                      <FileAttachment msg={msg} />
                    </>
                  ) : (
                    <p className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                  )}
                </div>
                <div className="hidden group-hover:flex items-center gap-0.5">
                  <button
                    onClick={() => setReplyTo(msg)}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                    title="Reply"
                  >
                    <Reply size={11} />
                  </button>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <MessageInput
        channelName={recipientName}
        replyTo={replyTo}
        members={[]}
        onSend={async (content, _mentions, replyToId) => {
          await onSend(content, replyToId)
          setReplyTo(null)
        }}
        onSendVoice={async () => {}}
        onSendFile={onSendFile}
        onCancelReply={() => setReplyTo(null)}
        isDM
      />
    </div>
  )
}

// ── Main TeamChat Component ───────────────────────────────────────

export default function TeamChat() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loadingChannels, setLoadingChannels] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const [threadParent, setThreadParent] = useState<ChatMessage | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null)
  const [editContent, setEditContent] = useState("")
  const [currentAdminId, setCurrentAdminId] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  // DM state
  const [dmConversations, setDmConversations] = useState<DMConversation[]>([])
  const [activeDM, setActiveDM] = useState<{ member: Member; conv: DMConversation | null } | null>(null)
  const [showNewDM, setShowNewDM] = useState(false)

  // Pinned messages
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessage[]>([])
  const [showPinned, setShowPinned] = useState(false)

  // Search
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // Online presence
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])

  // Typing indicators
  const [typingUsers, setTypingUsers] = useState<Record<string, { name: string; ts: number }>>({})
  const typingDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // ── Presence setup ────────────────────────────────────────────

  const postPresence = useCallback(async (status: "online" | "away" | "offline") => {
    try {
      await fetch("/api/admin/chat/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      })
    } catch { /* silent */ }
  }, [])

  const loadPresence = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/chat/presence", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setOnlineUsers(data.users ?? [])
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    postPresence("online")
    loadPresence()

    const handleVisibility = () => {
      if (document.hidden) postPresence("away")
      else postPresence("online")
    }
    const handleBeforeUnload = () => postPresence("offline")

    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("beforeunload", handleBeforeUnload)

    // Heartbeat every 2 minutes
    const presenceInterval = setInterval(() => {
      if (!document.hidden) postPresence("online")
    }, 2 * 60 * 1000)

    // Poll presence every 30s
    const presencePollInterval = setInterval(loadPresence, 30_000)

    return () => {
      postPresence("offline")
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      clearInterval(presenceInterval)
      clearInterval(presencePollInterval)
    }
  }, [postPresence, loadPresence])

  // ── Load channels & members ───────────────────────────────────

  const loadChannels = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/chat/channels", { credentials: "include" })
      if (!res.ok) return
      const data = await res.json()
      setChannels(data.channels ?? [])
    } finally {
      setLoadingChannels(false)
    }
  }, [])

  const loadMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/chat/members", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members ?? [])
      }
    } catch { /* ignore */ }
  }, [])

  const loadDMs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/chat/dm?list=true", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setDmConversations(data.conversations ?? [])
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    loadChannels()
    loadMembers()
    loadDMs()
  }, [loadChannels, loadMembers, loadDMs])

  // Auto-select first channel
  useEffect(() => {
    if (channels.length > 0 && !activeChannel && !activeDM) {
      setActiveChannel(channels[0])
    }
  }, [channels, activeChannel, activeDM])

  // ── Load messages ─────────────────────────────────────────────

  const loadMessages = useCallback(async (channel: Channel, cursor?: string, prepend = false) => {
    if (!cursor) setLoadingMessages(true)
    try {
      const params = new URLSearchParams({ channelId: channel.id, limit: "50" })
      if (cursor) params.set("before", cursor)
      const res = await fetch(`/api/admin/chat/messages?${params}`, { credentials: "include" })
      if (!res.ok) return
      const data = await res.json()
      const msgs: ChatMessage[] = data.messages ?? []
      if (prepend) {
        setMessages(prev => [...msgs, ...prev])
      } else {
        setMessages(msgs)
        setLastRead(channel.id)
        setUnreadCounts(prev => ({ ...prev, [channel.id]: 0 }))
      }
      setNextCursor(data.nextCursor ?? null)
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    if (!activeChannel) return
    setMessages([])
    setNextCursor(null)
    setReplyTo(null)
    setThreadParent(null)
    loadMessages(activeChannel)
    // Load pinned messages for channel
    loadPinned(activeChannel.id)
  }, [activeChannel, loadMessages])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!showSearch) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages.length, showSearch])

  // ── Load pinned messages ──────────────────────────────────────

  const loadPinned = async (channelId: string) => {
    try {
      const res = await fetch(`/api/admin/chat/pins?channelId=${channelId}`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setPinnedMessages(data.pinned ?? [])
      }
    } catch { /* silent */ }
  }

  // ── Polling ───────────────────────────────────────────────────

  useEffect(() => {
    if (!activeChannel) return
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const params = new URLSearchParams({ channelId: activeChannel.id, limit: "50" })
        const res = await fetch(`/api/admin/chat/messages?${params}`, { credentials: "include" })
        if (!res.ok) return
        const data = await res.json()
        const newMsgs: ChatMessage[] = data.messages ?? []
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id))
          const added = newMsgs.filter(m => !existingIds.has(m.id))
          if (added.length === 0) return prev
          return [...prev, ...added]
        })
      } catch { /* silent */ }
    }, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [activeChannel])

  // ── WebSocket integration ─────────────────────────────────────

  useEffect(() => {
    if (typeof window === "undefined") return
    const handler = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === "new_message") {
          const msg: ChatMessage = data.message
          if (msg.channelId === activeChannel?.id) {
            setMessages(prev => {
              if (prev.some(m => m.id === msg.id)) return prev
              return [...prev, msg]
            })
          } else {
            const lastRead = getLastRead(msg.channelId)
            const msgTime = new Date(msg.createdAt).getTime()
            if (msgTime > lastRead) {
              setUnreadCounts(prev => ({
                ...prev,
                [msg.channelId]: (prev[msg.channelId] ?? 0) + 1,
              }))
            }
          }
        } else if (data.type === "reaction" && data.channelId === activeChannel?.id) {
          setMessages(prev =>
            prev.map(m => m.id === data.messageId ? { ...m, reactions: data.reactions } : m)
          )
        } else if (data.type === "message_edited" && data.channelId === activeChannel?.id) {
          setMessages(prev =>
            prev.map(m => m.id === data.message?.id ? { ...m, ...data.message } : m)
          )
        } else if (data.type === "message_deleted" && data.channelId === activeChannel?.id) {
          setMessages(prev => prev.filter(m => m.id !== data.messageId))
        } else if (data.type === "message_pinned" && data.channelId === activeChannel?.id) {
          setPinnedMessages(prev => {
            if (prev.some(m => m.id === data.message?.id)) return prev
            return [...prev, data.message]
          })
        } else if (data.type === "message_unpinned" && data.channelId === activeChannel?.id) {
          setPinnedMessages(prev => prev.filter(m => m.id !== data.messageId))
        } else if (data.type === "dm") {
          // New DM received
          setDmConversations(prev => {
            const idx = prev.findIndex(c => c.id === data.dmId)
            if (idx === -1) {
              loadDMs()
              return prev
            }
            const updated = [...prev]
            const conv = { ...updated[idx] }
            conv.messages = [...(conv.messages ?? []), data.message]
            conv.lastMessage = data.message
            if (activeDM?.conv?.id === data.dmId) {
              // If active DM, don't increment unread
            } else {
              conv.unread = { ...conv.unread, [currentAdminId]: (conv.unread[currentAdminId] ?? 0) + 1 }
            }
            updated[idx] = conv
            if (activeDM?.conv?.id === data.dmId) {
              setActiveDM(prev2 => prev2 ? { ...prev2, conv } : null)
            }
            return updated
          })
        } else if (data.type === "presence") {
          setOnlineUsers(prev => {
            const existing = prev.findIndex(u => u.adminId === data.adminId)
            const updated: OnlineUser = {
              adminId: data.adminId,
              name: data.adminName,
              lastSeen: new Date(),
              status: data.status,
            }
            if (existing === -1) return [...prev, updated]
            const next = [...prev]
            next[existing] = updated
            return next
          })
        } else if (data.type === "typing" && data.channelId === activeChannel?.id) {
          if (data.adminId !== currentAdminId) {
            setTypingUsers(prev => ({
              ...prev,
              [data.adminId]: { name: data.adminName, ts: Date.now() },
            }))
            // Auto-clear after 3s
            setTimeout(() => {
              setTypingUsers(prev => {
                const next = { ...prev }
                if (next[data.adminId]?.ts && Date.now() - next[data.adminId].ts >= 3000) {
                  delete next[data.adminId]
                }
                return next
              })
            }, 3100)
          }
        }
      } catch { /* ignore parse errors */ }
    }
    const ws = (window as unknown as { __kvlWs?: WebSocket }).__kvlWs
    if (ws) ws.addEventListener("message", handler)
    return () => { if (ws) ws.removeEventListener("message", handler) }
  }, [activeChannel, activeDM, currentAdminId, loadDMs])

  // ── Keyboard shortcuts ────────────────────────────────────────

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.altKey && e.key === "k") {
        e.preventDefault()
        setShowSearch(v => !v)
      }
      if (e.key === "Escape") {
        if (showSearch) { setShowSearch(false); setSearchQuery(""); setSearchResults([]) }
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [showSearch])

  // ── Typing indicator ──────────────────────────────────────────

  const handleTyping = useCallback(() => {
    if (!activeChannel) return
    if (typingDebounceRef.current) return // still in debounce window
    const ws = (window as unknown as { __kvlWs?: WebSocket }).__kvlWs
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: "typing",
        channelId: activeChannel.id,
        adminId: currentAdminId,
        adminName: members.find(m => m.id === currentAdminId)?.name ?? "Someone",
      }))
    }
    typingDebounceRef.current = setTimeout(() => {
      typingDebounceRef.current = null
    }, 3000)
  }, [activeChannel, currentAdminId, members])

  // ── Search ────────────────────────────────────────────────────

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }
    setSearchLoading(true)
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: searchQuery.trim() })
        if (activeChannel) params.set("channelId", activeChannel.id)
        const res = await fetch(`/api/admin/chat/search?${params}`, { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.results ?? [])
        }
      } catch { /* silent */ }
      setSearchLoading(false)
    }, 300)
  }, [searchQuery, activeChannel])

  // ── Channel switch ────────────────────────────────────────────

  const switchChannel = (channel: Channel) => {
    setActiveChannel(channel)
    setActiveDM(null)
    setLastRead(channel.id)
    setUnreadCounts(prev => ({ ...prev, [channel.id]: 0 }))
    setShowSearch(false)
    setSearchQuery("")
    setSearchResults([])
    setShowPinned(false)
  }

  // ── Open DM ───────────────────────────────────────────────────

  const openDM = async (member: Member) => {
    setShowNewDM(false)
    setActiveChannel(null)
    setShowSearch(false)
    try {
      const res = await fetch(`/api/admin/chat/dm?withUserId=${member.id}`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        // Mark as read
        await fetch("/api/admin/chat/dm", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ dmId: data.dmId }),
        })
        const conv: DMConversation = {
          id: data.dmId,
          participants: [currentAdminId, member.id],
          messages: data.messages ?? [],
          unread: {},
          createdAt: new Date(),
        }
        setActiveDM({ member, conv })
        // Update DM list
        loadDMs()
      }
    } catch { /* silent */ }
  }

  // ── Send message ──────────────────────────────────────────────

  const handleSend = async (content: string, mentions: string[], replyToId?: string) => {
    if (!activeChannel) return
    const res = await fetch("/api/admin/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ channelId: activeChannel.id, content, mentions, replyToId }),
    })
    if (res.ok) {
      const data = await res.json()
      const msg: ChatMessage = data.message
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
      if (!currentAdminId) setCurrentAdminId(msg.authorId)
      setReplyTo(null)
    }
  }

  // ── Send file ─────────────────────────────────────────────────

  const handleSendFile = async (file: File, channelId?: string) => {
    const reader = new FileReader()
    return new Promise<void>((resolve, reject) => {
      reader.onloadend = async () => {
        const dataUrl = reader.result as string
        try {
          const res = await fetch("/api/admin/chat/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              channelId: channelId ?? activeChannel?.id,
              content: "",
              type: "file",
              attachmentDataUrl: dataUrl,
              attachmentName: file.name,
              attachmentType: file.type,
            }),
          })
          if (res.ok) {
            const data = await res.json()
            const msg: ChatMessage = data.message
            setMessages(prev => {
              if (prev.some(m => m.id === msg.id)) return prev
              return [...prev, msg]
            })
          }
          resolve()
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error("File read error"))
      reader.readAsDataURL(file)
    })
  }

  // ── Send DM ───────────────────────────────────────────────────

  const handleSendDM = async (content: string, replyToId?: string) => {
    if (!activeDM) return
    const res = await fetch("/api/admin/chat/dm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ toAdminId: activeDM.member.id, content, replyToId }),
    })
    if (res.ok) {
      const data = await res.json()
      const msg: ChatMessage = data.message
      if (!currentAdminId) setCurrentAdminId(msg.authorId)
      setActiveDM(prev => {
        if (!prev) return null
        const conv = prev.conv ?? {
          id: msg.channelId,
          participants: [msg.authorId, activeDM.member.id],
          messages: [],
          unread: {},
          createdAt: new Date(),
        }
        return {
          ...prev,
          conv: {
            ...conv,
            messages: [...(conv.messages ?? []), msg],
            lastMessage: msg,
          },
        }
      })
    }
  }

  // ── Send DM file ──────────────────────────────────────────────

  const handleSendDMFile = async (file: File) => {
    if (!activeDM) return
    const reader = new FileReader()
    return new Promise<void>((resolve, reject) => {
      reader.onloadend = async () => {
        const dataUrl = reader.result as string
        try {
          // Send as a DM but with file content via the DM endpoint doesn't support files directly
          // We'll encode into a regular DM message with the dataUrl embedded (not ideal but per spec)
          // For DMs, post via messages endpoint with the conv dmId as channelId
          if (activeDM.conv) {
            // We use a workaround: post a message to the DM conversation
            const res = await fetch("/api/admin/chat/dm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                toAdminId: activeDM.member.id,
                content: `[File: ${file.name}]`,
              }),
            })
            if (res.ok) {
              const data = await res.json()
              const msg: ChatMessage = { ...data.message, type: "file" as const, attachmentDataUrl: dataUrl, attachmentName: file.name, attachmentType: file.type }
              setActiveDM(prev => {
                if (!prev || !prev.conv) return prev
                return { ...prev, conv: { ...prev.conv, messages: [...prev.conv.messages, msg], lastMessage: msg } }
              })
            }
          }
          resolve()
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error("File read error"))
      reader.readAsDataURL(file)
    })
  }

  // ── Send voice message ────────────────────────────────────────

  const handleSendVoice = async (blob: Blob, duration: number) => {
    if (!activeChannel) return
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = async () => {
      const audioDataUrl = reader.result as string
      await fetch("/api/admin/chat/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ channelId: activeChannel.id, duration, audioDataUrl }),
      })
      await loadMessages(activeChannel)
    }
  }

  // ── React ─────────────────────────────────────────────────────

  const handleReact = async (msgId: string, emoji: string) => {
    if (!activeChannel) return
    setMessages(prev =>
      prev.map(m => {
        if (m.id !== msgId) return m
        const reactions = { ...m.reactions }
        const users = reactions[emoji] ?? []
        if (users.includes(currentAdminId || "me")) {
          reactions[emoji] = users.filter(u => u !== (currentAdminId || "me"))
          if (reactions[emoji].length === 0) delete reactions[emoji]
        } else {
          reactions[emoji] = [...users, currentAdminId || "me"]
        }
        return { ...m, reactions }
      })
    )
    try {
      const res = await fetch("/api/admin/chat/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messageId: msgId, channelId: activeChannel.id, emoji }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: data.reactions } : m))
      }
    } catch { /* silent */ }
  }

  // ── Edit message ──────────────────────────────────────────────

  const handleEditSave = async () => {
    if (!editingMsg || !activeChannel || !editContent.trim()) return
    const res = await fetch("/api/admin/chat/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ messageId: editingMsg.id, channelId: activeChannel.id, content: editContent }),
    })
    if (res.ok) {
      const data = await res.json()
      setMessages(prev => prev.map(m => m.id === editingMsg.id ? data.message : m))
    }
    setEditingMsg(null)
    setEditContent("")
  }

  // ── Delete message ────────────────────────────────────────────

  const handleDelete = async (msg: ChatMessage) => {
    if (!activeChannel || !confirm("Delete this message?")) return
    const res = await fetch(
      `/api/admin/chat/messages?messageId=${msg.id}&channelId=${activeChannel.id}`,
      { method: "DELETE", credentials: "include" }
    )
    if (res.ok) setMessages(prev => prev.filter(m => m.id !== msg.id))
  }

  // ── Create channel ────────────────────────────────────────────

  const handleCreateChannel = async (data: { name: string; description: string; isPrivate: boolean }) => {
    const res = await fetch("/api/admin/chat/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const { channel } = await res.json()
      setChannels(prev => [...prev, channel])
      setActiveChannel(channel)
      setShowCreateChannel(false)
    }
  }

  // ── Thread reply ──────────────────────────────────────────────

  const handleThreadReply = async (content: string, mentions: string[]) => {
    if (!threadParent || !activeChannel) return
    await handleSend(content, mentions, threadParent.id)
  }

  // ── Load more ─────────────────────────────────────────────────

  const handleLoadMore = async () => {
    if (!activeChannel || !nextCursor || loadingMore) return
    setLoadingMore(true)
    await loadMessages(activeChannel, nextCursor, true)
    setLoadingMore(false)
  }

  // ── Pin / unpin message ───────────────────────────────────────

  const handlePin = async (msg: ChatMessage) => {
    if (!activeChannel) return
    const res = await fetch("/api/admin/chat/pins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ channelId: activeChannel.id, messageId: msg.id }),
    })
    if (res.ok) {
      const data = await res.json()
      setPinnedMessages(data.pinned ?? [])
    }
  }

  const handleUnpin = async (messageId: string) => {
    if (!activeChannel) return
    const res = await fetch(
      `/api/admin/chat/pins?channelId=${activeChannel.id}&messageId=${messageId}`,
      { method: "DELETE", credentials: "include" }
    )
    if (res.ok) {
      const data = await res.json()
      setPinnedMessages(data.pinned ?? [])
    }
  }

  // ── Thread counts ─────────────────────────────────────────────

  const getThreadCount = (msgId: string) =>
    messages.filter(m => m.replyToId === msgId).length

  // ── Typing users display ──────────────────────────────────────

  const typingNames = Object.values(typingUsers)
    .filter(u => Date.now() - u.ts < 3000)
    .map(u => u.name)

  // ── Online users count ────────────────────────────────────────

  const onlineCount = onlineUsers.filter(u => u.status === "online").length

  // ── DM unread count helper ────────────────────────────────────

  const getDMUnread = (conv: DMConversation) => conv.unread[currentAdminId] ?? 0

  const getDMRecipient = (conv: DMConversation) =>
    conv.participants.find(p => p !== currentAdminId) ?? ""

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
      {/* Left Sidebar */}
      <aside
        className="flex flex-col border-r border-[var(--color-border)] shrink-0"
        style={{ width: 240, background: "var(--color-navy)" }}
      >
        {/* Workspace header */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-sm tracking-wide">KVL TECH</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowSearch(v => !v); setActiveDM(null) }}
                className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${showSearch ? "bg-white/20 text-white" : "text-white/50 hover:text-white/90"}`}
                title="Search (Alt+K)"
              >
                <Search size={13} />
              </button>
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
          </div>
        </div>

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto py-3">
          <div className="px-3 mb-1 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider"># Channels</span>
            <button
              onClick={() => setShowCreateChannel(true)}
              className="text-white/50 hover:text-white/90 transition-colors"
              title="New channel"
            >
              <Plus size={14} />
            </button>
          </div>

          {loadingChannels ? (
            <div className="space-y-1 px-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 rounded-lg animate-pulse bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="space-y-0.5 px-2">
              {channels.map(ch => {
                const isActive = activeChannel?.id === ch.id && !activeDM && !showSearch
                const unread = unreadCounts[ch.id] ?? 0
                return (
                  <button
                    key={ch.id}
                    onClick={() => switchChannel(ch)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-white/60 hover:bg-white/10 hover:text-white/90"
                    }`}
                  >
                    {ch.isPrivate
                      ? <Lock size={13} className="shrink-0 opacity-70" />
                      : <Hash size={13} className="shrink-0 opacity-70" />
                    }
                    <span className="text-sm font-medium truncate flex-1">{ch.name}</span>
                    {unread > 0 && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-black shrink-0"
                        style={{ background: "var(--color-gold)" }}
                      >
                        {unread}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Direct Messages */}
          <div className="px-3 mt-5 mb-1 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Direct Messages</span>
            <button
              onClick={() => setShowNewDM(true)}
              className="text-white/50 hover:text-white/90 transition-colors"
              title="New DM"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-0.5 px-2">
            {dmConversations.length === 0 ? (
              <button
                onClick={() => setShowNewDM(true)}
                className="w-full text-left px-3 py-2 rounded-lg text-white/30 hover:bg-white/10 hover:text-white/60 transition-colors text-xs flex items-center gap-2"
              >
                <MessageSquare size={12} />
                Start a DM
              </button>
            ) : (
              dmConversations.map(conv => {
                const recipientId = getDMRecipient(conv)
                const recipientMember = members.find(m => m.id === recipientId)
                const recipientName = recipientMember?.name ?? recipientId
                const isActive = activeDM?.conv?.id === conv.id
                const unread = getDMUnread(conv)
                const isOnline = onlineUsers.some(u => u.adminId === recipientId && u.status === "online")

                return (
                  <button
                    key={conv.id}
                    onClick={() => recipientMember && openDM(recipientMember)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-white/60 hover:bg-white/10 hover:text-white/90"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: getAvatarColor(recipientName) }}
                      >
                        {getInitials(recipientName)}
                      </div>
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[var(--color-navy)]"
                        style={{ background: isOnline ? "#22c55e" : "#6b7280" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{recipientName}</p>
                      {conv.lastMessage && (
                        <p className="text-[10px] text-white/40 truncate">
                          {conv.lastMessage.content.slice(0, 30)}
                        </p>
                      )}
                    </div>
                    {unread > 0 && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-black shrink-0"
                        style={{ background: "var(--color-gold)" }}
                      >
                        {unread}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Bottom: online count */}
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
            <span className="text-[11px] text-white/50">{onlineCount} online</span>
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex flex-col flex-1 overflow-hidden bg-[var(--color-bg)]">
        {/* Search mode */}
        {showSearch ? (
          <>
            {/* Search header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--color-border)] shrink-0">
              <Search size={16} className="text-[var(--color-text-muted)]" />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Escape") { setShowSearch(false); setSearchQuery(""); setSearchResults([]) } }}
                placeholder="Search messages… (Esc to close)"
                className="flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
              />
              <button
                onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]) }}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X size={16} />
              </button>
            </div>
            <SearchResultsPanel
              results={searchResults}
              query={searchQuery}
              loading={searchLoading}
              onSelectResult={msg => {
                const ch = channels.find(c => c.id === msg.channelId)
                if (ch) {
                  switchChannel(ch)
                }
              }}
            />
          </>
        ) : activeDM ? (
          /* DM mode */
          <DMPanel
            dmConv={activeDM.conv}
            recipientName={activeDM.member.name}
            recipientId={activeDM.member.id}
            currentAdminId={currentAdminId}
            onlineUsers={onlineUsers}
            onClose={() => setActiveDM(null)}
            onSend={handleSendDM}
            onSendFile={handleSendDMFile}
          />
        ) : activeChannel ? (
          <>
            {/* Channel header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--color-border)] shrink-0">
              <Hash size={18} className="text-[var(--color-text-muted)]" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[var(--color-text)]">{activeChannel.name}</h3>
                {activeChannel.description && (
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{activeChannel.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                  <Users size={13} />
                  {activeChannel.members.length || "All"} members
                </div>
                {/* Pin button */}
                <button
                  onClick={() => setShowPinned(v => !v)}
                  className={`flex items-center gap-1 text-xs transition-colors relative ${showPinned ? "text-[var(--color-gold)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}
                  title="Pinned messages"
                >
                  <Pin size={14} />
                  {pinnedMessages.length > 0 && (
                    <span
                      className="text-[9px] font-bold px-1 py-0.5 rounded-full text-black"
                      style={{ background: "var(--color-gold)" }}
                    >
                      {pinnedMessages.length}
                    </span>
                  )}
                </button>
                <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  <Settings size={15} />
                </button>
              </div>
            </div>

            {/* Pinned messages panel */}
            {showPinned && pinnedMessages.length > 0 && (
              <PinnedMessagesPanel
                pinned={pinnedMessages}
                onUnpin={handleUnpin}
                onClose={() => setShowPinned(false)}
              />
            )}

            {/* Messages area */}
            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto py-2">
                  {/* Load more */}
                  {nextCursor && (
                    <div className="text-center py-2">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1 mx-auto"
                      >
                        {loadingMore
                          ? <><Loader2 size={12} className="animate-spin" /> Loading...</>
                          : "Load earlier messages"
                        }
                      </button>
                    </div>
                  )}

                  {/* Message list */}
                  {loadingMessages ? (
                    <div className="space-y-4 px-4 py-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-3 animate-pulse">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-32 rounded bg-[var(--color-bg-secondary)]" />
                            <div className="h-4 w-64 rounded bg-[var(--color-bg-secondary)]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--color-bg-secondary)] flex items-center justify-center mb-4">
                        <Hash size={24} className="text-[var(--color-text-muted)] opacity-40" />
                      </div>
                      <p className="font-semibold text-[var(--color-text)]">Welcome to #{activeChannel.name}</p>
                      <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        {activeChannel.description || "This is the beginning of this channel."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {messages.filter(m => !m.replyToId).map(msg => (
                        <MessageBubble
                          key={msg.id}
                          msg={msg}
                          currentAdminId={currentAdminId}
                          onReact={handleReact}
                          onReply={m => { setReplyTo(m); setThreadParent(null) }}
                          onEdit={m => { setEditingMsg(m); setEditContent(m.content) }}
                          onDelete={handleDelete}
                          onThreadOpen={m => setThreadParent(m)}
                          onPin={handlePin}
                          threadCount={getThreadCount(msg.id)}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Typing indicator */}
                {typingNames.length > 0 && (
                  <div className="px-5 pb-1 text-xs text-[var(--color-text-muted)] italic">
                    {typingNames.join(", ")} {typingNames.length === 1 ? "is" : "are"} typing...
                  </div>
                )}

                {/* Message input */}
                <MessageInput
                  channelName={activeChannel.name}
                  replyTo={replyTo}
                  members={members}
                  onSend={handleSend}
                  onSendVoice={handleSendVoice}
                  onSendFile={handleSendFile}
                  onCancelReply={() => setReplyTo(null)}
                  onTyping={handleTyping}
                />
              </div>

              {/* Thread panel */}
              {threadParent && (
                <ThreadPanel
                  parentMsg={threadParent}
                  messages={messages}
                  members={members}
                  currentAdminId={currentAdminId}
                  onClose={() => setThreadParent(null)}
                  onReact={handleReact}
                  onSendReply={handleThreadReply}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <Hash size={48} className="text-[var(--color-text-muted)] opacity-20 mx-auto mb-4" />
              <p className="text-[var(--color-text-muted)]">Select a channel to start messaging</p>
            </div>
          </div>
        )}
      </main>

      {/* Edit message dialog */}
      {editingMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[var(--color-text)] text-sm">Edit Message</h3>
              <button onClick={() => setEditingMsg(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                <X size={16} />
              </button>
            </div>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none resize-none focus:border-[var(--color-gold)]"
              rows={4}
              autoFocus
            />
            <div className="flex gap-3 mt-3">
              <button onClick={() => setEditingMsg(null)} className="flex-1 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-all">
                Cancel
              </button>
              <button onClick={handleEditSave} disabled={!editContent.trim()} className="flex-1 py-2 rounded-xl bg-[var(--color-navy)] text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create channel modal */}
      {showCreateChannel && (
        <NewChannelModal
          onClose={() => setShowCreateChannel(false)}
          onCreate={handleCreateChannel}
        />
      )}

      {/* New DM modal */}
      {showNewDM && (
        <NewDMModal
          members={members}
          currentAdminId={currentAdminId}
          onlineUsers={onlineUsers}
          onClose={() => setShowNewDM(false)}
          onSelect={openDM}
        />
      )}
    </div>
  )
}
