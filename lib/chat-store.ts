// In-memory chat store — persists across requests within the same process
// No Prisma models used; all data lives in module-level singletons

export interface ChatChannel {
  id: string
  name: string
  description: string
  isPrivate: boolean
  members: string[]
  createdAt: string
  createdBy: string
}

export interface ChatMessage {
  id: string
  channelId: string
  authorId: string
  authorName: string
  authorRole: string
  content: string
  mentions: string[]
  replyToId?: string
  replyTo?: { id: string; authorName: string; content: string } | null
  reactions: Record<string, string[]> // emoji → list of authorIds
  type: "text" | "voice" | "file"
  attachmentUrl?: string
  attachmentDataUrl?: string // base64 data URL for file sharing
  attachmentName?: string
  attachmentType?: string // mime type
  createdAt: string
  editedAt?: string
  // For search results — populated on the way out
  channelName?: string
}

// ── Direct Messages ──────────────────────────────────────────────

export interface DMConversation {
  id: string              // sorted "userId1_userId2"
  participants: string[]  // [adminId1, adminId2]
  messages: ChatMessage[] // reuse ChatMessage type, channelId = dm.id
  unread: Record<string, number> // { adminId: unreadCount }
  lastMessage?: ChatMessage
  createdAt: Date
}

// ── Online Presence ──────────────────────────────────────────────

export interface OnlineUser {
  adminId: string
  name: string
  lastSeen: Date
  status: "online" | "away" | "offline"
}

const MAX_MESSAGES_PER_CHANNEL = 500
const MAX_DM_MESSAGES = 500

// Global singletons — survive HMR in Next.js dev by attaching to globalThis
declare global {
  // eslint-disable-next-line no-var
  var __kvl_channels: Map<string, ChatChannel> | undefined
  // eslint-disable-next-line no-var
  var __kvl_messages: Map<string, ChatMessage[]> | undefined
  // eslint-disable-next-line no-var
  var __kvl_dm_store: Map<string, DMConversation> | undefined
  // eslint-disable-next-line no-var
  var __kvl_pinned_messages: Map<string, ChatMessage[]> | undefined
  // eslint-disable-next-line no-var
  var __kvl_online_users: Map<string, OnlineUser> | undefined
}

function initChannels(): Map<string, ChatChannel> {
  const m = new Map<string, ChatChannel>()
  const defaults: Array<{ id: string; name: string; description: string }> = [
    { id: "general",       name: "general",       description: "General team discussions" },
    { id: "announcements", name: "announcements",  description: "Company-wide announcements" },
    { id: "support",       name: "support",        description: "Support team coordination" },
    { id: "sales",         name: "sales",          description: "Sales pipeline discussions" },
    { id: "dev",           name: "dev",            description: "Development & engineering" },
  ]
  for (const d of defaults) {
    m.set(d.id, {
      id: d.id,
      name: d.name,
      description: d.description,
      isPrivate: false,
      members: [],
      createdAt: new Date().toISOString(),
      createdBy: "system",
    })
  }
  return m
}

if (!globalThis.__kvl_channels) {
  globalThis.__kvl_channels = initChannels()
}
if (!globalThis.__kvl_messages) {
  globalThis.__kvl_messages = new Map<string, ChatMessage[]>()
}
if (!globalThis.__kvl_dm_store) {
  globalThis.__kvl_dm_store = new Map<string, DMConversation>()
}
if (!globalThis.__kvl_pinned_messages) {
  globalThis.__kvl_pinned_messages = new Map<string, ChatMessage[]>()
}
if (!globalThis.__kvl_online_users) {
  globalThis.__kvl_online_users = new Map<string, OnlineUser>()
}

export const channelStore: Map<string, ChatChannel> = globalThis.__kvl_channels
export const messageStore: Map<string, ChatMessage[]> = globalThis.__kvl_messages
export const dmStore: Map<string, DMConversation> = globalThis.__kvl_dm_store
export const pinnedStore: Map<string, ChatMessage[]> = globalThis.__kvl_pinned_messages
export const onlineStore: Map<string, OnlineUser> = globalThis.__kvl_online_users

// ── Channel Helpers ───────────────────────────────────────────────

export function getChannels(): ChatChannel[] {
  return Array.from(channelStore.values())
}

export function getChannel(id: string): ChatChannel | undefined {
  return channelStore.get(id)
}

export function createChannel(data: Omit<ChatChannel, "createdAt">): ChatChannel {
  const channel: ChatChannel = { ...data, createdAt: new Date().toISOString() }
  channelStore.set(channel.id, channel)
  return channel
}

export function getMessages(channelId: string): ChatMessage[] {
  return messageStore.get(channelId) ?? []
}

export function addMessage(msg: ChatMessage): ChatMessage {
  const msgs = messageStore.get(msg.channelId) ?? []
  msgs.push(msg)
  // Ring buffer — drop oldest if over max
  if (msgs.length > MAX_MESSAGES_PER_CHANNEL) {
    msgs.splice(0, msgs.length - MAX_MESSAGES_PER_CHANNEL)
  }
  messageStore.set(msg.channelId, msgs)
  return msg
}

export function findMessage(channelId: string, messageId: string): ChatMessage | undefined {
  return (messageStore.get(channelId) ?? []).find(m => m.id === messageId)
}

export function updateMessage(channelId: string, messageId: string, patch: Partial<ChatMessage>): ChatMessage | null {
  const msgs = messageStore.get(channelId)
  if (!msgs) return null
  const idx = msgs.findIndex(m => m.id === messageId)
  if (idx === -1) return null
  msgs[idx] = { ...msgs[idx], ...patch }
  messageStore.set(channelId, msgs)
  return msgs[idx]
}

