"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Database, Plus, Download, RotateCcw, Trash2, X, Loader2,
  CheckCircle2, AlertTriangle, Clock, HardDrive, ChevronDown,
  ChevronUp, RefreshCw, ShieldAlert, Calendar, Lock,
} from "lucide-react"
import { AdminTopbar } from "@/components/admin/AdminSidebar"

type BackupSchedule = "MANUAL" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
type BackupStatus = "RUNNING" | "COMPLETED" | "FAILED" | "DELETED"

interface BackupEntry {
  id: string
  name: string
  filename: string
  filePath: string
  schedule: BackupSchedule
  status: BackupStatus
  sizeBytes: number
  createdBy: string
  notes: string | null
  error?: string | null
  createdAt: string
  completedAt?: string | null
}

interface BackupStats {
  total: number
  completed: number
  failed: number
  totalSizeBytes: number
}

interface ScheduleConfig {
  daily: { enabled: boolean; hour: number; retentionCount: number }
  weekly: { enabled: boolean; dayOfWeek: number; hour: number; retentionCount: number }
  monthly: { enabled: boolean; dayOfMonth: number; hour: number; retentionCount: number }
  yearly: { enabled: boolean; month: number; day: number; hour: number; retentionCount: number }
}

interface Toast {
  id: string
  type: "success" | "error"
  message: string
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).replace(",", "")
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const SCHEDULE_BADGE: Record<BackupSchedule, { label: string; color: string; bg: string }> = {
  MANUAL:  { label: "Manual",  color: "#9CA3AF", bg: "#9CA3AF18" },
  DAILY:   { label: "Daily",   color: "#3B82F6", bg: "#3B82F618" },
  WEEKLY:  { label: "Weekly",  color: "#10B981", bg: "#10B98118" },
  MONTHLY: { label: "Monthly", color: "#8B5CF6", bg: "#8B5CF618" },
  YEARLY:  { label: "Yearly",  color: "#C9A227", bg: "#C9A22718" },
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"]

function ScheduleBadge({ schedule }: { schedule: BackupSchedule }) {
  const cfg = SCHEDULE_BADGE[schedule]
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  )
}

function StatusBadge({ status }: { status: BackupStatus }) {
  if (status === "RUNNING") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20">
        <Loader2 size={10} className="animate-spin" />
        Running
      </span>
    )
  }
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20">
        <CheckCircle2 size={10} />
        Completed
      </span>
    )
  }
  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20">
        <AlertTriangle size={10} />
        Failed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
      Deleted
    </span>
  )
}

interface ToastBarProps {
  toasts: Toast[]
  remove: (id: string) => void
}

