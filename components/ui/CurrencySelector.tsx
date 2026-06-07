"use client"
import { useState, useEffect } from "react"
import { CURRENCIES, CurrencyCode, convertFromINR, formatCurrency } from "@/lib/currency"

// Hook for currency preference (stored in localStorage)
export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyCode>("INR")

  useEffect(() => {
    const saved = localStorage.getItem("kvl_currency") as CurrencyCode
    if (saved && CURRENCIES[saved]) setCurrencyState(saved)
  }, [])

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c)
    localStorage.setItem("kvl_currency", c)
  }

  const format = (amountInPaise: number) =>
    formatCurrency(convertFromINR(amountInPaise, currency), currency)

  return { currency, setCurrency, format }
}

// Currency selector dropdown
export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
      className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--color-text)] cursor-pointer outline-none focus:border-[#C9A227] transition-colors"
    >
      {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
        <option key={code} value={code}>
          {symbol} {code} — {name}
        </option>
      ))}
    </select>
  )
}

// Price display component with automatic conversion
export function Price({
  amountInPaise,
  className = "",
}: {
  amountInPaise: number
  className?: string
}) {
  const { format } = useCurrency()
  return <span className={className}>{format(amountInPaise)}</span>
}
