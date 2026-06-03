"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, DEFAULT_LANGUAGE, getLanguage, Currency } from "@/lib/i18n/languages";
import { Translations, getTranslations } from "@/lib/i18n/translations";

// Website always uses English translations
const EN = getTranslations("en");

// Prices always in USD
const USD: Currency = { code: "USD", symbol: "$", name: "US Dollar", rate: 1, position: "before", countryCode: "+1" };

function formatUSD(inrPrice: number): string {
  const usd = Math.round(inrPrice / 83.5);
  return `$${usd.toLocaleString("en-US")}`;
}

interface LanguageContextType {
  language: Language;
  currency: Currency;
  t: Translations;
  setLanguage: (code: string) => void;
  formatPrice: (inrPrice: number) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANGUAGE,
  currency: USD,
  t: EN,
  setLanguage: () => {},
  formatPrice: formatUSD,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const saved = localStorage.getItem("kvl_lang");
    if (saved) setLang(getLanguage(saved));
  }, []);

  const setLanguage = (code: string) => {
    const lang = getLanguage(code);
    setLang(lang);
    localStorage.setItem("kvl_lang", code);
    // RTL only for Arabic
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = "en"; // keep html lang as English for SEO
  };

  return (
    <LanguageContext.Provider value={{
      language,
      currency: USD,
      t: EN,               // website always English
      setLanguage,
      formatPrice: formatUSD, // prices always USD
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