function ToastBar({ toasts, remove }: ToastBarProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium ${
              t.type === "success"
                ? "bg-green-950 border-green-500/40 text-green-300"
                : "bg-red-950 border-red-500/40 text-red-300"
            }`}
          >
            {t.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

interface CreateBackupModalProps {
  onClose: () => void
  onCreated: () => void
  addToast: (type: "success" | "error", message: string) => void
}

function CreateBackupModal({ onClose, onCreated, addToast }: CreateBackupModalProps) {
  const [notes, setNotes] = useState("")
  const [schedule, setSchedule] = useState<BackupSchedule>("MANUAL")
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notes: notes.trim() || undefined, schedule }),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast("error", data.error || "Failed to create backup")
        setCreating(false)
        return
      }
      addToast("success", "Backup started successfully")
      onCreated()
      onClose()
    } catch {
      addToast("error", "Network error — please try again")
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C9A22718] flex items-center justify-center">
              <Database size={16} style={{ color: "#C9A227" }} />
            </div>
            <h2 className="text-base font-bold text-[var(--color-text)]">Create Backup</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <X size={16} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5 block">
              Schedule Type
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(["MANUAL", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as BackupSchedule[]).map(s => {
                const cfg = SCHEDULE_BADGE[s]
                const active = schedule === s
                return (
                  <button
                    key={s}
                    onClick={() => setSchedule(s)}
                    className="px-2 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all"
                    style={active
                      ? { color: cfg.color, background: cfg.bg, borderColor: cfg.color + "60" }
                      : { color: "var(--color-text-muted)", background: "transparent", borderColor: "var(--color-border)" }
                    }
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5 block">
              Notes <span className="font-normal normal-case text-[var(--color-text-muted)]">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Pre-deployment backup"
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm outline-none focus:border-[#C9A227] transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]">
          <button
            onClick={onClose}
            disabled={creating}
            className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#C9A227" }}
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {creating ? "Creating…" : "Create Now"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

interface RestoreModalProps {
  backup: BackupEntry
  onClose: () => void
  onRestored: () => void
  addToast: (type: "success" | "error", message: string) => void
}

function RestoreModal({ backup, onClose, onRestored, addToast }: RestoreModalProps) {
  const [restoring, setRestoring] = useState(false)

  const handleRestore = async () => {
    setRestoring(true)
    try {
      const res = await fetch(`/api/admin/backup/${backup.id}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ confirm: true }),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast("error", data.error || "Restore failed")
        setRestoring(false)
        return
      }
      addToast("success", "Database restore initiated successfully")
      onRestored()
      onClose()
    } catch {
      addToast("error", "Network error — please try again")
      setRestoring(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--color-bg)] border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl"
      >
        <div className="px-6 pt-7 pb-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <ShieldAlert size={32} className="text-red-500" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)] mb-1">Restore Database?</h2>
            <p className="text-sm text-red-400 font-semibold">
              This will overwrite the current database!
            </p>
          </div>

          <div className="text-left bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] p-4 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={14} className="text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                All data created after this backup was taken will be permanently lost.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" />
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                A pre-restore backup will be created automatically before proceeding.
              </p>
            </div>
            <div className="pt-1 border-t border-[var(--color-border)]">
              <p className="text-[10px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider mb-1">
                Restoring from
              </p>
              <p className="text-sm font-bold text-[var(--color-text)]">{backup.name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{formatDate(backup.createdAt)}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={restoring}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRestore}
              disabled={restoring}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60"
            >
              {restoring ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
              {restoring ? "Restoring…" : "Yes, Restore Database"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

interface DeleteConfirmProps {
  backup: BackupEntry
  onClose: () => void
  onDeleted: () => void
  addToast: (type: "success" | "error", message: string) => void
}

function DeleteConfirm({ backup, onClose, onDeleted, addToast }: DeleteConfirmProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/backup/${backup.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) {
        const data = await res.json()
        addToast("error", data.error || "Delete failed")
        setDeleting(false)
        return
      }
      addToast("success", "Backup deleted")
      onDeleted()
      onClose()
    } catch {
      addToast("error", "Network error — please try again")
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl w-full max-w-sm shadow-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--color-text)]">Delete Backup</h3>
            <p className="text-xs text-[var(--color-text-muted)]">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mb-5">
          Delete{" "}
          <span className="font-semibold text-[var(--color-text)]">{backup.name}</span>?
          The backup file will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  )
}

interface ScheduleSectionProps {
  scheduleConfig: ScheduleConfig
  addToast: (type: "success" | "error", message: string) => void
}

