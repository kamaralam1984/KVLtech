// Supported currencies
export const CURRENCIES = {
  INR: { symbol: "₹", name: "Indian Rupee", locale: "en-IN", code: "INR" },
  USD: { symbol: "$", name: "US Dollar", locale: "en-US", code: "USD" },
  GBP: { symbol: "£", name: "British Pound", locale: "en-GB", code: "GBP" },
  AED: { symbol: "د.إ", name: "UAE Dirham", locale: "ar-AE", code: "AED" },
  SGD: { symbol: "S$", name: "Singapore Dollar", locale: "en-SG", code: "SGD" },
  EUR: { symbol: "€", name: "Euro", locale: "en-EU", code: "EUR" },
} as const

export type CurrencyCode = keyof typeof CURRENCIES

// Exchange rates (cached, updated daily)
// In production: fetch from https://api.exchangerate-api.com/v4/latest/INR
const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 0.012,   // 1 INR = 0.012 USD
  GBP: 0.0095,  // 1 INR = 0.0095 GBP
  AED: 0.044,   // 1 INR = 0.044 AED
  SGD: 0.016,   // 1 INR = 0.016 SGD
  EUR: 0.011,   // 1 INR = 0.011 EUR
}

export async function getExchangeRates(): Promise<Record<CurrencyCode, number>> {
  // Try to fetch live rates
  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY
    if (apiKey) {
      const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/INR`)
      const data = await res.json() as { conversion_rates: Record<string, number> }
      if (data.conversion_rates) {
        return {
          INR: 1,
          USD: data.conversion_rates.USD || EXCHANGE_RATES.USD,
          GBP: data.conversion_rates.GBP || EXCHANGE_RATES.GBP,
          AED: data.conversion_rates.AED || EXCHANGE_RATES.AED,
          SGD: data.conversion_rates.SGD || EXCHANGE_RATES.SGD,
          EUR: data.conversion_rates.EUR || EXCHANGE_RATES.EUR,
        }
      }
    }
  } catch { }
  return EXCHANGE_RATES
}

// Convert amount from INR to target currency
export function convertFromINR(amountInPaise: number, targetCurrency: CurrencyCode): number {
  const amountInINR = amountInPaise / 100
  return Math.round(amountInINR * EXCHANGE_RATES[targetCurrency] * 100) / 100
}

// Format currency amount for display
export function formatCurrency(amount: number, currency: CurrencyCode = "INR"): string {
  const { symbol, locale } = CURRENCIES[currency]
  if (currency === "INR") {
    // Indian numbering: 1,00,000 format
    return `${symbol}${new Intl.NumberFormat("en-IN").format(amount)}`
  }
  return `${symbol}${new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount)}`
}
