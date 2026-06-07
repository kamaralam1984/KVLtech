"use client";

import { useState, useEffect } from "react";
import {
  FileSignature, Plus, X, ChevronDown, ChevronUp, Loader2, CheckCircle,
  Clock, AlertTriangle, Download, Trash2, User, Mail, Briefcase,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";

type SigStatus = "PENDING" | "SIGNED" | "DECLINED" | "EXPIRED";

interface Signatory {
  id: string;
  name: string;
  email: string;
  role: string;
  status: SigStatus;
  signedAt?: string;
}

interface SignatureRequest {
  id: string;
  title: string;
  description?: string;
  content?: string;
  status: SigStatus;
  createdAt: string;
  expiresAt?: string;
  signatories: Signatory[];
  totalSignatories: number;
  signedCount: number;
}

interface SignatoryInput {
  name: string;
  email: string;
  role: string;
}

const STATUS_STYLES: Record<SigStatus, { label: string; className: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700", icon: <Clock size={12} /> },
  SIGNED: { label: "Signed", className: "bg-green-100 text-green-700", icon: <CheckCircle size={12} /> },
  DECLINED: { label: "Declined", className: "bg-red-100 text-red-700", icon: <X size={12} /> },
  EXPIRED: { label: "Expired", className: "bg-gray-100 text-gray-500", icon: <AlertTriangle size={12} /> },
};

export default function AdminSignaturesPage() {
  const [requests, setRequests] = useState<SignatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    expiresAt: "",
  });
  const [signatories, setSignatories] = useState<SignatoryInput[]>([
    { name: "", email: "", role: "signer" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/signatures", { credentials: "include" });
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = signatories.every((s) => s.name && s.email);
    if (!valid) { setFormError("All signatories must have name and email"); return; }
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          content: form.content || undefined,
          signatories,
          expiresAt: form.expiresAt || undefined,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ title: "", description: "", content: "", expiresAt: "" });
        setSignatories([{ name: "", email: "", role: "signer" }]);
        fetchRequests();
      } else {
        const d = await res.json();
        setFormError(d.error || "Failed to create request");
      }
    } catch {
      setFormError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id: string) {
    setCancelling(id);
    try {
      await fetch("/api/admin/signatures", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });
      fetchRequests();
    } catch (e) {
      console.error(e);
    } finally {
      setCancelling(null);
    }
  }

  function handleDownloadPDF(req: SignatureRequest) {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>${req.title}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; }
        h1 { color: #0B1437; border-bottom: 2px solid #C9A227; padding-bottom: 10px; }
        .meta { color: #6B7280; font-size: 13px; margin-bottom: 24px; }
        .content { background: #F8F9FC; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap; }
        .signatories { margin-top: 40px; }
        .signatory { display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #E5E7EB; border-radius: 8px; margin-bottom: 8px; }
        .sig-img { max-width: 200px; max-height: 80px; border: 1px solid #E5E7EB; }
        .status-signed { color: #16A34A; font-weight: bold; }
        .status-pending { color: #D97706; }
        @media print { body { margin: 20px; } }
      </style>
      </head><body>
      <h1>${req.title}</h1>
      <div class="meta">
        Created: ${new Date(req.createdAt).toLocaleDateString("en-IN")} |
        Status: ${req.status} |
        Signed: ${req.signedCount}/${req.totalSignatories}
        ${req.expiresAt ? ` | Expires: ${new Date(req.expiresAt).toLocaleDateString("en-IN")}` : ""}
      </div>
      ${req.description ? `<p>${req.description}</p>` : ""}
      ${req.content ? `<div class="content">${req.content}</div>` : ""}
      <div class="signatories">
        <h2>Signatories</h2>
        ${req.signatories.map((s) => `
          <div class="signatory">
            <div>
              <strong>${s.name}</strong><br/>
              <span style="color:#6B7280;font-size:12px;">${s.email} &bull; ${s.role}</span>
            </div>
            <div style="text-align:right;">
              <span class="${s.status === "SIGNED" ? "status-signed" : "status-pending"}">${s.status}</span>
              ${s.signedAt ? `<br/><span style="font-size:11px;color:#6B7280;">${new Date(s.signedAt).toLocaleString("en-IN")}</span>` : ""}
            </div>
          </div>
        `).join("")}
      </div>
      </body></html>
    `);
    win.document.close();
    win.print();
  }

  function addSignatory() {
    setSignatories((prev) => [...prev, { name: "", email: "", role: "signer" }]);
  }

  function removeSignatory(i: number) {
    setSignatories((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateSignatory(i: number, patch: Partial<SignatoryInput>) {
    setSignatories((prev) => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminTopbar title="Document E-Signatures" />

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {/* Header action */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-[var(--color-text-muted)]">{requests.length} signature requests</p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-gold)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> Request Signatures
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[var(--color-gold)]" size={32} />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20">
            <FileSignature size={40} className="text-[var(--color-text-muted)] mx-auto mb-3 opacity-30" />
            <p className="text-[var(--color-text-muted)]">No signature requests yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const style = STATUS_STYLES[req.status as SigStatus] || STATUS_STYLES.PENDING;
              const expanded = expandedId === req.id;
              return (
                <div key={req.id} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
                  {/* Row */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-[var(--color-text)] truncate">{req.title}</h3>
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${style.className}`}>
                          {style.icon} {style.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-[var(--color-text-muted)]">
                        <span>Created {new Date(req.createdAt).toLocaleDateString("en-IN")}</span>
                        <span>Signed: {req.signedCount}/{req.totalSignatories}</span>
                        {req.expiresAt && <span>Expires {new Date(req.expiresAt).toLocaleDateString("en-IN")}</span>}
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 bg-[var(--color-bg-secondary)] rounded-full w-48 max-w-full">
                        <div
                          className="h-full rounded-full bg-[var(--color-gold)] transition-all"
                          style={{ width: req.totalSignatories ? `${(req.signedCount / req.totalSignatories) * 100}%` : "0%" }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === "SIGNED" ? (
                        <a
                          href={`/api/admin/signatures/certificate/${req.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-gold)]/40 text-xs font-medium text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-colors"
                        >
                          <Download size={13} /> Download Certificate PDF
                        </a>
                      ) : (
                        <button
                          onClick={() => handleDownloadPDF(req)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                        >
                          <Download size={13} /> PDF
                        </button>
                      )}
                      {req.status === "PENDING" && (
                        <button
                          onClick={() => handleCancel(req.id)}
                          disabled={cancelling === req.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {cancelling === req.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedId(expanded ? null : req.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                      >
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {expanded ? "Hide" : "Details"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expanded && (
                    <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
                      {req.description && (
                        <p className="text-sm text-[var(--color-text-muted)] mb-3">{req.description}</p>
                      )}
                      <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">Signatories</h4>
                      <div className="space-y-2">
                        {req.signatories.map((s) => {
                          const ss = STATUS_STYLES[s.status as SigStatus] || STATUS_STYLES.PENDING;
                          return (
                            <div key={s.id} className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                              <div>
                                <p className="text-sm font-medium text-[var(--color-text)]">{s.name}</p>
                                <p className="text-xs text-[var(--color-text-muted)]">{s.email} &bull; {s.role}</p>
                              </div>
                              <div className="text-right">
                                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${ss.className}`}>
                                  {ss.icon} {ss.label}
                                </span>
                                {s.signedAt && (
                                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                                    {new Date(s.signedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
              <h2 className="font-bold text-lg text-[var(--color-text)]">Request Signatures</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-colors">
                <X size={18} className="text-[var(--color-text-muted)]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Document Title <span className="text-red-400">*</span></label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Service Agreement — Client Name"
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-sm focus:outline-none focus:border-[var(--color-gold)]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of what's being signed"
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-sm focus:outline-none focus:border-[var(--color-gold)]"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Document Content</label>
                <textarea
                  rows={5}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Paste the document text that signatories will review before signing..."
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-sm focus:outline-none focus:border-[var(--color-gold)] resize-none"
                />
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Expiry Date (optional)</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  min={new Date().toISOString().split("T")[0]}
                  className="px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-gold)]"
                />
              </div>

              {/* Signatories */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[var(--color-text)]">Signatories <span className="text-red-400">*</span></label>
                  <button type="button" onClick={addSignatory}
                    className="flex items-center gap-1 text-xs font-medium text-[var(--color-gold)] hover:underline">
                    <Plus size={13} /> Add Signatory
                  </button>
                </div>
                <div className="space-y-2">
                  {signatories.map((s, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="relative">
                          <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                          <input
                            required
                            type="text"
                            placeholder="Full name"
                            value={s.name}
                            onChange={(e) => updateSignatory(i, { name: e.target.value })}
                            className="w-full pl-7 pr-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-sm focus:outline-none focus:border-[var(--color-gold)]"
                          />
                        </div>
                        <div className="relative">
                          <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                          <input
                            required
                            type="email"
                            placeholder="Email"
                            value={s.email}
                            onChange={(e) => updateSignatory(i, { email: e.target.value })}
                            className="w-full pl-7 pr-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-sm focus:outline-none focus:border-[var(--color-gold)]"
                          />
                        </div>
                        <div className="relative">
                          <Briefcase size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                          <select
                            value={s.role}
                            onChange={(e) => updateSignatory(i, { role: e.target.value })}
                            className="w-full pl-7 pr-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-gold)] appearance-none"
                          >
                            <option value="signer">Signer</option>
                            <option value="approver">Approver</option>
                            <option value="witness">Witness</option>
                          </select>
                        </div>
                      </div>
                      {signatories.length > 1 && (
                        <button type="button" onClick={() => removeSignatory(i)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors shrink-0 mt-0.5">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-500 p-3 rounded-lg bg-red-50 border border-red-200">{formError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--color-gold)] text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 size={15} className="animate-spin" /> Sending...</> : "Send for Signature"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
