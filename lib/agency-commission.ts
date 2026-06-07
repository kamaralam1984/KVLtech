/**
 * Agency Commission & Partner Tier logic
 *
 * NOTE: Commission and Payout models do NOT exist in prisma/schema.prisma.
 * This module uses in-memory Maps (process-level persistence).
 * In production, add Commission and Payout models to the schema and migrate.
 */

import { db } from "@/lib/db";

// ─────────────────────────────────────────────
// PARTNER TIERS
// ─────────────────────────────────────────────
export const PARTNER_TIERS = {
  STARTER: {
    name: "Starter",
    minRevenue: 0,
    commissionRate: 0.10,
    color: "#6B7280",
    benefits: ["Basic dashboard", "10% commission", "Email support"],
  },
  SILVER: {
    name: "Silver",
    minRevenue: 5000000,   // ₹50,000 in paise
    commissionRate: 0.15,
    color: "#94A3B8",
    benefits: ["Priority support", "15% commission", "Co-branded materials", "Monthly call"],
  },
  GOLD: {
    name: "Gold",
    minRevenue: 20000000,  // ₹2,00,000 in paise
    commissionRate: 0.20,
    color: "#C9A227",
    benefits: ["Dedicated manager", "20% commission", "White-label portal", "Training resources"],
  },
  PLATINUM: {
    name: "Platinum",
    minRevenue: 50000000,  // ₹5,00,000 in paise
    commissionRate: 0.25,
    color: "#7C3AED",
    benefits: ["Custom SLA", "25% commission", "API access", "Revenue sharing", "Co-selling support"],
  },
} as const;

export type TierKey = keyof typeof PARTNER_TIERS;

// ─────────────────────────────────────────────
// IN-MEMORY STORES (replace with DB models in production)
// ─────────────────────────────────────────────
export interface Commission {
  id: string;
  agencyId: string;
  orderId: string;
  clientId: string;
  clientName: string;
  orderAmount: number;     // paise
  commissionRate: number;  // decimal e.g. 0.15
  amount: number;          // paise
  tier: TierKey;
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED";
  createdAt: string;       // ISO
  updatedAt: string;       // ISO
}

export interface Payout {
  id: string;
  agencyId: string;
  amount: number;          // paise
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  notes?: string;
  status: "PENDING" | "PAID" | "REJECTED";
  txnReference?: string;
  createdAt: string;
  updatedAt: string;
}

// Global maps (survive hot-reload in dev via global)
declare global {
  // eslint-disable-next-line no-var
  var __kvl_commissions: Map<string, Commission> | undefined;
  // eslint-disable-next-line no-var
  var __kvl_payouts: Map<string, Payout> | undefined;
}

const commissions: Map<string, Commission> =
  global.__kvl_commissions ?? (global.__kvl_commissions = new Map());

const payouts: Map<string, Payout> =
  global.__kvl_payouts ?? (global.__kvl_payouts = new Map());

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─────────────────────────────────────────────
// TIER HELPERS
// ─────────────────────────────────────────────
function resolveTier(revenueInPaise: number): TierKey {
  if (revenueInPaise >= PARTNER_TIERS.PLATINUM.minRevenue) return "PLATINUM";
  if (revenueInPaise >= PARTNER_TIERS.GOLD.minRevenue) return "GOLD";
  if (revenueInPaise >= PARTNER_TIERS.SILVER.minRevenue) return "SILVER";
  return "STARTER";
}

