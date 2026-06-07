"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Key, Plus, Copy, CheckCircle2, Loader2, ToggleLeft, ToggleRight,
  Trash2, X, AlertTriangle, Activity, Shield, Clock, BarChart2, TrendingUp, Calendar
} from "lucide-react"
import { AdminTopbar } from "@/components/admin/AdminSidebar"

const AVAILABLE_SCOPES = [
  { value: "read:orders", label: "Read Orders" },
  { value: "write:orders", label: "Write Orders" },
  { value: "read:leads", label: "Read Leads" },
  { value: "read:analytics", label: "Read Analytics" },
  { value: "read:clients", label: "Read Clients" },
]

interface ApiKey {
  id: string
  name: string
  prefix: string
  maskedKey: string
  scopes: string[]
  lastUsedAt: string | null
  expiresAt: string | null
  isActive: boolean
  requestCount: number
  requestsToday: number
  weekRequests: number
  topEndpoints: { endpoint: string; count: number }[]
  createdAt: string
}

interface Stats {
  total: number
  active: number
  callsToday: number
  callsWeek: number
  callsMonth: number
  topEndpoints: { endpoint: string; count: number }[]
}

interface CreatedKey {
  id: string
  name: string
  prefix: string
  fullKey: string
  scopes: string[]
  createdAt: string
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string
}) {
  return (
    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "20" }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[var(--color-text)]">{value.toLocaleString()}</p>
    </div>
  )
}

