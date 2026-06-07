"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Clock, Calendar, User, Mail,
  Phone, MessageSquare, CheckCircle, Loader2, Globe,
} from "lucide-react";
import { getGoogleCalendarLink, getOutlookCalendarLink } from "@/lib/calendar-links";

// ─── Types ───────────────────────────────────────────────────────────────────
interface SlotData {
  start:      string;
  end:        string;
  available:  boolean;
  localStart: string;
  localEnd:   string;
}

type Step = 1 | 2 | 3 | 4 | 5;

// ─── Constants ────────────────────────────────────────────────────────────────
const DURATION_OPTIONS = [
  { label: "15 min", value: 15, desc: "Quick call" },
  { label: "30 min", value: 30, desc: "Standard consultation" },
  { label: "60 min", value: 60, desc: "Deep dive session" },
];

const TIMEZONES = [
  { label: "India (IST)",       value: "Asia/Kolkata"        },
  { label: "New York (EST)",    value: "America/New_York"    },
  { label: "London (GMT)",      value: "Europe/London"       },
  { label: "Dubai (GST)",       value: "Asia/Dubai"          },
  { label: "Singapore (SGT)",   value: "Asia/Singapore"      },
  { label: "Los Angeles (PST)", value: "America/Los_Angeles" },
  { label: "Sydney (AEST)",     value: "Australia/Sydney"    },
];

const MONTH_NAMES = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
];
const MONTH_FULL  = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_ABBR = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function padStart2(n: number) { return String(n).padStart(2, "0"); }

function formatISO(d: Date) {
  return `${d.getFullYear()}-${padStart2(d.getMonth() + 1)}-${padStart2(d.getDate())}`;
}