function ScheduleSection({ scheduleConfig, addToast }: ScheduleSectionProps) {
  const [open, setOpen] = useState(false)
  const [cfg, setCfg] = useState<ScheduleConfig>(scheduleConfig)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => { setCfg(scheduleConfig) }, [scheduleConfig])

  const setField = <K extends keyof ScheduleConfig>(
    key: K,
    field: keyof ScheduleConfig[K],
    value: number | boolean
  ) => {
    setCfg(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  const saveSchedule = async (key: keyof ScheduleConfig) => {
    setSaving(key)
    try {
      const res = await fetch("/api/admin/backup/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(cfg),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast("error", data.error || "Failed to save schedule")
      } else {
        addToast("success", `${key.charAt(0).toUpperCase() + key.slice(1)} schedule saved`)
      }
    } catch {
      addToast("error", "Network error")
    }
    setSaving(null)
  }

  const inputCls = "px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm outline-none focus:border-[#C9A227] transition-colors w-full"
  const labelCls = "text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block"

  function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 transition-colors ${
          checked ? "border-[#C9A227] bg-[#C9A227]" : "border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[14px]" : "translate-x-[1px]"
          }`}
        />
      </button>
    )
  }

  const scheduleBlocks: {
    key: keyof ScheduleConfig
    label: string
    color: string
  }[] = [
    { key: "daily",   label: "Daily",   color: "#3B82F6" },
    { key: "weekly",  label: "Weekly",  color: "#10B981" },
    { key: "monthly", label: "Monthly", color: "#8B5CF6" },
    { key: "yearly",  label: "Yearly",  color: "#C9A227" },
  ]

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[var(--color-bg-secondary)]/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Calendar size={16} style={{ color: "#C9A227" }} />
          <span className="text-sm font-bold text-[var(--color-text)]">Schedule Configuration</span>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-[var(--color-text-muted)]" />
        ) : (
          <ChevronDown size={16} className="text-[var(--color-text-muted)]" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--color-border)] divide-y divide-[var(--color-border)]">
              {scheduleBlocks.map(({ key, label, color }) => {
                const block = cfg[key]
                const isSaving = saving === key
                return (
                  <div key={key} className="px-5 py-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-semibold text-[var(--color-text)]">
                          {label} Backup
                        </span>
                      </div>
                      <Toggle
                        checked={block.enabled}
                        onChange={v => setField(key, "enabled", v)}
                      />
                    </div>

                    {block.enabled && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                      >
                        {key === "weekly" && (
                          <div>
                            <label className={labelCls}>Day of Week</label>
                            <select
                              value={(block as ScheduleConfig["weekly"]).dayOfWeek}
                              onChange={e => setField(key, "dayOfWeek", Number(e.target.value))}
                              className={inputCls}
                            >
                              {DAYS_OF_WEEK.map((d, i) => (
                                <option key={d} value={i}>{d}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {key === "monthly" && (
                          <div>
                            <label className={labelCls}>Day of Month</label>
                            <input
                              type="number"
                              min={1}
                              max={28}
                              value={(block as ScheduleConfig["monthly"]).dayOfMonth}
                              onChange={e => setField(key, "dayOfMonth", Number(e.target.value))}
                              className={inputCls}
                            />
                          </div>
                        )}

                        {key === "yearly" && (
                          <>
                            <div>
                              <label className={labelCls}>Month</label>
                              <select
                                value={(block as ScheduleConfig["yearly"]).month}
                                onChange={e => setField(key, "month", Number(e.target.value))}
                                className={inputCls}
                              >
                                {MONTHS.map((m, i) => (
                                  <option key={m} value={i + 1}>{m}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelCls}>Day</label>
                              <input
                                type="number"
                                min={1}
                                max={28}
                                value={(block as ScheduleConfig["yearly"]).day}
                                onChange={e => setField(key, "day", Number(e.target.value))}
                                className={inputCls}
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <label className={labelCls}>Hour (0–23)</label>
                          <input
                            type="number"
                            min={0}
                            max={23}
                            value={(block as { hour: number }).hour}
                            onChange={e => setField(key, "hour", Number(e.target.value))}
                            className={inputCls}
                          />
                        </div>

                        <div>
                          <label className={labelCls}>Keep Last N</label>
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={(block as { retentionCount: number }).retentionCount}
                            onChange={e => setField(key, "retentionCount", Number(e.target.value))}
                            className={inputCls}
                          />
                        </div>
                      </motion.div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={() => saveSchedule(key)}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all hover:opacity-90"
                        style={{ backgroundColor: color }}
                      >
                        {isSaving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                        {isSaving ? "Saving…" : "Save Schedule"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupEntry[]>([])
  const [stats, setStats] = useState<BackupStats>({ total: 0, completed: 0, failed: 0, totalSizeBytes: 0 })
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [restoreTarget, setRestoreTarget] = useState<BackupEntry | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BackupEntry | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const addToast = (type: "success" | "error", message: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

  const fetchBackups = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/backup", { credentials: "include" })
      if (res.status === 403) {
        setAccessDenied(true)
        setLoading(false)
        return
      }
      const data = await res.json()
      setBackups(data.backups || [])
      setStats(data.stats || { total: 0, completed: 0, failed: 0, totalSizeBytes: 0 })
    } catch {
    }
    setLoading(false)
  }, [])

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/backup/schedule", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setScheduleConfig(data.schedule)
      }
    } catch {
    }
  }, [])

  useEffect(() => {
    fetchBackups()
    fetchSchedule()
  }, [fetchBackups, fetchSchedule])

  useEffect(() => {
    const hasRunning = backups.some(b => b.status === "RUNNING")
    if (hasRunning) {
      pollRef.current = setInterval(fetchBackups, 5000)
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [backups, fetchBackups])

  const handleDownload = async (backup: BackupEntry) => {
    setDownloading(backup.id)
    try {
      const res = await fetch(`/api/admin/backup/${backup.id}/download`, { credentials: "include" })
      if (!res.ok) {
        addToast("error", "Download failed")
        setDownloading(null)
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = backup.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      addToast("error", "Download failed")
    }
    setDownloading(null)
  }

  const statCards = [
    {
      label: "Total Backups",
      value: stats.total,
      icon: Database,
      color: "#3B82F6",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "#10B981",
    },
    {
      label: "Failed",
      value: stats.failed,
      icon: AlertTriangle,
      color: stats.failed > 0 ? "#EF4444" : "#6B7280",
    },
    {
      label: "Total Size",
      value: formatBytes(stats.totalSizeBytes),
      icon: HardDrive,
      color: "#C9A227",
    },
  ]

  if (accessDenied) {
    return (
      <>
        <AdminTopbar title="Backup Management" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Lock size={28} className="text-red-500" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-1">Access Restricted</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              This page is only accessible to Super Admins.
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminTopbar title="Backup Management" />

      <div className="p-6 space-y-6 max-w-[1400px]">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Database Backups</h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              Manage, schedule, and restore database backups
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setLoading(true); fetchBackups() }}
              disabled={loading}
              className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] border border-[var(--color-border)] px-3 py-2 rounded-xl hover:border-[#C9A227] transition-all disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#C9A227" }}
            >
              <Plus size={16} />
              Create Backup
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-4 flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}18` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <p className="font-display font-bold text-xl text-[var(--color-text)]">{value}</p>
                <p className="text-[10px] font-semibold text-[var(--color-text-muted)]">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
              <Database size={14} style={{ color: "#C9A227" }} />
              Backup History
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">
              {backups.length} record{backups.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
            </div>
          ) : backups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--color-text-muted)]">
              <Database size={36} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">No backups yet</p>
              <p className="text-xs mt-1">Create your first backup to get started</p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#C9A227" }}
              >
                <Plus size={14} />
                Create Backup
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/40">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Name / Type
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden sm:table-cell">
                      Size
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden md:table-cell">
                      Created By
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden lg:table-cell">
                      Created At
                    </th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup, i) => (
                    <motion.tr
                      key={backup.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)]/20 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          <p className="font-semibold text-[var(--color-text)] text-sm leading-tight">
                            {backup.name}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <ScheduleBadge schedule={backup.schedule} />
                            {backup.notes && (
                              <span className="text-[10px] text-[var(--color-text-muted)] max-w-[200px] truncate">
                                {backup.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <StatusBadge status={backup.status} />
                          {backup.error && (
                            <p className="text-[10px] text-red-400 max-w-[160px] truncate" title={backup.error}>
                              {backup.error}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-sm text-[var(--color-text-muted)]">
                          {backup.sizeBytes > 0 ? formatBytes(backup.sizeBytes) : "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-sm text-[var(--color-text-muted)]">{backup.createdBy}</span>
                      </td>

                      <td className="px-5 py-4 hidden lg:table-cell">
                        <div className="space-y-0.5">
                          <p className="text-xs text-[var(--color-text)]">{formatDate(backup.createdAt)}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                            <Clock size={9} />
                            {relativeTime(backup.createdAt)}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleDownload(backup)}
                            disabled={backup.status !== "COMPLETED" || downloading === backup.id}
                            title="Download"
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[#3B82F6] hover:border-[#3B82F6]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            {downloading === backup.id
                              ? <Loader2 size={14} className="animate-spin" />
                              : <Download size={14} />
                            }
                          </button>

                          <button
                            onClick={() => setRestoreTarget(backup)}
                            disabled={backup.status !== "COMPLETED"}
                            title="Restore"
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[#C9A227] hover:border-[#C9A227]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <RotateCcw size={14} />
                          </button>

                          <button
                            onClick={() => setDeleteTarget(backup)}
                            disabled={backup.status === "RUNNING"}
                            title="Delete"
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-red-500 hover:border-red-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {scheduleConfig && (
          <ScheduleSection scheduleConfig={scheduleConfig} addToast={addToast} />
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateBackupModal
            onClose={() => setShowCreate(false)}
            onCreated={fetchBackups}
            addToast={addToast}
          />
        )}
        {restoreTarget && (
          <RestoreModal
            backup={restoreTarget}
            onClose={() => setRestoreTarget(null)}
            onRestored={fetchBackups}
            addToast={addToast}
          />
        )}
        {deleteTarget && (
          <DeleteConfirm
            backup={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onDeleted={fetchBackups}
            addToast={addToast}
          />
        )}
      </AnimatePresence>

      <ToastBar toasts={toasts} remove={removeToast} />
    </>
  )
}
