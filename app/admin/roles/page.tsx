"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Shield, Plus, Pencil, Trash2, X, Check, Loader2, Users, Lock,
  ChevronRight, History, GitBranch, Layers, Building2,
} from "lucide-react"
import { AdminTopbar } from "@/components/admin/AdminSidebar"

// ─── Constants ───────────────────────────────────────────────────────────────

const MODULES = [
  "ORDERS", "LEADS", "CLIENTS", "PRODUCTS", "BLOG",
  "MARKETING", "ANALYTICS", "SUPPORT", "BILLING", "AUDIT", "SETTINGS",
]

const ACTIONS = ["VIEW", "CREATE", "EDIT", "DELETE", "EXPORT", "MANAGE"] as const
type Action = typeof ACTIONS[number]

const COLOR_PRESETS = [
  "#6366F1", "#0891B2", "#16A34A", "#DC2626", "#D97706", "#C9A227",
]

const DEPARTMENTS = ["Engineering", "Sales", "Support", "Marketing", "Operations"]

// ─── Types ────────────────────────────────────────────────────────────────────

interface RolePermission {
  module: string
  action: Action
}

interface ParentRole {
  id: string
  name: string
  color: string
}

interface Role {
  id: string
  name: string
  description: string | null
  color: string
  isSystem: boolean
  department: string | null
  parentRole: ParentRole | null
  childrenCount: number
  permissionsCount: number
  adminsCount: number
  permissions: RolePermission[]
  createdAt: string
}

interface TreeRole extends Role {
  children: TreeRole[]
}

interface AuditLog {
  id: string
  adminId: string
  adminName: string
  roleId: string
  roleName: string
  action: string
  changes: string
  ip: string | null
  createdAt: string
}

// ─── Permission Matrix Helpers ────────────────────────────────────────────────

const emptyMatrix = (): Record<string, Record<Action, boolean>> =>
  Object.fromEntries(
    MODULES.map(m => [m, Object.fromEntries(ACTIONS.map(a => [a, false])) as Record<Action, boolean>])
  )

function permissionsToMatrix(perms: RolePermission[]): Record<string, Record<Action, boolean>> {
  const matrix = emptyMatrix()
  for (const { module, action } of perms) {
    if (matrix[module] && ACTIONS.includes(action as Action)) {
      matrix[module][action as Action] = true
    }
  }
  return matrix
}

function matrixToPermissions(matrix: Record<string, Record<Action, boolean>>): RolePermission[] {
  const perms: RolePermission[] = []
  for (const module of MODULES) {
    for (const action of ACTIONS) {
      if (matrix[module]?.[action]) perms.push({ module, action })
    }
  }
  return perms
}

// ─── Audit Log Helpers ────────────────────────────────────────────────────────

function parseChanges(changesJson: string): string {
  try {
    const c = JSON.parse(changesJson)
    if (c.added || c.removed) {
      const parts: string[] = []
      if (c.added?.length) parts.push(`Added: ${c.added.join(", ")}`)
      if (c.removed?.length) parts.push(`Removed: ${c.removed.join(", ")}`)
      return parts.join(" · ") || "No changes"
    }
    if (c.inheritedFrom) {
      return `Created${c.inheritedFrom ? ` (inherits from ${c.inheritedFrom})` : ""}`
    }
    if (c.permissions?.length) {
      return `Permissions: ${c.permissions.map((p: RolePermission) => `${p.module}.${p.action}`).join(", ")}`
    }
    return JSON.stringify(c)
  } catch {
    return changesJson
  }
}

function auditActionColor(action: string): string {
  if (action === "ROLE_CREATED") return "text-green-400 bg-green-500/10 border-green-500/20"
  if (action === "ROLE_DELETED") return "text-red-400 bg-red-500/10 border-red-500/20"
  return "text-orange-400 bg-orange-500/10 border-orange-500/20"
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
}

// ─── Role Modal ───────────────────────────────────────────────────────────────

interface RoleModalProps {
  role: Role | null
  allRoles: Role[]
  onClose: () => void
  onSaved: () => void
}

