"use client";

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { Language, DEFAULT_LANGUAGE, getLanguage, Currency } from "@/lib/i18n/languages";
import { Translations, getTranslations } from "@/lib/i18n/translations";

// Prices always in USD
const USD: Currency = { code: "USD", symbol: "$", name: "US Dollar", rate: 1, position: "before", countryCode: "+1" };

function formatUSD(inrPrice: number): string {
  const usd = Math.round(inrPrice / 83.5);
  return `$${usd.toLocaleString("en-US")}`;
}

const EN = getTranslations("en");

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
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = code === "en" ? "en" : code;
  };

  // t updates whenever language changes
  const t = useMemo(() => getTranslations(language.code), [language.code]);

  return (
    <LanguageContext.Provider value={{
      language,
      currency: USD,
      t,
      setLanguage,
      formatPrice: formatUSD,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
