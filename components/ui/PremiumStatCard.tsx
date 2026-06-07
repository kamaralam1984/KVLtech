"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

const COLOR_MAP = {
  gold: {
    bg: "rgba(201,162,39,0.12)",
    icon: "rgba(201,162,39,0.2)",
    text: "#C9A227",
    glow: "rgba(201,162,39,0.3)",
  },
  blue: {
    bg: "rgba(8,145,178,0.1)",
    icon: "rgba(8,145,178,0.2)",
    text: "#0891B2",
    glow: "rgba(8,145,178,0.3)",
  },
  green: {
    bg: "rgba(22,163,74,0.1)",
    icon: "rgba(22,163,74,0.2)",
    text: "#16A34A",
    glow: "rgba(22,163,74,0.3)",
  },
  purple: {
    bg: "rgba(124,58,237,0.1)",
    icon: "rgba(124,58,237,0.2)",
    text: "#7C3AED",
    glow: "rgba(124,58,237,0.3)",
  },
};

interface PremiumStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changePositive?: boolean;
  icon: React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>;
  color?: "gold" | "blue" | "green" | "purple";
  animated?: boolean;
  rawValue?: number;   // numeric value for AnimatedCounter, when value is formatted string
}

export function PremiumStatCard({
  title,
  value,
  change,
  changePositive = true,
  icon: Icon,
  color = "gold",
  animated = true,
  rawValue,
}: PremiumStatCardProps) {
  const palette = COLOR_MAP[color];

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
      }}
      whileHover={{
        y: -6,
        boxShadow: `0 24px 48px rgba(0,0,0,0.35), 0 0 0 1px ${palette.glow}`,
      }}
      transition={{ duration: 0.25 }}
      className="relative rounded-2xl overflow-hidden card-lift glass-dark p-5 group"
      style={{ willChange: "transform" }}
    >
      {/* Shimmer sweep on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none z-20" />

      {/* Card gradient background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{ background: palette.bg }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300"
            style={{
              background: palette.icon,
              boxShadow: `0 4px 20px ${palette.glow}`,
            }}
          >
            <Icon size={22} style={{ color: palette.text }} />
          </div>

          {/* Change badge */}
          {change && (
            <span
              className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
              style={{
                color: changePositive ? "#16A34A" : "#EF4444",
                background: changePositive ? "rgba(22,163,74,0.12)" : "rgba(239,68,68,0.12)",
              }}
            >
              {changePositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {change}
            </span>
          )}
        </div>

        {/* Value */}
        <p className="font-display font-bold text-2xl text-[var(--color-text)] mb-1">
          {animated && rawValue !== undefined ? (
            <AnimatedCounter end={rawValue} />
          ) : (
            value
          )}
        </p>

        {/* Title */}
        <p className="text-xs text-[var(--color-text-muted)]">{title}</p>
      </div>
    </motion.div>
  );
}
