"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Amit Agarwal",
    role: "CEO, Bharat Retail",
    initial: "A",
    color: "#0F172A",
    rating: 5,
    text: "KVL TECH transformed our online presence completely. Their team is professional, responsive and amazing to work with. Our online sales increased by 300% within 3 months.",
  },
  {
    name: "Neha Sharma",
    role: "Principal, GreenValley School",
    initial: "N",
    color: "#16A34A",
    rating: 5,
    text: "The school management system has made our operations so smooth. Administrative work reduced by 80%. Highly recommended for any educational institution!",
  },
  {
    name: "Dr. Rajesh Verma",
    role: "Director, MediLife Hospital",
    initial: "R",
    color: "#0891B2",
    rating: 5,
    text: "Our hospital operations are now 70% faster. KVL TECH delivered beyond our expectations. Patient satisfaction scores have never been higher.",
  },
  {
    name: "Pooja Malhotra",
    role: "Founder, FashionHub",
    initial: "P",
    color: "#7C3AED",
    rating: 4,
    text: "Excellent team, great support and outstanding results. Our sales increased like never before. The e-commerce platform is exactly what we needed.",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-[var(--color-bg-secondary)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="section-badge mx-auto">Client Success Stories</div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[var(--color-text)] mb-4">
            Trusted by Businesses,{" "}
            <span className="text-gold-gradient">Loved by Clients</span>
          </h2>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto">
            Hear what our amazing clients say about working with KVL TECH.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="card p-6 h-full flex flex-col">
                {/* Quote icon */}
                <Quote size={28} className="text-[var(--color-gold)]/30 mb-3" />

                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      fill={j < t.rating ? "#C9A227" : "none"}
                      className={j < t.rating ? "text-[var(--color-gold)]" : "text-[var(--color-border)]"}
                    />
                  ))}
                </div>

                {/* Text */}
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed flex-1 mb-5">
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border)]">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                    style={{ background: t.color }}
                  >
                    {t.initial}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[var(--color-text)]">{t.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Aggregate rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]"
        >
          <div className="text-center">
            <p className="font-display font-bold text-5xl text-[var(--color-text)]">4.9</p>
            <div className="flex gap-1 justify-center my-2">
              {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="#C9A227" className="text-[var(--color-gold)]" />)}
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">Average Rating</p>
          </div>
          <div className="w-px h-16 bg-[var(--color-border)] hidden sm:block" />
          <div className="text-center">
            <p className="font-display font-bold text-4xl text-[var(--color-text)]">5,000+</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Happy Clients</p>
          </div>
          <div className="w-px h-16 bg-[var(--color-border)] hidden sm:block" />
          <div className="text-center">
            <p className="font-display font-bold text-4xl text-[var(--color-text)]">98%</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Would Recommend</p>
          </div>
          <div className="w-px h-16 bg-[var(--color-border)] hidden sm:block" />
          <div className="text-center">
            <p className="font-display font-bold text-4xl text-[var(--color-text)]">12,500+</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Projects Delivered</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
