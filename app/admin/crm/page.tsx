"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Phone, Mail, MessageCircle, ChevronDown, Loader2, RefreshCw,
  X, Plus, Calendar, User, CheckCircle, XCircle, Clock,
} from "lucide-react"
import { AdminTopbar } from "@/components/admin/AdminSidebar"
import { KanbanColumnSkeleton } from "@/components/ui/Skeleton"
import { NoLeadsEmpty } from "@/components/ui/EmptyState"

const STAGES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "WON", "LOST"] as const
type Stage = typeof STAGES[number]

const STAGE_CONFIG: Record<Stage, { label: string; color: string; bg: string; colBg: string }> = {
  NEW:           { label: "New",           color: "#C9A227", bg: "#C9A22720", colBg: "" },
  CONTACTED:     { label: "Contacted",     color: "#0891B2", bg: "#0891B220", colBg: "" },
  QUALIFIED:     { label: "Qualified",     color: "#7C3AED", bg: "#7C3AED20", colBg: "" },
  PROPOSAL_SENT: { label: "Proposal Sent", color: "#F59E0B", bg: "#F59E0B20", colBg: "" },
  WON:           { label: "Won",           color: "#16A34A", bg: "#16A34A20", colBg: "#16A34A08" },
  LOST:          { label: "Lost",          color: "#EF4444", bg: "#EF444420", colBg: "#EF444408" },
}

const SCORE_CONFIG: Record<string, { emoji: string; border: string; color: string }> = {
  hot:  { emoji: "🔥", border: "border-red-400",    color: "#EF4444" },
  warm: { emoji: "🌡️", border: "border-amber-400",  color: "#F59E0B" },
  cold: { emoji: "❄️", border: "border-gray-400",   color: "#9CA3AF" },
}

const ACTIVITY_ICONS: Record<string, string> = {
  CALL: "📞", EMAIL: "📧", WHATSAPP: "💬", MEETING: "🤝", NOTE: "📝", TASK: "✅",
}

const AGENTS = ["", "Priya", "Rahul", "Amit", "Self"]

interface Lead {
  id: string
  name: string
  phone: string
  email: string
  service: string
  score: number
  scoreLabel: string
  assignedTo: string
  followUpAt: string | null
  budget: string
  source: string
  activitiesCount: number
  createdAt: string
}

interface Activity {
  id: string
  leadId: string
  type: string
  title: string
  description: string | null
  scheduledAt: string | null
  completedAt: string | null
  adminName: string | null
  outcome: string | null
  createdAt: string
}

type Pipeline = Record<Stage, Lead[]>

function parseBudget(budget: string): number {
  if (!budget) return 15000
  const cleaned = budget.replace(/[^0-9.]/g, "")
  const num = parseFloat(cleaned)
  return isNaN(num) || num === 0 ? 15000 : num
}

