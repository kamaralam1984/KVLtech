"use client"

// Base skeleton with shimmer animation
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-md bg-[var(--color-bg-secondary)] relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}

// Stat card skeleton (matches the gold stat cards on dashboard)
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

// Table row skeleton
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-[var(--color-border)]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className={`h-4 ${i === 0 ? "w-32" : "w-20"}`} />
        </td>
      ))}
    </tr>
  )
}

// Table skeleton (header + rows)
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
      <div className="bg-[var(--color-bg-secondary)] px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className={`h-3 ${i === 0 ? "w-24" : "w-16"}`} />
        ))}
      </div>
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Card skeleton (generic)
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 flex flex-col gap-3">
      <Skeleton className="h-5 w-40" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  )
}

// Dashboard skeleton (4 stat cards + 2 charts)
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardSkeleton lines={6} />
        <CardSkeleton lines={6} />
      </div>
    </div>
  )
}

// Profile/avatar skeleton
export function AvatarSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 w-8", md: "h-12 w-12", lg: "h-16 w-16" }
  return <Skeleton className={`${sizes[size]} rounded-full`} />
}

// Chat message skeleton
export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-3 items-start">
      <AvatarSkeleton size="sm" />
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-16 w-3/4 rounded-xl" />
      </div>
    </div>
  )
}

// Kanban column skeleton for CRM
export function KanbanColumnSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-4 w-24" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-[var(--color-border)] p-4 flex flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}
