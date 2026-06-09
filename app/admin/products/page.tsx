"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Search, Plus, Edit2, Eye, TrendingUp, Package,
  Loader2, RefreshCw, X, Save, ToggleLeft, ToggleRight,
  ChevronDown, AlertCircle, CheckCircle2, Globe, Cpu, Smartphone, BarChart3,
  Upload, ImageIcon, Trash2 as TrashIcon, Link2, Star,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";

const CAT_LABEL: Record<string, string> = {
  WEBSITE: "Website", SOFTWARE: "Software", SAAS: "SaaS", MOBILE: "Mobile",
};
const CAT_COLOR: Record<string, { color: string; bg: string }> = {
  WEBSITE: { color: "#0891B2", bg: "#0891B215" },
  SOFTWARE: { color: "#7C3AED", bg: "#7C3AED15" },
  SAAS: { color: "#16A34A", bg: "#16A34A15" },
  MOBILE: { color: "#F59E0B", bg: "#F59E0B15" },
};

const INPUT = "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all placeholder:text-[var(--color-text-muted)]";
const LABEL = "block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5";

const EMPTY_FORM = {
  name: "", slug: "", tagline: "", description: "",
  category: "WEBSITE", basicPrice: "", premiumPrice: "",
  tag: "", photo: "/photos/office-meeting.jpg",
  techStack: "", highlights: "",
};

const EXISTING_PHOTOS = [
  { label: "Restaurant", url: "/photos/restaurant.jpg" },
  { label: "School", url: "/photos/school.jpg" },
  { label: "Hospital", url: "/photos/hospital.jpg" },
  { label: "Fashion", url: "/photos/fashion.jpg" },
  { label: "Office", url: "/photos/office-meeting.jpg" },
  { label: "Laptop", url: "/photos/person-laptop.jpg" },
];

function ImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadInfo, setUploadInfo] = useState("");
  const [tab, setTab] = useState<"upload" | "gallery" | "url">("upload");
  const [drag, setDrag] = useState(false);
  const [urlInput, setUrlInput] = useState(value);
  const fileRef = useRef<HTMLInputElement>(null);

  const doUpload = async (file: File) => {
    setUploadError(""); setUploadInfo("");
    if (file.size > 20 * 1024 * 1024) {
      setUploadError(`File 20MB se badi hai (${(file.size / 1024 / 1024).toFixed(1)} MB)`);
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
      } else {
        onChange(data.url);
        setUploadInfo(`✅ Saved: ${data.savedSize} (${data.saving})`);
      }
    } catch { setUploadError("Network error. Try again."); }
    setUploading(false);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) doUpload(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) doUpload(f);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--color-bg-secondary)] w-fit">
        {(["upload", "gallery", "url"] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${tab === t ? "bg-[var(--color-bg)] shadow-sm text-[var(--color-text)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}>
            {t === "upload" ? "Upload" : t === "gallery" ? "Gallery" : "URL"}
          </button>
        ))}
      </div>

      {/* Current preview */}
      {value && (
        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-secondary)] group">
          <Image src={value} alt="Product photo" fill className="object-cover" sizes="400px" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
            <button type="button" onClick={() => onChange("")}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <TrashIcon size={12} /> Remove
            </button>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-lg font-mono truncate max-w-[80%]">{value}</div>
        </div>
      )}

      {tab === "upload" && (
        <div>
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${drag ? "border-[var(--color-gold)] bg-[var(--color-gold)]/5" : "border-[var(--color-border)] hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/[0.02]"}`}>
            {uploading ? (
              <><Loader2 size={28} className="animate-spin text-[var(--color-gold)]" /><p className="text-sm text-[var(--color-text-muted)]">Uploading...</p></>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center">
                  <Upload size={22} className="text-[var(--color-gold)]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-[var(--color-text)]">Click ya drag & drop karein</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">JPG, PNG, WebP, GIF, AVIF, BMP, SVG, HEIC — Max 20MB</p>
                  <p className="text-[10px] text-[var(--color-gold)] mt-1">Auto compressed → WebP for minimum size</p>
                </div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          {uploadError && <p className="text-xs text-red-500 mt-2 flex items-center gap-1.5"><AlertCircle size={12} />{uploadError}</p>}
          {uploadInfo && <p className="text-xs text-green-500 mt-2">{uploadInfo}</p>}
        </div>
      )}

      {tab === "gallery" && (
        <div>
          <p className="text-xs text-[var(--color-text-muted)] mb-2">Existing photos se choose karein:</p>
          <div className="grid grid-cols-3 gap-2">
            {EXISTING_PHOTOS.map(p => (
              <button key={p.url} type="button" onClick={() => onChange(p.url)}
                className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all ${value === p.url ? "border-[var(--color-gold)] shadow-[0_0_0_2px_rgba(201,162,39,0.3)]" : "border-[var(--color-border)] hover:border-[var(--color-gold)]/50"}`}>
                <Image src={p.url} alt={p.label} fill className="object-cover" sizes="100px" />
                <div className="absolute inset-0 bg-black/20 flex items-end p-1">
                  <span className="text-[9px] text-white font-semibold bg-black/40 px-1.5 py-0.5 rounded">{p.label}</span>
                </div>
                {value === p.url && <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[var(--color-gold)] flex items-center justify-center"><CheckCircle2 size={10} className="text-white" /></div>}
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "url" && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
              placeholder="https://... ya /photos/name.jpg"
              className={INPUT + " pl-9"} />
          </div>
          <button type="button" onClick={() => { if (urlInput) onChange(urlInput); }}
            className="btn-gold text-sm px-4 shrink-0">Apply</button>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);

  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [featuringId, setFeaturingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/products?${params}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setCategoryBreakdown(data.categoryBreakdown || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = catFilter === "ALL" ? products : products.filter(p => p.category === catFilter);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setFormError(""); setFormSuccess("");
    setModal("add");
  };

  const openEdit = (p: any) => {
    setEditProduct(p);
    setForm({
      name: p.name, slug: p.slug, tagline: p.tagline || "", description: p.description || "",
      category: p.category, basicPrice: String(p.basicPrice), premiumPrice: String(p.premiumPrice),
      tag: p.tag || "", photo: p.photo || "/photos/office-meeting.jpg",
      techStack: (p.techStack || []).join(", "),
      highlights: (p.highlights || []).join(", "),
    });
    setFormError(""); setFormSuccess("");
    setModal("edit");
  };

  const handleSave = async () => {
    setFormError(""); setFormSuccess("");
    if (!form.name || !form.slug || !form.basicPrice || !form.premiumPrice) {
      setFormError("Name, slug, basic price aur premium price required hain.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...(modal === "edit" ? { id: editProduct.id } : {}),
        name: form.name, slug: form.slug, tagline: form.tagline,
        description: form.description, category: form.category,
        basicPrice: Number(form.basicPrice), premiumPrice: Number(form.premiumPrice),
        tag: form.tag || null, photo: form.photo,
        techStack: form.techStack.split(",").map(s => s.trim()).filter(Boolean),
        highlights: form.highlights.split(",").map(s => s.trim()).filter(Boolean),
      };
      const res = await fetch("/api/admin/products", {
        method: modal === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Save failed.");
      } else {
        setFormSuccess(modal === "edit" ? "Product updated!" : "Product added!");
        await fetchProducts();
        setTimeout(() => setModal(null), 1200);
      }
    } catch {
      setFormError("Network error.");
    }
    setSaving(false);
  };

  const toggleActive = async (product: any) => {
    setTogglingId(product.id);
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: product.id, isActive: !product.isActive }),
    });
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p));
    setTogglingId(null);
  };

  const toggleFeatured = async (product: any) => {
    setFeaturingId(product.id);
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: product.id, isFeatured: !product.isFeatured }),
    });
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isFeatured: !p.isFeatured } : p));
    setFeaturingId(null);
  };

  const totalRevenue = products.reduce((s, p) => s + (p.revenue || 0), 0);
  const topProduct = [...products].sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))[0];

  return (
    <>
      <AdminTopbar title="Products Manager" />
      <div className="p-6 space-y-5 max-w-[1400px]">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Products", value: loading ? "…" : String(products.length), icon: Package, color: "#0F172A" },
            { label: "Websites", value: loading ? "…" : String(products.filter(p => p.category === "WEBSITE").length), icon: Globe, color: "#0891B2" },
            { label: "Software", value: loading ? "…" : String(products.filter(p => p.category === "SOFTWARE").length), icon: Cpu, color: "#7C3AED" },
            { label: "Top Seller", value: loading ? "…" : (topProduct?.name?.split(" ")[0] || "—"), icon: TrendingUp, color: "#C9A227" },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="font-display font-bold text-xl text-[var(--color-text)]">{value}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="card p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchProducts()}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm outline-none focus:border-[var(--color-gold)] transition-all text-[var(--color-text)]" />
          </div>
          <div className="flex items-center gap-2">
            {["ALL", "WEBSITE", "SOFTWARE", "SAAS", "MOBILE"].map(cat => (
              <button key={cat} onClick={() => setCatFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${catFilter === cat ? "bg-[var(--color-navy)] text-white" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]"}`}>
                {cat === "ALL" ? "All" : CAT_LABEL[cat]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchProducts} className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all text-[var(--color-text-secondary)]">
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 btn-gold text-sm shrink-0">
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>

        {/* Summary strip */}
        {!loading && products.length > 0 && (
          <div className="flex items-center gap-6 px-1 text-xs text-[var(--color-text-muted)]">
            <span><span className="font-semibold text-[var(--color-text)]">{filtered.length}</span> products shown</span>
            <span>Total revenue: <span className="font-semibold text-[var(--color-gold)]">₹{(totalRevenue / 100000).toFixed(1)}L</span></span>
            <span>Active: <span className="font-semibold text-green-500">{products.filter(p => p.isActive).length}</span></span>
          </div>
        )}

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                <tr>
                  {["Product", "Category", "Basic Price", "Premium Price", "Orders", "Revenue", "Featured", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="py-16 text-center"><Loader2 size={24} className="animate-spin text-[var(--color-gold)] mx-auto" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-16 text-center text-sm text-[var(--color-text-muted)]">No products found</td></tr>
                ) : filtered.map((product, i) => {
                  const cat = CAT_COLOR[product.category] || { color: "#9CA3AF", bg: "#9CA3AF15" };
                  return (
                    <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded-lg overflow-hidden shrink-0 relative">
                            <Image src={product.photo} alt={product.name} fill className="object-cover" sizes="48px" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-text)]">{product.name}</p>
                            {product.tag && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--color-gold)]/15 text-[var(--color-gold)]">{product.tag}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: cat.color, background: cat.bg }}>
                          {CAT_LABEL[product.category] || product.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-bold text-[var(--color-text)]">₹{product.basicPrice.toLocaleString("en-IN")}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-bold text-[var(--color-gold)]">₹{product.premiumPrice.toLocaleString("en-IN")}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-semibold text-[var(--color-text)]">{product.orderCount}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-semibold text-[var(--color-text)]">
                          {product.revenue > 0 ? `₹${(product.revenue / 100000).toFixed(2)}L` : "—"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button onClick={() => toggleFeatured(product)} disabled={featuringId === product.id}
                          title={product.isFeatured ? "Homepage se hatao" : "Homepage pe dikhao"}
                          className="flex items-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-50">
                          {featuringId === product.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Star size={16} className={product.isFeatured ? "fill-[var(--color-gold)] text-[var(--color-gold)]" : "text-[var(--color-text-muted)]"} />}
                          <span className={product.isFeatured ? "text-[var(--color-gold)]" : "text-[var(--color-text-muted)]"}>
                            {product.isFeatured ? "Yes" : "No"}
                          </span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <button onClick={() => toggleActive(product)} disabled={togglingId === product.id}
                          className="flex items-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-50">
                          {togglingId === product.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : product.isActive
                              ? <ToggleRight size={20} className="text-green-500" />
                              : <ToggleLeft size={20} className="text-[var(--color-text-muted)]" />}
                          <span className={product.isActive ? "text-green-500" : "text-[var(--color-text-muted)]"}>
                            {product.isActive ? "Active" : "Hidden"}
                          </span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/products/${product.slug}`} target="_blank"
                            className="w-7 h-7 rounded-lg border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all text-[var(--color-text-secondary)]">
                            <Eye size={13} />
                          </Link>
                          <button onClick={() => openEdit(product)}
                            className="w-7 h-7 rounded-lg border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-navy)] hover:text-[var(--color-navy)] dark:hover:text-white transition-all text-[var(--color-text-secondary)]">
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setModal(null)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-[var(--color-bg)] rounded-2xl w-full max-w-xl shadow-[var(--shadow-luxury)] my-4"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                <h3 className="font-display font-bold text-lg text-[var(--color-text)]">
                  {modal === "add" ? "Add New Product" : `Edit: ${editProduct?.name}`}
                </h3>
                <button onClick={() => setModal(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {formError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle size={15} /> {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 text-sm">
                    <CheckCircle2 size={15} /> {formSuccess}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Product Name *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value,
                      slug: modal === "add" ? e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") : f.slug
                    }))} placeholder="Restaurant Website" className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Slug *</label>
                    <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                      placeholder="restaurant-website" className={INPUT} readOnly={modal === "edit"} />
                  </div>
                </div>

                <div>
                  <label className={LABEL}>Tagline</label>
                  <input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                    placeholder="Beautiful website that fills your tables" className={INPUT} />
                </div>

                <div>
                  <label className={LABEL}>Description</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Product ka detailed description..." className={INPUT + " resize-none"} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Category *</label>
                    <div className="relative">
                      <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={INPUT + " appearance-none"}>
                        <option value="WEBSITE">Website</option>
                        <option value="SOFTWARE">Software</option>
                        <option value="SAAS">SaaS</option>
                        <option value="MOBILE">Mobile</option>
                      </select>
                      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL}>Tag (optional)</label>
                    <input value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                      placeholder="Most Popular / New / Best Seller" className={INPUT} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>Basic Price (₹) *</label>
                    <input type="number" value={form.basicPrice} onChange={e => setForm(f => ({ ...f, basicPrice: e.target.value }))}
                      placeholder="12999" className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Premium Price (₹) *</label>
                    <input type="number" value={form.premiumPrice} onChange={e => setForm(f => ({ ...f, premiumPrice: e.target.value }))}
                      placeholder="24999" className={INPUT} />
                  </div>
                </div>

                <div>
                  <label className={LABEL}>Product Photo</label>
                  <ImageUploader value={form.photo} onChange={url => setForm(f => ({ ...f, photo: url }))} />
                </div>

                <div>
                  <label className={LABEL}>Tech Stack (comma separated)</label>
                  <input value={form.techStack} onChange={e => setForm(f => ({ ...f, techStack: e.target.value }))}
                    placeholder="Next.js, Node.js, PostgreSQL" className={INPUT} />
                </div>

                <div>
                  <label className={LABEL}>Highlights (comma separated)</label>
                  <input value={form.highlights} onChange={e => setForm(f => ({ ...f, highlights: e.target.value }))}
                    placeholder="+300% orders, 2X revenue, Mobile first" className={INPUT} />
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => setModal(null)} className="btn-outline flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? "Saving..." : modal === "add" ? "Add Product" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
