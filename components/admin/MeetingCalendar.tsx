"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, Calendar, Clock,
  User, Mail, Phone, X, Loader2, Plus,
} from "lucide-react";

type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

interface Booking {
  id:          string;
  clientName:  string;
  clientEmail: string;
  clientPhone?: string;
  date:        string;
  duration:    number;
  title:       string;
  notes?:      string;
  meetingLink?: string;
  status:      BookingStatus;
}

const STATUS_COLOR: Record<BookingStatus, string> = {
  PENDING:   "#F59E0B",
  CONFIRMED: "#22C55E",
  COMPLETED: "#6B7280",
  CANCELLED: "#EF4444",
  NO_SHOW:   "#9CA3AF",
};

const STATUS_BG: Record<BookingStatus, string> = {
  PENDING:   "bg-amber-100  text-amber-700",
  CONFIRMED: "bg-green-100  text-green-700",
  COMPLETED: "bg-gray-100   text-gray-600",
  CANCELLED: "bg-red-100    text-red-600",
  NO_SHOW:   "bg-gray-100   text-gray-500",
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_ABBR = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function padStart2(n: number) { return String(n).padStart(2, "0"); }

function formatISO(d: Date) {
  return `${d.getFullYear()}-${padStart2(d.getMonth() + 1)}-${padStart2(d.getDate())}`;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
}

function getHourMinuteIST(dateStr: string): { h: number; m: number } {
  const d   = new Date(dateStr);
  const str = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
  const [hh, mm] = str.split(":").map(Number);
  return { h: hh, m: mm };
}

// Timeline hours 8–20
const TIMELINE_START = 8;
const TIMELINE_END   = 20;
const HOUR_HEIGHT_PX = 60;

interface CreateMeetingForm {
  clientName:  string;
  clientEmail: string;
  clientPhone: string;
  title:       string;
  startHour:   number;
  startMinute: number;
  duration:    number;
}

export function MeetingCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate]   = useState<Date | null>(today);
  const [bookings,     setBookings]        = useState<Booking[]>([]);
  const [dayBookings,  setDayBookings]     = useState<Booking[]>([]);
  const [loading,      setLoading]         = useState(true);
  const [dayLoading,   setDayLoading]      = useState(false);
  const [showCreate,   setShowCreate]      = useState(false);
  const [creating,     setCreating]        = useState(false);
  const [createError,  setCreateError]     = useState<string | null>(null);
  const [createForm,   setCreateForm]      = useState<CreateMeetingForm>({
    clientName: "", clientEmail: "", clientPhone: "", title: "Free Consultation Call",
    startHour: 10, startMinute: 0, duration: 30,
  });

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Build day grid
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calDays: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(new Date(year, month, d));

  // Load bookings for month
  const loadMonth = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/meetings/bookings", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.bookings) setBookings(d.bookings); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadMonth(); }, [loadMonth]);

  // Load bookings for selected date
  useEffect(() => {
    if (!selectedDate) return;
    setDayLoading(true);
    const dateStr = formatISO(selectedDate);
    fetch(`/api/admin/meetings/bookings?date=${dateStr}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.bookings) setDayBookings(d.bookings); })
      .catch(console.error)
      .finally(() => setDayLoading(false));
  }, [selectedDate]);

  // Bookings per date for dot display
  const bookingsByDate: Record<string, Booking[]> = {};
  for (const b of bookings) {
    const key = formatISO(new Date(b.date));
    if (!bookingsByDate[key]) bookingsByDate[key] = [];
    bookingsByDate[key].push(b);
  }

  // Next meeting info
  const upcomingBookings = bookings
    .filter((b) => (b.status === "PENDING" || b.status === "CONFIRMED") && new Date(b.date) > today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextMeeting = upcomingBookings[0];
  let nextLabel = "—";
  if (nextMeeting) {
    const diff  = new Date(nextMeeting.date).getTime() - today.getTime();
    const hours = Math.floor(diff / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    if (hours < 24) nextLabel = `in ${hours}h ${mins}m`;
    else nextLabel = `in ${Math.floor(hours / 24)} day${Math.floor(hours / 24) !== 1 ? "s" : ""}`;
  }

  // Today's meetings
  const todayStr     = formatISO(today);
  const todayCount   = (bookingsByDate[todayStr] || []).filter((b) => b.status !== "CANCELLED").length;

  async function handleCreate() {
    if (!selectedDate || !createForm.clientName || !createForm.clientEmail) return;
    setCreating(true);
    setCreateError(null);

    const dateStr  = formatISO(selectedDate);
    const timeStr  = `${padStart2(createForm.startHour)}:${padStart2(createForm.startMinute)}`;

    try {
      const res = await fetch("/api/meetings/book", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        createForm.clientName,
          email:       createForm.clientEmail,
          phone:       createForm.clientPhone,
          date:        dateStr,
          startTime:   timeStr,
          duration:    createForm.duration,
          meetingType: createForm.title,
          timezone:    "Asia/Kolkata",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to create meeting");
      } else {
        setShowCreate(false);
        setCreateForm({ clientName: "", clientEmail: "", clientPhone: "", title: "Free Consultation Call", startHour: 10, startMinute: 0, duration: 30 });
        // Reload
        loadMonth();
        if (selectedDate) {
          const dStr = formatISO(selectedDate);
          fetch(`/api/admin/meetings/bookings?date=${dStr}`, { credentials: "include" })
            .then((r) => r.json())
            .then((d) => { if (d.bookings) setDayBookings(d.bookings); })
            .catch(console.error);
        }
      }
    } catch {
      setCreateError("Network error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* ── Left: Month calendar ── */}
      <div className="lg:col-span-3 space-y-4">
        {/* Stats bar */}
        <div className="flex gap-4 p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm">
          <span className="text-[var(--color-text-muted)]">
            <span className="font-bold text-[var(--color-text)]">{todayCount}</span> meeting{todayCount !== 1 ? "s" : ""} today
          </span>
          {nextMeeting && (
            <span className="text-[var(--color-text-muted)]">
              • next {nextLabel}
            </span>
          )}
          <span className="ml-auto text-xs text-[var(--color-text-muted)]">Asia/Kolkata (IST)</span>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <h3 className="font-bold text-[var(--color-text)]">
            {MONTH_NAMES[month]} {year}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => { setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(today); }}
              className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-gold)] transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_ABBR.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[var(--color-gold)]" size={24} />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {calDays.map((d, i) => {
              if (!d) return <div key={i} />;
              const key       = formatISO(d);
              const dayBooks  = bookingsByDate[key] || [];
              const isToday   = key === formatISO(today);
              const isSelected = selectedDate && formatISO(selectedDate) === key;
              const isPast    = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(d)}
                  className={`relative aspect-square flex flex-col items-center justify-start p-1.5 rounded-xl border transition-all text-sm ${
                    isSelected
                      ? "bg-[var(--color-navy)] border-[var(--color-navy)] text-white"
                      : isToday
                      ? "bg-[var(--color-gold)]/10 border-[var(--color-gold)]/50 text-[var(--color-text)]"
                      : isPast
                      ? "border-transparent text-[var(--color-text-muted)] opacity-50"
                      : "border-transparent text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] hover:border-[var(--color-border)]"
                  }`}
                >
                  <span className="font-semibold text-xs">{d.getDate()}</span>
                  {dayBooks.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {dayBooks.slice(0, 3).map((b) => (
                        <span
                          key={b.id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: STATUS_COLOR[b.status] }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-2">
          {(Object.entries(STATUS_COLOR) as [BookingStatus, string][]).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ")}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Day view ── */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-[var(--color-text)]">
            {selectedDate
              ? selectedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })
              : "Select a date"}
          </h4>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-gold)] text-white text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> New
          </button>
        </div>

        {/* Timeline */}
        {dayLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[var(--color-gold)]" size={20} />
          </div>
        ) : (
          <div className="relative border border-[var(--color-border)] rounded-2xl overflow-hidden bg-[var(--color-bg)]" style={{ height: `${(TIMELINE_END - TIMELINE_START) * HOUR_HEIGHT_PX}px` }}>
            {/* Hour lines */}
            {Array.from({ length: TIMELINE_END - TIMELINE_START }, (_, i) => {
              const h = TIMELINE_START + i;
              return (
                <div
                  key={h}
                  className="absolute left-0 right-0 border-t border-[var(--color-border)] flex"
                  style={{ top: `${i * HOUR_HEIGHT_PX}px` }}
                >
                  <span className="text-[10px] text-[var(--color-text-muted)] px-2 pt-0.5 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] w-12 shrink-0">
                    {h % 12 || 12}{h < 12 ? "am" : "pm"}
                  </span>
                </div>
              );
            })}

            {/* Booking blocks */}
            {dayBookings.map((b) => {
              const { h, m }  = getHourMinuteIST(b.date);
              const topFrac   = (h + m / 60) - TIMELINE_START;
              const heightFrac = b.duration / 60;

              if (topFrac < 0 || topFrac >= TIMELINE_END - TIMELINE_START) return null;

              return (
                <div
                  key={b.id}
                  className="absolute left-12 right-2 rounded-lg px-2 py-1 overflow-hidden text-xs"
                  style={{
                    top:             `${topFrac * HOUR_HEIGHT_PX + 1}px`,
                    height:          `${Math.max(heightFrac * HOUR_HEIGHT_PX - 2, 20)}px`,
                    backgroundColor: `${STATUS_COLOR[b.status]}22`,
                    borderLeft:      `3px solid ${STATUS_COLOR[b.status]}`,
                  }}
                >
                  <p className="font-semibold truncate" style={{ color: STATUS_COLOR[b.status] }}>
                    {formatTime(b.date)} — {b.clientName}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)] truncate">{b.title}</p>
                </div>
              );
            })}

            {selectedDate && dayBookings.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <Calendar size={24} className="text-[var(--color-text-muted)] opacity-30 mb-2" />
                <p className="text-xs text-[var(--color-text-muted)]">No meetings</p>
              </div>
            )}
          </div>
        )}

        {/* Booking list for day */}
        {dayBookings.length > 0 && (
          <div className="space-y-2">
            {dayBookings.map((b) => (
              <div key={b.id} className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[var(--color-text)] truncate">{b.clientName}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{b.title} · {formatTime(b.date)} · {b.duration}min</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_BG[b.status]}`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Create Meeting Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--color-bg)] rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
              <h3 className="font-bold text-[var(--color-text)]">Create Meeting</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-[var(--color-bg-secondary)]">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {createError && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">{createError}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1 block">Client Name *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                      type="text"
                      value={createForm.clientName}
                      onChange={(e) => setCreateForm((f) => ({ ...f, clientName: e.target.value }))}
                      placeholder="Full name"
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1 block">Email *</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                      type="email"
                      value={createForm.clientEmail}
                      onChange={(e) => setCreateForm((f) => ({ ...f, clientEmail: e.target.value }))}
                      placeholder="client@example.com"
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1 block">Phone</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                      type="tel"
                      value={createForm.clientPhone}
                      onChange={(e) => setCreateForm((f) => ({ ...f, clientPhone: e.target.value }))}
                      placeholder="+91 …"
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1 block">Duration</label>
                  <select
                    value={createForm.duration}
                    onChange={(e) => setCreateForm((f) => ({ ...f, duration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
                  >
                    {[15, 30, 45, 60, 90].map((d) => (
                      <option key={d} value={d}>{d} min</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1 block">Start Time</label>
                  <div className="flex gap-2">
                    <select
                      value={createForm.startHour}
                      onChange={(e) => setCreateForm((f) => ({ ...f, startHour: parseInt(e.target.value) }))}
                      className="flex-1 px-2 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
                    >
                      {Array.from({ length: 15 }, (_, i) => i + 7).map((h) => (
                        <option key={h} value={h}>{String(h).padStart(2, "0")}</option>
                      ))}
                    </select>
                    <select
                      value={createForm.startMinute}
                      onChange={(e) => setCreateForm((f) => ({ ...f, startMinute: parseInt(e.target.value) }))}
                      className="w-16 px-2 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
                    >
                      {[0, 15, 30, 45].map((m) => (
                        <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1 block">Meeting Type</label>
                  <select
                    value={createForm.title}
                    onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
                  >
                    <option>Free Consultation Call</option>
                    <option>Project Discussion</option>
                    <option>Technical Review</option>
                    <option>Demo Call</option>
                    <option>Follow-up</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !createForm.clientName || !createForm.clientEmail}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--color-navy)] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : "Create Meeting"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
