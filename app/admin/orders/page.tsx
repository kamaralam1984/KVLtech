"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Download, Eye, CheckCircle2, Clock,
  XCircle, Loader2, RefreshCw, X, ChevronDown, Save,
  MessageSquare, Send, Paperclip, Plus,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { NoDataEmpty, SearchEmptyState } from "@/components/ui/EmptyState";
import { FilterPanel } from "@/components/admin/FilterPanel";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PAYMENT_PENDING:   { label: "Payment Pending",  color: "#9CA3AF", bg: "#9CA3AF15" },
  PAYMENT_CONFIRMED: { label: "Payment Confirmed", color: "#C9A227", bg: "#C9A22715" },
  DESIGN_STARTED:    { label: "Design Started",    color: "#0891B2", bg: "#0891B215" },
  DEVELOPMENT:       { label: "Development",       color: "#7C3AED", bg: "#7C3AED15" },
  REVIEW_TESTING:    { label: "Review & Testing",  color: "#F59E0B", bg: "#F59E0B15" },
  DELIVERED:         { label: "Delivered",         color: "#16A34A", bg: "#16A34A15" },
  CANCELLED:         { label: "Cancelled",         color: "#EF4444", bg: "#EF444415" },
};

interface ChatMessage {
  id: string;
  orderId: string;
  senderType: string;
  senderName: string;
  text: string;
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newProgress, setNewProgress] = useState(0);
  const [updateError, setUpdateError] = useState("");

  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [filterOpen, setFilterOpen] = useState(false);

  // Create Order modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ clientId: "", productId: "", plan: "BASIC", amount: "", notes: "", deliveryEst: "" });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const loadDropdownData = useCallback(async () => {
    try {
      const [cr, pr] = await Promise.all([
        fetch("/api/admin/clients", { credentials: "include" }).then(r => r.json()),
        fetch("/api/admin/products?dropdown=1", { credentials: "include" }).then(r => r.json()),
      ]);
      setClients(Array.isArray(cr.clients) ? cr.clients : []);
      setProducts(Array.isArray(pr.products) ? pr.products : []);
    } catch (e) { console.error("loadDropdownData:", e); }
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (!createForm.clientId || !createForm.productId || !createForm.amount) {
      setCreateError("Client, product aur amount required hain.");
      return;
    }
    setCreateLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...createForm, amount: parseInt(createForm.amount) * 100 }),
      });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.error || "Error"); }
      else {
        setCreateOpen(false);
        setCreateForm({ clientId: "", productId: "", plan: "BASIC", amount: "", notes: "", deliveryEst: "" });
        fetchOrders();
      }
    } catch { setCreateError("Network error."); }
    setCreateLoading(false);
  };

  const [chatOrder, setChatOrder] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/orders?${params}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const fetchUnreadCounts = useCallback(async (orderList: any[]) => {
    const counts: Record<string, number> = {};
    await Promise.allSettled(
      orderList.map(async (o) => {
        try {
          const res = await fetch(`/api/admin/messages?orderId=${o.id}`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            counts[o.id] = data.unread || 0;
          }
        } catch {}
      })
    );
    setUnreadCounts(counts);
  }, []);

  useEffect(() => {
    if (orders.length > 0) fetchUnreadCounts(orders);
  }, [orders, fetchUnreadCounts]);

  const fetchChatMessages = useCallback(async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/messages?orderId=${orderId}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.messages || []);
        setUnreadCounts(prev => ({ ...prev, [orderId]: 0 }));
      }
    } catch {}
  }, []);

  const openChat = async (order: any) => {
    setChatOrder(order);
    setChatMessages([]);
    setChatLoading(true);
    await fetch(`/api/admin/messages?orderId=${order.id}`, { method: "PATCH", credentials: "include" });
    await fetchChatMessages(order.id);
    setChatLoading(false);
  };

  useEffect(() => {
    if (chatOrder) {
      chatPollRef.current = setInterval(() => fetchChatMessages(chatOrder.id), 5000);
    }
    return () => { if (chatPollRef.current) clearInterval(chatPollRef.current); };
  }, [chatOrder, fetchChatMessages]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendChatMessage = async () => {
    if (!chatText.trim() || !chatOrder || chatSending) return;
    setChatSending(true);
    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId: chatOrder.id, text: chatText.trim() }),
      });
      if (res.ok) {
        setChatText("");
        fetchChatMessages(chatOrder.id);
      }
    } catch {}
    setChatSending(false);
  };

  const handleUpdateOrder = async () => {
    if (!selected) return;
    setUpdating(true);
    setUpdateError("");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: selected.id, status: newStatus, progress: Number(newProgress) }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchOrders();
        setSelected(null);
      } else {
        setUpdateError(data.error || `Error ${res.status}: Update failed`);
      }
    } catch (e) {
      console.error("Update order error:", e);
      setUpdateError("Network error. Please try again.");
    }
    setUpdating(false);
  };

  const handleExport = async () => {
    const res = await fetch("/api/admin/export?type=orders&format=csv");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "orders.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredOrders = orders.filter(o => {
    const fStatus = filterValues.status;
    const fDate = filterValues.date;
    if (fStatus && fStatus !== "" && o.status !== fStatus) return false;
    if (fDate?.from && new Date(o.createdAt) < new Date(fDate.from)) return false;
    if (fDate?.to && new Date(o.createdAt) > new Date(fDate.to + "T23:59:59")) return false;
    return true;
  });

  const totalRevenue = filteredOrders.reduce((s, o) => s + o.amount, 0);

  return (
    <>
      <AdminTopbar title="Orders" action={
        <button onClick={() => { setCreateOpen(true); loadDropdownData(); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-gold)] text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          <Plus size={15} /> New Order
        </button>
      } />
      <div className="p-6 space-y-5 max-w-[1400px]">

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

        <div className="card p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Order ID, client, product..." onKeyDown={e => e.key === "Enter" && fetchOrders()}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm text-[var(--color-text-muted)]">
                <span className="font-semibold text-[var(--color-text)]">{filteredOrders.length}</span> orders ·{" "}
                <span className="font-semibold text-[var(--color-gold)]">₹{totalRevenue.toLocaleString("en-IN")}</span>
              </span>
              <button onClick={fetchOrders} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all">
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>
          <FilterPanel
            filters={[
              {
                key: "status",
                label: "Status",
                type: "select",
                options: Object.entries(STATUS_CONFIG).map(([v, { label }]) => ({ value: v, label })),
              },
              { key: "date", label: "Date Range", type: "daterange" },
            ]}
            values={filterValues}
            onChange={(key, value) => setFilterValues(prev => ({ ...prev, [key]: value }))}
            onReset={() => setFilterValues({})}
            onExport={handleExport}
            isOpen={filterOpen}
            onToggle={() => setFilterOpen(o => !o)}
          />
        </div>

        {loading ? (
          <TableSkeleton rows={8} cols={9} />
        ) : filteredOrders.length === 0 ? (
          <div className="card overflow-hidden">
            {search ? (
              <SearchEmptyState query={search} />
            ) : (
              <NoDataEmpty message="No orders found" />
            )}
          </div>
        ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                <tr>
                  {["Order ID", "Client", "Product", "Plan", "Amount", "Status", "Date", "Chat", "Action"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, i) => {
                  const cfg = STATUS_CONFIG[order.status] || { color: "#9CA3AF", bg: "#9CA3AF15", label: order.status };
                  const unread = unreadCounts[order.id] || 0;
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
                        <button onClick={() => openChat(order)}
                          className="relative flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors">
                          <MessageSquare size={14} />
                          Chat
                          {unread > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold px-0.5">
                              {unread}
                            </span>
                          )}
                        </button>
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
        )}
      </div>

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
              {updateError && (
                <div className="mx-6 mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  {updateError}
                </div>
              )}
              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => { setSelected(null); setUpdateError(""); }} className="btn-outline flex-1">Cancel</button>
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

      <AnimatePresence>
        {chatOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setChatOrder(null); if (chatPollRef.current) clearInterval(chatPollRef.current); }}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-[var(--color-bg)] rounded-2xl w-full max-w-lg shadow-[var(--shadow-luxury)] overflow-hidden flex flex-col"
              style={{ height: "560px" }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                <div>
                  <h3 className="font-display font-bold text-base text-[var(--color-text)]">Chat</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    #{chatOrder.orderNumber} · {chatOrder.client?.name}
                  </p>
                </div>
                <button onClick={() => { setChatOrder(null); if (chatPollRef.current) clearInterval(chatPollRef.current); }}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {chatLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 size={22} className="animate-spin text-[var(--color-gold)]" />
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-text-muted)]">
                    <MessageSquare size={28} className="mb-2 opacity-20" />
                    <p className="text-sm">No messages yet.</p>
                  </div>
                ) : chatMessages.map(msg => {
                  const isAdmin = msg.senderType === "admin";
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] flex flex-col gap-1 ${isAdmin ? "items-end" : "items-start"}`}>
                        <p className="text-[10px] text-[var(--color-text-muted)] px-1">{msg.senderName}</p>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${isAdmin
                          ? "bg-[var(--color-navy)] text-white rounded-tr-sm"
                          : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border border-[var(--color-border)] rounded-tl-sm"}`}>
                          {msg.text}
                          {msg.fileUrl && (
                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                              className={`flex items-center gap-1.5 mt-2 text-xs underline ${isAdmin ? "text-white/70" : "text-[var(--color-gold)]"}`}>
                              <Paperclip size={11} /> {msg.fileName || "Attachment"}
                            </a>
                          )}
                        </div>
                        <p className="text-[9px] text-[var(--color-text-muted)] px-1">
                          {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              <div className="px-4 py-3 border-t border-[var(--color-border)] flex items-center gap-3">
                <input
                  value={chatText}
                  onChange={e => setChatText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                  placeholder="Type a reply..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all placeholder:text-[var(--color-text-muted)]"
                />
                <button onClick={sendChatMessage} disabled={chatSending || !chatText.trim()}
                  className="w-10 h-10 rounded-xl bg-[var(--color-navy)] text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0">
                  {chatSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Order Modal */}
      <AnimatePresence>
        {createOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setCreateOpen(false); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="card w-full max-w-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-[var(--color-text)]">Create New Order</h2>
                <button onClick={() => setCreateOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Client *</label>
                  <select value={createForm.clientId} onChange={e => setCreateForm(f => ({ ...f, clientId: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all">
                    <option value="">— Select Client —</option>
                    {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Product *</label>
                  <select value={createForm.productId} onChange={e => setCreateForm(f => ({ ...f, productId: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all">
                    <option value="">— Select Product —</option>
                    {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Plan *</label>
                    <select value={createForm.plan} onChange={e => setCreateForm(f => ({ ...f, plan: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all">
                      <option value="BASIC">Basic</option>
                      <option value="STANDARD">Standard</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Amount (₹) *</label>
                    <input type="number" min="1" value={createForm.amount}
                      onChange={e => setCreateForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="e.g. 15000"
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Delivery Estimate</label>
                  <input type="date" value={createForm.deliveryEst}
                    onChange={e => setCreateForm(f => ({ ...f, deliveryEst: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Notes</label>
                  <textarea value={createForm.notes} rows={2}
                    onChange={e => setCreateForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Internal notes..."
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all resize-none" />
                </div>
                {createError && <p className="text-xs text-red-500">{createError}</p>}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setCreateOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={createLoading}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--color-gold)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                    {createLoading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                    Create Order
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
