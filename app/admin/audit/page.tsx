"use client"
import { useState, useEffect, useCallback } from "react"
import { Loader2, Download, ChevronLeft, ChevronRight, Shield } from "lucide-react"
import { AdminTopbar } from "@/components/admin/AdminSidebar"

interface AuditLog {
  id: string
  adminId: string | null
  adminName: string | null
  action: string
  resource: string
  resourceId: string | null
  details: string | null
  ip: string | null
  createdAt: string
}

const ACTION_COLORS: Record<string, string> = {
  UPDATE: "#0891B2",
  DELETE: "#EF4444",
  CREATE: "#16A34A",
  LOGIN: "#9CA3AF",
  proposal_generated: "#7C3AED",
}

const RESOURCES = ["all", "orders", "leads", "support", "products", "proposals"]

function getActionColor(action: string): string {
  const upper = action.toUpperCase()
  for (const [key, val] of Object.entries(ACTION_COLORS)) {
    if (upper.includes(key)) return val
  }
  return ACTION_COLORS[action] || "#9CA3AF"
}

function exportCsv(logs: AuditLog[]) {
  const header = ["Time", "Admin", "Action", "Resource", "Resource ID", "Details", "IP"]
  const rows = logs.map(l => [
    new Date(l.createdAt).toLocaleString("en-IN"),
    l.adminName || l.adminId || "System",
    l.action,
    l.resource,
    l.resourceId || "",
    (l.details || "").replace(/,/g, ";"),
    l.ip || "",
  ])
  const csv = [header, ...rows].map(r => r.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [resource, setResource] = useState("all")
  const [adminSearch, setAdminSearch] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const limit = 25

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(resource !== "all" ? { resource } : {}),
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
      })
      const res = await fetch(`/api/admin/audit-logs?${params}`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        let filtered = data.logs as AuditLog[]
        if (adminSearch.trim()) {
          const q = adminSearch.toLowerCase()
          filtered = filtered.filter(l =>
            (l.adminName || "").toLowerCase().includes(q) ||
            (l.adminId || "").toLowerCase().includes(q)
          )
        }
        setLogs(filtered)
        setTotal(data.total)
        setPages(data.pages)
      }
    } catch {}
    setLoading(false)
  }, [page, resource, dateFrom, dateTo, adminSearch])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  useEffect(() => { setPage(1) }, [resource, dateFrom, dateTo, adminSearch])

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <>
      <AdminTopbar title="Audit Logs" />
      <div className="p-6 max-w-[1400px] space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-gold)]/15 flex items-center justify-center">
              <Shield size={18} className="text-[var(--color-gold)]" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-[var(--color-text)]">Audit Logs</h1>
              <p className="text-xs text-[var(--color-text-muted)]">Track all admin actions across the system</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCsv(logs)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
            >
              <Download size={14} /> Export Audit CSV
            </button>
            <a
              href="/api/admin/export?type=orders"
              download
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
            >
              <Download size={14} /> Orders CSV
            </a>
            <a
              href="/api/admin/export?type=leads"
              download
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
            >
              <Download size={14} /> Leads CSV
            </a>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-2">
              {RESOURCES.map(r => (
                <button
                  key={r}
                  onClick={() => setResource(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${resource === r
                    ? "bg-[var(--color-gold)] text-[var(--color-navy)]"
                    : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]"}`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <input
                type="text"
                value={adminSearch}
                onChange={e => setAdminSearch(e.target.value)}
                placeholder="Search admin..."
                className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] transition-colors w-36"
              />
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
              />
              <span className="text-xs text-[var(--color-text-muted)]">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-[var(--color-gold)]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                    {["Time", "Admin", "Action", "Resource", "Resource ID", "Details"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-[var(--color-text-muted)]">
                        No audit logs found
                      </td>
                    </tr>
                  ) : logs.map(log => {
                    const color = getActionColor(log.action)
                    return (
                      <tr key={log.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-[var(--color-text)]">
                            {new Date(log.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">
                            {new Date(log.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-[var(--color-text)]">
                            {log.adminName || log.adminId || "System"}
                          </p>
                          {log.ip && (
                            <p className="text-[10px] text-[var(--color-text-muted)]">{log.ip}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-[10px] font-bold px-2 py-1 rounded-full uppercase"
                            style={{ color, background: `${color}18` }}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-[var(--color-text-secondary)] capitalize">
                            {log.resource}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-[var(--color-text-muted)] truncate max-w-[100px] block">
                            {log.resourceId ? log.resourceId.slice(0, 12) + "..." : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-[var(--color-text-secondary)] line-clamp-2 max-w-[240px]">
                            {log.details || "—"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              <p className="text-xs text-[var(--color-text-muted)]">
                Showing {from}–{to} of {total} logs
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs font-semibold text-[var(--color-text)]">
                  Page {page} / {pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
