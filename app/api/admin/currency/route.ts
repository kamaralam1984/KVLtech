import { NextRequest, NextResponse } from "next/server"
import { getExchangeRates, convertFromINR, formatCurrency, CurrencyCode } from "@/lib/currency"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const amountStr = searchParams.get("amount")
  const from = (searchParams.get("from") || "INR") as CurrencyCode
  const to = (searchParams.get("to") || "USD") as CurrencyCode

  // If specific conversion requested
  if (amountStr) {
    const amount = parseFloat(amountStr)
    if (isNaN(amount))
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })

    // Amount is expected in paise (smallest unit)
    const converted = from === "INR"
      ? convertFromINR(amount, to)
      : amount // TODO: cross-currency support

    return NextResponse.json({
      from,
      to,
      amountInPaise: amount,
      converted,
      formatted: formatCurrency(converted, to),
    })
  }

  // Return all exchange rates
  const rates = await getExchangeRates()
  return NextResponse.json({ rates, base: "INR" })
}
