"use client";

import { useMemo } from "react";

interface FloatingOrbsProps {
  count?: number;
  colors?: string[];
}

const DEFAULT_COLORS = [
  "rgba(201,162,39,0.15)",
  "rgba(201,162,39,0.08)",
  "rgba(11,20,55,0.4)",
  "rgba(201,162,39,0.1)",
  "rgba(11,20,55,0.25)",
];

// Seeded pseudo-random so SSR & client produce same values
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function FloatingOrbs({ count = 5, colors = DEFAULT_COLORS }: FloatingOrbsProps) {
  const orbs = useMemo(() => {
    const rand = seededRandom(42);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: 100 + rand() * 300,
      top: rand() * 100,
      left: rand() * 100,
      color: colors[i % colors.length],
      duration: 4 + rand() * 4,
      delay: rand() * 3,
    }));
  }, [count, colors]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full animate-float"
          style={{
            width: orb.size,
            height: orb.size,
            top: `${orb.top}%`,
            left: `${orb.left}%`,
            background: orb.color,
            filter: "blur(60px)",
            willChange: "transform",
            animationDuration: `${orb.duration}s`,
            animationDelay: `${orb.delay}s`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}
