"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Clock,
  ArrowUpCircle,
  CheckCircle2,
  Mail,
  SkipForward,
  ChevronDown,
  ChevronUp,
  X,
  Send,
  RotateCcw,
  Users,
  Activity,
  ToggleLeft,
  ToggleRight,
  Plus,
  Edit2,
} from "lucide-react"
import { AdminTopbar } from "@/components/admin/AdminSidebar"

// ─── Types ────────────────────────────────────────────────────────────────────

type OutreachType =
  | "health_check_email"
  | "renewal_reminder"
  | "upsell_opportunity"
  | "win_back"
  | "check_in_call"
  | "satisfaction_survey"

interface OutreachTask {
  id: string
  clientId: string
  clientName: string
  clientEmail: string
  type: OutreachType
  priority: "high" | "medium" | "low"
  reason: string
  suggestedMessage: string
  scheduledFor: string
  status: "pending" | "sent" | "completed" | "skipped"
  createdAt: string
  sentAt?: string
  completedAt?: string
  skippedAt?: string
}

interface Stats {
  pending: number
  sent: number
  completed: number
  skipped: number
}

interface ClientHealth {
  clientId: string
  name: string
  email: string
  score: number
  label: string
}

interface AutomationRule {
  id: string
  name: string
  trigger: string
  threshold: number
  action: string
  enabled: boolean
  description: string
}

// ─── Default automation rules ─────────────────────────────────────────────────

