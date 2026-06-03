"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const projects = [
  {
    name: "Spice Heaven",
    type: "Restaurant Website",
    photo: "/photos/restaurant.jpg",
    accentColor: "#FF6B35",
    stats: [
      { label: "Online Orders", value: "+300%" },
      { label: "Revenue Growth", value: "2X" },
    ],
  },
  {
    name: "GreenValley School",
    type: "School Management System",
    photo: "/photos/school.jpg",
    accentColor: "#16A34A",
    stats: [
      { label: "Workload Reduction", value: "80%" },
      { label: "Parent Satisfaction", value: "95%" },
    ],
  },
  {
    name: "MediLife Hospital",
    type: "Hospital Management System",
    photo: "/photos/hospital.jpg",
    accentColor: "#0891B2",
    stats: [
      { label: "Faster Operations", value: "70%" },
      { label: "Patient Satisfaction", value: "90%" },
    ],
  },
  {
    name: "FashionHub",
    type: "eCommerce Platform",
    photo: "/photos/fashion.jpg",
    accentColor: "#7C3AED",
    stats: [
      { label: "Sales Increase", value: "250%" },
      { label: "Customer Engagement", value: "3X" },
    ],
  },
];

export function Portfolio() {
  const [active, setActive] = useState(0);

  const prev = () => setActive((a) => (a === 0 ? projects.length - 1 : a - 1));
  const next = () => setActive((a) => (a === projects.length - 1 ? 0 : a + 1));

  return (
    <section className="py-20 lg:py-28 bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="section-badge">Our Portfolio</div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[var(--color-text)]">
              Real Projects.{" "}
              <span className="text-gold-gradient">Real Results.</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-3 max-w-lg">
              Helping businesses transform and achieve extraordinary results across India.
            </p>
          </div>
          <Link href="/portfolio" className="btn-outline shrink-0 flex items-center gap-2">
            View All Case Studies <ArrowRight size={16} />
          </Link>
        </div>

        {/* Project cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-4">
          {projects.map((project, i) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group"
            >
              <div className="card overflow-hidden">
                {/* Photo */}
                <div className="h-44 relative overflow-hidden">
                  <Image
                    src={project.photo}
                    alt={project.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <Link
                      href="/portfolio"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 bg-white text-gray-900 text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-[var(--color-gold)] hover:text-white"
                    >
                      View Case Study <ArrowRight size={12} />
                    </Link>
                  </div>
                  {/* Color tag bar */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{ background: project.accentColor }}
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="font-semibold text-[var(--color-text)] mb-0.5">{project.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mb-3">{project.type}</p>

                  <div className="grid grid-cols-2 gap-2">
                    {project.stats.map((stat) => (
                      <div key={stat.label} className="text-center p-2 rounded-lg bg-[var(--color-bg-tertiary)]">
                        <p
                          className="font-display font-bold text-sm"
                          style={{ color: project.accentColor }}
                        >
                          {stat.value}
                        </p>
                        <p className="text-[10px] text-[var(--color-text-secondary)]">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Arrow controls (mobile style) */}
        <div className="flex items-center justify-center gap-3 mb-10 sm:hidden">
          <button onClick={prev} className="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all">
            <ChevronLeft size={18} />
          </button>
          <button onClick={next} className="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Bottom CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-4 rounded-2xl p-8 bg-[var(--color-navy)] text-white flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-gold)]/20 flex items-center justify-center shrink-0">
              <TrendingUp size={24} className="text-[var(--color-gold)]" />
            </div>
            <div>
              <p className="font-display font-bold text-xl">Your business could be next</p>
              <p className="text-white/60 text-sm">Join 5,000+ businesses that trust KVL TECH for their digital growth</p>
            </div>
          </div>
          <Link href="/contact" className="btn-gold shrink-0">
            Start Your Project <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