function RoleModal({ role, allRoles, onClose, onSaved }: RoleModalProps) {
  const [name, setName] = useState(role?.name || "")
  const [description, setDescription] = useState(role?.description || "")
  const [color, setColor] = useState(role?.color || COLOR_PRESETS[0])
  const [department, setDepartment] = useState(role?.department || "")
  const [parentRoleId, setParentRoleId] = useState(role?.parentRole?.id || "")
  const [matrix, setMatrix] = useState<Record<string, Record<Action, boolean>>>(
    role ? permissionsToMatrix(role.permissions) : emptyMatrix()
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Compute inherited permissions when parent changes
  const parentRole = allRoles.find(r => r.id === parentRoleId) || null
  const inheritedKeys = new Set(
    parentRole?.permissions.map(p => `${p.module}:${p.action}`) || []
  )

  // Eligible parents: exclude self and descendants
  const getDescendantIds = (roleId: string, roles: Role[]): Set<string> => {
    const ids = new Set<string>()
    const queue = [roleId]
    while (queue.length) {
      const cur = queue.shift()!
      roles.forEach(r => {
        if (r.parentRole?.id === cur) { ids.add(r.id); queue.push(r.id) }
      })
    }
    return ids
  }

  const excludedIds = role
    ? new Set([role.id, ...getDescendantIds(role.id, allRoles)])
    : new Set<string>()

  const eligibleParents = allRoles.filter(r => !excludedIds.has(r.id))

  const toggleCell = (module: string, action: Action) => {
    setMatrix(prev => ({
      ...prev,
      [module]: { ...prev[module], [action]: !prev[module][action] },
    }))
  }

  const toggleRow = (module: string) => {
    const allOn = ACTIONS.every(a => matrix[module][a])
    setMatrix(prev => ({
      ...prev,
      [module]: Object.fromEntries(ACTIONS.map(a => [a, !allOn])) as Record<Action, boolean>,
    }))
  }

  const toggleCol = (action: Action) => {
    const allOn = MODULES.every(m => matrix[m][action])
    setMatrix(prev => {
      const next = { ...prev }
      for (const m of MODULES) next[m] = { ...next[m], [action]: !allOn }
      return next
    })
  }

  const handleSave = async () => {
    if (!name.trim()) { setError("Role name is required"); return }
    setSaving(true)
    setError("")
    const permissions = matrixToPermissions(matrix)
    const body = {
      id: role?.id,
      name,
      description,
      color,
      department: department || null,
      parentRoleId: parentRoleId || null,
      permissions,
    }
    const method = role ? "PATCH" : "POST"

    const res = await fetch("/api/admin/roles", {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || "Failed to save"); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {role ? "Edit Role" : "Create Role"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-colors">
            <X size={16} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {error && (
            <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
          )}

          {/* Row 1: Name + Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5 block">
                Role Name *
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Content Manager"
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm outline-none focus:border-[#C9A227] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5 block">
                Color
              </label>
              <div className="flex items-center gap-2 py-1">
                {COLOR_PRESETS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-full border-2 transition-all"
                    style={{ backgroundColor: c, borderColor: color === c ? "white" : "transparent" }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Description */}
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5 block">
              Description
            </label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm outline-none focus:border-[#C9A227] transition-colors"
            />
          </div>

          {/* Row 3: Department + Parent Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5 block">
                Department
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm outline-none focus:border-[#C9A227] transition-colors"
              >
                <option value="">No Department</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5 block">
                Inherits From
              </label>
              <select
                value={parentRoleId}
                onChange={e => setParentRoleId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm outline-none focus:border-[#C9A227] transition-colors"
              >
                <option value="">None (Top-level role)</option>
                {eligibleParents.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              {parentRole && (
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Will inherit {parentRole.permissions.length} permissions from {parentRole.name}
                </p>
              )}
            </div>
          </div>

          {/* Permission Matrix */}
          <div>
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 block">
              Permission Matrix
              {parentRole && (
                <span className="ml-2 text-[10px] font-normal normal-case text-[var(--color-text-muted)]">
                  — gray shaded = inherited from {parentRole.name}
                </span>
              )}
            </label>
            <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                    <th className="text-left px-4 py-2.5 text-[var(--color-text-muted)] font-semibold text-xs uppercase tracking-wider w-36">
                      Module
                    </th>
                    {ACTIONS.map(a => (
                      <th key={a} className="px-2 py-2.5 text-center">
                        <button
                          onClick={() => toggleCol(a)}
                          className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hover:text-[#C9A227] transition-colors"
                        >
                          {a}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((mod, i) => (
                    <tr
                      key={mod}
                      className={`border-b border-[var(--color-border)] last:border-0 ${i % 2 === 0 ? "" : "bg-[var(--color-bg-secondary)]/40"}`}
                    >
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => toggleRow(mod)}
                          className="text-xs font-semibold text-[var(--color-text)] hover:text-[#C9A227] transition-colors text-left"
                        >
                          {mod}
                        </button>
                      </td>
                      {ACTIONS.map(action => {
                        const isInherited = inheritedKeys.has(`${mod}:${action}`)
                        const isChecked = matrix[mod][action]
                        return (
                          <td key={action} className="px-2 py-2.5 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <button
                                onClick={() => toggleCell(mod, action)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-all ${
                                  isChecked
                                    ? "border-[#C9A227] bg-[#C9A227]"
                                    : isInherited
                                    ? "border-gray-500/40 bg-gray-500/10 hover:border-[#C9A227]/50"
                                    : "border-[var(--color-border)] bg-transparent hover:border-[#C9A227]/50"
                                }`}
                              >
                                {isChecked && <Check size={11} className="text-white" strokeWidth={3} />}
                              </button>
                              {isInherited && !isChecked && (
                                <span className="text-[8px] text-gray-500 leading-none">↑</span>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
              Click module name to toggle row · Click action header to toggle column
              {parentRole && " · ↑ indicates inherited permission"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)] shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all disabled:opacity-60"
            style={{ backgroundColor: "#C9A227" }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {role ? "Update Role" : "Create Role"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Hierarchy Tree Node ──────────────────────────────────────────────────────

interface TreeNodeProps {
  role: TreeRole
  depth?: number
  onEdit: (role: Role) => void
}

function TreeNode({ role, depth = 0, onEdit }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = role.children.length > 0

  return (
    <div className={depth > 0 ? "ml-6 border-l border-[var(--color-border)] pl-4" : ""}>
      <div className="flex items-center gap-2 py-2 group">
        {hasChildren ? (
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-4 h-4 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[#C9A227] transition-colors shrink-0"
          >
            <ChevronRight size={12} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        ) : (
          <span className="w-4 h-4 shrink-0" />
        )}

        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: role.color }} />

        <span className="font-semibold text-sm text-[var(--color-text)]">{role.name}</span>

        {role.department && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
            {role.department}
          </span>
        )}

        {role.isSystem && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0B1437]/20 text-[#0B1437] dark:bg-white/10 dark:text-white/60 border border-[var(--color-border)]">
            SYSTEM
          </span>
        )}

        <span className="text-[11px] text-[var(--color-text-muted)] ml-1">
          {role.permissionsCount} perms · {role.adminsCount} admins
        </span>

        <button
          onClick={() => onEdit(role)}
          className="ml-auto opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[#C9A227] hover:border-[#C9A227]/50 transition-all"
        >
          <Pencil size={11} />
        </button>
      </div>

      {hasChildren && expanded && (
        <div>
          {role.children.map(child => (
            <TreeNode key={child.id} role={child} depth={depth + 1} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Hierarchy Tab ────────────────────────────────────────────────────────────

interface HierarchyTabProps {
  roles: Role[]
  onEdit: (role: Role) => void
}

function HierarchyTab({ roles, onEdit }: HierarchyTabProps) {
  // Build tree from flat list
  const roleMap = new Map<string, TreeRole>()
  for (const r of roles) {
    roleMap.set(r.id, { ...r, children: [] })
  }

  const roots: TreeRole[] = []
  for (const r of roleMap.values()) {
    if (r.parentRole?.id && roleMap.has(r.parentRole.id)) {
      roleMap.get(r.parentRole.id)!.children.push(r)
    } else {
      roots.push(r)
    }
  }

  if (roots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--color-text-muted)]">
        <GitBranch size={36} className="mb-3 opacity-40" />
        <p className="text-sm font-medium">No hierarchy configured</p>
        <p className="text-xs mt-1">Assign parent roles to build a hierarchy</p>
      </div>
    )
  }

  return (
    <div className="p-5">
      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        Role hierarchy — children inherit permissions from parents. Hover a role to edit.
      </p>
      {roots.map(root => (
        <TreeNode key={root.id} role={root} onEdit={onEdit} />
      ))}
    </div>
  )
}

// ─── Audit Log Tab ────────────────────────────────────────────────────────────

interface AuditTabProps {
  roles: Role[]
}

function AuditTab({ roles }: AuditTabProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRoleId, setFilterRoleId] = useState("")
  const [limit, setLimit] = useState(50)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: String(limit) })
    if (filterRoleId) params.set("roleId", filterRoleId)
    const res = await fetch(`/api/admin/permission-audit?${params}`, { credentials: "include" })
    const data = await res.json()
    setLogs(data.logs || [])
    setLoading(false)
  }, [filterRoleId, limit])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  return (
    <div className="p-5 space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={filterRoleId}
          onChange={e => { setFilterRoleId(e.target.value); setLimit(50) }}
          className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm outline-none focus:border-[#C9A227] transition-colors"
        >
          <option value="">All Roles</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <span className="text-xs text-[var(--color-text-muted)]">{logs.length} entries</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--color-text-muted)]">
          <History size={36} className="mb-3 opacity-40" />
          <p className="text-sm font-medium">No audit logs yet</p>
          <p className="text-xs mt-1">Logs appear when roles are created, updated, or deleted</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden sm:table-cell">Admin</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden md:table-cell">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Changes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr
                    key={log.id}
                    className={`border-b border-[var(--color-border)] last:border-0 ${i % 2 === 0 ? "" : "bg-[var(--color-bg-secondary)]/30"}`}
                  >
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                      {formatTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text)] hidden sm:table-cell">
                      {log.adminName}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${auditActionColor(log.action)}`}>
                        {log.action.replace("ROLE_", "")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-[var(--color-text)] hidden md:table-cell">
                      {log.roleName}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] max-w-xs truncate">
                      {parseChanges(log.changes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logs.length >= limit && (
            <div className="flex justify-center">
              <button
                onClick={() => setLimit(l => l + 50)}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Field Permission Matrix Tab ─────────────────────────────────────────────

const FIELD_RESOURCES = [
  {
    key: "client",
    label: "Clients",
    categories: [
      { key: "basic", label: "Basic", color: "#3B82F6", desc: "id, name, email, city, phone" },
      { key: "financial", label: "Financial", color: "#10B981", desc: "totalSpent, subscriptions, payments" },
      { key: "sensitive", label: "Sensitive", color: "#EF4444", desc: "password, resetToken" },
      { key: "crm", label: "CRM", color: "#C9A227", desc: "score, source, notes, activities" },
    ],
  },
  {
    key: "order",
    label: "Orders",
    categories: [
      { key: "basic", label: "Basic", color: "#3B82F6", desc: "id, orderNumber, status, plan" },
      { key: "financial", label: "Financial", color: "#10B981", desc: "amount, payment, razorpayOrderId" },
      { key: "internal", label: "Internal", color: "#8B5CF6", desc: "internalNotes, adminAssignee" },
    ],
  },
  {
    key: "lead",
    label: "Leads",
    categories: [
      { key: "basic", label: "Basic", color: "#3B82F6", desc: "id, name, email, phone, service" },
      { key: "crm", label: "CRM", color: "#C9A227", desc: "score, status, notes, activities" },
      { key: "contact", label: "Contact", color: "#0891B2", desc: "company, city, website" },
    ],
  },
]

const ENTERPRISE_DEPARTMENTS = [
  { key: "SALES", name: "Sales", color: "#C9A227", modules: ["leads", "crm", "proposals", "referrals"] },
  { key: "SUPPORT", name: "Support", color: "#3B82F6", modules: ["support", "kb", "sla", "clients"] },
  { key: "FINANCE", name: "Finance", color: "#10B981", modules: ["billing", "orders", "payments", "subscriptions"] },
  { key: "TECH", name: "Technology", color: "#8B5CF6", modules: ["products", "api-keys", "webhooks", "integrations"] },
  { key: "MARKETING", name: "Marketing", color: "#EF4444", modules: ["blog", "marketing", "automation", "campaigns"] },
  { key: "OPERATIONS", name: "Operations", color: "#F59E0B", modules: ["team", "meetings", "settings", "audit"] },
]

type FieldMatrix = Record<string, Record<string, boolean>>

function FieldPermissionsTab({ roles }: { roles: Role[] }) {
  const [selectedRole, setSelectedRole] = useState<string>(roles[0]?.id || "")
  const [matrix, setMatrix] = useState<FieldMatrix>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Initialize matrix from selected role's existing permissions
  useEffect(() => {
    const role = roles.find(r => r.id === selectedRole)
    if (!role) return

    const m: FieldMatrix = {}
    for (const resource of FIELD_RESOURCES) {
      m[resource.key] = {}
      for (const cat of resource.categories) {
        // Check if role has module=resource & action=category permission
        m[resource.key][cat.key] = role.permissions.some(
          p => p.module === resource.key && (p.action === cat.key || p.action === "MANAGE")
        )
      }
    }
    setMatrix(m)
  }, [selectedRole, roles])

  const toggle = (resource: string, category: string) => {
    setMatrix(prev => ({
      ...prev,
      [resource]: { ...prev[resource], [category]: !prev[resource]?.[category] },
    }))
  }

  const saveMatrix = async () => {
    setSaving(true)
    setSaved(false)

    // Build permissions array from matrix
    const newPerms: Array<{ module: string; action: string }> = []
    for (const resource of FIELD_RESOURCES) {
      for (const cat of resource.categories) {
        if (matrix[resource.key]?.[cat.key]) {
          newPerms.push({ module: resource.key, action: cat.key })
        }
      }
    }

    // Also preserve existing non-field permissions
    const role = roles.find(r => r.id === selectedRole)
    const existingNonField = (role?.permissions || []).filter(p =>
      !FIELD_RESOURCES.some(r => r.key === p.module)
    )

    const allPerms = [
      ...existingNonField,
      ...newPerms,
    ]

    const res = await fetch("/api/admin/roles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: selectedRole, permissions: allPerms }),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  }

  return (
    <div className="p-5 space-y-6">
      {/* Role selector */}
      <div className="flex items-center gap-4">
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5 block">
            Configure field permissions for role
          </label>
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm outline-none focus:border-[#C9A227] transition-colors"
          >
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto">
          <button
            onClick={saveMatrix}
            disabled={saving || !selectedRole}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all"
            style={{ backgroundColor: "#C9A227" }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saved ? "Saved!" : saving ? "Saving..." : "Save Matrix"}
          </button>
        </div>
      </div>

      {/* Field permission matrix */}
      <div>
        <p className="text-xs text-[var(--color-text-muted)] mb-3">
          Control which data fields this role can access per resource type.
          Green = allowed, gray = denied.
        </p>
        <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider w-32">
                  Resource
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Field Categories
                </th>
              </tr>
            </thead>
            <tbody>
              {FIELD_RESOURCES.map((resource, i) => (
                <tr
                  key={resource.key}
                  className={`border-b border-[var(--color-border)] last:border-0 ${i % 2 === 0 ? "" : "bg-[var(--color-bg-secondary)]/40"}`}
                >
                  <td className="px-4 py-4 font-semibold text-sm text-[var(--color-text)]">
                    {resource.label}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {resource.categories.map(cat => {
                        const allowed = matrix[resource.key]?.[cat.key] || false
                        return (
                          <button
                            key={cat.key}
                            onClick={() => toggle(resource.key, cat.key)}
                            title={cat.desc}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              allowed
                                ? "text-white border-transparent"
                                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)]/50"
                            }`}
                            style={allowed ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                          >
                            {allowed ? <Check size={11} /> : <X size={11} />}
                            {cat.label}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">
                      {resource.categories.map(cat => (
                        <span key={cat.key} className="mr-2">
                          <span style={{ color: cat.color }}>●</span> {cat.label}: {cat.desc}
                        </span>
                      ))}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Assignment section */}
      <div>
        <h3 className="text-sm font-bold text-[var(--color-text)] mb-1 flex items-center gap-2">
          <Building2 size={14} className="text-[#C9A227]" /> Department Access Overview
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mb-4">
          Each department automatically grants access to its designated modules. Assign the role's department in the role editor.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ENTERPRISE_DEPARTMENTS.map(dept => (
            <div
              key={dept.key}
              className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
                <span className="text-sm font-semibold text-[var(--color-text)]">{dept.name}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {dept.modules.map(mod => (
                  <span
                    key={mod}
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded border"
                    style={{ color: dept.color, borderColor: `${dept.color}40`, backgroundColor: `${dept.color}10` }}
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "roles" | "hierarchy" | "audit" | "fields"

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("roles")
  const [deptFilter, setDeptFilter] = useState("")
  const [modalRole, setModalRole] = useState<Role | null | "new">(null)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/roles", { credentials: "include" })
    const data = await res.json()
    setRoles(data.roles || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/admin/roles?id=${deleteTarget.id}`, {
      method: "DELETE",
      credentials: "include",
    })
    setDeleting(false)
    setDeleteTarget(null)
    fetchRoles()
  }

  const filteredRoles = deptFilter
    ? roles.filter(r => r.department === deptFilter)
    : roles

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
      tab === t
        ? "bg-[#C9A227] text-white"
        : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
    }`

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      <AdminTopbar title="Role Management" />

      <main className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Roles & Permissions</h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              Define roles with granular module permissions for your team
            </p>
          </div>
          <button
            onClick={() => setModalRole("new")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#C9A227" }}
          >
            <Plus size={16} />
            Create Role
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button className={tabClass("roles")} onClick={() => setTab("roles")}>
            <Shield size={13} className="inline mr-1.5 -mt-0.5" />
            Roles
          </button>
          <button className={tabClass("hierarchy")} onClick={() => setTab("hierarchy")}>
            <GitBranch size={13} className="inline mr-1.5 -mt-0.5" />
            Hierarchy
          </button>
          <button className={tabClass("fields")} onClick={() => setTab("fields")}>
            <Layers size={13} className="inline mr-1.5 -mt-0.5" />
            Field Permissions
          </button>
          <button className={tabClass("audit")} onClick={() => setTab("audit")}>
            <History size={13} className="inline mr-1.5 -mt-0.5" />
            Audit Log
          </button>
        </div>

        {/* Roles Tab */}
        {tab === "roles" && (
          <>
            {/* Department filter */}
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm outline-none focus:border-[#C9A227] transition-colors"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <span className="text-xs text-[var(--color-text-muted)]">
                {filteredRoles.length} role{filteredRoles.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
                </div>
              ) : filteredRoles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-[var(--color-text-muted)]">
                  <Lock size={36} className="mb-3 opacity-40" />
                  <p className="text-sm font-medium">No roles found</p>
                  <p className="text-xs mt-1">
                    {deptFilter ? `No roles in ${deptFilter}` : "Create your first role to get started"}
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Role</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden lg:table-cell">Department</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden md:table-cell">Parent</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden md:table-cell">Description</th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-center">Perms</th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-center">Admins</th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoles.map(role => (
                      <tr key={role.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: role.color }} />
                            <span className="font-semibold text-[var(--color-text)]">{role.name}</span>
                            {role.isSystem && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0B1437]/20 text-[#0B1437] dark:bg-white/10 dark:text-white/60 border border-[var(--color-border)]">
                                SYSTEM
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          {role.department ? (
                            <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                              {role.department}
                            </span>
                          ) : (
                            <span className="text-[var(--color-text-muted)] opacity-40">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          {role.parentRole ? (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: role.parentRole.color }} />
                              <span className="text-xs text-[var(--color-text-muted)]">{role.parentRole.name}</span>
                            </div>
                          ) : (
                            <span className="text-[var(--color-text-muted)] opacity-40">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-[var(--color-text-muted)] hidden md:table-cell">
                          {role.description || <span className="opacity-40">—</span>}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text)]">
                            <Shield size={11} />
                            {role.permissionsCount}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text)]">
                            <Users size={11} />
                            {role.adminsCount}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setModalRole(role)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[#C9A227] hover:border-[#C9A227]/50 transition-all"
                            >
                              <Pencil size={14} />
                            </button>
                            {!role.isSystem && (
                              <button
                                onClick={() => setDeleteTarget(role)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-red-500 hover:border-red-500/50 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Field Permissions Tab */}
        {tab === "fields" && (
          <div className="bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
              </div>
            ) : roles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--color-text-muted)]">
                <Lock size={36} className="mb-3 opacity-40" />
                <p className="text-sm font-medium">No roles found</p>
                <p className="text-xs mt-1">Create roles first to configure field permissions</p>
              </div>
            ) : (
              <FieldPermissionsTab roles={roles} />
            )}
          </div>
        )}

        {/* Hierarchy Tab */}
        {tab === "hierarchy" && (
          <div className="bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
              </div>
            ) : (
              <HierarchyTab roles={roles} onEdit={r => setModalRole(r)} />
            )}
          </div>
        )}

        {/* Audit Log Tab */}
        {tab === "audit" && (
          <div className="bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
            <AuditTab roles={roles} />
          </div>
        )}
      </main>

      {/* Role Modal */}
      {(modalRole === "new" || (modalRole && typeof modalRole === "object")) && (
        <RoleModal
          role={modalRole === "new" ? null : modalRole as Role}
          allRoles={roles}
          onClose={() => setModalRole(null)}
          onSaved={() => { setModalRole(null); fetchRoles() }}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--color-text)]">Delete Role</h3>
                <p className="text-sm text-[var(--color-text-muted)]">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-5">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[var(--color-text)]">{deleteTarget.name}</span>?
              All permission assignments will be removed.
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
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