function formatDate(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

function MoveStageDropdown({ lead, onMove }: { lead: Lead; onMove: (id: string, stage: Stage) => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleMove = async (stage: Stage) => {
    setLoading(true)
    setOpen(false)
    await onMove(lead.id, stage)
    setLoading(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
      >
        {loading ? <Loader2 size={9} className="animate-spin" /> : null}
        Move Stage <ChevronDown size={9} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 z-50 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden min-w-[130px]">
          {STAGES.filter(s => s !== (lead as any).currentStage).map(s => (
            <button
              key={s}
              onClick={() => handleMove(s)}
              className="w-full text-left px-3 py-2 text-[10px] font-semibold hover:bg-[var(--color-bg-secondary)] transition-colors"
              style={{ color: STAGE_CONFIG[s].color }}
            >
              {STAGE_CONFIG[s].label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function LeadCard({ lead, currentStage, onMove, onView }: {
  lead: Lead
  currentStage: Stage
  onMove: (id: string, stage: Stage) => void
  onView: (lead: Lead) => void
}) {
  const score = SCORE_CONFIG[lead.scoreLabel] || SCORE_CONFIG.cold
  const budget = parseBudget(lead.budget)

  return (
    <div className={`rounded-xl border-l-4 bg-[var(--color-bg-card)] p-3 shadow-sm hover:shadow-md transition-all ${score.border}`}>
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm">{score.emoji}</span>
          <p className="text-xs font-bold text-[var(--color-text)] truncate">{lead.name}</p>
        </div>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 uppercase"
          style={{ color: score.color, background: `${score.color}20` }}
        >
          {lead.scoreLabel}
        </span>
      </div>

      {lead.service && (
        <p className="text-[10px] text-[var(--color-text-muted)] mb-1 truncate">{lead.service}</p>
      )}

      <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-secondary)] mb-1.5">
        <Phone size={9} />
        <span>{lead.phone}</span>
      </div>

      <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] mb-2">
        <span className="text-[var(--color-gold)] font-semibold">
          ₹{budget.toLocaleString("en-IN")} · {lead.activitiesCount} {lead.activitiesCount === 1 ? "activity" : "activities"}
        </span>
      </div>

      {lead.assignedTo && (
        <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] mb-1">
          <User size={9} />
          <span>{lead.assignedTo}</span>
        </div>
      )}

      {lead.followUpAt && (
        <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] mb-2">
          <Calendar size={9} />
          <span>Follow-up: {formatDate(lead.followUpAt)}</span>
        </div>
      )}

      <div className="flex gap-1.5 pt-2 border-t border-[var(--color-border)]">
        <MoveStageDropdown lead={{ ...lead, currentStage } as any} onMove={onMove} />
        <button
          onClick={() => onView(lead)}
          className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-[var(--color-navy)] text-white hover:opacity-80 transition-all ml-auto"
        >
          View
        </button>
      </div>
    </div>
  )
}

function ActivityItem({ activity, onComplete }: { activity: Activity; onComplete: (id: string) => void }) {
  const [completing, setCompleting] = useState(false)

  const handleComplete = async () => {
    setCompleting(true)
    await onComplete(activity.id)
    setCompleting(false)
  }

  return (
    <div className="flex gap-2.5 pb-3 border-b border-[var(--color-border)] last:border-0">
      <span className="text-lg shrink-0 mt-0.5">{ACTIVITY_ICONS[activity.type] || "📌"}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className="text-xs font-semibold text-[var(--color-text)] truncate">{activity.title}</p>
          {!activity.completedAt && (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="shrink-0 text-[9px] px-1.5 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-green-500 hover:text-green-500 transition-all"
            >
              {completing ? <Loader2 size={8} className="animate-spin" /> : "Done"}
            </button>
          )}
          {activity.completedAt && (
            <CheckCircle size={12} className="text-green-500 shrink-0 mt-0.5" />
          )}
        </div>
        <p className="text-[10px] text-[var(--color-text-muted)]">{formatDate(activity.createdAt)}</p>
        {activity.description && (
          <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 line-clamp-2">{activity.description}</p>
        )}
        {activity.outcome && (
          <p className="text-[10px] text-green-500 mt-0.5">Outcome: {activity.outcome}</p>
        )}
      </div>
    </div>
  )
}

function LeadDrawer({ lead, onClose, onUpdated }: {
  lead: Lead
  onClose: () => void
  onUpdated: (updatedLead: Partial<Lead> & { id: string }) => void
}) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loadingAct, setLoadingAct] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [markingWon, setMarkingWon] = useState(false)
  const [markingLost, setMarkingLost] = useState(false)
  const [lostReason, setLostReason] = useState("")
  const [showLostPrompt, setShowLostPrompt] = useState(false)

  const [assignedTo, setAssignedTo] = useState(lead.assignedTo || "")
  const [followUpAt, setFollowUpAt] = useState(
    lead.followUpAt ? lead.followUpAt.split("T")[0] : ""
  )

  const [newActivity, setNewActivity] = useState({
    type: "CALL",
    title: "",
    description: "",
    scheduledAt: "",
  })

  const fetchActivities = useCallback(async () => {
    setLoadingAct(true)
    try {
      const res = await fetch(`/api/admin/activities?leadId=${lead.id}`, { credentials: "include" })
      if (res.ok) setActivities(await res.json())
    } catch {
    }
    setLoadingAct(false)
  }, [lead.id])

  useEffect(() => { fetchActivities() }, [fetchActivities])

  const saveAssignment = async () => {
    setSaving(true)
    try {
      await fetch("/api/admin/leads/assign", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ leadId: lead.id, assignedTo }),
      })
      await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: lead.id, followUpAt: followUpAt ? new Date(followUpAt).toISOString() : null }),
      })
      onUpdated({ id: lead.id, assignedTo, followUpAt: followUpAt ? new Date(followUpAt).toISOString() : null })
    } catch {
    }
    setSaving(false)
  }

  const addActivity = async () => {
    if (!newActivity.title) return
    try {
      const res = await fetch("/api/admin/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ leadId: lead.id, ...newActivity }),
      })
      if (res.ok) {
        setNewActivity({ type: "CALL", title: "", description: "", scheduledAt: "" })
        setShowAddForm(false)
        await fetchActivities()
      }
    } catch {
    }
  }

  const completeActivity = async (id: string) => {
    try {
      await fetch(`/api/admin/activities?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ outcome: "" }),
      })
      await fetchActivities()
    } catch {
    }
  }

  const moveStage = async (stage: string) => {
    try {
      await fetch("/api/admin/pipeline", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ leadId: lead.id, newStatus: stage }),
      })
      onUpdated({ id: lead.id } as any)
      onClose()
    } catch {
    }
  }

  const markWon = async () => {
    setMarkingWon(true)
    await moveStage("WON")
    setMarkingWon(false)
  }

  const markLost = async () => {
    if (!showLostPrompt) { setShowLostPrompt(true); return }
    setMarkingLost(true)
    await moveStage("LOST")
    setMarkingLost(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-[400px] bg-[var(--color-bg-card)] border-l border-[var(--color-border)] flex flex-col h-full overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] shrink-0">
          <div>
            <h2 className="font-display font-bold text-base text-[var(--color-text)]">{lead.name}</h2>
            <p className="text-[10px] text-[var(--color-text-muted)]">{lead.service}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors">
            <X size={16} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Lead Info</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: "Phone", value: lead.phone },
                { label: "Email", value: lead.email || "—" },
                { label: "Budget", value: lead.budget || "—" },
                { label: "Source", value: lead.source },
                { label: "Score", value: `${lead.score} (${lead.scoreLabel})` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-[var(--color-bg-secondary)] p-2.5">
                  <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5">{label}</p>
                  <p className="font-semibold text-[var(--color-text)] truncate">{value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-1">
              <div>
                <label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Assign To</label>
                <select
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all"
                >
                  {AGENTS.map(a => (
                    <option key={a} value={a}>{a || "Unassigned"}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Follow-up Date</label>
                <input
                  type="date"
                  value={followUpAt}
                  onChange={e => setFollowUpAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all"
                />
              </div>
              <button
                onClick={saveAssignment}
                disabled={saving}
                className="w-full py-2 rounded-xl bg-[var(--color-navy)] text-white text-xs font-semibold hover:opacity-80 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : null}
                Save Changes
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Activity Timeline</h3>
              <button
                onClick={() => setShowAddForm(v => !v)}
                className="flex items-center gap-1 text-[10px] font-semibold text-[var(--color-gold)] hover:underline"
              >
                <Plus size={10} /> Add
              </button>
            </div>

            {showAddForm && (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3 space-y-2">
                <select
                  value={newActivity.type}
                  onChange={e => setNewActivity(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all"
                >
                  {Object.keys(ACTIVITY_ICONS).map(t => (
                    <option key={t} value={t}>{ACTIVITY_ICONS[t]} {t}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Title *"
                  value={newActivity.title}
                  onChange={e => setNewActivity(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newActivity.description}
                  onChange={e => setNewActivity(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all resize-none"
                />
                <input
                  type="datetime-local"
                  value={newActivity.scheduledAt}
                  onChange={e => setNewActivity(p => ({ ...p, scheduledAt: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all"
                />
                <button
                  onClick={addActivity}
                  className="w-full py-2 rounded-xl bg-[var(--color-gold)] text-white text-xs font-semibold hover:opacity-80 transition-all"
                >
                  Add Activity
                </button>
              </div>
            )}

            {loadingAct ? (
              <div className="flex justify-center py-4">
                <Loader2 size={18} className="animate-spin text-[var(--color-gold)]" />
              </div>
            ) : activities.length === 0 ? (
              <p className="text-[10px] text-[var(--color-text-muted)] text-center py-3">No activities yet</p>
            ) : (
              <div className="space-y-3">
                {activities.map(a => (
                  <ActivityItem key={a.id} activity={a} onComplete={completeActivity} />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 transition-all"
              >
                <MessageCircle size={13} /> WhatsApp
              </a>
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
              >
                <Mail size={13} /> Email
              </a>
            </div>

            <button
              onClick={markWon}
              disabled={markingWon}
              className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {markingWon ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Mark as WON
            </button>

            {showLostPrompt && (
              <input
                type="text"
                placeholder="Reason for losing (optional)"
                value={lostReason}
                onChange={e => setLostReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-red-400 bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text)] outline-none"
              />
            )}
            <button
              onClick={markLost}
              disabled={markingLost}
              className="w-full py-2.5 rounded-xl border border-red-500 text-red-500 text-sm font-semibold hover:bg-red-500/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {markingLost ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              {showLostPrompt ? "Confirm Lost" : "Mark as LOST"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CRMPipelinePage() {
  const [pipeline, setPipeline] = useState<Pipeline>({
    NEW: [], CONTACTED: [], QUALIFIED: [], PROPOSAL_SENT: [], WON: [], LOST: [],
  })
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [agentFilter, setAgentFilter] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const fetchPipeline = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch("/api/admin/pipeline", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setPipeline(data)
      }
    } catch {
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchPipeline() }, [fetchPipeline])

  const moveStage = async (leadId: string, newStatus: Stage) => {
    try {
      const res = await fetch("/api/admin/pipeline", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ leadId, newStatus }),
      })
      if (res.ok) await fetchPipeline()
    } catch {
    }
  }

  const handleLeadUpdated = (updated: Partial<Lead> & { id: string }) => {
    setPipeline(prev => {
      const next = { ...prev }
      for (const stage of STAGES) {
        next[stage] = next[stage].map(l => l.id === updated.id ? { ...l, ...updated } : l)
      }
      return next
    })
    if (selectedLead?.id === updated.id) {
      setSelectedLead(prev => prev ? { ...prev, ...updated } : prev)
    }
    fetchPipeline()
  }

  const filteredPipeline: Pipeline = {} as Pipeline
  for (const stage of STAGES) {
    filteredPipeline[stage] = agentFilter
      ? pipeline[stage].filter(l => l.assignedTo === agentFilter)
      : pipeline[stage]
  }

  const totalValue = STAGES.reduce((sum, s) => {
    return sum + filteredPipeline[s].reduce((a, l) => a + parseBudget(l.budget), 0)
  }, 0)

  if (loading) {
    return (
      <>
        <AdminTopbar title="CRM Pipeline" />
        <div className="p-4">
          <div className="flex gap-3 overflow-x-auto pb-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] min-w-[240px] max-w-[260px] flex-shrink-0 p-3">
                <KanbanColumnSkeleton />
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminTopbar title="CRM Pipeline" />
      <div className="p-4 h-[calc(100vh-64px)] flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-3">
          <div>
            <h1 className="font-display font-bold text-lg text-[var(--color-text)]">CRM Pipeline</h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Pipeline value: <span className="text-[var(--color-gold)] font-semibold">₹{totalValue.toLocaleString("en-IN")}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={agentFilter}
              onChange={e => setAgentFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-gold)] transition-all"
            >
              <option value="">All Agents</option>
              {AGENTS.filter(Boolean).map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <button
              onClick={fetchPipeline}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all"
            >
              <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-3 flex-1 min-h-0">
          {STAGES.map(stage => {
            const cfg = STAGE_CONFIG[stage]
            const leads = filteredPipeline[stage]
            const stageValue = leads.reduce((a, l) => a + parseBudget(l.budget), 0)

            return (
              <div
                key={stage}
                className="flex flex-col rounded-2xl border border-[var(--color-border)] min-w-[240px] max-w-[260px] flex-shrink-0"
                style={{ background: cfg.colBg || "var(--color-bg-secondary)" }}
              >
                <div className="p-3 border-b border-[var(--color-border)] shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-bold" style={{ color: cfg.color }}>
                      {cfg.label}
                    </h3>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      {leads.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    ₹{stageValue.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {leads.length === 0 ? (
                    <NoLeadsEmpty />
                  ) : (
                    leads.map(lead => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        currentStage={stage}
                        onMove={moveStage}
                        onView={setSelectedLead}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdated={handleLeadUpdated}
        />
      )}
    </>
  )
}
