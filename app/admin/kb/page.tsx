"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit2, Trash2, X, Loader2, Search, Eye, FileText,
  BookOpen, ChevronDown, ToggleLeft, ToggleRight, Tag, Clock, RotateCcw,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";

const EMOJI_OPTIONS = ["📚", "❓", "💡", "🛠️", "💰", "🚀", "🔒", "📋"];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const EMPTY_CAT = { name: "", slug: "", description: "", icon: "📚", isPublic: true };
const EMPTY_ART = { categoryId: "", title: "", slug: "", excerpt: "", content: "", tags: "", isPublic: true, isPublished: false, authorName: "", changeNote: "" };

interface KBVersion {
  id: string;
  articleId: string;
  version: number;
  title: string;
  content: string;
  changedBy: string;
  changeNote?: string | null;
  createdAt: string;
}

export default function KBAdminPage() {
  const [tab, setTab] = useState<"categories" | "articles">("categories");
  const [categories, setCategories] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingArts, setLoadingArts] = useState(true);

  // Category modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCat, setEditCat] = useState<any>(null);
  const [catForm, setCatForm] = useState(EMPTY_CAT);
  const [savingCat, setSavingCat] = useState(false);

  // Article modal
  const [showArtModal, setShowArtModal] = useState(false);
  const [editArt, setEditArt] = useState<any>(null);
  const [artForm, setArtForm] = useState(EMPTY_ART);
  const [savingArt, setSavingArt] = useState(false);

  // Filters
  const [artSearch, setArtSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  // Version history drawer
  const [historyArticle, setHistoryArticle] = useState<any>(null);
  const [versions, setVersions] = useState<KBVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [restoringVersion, setRestoringVersion] = useState<number | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoadingCats(true);
    try {
      const res = await fetch("/api/admin/kb?type=categories", { credentials: "include" });
      if (res.ok) { const d = await res.json(); setCategories(d.categories || []); }
    } catch (e) { console.error(e); }
    setLoadingCats(false);
  }, []);

  const fetchArticles = useCallback(async () => {
    setLoadingArts(true);
    try {
      const params = new URLSearchParams({ type: "articles" });
      if (catFilter) params.set("categoryId", catFilter);
      if (artSearch) params.set("q", artSearch);
      const res = await fetch(`/api/admin/kb?${params}`, { credentials: "include" });
      if (res.ok) { const d = await res.json(); setArticles(d.articles || []); }
    } catch (e) { console.error(e); }
    setLoadingArts(false);
  }, [catFilter, artSearch]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  // Category modal helpers
  const openAddCat = () => { setEditCat(null); setCatForm(EMPTY_CAT); setShowCatModal(true); };
  const openEditCat = (c: any) => { setEditCat(c); setCatForm({ name: c.name, slug: c.slug, description: c.description || "", icon: c.icon || "📚", isPublic: c.isPublic }); setShowCatModal(true); };

  const handleSaveCat = async () => {
    if (!catForm.name || !catForm.slug) return;
    setSavingCat(true);
    try {
      const body = { ...catForm, type: "category", ...(editCat ? { id: editCat.id } : {}) };
      await fetch("/api/admin/kb", {
        method: editCat ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      setShowCatModal(false);
      fetchCategories();
    } catch (e) { console.error(e); }
    setSavingCat(false);
  };

  const handleDeleteCat = async (id: string) => {
    if (!confirm("Delete this category? Articles will lose their category.")) return;
    setDeleting(id);
    await fetch(`/api/admin/kb?id=${id}&type=category`, { method: "DELETE", credentials: "include" });
    setDeleting(null);
    fetchCategories();
  };

  // Article modal helpers
  const openAddArt = () => { setEditArt(null); setArtForm(EMPTY_ART); setShowArtModal(true); };
  const openEditArt = (a: any) => {
    setEditArt(a);
    setArtForm({
      categoryId: a.categoryId || "",
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt || "",
      content: a.content,
      tags: a.tags?.join(", ") || "",
      isPublic: a.isPublic,
      isPublished: a.isPublished,
      authorName: a.authorName || "",
      changeNote: "",
    });
    setShowArtModal(true);
  };

  const handleSaveArt = async () => {
    if (!artForm.title || !artForm.slug || !artForm.content) return;
    setSavingArt(true);
    try {
      const body = {
        ...artForm,
        type: "article",
        tags: artForm.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
        categoryId: artForm.categoryId || null,
        ...(editArt ? { id: editArt.id } : {}),
      };
      await fetch("/api/admin/kb", {
        method: editArt ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      setShowArtModal(false);
      fetchArticles();
    } catch (e) { console.error(e); }
    setSavingArt(false);
  };

  const handleDeleteArt = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    setDeleting(id);
    await fetch(`/api/admin/kb?id=${id}&type=article`, { method: "DELETE", credentials: "include" });
    setDeleting(null);
    fetchArticles();
  };

  // Version history
  const openHistory = async (a: any) => {
    setHistoryArticle(a);
    setVersions([]);
    setLoadingVersions(true);
    try {
      const res = await fetch(`/api/admin/kb?type=versions&articleId=${a.id}`, { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        setVersions(d.versions || []);
      }
    } catch (e) { console.error(e); }
    setLoadingVersions(false);
  };

  const handleRestoreVersion = async (v: KBVersion) => {
    if (!confirm(`Restore version ${v.version}? The current version will be saved as a new version first.`)) return;
    setRestoringVersion(v.version);
    try {
      await fetch("/api/admin/kb", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: v.articleId,
          type: "article",
          title: v.title,
          content: v.content,
          changeNote: `Restored from version ${v.version}`,
        }),
      });
      // Refresh versions
      await openHistory(historyArticle);
      fetchArticles();
    } catch (e) { console.error(e); }
    setRestoringVersion(null);
  };

  return (
    <>
      <AdminTopbar title="Knowledge Base" />
      <div className="p-6 space-y-5 max-w-[1200px]">

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[var(--color-bg-secondary)] rounded-xl w-fit">
          {(["categories", "articles"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? "bg-[var(--color-navy)] text-white shadow" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"}`}>
              {t === "categories" ? "Categories" : "Articles"}
            </button>
          ))}
        </div>

        {/* ─── CATEGORIES TAB ─── */}
        {tab === "categories" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--color-text-muted)]">{categories.length} categories</p>
              <button onClick={openAddCat}
                className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold">
                <Plus size={16} /> Add Category
              </button>
            </div>

            {loadingCats ? (
              <div className="py-16 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-[var(--color-gold)]" />
              </div>
            ) : categories.length === 0 ? (
              <div className="card py-16 text-center text-sm text-[var(--color-text-muted)]">
                No categories yet. Create one to organise your knowledge base.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="card p-5 hover:shadow-[var(--shadow-card)] transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{c.icon || "📋"}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditCat(c)}
                          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeleteCat(c.id)} disabled={deleting === c.id}
                          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all">
                          {deleting === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-1">{c.name}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-3">{c.description || "No description"}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                        {c._count?.articles || 0} articles
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.isPublic ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-500"}`}>
                        {c.isPublic ? "Public" : "Private"}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── ARTICLES TAB ─── */}
        {tab === "articles" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative flex-1 min-w-48">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input value={artSearch} onChange={e => setArtSearch(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
              </div>
              <div className="relative min-w-[160px]">
                <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all appearance-none">
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
              </div>
              <button onClick={openAddArt}
                className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0">
                <Plus size={16} /> New Article
              </button>
            </div>

            <div className="card overflow-hidden">
              {loadingArts ? (
                <div className="py-16 flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-[var(--color-gold)]" />
                </div>
              ) : articles.length === 0 ? (
                <div className="py-16 text-center text-sm text-[var(--color-text-muted)]">No articles found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                      <tr>
                        {["Title", "Category", "Status", "Views", "Helpful", "Author", "Date", "Actions"].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map((a, i) => (
                        <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                          className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors">
                          <td className="py-3.5 px-4 max-w-[220px]">
                            <p className="text-sm font-semibold text-[var(--color-text)] truncate">{a.title}</p>
                            {a.tags?.length > 0 && (
                              <div className="flex gap-1 mt-0.5 flex-wrap">
                                {a.tags.slice(0, 2).map((tag: string) => (
                                  <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-muted)]">{tag}</span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs text-[var(--color-text-secondary)]">
                              {a.category ? `${a.category.icon || "📋"} ${a.category.name}` : "—"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${a.isPublished ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}`}>
                              {a.isPublished ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs text-[var(--color-text-muted)]">{a.viewCount}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs text-[var(--color-text-muted)]">{a.helpfulCount}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs text-[var(--color-text-secondary)]">{a.authorName || "—"}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs text-[var(--color-text-muted)]">
                              {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              {a.isPublished && (
                                <a href={`/kb/${a.slug}`} target="_blank" rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-navy)] hover:bg-[var(--color-navy)]/10 transition-all">
                                  <Eye size={14} />
                                </a>
                              )}
                              <button onClick={() => openHistory(a)}
                                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-blue-500 hover:bg-blue-500/10 transition-all"
                                title="Version History">
                                <Clock size={14} />
                              </button>
                              <button onClick={() => openEditArt(a)}
                                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-all">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleDeleteArt(a.id)} disabled={deleting === a.id}
                                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all">
                                {deleting === a.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
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
          </div>
        )}
      </div>

      {/* ─── CATEGORY MODAL ─── */}
      <AnimatePresence>
        {showCatModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCatModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-[var(--color-bg)] rounded-2xl w-full max-w-md shadow-[var(--shadow-luxury)]"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                <h3 className="font-display font-bold text-base text-[var(--color-text)]">
                  {editCat ? "Edit Category" : "Add Category"}
                </h3>
                <button onClick={() => setShowCatModal(false)}><X size={20} className="text-[var(--color-text-muted)]" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Name</label>
                  <input value={catForm.name}
                    onChange={e => setCatForm(f => ({ ...f, name: e.target.value, slug: editCat ? f.slug : slugify(e.target.value) }))}
                    placeholder="e.g. Getting Started"
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Slug</label>
                  <input value={catForm.slug}
                    onChange={e => setCatForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all font-mono" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Description</label>
                  <textarea value={catForm.description}
                    onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))}
                    rows={2} placeholder="Short description..."
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all resize-none placeholder:text-[var(--color-text-muted)]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Icon</label>
                  <div className="flex gap-2 flex-wrap">
                    {EMOJI_OPTIONS.map(e => (
                      <button key={e} onClick={() => setCatForm(f => ({ ...f, icon: e }))}
                        className={`w-10 h-10 rounded-xl text-xl transition-all ${catForm.icon === e ? "bg-[var(--color-gold)]/20 ring-2 ring-[var(--color-gold)]" : "bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-gold)]"}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setCatForm(f => ({ ...f, isPublic: !f.isPublic }))}
                    className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    {catForm.isPublic ? <ToggleRight size={22} className="text-[#16A34A]" /> : <ToggleLeft size={22} className="text-gray-400" />}
                    <span className="font-semibold">{catForm.isPublic ? "Public" : "Private"}</span>
                  </button>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowCatModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSaveCat} disabled={savingCat || !catForm.name}
                    className="flex-1 btn-gold py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                    {savingCat ? <Loader2 size={14} className="animate-spin" /> : null}
                    {editCat ? "Save Changes" : "Create Category"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── ARTICLE MODAL ─── */}
      <AnimatePresence>
        {showArtModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowArtModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-[var(--color-bg)] rounded-2xl w-full max-w-2xl shadow-[var(--shadow-luxury)] max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
                <h3 className="font-display font-bold text-base text-[var(--color-text)]">
                  {editArt ? "Edit Article" : "New Article"}
                </h3>
                <button onClick={() => setShowArtModal(false)}><X size={20} className="text-[var(--color-text-muted)]" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Title</label>
                    <input value={artForm.title}
                      onChange={e => setArtForm(f => ({ ...f, title: e.target.value, slug: editArt ? f.slug : slugify(e.target.value) }))}
                      placeholder="Article title"
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Slug</label>
                    <input value={artForm.slug}
                      onChange={e => setArtForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all font-mono text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Category</label>
                    <div className="relative">
                      <select value={artForm.categoryId} onChange={e => setArtForm(f => ({ ...f, categoryId: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all appearance-none">
                        <option value="">No Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Author Name</label>
                    <input value={artForm.authorName} onChange={e => setArtForm(f => ({ ...f, authorName: e.target.value }))}
                      placeholder="e.g. KVL TECH Team"
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">Excerpt</label>
                  <input value={artForm.excerpt} onChange={e => setArtForm(f => ({ ...f, excerpt: e.target.value }))}
                    placeholder="Short description shown in listings"
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block">
                    Content <span className="text-[var(--color-text-muted)] font-normal">(Markdown supported)</span>
                  </label>
                  <textarea value={artForm.content} onChange={e => setArtForm(f => ({ ...f, content: e.target.value }))}
                    rows={12} placeholder="# Article Content&#10;&#10;Write your article here using Markdown..."
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all resize-none font-mono placeholder:text-[var(--color-text-muted)]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block flex items-center gap-1">
                    <Tag size={12} /> Tags <span className="font-normal text-[var(--color-text-muted)]">(comma-separated)</span>
                  </label>
                  <input value={artForm.tags} onChange={e => setArtForm(f => ({ ...f, tags: e.target.value }))}
                    placeholder="billing, account, setup"
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                </div>
                {editArt && (
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 block flex items-center gap-1">
                      <Clock size={12} /> Change Note <span className="font-normal text-[var(--color-text-muted)]">(optional, saved to version history)</span>
                    </label>
                    <input value={artForm.changeNote} onChange={e => setArtForm(f => ({ ...f, changeNote: e.target.value }))}
                      placeholder="e.g. Updated billing section"
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                  </div>
                )}
                <div className="flex items-center gap-5">
                  <button onClick={() => setArtForm(f => ({ ...f, isPublic: !f.isPublic }))}
                    className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    {artForm.isPublic ? <ToggleRight size={22} className="text-[#16A34A]" /> : <ToggleLeft size={22} className="text-gray-400" />}
                    <span className="font-semibold">Public</span>
                  </button>
                  <button onClick={() => setArtForm(f => ({ ...f, isPublished: !f.isPublished }))}
                    className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    {artForm.isPublished ? <ToggleRight size={22} className="text-[#0891B2]" /> : <ToggleLeft size={22} className="text-gray-400" />}
                    <span className="font-semibold">Published</span>
                  </button>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-[var(--color-border)] shrink-0">
                <button onClick={() => setShowArtModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all">
                  Cancel
                </button>
                <button onClick={handleSaveArt} disabled={savingArt || !artForm.title || !artForm.content}
                  className="flex-1 btn-gold py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                  {savingArt ? <Loader2 size={14} className="animate-spin" /> : null}
                  {editArt ? "Save Changes" : "Publish Article"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── VERSION HISTORY DRAWER ─── */}
      <AnimatePresence>
        {historyArticle && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setHistoryArticle(null)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[400px] max-w-full bg-[var(--color-bg)] border-l border-[var(--color-border)] z-50 flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0">
                <div>
                  <h3 className="font-display font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
                    <Clock size={15} className="text-[var(--color-gold)]" />
                    Version History
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate max-w-[280px]">{historyArticle.title}</p>
                </div>
                <button onClick={() => setHistoryArticle(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-colors">
                  <X size={16} className="text-[var(--color-text-muted)]" />
                </button>
              </div>

              {/* Versions List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingVersions ? (
                  <div className="py-12 flex items-center justify-center">
                    <Loader2 size={22} className="animate-spin text-[var(--color-gold)]" />
                  </div>
                ) : versions.length === 0 ? (
                  <div className="py-12 text-center">
                    <Clock size={32} className="text-[var(--color-text-muted)] mx-auto mb-3 opacity-30" />
                    <p className="text-sm text-[var(--color-text-muted)]">No version history yet.</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">Versions are saved each time you edit this article.</p>
                  </div>
                ) : (
                  versions.map((v) => {
                    const wordCount = v.content.split(/\s+/).length;
                    const currentWordCount = historyArticle.content?.split(/\s+/).length || 0;
                    const diff = wordCount - currentWordCount;
                    return (
                      <div key={v.id}
                        className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[var(--color-gold)] bg-[var(--color-gold)]/10 px-2 py-0.5 rounded-full">
                                v{v.version}
                              </span>
                              <span className="text-xs font-medium text-[var(--color-text)]">{v.changedBy}</span>
                            </div>
                            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                              {new Date(v.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRestoreVersion(v)}
                            disabled={restoringVersion === v.version}
                            className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-all shrink-0 disabled:opacity-50"
                          >
                            {restoringVersion === v.version
                              ? <Loader2 size={11} className="animate-spin" />
                              : <RotateCcw size={11} />
                            }
                            Restore
                          </button>
                        </div>

                        {v.changeNote && (
                          <p className="text-xs text-[var(--color-text-secondary)] italic">&ldquo;{v.changeNote}&rdquo;</p>
                        )}

                        <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                          <span>{wordCount} words</span>
                          {diff !== 0 && (
                            <span className={diff > 0 ? "text-green-600" : "text-red-500"}>
                              {diff > 0 ? "+" : ""}{diff} words vs current
                            </span>
                          )}
                        </div>

                        {/* Snapshot title if different */}
                        {v.title !== historyArticle.title && (
                          <p className="text-[10px] text-[var(--color-text-muted)]">
                            Title was: <span className="font-medium text-[var(--color-text-secondary)]">{v.title}</span>
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
