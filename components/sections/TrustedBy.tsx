"use client";

import { motion } from "framer-motion";

const logos = [
  { name: "CBRE", color: "#007A33", bg: "#F0FAF4", textColor: "#007A33", weight: "800", size: "text-lg" },
  { name: "Radisson", color: "#1A2B6B", bg: "#EEF0F8", textColor: "#1A2B6B", weight: "700", size: "text-base" },
  { name: "Amul", color: "#EF2020", bg: "#FEF2F2", textColor: "#EF2020", weight: "800", size: "text-xl" },
  { name: "OYO", color: "#EF2020", bg: "#FEF2F2", textColor: "#EF2020", weight: "900", size: "text-xl" },
  { name: "TATA", color: "#003087", bg: "#EEF2FB", textColor: "#003087", weight: "800", size: "text-lg" },
  { name: "Godrej", color: "#1C1C1C", bg: "#F5F5F5", textColor: "#1C1C1C", weight: "700", size: "text-base" },
  { name: "HDFC BANK", color: "#004C8F", bg: "#EEF4FC", textColor: "#004C8F", weight: "800", size: "text-sm" },
  { name: "IDFC FIRST", color: "#E8730A", bg: "#FEF5EE", textColor: "#E8730A", weight: "800", size: "text-sm" },
  { name: "Infosys", color: "#007CC3", bg: "#EEF7FD", textColor: "#007CC3", weight: "700", size: "text-base" },
  { name: "Reliance", color: "#1C3A6E", bg: "#EEF1F8", textColor: "#1C3A6E", weight: "800", size: "text-base" },
];

// Duplicate for seamless marquee
const allLogos = [...logos, ...logos];

export function TrustedBy() {
  return (
    <section className="py-10 bg-[var(--color-bg)] border-y border-[var(--color-border)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-7 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm font-medium text-[var(--color-text-muted)] tracking-widest uppercase"
        >
          Trusted by{" "}
          <strong className="text-[var(--color-text)]">5,000+</strong> businesses across India
        </motion.p>
      </div>

      <div className="marquee-wrap">
        <div className="marquee-track gap-4">
          {allLogos.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="mx-3 flex items-center justify-center shrink-0"
            >
              <div
                className="flex items-center justify-center px-6 py-3 rounded-xl border transition-all hover:scale-105 cursor-default min-w-[110px] dark:bg-white/5 dark:border-white/10"
                style={{
                  background: `var(--logo-bg, ${logo.bg})`,
                  borderColor: `${logo.color}25`,
                }}
              >
                <span
                  className={`font-display ${logo.size} tracking-tight leading-none dark:opacity-90`}
                  style={{
                    color: logo.textColor,
                    fontWeight: logo.weight,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {logo.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
