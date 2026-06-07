"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, RefreshCw, ChevronDown, ExternalLink, Download } from "lucide-react"
import { AdminTopbar } from "@/components/admin/AdminSidebar"

type Application = {
  id: string
  name: string
  email: string
  phone: string
  position: string
  experience: string | null
  portfolio: string | null
  coverLetter: string | null
  status: string
  createdAt: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:     { label: "Pending",     color: "#9CA3AF", bg: "#9CA3AF15" },
  REVIEWING:   { label: "Reviewing",   color: "#F59E0B", bg: "#F59E0B15" },
  SHORTLISTED: { label: "Shortlisted", color: "#0891B2", bg: "#0891B215" },
  REJECTED:    { label: "Rejected",    color: "#EF4444", bg: "#EF444415" },
  HIRED:       { label: "Hired",       color: "#16A34A", bg: "#16A34A15" },
}

const ALL_STATUSES = Object.entries(STATUS_CONFIG).map(([v, { label }]) => ({ value: v, label }))

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [updating, setUpdating] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      const res = await fetch(`/api/applications?${params}`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setApplications(data.applications || [])
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { fetchApplications() }, [fetchApplications])

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id)
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) await fetchApplications()
    } catch (e) { console.error(e) }
    setUpdating(null)
  }

  const filtered = applications.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.position.toLowerCase().includes(search.toLowerCase())
  )

  const FILTERS = [{ label: "All", value: "all" }, ...ALL_STATUSES]

  return (
    <>
      <AdminTopbar title="Job Applications" />
      <div className="p-6 space-y-6 max-w-[1400px]">

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total", count: applications.length, color: "#9CA3AF" },
            { label: "Pending",     count: applications.filter(a => a.status === "PENDING").length,     color: "#9CA3AF" },
            { label: "Reviewing",   count: applications.filter(a => a.status === "REVIEWING").length,   color: "#F59E0B" },
            { label: "Shortlisted", count: applications.filter(a => a.status === "SHORTLISTED").length, color: "#0891B2" },
            { label: "Hired",       count: applications.filter(a => a.status === "HIRED").length,       color: "#16A34A" },
          ].map(({ label, count, color }) => (
            <div key={label} className="card p-4 text-center">
              <p className="text-2xl font-extrabold" style={{ color }}>{count}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or position..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(({ label, value }) => (
              <button key={value} onClick={() => setStatusFilter(value)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === value ? "bg-[var(--color-navy)] text-white" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]"}`}>
                {label}
              </button>
            ))}
            <button onClick={fetchApplications} className="p-2.5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-colors">
              <RefreshCw size={14} className="text-[var(--color-text-muted)]" />
            </button>
            <a href="/api/admin/export?type=applications&format=csv" download
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all">
              <Download size={13} /> Export CSV
            </a>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-secondary)]">
                <tr>
                  {["Name", "Position", "Experience", "Contact", "Status", "Date", ""].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-t border-[var(--color-border)]">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="py-4 px-4">
                          <div className="h-4 rounded bg-[var(--color-bg-secondary)] animate-pulse w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-sm text-[var(--color-text-muted)]">
                      No applications found
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => {
                    const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING
                    const isExpanded = expanded === app.id
                    return (
                      <React.Fragment key={app.id}>
                        <tr className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="text-sm font-semibold text-[var(--color-text)]">{app.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">{app.email}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="text-sm text-[var(--color-text)]">{app.position}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="text-sm text-[var(--color-text-secondary)]">{app.experience || "—"}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="text-sm text-[var(--color-text-secondary)]">{app.phone || "—"}</p>
                            {app.portfolio && (
                              <a href={app.portfolio} target="_blank" rel="noopener noreferrer"
                                className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "var(--color-gold)" }}>
                                Portfolio <ExternalLink size={10} />
                              </a>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="relative">
                              <select
                                value={app.status}
                                disabled={updating === app.id}
                                onChange={e => handleStatusChange(app.id, e.target.value)}
                                className="text-xs font-semibold px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer appearance-none pr-6 disabled:opacity-50"
                                style={{ background: sc.bg, color: sc.color }}
                              >
                                {ALL_STATUSES.map(s => (
                                  <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                              </select>
                              <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: sc.color }} />
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <p className="text-xs text-[var(--color-text-muted)]">
                              {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => setExpanded(isExpanded ? null : app.id)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-colors text-[var(--color-text-secondary)]"
                            >
                              {isExpanded ? "Hide" : "View"}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                            <td colSpan={7} className="px-6 py-4">
                              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Cover Letter / Why KVL TECH</p>
                                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">
                                  {app.coverLetter || "No cover letter provided."}
                                </p>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  )
}