const DEFAULT_RULES: AutomationRule[] = [
  {
    id: "rule_1",
    name: "Critical Health Alert",
    trigger: "health_score_below",
    threshold: 30,
    action: "auto-send check-in email",
    enabled: true,
    description: "If client health score falls below 30 → auto-send check-in email",
  },
  {
    id: "rule_2",
    name: "Inactive Client Win-Back",
    trigger: "no_orders_days",
    threshold: 90,
    action: "create win-back task",
    enabled: true,
    description: "If no orders in 90 days → create win-back task",
  },
  {
    id: "rule_3",
    name: "Subscription Renewal",
    trigger: "subscription_expires_days",
    threshold: 7,
    action: "send renewal reminder",
    enabled: true,
    description: "If subscription expires in 7 days → send renewal reminder",
  },
  {
    id: "rule_4",
    name: "Upsell After Delivery",
    trigger: "delivered_days_ago",
    threshold: 60,
    action: "create upsell task",
    enabled: false,
    description: "If order delivered 60+ days ago with no upgrade → create upsell task",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<OutreachType, string> = {
  health_check_email: "Health Check",
  renewal_reminder: "Renewal",
  upsell_opportunity: "Upsell",
  win_back: "Win Back",
  check_in_call: "Check-In",
  satisfaction_survey: "Survey",
}

const TYPE_COLORS: Record<OutreachType, string> = {
  health_check_email: "bg-blue-100 text-blue-700",
  renewal_reminder: "bg-amber-100 text-amber-700",
  upsell_opportunity: "bg-green-100 text-green-700",
  win_back: "bg-purple-100 text-purple-700",
  check_in_call: "bg-cyan-100 text-cyan-700",
  satisfaction_survey: "bg-pink-100 text-pink-700",
}

const PRIORITY_STYLES = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-blue-100 text-blue-700 border-blue-200",
}

const SCORE_COLOR = (score: number) => {
  if (score >= 75) return "text-green-600"
  if (score >= 50) return "text-amber-500"
  if (score >= 25) return "text-orange-500"
  return "text-red-600"
}

const SCORE_BG = (score: number) => {
  if (score >= 75) return "bg-green-500"
  if (score >= 50) return "bg-amber-500"
  if (score >= 25) return "bg-orange-500"
  return "bg-red-500"
}

// ─── Send Email Modal ─────────────────────────────────────────────────────────

function SendEmailModal({
  task,
  onClose,
  onSent,
}: {
  task: OutreachTask
  onClose: () => void
  onSent: () => void
}) {
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState(task.suggestedMessage)
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Pre-load the subject from generate-message
    fetch("/api/admin/customer-success/generate-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ clientId: task.clientId, type: task.type }),
    })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.subject) setSubject(d.subject)
        if (d?.message) setBody(d.message)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [task.clientId, task.type])

  const handleSend = async () => {
    setSending(true)
    try {
      const res = await fetch(`/api/admin/customer-success/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "send", customMessage: body }),
      })
      if (res.ok) onSent()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] w-full max-w-2xl shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div>
            <h3 className="font-semibold text-[var(--color-text)]">Send Email</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              To: {task.clientName} &lt;{task.clientEmail}&gt;
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <X size={16} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-[var(--color-gold)]" />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Subject
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-gold)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Message Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-gold)] resize-y"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-gold)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {sending ? "Sending..." : "Send Email"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onAction,
}: {
  task: OutreachTask
  onAction: (taskId: string, action: "send" | "skip" | "regen") => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)
  const [localMessage, setLocalMessage] = useState(task.suggestedMessage)

  const handleRegen = async () => {
    setRegenLoading(true)
    try {
      const res = await fetch("/api/admin/customer-success/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ clientId: task.clientId, type: task.type }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.message) setLocalMessage(data.message)
      }
    } finally {
      setRegenLoading(false)
    }
  }

  const isCompleted = task.status !== "pending"

  return (
    <>
      {showSendModal && (
        <AnimatePresence>
          <SendEmailModal
            task={{ ...task, suggestedMessage: localMessage }}
            onClose={() => setShowSendModal(false)}
            onSent={() => {
              setShowSendModal(false)
              onAction(task.id, "send")
            }}
          />
        </AnimatePresence>
      )}

      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border p-4 transition-colors ${
          isCompleted
            ? "border-[var(--color-border)] bg-[var(--color-bg-secondary)] opacity-70"
            : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-gold)]/40"
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Priority + type badges */}
          <div className="flex flex-col gap-1 shrink-0 pt-0.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${PRIORITY_STYLES[task.priority]}`}
            >
              {task.priority}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${TYPE_COLORS[task.type]}`}
            >
              {TYPE_LABELS[task.type]}
            </span>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-sm text-[var(--color-text)]">{task.clientName}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{task.clientEmail}</p>
              </div>
              {/* Status badge */}
              {task.status === "sent" && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold shrink-0">
                  <CheckCircle2 size={10} />
                  Sent {task.sentAt ? new Date(task.sentAt).toLocaleDateString() : ""}
                </span>
              )}
              {task.status === "skipped" && (
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold shrink-0">
                  Skipped
                </span>
              )}
              {task.status === "completed" && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold shrink-0">
                  <CheckCircle2 size={10} />
                  Completed
                </span>
              )}
            </div>

            <p className="text-xs text-[var(--color-text-muted)] mt-1">{task.reason}</p>

            {/* Expandable message */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 mt-2 text-xs text-[var(--color-gold)] hover:opacity-80 transition-opacity"
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? "Hide" : "View"} suggested message
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 p-3 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text)] whitespace-pre-line leading-relaxed">
                      {localMessage}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            {task.status === "pending" && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <button
                  onClick={() => setShowSendModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-gold)] text-white text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  <Mail size={12} />
                  Send Email
                </button>
                <button
                  onClick={() => onAction(task.id, "skip")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs hover:text-[var(--color-text)] transition-colors"
                >
                  <SkipForward size={12} />
                  Skip
                </button>
                <button
                  onClick={handleRegen}
                  disabled={regenLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs hover:text-[var(--color-text)] transition-colors disabled:opacity-50"
                >
                  {regenLoading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <RotateCcw size={12} />
                  )}
                  Regenerate
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── Health Overview Tab ──────────────────────────────────────────────────────

function HealthOverviewTab() {
  const [clients, setClients] = useState<ClientHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ClientHealth | null>(null)
  const [creatingTask, setCreatingTask] = useState(false)

  useEffect(() => {
    fetch("/api/admin/clients/health-bulk?limit=50", { credentials: "include" })
      .then((r) => r.ok ? r.json() : [])
      .then(setClients)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex gap-6">
      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-[var(--color-gold)]" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] font-medium">Client</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] font-medium">Score</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] font-medium">Risk</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-muted)] font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr
                  key={c.clientId}
                  onClick={() => setSelected(c)}
                  className={`border-b border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg-secondary)] transition-colors ${
                    selected?.clientId === c.clientId ? "bg-[var(--color-bg-secondary)]" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <p className="font-medium text-[var(--color-text)]">{c.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{c.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-base ${SCORE_COLOR(c.score)}`}>
                        {c.score}
                      </span>
                      <div className="w-16 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${SCORE_BG(c.score)}`}
                          style={{ width: `${c.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        c.label === "Healthy"
                          ? "bg-green-100 text-green-700"
                          : c.label === "Moderate"
                          ? "bg-amber-100 text-amber-700"
                          : c.label === "At Risk"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelected(c)
                      }}
                      className="text-xs text-[var(--color-gold)] hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[var(--color-text-muted)]">
                    No client health data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            className="w-80 shrink-0 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)] p-5 space-y-4 self-start sticky top-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-[var(--color-text)]">{selected.name}</h4>
              <button
                onClick={() => setSelected(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-secondary)]"
              >
                <X size={14} className="text-[var(--color-text-muted)]" />
              </button>
            </div>

            <div className="text-center py-4">
              <div
                className={`text-5xl font-black ${SCORE_COLOR(selected.score)}`}
              >
                {selected.score}
              </div>
              <div className="text-sm text-[var(--color-text-muted)] mt-1">
                Health Score — {selected.label}
              </div>
              <div className="w-full h-2 bg-[var(--color-border)] rounded-full mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${selected.score}%` }}
                  className={`h-full rounded-full ${SCORE_BG(selected.score)}`}
                />
              </div>
            </div>

            {/* Score breakdown */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Score Factors
              </p>
              {[
                { label: "Base Score", pts: 50 },
                { label: "Order Activity", pts: selected.score >= 70 ? 20 : selected.score >= 55 ? 10 : -15 },
                { label: "Order Volume Bonus", pts: Math.min(5, Math.floor((selected.score - 50) / 5)) * 5 },
                { label: "Support Tickets", pts: 0 },
              ].map((f) => (
                <div key={f.label} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-muted)]">{f.label}</span>
                  <span
                    className={f.pts >= 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}
                  >
                    {f.pts >= 0 ? "+" : ""}{f.pts}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={async () => {
                setCreatingTask(true)
                try {
                  await fetch("/api/admin/customer-success/scan", {
                    method: "POST",
                    credentials: "include",
                  })
                } finally {
                  setCreatingTask(false)
                }
              }}
              disabled={creatingTask}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-gold)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creatingTask ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              Create Outreach Task
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Automation Rules Tab ─────────────────────────────────────────────────────

function AutomationRulesTab() {
  const [rules, setRules] = useState<AutomationRule[]>(DEFAULT_RULES)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editThreshold, setEditThreshold] = useState<number>(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRule, setNewRule] = useState({
    name: "",
    trigger: "no_orders_days",
    threshold: 60,
    action: "create_outreach_task",
  })

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    )
  }

  const saveThreshold = (id: string) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              threshold: editThreshold,
              description: r.description.replace(/\d+/, String(editThreshold)),
            }
          : r
      )
    )
    setEditingId(null)
  }

  const addRule = () => {
    if (!newRule.name) return
    const rule: AutomationRule = {
      id: `rule_${Date.now()}`,
      name: newRule.name,
      trigger: newRule.trigger,
      threshold: newRule.threshold,
      action: newRule.action,
      enabled: true,
      description: `If ${newRule.trigger.replace(/_/g, " ")} ${newRule.threshold} → ${newRule.action.replace(/_/g, " ")}`,
    }
    setRules((prev) => [...prev, rule])
    setShowAddForm(false)
    setNewRule({ name: "", trigger: "no_orders_days", threshold: 60, action: "create_outreach_task" })
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm text-[var(--color-text)]">{rule.name}</p>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    rule.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {rule.enabled ? "Active" : "Disabled"}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{rule.description}</p>
            </div>
            <button
              onClick={() => toggleRule(rule.id)}
              className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors"
            >
              {rule.enabled ? (
                <ToggleRight size={28} className="text-[var(--color-gold)]" />
              ) : (
                <ToggleLeft size={28} />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--color-text-muted)]">Threshold:</span>
            {editingId === rule.id ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={editThreshold}
                  onChange={(e) => setEditThreshold(Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] text-xs focus:outline-none focus:border-[var(--color-gold)]"
                />
                <button
                  onClick={() => saveThreshold(rule.id)}
                  className="px-2 py-1 rounded-lg bg-[var(--color-gold)] text-white text-xs"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-2 py-1 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--color-text)]">
                  {rule.threshold}
                </span>
                <button
                  onClick={() => {
                    setEditingId(rule.id)
                    setEditThreshold(rule.threshold)
                  }}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors"
                >
                  <Edit2 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add Rule */}
      {showAddForm ? (
        <div className="p-4 rounded-xl border border-[var(--color-gold)]/40 bg-[var(--color-bg)] space-y-3">
          <p className="font-medium text-sm text-[var(--color-text)]">New Automation Rule</p>
          <input
            placeholder="Rule name"
            value={newRule.name}
            onChange={(e) => setNewRule((p) => ({ ...p, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-gold)]"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">Trigger</label>
              <select
                value={newRule.trigger}
                onChange={(e) => setNewRule((p) => ({ ...p, trigger: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-gold)]"
              >
                <option value="no_orders_days">No orders (days)</option>
                <option value="health_score_below">Health score below</option>
                <option value="subscription_expires_days">Subscription expires (days)</option>
                <option value="delivered_days_ago">Delivered (days ago)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">Threshold</label>
              <input
                type="number"
                value={newRule.threshold}
                onChange={(e) => setNewRule((p) => ({ ...p, threshold: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-gold)]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Action</label>
            <select
              value={newRule.action}
              onChange={(e) => setNewRule((p) => ({ ...p, action: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-gold)]"
            >
              <option value="create_outreach_task">Create outreach task</option>
              <option value="send_email">Auto-send email</option>
              <option value="create_win_back_task">Create win-back task</option>
              <option value="send_renewal_reminder">Send renewal reminder</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={addRule}
              className="px-4 py-2 rounded-lg bg-[var(--color-gold)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Add Rule
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm hover:text-[var(--color-text)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] text-sm hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors w-full justify-center"
        >
          <Plus size={16} />
          Add Rule
        </button>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CustomerSuccessPage() {
  const [tab, setTab] = useState<"queue" | "health" | "rules">("queue")
  const [tasks, setTasks] = useState<OutreachTask[]>([])
  const [stats, setStats] = useState<Stats>({ pending: 0, sent: 0, completed: 0, skipped: 0 })
  const [scanLoading, setScanLoading] = useState(false)
  const [queueLoading, setQueueLoading] = useState(true)
  const [lastScan, setLastScan] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<"all" | "high" | "medium" | "low">("all")
  const [filterType, setFilterType] = useState<"all" | OutreachType>("all")

  const fetchQueue = useCallback(async () => {
    setQueueLoading(true)
    try {
      const res = await fetch("/api/admin/customer-success/scan", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || [])
        setStats(data.stats || { pending: 0, sent: 0, completed: 0, skipped: 0 })
        if (data.lastScanAt) setLastScan(data.lastScanAt)
      }
    } finally {
      setQueueLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  const handleScan = async () => {
    setScanLoading(true)
    try {
      const res = await fetch("/api/admin/customer-success/scan", {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        if (data.lastScanAt) setLastScan(data.lastScanAt)
        await fetchQueue()
      }
    } finally {
      setScanLoading(false)
    }
  }

  const handleTaskAction = async (taskId: string, action: "send" | "skip" | "regen") => {
    if (action === "skip") {
      await fetch(`/api/admin/customer-success/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "skip" }),
      })
    }
    // Refresh queue after action
    await fetchQueue()
  }

  const filteredTasks = tasks.filter((t) => {
    if (filterPriority !== "all" && t.priority !== filterPriority) return false
    if (filterType !== "all" && t.type !== filterType) return false
    return true
  })

  const churnCount = tasks.filter(
    (t) => t.type === "health_check_email" || t.type === "win_back"
  ).length
  const renewalCount = tasks.filter((t) => t.type === "renewal_reminder").length
  const upsellCount = tasks.filter((t) => t.type === "upsell_opportunity").length

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      <AdminTopbar title="Customer Success" />

      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Customer Success</h2>
            {lastScan && (
              <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                Last scan: {new Date(lastScan).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={handleScan}
            disabled={scanLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-gold)] text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {scanLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            {scanLoading ? "Scanning..." : "Run Scan"}
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Churn Risks",
              value: churnCount,
              icon: AlertTriangle,
              color: "text-red-500",
              bg: "bg-red-50 dark:bg-red-900/10",
            },
            {
              label: "Renewal Due",
              value: renewalCount,
              icon: Clock,
              color: "text-amber-500",
              bg: "bg-amber-50 dark:bg-amber-900/10",
            },
            {
              label: "Upsell Ready",
              value: upsellCount,
              icon: ArrowUpCircle,
              color: "text-green-500",
              bg: "bg-green-50 dark:bg-green-900/10",
            },
            {
              label: "Tasks Pending",
              value: stats.pending,
              icon: Activity,
              color: "text-blue-500",
              bg: "bg-blue-50 dark:bg-blue-900/10",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[var(--color-border)]">
          {(
            [
              { key: "queue", label: "Outreach Queue", icon: Mail },
              { key: "health", label: "Health Overview", icon: Users },
              { key: "rules", label: "Automation Rules", icon: Activity },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === key
                  ? "border-[var(--color-gold)] text-[var(--color-gold)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "queue" && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1">
                {(["all", "high", "medium", "low"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                      filterPriority === p
                        ? "bg-[var(--color-navy)] text-white"
                        : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    {p === "all" ? "All" : p}
                  </button>
                ))}
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as "all" | OutreachType)}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] text-xs focus:outline-none focus:border-[var(--color-gold)]"
              >
                <option value="all">All Types</option>
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {queueLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-[var(--color-gold)]" />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 size={40} className="text-[var(--color-text-muted)] mb-3" />
                <p className="font-medium text-[var(--color-text)]">No pending outreach tasks</p>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  Run a scan to check for opportunities
                </p>
                <button
                  onClick={handleScan}
                  disabled={scanLoading}
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-gold)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <RefreshCw size={14} />
                  Run Scan
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onAction={handleTaskAction} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "health" && <HealthOverviewTab />}
        {tab === "rules" && <AutomationRulesTab />}
      </div>
    </div>
  )
}
