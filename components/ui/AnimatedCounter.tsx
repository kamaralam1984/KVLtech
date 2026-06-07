"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  // Legacy prop name kept for backwards compat (Hero uses `end`)
  end?: number;
  value?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  format?: "number" | "currency" | "percent";
}

export function AnimatedCounter({
  end,
  value,
  duration = 1500,
  suffix = "",
  prefix = "",
  format = "number",
}: Props) {
  const target = value ?? end ?? 0;
  const [current, setCurrent] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    const startTime = Date.now();
    const endTime = startTime + duration;

    const step = () => {
      const now = Date.now();
      const progress = Math.min(1, (now - startTime) / duration);
      // easeOutCubic — starts fast, decelerates to finish
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * target);
      if (now < endTime) requestAnimationFrame(step);
      else setCurrent(target);
    };

    requestAnimationFrame(step);
  }, [hasStarted, target, duration]);

  const rounded = Math.round(current);

  let formatted: string;
  if (format === "currency") {
    if (rounded >= 10000000) {
      formatted = `${(rounded / 10000000).toFixed(1)}Cr`;
    } else if (rounded >= 100000) {
      formatted = `${(rounded / 100000).toFixed(1)}L`;
    } else if (rounded >= 1000) {
      formatted = `${(rounded / 1000).toFixed(0)}K`;
    } else {
      formatted = String(rounded);
    }
  } else if (format === "percent") {
    // Allow decimals for things like 99.99%
    formatted = Number.isInteger(target) ? String(rounded) : current.toFixed(2);
  } else {
    // Default: use localeString for readability, but support decimals
    formatted = Number.isInteger(target)
      ? rounded.toLocaleString()
      : current.toFixed(2);
  }

  return (
    <span ref={ref}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