function nextTierKey(current: TierKey): TierKey | null {
  const order: TierKey[] = ["STARTER", "SILVER", "GOLD", "PLATINUM"];
  const idx = order.indexOf(current);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

// ─────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────

/** Sum all DELIVERED orders for agency's clients to determine revenue. */
export async function getAgencyRevenue(agencyId: string): Promise<number> {
  const agency = await db.agency.findUnique({
    where: { id: agencyId },
    include: { clients: true },
  });
  if (!agency) return 0;

  const clientIds = agency.clients.map((c) => c.clientId);
  if (clientIds.length === 0) return 0;

  const orders = await db.order.findMany({
    where: {
      clientId: { in: clientIds },
      status: "DELIVERED",
    },
    select: { amount: true },
  });

  return orders.reduce((sum, o) => sum + o.amount, 0);
}

export async function getAgencyTier(agencyId: string) {
  const currentRevenue = await getAgencyRevenue(agencyId);
  const tier = resolveTier(currentRevenue);
  const nk = nextTierKey(tier);
  const nextTier = nk ? PARTNER_TIERS[nk] : null;
  const revenueToNextTier = nextTier ? Math.max(0, nextTier.minRevenue - currentRevenue) : 0;
  return {
    tier,
    tierData: PARTNER_TIERS[tier],
    currentRevenue,
    nextTier: nk ? { key: nk, ...nextTier } : null,
    revenueToNextTier,
  };
}

export async function calculateCommission(
  orderId: string,
  agencyId: string
): Promise<{ amount: number; rate: number; tier: TierKey; breakdown: string } | null> {
  // Don't duplicate
  for (const c of commissions.values()) {
    if (c.orderId === orderId && c.agencyId === agencyId) return null;
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { client: true },
  });
  if (!order) return null;

  const { tier, tierData } = await getAgencyTier(agencyId);
  const rate = tierData.commissionRate;
  const amount = Math.floor(order.amount * rate);

  const id = genId();
  const now = new Date().toISOString();
  commissions.set(id, {
    id,
    agencyId,
    orderId,
    clientId: order.clientId,
    clientName: order.client.name,
    orderAmount: order.amount,
    commissionRate: rate,
    amount,
    tier,
    status: "PENDING",
    createdAt: now,
    updatedAt: now,
  });

  return { amount, rate, tier, breakdown: `${tierData.name} tier: ${(rate * 100).toFixed(0)}% of ₹${(order.amount / 100).toLocaleString("en-IN")}` };
}

