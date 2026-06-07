"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar, Clock, User, Mail, Phone, CheckCircle, XCircle,
  Loader2, Link as LinkIcon, AlertCircle,
  Upload, Mic, FileText, TrendingUp, ThumbsUp, ThumbsDown, Minus,
  AlertTriangle, Copy, Check, BarChart2, Video, Download,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";
import { MeetingCalendar } from "@/components/admin/MeetingCalendar";
import { AvailabilityManager } from "@/components/admin/AvailabilityManager";

// Calendar link helpers (client-side only)
function googleCalendarLink(b: { title: string; date: string; duration: number; notes?: string; meetingLink?: string }) {
  const start = new Date(b.date);
  const end = new Date(start.getTime() + b.duration * 60000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: b.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: b.notes || "",
    location: b.meetingLink || "",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function outlookCalendarLink(b: { title: string; date: string; duration: number; notes?: string }) {
  const start = new Date(b.date);
  const end = new Date(start.getTime() + b.duration * 60000);
  const params = new URLSearchParams({
    subject: b.title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: b.notes || "",
    path: "/calendar/action/compose",
    rru: "addevent",
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params}`;
}

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  date: string;
  duration: number;
  title: string;
  notes?: string;
  meetingLink?: string;
  status: BookingStatus;
  createdAt: string;
}

interface TranscriptAnalysis {
  summary: string;
  keyTopics: string[];
  actionItems: string[];
  decisions: string[];
  followUpRequired: boolean;
  followUpDetails: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  leadQualification: {
    interestLevel: "High" | "Medium" | "Low" | "N/A";
    budgetDiscussed: boolean;
    timelineDiscussed: boolean;
  };
}

interface MeetingRecordState {
  transcript: string;
  analysis: TranscriptAnalysis | null;
  uploading: boolean;
  progress: number;
  error: string;
  followUpEmail: string;
  generatingEmail: boolean;
  emailCopied: boolean;
}

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  NO_SHOW: "bg-gray-100 text-gray-600",
};


function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
}

function SentimentBadge({ sentiment }: { sentiment: "Positive" | "Neutral" | "Negative" }) {
  if (sentiment === "Positive") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
        <ThumbsUp size={11} /> Positive
      </span>
    );
  }
  if (sentiment === "Negative") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <ThumbsDown size={11} /> Negative
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
      <Minus size={11} /> Neutral
    </span>
  );
}

function InterestBadge({ level }: { level: "High" | "Medium" | "Low" | "N/A" }) {
  const styles: Record<string, string> = {
    High: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Medium: "bg-blue-100 text-blue-700 border-blue-200",
    Low: "bg-gray-100 text-gray-600 border-gray-200",
    "N/A": "bg-gray-50 text-gray-400 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[level] || styles["N/A"]}`}>
      Interest: {level}
    </span>
  );
}

function ClosingBar({ probability }: { probability: number }) {
  const color =
    probability >= 70 ? "bg-green-500" :
    probability >= 40 ? "bg-yellow-500" :
    "bg-red-400";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${probability}%` }} />
      </div>
      <span className="text-xs font-bold text-[var(--color-text)] w-10 text-right">{probability}%</span>
    </div>
  );
}

function MeetingRecordPanel({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const [state, setState] = useState<MeetingRecordState>({
    transcript: "",
    analysis: null,
    uploading: false,
    progress: 0,
    error: "",
    followUpEmail: "",
    generatingEmail: false,
    emailCopied: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const agentName = "KVL TECH Team";

  const patch = (p: Partial<MeetingRecordState>) =>
    setState((prev) => ({ ...prev, ...p }));

  async function handleFileUpload(file: File) {
    if (!file) return;
    const MAX = 25 * 1024 * 1024;
    if (file.size > MAX) {
      patch({ error: "File too large. Maximum size is 25MB." });
      return;
    }

    patch({ uploading: true, error: "", progress: 10 });

    // Simulate progress steps while transcribing
    const progressTimer = setInterval(() => {
      setState((prev) => ({
        ...prev,
        progress: prev.progress < 85 ? prev.progress + 10 : prev.progress,
      }));
    }, 1500);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("meetingId", booking.id);
      fd.append("callType", "meeting");

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      clearInterval(progressTimer);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        patch({ uploading: false, progress: 0, error: err.error || "Transcription failed." });
        return;
      }

      const data = await res.json();
      patch({
        uploading: false,
        progress: 100,
        transcript: data.transcript || "",
        analysis: data.analysis || null,
        error: "",
      });
    } catch {
      clearInterval(progressTimer);
      patch({ uploading: false, progress: 0, error: "Network error. Please try again." });
    }
  }

  async function handleGenerateEmail() {
    if (!state.analysis) return;
    patch({ generatingEmail: true, followUpEmail: "" });
    try {
      const res = await fetch("/api/admin/calls/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          transcript: state.transcript,
          clientName: booking.clientName,
          generateEmail: true,
          agentName,
        }),
      });
      const data = await res.json();
      patch({ followUpEmail: data.followUpEmail || "", generatingEmail: false });
    } catch {
      patch({ generatingEmail: false });
    }
  }

  function copyEmail() {
    if (!state.followUpEmail) return;
    navigator.clipboard.writeText(state.followUpEmail);
    patch({ emailCopied: true });
    setTimeout(() => patch({ emailCopied: false }), 2000);
  }

  const { analysis } = state;

  return (
    <div className="mt-4 border-t border-[var(--color-border)] pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-[var(--color-text)] flex items-center gap-2">
          <Mic size={14} className="text-[var(--color-gold)]" /> Record &amp; Analyze
        </h4>
        <button onClick={onClose} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
          Close
        </button>
      </div>

      {/* Upload area */}
      <div
        className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-5 text-center hover:border-[var(--color-gold)]/60 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="audio/webm,audio/mp4,audio/wav,audio/m4a,audio/mpeg,video/mp4"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
        />
        {state.uploading ? (
          <div className="space-y-2">
            <Loader2 size={24} className="mx-auto text-[var(--color-gold)] animate-spin" />
            <p className="text-xs text-[var(--color-text-muted)]">Transcribing... please wait</p>
            <div className="h-1.5 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden max-w-xs mx-auto">
              <div
                className="h-full bg-[var(--color-gold)] rounded-full transition-all duration-500"
                style={{ width: `${state.progress}%` }}
              />
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)]">{state.progress}%</p>
          </div>
        ) : (
          <>
            <Upload size={22} className="mx-auto mb-2 text-[var(--color-text-muted)]" />
            <p className="text-sm font-semibold text-[var(--color-text)]">Upload Recording</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">audio/video · max 25MB · webm, mp4, wav, m4a</p>
          </>
        )}
      </div>

      {state.error && (
        <p className="text-xs text-red-500 flex items-center gap-2">
          <AlertCircle size={13} /> {state.error}
        </p>
      )}

      {/* Transcript */}
      {state.transcript && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide flex items-center gap-1.5">
            <FileText size={12} /> Transcript
          </p>
          <textarea
            readOnly
            value={state.transcript}
            rows={6}
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text)] resize-none font-mono focus:outline-none"
          />
        </div>
      )}

      {/* AI Analysis Panel */}
      {analysis && (
        <div className="space-y-4 p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <p className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wide flex items-center gap-1.5">
            <TrendingUp size={13} className="text-[var(--color-gold)]" /> AI Analysis
          </p>

          {/* Badges row */}
          <div className="flex flex-wrap gap-2">
            <SentimentBadge sentiment={analysis.sentiment} />
            <InterestBadge level={analysis.leadQualification.interestLevel} />
            {analysis.leadQualification.budgetDiscussed && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">Budget Discussed</span>
            )}
            {analysis.leadQualification.timelineDiscussed && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700 border border-cyan-200">Timeline Discussed</span>
            )}
          </div>

          {/* Closing probability — derived from interest level */}
          <div>
            <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1.5">Closing Probability</p>
            <ClosingBar probability={
              analysis.leadQualification.interestLevel === "High" ? 70 :
              analysis.leadQualification.interestLevel === "Medium" ? 45 :
              analysis.leadQualification.interestLevel === "Low" ? 20 : 30
            } />
          </div>

          {/* Summary */}
          {analysis.summary && (
            <div>
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1">Summary</p>
              <p className="text-xs text-[var(--color-text)] leading-relaxed">{analysis.summary}</p>
            </div>
          )}

          {/* Key Topics */}
          {analysis.keyTopics.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Key Topics</p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.keyTopics.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-gold)]/10 text-[var(--color-text)] border border-[var(--color-gold)]/20">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Items */}
          {analysis.actionItems.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Action Items</p>
              <ul className="space-y-1">
                {analysis.actionItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-text)]">
                    <CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Decisions */}
          {analysis.decisions.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Decisions Made</p>
              <ul className="space-y-1">
                {analysis.decisions.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-text)]">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center shrink-0 font-bold mt-0.5">{i + 1}</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Follow-up */}
          {analysis.followUpRequired && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
              <AlertTriangle size={13} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-700">Follow-up Required</p>
                {analysis.followUpDetails && (
                  <p className="text-xs text-amber-600 mt-0.5">{analysis.followUpDetails}</p>
                )}
              </div>
            </div>
          )}

          {/* Follow-up email */}
          <div className="pt-2 border-t border-[var(--color-border)]">
            <button
              onClick={handleGenerateEmail}
              disabled={state.generatingEmail}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--color-navy)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {state.generatingEmail ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
              Generate Follow-up Email
            </button>

            {state.followUpEmail && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Follow-up Email</p>
                  <button
                    onClick={copyEmail}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                  >
                    {state.emailCopied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={state.followUpEmail}
                  rows={8}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] resize-none focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface MeetingStatsCard {
  totalThisMonth: number;
  completed: number;
  pending: number;
  confirmed: number;
}

export default function AdminMeetingsPage() {
  const [activeTab, setActiveTab] = useState<"calendar" | "bookings" | "availability">("calendar");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [upcoming, setUpcoming] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [actionBookingId, setActionBookingId] = useState<string | null>(null);
  const [meetingLinkInputs, setMeetingLinkInputs] = useState<Record<string, string>>({});
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [creatingZoomId, setCreatingZoomId] = useState<string | null>(null);
  const [zoomError, setZoomError] = useState<Record<string, string>>({});

  // Fetch bookings
  useEffect(() => {
    setLoadingBookings(true);
    const params = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
    fetch(`/api/admin/meetings/bookings${params}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.bookings) { setBookings(d.bookings); setUpcoming(d.upcoming || 0); }
      })
      .catch(console.error)
      .finally(() => setLoadingBookings(false));
  }, [statusFilter]);

  // Compute stats from bookings
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const statsThisMonth: MeetingStatsCard = bookings.reduce(
    (acc, b) => {
      const d = new Date(b.date);
      if (d >= thisMonthStart) {
        acc.totalThisMonth++;
        if (b.status === "COMPLETED") acc.completed++;
        if (b.status === "PENDING") acc.pending++;
        if (b.status === "CONFIRMED") acc.confirmed++;
      }
      return acc;
    },
    { totalThisMonth: 0, completed: 0, pending: 0, confirmed: 0 }
  );

  async function updateBookingStatus(id: string, status: BookingStatus, meetingLink?: string) {
    setConfirmingId(id);
    try {
      const res = await fetch("/api/admin/meetings/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status, meetingLink }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => b.id === id ? { ...b, status, meetingLink: meetingLink || b.meetingLink } : b)
        );
        setActionBookingId(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConfirmingId(null);
    }
  }

  async function createZoomForBooking(id: string) {
    setCreatingZoomId(id);
    setZoomError((prev) => ({ ...prev, [id]: "" }));
    try {
      const res = await fetch("/api/admin/meetings/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, createZoomLink: true }),
      });
      const data = await res.json();
      if (res.ok && data.booking) {
        setBookings((prev) =>
          prev.map((b) => b.id === id ? { ...b, meetingLink: data.booking.meetingLink || b.meetingLink } : b)
        );
      } else {
        setZoomError((prev) => ({ ...prev, [id]: data.error || "Failed to create Zoom meeting" }));
      }
    } catch {
      setZoomError((prev) => ({ ...prev, [id]: "Network error" }));
    } finally {
      setCreatingZoomId(null);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminTopbar title="Meetings" />

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">

        {/* Stats Header Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "This Month", value: statsThisMonth.totalThisMonth, icon: Calendar, color: "text-[var(--color-gold)]", bg: "bg-[var(--color-gold)]/10" },
            { label: "Upcoming", value: upcoming, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Completed", value: statsThisMonth.completed, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Pending", value: statsThisMonth.pending, icon: BarChart2, color: "text-amber-500", bg: "bg-amber-500/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                <Icon size={16} className={color} />
              </div>
              <div>
                <p className="font-bold text-xl text-[var(--color-text)]">{value}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] w-fit mb-6">
          {([
            { id: "calendar",     label: "Calendar View" },
            { id: "bookings",     label: "Bookings List" },
            { id: "availability", label: "Availability Settings" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[var(--color-navy)] text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CALENDAR TAB */}
        {activeTab === "calendar" && (
          <MeetingCalendar />
        )}

        {/* BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <div>
            {/* Filter */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    statusFilter === s
                      ? "bg-[var(--color-navy)] text-white border-[var(--color-navy)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-navy)] hover:text-[var(--color-navy)]"
                  }`}
                >
                  {s === "ALL" ? "All Bookings" : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {loadingBookings ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-[var(--color-gold)]" size={32} />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16">
                <Calendar size={40} className="text-[var(--color-text-muted)] mx-auto mb-3 opacity-40" />
                <p className="text-[var(--color-text-muted)]">No bookings found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-semibold text-[var(--color-text)]">{b.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_STYLES[b.status]}`}>
                            {b.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-text-muted)]">
                          <span className="flex items-center gap-1.5"><User size={12} />{b.clientName}</span>
                          <span className="flex items-center gap-1.5"><Mail size={12} />{b.clientEmail}</span>
                          {b.clientPhone && <span className="flex items-center gap-1.5"><Phone size={12} />{b.clientPhone}</span>}
                          <span className="flex items-center gap-1.5"><Calendar size={12} />{formatDate(b.date)}</span>
                          <span className="flex items-center gap-1.5"><Clock size={12} />{formatTime(b.date)} ({b.duration}min)</span>
                        </div>
                        {b.notes && (() => {
                          try {
                            const parsed = JSON.parse(b.notes);
                            if (parsed.transcript || parsed.analysis) return null; // Don't show raw JSON
                          } catch {}
                          return <p className="text-xs text-[var(--color-text-muted)] mt-2 italic">"{b.notes}"</p>;
                        })()}
                        {b.meetingLink && (
                          <a href={b.meetingLink} target="_blank" rel="noreferrer"
                            className="text-xs text-[var(--color-gold)] flex items-center gap-1 mt-1 hover:underline">
                            <LinkIcon size={11} /> {b.meetingLink}
                          </a>
                        )}

                        {/* Add to Calendar buttons */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <a
                            href={googleCalendarLink(b)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--color-border)] text-[10px] font-medium text-[var(--color-text-muted)] hover:border-blue-400 hover:text-blue-600 transition-colors"
                          >
                            <Calendar size={10} /> Google Calendar
                          </a>
                          <a
                            href={outlookCalendarLink(b)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--color-border)] text-[10px] font-medium text-[var(--color-text-muted)] hover:border-blue-400 hover:text-blue-600 transition-colors"
                          >
                            <Calendar size={10} /> Outlook
                          </a>
                          <a
                            href={`/api/meetings/${b.id}/ical`}
                            download
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--color-border)] text-[10px] font-medium text-[var(--color-text-muted)] hover:border-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Download size={10} /> Apple Calendar (.ics)
                          </a>
                        </div>

                        {/* Zoom integration */}
                        <div className="mt-2">
                          {b.meetingLink?.includes("zoom.us") ? (
                            <p className="text-[10px] text-green-600 flex items-center gap-1">
                              <Video size={10} /> Zoom meeting linked
                            </p>
                          ) : process.env.NEXT_PUBLIC_ZOOM_CONFIGURED === "true" ? (
                            <button
                              onClick={() => createZoomForBooking(b.id)}
                              disabled={creatingZoomId === b.id}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--color-border)] text-[10px] font-medium text-[var(--color-text-muted)] hover:border-[var(--color-gold)]/60 hover:text-[var(--color-gold)] transition-colors disabled:opacity-50"
                            >
                              {creatingZoomId === b.id
                                ? <><Loader2 size={10} className="animate-spin" /> Creating...</>
                                : <><Video size={10} /> Create Zoom Link</>
                              }
                            </button>
                          ) : (
                            <p className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                              <Video size={10} /> Configure Zoom: Add ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET to .env
                            </p>
                          )}
                          {zoomError[b.id] && (
                            <p className="text-[10px] text-red-500 mt-1">{zoomError[b.id]}</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        {b.status === "PENDING" && (
                          <div className="min-w-[160px]">
                            {actionBookingId === b.id ? (
                              <div className="flex flex-col gap-2">
                                <input
                                  type="url"
                                  placeholder="Meeting link (Zoom/Meet)"
                                  value={meetingLinkInputs[b.id] || ""}
                                  onChange={(e) => setMeetingLinkInputs((p) => ({ ...p, [b.id]: e.target.value }))}
                                  className="text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)]"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateBookingStatus(b.id, "CONFIRMED", meetingLinkInputs[b.id])}
                                    disabled={confirmingId === b.id}
                                    className="flex-1 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                                  >
                                    {confirmingId === b.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setActionBookingId(null)}
                                    className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setActionBookingId(b.id)}
                                  className="flex-1 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                                >
                                  <CheckCircle size={12} /> Confirm
                                </button>
                                <button
                                  onClick={() => updateBookingStatus(b.id, "CANCELLED")}
                                  disabled={confirmingId === b.id}
                                  className="flex-1 py-1.5 rounded-lg bg-red-100 text-red-600 text-xs font-semibold hover:bg-red-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                                >
                                  <XCircle size={12} /> Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        {b.status === "CONFIRMED" && (
                          <button
                            onClick={() => updateBookingStatus(b.id, "COMPLETED")}
                            disabled={confirmingId === b.id}
                            className="py-2 px-4 rounded-xl bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {confirmingId === b.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                            Mark Completed
                          </button>
                        )}

                        {/* Record & Analyze button */}
                        <button
                          onClick={() => setExpandedRecordId(expandedRecordId === b.id ? null : b.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            expandedRecordId === b.id
                              ? "bg-[var(--color-gold)]/10 border-[var(--color-gold)]/30 text-[var(--color-gold)]"
                              : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)]/30 hover:text-[var(--color-gold)]"
                          }`}
                        >
                          <Mic size={12} />
                          {expandedRecordId === b.id ? "Hide" : "Record & Analyze"}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Record Panel */}
                    {expandedRecordId === b.id && (
                      <MeetingRecordPanel
                        booking={b}
                        onClose={() => setExpandedRecordId(null)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AVAILABILITY TAB */}
        {activeTab === "availability" && (
          <AvailabilityManager />
        )}
      </div>
    </div>
  );
}
