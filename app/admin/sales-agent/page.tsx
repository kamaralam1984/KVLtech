"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Phone, Send, Globe, CheckCircle, Clock, Users, Target,
  Calendar, Trash2, UserCheck, RefreshCw, BarChart2, Megaphone,
  Settings, MessageSquare, ChevronRight, X, AlertCircle, Zap,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LeadData {
  name?: string;
  email?: string;
  phone?: string;
  businessType?: string;
  budget?: string;
  timeline?: string;
  requirement?: string;
  qualificationScore?: number;
}

interface ConvMessage {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

interface Conversation {
  sessionId: string;
  channel: "whatsapp" | "telegram" | "web";
  stage: string;
  leadData: LeadData;
  messages: ConvMessage[];
  createdAt: string;
  updatedAt: string;
  isQualified: boolean;
  meetingBooked: boolean;
  dbLeadId?: string;
  isHandedOff?: boolean;
}

interface Stats {
  total: number;
  active: number;
  qualified: number;
  meetingsBooked: number;
  byChannel: { whatsapp: number; telegram: number; web: number };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function scoreColor(score: number): string {
  if (score >= 70) return "#22c55e";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

function scoreLabel(score: number): string {
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}

function channelIcon(channel: string) {
  if (channel === "whatsapp") return <Phone size={14} className="text-green-500" />;
  if (channel === "telegram") return <Send size={14} className="text-blue-500" />;
  return <Globe size={14} className="text-purple-500" />;
}

function stageBadge(stage: string) {
  const colors: Record<string, string> = {
    greeting: "bg-gray-500/20 text-gray-400",
    qualifying: "bg-blue-500/20 text-blue-400",
    pitching: "bg-amber-500/20 text-amber-400",
    booking: "bg-green-500/20 text-green-400",
    followup: "bg-purple-500/20 text-purple-400",
    closed: "bg-gray-500/10 text-gray-500",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${colors[stage] || colors.greeting}`}>
      {stage}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SalesAgentPage() {
  const [tab, setTab] = useState<"conversations" | "config" | "broadcast" | "analytics">("conversations");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState<"all" | "whatsapp" | "telegram" | "web" | "qualified" | "unqualified">("all");
  const [handoffMessage, setHandoffMessage] = useState("");
  const [handoffSending, setHandoffSending] = useState(false);
  const [handoffSuccess, setHandoffSuccess] = useState(false);

  // Config state
  const [agentName, setAgentName] = useState("Kavya");
  const [agentLang, setAgentLang] = useState("hinglish");
  const [qualThreshold, setQualThreshold] = useState(60);
  const [autoHandoff, setAutoHandoff] = useState(true);

  // Broadcast state
  const [broadcastChannel, setBroadcastChannel] = useState<"whatsapp" | "telegram">("whatsapp");
  const [broadcastFilter, setBroadcastFilter] = useState<"all" | "qualified" | "inactive">("all");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [broadcastConfirm, setBroadcastConfirm] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sales-agent", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setConversations(data.conversations || []);
        // Update selected if it's open
        if (selected) {
          const updated = (data.conversations || []).find((c: Conversation) => c.sessionId === selected.sessionId);
          if (updated) setSelected(updated);
        }
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [selected]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Filtered conversations
  const filtered = conversations.filter((c) => {
    if (channelFilter === "whatsapp") return c.channel === "whatsapp";
    if (channelFilter === "telegram") return c.channel === "telegram";
    if (channelFilter === "web") return c.channel === "web";
    if (channelFilter === "qualified") return c.isQualified;
    if (channelFilter === "unqualified") return !c.isQualified;
    return true;
  });

  const handleDelete = async (sessionId: string) => {
    if (!confirm("Delete this conversation?")) return;
    await fetch(`/api/admin/sales-agent?sessionId=${encodeURIComponent(sessionId)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (selected?.sessionId === sessionId) setSelected(null);
    fetchData();
  };

  const handleHandoff = async () => {
    if (!selected || !handoffMessage.trim()) return;
    setHandoffSending(true);
    setHandoffSuccess(false);
    try {
      const res = await fetch("/api/admin/sales-agent", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "handoff",
          sessionId: selected.sessionId,
          adminMessage: handoffMessage,
        }),
      });
      if (res.ok) {
        setHandoffSuccess(true);
        setHandoffMessage("");
        fetchData();
      }
    } finally {
      setHandoffSending(false);
    }
  };

