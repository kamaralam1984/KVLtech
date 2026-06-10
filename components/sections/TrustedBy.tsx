"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const logos = [
  { name: "OYO",        src: "/logos/oyo.svg",      bg: "#FEF2F2", border: "#EF202025", w: 80,  h: 36 },
  { name: "TATA",       src: "/logos/tata.svg",     bg: "#EEF2FB", border: "#00308725", w: 90,  h: 36 },
  { name: "Godrej",     src: "/logos/godrej.svg",   bg: "#F5F5F5", border: "#1C1C1C20", w: 110, h: 36 },
  { name: "HDFC Bank",  src: "/logos/hdfc.svg",     bg: "#EEF4FC", border: "#004C8F25", w: 130, h: 44 },
  { name: "IDFC FIRST", src: "/logos/idfc.svg",     bg: "#FEF5EE", border: "#E8730A25", w: 110, h: 44 },
  { name: "Infosys",    src: "/logos/infosys.svg",  bg: "#EEF7FD", border: "#007CC325", w: 110, h: 36 },
  { name: "Reliance",   src: "/logos/reliance.svg", bg: "#EEF1F8", border: "#1C3A6E25", w: 130, h: 36 },
  { name: "Amul",       src: "/logos/amul.svg",     bg: "#FEF2F2", border: "#EF202025", w: 90,  h: 36 },
  { name: "CBRE",       src: "/logos/cbre.svg",     bg: "#F0FAF4", border: "#007A3325", w: 90,  h: 36 },
  { name: "Radisson",   src: "/logos/radisson.svg", bg: "#EEF0F8", border: "#1A2B6B25", w: 140, h: 44 },
];

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
                className="flex items-center justify-center px-5 py-3 rounded-xl border transition-all hover:scale-105 cursor-default dark:bg-white/90"
                style={{
                  background: logo.bg,
                  borderColor: logo.border,
                  minWidth: logo.w + 24,
                  minHeight: logo.h + 16,
                }}
              >
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={logo.w}
                  height={logo.h}
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