// ─── Slide animation variants ─────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({
    x:       dir > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({
    x:       dir > 0 ? -80 : 80,
    opacity: 0,
  }),
};
const transition = { type: "spring" as const, stiffness: 300, damping: 30 };

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SlotSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="h-10 rounded-xl bg-[var(--color-bg-secondary)] animate-pulse" />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function PublicBookingWidget() {
  const today  = new Date();
  const [step,          setStep]          = useState<Step>(1);
  const [direction,     setDirection]     = useState(1);
  const [duration,      setDuration]      = useState(30);
  const [timezone,      setTimezone]      = useState("Asia/Kolkata");
  const [currentMonth,  setCurrentMonth]  = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate,  setSelectedDate]  = useState<Date | null>(null);
  const [slots,         setSlots]         = useState<SlotData[]>([]);
  const [loadingSlots,  setLoadingSlots]  = useState(false);
  const [selectedSlot,  setSelectedSlot]  = useState<SlotData | null>(null);
  const [nextAvailable, setNextAvailable] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", notes: "",
  });
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [confirmation,  setConfirmation]  = useState<{
    bookingId:   string;
    confirmationToken: string;
    zoomLink?:   string;
  } | null>(null);

  // Detect user's timezone
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (TIMEZONES.some((t) => t.value === tz)) setTimezone(tz);
    } catch {/* ignore */}
  }, []);

  // Calendar math
  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calDays: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(new Date(year, month, d));

  function isPast(d: Date) {
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < todayMidnight;
  }

  // Fetch slots when date or duration changes
  const fetchSlots = useCallback(async (date: Date, dur: number, tz: string) => {
    setLoadingSlots(true);
    setSlots([]);
    setNextAvailable(null);
    setSelectedSlot(null);
    try {
      const dateStr = formatISO(date);
      const res = await fetch(
        `/api/admin/meetings/slots?date=${dateStr}&duration=${dur}&timezone=${encodeURIComponent(tz)}`
      );
      const data = await res.json();
      if (data.slots) setSlots(data.slots);
      if (data.nextAvailable) setNextAvailable(data.nextAvailable);
    } catch {
      setError("Failed to load available slots");
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  function handleDateSelect(d: Date) {
    if (isPast(d)) return;
    setSelectedDate(d);
    setSelectedSlot(null);
    fetchSlots(d, duration, timezone);
    goTo(3);
  }

  function goTo(s: Step) {
    setDirection(s > step ? 1 : -1);
    setStep(s);
  }

  function handleDurationSelect(d: number) {
    setDuration(d);
    if (selectedDate) fetchSlots(selectedDate, d, timezone);
    goTo(2);
  }

  function handleSlotSelect(slot: SlotData) {
    setSelectedSlot(slot);
    goTo(4);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !form.name || !form.email) return;
    setSubmitting(true);
    setError(null);

    const [startH, startM] = selectedSlot.localStart.split(":").map(Number);
    const startTime        = `${padStart2(startH)}:${padStart2(startM)}`;

    try {
      const res = await fetch("/api/meetings/book", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        form.name,
          email:       form.email,
          phone:       form.phone,
          date:        formatISO(selectedDate),
          startTime,
          duration,
          timezone,
          meetingType: "Free Consultation Call",
          notes:       form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Booking failed. Please try another slot.");
      } else {
        setConfirmation({
          bookingId:         data.bookingId,
          confirmationToken: data.confirmationToken,
          zoomLink:          data.zoomLink,
        });
        goTo(5);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const availableCount = slots.filter((s) => s.available).length;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 justify-center">
        {([1, 2, 3, 4, 5] as Step[]).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? "bg-[var(--color-gold)] text-white scale-110"
                  : step > s
                  ? "bg-green-500 text-white"
                  : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]"
              }`}
            >
              {step > s ? <CheckCircle size={14} /> : s}
            </div>
            {s < 5 && <div className={`w-8 h-0.5 rounded-full transition-all ${step > s ? "bg-green-400" : "bg-[var(--color-border)]"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
          >
            {/* ── Step 1: Duration ── */}
            {step === 1 && (
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-text)]">Book a Free Consultation</h2>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">Choose how long you'd like to meet</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleDurationSelect(opt.value)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all hover:border-[var(--color-gold)] hover:shadow-sm ${
                        duration === opt.value
                          ? "border-[var(--color-gold)] bg-[var(--color-gold)]/5"
                          : "border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
                      }`}
                    >
                      <Clock size={20} className="text-[var(--color-gold)] mb-2" />
                      <p className="font-bold text-[var(--color-text)]">{opt.label}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 2: Calendar ── */}
            {step === 2 && (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => goTo(1)} className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]">
                    <ChevronLeft size={16} />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--color-text)]">Select a Date</h2>
                    <p className="text-xs text-[var(--color-text-muted)]">{duration}-minute session</p>
                  </div>
                </div>

                {/* Month nav */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                    className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="font-semibold text-[var(--color-text)]">{MONTH_FULL[month]} {year}</span>
                  <button
                    onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                    className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1">
                  {DAY_ABBR.map((d) => (
                    <div key={d} className="text-center text-[10px] font-semibold text-[var(--color-text-muted)] uppercase py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {calDays.map((d, i) => {
                    if (!d) return <div key={i} />;
                    const past     = isPast(d);
                    const isToday  = formatISO(d) === formatISO(today);
                    const isSel    = selectedDate && formatISO(d) === formatISO(selectedDate);

                    return (
                      <button
                        key={i}
                        disabled={past}
                        onClick={() => handleDateSelect(d)}
                        className={`aspect-square rounded-xl text-sm font-medium transition-all ${
                          isSel
                            ? "bg-[var(--color-navy)] text-white"
                            : isToday
                            ? "bg-[var(--color-gold)]/10 text-[var(--color-text)] ring-1 ring-[var(--color-gold)]"
                            : past
                            ? "text-[var(--color-text-muted)] opacity-30 cursor-not-allowed"
                            : "text-[var(--color-text)] hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)]"
                        }`}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Step 3: Time slots ── */}
            {step === 3 && (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => goTo(2)} className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]">
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-[var(--color-text)]">
                      {selectedDate?.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                    </h2>
                    <p className="text-xs text-[var(--color-text-muted)]">{duration}-minute slots</p>
                  </div>
                </div>

                {/* Timezone selector */}
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-[var(--color-text-muted)] shrink-0" />
                  <select
                    value={timezone}
                    onChange={(e) => {
                      setTimezone(e.target.value);
                      if (selectedDate) fetchSlots(selectedDate, duration, e.target.value);
                    }}
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>

                {loadingSlots ? (
                  <SlotSkeleton />
                ) : availableCount === 0 ? (
                  <div className="text-center py-8">
                    <Calendar size={32} className="mx-auto text-[var(--color-text-muted)] opacity-30 mb-3" />
                    <p className="font-semibold text-[var(--color-text)]">No slots available</p>
                    {nextAvailable && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        Next available: <span className="text-[var(--color-gold)] font-medium">{nextAvailable}</span>
                      </p>
                    )}
                    <button
                      onClick={() => goTo(2)}
                      className="mt-4 text-sm text-[var(--color-gold)] font-medium hover:underline"
                    >
                      Choose another date
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot, i) => (
                      <button
                        key={i}
                        disabled={!slot.available}
                        onClick={() => slot.available && handleSlotSelect(slot)}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                          !slot.available
                            ? "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] opacity-40 cursor-not-allowed line-through"
                            : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/5 hover:text-[var(--color-gold)]"
                        }`}
                      >
                        {slot.localStart}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 4: Details form ── */}
            {step === 4 && (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => goTo(3)} className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]">
                    <ChevronLeft size={16} />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--color-text)]">Your Details</h2>
                    {selectedDate && selectedSlot && (
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {selectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} at {selectedSlot.localStart} · {duration}min
                      </p>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1 block">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Your full name"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1 block">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1 block">Phone</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1 block">What would you like to discuss?</label>
                    <div className="relative">
                      <MessageSquare size={14} className="absolute left-3 top-3 text-[var(--color-text-muted)]" />
                      <textarea
                        rows={3}
                        value={form.notes}
                        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                        placeholder="Brief description of your requirements..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !form.name || !form.email}
                    className="w-full py-3.5 rounded-xl bg-[var(--color-gold)] text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <><Loader2 className="animate-spin" size={16} /> Booking...</>
                    ) : (
                      "Confirm Booking"
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ── Step 5: Confirmation ── */}
            {step === 5 && confirmation && (
              <div className="p-6 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-text)]">Booking Received!</h2>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    We'll confirm your meeting within a few hours.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Booking ID</span>
                    <span className="font-mono font-bold text-[var(--color-text)] text-xs">{confirmation.bookingId.slice(0, 12)}…</span>
                  </div>
                  {selectedDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">Date</span>
                      <span className="font-semibold text-[var(--color-text)]">
                        {selectedDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                      </span>
                    </div>
                  )}
                  {selectedSlot && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">Time</span>
                      <span className="font-semibold text-[var(--color-text)]">
                        {selectedSlot.localStart} ({timezone.split("/").pop()?.replace("_", " ")})
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Duration</span>
                    <span className="font-semibold text-[var(--color-text)]">{duration} minutes</span>
                  </div>
                  {confirmation.zoomLink && (
                    <div className="pt-2 border-t border-[var(--color-border)]">
                      <a
                        href={confirmation.zoomLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-[var(--color-gold)] font-medium hover:underline"
                      >
                        Join Zoom Meeting →
                      </a>
                    </div>
                  )}
                </div>

                {/* Add to calendar */}
                {selectedDate && selectedSlot && (
                  <div className="space-y-2">
                    <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wide">Add to Calendar</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      <a
                        href={getGoogleCalendarLink({
                          title:       "Free Consultation — KVL TECH",
                          startTime:   new Date(selectedSlot.start),
                          endTime:     new Date(selectedSlot.end),
                          description: `Booking ID: ${confirmation.bookingId}`,
                          location:    confirmation.zoomLink || "",
                        })}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-text)] transition-colors"
                      >
                        Google Calendar
                      </a>
                      <a
                        href={getOutlookCalendarLink({
                          title:       "Free Consultation — KVL TECH",
                          startTime:   new Date(selectedSlot.start),
                          endTime:     new Date(selectedSlot.end),
                          description: `Booking ID: ${confirmation.bookingId}`,
                        })}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-text)] transition-colors"
                      >
                        Outlook
                      </a>
                      <a
                        href={`/api/meetings/${confirmation.bookingId}/ical`}
                        download
                        className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-text)] transition-colors"
                      >
                        Apple Calendar (.ics)
                      </a>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setStep(1);
                    setDirection(1);
                    setSelectedDate(null);
                    setSelectedSlot(null);
                    setConfirmation(null);
                    setForm({ name: "", email: "", phone: "", notes: "" });
                  }}
                  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  Book another meeting
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Trust footer */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-[var(--color-text-muted)]">
        <span className="flex items-center gap-1.5"><Clock size={11} /> Free consultation</span>
        <span className="flex items-center gap-1.5"><CheckCircle size={11} /> Confirmation within 2 hours</span>
        <span className="flex items-center gap-1.5"><Calendar size={11} /> Easy reschedule</span>
      </div>
    </div>
  );
}
