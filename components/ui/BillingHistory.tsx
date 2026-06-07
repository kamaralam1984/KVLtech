"use client"

import { useState, useEffect } from "react"
import { Loader2, Download, CreditCard, RefreshCw } from "lucide-react"

const SUB_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:    { label: "Active",    color: "#16A34A", bg: "#16A34A15" },
  PAUSED:    { label: "Paused",    color: "#F59E0B", bg: "#F59E0B15" },
  CANCELLED: { label: "Cancelled", color: "#EF4444", bg: "#EF444415" },
  EXPIRED:   { label: "Expired",   color: "#9CA3AF", bg: "#9CA3AF15" },
}

interface BillingHistoryProps {
  clientId?: string
  orderId?: string
}

export function BillingHistory({ clientId, orderId }: BillingHistoryProps) {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [subRes, orderRes] = await Promise.all([
        fetch("/api/subscriptions", { credentials: "include" }),
        fetch("/api/orders", { credentials: "include" }),
      ])
      if (subRes.ok) setSubscriptions(await subRes.json())
      if (orderRes.ok) {
        const data = await orderRes.json()
        let filtered = Array.isArray(data) ? data : (data.orders || [])
        if (orderId) filtered = filtered.filter((o: any) => o.id === orderId)
        setOrders(filtered)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-[var(--color-gold)]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {subscriptions.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-3 flex items-center gap-2">
            <CreditCard size={16} className="text-[var(--color-gold)]" /> Active Subscriptions
          </h3>
          <div className="space-y-3">
            {subscriptions.map(sub => {
              const cfg = SUB_STATUS[sub.status] || SUB_STATUS.EXPIRED
              return (
                <div key={sub.id} className="card p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-sm text-[var(--color-text)]">{sub.planName}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      ₹{sub.amount.toLocaleString("en-IN")} / {sub.billingCycle}
                      {sub.nextBillingAt && ` · Next: ${new Date(sub.nextBillingAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                    </p>
                    {sub.coupon && (
                      <p className="text-[11px] text-[var(--color-gold)] mt-0.5">Coupon applied: {sub.coupon.code}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap"
                    style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {orders.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-3 flex items-center gap-2">
            <Download size={16} className="text-[var(--color-gold)]" /> Payment History
          </h3>
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="card p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm text-[var(--color-text)]">{order.product?.name || "Order"}</p>
                  <p className="text-[11px] font-mono text-[var(--color-text-muted)]">#{order.orderNumber}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    ₹{order.amount?.toLocaleString("en-IN")} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {order.plan && ` · ${order.plan} Plan`}
                  </p>
                </div>
                <a
                  href={`/api/invoice/${order.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all whitespace-nowrap shrink-0">
                  <Download size={13} /> Invoice
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {subscriptions.length === 0 && orders.length === 0 && (
        <div className="text-center py-12">
          <CreditCard size={32} className="text-[var(--color-text-muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--color-text-muted)]">No billing history found</p>
        </div>
      )}

      <button onClick={fetchData}
        className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
        <RefreshCw size={12} /> Refresh
      </button>
    </div>
  )
}
