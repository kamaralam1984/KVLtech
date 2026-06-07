"use client";

import { useEffect, useRef } from "react";

interface AnimatedGradientBorderProps {
  children: React.ReactNode;
  speed?: number;        // degrees per frame, default 2
  colors?: string[];
  borderWidth?: number;  // px, default 2
  className?: string;
}

const DEFAULT_COLORS = ["#C9A227", "#E8C547", "#ffffff", "#C9A227"];

export function AnimatedGradientBorder({
  children,
  speed = 2,
  colors = DEFAULT_COLORS,
  borderWidth = 2,
  className = "",
}: AnimatedGradientBorderProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const animate = () => {
      angleRef.current = (angleRef.current + speed) % 360;
      const gradient = `conic-gradient(from ${angleRef.current}deg, ${colors.join(", ")})`;
      el.style.background = gradient;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [speed, colors]);

  return (
    <div
      ref={outerRef}
      className={`relative rounded-xl p-[2px] ${className}`}
      style={{ padding: borderWidth }}
    >
      <div className="relative z-10 rounded-[10px] bg-[var(--color-bg)] overflow-hidden h-full w-full">
        {children}
      </div>
    </div>
  );
}
