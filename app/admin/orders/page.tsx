"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Download, Eye, CheckCircle2, Clock,
  XCircle, Loader2, RefreshCw, X, ChevronDown, Save,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PAYMENT_PENDING:   { label: "Payment Pending",  color: "#9CA3AF", bg: "#9CA3AF15" },
  PAYMENT_CONFIRMED: { label: "Payment Confirmed", color: "#C9A227", bg: "#C9A22715" },
  DESIGN_STARTED:    { label: "Design Started",    color: "#0891B2", bg: "#0891B215" },
  DEVELOPMENT:       { label: "Development",       color: "#7C3AED", bg: "#7C3AED15" },
  REVIEW_TESTING:    { label: "Review & Testing",  color: "#F59E0B", bg: "#F59E0B15" },
  DELIVERED:         { label: "Delivered",         color: "#16A34A", bg: "#16A34A15" },
  CANCELLED:         { label: "Cancelled",         color: "#EF4444", bg: "#EF444415" },
};



export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newProgress, setNewProgress] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/orders?${params}`, {
        credentials: "include",
        
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleUpdateOrder = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          
        },
        credentials: "include",
        body: JSON.stringify({ id: selected.id, status: newStatus, progress: newProgress }),
      });
      if (res.ok) {
        await fetchOrders();
        setSelected(null);
      }
    } catch (e) { console.error(e); }
    setUpdating(false);
  };

  const totalRevenue = orders.reduce((s, o) => s + o.amount, 0);

  const FILTERS = [
    { label: "All", value: "all" },
    ...Object.entries(STATUS_CONFIG).map(([v, { label }]) => ({ label, value: v })),
  ];

  return (
    <>
      <AdminTopbar title="Orders" />
      <div className="p-6 space-y-5 max-w-[1400px]">

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(STATUS_CONFIG).map(([status, { label, color, bg }]) => {
            const count = orders.filter(o => o.status === status).length;
            return (
              <motion.div key={status} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="card p-3 flex flex-col items-center text-center cursor-pointer hover:shadow-[var(--shadow-card)] transition-all"
                onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}>
                <p className="font-display font-bold text-xl text-[var(--color-text)]">{count}</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1" style={{ color, background: bg }}>{label}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Order ID, client, product..." onKeyDown={e => e.key === "Enter" && fetchOrders()}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={15} className="text-[var(--color-text-muted)]" />
            {["all", "PAYMENT_PENDING", "DEVELOPMENT", "DELIVERED", "CANCELLED"].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === f ? "bg-[var(--color-navy)] text-white" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)]"}`}>
                {f === "all" ? "All" : STATUS_CONFIG[f]?.label || f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-[var(--color-text-muted)]">
              <span className="font-semibold text-[var(--color-text)]">{orders.length}</span> orders ·{" "}
              <span className="font-semibold text-[var(--color-gold)]">₹{totalRevenue.toLocaleString("en-IN")}</span>
            </span>
            <button onClick={fetchOrders} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                <tr>
                  {["Order ID", "Client", "Product", "Plan", "Amount", "Status", "Date", "Action"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="py-16 text-center"><Loader2 size={24} className="animate-spin text-[var(--color-gold)] mx-auto" /></td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={8} className="py-16 text-center text-sm text-[var(--color-text-muted)]">No orders found</td></tr>
                ) : orders.map((order, i) => {
                  const cfg = STATUS_CONFIG[order.status] || { color: "#9CA3AF", bg: "#9CA3AF15", label: order.status };
                  return (
                    <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)]">{order.orderNumber}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-sm font-semibold text-[var(--color-text)]">{order.client?.name}</p>
                        <p className="text-[11px] text-[var(--color-text-muted)]">{order.client?.phone}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-sm text-[var(--color-text)] whitespace-nowrap">{order.product?.name}</p>
                        <p className="text-[11px] text-[var(--color-text-muted)]">{order.client?.city}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">{order.plan}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-bold text-[var(--color-text)]">₹{order.amount.toLocaleString("en-IN")}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                          style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button onClick={() => { setSelected(order); setNewStatus(order.status); setNewProgress(order.progress); }}
                          className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors">
                          <Eye size={14} /> Update
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Update modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-[var(--color-bg)] rounded-2xl w-full max-w-md shadow-[var(--shadow-luxury)] overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                <div>
                  <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Update Order</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">#{selected.orderNumber} · {selected.product?.name}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Order Status</label>
                  <div className="relative">
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all appearance-none">
                      {Object.entries(STATUS_CONFIG).map(([v, { label }]) => (
                        <option key={v} value={v}>{label}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
                    Progress: <span className="text-[var(--color-gold)]">{newProgress}%</span>
                  </label>
                  <input type="range" min={0} max={100} value={newProgress} onChange={e => setNewProgress(+e.target.value)}
                    className="w-full accent-[#C9A227]" />
                  <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-1">
                    <span>0%</span><span>50%</span><span>100%</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-1.5 text-xs">
                  <p className="text-[var(--color-text-secondary)]">Client: <span className="font-semibold text-[var(--color-text)]">{selected.client?.name}</span></p>
                  <p className="text-[var(--color-text-secondary)]">Amount: <span className="font-semibold text-[var(--color-gold)]">₹{selected.amount?.toLocaleString("en-IN")}</span></p>
                  <p className="text-[var(--color-text-secondary)]">Email: <span className="font-semibold text-[var(--color-text)]">{selected.client?.email}</span></p>
                </div>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => setSelected(null)} className="btn-outline flex-1">Cancel</button>
                <button onClick={handleUpdateOrder} disabled={updating}
                  className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                  {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