export interface CommissionFilters {
  status?: Commission["status"];
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export async function getAgencyCommissions(agencyId: string, filters: CommissionFilters = {}) {
  const { status, from, to, page = 1, limit = 10 } = filters;

  let items = Array.from(commissions.values()).filter((c) => c.agencyId === agencyId);

  if (status) items = items.filter((c) => c.status === status);
  if (from) items = items.filter((c) => c.createdAt >= from);
  if (to) items = items.filter((c) => c.createdAt <= to + "T23:59:59.999Z");

  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const total = items.length;
  const paginated = items.slice((page - 1) * limit, page * limit);

  const all = Array.from(commissions.values()).filter((c) => c.agencyId === agencyId);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const summary = {
    totalEarned: all.reduce((s, c) => s + c.amount, 0),
    totalPending: all.filter((c) => c.status === "PENDING").reduce((s, c) => s + c.amount, 0),
    totalPaid: all.filter((c) => c.status === "PAID").reduce((s, c) => s + c.amount, 0),
    thisMonth: all.filter((c) => c.createdAt >= monthStart).reduce((s, c) => s + c.amount, 0),
  };

  return { items: paginated, total, summary };
}

export async function getAgencyPayouts(agencyId: string): Promise<Payout[]> {
  return Array.from(payouts.values())
    .filter((p) => p.agencyId === agencyId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function requestPayout(
  agencyId: string,
  amount: number,
  bankDetails: { bankName: string; accountNumber: string; ifscCode: string; notes?: string }
): Promise<Payout> {
  // Calculate pending balance
  const agencyCommissions = Array.from(commissions.values()).filter(
    (c) => c.agencyId === agencyId && (c.status === "APPROVED")
  );
  const approvedBalance = agencyCommissions.reduce((s, c) => s + c.amount, 0);

  // Also count earned commissions that are PENDING (allow requesting against pending too)
  const pendingBalance = Array.from(commissions.values())
    .filter((c) => c.agencyId === agencyId && c.status === "PENDING")
    .reduce((s, c) => s + c.amount, 0);

  const paidOut = Array.from(payouts.values())
    .filter((p) => p.agencyId === agencyId && p.status !== "REJECTED")
    .reduce((s, p) => s + p.amount, 0);

  const available = approvedBalance + pendingBalance - paidOut;

  if (amount > available) {
    throw new Error(`Amount ₹${(amount / 100).toLocaleString("en-IN")} exceeds available balance ₹${(available / 100).toLocaleString("en-IN")}`);
  }

  const id = genId();
  const now = new Date().toISOString();
  const payout: Payout = {
    id,
    agencyId,
    amount,
    ...bankDetails,
    status: "PENDING",
    createdAt: now,
    updatedAt: now,
  };
  payouts.set(id, payout);
  return payout;
}

export async function updateCommissionStatus(
  commissionId: string,
  status: Commission["status"]
): Promise<Commission | null> {
  const c = commissions.get(commissionId);
  if (!c) return null;
  const updated = { ...c, status, updatedAt: new Date().toISOString() };
  commissions.set(commissionId, updated);
  return updated;
}

export async function updatePayoutStatus(
  payoutId: string,
  status: Payout["status"],
  txnReference?: string
): Promise<Payout | null> {
  const p = payouts.get(payoutId);
  if (!p) return null;
  const updated: Payout = { ...p, status, updatedAt: new Date().toISOString() };
  if (txnReference) updated.txnReference = txnReference;
  payouts.set(payoutId, updated);
  return updated;
}

export async function getAllCommissions(agencyId?: string): Promise<Commission[]> {
  const all = Array.from(commissions.values());
  if (agencyId) return all.filter((c) => c.agencyId === agencyId);
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAllPayouts(agencyId?: string): Promise<Payout[]> {
  const all = Array.from(payouts.values());
  if (agencyId) return all.filter((p) => p.agencyId === agencyId);
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAdminAgencyStats() {
  const agencies = await db.agency.findMany({ include: { clients: true } });

  const totalCommissionsOwed = Array.from(commissions.values())
    .filter((c) => c.status === "PENDING" || c.status === "APPROVED")
    .reduce((s, c) => s + c.amount, 0);

  const totalPaidOut = Array.from(payouts.values())
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + p.amount, 0);

  const tierDistribution: Record<TierKey, number> = {
    STARTER: 0, SILVER: 0, GOLD: 0, PLATINUM: 0,
  };

  const agencyRevenueMap: Record<string, number> = {};
  for (const agency of agencies) {
    const clientIds = agency.clients.map((c) => c.clientId);
    if (clientIds.length > 0) {
      const orders = await db.order.findMany({
        where: { clientId: { in: clientIds }, status: "DELIVERED" },
        select: { amount: true },
      });
      const rev = orders.reduce((s, o) => s + o.amount, 0);
      agencyRevenueMap[agency.id] = rev;
      tierDistribution[resolveTier(rev)]++;
    } else {
      agencyRevenueMap[agency.id] = 0;
      tierDistribution["STARTER"]++;
    }
  }

  const topAgencies = agencies
    .map((a) => ({
      id: a.id,
      name: a.name,
      revenue: agencyRevenueMap[a.id] ?? 0,
      tier: resolveTier(agencyRevenueMap[a.id] ?? 0),
      clientCount: a.clients.length,
    }))
    .sort((x, y) => y.revenue - x.revenue)
    .slice(0, 5);

  return {
    totalAgencies: agencies.length,
    activeAgencies: agencies.filter((a) => a.status === "ACTIVE").length,
    totalCommissionsOwed,
    totalPaidOut,
    topAgencies,
    tierDistribution,
  };
}

export async function getAgencyLeaderboard() {
  const agencies = await db.agency.findMany({
    where: { status: "ACTIVE" },
    include: { clients: true },
  });

  const entries: Array<{
    agencyId: string;
    name: string;
    tier: TierKey;
    revenue: number;
    commissions: number;
    clientCount: number;
  }> = [];

  for (const agency of agencies) {
    const clientIds = agency.clients.map((c) => c.clientId);
    let revenue = 0;
    if (clientIds.length > 0) {
      const orders = await db.order.findMany({
        where: { clientId: { in: clientIds }, status: "DELIVERED" },
        select: { amount: true },
      });
      revenue = orders.reduce((s, o) => s + o.amount, 0);
    }
    const tier = resolveTier(revenue);
    const earned = Array.from(commissions.values())
      .filter((c) => c.agencyId === agency.id)
      .reduce((s, c) => s + c.amount, 0);

    entries.push({
      agencyId: agency.id,
      name: agency.name,
      tier,
      revenue,
      commissions: earned,
      clientCount: agency.clients.length,
    });
  }

  return entries.sort((a, b) => b.revenue - a.revenue).slice(0, 10);
}

/** Resolve agency from kvl_agency_token cookie value — returns agencyId or null. */
export function verifyAgencyToken(token: string): { id: string; email: string } | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const jwt = require("jsonwebtoken");
    const SECRET = process.env.JWT_SECRET || "kvltech-fallback-secret";
    const payload = jwt.verify(token, SECRET) as { id: string; email: string; type: string };
    if (payload.type !== "agency") return null;
    return { id: payload.id, email: payload.email };
  } catch {
    return null;
  }
}
