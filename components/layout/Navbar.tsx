"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, Search, Phone } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  {
    label: "Products",
    href: "/products",
    children: [
      { label: "Website Templates", href: "/products/websites" },
      { label: "Software Solutions", href: "/products/software" },
      { label: "SaaS Products", href: "/products/saas" },
      { label: "Mobile Apps", href: "/products/mobile" },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions",
    children: [
      { label: "Business Automation", href: "/solutions/automation" },
      { label: "Marketing Solutions", href: "/solutions/marketing" },
      { label: "AI Solutions", href: "/solutions/ai" },
      { label: "CRM Systems", href: "/solutions/crm" },
    ],
  },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--color-bg)]/90 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-[var(--color-border)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/kvl-tech-logo-tight.png"
              alt="KVL TECH — Empowering Your Digital Future"
              width={220}
              height={100}
              className="h-10 w-auto object-contain dark:hidden"
              priority
            />
            <Image
              src="/kvl-tech-logo-white.png"
              alt="KVL TECH — Empowering Your Digital Future"
              width={220}
              height={100}
              className="h-10 w-auto object-contain hidden dark:block"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
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
          <div className="hidden lg:flex items-center gap-3">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-secondary)] border border-[var(--color-border)] transition-all">
              <Search size={16} className="text-[var(--color-text-secondary)]" />
            </button>
            <ThemeToggle />
            <Link
              href="/contact"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              <Phone size={14} />
              +91 98765 43210
            </Link>
            <Link href="/contact" className="btn-gold text-sm py-2 px-5">
              Book a Demo
            </Link>
            <Link
              href="/client-portal"
              className="text-sm font-medium px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
            >
              Dashboard
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-2">
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
                <Link href="/contact" className="btn-gold text-sm text-center" onClick={() => setMobileOpen(false)}>
                  Book a Demo
                </Link>
                <Link href="/client-portal" className="btn-outline text-sm text-center" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