function CreateKeyModal({ onClose, onCreated }: { onClose: () => void; onCreated: (key: CreatedKey) => void }) {
  const [name, setName] = useState("")
  const [scopes, setScopes] = useState<string[]>([])
  const [expiresAt, setExpiresAt] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const toggleScope = (s: string) =>
    setScopes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const handleCreate = async () => {
    if (!name.trim()) { setError("Key name is required"); return }
    setSaving(true)
    setError("")
    const res = await fetch("/api/admin/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, scopes, expiresAt: expiresAt || null }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || "Failed to create key"); return }
    onCreated(data.key)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Create API Key</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-colors">
            <X size={16} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
          )}

          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5 block">Key Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Production Integration"
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm outline-none focus:border-[#C9A227] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 block">Scopes</label>
            <div className="space-y-2">
              {AVAILABLE_SCOPES.map(s => (
                <label key={s.value} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => toggleScope(s.value)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      scopes.includes(s.value)
                        ? "border-[#C9A227] bg-[#C9A227]"
                        : "border-[var(--color-border)] group-hover:border-[#C9A227]/50"
                    }`}
                  >
                    {scopes.includes(s.value) && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  <span className="text-sm text-[var(--color-text)]">{s.label}</span>
                  <code className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] px-1.5 py-0.5 rounded">{s.value}</code>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5 block">Expiry Date (optional)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm outline-none focus:border-[#C9A227] transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#C9A227" }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
            Generate Key
          </button>
        </div>
      </div>
    </div>
  )
}

function ShowKeyModal({ createdKey, onClose }: { createdKey: CreatedKey; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  const copyKey = async () => {
    await navigator.clipboard.writeText(createdKey.fullKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="px-6 py-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A227]/15 flex items-center justify-center">
              <Key size={18} style={{ color: "#C9A227" }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text)]">API Key Created</h2>
              <p className="text-xs text-[var(--color-text-muted)]">{createdKey.name}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle size={15} className="text-amber-500 shrink-0" />
            <p className="text-sm text-amber-400 font-medium">
              Copy this key now — it will never be shown again.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5 block">Your API Key</label>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <code className="flex-1 text-xs font-mono text-[var(--color-text)] break-all select-all">
                {createdKey.fullKey}
              </code>
              <button
                onClick={copyKey}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  copied
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {createdKey.scopes.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 block">Scopes</label>
              <div className="flex flex-wrap gap-1.5">
                {createdKey.scopes.map(s => (
                  <span key={s} className="px-2 py-1 rounded-lg text-xs font-medium bg-[#0B1437]/10 text-[#0B1437] dark:bg-white/10 dark:text-white/70 border border-[var(--color-border)]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[var(--color-border)]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#C9A227" }}
          >
            Done — I&apos;ve Saved the Key
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, callsToday: 0, callsWeek: 0, callsMonth: 0, topEndpoints: [] })
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/api-keys", { credentials: "include" })
    const data = await res.json()
    setKeys(data.keys || [])
    setStats(data.stats || { total: 0, active: 0, callsToday: 0 })
    setLoading(false)
  }, [])

  useEffect(() => { fetchKeys() }, [fetchKeys])

  const handleToggle = async (key: ApiKey) => {
    setTogglingId(key.id)
    await fetch("/api/admin/api-keys", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: key.id, isActive: !key.isActive }),
    })
    setTogglingId(null)
    fetchKeys()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/admin/api-keys?id=${deleteTarget.id}`, {
      method: "DELETE",
      credentials: "include",
    })
    setDeleting(false)
    setDeleteTarget(null)
    fetchKeys()
  }

  const handleCreated = (key: CreatedKey) => {
    setShowCreate(false)
    setCreatedKey(key)
    fetchKeys()
  }

  const fmtDate = (d: string | null) => {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      <AdminTopbar title="API Developer Platform" />

      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">API Keys</h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              Manage programmatic access to the KVL TECH platform
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#C9A227" }}
          >
            <Plus size={16} />
            Create API Key
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Key} label="Total Keys" value={stats.total} color="#C9A227" />
          <StatCard icon={Shield} label="Active Keys" value={stats.active} color="#16A34A" />
          <StatCard icon={Activity} label="API Calls Today" value={stats.callsToday} color="#0891B2" />
        </div>

        <div className="bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--color-text-muted)]">
              <Key size={36} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">No API keys yet</p>
              <p className="text-xs mt-1">Create your first key to start integrating</p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
                style={{ backgroundColor: "#C9A227" }}
              >
                <Plus size={14} />
                Create API Key
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Key Name</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden sm:table-cell">Prefix</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden md:table-cell">Scopes</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden lg:table-cell">Created</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden lg:table-cell">Last Used</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Requests</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map(key => (
                    <tr key={key.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]/40 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-[var(--color-text)]">{key.name}</p>
                          {key.expiresAt && (
                            <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                              <Clock size={10} /> Expires {fmtDate(key.expiresAt)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <code className="text-xs font-mono bg-[var(--color-bg)] border border-[var(--color-border)] px-2 py-1 rounded-lg text-[var(--color-text-muted)]">
                          {key.maskedKey}
                        </code>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {key.scopes.length === 0
                            ? <span className="text-[var(--color-text-muted)] text-xs">None</span>
                            : key.scopes.map(s => (
                              <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                                {s}
                              </span>
                            ))
                          }
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[var(--color-text-muted)] text-xs hidden lg:table-cell">
                        {fmtDate(key.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-[var(--color-text-muted)] text-xs hidden lg:table-cell">
                        {key.lastUsedAt ? fmtDate(key.lastUsedAt) : <span className="opacity-50">Never</span>}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-[var(--color-text)] font-medium text-xs">
                          {key.requestCount.toLocaleString()}
                          {key.requestsToday > 0 && (
                            <span className="text-[#C9A227] ml-1">(+{key.requestsToday} today)</span>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleToggle(key)}
                          disabled={togglingId === key.id}
                          className="transition-colors disabled:opacity-50"
                        >
                          {togglingId === key.id ? (
                            <Loader2 size={20} className="animate-spin text-[var(--color-text-muted)]" />
                          ) : key.isActive ? (
                            <ToggleRight size={22} style={{ color: "#16A34A" }} />
                          ) : (
                            <ToggleLeft size={22} className="text-[var(--color-text-muted)]" />
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setDeleteTarget(key)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-red-500 hover:border-red-500/50 transition-all ml-auto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* ── Analytics Section ─────────────────────────────────── */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--color-text)]">API Analytics</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Usage summary across all your API keys</p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-sky-500/10">
                  <Activity size={16} className="text-sky-500" />
                </div>
                <span className="text-sm text-[var(--color-text-muted)]">API Calls Today</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.callsToday.toLocaleString()}</p>
            </div>
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-500/10">
                  <TrendingUp size={16} className="text-violet-500" />
                </div>
                <span className="text-sm text-[var(--color-text-muted)]">This Week</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.callsWeek.toLocaleString()}</p>
            </div>
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10">
                  <Calendar size={16} className="text-emerald-500" />
                </div>
                <span className="text-sm text-[var(--color-text-muted)]">This Month</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.callsMonth.toLocaleString()}</p>
            </div>
          </div>

          {/* Top endpoints chart */}
          {stats.topEndpoints.length > 0 && (
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={16} style={{ color: "#C9A227" }} />
                <h4 className="text-sm font-semibold text-[var(--color-text)]">Top Endpoints</h4>
              </div>
              <div className="space-y-2.5">
                {(() => {
                  const maxCount = Math.max(...stats.topEndpoints.map(e => e.count), 1)
                  return stats.topEndpoints.map(ep => (
                    <div key={ep.endpoint} className="flex items-center gap-3 text-xs">
                      <code className="font-mono text-[var(--color-text-muted)] w-48 truncate shrink-0">{ep.endpoint}</code>
                      <div className="flex-1 h-5 bg-[var(--color-bg)] rounded overflow-hidden">
                        <div
                          className="h-full rounded transition-all"
                          style={{
                            width: `${Math.max(4, (ep.count / maxCount) * 100)}%`,
                            backgroundColor: "#C9A227",
                            opacity: 0.7,
                          }}
                        />
                      </div>
                      <span className="font-semibold text-[var(--color-text)] w-10 text-right shrink-0">{ep.count.toLocaleString()}</span>
                    </div>
                  ))
                })()}
              </div>
            </div>
          )}

          {/* Per-key sparklines (last 7 day dots) */}
          {keys.length > 0 && (
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-[var(--color-text)] mb-4">Per-Key Activity (7 days)</h4>
              <div className="space-y-3">
                {keys.map(key => (
                  <div key={key.id} className="flex items-center gap-3">
                    <span className="text-xs text-[var(--color-text)] font-medium w-40 truncate shrink-0">{key.name}</span>
                    <div className="flex items-end gap-1 flex-1">
                      {Array.from({ length: 7 }, (_, i) => {
                        // Visual sparkline based on available info: today vs week spread
                        const factor = i === 6 ? key.requestsToday : Math.max(0, Math.floor((key.weekRequests - key.requestsToday) / 6))
                        const maxVal = Math.max(key.weekRequests, 1)
                        const height = Math.max(4, Math.min(24, Math.round((factor / maxVal) * 24)))
                        return (
                          <div
                            key={i}
                            className="w-3 rounded-sm shrink-0 transition-all"
                            style={{
                              height: `${height}px`,
                              backgroundColor: i === 6 ? "#C9A227" : "#C9A227",
                              opacity: i === 6 ? 1 : 0.3 + i * 0.1,
                            }}
                            title={`Day ${i + 1}`}
                          />
                        )
                      })}
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)] w-20 text-right shrink-0">
                      {key.weekRequests.toLocaleString()} / week
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {showCreate && (
        <CreateKeyModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {createdKey && (
        <ShowKeyModal
          createdKey={createdKey}
          onClose={() => setCreatedKey(null)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--color-text)]">Revoke API Key</h3>
                <p className="text-sm text-[var(--color-text-muted)]">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-5">
              Revoke <span className="font-semibold text-[var(--color-text)]">{deleteTarget.name}</span>?
              Any integrations using this key will immediately stop working.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Revoke Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
