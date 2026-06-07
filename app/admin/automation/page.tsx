"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Zap, Mail, MessageCircle, Phone, CheckSquare, Plus, Trash2,
  Loader2, RefreshCw, X, Save, AlertCircle, ToggleLeft, ToggleRight,
  Clock, Play, BarChart2,
} from "lucide-react"
import { AdminTopbar } from "@/components/admin/AdminSidebar"

const INPUT = "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all placeholder:text-[var(--color-text-muted)]"
const LABEL = "block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5"

const TRIGGER_LABELS: Record<string, string> = {
  lead_created: "New lead added",
  lead_status_changed: "Lead status changes",
  order_placed: "New order placed",
  time_after_lead: "X hours after lead created",
  no_contact_days: "No contact in X days",
}

const ACTION_LABELS: Record<string, string> = {
  send_email: "Send Email",
  send_whatsapp: "Send WhatsApp",
  send_sms: "Send SMS",
  create_task: "Create Task",
}

const ACTION_CHANNEL: Record<string, string> = {
  send_email: "email",
  send_whatsapp: "whatsapp",
  send_sms: "sms",
  create_task: "email",
}

const CHANNEL_CONFIG: Record<string, { color: string; bg: string; icon: typeof Mail }> = {
  email: { color: "#0891B2", bg: "#0891B215", icon: Mail },
  whatsapp: { color: "#25D366", bg: "#25D36615", icon: MessageCircle },
  sms: { color: "#7C3AED", bg: "#7C3AED15", icon: Phone },
}

const QUICK_TEMPLATES = [
  {
    name: "Welcome New Lead",
    trigger: "lead_created",
    action: "send_email",
    channel: "email",
    delayHours: 0,
    triggerValue: "",
    template: "Namaskar {{name}}!\n\nKVL TECH mein aapka swagat hai. Aapki requirement ke baare mein baat karte hain — free consultation ke liye reply karein.\n\nHum aapke business ko digital banaane mein help karenge.\n\nKVL TECH Team",
  },
  {
    name: "3 Day Follow-up",
    trigger: "time_after_lead",
    action: "send_email",
    channel: "email",
    delayHours: 72,
    triggerValue: "72",
    template: "Namaskar {{name}},\n\n3 din pehle aapne {{service}} ke baare mein poochha tha. Kya aapne decision le liya?\n\nHum aapki help ke liye taiyaar hain. Reply karein ya call karein: +91 9942000413\n\nKVL TECH Team",
  },
  {
    name: "7 Day Re-engage",
    trigger: "no_contact_days",
    action: "send_email",
    channel: "email",
    delayHours: 0,
    triggerValue: "7",
    template: "Namaskar {{name}},\n\nKaafi din ho gaye, aapko yaad kiya! KVL TECH abhi bhi aapki service ke liye taiyaar hai.\n\nHamara special offer abhi bhi valid hai. Aaj hi contact karein!\n\nKVL TECH Team",
  },
  {
    name: "Post-Order Thank You",
    trigger: "order_placed",
    action: "send_email",
    channel: "email",
    delayHours: 0,
    triggerValue: "",
    template: "Namaskar {{name}},\n\nAapka order place karne ke liye shukriya! Hum abhi se kaam shuru kar rahe hain.\n\nAapka project team aapko 24 ghante mein contact karega.\n\nKVL TECH Team",
  },
]

interface Rule {
  id: string
  name: string
  trigger: string
  triggerValue: string | null
  action: string
  channel: string
  template: string | null
  delayHours: number
  isActive: boolean
  runCount: number
  createdAt: string
}

const EMPTY_FORM = {
  name: "",
  trigger: "lead_created",
  triggerValue: "",
  action: "send_email",
  channel: "email",
  template: "",
  delayHours: 0,
}