export function deleteMessage(channelId: string, messageId: string): boolean {
  const msgs = messageStore.get(channelId)
  if (!msgs) return false
  const idx = msgs.findIndex(m => m.id === messageId)
  if (idx === -1) return false
  msgs.splice(idx, 1)
  messageStore.set(channelId, msgs)
  return true
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ── Direct Message Helpers ────────────────────────────────────────

export function getDMId(adminId1: string, adminId2: string): string {
  return [adminId1, adminId2].sort().join("_")
}

export function getDMConversation(adminId1: string, adminId2: string): DMConversation {
  const id = getDMId(adminId1, adminId2)
  if (!dmStore.has(id)) {
    const conv: DMConversation = {
      id,
      participants: [adminId1, adminId2],
      messages: [],
      unread: { [adminId1]: 0, [adminId2]: 0 },
      createdAt: new Date(),
    }
    dmStore.set(id, conv)
  }
  return dmStore.get(id)!
}

export function getDMMessages(dmId: string, before?: string, limit = 50): ChatMessage[] {
  const conv = dmStore.get(dmId)
  if (!conv) return []
  let msgs = [...conv.messages]
  if (before) {
    const idx = msgs.findIndex(m => m.id === before)
    if (idx !== -1) msgs = msgs.slice(0, idx)
  }
  return msgs.slice(-Math.min(limit, 100))
}

export function addDMMessage(dmId: string, message: ChatMessage): ChatMessage {
  const conv = dmStore.get(dmId)
  if (!conv) return message

  conv.messages.push(message)
  // Ring buffer
  if (conv.messages.length > MAX_DM_MESSAGES) {
    conv.messages.splice(0, conv.messages.length - MAX_DM_MESSAGES)
  }
  conv.lastMessage = message

  // Increment unread for all participants except sender
  for (const participantId of conv.participants) {
    if (participantId !== message.authorId) {
      conv.unread[participantId] = (conv.unread[participantId] ?? 0) + 1
    }
  }

  dmStore.set(dmId, conv)
  return message
}

export function getDMsForUser(adminId: string): DMConversation[] {
  const results: DMConversation[] = []
  for (const conv of dmStore.values()) {
    if (conv.participants.includes(adminId)) {
      results.push(conv)
    }
  }
  // Sort by lastMessage timestamp desc
  results.sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : a.createdAt.getTime()
    const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : b.createdAt.getTime()
    return bTime - aTime
  })
  return results
}

export function markDMRead(dmId: string, adminId: string): void {
  const conv = dmStore.get(dmId)
  if (!conv) return
  conv.unread[adminId] = 0
  dmStore.set(dmId, conv)
}

// ── Pinned Messages Helpers ───────────────────────────────────────

export function pinMessage(channelId: string, message: ChatMessage): void {
  const pinned = pinnedStore.get(channelId) ?? []
  // Don't duplicate
  if (!pinned.some(m => m.id === message.id)) {
    pinned.push(message)
    pinnedStore.set(channelId, pinned)
  }
}

export function unpinMessage(channelId: string, messageId: string): void {
  const pinned = pinnedStore.get(channelId) ?? []
  const idx = pinned.findIndex(m => m.id === messageId)
  if (idx !== -1) {
    pinned.splice(idx, 1)
    pinnedStore.set(channelId, pinned)
  }
}

export function getPinnedMessages(channelId: string): ChatMessage[] {
  return pinnedStore.get(channelId) ?? []
}

// ── Online Presence Helpers ───────────────────────────────────────

const OFFLINE_AFTER_MS = 5 * 60 * 1000 // 5 minutes

export function setUserOnline(adminId: string, name: string): void {
  onlineStore.set(adminId, {
    adminId,
    name,
    lastSeen: new Date(),
    status: "online",
  })
}

export function setUserOffline(adminId: string): void {
  const existing = onlineStore.get(adminId)
  if (existing) {
    onlineStore.set(adminId, { ...existing, status: "offline", lastSeen: new Date() })
  }
}

export function setUserAway(adminId: string): void {
  const existing = onlineStore.get(adminId)
  if (existing) {
    onlineStore.set(adminId, { ...existing, status: "away", lastSeen: new Date() })
  }
}

export function getOnlineUsers(): OnlineUser[] {
  const now = Date.now()
  const users: OnlineUser[] = []
  for (const [adminId, user] of onlineStore.entries()) {
    const age = now - user.lastSeen.getTime()
    // Auto-set offline after 5 minutes
    if (age > OFFLINE_AFTER_MS && user.status !== "offline") {
      onlineStore.set(adminId, { ...user, status: "offline" })
      users.push({ ...user, status: "offline" })
    } else {
      users.push(user)
    }
  }
  return users
}

export function isUserOnline(adminId: string): boolean {
  const user = onlineStore.get(adminId)
  if (!user) return false
  const age = Date.now() - user.lastSeen.getTime()
  return user.status === "online" && age <= OFFLINE_AFTER_MS
}

// ── Message Search ────────────────────────────────────────────────

export function searchMessages(query: string, channelId?: string): ChatMessage[] {
  if (!query || query.length < 2) return []
  const lowerQuery = query.toLowerCase()
  const results: ChatMessage[] = []

  const channelsToSearch = channelId
    ? [channelId]
    : Array.from(channelStore.keys())

  for (const chId of channelsToSearch) {
    const channel = channelStore.get(chId)
    const msgs = messageStore.get(chId) ?? []
    for (const msg of msgs) {
      if (msg.content.toLowerCase().includes(lowerQuery)) {
        results.push({
          ...msg,
          channelName: channel?.name ?? chId,
        })
      }
    }
  }

  // Sort by timestamp desc, return max 20
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return results.slice(0, 20)
}
