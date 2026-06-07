"use client";

import { useState, useEffect } from "react";
import { Clock, Save, Loader2, CheckCircle, ToggleLeft, ToggleRight, Globe, Timer } from "lucide-react";

const DAY_NAMES  = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TIMEZONES = [
  { label: "India (IST +5:30)",             value: "Asia/Kolkata"       },
  { label: "New York (EST/EDT)",             value: "America/New_York"   },
  { label: "London (GMT/BST)",               value: "Europe/London"      },
  { label: "Dubai (GST +4:00)",              value: "Asia/Dubai"         },
  { label: "Singapore (SGT +8:00)",          value: "Asia/Singapore"     },
  { label: "Los Angeles (PST/PDT)",          value: "America/Los_Angeles"},
  { label: "Sydney (AEDT/AEST)",             value: "Australia/Sydney"   },
];

const BUFFER_OPTIONS   = [0, 15, 30];
const DURATION_OPTIONS = [15, 30, 45, 60, 90];

interface DayWindow {
  dayOfWeek: number;
  startTime: string;
  endTime:   string;
  isActive:  boolean;
}

function makeDefaultWindows(): DayWindow[] {
  return Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    startTime: "09:00",
    endTime:   "18:00",
    isActive:  i >= 1 && i <= 5, // Mon-Fri
  }));
}

function fmt12(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm   = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function generatePreviewSlots(start: string, end: string, duration: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let cur        = sh * 60 + sm;
  const endMin   = eh * 60 + em;
  while (cur + duration <= endMin) {
    const h = Math.floor(cur / 60).toString().padStart(2, "0");
    const m = (cur % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
    cur += 30; // 30-min grid
  }
  return slots;
}

export function AvailabilityManager() {
  const [windows,     setWindows]     = useState<DayWindow[]>(makeDefaultWindows());
  const [timezone,    setTimezone]    = useState("Asia/Kolkata");
  const [bufferMins,  setBufferMins]  = useState(15);
  const [duration,    setDuration]    = useState(30);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load existing
  useEffect(() => {
    fetch("/api/admin/meetings/availability", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.availability && Array.isArray(d.availability) && d.availability.length > 0) {
          const merged = makeDefaultWindows().map((def) => {
            const found = d.availability.find((a: DayWindow) => a.dayOfWeek === def.dayOfWeek);
            if (found) return { ...def, ...found };
            return def;
          });
          setWindows(merged);
          // Detect timezone from first active window
          const first = d.availability[0];
          if (first?.timezone) setTimezone(first.timezone);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function updateDay(dayOfWeek: number, patch: Partial<DayWindow>) {
    setWindows((prev) =>
      prev.map((w) => (w.dayOfWeek === dayOfWeek ? { ...w, ...patch } : w))
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const activeWindows = windows
        .filter((w) => w.isActive)
        .map((w) => ({
          dayOfWeek: w.dayOfWeek,
          startTime: w.startTime,
          endTime:   w.endTime,
          timezone,
        }));

      const res = await fetch("/api/admin/meetings/availability", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body:    JSON.stringify({ windows: activeWindows }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to save");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const activeDays  = windows.filter((w) => w.isActive);
  const previewDay  = activeDays[0];
  const previewSlots = previewDay
    ? generatePreviewSlots(previewDay.startTime, previewDay.endTime, duration)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-[var(--color-gold)]" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timezone + Options row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <Globe size={12} /> Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-gold)]"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <Timer size={12} /> Buffer Between Meetings
          </label>
          <div className="flex gap-2">
            {BUFFER_OPTIONS.map((b) => (
              <button
                key={b}
                onClick={() => setBufferMins(b)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${
                  bufferMins === b
                    ? "bg-[var(--color-navy)] text-white border-[var(--color-navy)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-navy)]"
                }`}
              >
                {b === 0 ? "None" : `${b}m`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <Clock size={12} /> Meeting Duration
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  duration === d
                    ? "bg-[var(--color-gold)] text-white border-[var(--color-gold)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)]"
                }`}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly grid */}
      <div className="space-y-2">
        {windows.map((w) => (
          <div
            key={w.dayOfWeek}
            className={`border rounded-2xl p-4 transition-all ${
              w.isActive
                ? "bg-[var(--color-bg)] border-[var(--color-border)]"
                : "bg-[var(--color-bg-secondary)] border-[var(--color-border)] opacity-60"
            }`}
          >
            <div className="flex items-center gap-4 flex-wrap">
              {/* Toggle */}
              <button
                onClick={() => updateDay(w.dayOfWeek, { isActive: !w.isActive })}
                className="shrink-0 flex items-center gap-2"
              >
                {w.isActive
                  ? <ToggleRight size={28} className="text-[var(--color-gold)]" />
                  : <ToggleLeft  size={28} className="text-[var(--color-text-muted)]" />
                }
                <span className="w-24 font-semibold text-sm text-[var(--color-text)]">
                  {DAY_NAMES[w.dayOfWeek]}
                </span>
              </button>

              {w.isActive ? (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-[var(--color-text-muted)]">From</label>
                    <input
                      type="time"
                      value={w.startTime}
                      onChange={(e) => updateDay(w.dayOfWeek, { startTime: e.target.value })}
                      className="text-sm px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-[var(--color-text-muted)]">To</label>
                    <input
                      type="time"
                      value={w.endTime}
                      onChange={(e) => updateDay(w.dayOfWeek, { endTime: e.target.value })}
                      className="text-sm px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {fmt12(w.startTime)} – {fmt12(w.endTime)}
                  </span>
                </>
              ) : (
                <span className="text-xs text-[var(--color-text-muted)] italic">Unavailable</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview toggle */}
      {activeDays.length > 0 && (
        <div>
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="text-sm text-[var(--color-gold)] font-medium hover:underline"
          >
            {showPreview ? "Hide preview" : "Show client slot preview"}
          </button>

          {showPreview && previewDay && (
            <div className="mt-3 p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
                Preview — {DAY_NAMES[previewDay.dayOfWeek]}, {duration}min slots
              </p>
              <div className="flex flex-wrap gap-2">
                {previewSlots.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)]">No slots in this range</p>
                ) : (
                  previewSlots.map((s) => (
                    <div
                      key={s}
                      className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] font-medium"
                    >
                      {fmt12(s)}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
          saved
            ? "bg-green-100 text-green-700"
            : "bg-[var(--color-navy)] text-white hover:opacity-90"
        } disabled:opacity-50`}
      >
        {saving ? (
          <><Loader2 size={16} className="animate-spin" /> Saving...</>
        ) : saved ? (
          <><CheckCircle size={16} /> Saved!</>
        ) : (
          <><Save size={16} /> Save Availability</>
        )}
      </button>
    </div>
  );
}
