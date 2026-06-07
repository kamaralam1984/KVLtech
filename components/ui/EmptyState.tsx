"use client"

import {
  ShoppingCart, Headphones, UserPlus, Database, LucideIcon,
} from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  actionLink?: {
    label: string
    href: string
  }
  size?: "sm" | "md" | "lg"
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLink,
  size = "md",
}: EmptyStateProps) {
  const sizes = {
    sm: { icon: "h-8 w-8", container: "py-8", title: "text-base", desc: "text-sm" },
    md: { icon: "h-12 w-12", container: "py-16", title: "text-lg", desc: "text-sm" },
    lg: { icon: "h-16 w-16", container: "py-24", title: "text-xl", desc: "text-base" },
  }
  const s = sizes[size]

  return (
    <div className={`flex flex-col items-center justify-center ${s.container} text-center px-4`}>
      <div className="rounded-2xl bg-[var(--color-bg-secondary)] p-4 mb-4">
        <Icon className={`${s.icon} text-[var(--color-text-muted)]`} />
      </div>
      <h3 className={`font-semibold text-[var(--color-text)] ${s.title} mb-1`}>{title}</h3>
      {description && (
        <p className={`text-[var(--color-text-muted)] ${s.desc} max-w-sm`}>{description}</p>
      )}
      {(action || actionLink) && (
        <div className="mt-4">
          {action && (
            <button
              onClick={action.onClick}
              className="px-5 py-2 rounded-xl bg-[var(--color-gold)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {action.label}
            </button>
          )}
          {actionLink && (
            <a
              href={actionLink.href}
              className="px-5 py-2 rounded-xl bg-[var(--color-gold)] text-white text-sm font-semibold hover:opacity-90 transition-opacity inline-block"
            >
              {actionLink.label}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

// Pre-built empty states for common pages

export function NoOrdersEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={ShoppingCart}
      title="No orders yet"
      description="Your orders will appear here once you make a purchase."
      actionLink={onAction ? undefined : { label: "Browse Products", href: "/products" }}
      action={onAction ? { label: "Browse Products", onClick: onAction } : undefined}
    />
  )
}

export function NoTicketsEmpty() {
  return (
    <EmptyState
      icon={Headphones}
      title="No support tickets"
      description="All clear! Create a ticket if you need help."
      actionLink={{ label: "Create Ticket", href: "/support" }}
    />
  )
}

export function NoLeadsEmpty() {
  return (
    <EmptyState
      icon={UserPlus}
      title="No leads yet"
      description="Leads will appear here when clients fill the contact form."
    />
  )
}

export function NoDataEmpty({ message = "No data available" }: { message?: string }) {
  return <EmptyState icon={Database} title={message} size="sm" />
}

export function SearchEmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-4xl mb-3">🔍</div>
      <h3 className="font-semibold text-[var(--color-text)] mb-1">No results for &ldquo;{query}&rdquo;</h3>
      <p className="text-[var(--color-text-muted)] text-sm">Try a different search term</p>
    </div>
  )
}
