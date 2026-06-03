"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, RefreshCw, Loader2, Trash2, Eye, EyeOff,
  FileText, CheckCircle2, Clock, Send, X, Plus,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";

const CATEGORIES = ["Business Tips", "Website Design", "Digital Marketing", "Software", "SEO", "E-commerce", "Success Stories"];

const INPUT = "w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all placeholder:text-[var(--color-text-muted)]";

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ topic: "", category: "Business Tips", keywords: "" });
  const [preview, setPreview] = useState<any>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog", { credentials: "include" });
      if (res.ok) { const d = await res.json(); setPosts(d.posts || []); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic.trim()) return;
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(prev => [data.post, ...prev]);
        setPreview(data.post);
        setForm({ topic: "", category: "Business Tips", keywords: "" });
      } else {
        setError(data.error || "Generation failed");
      }
    } catch { setError("Network error — please retry"); }
    setGenerating(false);
  };

  const handleAction = async (action: string, id: string) => {
    setActionId(id);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action, id }),
      });
      if (res.ok) {
        if (action === "delete") {
          setPosts(prev => prev.filter(p => p.id !== id));
          if (preview?.id === id) setPreview(null);
        } else {
          await fetchPosts();
          if (preview?.id === id) setPreview((prev: any) => ({ ...prev, isPublished: action === "publish" }));
        }
      }
    } catch (e) { console.error(e); }
    setActionId(null);
  };

  const published = posts.filter(p => p.isPublished).length;
  const drafts = posts.filter(p => !p.isPublished).length;

  return (
    <>
      <AdminTopbar title="AI Blog Generator" />
      <div className="p-6 max-w-[1400px] space-y-5">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Posts", value: posts.length, icon: FileText, color: "#C9A227" },
            { label: "Published", value: published, icon: CheckCircle2, color: "#16A34A" },
            { label: "Drafts", value: drafts, icon: Clock, color: "#F59E0B" },
          ].map(({ label, value, icon: Icon, color }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <p className="font-display font-bold text-2xl text-[var(--color-text)]">{value}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Generate form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-[var(--color-gold)]" />
                <h3 className="font-display font-bold text-base text-[var(--color-text)]">AI Blog Generator</h3>
              </div>
              <form onSubmit={handleGenerate} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Blog Topic *</label>
                  <textarea value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                    rows={3} required placeholder="e.g. Restaurant website se online orders kaise badhayen"
                    className={INPUT + " resize-none"} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className={INPUT}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">SEO Keywords (optional)</label>
                  <input value={form.keywords} onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))}
                    placeholder="restaurant website, online menu, booking system"
                    className={INPUT} />
                </div>
                {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
                <button type="submit" disabled={generating || !form.topic.trim()}
                  className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-60">
                  {generating ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate with AI</>}
                </button>
                <p className="text-[10px] text-[var(--color-text-muted)] text-center">Powered by Groq · llama-3.1-8b-instant · ~5 sec</p>
              </form>
            </div>

            {/* Quick topic suggestions */}
            <div className="card p-4">
              <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-3">Quick Topics</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Restaurant website ke fayde",
                  "School management software kyon zaruri hai",
                  "E-commerce site kaise banayein",
                  "Small business ke liye website",
                  "GST billing software guide",
                  "HR software se time bachao",
                ].map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, topic: t }))}
                    className="text-xs px-2.5 py-1 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all text-left">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Posts list */}
          <div className="lg:col-span-3 card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)]">
              <h3 className="font-display font-semibold text-sm text-[var(--color-text)]">All Posts</h3>
              <button onClick={fetchPosts} className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors">
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
            <div className="divide-y divide-[var(--color-border)] max-h-[520px] overflow-y-auto">
              {loading ? (
                <div className="py-16 flex justify-center"><Loader2 size={24} className="animate-spin text-[var(--color-gold)]" /></div>
              ) : posts.length === 0 ? (
                <div className="py-16 text-center">
                  <Sparkles size={32} className="text-[var(--color-text-muted)] mx-auto mb-3" />
                  <p className="text-sm text-[var(--color-text-muted)]">Koi post nahi — pehla post AI se generate karo</p>
                </div>
              ) : posts.map(post => (
                <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`p-4 hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer ${preview?.id === post.id ? "bg-[var(--color-gold)]/5 border-l-2 border-[var(--color-gold)]" : ""}`}
                  onClick={() => setPreview(post)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text)] truncate">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border border-[var(--color-border)]">{post.category}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${post.isPublished ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}`}>
                          {post.isPublished ? "Published" : "Draft"}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={e => { e.stopPropagation(); handleAction(post.isPublished ? "unpublish" : "publish", post.id); }}
                        disabled={actionId === post.id}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-all text-[var(--color-text-muted)] hover:text-[var(--color-gold)]"
                        title={post.isPublished ? "Unpublish" : "Publish"}>
                        {actionId === post.id ? <Loader2 size={13} className="animate-spin" /> : post.isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button onClick={e => { e.stopPropagation(); if (confirm("Delete this post?")) handleAction("delete", post.id); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-all text-[var(--color-text-muted)] hover:text-red-500">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview panel */}
        <AnimatePresence>
          {preview && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-[var(--color-text)]">{preview.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">{preview.category} · {preview.isPublished ? "Published ✅" : "Draft"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!preview.isPublished && (
                    <button onClick={() => handleAction("publish", preview.id)}
                      disabled={actionId === preview.id}
                      className="btn-gold flex items-center gap-2 text-sm">
                      {actionId === preview.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Publish
                    </button>
                  )}
                  <button onClick={() => setPreview(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="prose prose-sm max-w-none text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] rounded-xl p-4 max-h-72 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed">
                {preview.content || preview.excerpt}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
