"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Search, Phone, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";

const SEARCH_ITEMS = [
  { label: "Restaurant Website", href: "/products/restaurant-website", category: "Website" },
  { label: "School Management System", href: "/products/school-management-system", category: "Software" },
  { label: "Hospital Management System", href: "/products/hospital-management-system", category: "Software" },
  { label: "E-commerce Platform", href: "/products/e-commerce-platform", category: "Website" },
  { label: "Hotel Booking Website", href: "/products/hotel-booking-website", category: "Website" },
  { label: "Real Estate Website", href: "/products/real-estate-website", category: "Website" },
  { label: "Business Automation", href: "/solutions/automation", category: "Solution" },
  { label: "Marketing Solutions", href: "/solutions/marketing", category: "Solution" },
  { label: "AI Solutions", href: "/solutions/ai", category: "Solution" },
  { label: "CRM Solutions", href: "/solutions/crm", category: "Solution" },
  { label: "ERP Systems", href: "/solutions/erp", category: "Solution" },
  { label: "Mobile Applications", href: "/products/mobile", category: "Product" },
  { label: "SaaS Products", href: "/products/saas", category: "Product" },
  { label: "Pricing", href: "/pricing", category: "Page" },
  { label: "Contact Us", href: "/contact", category: "Page" },
  { label: "About KVL TECH", href: "/about", category: "Page" },
  { label: "Portfolio", href: "/portfolio", category: "Page" },
  { label: "Blog", href: "/blog", category: "Page" },
  { label: "Help Center", href: "/help", category: "Resource" },
  { label: "Documentation", href: "/docs", category: "Resource" },
];

export function Navbar() {
  const { t, currency, language } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filteredResults = searchQuery.trim().length > 0
    ? SEARCH_ITEMS.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : SEARCH_ITEMS.slice(0, 6);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearchSelect = (href: string) => {
    closeSearch();
    router.push(href);
  };

  const navItems = [
    {
      label: t.nav_products,
      href: "/products",
      children: [
        { label: "Website Templates", href: "/products?category=websites" },
        { label: "Software Solutions", href: "/products?category=software" },
        { label: "SaaS Products", href: "/products?category=saas" },
        { label: "Mobile Apps", href: "/products?category=mobile" },
      ],
    },
    {
      label: t.nav_solutions,
      href: "/solutions",
      children: [
        { label: "Business Automation", href: "/solutions/automation" },
        { label: "Marketing Solutions", href: "/solutions/marketing" },
        { label: "AI Solutions", href: "/solutions/ai" },
        { label: "CRM Systems", href: "/solutions/crm" },
      ],
    },
    { label: t.nav_portfolio, href: "/portfolio" },
    { label: t.nav_pricing, href: "/pricing" },
    { label: t.nav_blog, href: "/blog" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
    <div className="fixed left-0 right-0 z-50" style={{ top: 'var(--banner-h, 40px)', transition: 'top 0.35s ease' }}>
    <header className={`transition-all duration-300 ${
        scrolled
          ? "bg-[var(--color-bg)]/90 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-[var(--color-border)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 mx-4">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors rounded-lg hover:bg-[var(--color-bg-secondary)]"
                >
                  {item.label}
                  {item.children && <ChevronDown size={14} />}
                </Link>

                <AnimatePresence>
                  {item.children && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-52 bg-[var(--color-bg)] rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-[var(--color-border)] p-1.5 z-50"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-all"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="hidden lg:flex items-center gap-2">
            <LanguageSelector />
            <button
              onClick={openSearch}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-secondary)] border border-[var(--color-border)] transition-all"
            >
              <Search size={16} className="text-[var(--color-text-secondary)]" />
            </button>
            <ThemeToggle />
            <Link
              href="/contact"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              <Phone size={14} />
              {currency.countryCode} 9942000413
            </Link>
            <Link href="/contact" className="btn-gold text-sm py-2 px-5 !text-black !font-bold">
              {t.nav_book_demo}
            </Link>
            <div className="flex items-center rounded-xl border border-[var(--color-border)] overflow-hidden text-sm font-medium">
              <Link
                href="/login"
                className="px-4 py-2 text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-all"
              >
                Sign In
              </Link>
              <span className="w-px h-5 bg-[var(--color-border)]" />
              <Link
                href="/signup"
                className="px-4 py-2 bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/80 transition-all"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-2 ml-auto">
            <LanguageSelector />
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--color-border)]"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[var(--color-bg)] border-t border-[var(--color-border)] overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-xl hover:bg-[var(--color-bg-secondary)] transition-all"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-3 pb-1 flex flex-col gap-2">
                <Link href="/contact" className="btn-gold text-sm text-center !text-black !font-bold" onClick={() => setMobileOpen(false)}>
                  {t.nav_book_demo}
                </Link>
                <Link href="/login" className="btn-outline text-sm text-center" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link href="/signup" className="text-sm text-center px-4 py-2.5 rounded-xl bg-[var(--color-navy)] text-white font-medium" onClick={() => setMobileOpen(false)}>
                  Sign Up Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    </div>

    {/* ── Search Modal ── */}
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-24 px-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={closeSearch}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-xl bg-[var(--color-bg)] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.3)] overflow-hidden border border-[var(--color-border)]"
            onClick={e => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border)]">
              <Search size={18} className="text-[var(--color-text-muted)] shrink-0" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Escape") closeSearch();
                  if (e.key === "Enter" && filteredResults.length > 0) handleSearchSelect(filteredResults[0].href);
                }}
                placeholder="Search products, solutions, pages..."
                className="flex-1 text-sm bg-transparent outline-none text-[var(--color-text)] placeholder-[var(--color-text-muted)]"
              />
              <button onClick={closeSearch} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors">
                <X size={16} className="text-[var(--color-text-muted)]" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredResults.length === 0 ? (
                <p className="text-center text-sm text-[var(--color-text-muted)] py-8">No results found</p>
              ) : (
                <>
                  {searchQuery.trim() === "" && (
                    <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-3 py-2">Popular</p>
                  )}
                  {filteredResults.map(item => (
                    <button
                      key={item.href}
                      onClick={() => handleSearchSelect(item.href)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                          <Search size={13} className="text-[var(--color-gold)]" />
                        </div>
                        <span className="text-sm text-[var(--color-text)]">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                          {item.category}
                        </span>
                        <ArrowRight size={13} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
              <p className="text-[10px] text-[var(--color-text-muted)]">Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-border)] text-[10px]">Esc</kbd> to close</p>
              <p className="text-[10px] text-[var(--color-text-muted)]"><kbd className="px-1.5 py-0.5 rounded bg-[var(--color-border)] text-[10px]">↵ Enter</kbd> to navigate</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