export default function AutomationPage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchRules = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/automation", { credentials: "include" })
      if (res.ok) setRules(await res.json())
    } catch { }
    setLoading(false)
  }, [])

  useEffect(() => { fetchRules() }, [fetchRules])

  const openModal = (template?: typeof QUICK_TEMPLATES[0]) => {
    if (template) {
      setForm({
        name: template.name,
        trigger: template.trigger,
        triggerValue: template.triggerValue,
        action: template.action,
        channel: template.channel,
        template: template.template,
        delayHours: template.delayHours,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError("")
    setShowModal(true)
  }

  const handleActionChange = (action: string) => {
    setForm(f => ({ ...f, action, channel: ACTION_CHANNEL[action] ?? "email" }))
  }

  const handleSave = async () => {
    if (!form.name || !form.trigger || !form.action) {
      setError("Name, trigger, and action are required.")
      return
    }
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/admin/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || "Failed to save")
      } else {
        setShowModal(false)
        await fetchRules()
      }
    } catch {
      setError("Network error. Please try again.")
    }
    setSaving(false)
  }

  const toggleActive = async (rule: Rule) => {
    setTogglingId(rule.id)
    try {
      await fetch(`/api/admin/automation?id=${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !rule.isActive }),
      })
      await fetchRules()
    } catch { }
    setTogglingId(null)
  }

  const deleteRule = async (id: string) => {
    setDeletingId(id)
    try {
      await fetch(`/api/admin/automation?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      await fetchRules()
    } catch { }
    setDeletingId(null)
  }

  const totalRules = rules.length
  const activeRules = rules.filter(r => r.isActive).length
  const emailRunCount = rules.filter(r => r.channel === "email").reduce((s, r) => s + r.runCount, 0)
  const mostActive = rules.reduce<Rule | null>((best, r) => (!best || r.runCount > best.runCount) ? r : best, null)

  const needsTriggerValue = (trigger: string) => trigger === "time_after_lead" || trigger === "no_contact_days"

  return (
    <>
      <AdminTopbar title="Marketing Automation" />
      <div className="p-6 space-y-6 max-w-[1400px]">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-[var(--color-text)]">Automation Rules</h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Trigger-based messages and tasks</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchRules}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all text-[var(--color-text-muted)]"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => openModal()}
              className="btn-gold flex items-center gap-2 text-sm px-4 py-2"
            >
              <Plus size={15} /> Create Rule
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--color-gold)]/10">
                <Zap size={17} style={{ color: "var(--color-gold)" }} />
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">Total Rules</p>
            </div>
            <p className="font-display font-bold text-2xl text-[var(--color-text)]">{totalRules}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{activeRules} active</p>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#0891B2]/10">
                <Mail size={17} style={{ color: "#0891B2" }} />
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">Emails via Automation</p>
            </div>
            <p className="font-display font-bold text-2xl text-[var(--color-text)]">{emailRunCount}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Total runs</p>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-500/10">
                <BarChart2 size={17} className="text-green-500" />
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">Most Active Rule</p>
            </div>
            <p className="font-display font-bold text-sm text-[var(--color-text)] truncate">
              {mostActive ? mostActive.name : "—"}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {mostActive ? `${mostActive.runCount} runs` : "No runs yet"}
            </p>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-4 flex items-center gap-2">
            <Play size={15} className="text-[var(--color-gold)]" /> Quick Add Templates
          </h3>
          <div className="flex flex-wrap gap-2">
            {QUICK_TEMPLATES.map(t => (
              <button
                key={t.name}
                onClick={() => openModal(t)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all text-[var(--color-text-secondary)]"
              >
                <Zap size={11} /> {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={24} className="animate-spin text-[var(--color-gold)]" />
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-16 text-[var(--color-text-muted)]">
              <Zap size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No automation rules yet</p>
              <p className="text-xs mt-1">Create your first rule or use a quick template above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                    {["Rule Name", "Trigger", "Action", "Channel", "Delay", "Runs", "Active", ""].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-[var(--color-text-muted)] px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {rules.map(rule => {
                    const chCfg = CHANNEL_CONFIG[rule.channel] ?? CHANNEL_CONFIG.email
                    const ChIcon = chCfg.icon
                    return (
                      <tr key={rule.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[var(--color-text)]">{rule.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-[var(--color-text-secondary)]">
                            {TRIGGER_LABELS[rule.trigger] ?? rule.trigger}
                          </span>
                          {rule.triggerValue && (
                            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]">
                              {rule.triggerValue}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-[var(--color-text-secondary)]">
                            {ACTION_LABELS[rule.action] ?? rule.action}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg w-fit" style={{ color: chCfg.color, background: chCfg.bg }}>
                            <ChIcon size={11} /> {rule.channel.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                            <Clock size={11} /> {rule.delayHours}h
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-[var(--color-text)]">{rule.runCount}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleActive(rule)}
                            disabled={togglingId === rule.id}
                            className="transition-colors disabled:opacity-50"
                          >
                            {togglingId === rule.id ? (
                              <Loader2 size={18} className="animate-spin text-[var(--color-text-muted)]" />
                            ) : rule.isActive ? (
                              <ToggleRight size={22} style={{ color: "var(--color-gold)" }} />
                            ) : (
                              <ToggleLeft size={22} className="text-[var(--color-text-muted)]" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteRule(rule.id)}
                            disabled={deletingId === rule.id}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--color-border)] hover:border-red-500 hover:text-red-500 transition-all text-[var(--color-text-muted)] disabled:opacity-50"
                          >
                            {deletingId === rule.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[var(--color-bg)] rounded-2xl w-full max-w-lg shadow-[var(--shadow-luxury)] overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[var(--color-gold)]" />
                <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Create Automation Rule</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div>
                <label className={LABEL}>Rule Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Welcome New Lead"
                  className={INPUT}
                />
              </div>

              <div>
                <label className={LABEL}>Trigger *</label>
                <select
                  value={form.trigger}
                  onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}
                  className={INPUT}
                >
                  {Object.entries(TRIGGER_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              {needsTriggerValue(form.trigger) && (
                <div>
                  <label className={LABEL}>
                    {form.trigger === "time_after_lead" ? "Hours after lead created" : "Days without contact"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.triggerValue}
                    onChange={e => setForm(f => ({ ...f, triggerValue: e.target.value }))}
                    placeholder={form.trigger === "time_after_lead" ? "e.g. 72" : "e.g. 7"}
                    className={INPUT}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>Action *</label>
                  <select
                    value={form.action}
                    onChange={e => handleActionChange(e.target.value)}
                    className={INPUT}
                  >
                    {Object.entries(ACTION_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Channel (auto)</label>
                  <input value={form.channel} readOnly className={INPUT + " opacity-60 cursor-not-allowed"} />
                </div>
              </div>

              <div>
                <label className={LABEL}>Delay (hours after trigger)</label>
                <input
                  type="number"
                  min={0}
                  value={form.delayHours}
                  onChange={e => setForm(f => ({ ...f, delayHours: Number(e.target.value) }))}
                  className={INPUT}
                />
              </div>

              <div>
                <label className={LABEL}>Message Template</label>
                <textarea
                  rows={5}
                  value={form.template}
                  onChange={e => setForm(f => ({ ...f, template: e.target.value }))}
                  placeholder="Write your message here..."
                  className={INPUT + " resize-none"}
                />
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">
                  Available variables: <code className="bg-[var(--color-bg-secondary)] px-1 rounded">{"{{name}}"}</code>{" "}
                  <code className="bg-[var(--color-bg-secondary)] px-1 rounded">{"{{phone}}"}</code>{" "}
                  <code className="bg-[var(--color-bg-secondary)] px-1 rounded">{"{{service}}"}</code>{" "}
                  <code className="bg-[var(--color-bg-secondary)] px-1 rounded">{"{{company}}"}</code>
                </p>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="btn-outline flex-1 text-sm">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-gold flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? "Saving..." : "Save Rule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
