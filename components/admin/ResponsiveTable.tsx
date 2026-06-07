"use client";

import React from "react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  /** Hide this column on mobile card view */
  mobileHide?: boolean;
}

export interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  /** Provide a fully custom card renderer for mobile — overrides default card layout */
  mobileCardRenderer?: (row: T) => React.ReactNode;
  /** Extra className applied to desktop table rows */
  rowClassName?: (row: T) => string;
  /** Show when data is empty */
  emptyState?: React.ReactNode;
  loading?: boolean;
}

export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  mobileCardRenderer,
  rowClassName,
  emptyState,
  loading = false,
}: ResponsiveTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-3 md:hidden" aria-busy="true" aria-label="Loading data">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--color-border)] p-4 animate-pulse bg-[var(--color-bg-secondary)]"
            style={{ height: 80 }}
          />
        ))}
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <>
      {/* ── Desktop table (md+) ── */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-bg)]">
            {data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors ${
                  onRowClick
                    ? "cursor-pointer hover:bg-[var(--color-bg-secondary)]"
                    : ""
                } ${rowClassName ? rowClassName(row) : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-[var(--color-text)] whitespace-nowrap">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards (< md) ── */}
      <div className="md:hidden space-y-3" role="list" aria-label="Data list">
        {data.map((row) => (
          <div
            key={keyExtractor(row)}
            role="listitem"
            onClick={() => onRowClick?.(row)}
            className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 flex flex-col gap-2 ${
              onRowClick ? "cursor-pointer active:bg-[var(--color-bg-secondary)]" : ""
            }`}
          >
            {mobileCardRenderer
              ? mobileCardRenderer(row)
              : columns
                  .filter((col) => !col.mobileHide)
                  .map((col) => (
                    <div key={col.key} className="flex justify-between items-center gap-4">
                      <span className="text-xs text-[var(--color-text-muted)] shrink-0">
                        {col.header}
                      </span>
                      <span className="text-sm text-[var(--color-text)] text-right">
                        {col.render(row)}
                      </span>
                    </div>
                  ))}
          </div>
        ))}
      </div>
    </>
  );
}
