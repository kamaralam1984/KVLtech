"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Filter, Download, X, Search } from "lucide-react";

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "multiselect" | "daterange" | "text" | "numberrange";
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface FilterPanelProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onReset: () => void;
  onExport?: () => void;
  exportLabel?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

function MultiSelectDropdown({
  config,
  value,
  onChange,
}: {
  config: FilterConfig;
  value: string[];
  onChange: (val: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected: string[] = Array.isArray(value) ? value : [];

  const toggle = (v: string) => {
    if (selected.includes(v)) {
      onChange(selected.filter(s => s !== v));
    } else {
      onChange([...selected, v]);
    }
  };

  const displayLabel =
    selected.length === 0
      ? `All ${config.label}`
      : selected.length === 1
      ? config.options?.find(o => o.value === selected[0])?.label ?? selected[0]
      : `${selected.length} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] transition-all min-w-[140px] justify-between"
      >
        <span className="truncate max-w-[120px]">{displayLabel}</span>
        <ChevronDown size={12} className="shrink-0 text-[var(--color-text-muted)]" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] overflow-hidden min-w-[180px]">
          {config.options?.map(opt => (
            <label
              key={opt.value}
              className="flex items-center gap-2.5 px-3 py-2 hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="w-3.5 h-3.5 accent-[#C9A227] shrink-0"
              />
              <span className="text-xs text-[var(--color-text)]">{opt.label}</span>
            </label>
          ))}
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="w-full text-left px-3 py-2 text-[10px] text-red-500 hover:bg-red-500/5 transition-colors border-t border-[var(--color-border)]"
            >
              Clear selection
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function isActiveFilter(type: FilterConfig["type"], value: any): boolean {
  if (value === undefined || value === null || value === "") return false;
  if (type === "multiselect") return Array.isArray(value) && value.length > 0;
  if (type === "daterange") {
    return (value?.from && value.from !== "") || (value?.to && value.to !== "");
  }
  if (type === "numberrange") {
    return (value?.min !== "" && value?.min !== undefined) || (value?.max !== "" && value?.max !== undefined);
  }
  return String(value) !== "";
}

export function FilterPanel({
  filters,
  values,
  onChange,
  onReset,
  onExport,
  exportLabel = "Export CSV",
  isOpen: controlledOpen,
  onToggle,
}: FilterPanelProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const toggle = onToggle ?? (() => setInternalOpen(o => !o));

  const activeCount = filters.filter(f => isActiveFilter(f.type, values[f.key])).length;

  return (
    <div className="space-y-3">
      {/* Toolbar row */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={toggle}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
        >
          <Filter size={13} />
          {activeCount > 0 ? `Filter (${activeCount})` : "Filter"}
          <ChevronDown
            size={12}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-400/60 text-xs font-semibold text-red-500 hover:bg-red-500/5 transition-all"
          >
            <X size={12} /> Reset Filters
          </button>
        )}

        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all ml-auto"
          >
            <Download size={13} /> {exportLabel}
          </button>
        )}
      </div>

      {/* Filter row */}
      {open && (
        <div className="flex flex-wrap gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          {filters.map(f => {
            const val = values[f.key];

            if (f.type === "select") {
              return (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                    {f.label}
                  </label>
                  <select
                    value={val ?? ""}
                    onChange={e => onChange(f.key, e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all min-w-[150px]"
                  >
                    <option value="">All {f.label}</option>
                    {f.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            if (f.type === "multiselect") {
              return (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                    {f.label}
                  </label>
                  <MultiSelectDropdown
                    config={f}
                    value={Array.isArray(val) ? val : []}
                    onChange={v => onChange(f.key, v)}
                  />
                </div>
              );
            }

            if (f.type === "daterange") {
              const range = val ?? { from: "", to: "" };
              return (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                    {f.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={range.from ?? ""}
                      onChange={e => onChange(f.key, { ...range, from: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all"
                    />
                    <span className="text-[10px] text-[var(--color-text-muted)]">to</span>
                    <input
                      type="date"
                      value={range.to ?? ""}
                      onChange={e => onChange(f.key, { ...range, to: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all"
                    />
                  </div>
                </div>
              );
            }

            if (f.type === "text") {
              return (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                    {f.label}
                  </label>
                  <div className="relative">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                      type="text"
                      value={val ?? ""}
                      onChange={e => onChange(f.key, e.target.value)}
                      placeholder={f.placeholder ?? `Search ${f.label}...`}
                      className="pl-8 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all min-w-[160px]"
                    />
                  </div>
                </div>
              );
            }

            if (f.type === "numberrange") {
              const range = val ?? { min: "", max: "" };
              return (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                    {f.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={range.min ?? ""}
                      onChange={e => onChange(f.key, { ...range, min: e.target.value })}
                      placeholder="Min"
                      className="w-20 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all"
                    />
                    <span className="text-[10px] text-[var(--color-text-muted)]">–</span>
                    <input
                      type="number"
                      value={range.max ?? ""}
                      onChange={e => onChange(f.key, { ...range, max: e.target.value })}
                      placeholder="Max"
                      className="w-20 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all"
                    />
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
}