  const handleBroadcast = async () => {
    setBroadcastLoading(true);
    setBroadcastResult(null);
    try {
      const res = await fetch("/api/admin/sales-agent/broadcast", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: broadcastChannel,
          message: broadcastMessage,
          filter: broadcastFilter,
        }),
      });
      if (res.ok) {
        setBroadcastResult(await res.json());
        setBroadcastMessage("");
      }
    } finally {
      setBroadcastLoading(false);
      setBroadcastConfirm(false);
    }
  };

  const broadcastTargetCount = conversations.filter((c) => {
    if (c.channel !== broadcastChannel) return false;
    if (broadcastFilter === "qualified") return c.isQualified;
    if (broadcastFilter === "inactive") {
      return Date.now() - new Date(c.updatedAt).getTime() > 3 * 24 * 60 * 60 * 1000;
    }
    return true;
  }).length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center">
            <Bot size={20} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)]">AI Sales Agent</h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Kavya — Autonomous lead qualification & booking
            </p>
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 text-green-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Active
          </span>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Conversations", value: stats.total, icon: MessageSquare, color: "text-blue-400" },
            { label: "Active (24h)", value: stats.active, icon: Clock, color: "text-green-400" },
            { label: "Qualified Leads", value: stats.qualified, icon: Target, color: "text-amber-400" },
            { label: "Meetings Booked", value: stats.meetingsBooked, icon: Calendar, color: "text-purple-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
                <Icon size={14} className={color} />
              </div>
              <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="px-6 border-b border-[var(--color-border)] flex gap-1">
        {(["conversations", "config", "broadcast", "analytics"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t
                ? "border-[var(--color-gold)] text-[var(--color-gold)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {t === "conversations" ? "Live Conversations" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab: Conversations */}
      {tab === "conversations" && (
        <div className="flex h-[calc(100vh-280px)]">
          {/* Conversation list */}
          <div className="w-full md:w-80 lg:w-96 border-r border-[var(--color-border)] flex flex-col shrink-0">
            {/* Filter bar */}
            <div className="p-3 border-b border-[var(--color-border)] flex flex-wrap gap-1">
              {(["all", "whatsapp", "telegram", "web", "qualified", "unqualified"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setChannelFilter(f)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize transition-colors ${
                    channelFilter === f
                      ? "bg-[var(--color-navy)] text-white"
                      : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-[var(--color-text-muted)] text-sm">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-center text-[var(--color-text-muted)] text-sm">
                  No conversations yet
                </div>
              ) : (
                filtered.map((conv) => (
                  <button
                    key={conv.sessionId}
                    onClick={() => setSelected(conv)}
                    className={`w-full text-left p-4 border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors ${
                      selected?.sessionId === conv.sessionId ? "bg-[var(--color-bg-secondary)]" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {channelIcon(conv.channel)}
                        <span className="text-sm font-medium text-[var(--color-text)] truncate">
                          {conv.leadData.name || conv.sessionId.slice(0, 16)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {stageBadge(conv.stage)}
                      </div>
                    </div>

                    {/* Last message */}
                    <p className="text-xs text-[var(--color-text-muted)] truncate mb-2">
                      {conv.messages[conv.messages.length - 1]?.content || "No messages"}
                    </p>

                    {/* Score bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-[var(--color-border)]">
                        <div
                          className="h-1 rounded-full transition-all"
                          style={{
                            width: `${conv.leadData.qualificationScore || 0}%`,
                            backgroundColor: scoreColor(conv.leadData.qualificationScore || 0),
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-bold shrink-0" style={{ color: scoreColor(conv.leadData.qualificationScore || 0) }}>
                        {conv.leadData.qualificationScore || 0}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">
                        {timeAgo(conv.updatedAt)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Conversation detail */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selected ? (
              <>
                {/* Detail header */}
                <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {channelIcon(selected.channel)}
                    <div>
                      <p className="font-semibold text-[var(--color-text)] text-sm">
                        {selected.leadData.name || selected.sessionId}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {selected.channel} · {stageBadge(selected.stage)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(selected.sessionId)}
                      className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete conversation"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors">
                      <X size={15} className="text-[var(--color-text-muted)]" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                  {/* Chat bubbles */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {selected.messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                            msg.role === "user"
                              ? "bg-[var(--color-navy)] text-white rounded-br-sm"
                              : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] rounded-bl-sm border border-[var(--color-border)]"
                          }`}
                        >
                          {msg.content}
                          <div className="text-[9px] opacity-50 mt-1 text-right">
                            {new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Lead data sidebar */}
                  <div className="w-60 border-l border-[var(--color-border)] p-4 overflow-y-auto shrink-0 flex flex-col gap-4">
                    {/* Score gauge */}
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">Qualification Score</p>
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14">
                          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                            <circle cx="28" cy="28" r="22" fill="none" stroke="var(--color-border)" strokeWidth="6" />
                            <circle
                              cx="28" cy="28" r="22" fill="none"
                              stroke={scoreColor(selected.leadData.qualificationScore || 0)}
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeDasharray={`${((selected.leadData.qualificationScore || 0) / 100) * 138.2} 138.2`}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[var(--color-text)]">
                            {selected.leadData.qualificationScore || 0}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: scoreColor(selected.leadData.qualificationScore || 0) }}>
                            {scoreLabel(selected.leadData.qualificationScore || 0)}
                          </p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">Lead quality</p>
                        </div>
                      </div>
                    </div>

                    {/* Lead fields */}
                    <div className="space-y-2">
                      {[
                        { label: "Name", value: selected.leadData.name },
                        { label: "Email", value: selected.leadData.email },
                        { label: "Phone", value: selected.leadData.phone },
                        { label: "Business", value: selected.leadData.businessType },
                        { label: "Budget", value: selected.leadData.budget },
                        { label: "Timeline", value: selected.leadData.timeline },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">{label}</p>
                          <p className="text-xs text-[var(--color-text)] font-medium">{value || "—"}</p>
                        </div>
                      ))}
                      {selected.leadData.requirement && (
                        <div>
                          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">Requirement</p>
                          <p className="text-xs text-[var(--color-text)]">{selected.leadData.requirement.slice(0, 100)}</p>
                        </div>
                      )}
                    </div>

                    {/* Handoff */}
                    {!selected.isHandedOff && (
                      <div className="mt-auto pt-3 border-t border-[var(--color-border)]">
                        <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2 flex items-center gap-1">
                          <UserCheck size={12} />
                          Handoff to Human
                        </p>
                        <textarea
                          value={handoffMessage}
                          onChange={(e) => setHandoffMessage(e.target.value)}
                          placeholder="Type a message to send..."
                          rows={3}
                          className="w-full text-xs px-2 py-1.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] resize-none focus:outline-none focus:border-[var(--color-gold)] mb-2"
                        />
                        <button
                          onClick={handleHandoff}
                          disabled={!handoffMessage.trim() || handoffSending}
                          className="w-full py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-navy)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {handoffSending ? "Sending..." : "Send & Handoff"}
                        </button>
                        {handoffSuccess && (
                          <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                            <CheckCircle size={10} /> Handed off successfully
                          </p>
                        )}
                      </div>
                    )}
                    {selected.isHandedOff && (
                      <div className="mt-auto pt-3 border-t border-[var(--color-border)]">
                        <p className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle size={12} /> Handed off to human agent
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[var(--color-text-muted)]">
                <MessageSquare size={40} className="opacity-30" />
                <p className="text-sm">Select a conversation to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Config */}
      {tab === "config" && (
        <div className="p-6 max-w-2xl">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Agent Name</label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Response Language</label>
              <div className="flex gap-2">
                {(["English", "Hindi", "Hinglish"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setAgentLang(lang.toLowerCase())}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      agentLang === lang.toLowerCase()
                        ? "bg-[var(--color-navy)] text-white"
                        : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
                Qualification Threshold: <span className="text-[var(--color-gold)]">{qualThreshold}</span>
              </label>
              <input
                type="range"
                min={50}
                max={80}
                value={qualThreshold}
                onChange={(e) => setQualThreshold(Number(e.target.value))}
                className="w-full accent-[#C9A227]"
              />
              <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-1">
                <span>50 (Lenient)</span>
                <span>80 (Strict)</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">Auto-Handoff</p>
                <p className="text-xs text-[var(--color-text-muted)]">Hand off to human after 12 messages without booking</p>
              </div>
              <button
                onClick={() => setAutoHandoff(!autoHandoff)}
                className={`relative w-11 h-6 rounded-full transition-colors ${autoHandoff ? "bg-[var(--color-gold)]" : "bg-[var(--color-border)]"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${autoHandoff ? "translate-x-5" : ""}`} />
              </button>
            </div>

            <button className="px-6 py-2.5 rounded-xl bg-[var(--color-navy)] text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
              <Settings size={14} />
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Tab: Broadcast */}
      {tab === "broadcast" && (
        <div className="p-6 max-w-2xl">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Channel</label>
              <div className="flex gap-2">
                {(["whatsapp", "telegram"] as const).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setBroadcastChannel(ch)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      broadcastChannel === ch
                        ? "bg-[var(--color-navy)] text-white"
                        : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
                    }`}
                  >
                    {ch === "whatsapp" ? <Phone size={14} className="text-green-500" /> : <Send size={14} className="text-blue-500" />}
                    {ch.charAt(0).toUpperCase() + ch.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Audience</label>
              <div className="flex gap-2">
                {(["all", "qualified", "inactive"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setBroadcastFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                      broadcastFilter === f
                        ? "bg-[var(--color-navy)] text-white"
                        : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
                    }`}
                  >
                    {f === "inactive" ? "Inactive (3+ days)" : f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[var(--color-text)]">Message</label>
                <span className="text-xs text-[var(--color-text-muted)]">{broadcastMessage.length}/500</span>
              </div>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value.slice(0, 500))}
                placeholder="Type your broadcast message..."
                rows={5}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] resize-none focus:outline-none focus:border-[var(--color-gold)]"
              />
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
              Will reach <span className="font-bold text-[var(--color-text)]">~{Math.min(broadcastTargetCount, 50)}</span> contacts
              {broadcastTargetCount > 50 && " (capped at 50)"}
            </div>

            {broadcastResult && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-400">
                Broadcast sent: {broadcastResult.sent} delivered, {broadcastResult.failed} failed out of {broadcastResult.total}
              </div>
            )}

            {!broadcastConfirm ? (
              <button
                onClick={() => setBroadcastConfirm(true)}
                disabled={!broadcastMessage.trim() || broadcastTargetCount === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-gold)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <Megaphone size={14} />
                Send Broadcast
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-400 mb-3 flex items-center gap-2">
                  <AlertCircle size={14} />
                  Are you sure? This will send to ~{Math.min(broadcastTargetCount, 50)} contacts.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleBroadcast}
                    disabled={broadcastLoading}
                    className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {broadcastLoading ? "Sending..." : "Confirm Send"}
                  </button>
                  <button
                    onClick={() => setBroadcastConfirm(false)}
                    className="px-4 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Analytics */}
      {tab === "analytics" && stats && (
        <div className="p-6 grid md:grid-cols-2 gap-6 max-w-4xl">
          {/* Conversion Funnel */}
          <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="text-[var(--color-gold)]" />
              Conversion Funnel
            </h3>
            <div className="space-y-3">
              {[
                { label: "Started", value: stats.total, pct: 100 },
                { label: "Qualified", value: stats.qualified, pct: stats.total > 0 ? Math.round((stats.qualified / stats.total) * 100) : 0 },
                { label: "Meeting Booked", value: stats.meetingsBooked, pct: stats.total > 0 ? Math.round((stats.meetingsBooked / stats.total) * 100) : 0 },
              ].map(({ label, value, pct }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--color-text-muted)]">{label}</span>
                    <span className="font-semibold text-[var(--color-text)]">{value} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-border)]">
                    <div
                      className="h-2 rounded-full bg-[var(--color-gold)] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Channel breakdown */}
          <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <Zap size={16} className="text-[var(--color-gold)]" />
              Channel Breakdown
            </h3>
            {stats.total === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">No data yet</p>
            ) : (
              <div className="flex items-center gap-6">
                {/* CSS Donut */}
                <div className="relative w-24 h-24 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                    {(() => {
                      const channels = [
                        { key: "whatsapp", color: "#22c55e" },
                        { key: "telegram", color: "#3b82f6" },
                        { key: "web", color: "#a855f7" },
                      ];
                      let offset = 0;
                      const circumference = 2 * Math.PI * 15.9;
                      return channels.map(({ key, color }) => {
                        const count = stats.byChannel[key as keyof typeof stats.byChannel] || 0;
                        const pct = stats.total > 0 ? count / stats.total : 0;
                        const dash = pct * circumference;
                        const el = (
                          <circle
                            key={key}
                            cx="18" cy="18" r="15.9"
                            fill="none"
                            stroke={color}
                            strokeWidth="3.8"
                            strokeDasharray={`${dash} ${circumference - dash}`}
                            strokeDashoffset={-offset}
                          />
                        );
                        offset += dash;
                        return el;
                      });
                    })()}
                    <circle cx="18" cy="18" r="10" fill="var(--color-bg-secondary)" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[var(--color-text)]">
                    {stats.total}
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { key: "whatsapp", label: "WhatsApp", color: "#22c55e", icon: <Phone size={12} /> },
                    { key: "telegram", label: "Telegram", color: "#3b82f6", icon: <Send size={12} /> },
                    { key: "web", label: "Web", color: "#a855f7", icon: <Globe size={12} /> },
                  ].map(({ key, label, color, icon }) => {
                    const count = stats.byChannel[key as keyof typeof stats.byChannel] || 0;
                    return (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        <span style={{ color }}>{icon}</span>
                        <span className="text-[var(--color-text-muted)]">{label}</span>
                        <span className="font-semibold text-[var(--color-text)] ml-auto">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Summary stats */}
          <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] md:col-span-2">
            <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <Target size={16} className="text-[var(--color-gold)]" />
              Quick Insights
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-[var(--color-text-muted)] text-xs mb-1">Response Time</p>
                <p className="font-semibold text-green-400">Instant</p>
              </div>
              <div>
                <p className="text-[var(--color-text-muted)] text-xs mb-1">Active Today</p>
                <p className="font-semibold text-[var(--color-text)]">{stats.active}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-muted)] text-xs mb-1">Qualification Rate</p>
                <p className="font-semibold text-[var(--color-text)]">
                  {stats.total > 0 ? Math.round((stats.qualified / stats.total) * 100) : 0}%
                </p>
              </div>
              <div>
                <p className="text-[var(--color-text-muted)] text-xs mb-1">Booking Rate</p>
                <p className="font-semibold text-[var(--color-text)]">
                  {stats.qualified > 0 ? Math.round((stats.meetingsBooked / stats.qualified) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
