"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

interface WLConfig {
  companyName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  footerText: string;
  supportEmail: string;
}

interface InvoiceData {
  orderId: string;
  orderNumber: string;
  invoiceDate: string;
  plan: string;
  amount: number;
  base: number;
  gst: number;
  cgst: number;
  sgst: number;
  igst: number;
  isSameState: boolean;
  paymentStatus: string;
  gatewayPaymentId: string | null;
  paidAt: string | null;
  paymentMethod: string | null;
  client: {
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    city: string | null;
  };
  product: {
    name: string;
    category: string;
  };
  seller: {
    name: string;
    gst: string;
    pan: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
  // white-label branding fields (injected by API)
  wlCompanyName?: string;
  wlLogo?: string;
  wlSupportEmail?: string;
  wlPrimaryColor?: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-IN", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function fmt(n: number): string {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const WL_DEFAULTS: WLConfig = {
  companyName: "KVL TECH",
  logo: "/kvl-tech-logo.png",
  primaryColor: "#C9A227",
  secondaryColor: "#0B1437",
  footerText: "KVL Business Solutions",
  supportEmail: "support@kvlbusinesssolutions.com",
};

export default function InvoicePage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wlConfig, setWlConfig] = useState<WLConfig>(WL_DEFAULTS);

  useEffect(() => {
    // Fetch white-label config for branding
    fetch("/api/white-label")
      .then(r => r.json())
      .then(setWlConfig)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/invoice/${orderId}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load invoice");
        }
        return res.json() as Promise<InvoiceData>;
      })
      .then((d) => {
        setData(d);
        // Override WL config with API-provided values if present
        if (d.wlCompanyName || d.wlLogo || d.wlSupportEmail || d.wlPrimaryColor) {
          setWlConfig(prev => ({
            ...prev,
            ...(d.wlCompanyName && { companyName: d.wlCompanyName }),
            ...(d.wlLogo && { logo: d.wlLogo }),
            ...(d.wlSupportEmail && { supportEmail: d.wlSupportEmail }),
            ...(d.wlPrimaryColor && { primaryColor: d.wlPrimaryColor }),
          }));
        }
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#f8f9fc",
        }}
      >
        <Loader2
          style={{ width: 40, height: 40, color: "#C9A227", animation: "spin 1s linear infinite" }}
        />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#f8f9fc",
          gap: 16,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <p style={{ color: "#dc2626", fontSize: 16, fontWeight: 600 }}>
          {error || "Invoice not found"}
        </p>
        <a
          href="/client-portal"
          style={{ color: "#0B1437", fontSize: 14, textDecoration: "underline" }}
        >
          Back to Client Portal
        </a>
      </div>
    );
  }

  const isPaid = data.paymentStatus === "PAID" || data.paymentStatus === "CAPTURED";

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 20mm; size: A4; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* No-print top bar */}
      <div
        className="no-print"
        style={{
          background: wlConfig.secondaryColor,
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <a
          href="/client-portal"
          style={{
            color: wlConfig.primaryColor,
            textDecoration: "none",
            fontSize: 14,
            fontFamily: "Arial, sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← Back to Client Portal
        </a>
        <button
          onClick={() => window.print()}
          style={{
            background: wlConfig.primaryColor,
            color: wlConfig.secondaryColor,
            border: "none",
            borderRadius: 6,
            padding: "8px 20px",
            fontWeight: 700,
            fontSize: 14,
            fontFamily: "Arial, sans-serif",
            cursor: "pointer",
          }}
        >
          Print / Download PDF
        </button>
      </div>

      {/* Invoice Container */}
      <div style={{ background: "#f8f9fc", minHeight: "100vh", padding: "32px 16px" }}>
        <div
          id="invoice-content"
          style={{
            maxWidth: 800,
            margin: "0 auto",
            background: "#ffffff",
            padding: 48,
            fontFamily: "Arial, sans-serif",
            color: "#1A1A2E",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            {/* Left: Seller */}
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#0B1437", marginBottom: 6 }}>
                {data.seller.name}
              </div>
              <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.7 }}>
                <div>{data.seller.address}</div>
                <div>GSTIN: {data.seller.gst}</div>
                <div>PAN: {data.seller.pan}</div>
                <div>{data.seller.phone}</div>
                <div>{data.seller.email}</div>
              </div>
            </div>
            {/* Right: Invoice meta */}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#0B1437", marginBottom: 6 }}>
                TAX INVOICE
              </div>
              <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.8 }}>
                <div>
                  Invoice #<strong style={{ color: "#1A1A2E" }}>{data.orderNumber}</strong>
                </div>
                <div>Date: {formatDate(data.invoiceDate)}</div>
              </div>
            </div>
          </div>

          {/* Brand divider */}
          <div style={{ height: 2, background: wlConfig.primaryColor, margin: "24px 0" }} />

          {/* Bill To / From */}
          <div style={{ display: "flex", gap: 32, marginBottom: 32 }}>
            <div
              style={{
                flex: 1,
                background: "#f8f9fc",
                borderRadius: 8,
                padding: "16px 20px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "#9CA3AF",
                  marginBottom: 8,
                }}
              >
                Bill To
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                <div style={{ fontWeight: 700, color: "#0B1437" }}>{data.client.name}</div>
                {data.client.company && <div>{data.client.company}</div>}
                <div style={{ color: "#6B7280" }}>{data.client.email}</div>
                {data.client.phone && <div style={{ color: "#6B7280" }}>{data.client.phone}</div>}
                {data.client.city && <div style={{ color: "#6B7280" }}>{data.client.city}</div>}
              </div>
            </div>

            <div
              style={{
                flex: 1,
                background: "#f8f9fc",
                borderRadius: 8,
                padding: "16px 20px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "#9CA3AF",
                  marginBottom: 8,
                }}
              >
                From
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                <div style={{ fontWeight: 700, color: "#0B1437" }}>{data.seller.name}</div>
                <div style={{ color: "#6B7280" }}>{data.seller.address}</div>
                <div style={{ color: "#6B7280" }}>GSTIN: {data.seller.gst}</div>
                <div style={{ color: "#6B7280" }}>PAN: {data.seller.pan}</div>
                <div style={{ color: "#6B7280" }}>{data.seller.email}</div>
              </div>
            </div>
          </div>

          {/* Service Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 24,
            }}
          >
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                {["Description", "Plan", "Qty", "Unit Price (₹)", "GST (18%)", "Total (₹)"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        color: "#6B7280",
                        borderBottom: "2px solid #e5e7eb",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  style={{
                    padding: "14px 12px",
                    fontSize: 14,
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{data.product.name}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                    {data.product.category} Development Service
                  </div>
                </td>
                <td style={{ padding: "14px 12px", fontSize: 14, borderBottom: "1px solid #f3f4f6" }}>
                  {data.plan} Plan
                </td>
                <td style={{ padding: "14px 12px", fontSize: 14, borderBottom: "1px solid #f3f4f6" }}>
                  1
                </td>
                <td style={{ padding: "14px 12px", fontSize: 14, borderBottom: "1px solid #f3f4f6" }}>
                  ₹{fmt(data.base)}
                </td>
                <td style={{ padding: "14px 12px", fontSize: 14, borderBottom: "1px solid #f3f4f6" }}>
                  ₹{fmt(data.gst)}
                </td>
                <td style={{ padding: "14px 12px", fontSize: 14, fontWeight: 600, borderBottom: "1px solid #f3f4f6" }}>
                  ₹{fmt(data.amount)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* GST Summary */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
            <div
              style={{
                background: "#f8f9fc",
                borderRadius: 8,
                padding: "16px 24px",
                minWidth: 280,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 8,
                  color: "#6B7280",
                }}
              >
                <span>Subtotal (excl. GST)</span>
                <span>₹{fmt(data.base)}</span>
              </div>
              {data.isSameState ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      marginBottom: 8,
                      color: "#6B7280",
                    }}
                  >
                    <span>CGST @ 9%</span>
                    <span>₹{fmt(data.cgst)}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      marginBottom: 12,
                      color: "#6B7280",
                    }}
                  >
                    <span>SGST @ 9%</span>
                    <span>₹{fmt(data.sgst)}</span>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    marginBottom: 12,
                    color: "#6B7280",
                  }}
                >
                  <span>IGST @ 18%</span>
                  <span>₹{fmt(data.igst)}</span>
                </div>
              )}
              <div
                style={{
                  height: 1,
                  background: "#e5e7eb",
                  marginBottom: 12,
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#0B1437",
                }}
              >
                <span>Total</span>
                <span>₹{fmt(data.amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div style={{ marginBottom: 16 }}>
            <span
              style={{
                display: "inline-block",
                padding: "6px 16px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                background: isPaid ? "#dcfce7" : "#fff3cd",
                color: isPaid ? "#16a34a" : "#b45309",
              }}
            >
              {isPaid ? "✓ PAID" : "PENDING"}
            </span>
          </div>

          {/* Transaction ID */}
          {data.gatewayPaymentId && (
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 8 }}>
              Transaction ID:{" "}
              <span style={{ fontFamily: "monospace", color: "#374151" }}>
                {data.gatewayPaymentId}
              </span>
            </div>
          )}

          {data.paymentMethod && (
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 8 }}>
              Payment Method:{" "}
              <span style={{ color: "#374151", textTransform: "capitalize" }}>
                {data.paymentMethod}
              </span>
            </div>
          )}

          {/* Brand divider */}
          <div style={{ height: 2, background: wlConfig.primaryColor, margin: "28px 0 20px" }} />

          {/* Footer */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0B1437", marginBottom: 6 }}>
              Thank you for your business!
            </div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>
              This is a system-generated invoice.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
