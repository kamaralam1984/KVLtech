"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Plus, Pencil, Trash2, X, Loader2, Save, Star, Eye, EyeOff,
  ExternalLink, RefreshCw, FolderOpen
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";
import { useToast } from "@/components/ui/Toast";

const EMPTY_FORM = {
  title: "", slug: "", clientName: "", industry: "", description: "",
  challenge: "", solution: "", results: "", techStack: "", coverImage: "",
  gallery: "", liveUrl: "", duration: "", teamSize: "", testimonial: "",
  authorName: "", tags: "", isFeatured: false, isPublished: true, sortOrder: 0,
  metrics: "",
};

const INPUT = "w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all placeholder:text-[var(--color-text-muted)]";
const LABEL = "block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminPortfolioPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/portfolio", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    let metricsStr = "";
    try {
      const m = p.metrics ? JSON.parse(p.metrics) : {};
      metricsStr = Object.entries(m).map(([k, v]) => `${k}: ${v}`).join("\n");
    } catch {}

    setForm({
      title: p.title || "",
      slug: p.slug || "",
      clientName: p.clientName || "",
      industry: p.industry || "",
      description: p.description || "",
      challenge: p.challenge || "",
      solution: p.solution || "",
      results: p.results || "",
      techStack: (p.techStack || []).join(", "),
      coverImage: p.coverImage || "",
      gallery: (p.gallery || []).join(", "),
      liveUrl: p.liveUrl || "",
      duration: p.duration || "",
      teamSize: p.teamSize || "",
      testimonial: p.testimonial || "",
      authorName: p.authorName || "",
      tags: (p.tags || []).join(", "),
      isFeatured: p.isFeatured || false,
      isPublished: p.isPublished !== false,
      sortOrder: p.sortOrder || 0,
      metrics: metricsStr,
    });
    setEditId(p.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.clientName || !form.industry || !form.description || !form.coverImage) {
      toast("Please fill all required fields: title, slug, clientName, industry, description, coverImage", "warning");
      return;
    }
    setSaving(true);
    try {
      // Parse metrics from "Key: Value" lines
      const metricsObj: Record<string, string> = {};
      form.metrics.split("\n").forEach(line => {
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0) {
          const key = line.slice(0, colonIdx).trim();
          const value = line.slice(colonIdx + 1).trim();
          if (key && value) metricsObj[key] = value;
        }
      });

      const payload = {
        ...(editId ? { id: editId } : {}),
        title: form.title,
        slug: form.slug,
        clientName: form.clientName,
        industry: form.industry,
        description: form.description,
        challenge: form.challenge || null,
        solution: form.solution || null,
        results: form.results || null,
        techStack: form.techStack.split(",").map(s => s.trim()).filter(Boolean),
        coverImage: form.coverImage,
        gallery: form.gallery.split(",").map(s => s.trim()).filter(Boolean),
        liveUrl: form.liveUrl || null,
        duration: form.duration || null,
        teamSize: form.teamSize || null,
        testimonial: form.testimonial || null,
        authorName: form.authorName || null,
        metrics: Object.keys(metricsObj).length ? JSON.stringify(metricsObj) : null,
        tags: form.tags.split(",").map(s => s.trim()).filter(Boolean),
        isFeatured: form.isFeatured,
        isPublished: form.isPublished,
        sortOrder: Number(form.sortOrder) || 0,
      };

      const res = await fetch("/api/admin/portfolio", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        fetchProjects();
      } else {
        const data = await res.json();
        toast(data.error || "Save failed", "error");
      }
    } catch (e) {
      console.error(e);
      toast("Network error — please try again", "error");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/portfolio?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
      }
    } catch {}
    setDeleting(null);
    setConfirmDelete(null);
  };

  const toggleField = async (id: string, field: "isPublished" | "isFeatured", value: boolean) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    await fetch("/api/admin/portfolio", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, [field]: value }),
    });
  };

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  return (
    <>
      <AdminTopbar title="Portfolio Projects" />
      <div className="p-6 space-y-5 max-w-[1400px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-gold)]/15 flex items-center justify-center">
              <FolderOpen size={18} className="text-[var(--color-gold)]" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-[var(--color-text)]">Portfolio Projects</h1>
              <p className="text-xs text-[var(--color-text-muted)]">{projects.length} projects</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchProjects} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button onClick={openAdd} className="btn-gold flex items-center gap-2 text-sm">
              <Plus size={16} /> Add Project
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                <tr>
                  {["Cover", "Title", "Client", "Industry", "Published", "Featured", "Order", "Actions"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="py-16 text-center"><Loader2 size={24} className="animate-spin text-[var(--color-gold)] mx-auto" /></td></tr>
                ) : projects.length === 0 ? (
                  <tr><td colSpan={8} className="py-16 text-center text-sm text-[var(--color-text-muted)]">No projects yet. Add your first one!</td></tr>
                ) : projects.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-14 h-10 rounded-lg overflow-hidden relative border border-[var(--color-border)]">
                        <Image src={p.coverImage} alt={p.title} fill className="object-cover" sizes="56px" />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-semibold text-[var(--color-text)] max-w-[180px] truncate">{p.title}</p>
                      <p className="text-[11px] text-[var(--color-text-muted)] font-mono">{p.slug}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-[var(--color-text-secondary)] whitespace-nowrap">{p.clientName}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                        {p.industry}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleField(p.id, "isPublished", !p.isPublished)}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${p.isPublished ? "text-green-500" : "text-[var(--color-text-muted)]"}`}>
                        {p.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                        {p.isPublished ? "Live" : "Draft"}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleField(p.id, "isFeatured", !p.isFeatured)}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${p.isFeatured ? "text-[var(--color-gold)]" : "text-[var(--color-text-muted)]"}`}>
                        <Star size={14} fill={p.isFeatured ? "currentColor" : "none"} />
                        {p.isFeatured ? "Featured" : "No"}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono text-[var(--color-text-muted)]">{p.sortOrder}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <a href={`/portfolio/${p.slug}`} target="_blank" rel="noopener noreferrer"
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors">
                          <ExternalLink size={14} />
                        </a>
                        <button onClick={() => openEdit(p)}
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setConfirmDelete(p.id)}
                          className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-[var(--color-bg)] rounded-2xl w-full max-w-2xl shadow-2xl my-8"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                <h3 className="font-display font-bold text-lg text-[var(--color-text)]">
                  {editId ? "Edit Project" : "Add New Project"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Title *</label>
                    <input value={form.title} onChange={e => { set("title", e.target.value); if (!editId) set("slug", slugify(e.target.value)); }}
                      placeholder="Project title" className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Slug *</label>
                    <input value={form.slug} onChange={e => set("slug", slugify(e.target.value))}
                      placeholder="auto-generated-slug" className={INPUT} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Client Name *</label>
                    <input value={form.clientName} onChange={e => set("clientName", e.target.value)}
                      placeholder="Client company name" className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Industry *</label>
                    <input value={form.industry} onChange={e => set("industry", e.target.value)}
                      placeholder="E.g. Healthcare, Education" className={INPUT} />
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Description *</label>
                  <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)}
                    placeholder="Project overview..." className={INPUT + " resize-none"} />
                </div>
                <div>
                  <label className={LABEL}>Challenge</label>
                  <textarea rows={2} value={form.challenge} onChange={e => set("challenge", e.target.value)}
                    placeholder="What problems did the client face?" className={INPUT + " resize-none"} />
                </div>
                <div>
                  <label className={LABEL}>Solution</label>
                  <textarea rows={2} value={form.solution} onChange={e => set("solution", e.target.value)}
                    placeholder="How did you solve it?" className={INPUT + " resize-none"} />
                </div>
                <div>
                  <label className={LABEL}>Results</label>
                  <textarea rows={2} value={form.results} onChange={e => set("results", e.target.value)}
                    placeholder="What outcomes were achieved?" className={INPUT + " resize-none"} />
                </div>
                <div>
                  <label className={LABEL}>Cover Image URL *</label>
                  <input value={form.coverImage} onChange={e => set("coverImage", e.target.value)}
                    placeholder="https://..." className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Gallery URLs (comma-separated)</label>
                  <input value={form.gallery} onChange={e => set("gallery", e.target.value)}
                    placeholder="https://img1.jpg, https://img2.jpg" className={INPUT} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Live URL</label>
                    <input value={form.liveUrl} onChange={e => set("liveUrl", e.target.value)}
                      placeholder="https://clientsite.com" className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Tech Stack (comma-separated)</label>
                    <input value={form.techStack} onChange={e => set("techStack", e.target.value)}
                      placeholder="React, Node.js, PostgreSQL" className={INPUT} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Duration</label>
                    <input value={form.duration} onChange={e => set("duration", e.target.value)}
                      placeholder="E.g. 3 months" className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Team Size</label>
                    <input value={form.teamSize} onChange={e => set("teamSize", e.target.value)}
                      placeholder="E.g. 4 developers" className={INPUT} />
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Testimonial</label>
                  <textarea rows={2} value={form.testimonial} onChange={e => set("testimonial", e.target.value)}
                    placeholder="Client quote..." className={INPUT + " resize-none"} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Author Name</label>
                    <input value={form.authorName} onChange={e => set("authorName", e.target.value)}
                      placeholder="Client contact name" className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Sort Order</label>
                    <input type="number" value={form.sortOrder} onChange={e => set("sortOrder", e.target.value)}
                      className={INPUT} />
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Tags (comma-separated)</label>
                  <input value={form.tags} onChange={e => set("tags", e.target.value)}
                    placeholder="website, ecommerce, mobile-app" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Metrics (one per line, format: Label: Value)</label>
                  <textarea rows={3} value={form.metrics} onChange={e => set("metrics", e.target.value)}
                    placeholder={"Traffic Increase: 300%\nRevenue Growth: 45%\nLoad Time Reduced: 60%"}
                    className={INPUT + " resize-none font-mono text-xs"} />
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => set("isPublished", !form.isPublished)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${form.isPublished ? "bg-green-500" : "bg-[var(--color-border)]"}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 shadow transition-all ${form.isPublished ? "right-0.5" : "left-0.5"}`} />
                    </div>
                    <span className="text-sm font-medium text-[var(--color-text)]">Published</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => set("isFeatured", !form.isFeatured)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${form.isFeatured ? "bg-[var(--color-gold)]" : "bg-[var(--color-border)]"}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 shadow transition-all ${form.isFeatured ? "right-0.5" : "left-0.5"}`} />
                    </div>
                    <span className="text-sm font-medium text-[var(--color-text)]">Featured</span>
                  </label>
                </div>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? "Saving..." : editId ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-[var(--color-bg)] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <h3 className="font-display font-bold text-lg text-[var(--color-text)] mb-2">Delete Project?</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="btn-outline flex-1">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete)} disabled={deleting === confirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {deleting === confirmDelete ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
