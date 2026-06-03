"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const social = [
  { letter: "in", href: "#", label: "LinkedIn" },
  { letter: "𝕏", href: "#", label: "Twitter" },
  { letter: "ig", href: "#", label: "Instagram" },
  { letter: "yt", href: "#", label: "YouTube" },
  { letter: "gh", href: "#", label: "GitHub" },
];

const payments = ["VISA", "Mastercard", "UPI", "RuPay", "HDFC", "Paytm"];

export function Footer() {
  const { t } = useLanguage();

  const footerLinks = {
    [t.footer_products]: [
      { label: t.footer_website_templates, href: "/products/websites" },
      { label: t.footer_software_solutions, href: "/products/software" },
      { label: t.footer_saas_products, href: "/products/saas" },
      { label: t.footer_mobile_apps, href: "/products/mobile" },
      { label: t.footer_digital_assets, href: "/products/digital" },
    ],
    [t.footer_solutions]: [
      { label: t.footer_business_automation, href: "/solutions/automation" },
      { label: t.footer_marketing_solutions, href: "/solutions/marketing" },
      { label: t.footer_ai_solutions, href: "/solutions/ai" },
      { label: t.footer_crm_solutions, href: "/solutions/crm" },
      { label: t.footer_erp_systems, href: "/solutions/erp" },
    ],
    [t.footer_company]: [
      { label: t.footer_about_us, href: "/about" },
      { label: t.footer_careers, href: "/careers" },
      { label: t.footer_portfolio, href: "/portfolio" },
      { label: t.footer_blog, href: "/blog" },
      { label: t.footer_contact, href: "/contact" },
    ],
    [t.footer_resources]: [
      { label: t.footer_help_center, href: "/help" },
      { label: t.footer_documentation, href: "/docs" },
      { label: t.footer_guides, href: "/guides" },
      { label: t.footer_videos, href: "/videos" },
      { label: t.footer_support, href: "/support" },
    ],
  };

  return (
    <footer className="bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand col */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/kvl-tech-logo-tight.png"
                alt="KVL TECH"
                width={220}
                height={100}
                className="h-10 w-auto object-contain dark:hidden"
              />
              <Image
                src="/kvl-tech-logo-white.png"
                alt="KVL TECH"
                width={220}
                height={100}
                className="h-10 w-auto object-contain hidden dark:block"
              />
            </Link>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5 max-w-xs">
              {t.footer_desc}
            </p>

            {/* Social links */}
            <div className="flex gap-2 mb-6">
              {social.map(({ letter, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all text-[11px] font-bold"
                >
                  {letter}
                </Link>
              ))}
            </div>

            {/* Contact */}
            <div className="space-y-2.5">
              <a href="tel:+919942000413" className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
                <Phone size={13} className="text-[var(--color-gold)]" />
                +91 9942000413
              </a>
              <a href="mailto:kvlbusinesssolution@gmail.com" className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
                <Mail size={13} className="text-[var(--color-gold)]" />
                kvlbusinesssolution@gmail.com
              </a>
              <div className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                <MapPin size={13} className="text-[var(--color-gold)] mt-0.5 shrink-0" />
                KVL BUSINESS SOLUTION, INDIA
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm text-[var(--color-text)] mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            {t.footer_copyright}
          </p>

          {/* Payment badges */}
          <div className="flex items-center gap-2">
            {payments.map((p) => (
              <span
                key={p}
                className="px-2.5 py-1 text-[10px] font-semibold border border-[var(--color-border)] rounded text-[var(--color-text-muted)]"
              >
                {p}
              </span>
            ))}
          </div>

          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
              {t.footer_privacy}
            </Link>
            <Link href="/terms" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
              {t.footer_terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
