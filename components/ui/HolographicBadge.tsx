"use client";

import { motion } from "framer-motion";

interface HolographicBadgeProps {
  label: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASS = {
  sm: "text-[10px] px-2.5 py-1",
  md: "text-xs px-3.5 py-1.5",
  lg: "text-sm px-5 py-2",
};

export function HolographicBadge({ label, size = "md" }: HolographicBadgeProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.08, rotate: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={[
        "inline-flex items-center justify-center font-bold rounded-full select-none",
        "text-white uppercase tracking-widest",
        SIZE_CLASS[size],
      ].join(" ")}
      style={{
        background: "linear-gradient(270deg, #C9A227, #E8C547, #ffffff, #C9A227, #b8860b)",
        backgroundSize: "400% 400%",
        animation: "holographicShift 3s ease-in-out infinite",
        boxShadow: "0 0 16px rgba(201,162,39,0.4), 0 0 32px rgba(201,162,39,0.15)",
      }}
    >
      <style>{`
        @keyframes holographicShift {
          0% { background-position: 0% 50%; color: #0B1437; }
          50% { background-position: 100% 50%; color: #ffffff; }
          100% { background-position: 0% 50%; color: #0B1437; }
        }
      `}</style>
      {label}
    </motion.div>
  );
}
