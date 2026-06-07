"use client"

export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-[var(--color-border)]" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--color-gold)] animate-spin" />
      </div>
      <p className="text-[var(--color-text-muted)] text-sm">{message}</p>
    </div>
  )
}

export function InlineLoader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-[3px]",
  }
  return (
    <div
      className={`${s[size]} rounded-full border-transparent border-t-[var(--color-gold)] animate-spin inline-block`}
    />
  )
}
