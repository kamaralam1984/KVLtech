export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  currency: Currency;
  dir: "ltr" | "rtl";
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // vs USD
  position: "before" | "after";
  countryCode: string; // phone dial code
}

export const LANGUAGES: Language[] = [
  {
    code: "en", name: "English", nativeName: "English", flag: "🇺🇸", dir: "ltr",
    currency: { code: "USD", symbol: "$", name: "US Dollar", rate: 1, position: "before", countryCode: "+1" },
  },
  {
    code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", dir: "rtl",
    currency: { code: "USD", symbol: "$", name: "US Dollar", rate: 1, position: "before", countryCode: "+966" },
  },
  {
    code: "hi", name: "Hinglish", nativeName: "Hinglish", flag: "🇮🇳", dir: "ltr",
    currency: { code: "USD", symbol: "$", name: "US Dollar", rate: 1, position: "before", countryCode: "+91" },
  },
  {
    code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", dir: "ltr",
    currency: { code: "USD", symbol: "$", name: "US Dollar", rate: 1, position: "before", countryCode: "+7" },
  },
  {
    code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", dir: "ltr",
    currency: { code: "USD", symbol: "$", name: "US Dollar", rate: 1, position: "before", countryCode: "+49" },
  },
];

export const DEFAULT_LANGUAGE = LANGUAGES[0]; // English

export function getLanguage(code: string): Language {
  return LANGUAGES.find(l => l.code === code) || DEFAULT_LANGUAGE;
}

// Format price in a given currency
export function formatPrice(usdPrice: number, currency: Currency): string {
  const converted = usdPrice * currency.rate;
  const formatted = converted >= 1000
    ? new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(Math.round(converted))
    : converted.toFixed(converted < 10 ? 2 : 0);

  return currency.position === "before"
    ? `${currency.symbol}${formatted}`
    : `${formatted} ${currency.symbol}`;
}

// Convert INR price to USD base, then to target currency
export function convertFromINR(inrPrice: number, currency: Currency): string {
  const usdPrice = inrPrice / 83.5;
  return formatPrice(usdPrice, currency);
}
