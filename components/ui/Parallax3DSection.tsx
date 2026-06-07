"use client";

import { useRef, useEffect, useState } from "react";

interface Parallax3DSectionProps {
  children: React.ReactNode;
  depth?: number;      // 0.1–0.5
  className?: string;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Parallax3DSection({
  children,
  depth = 0.2,
  className = "",
}: Parallax3DSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number | null>(null);
  const visibleRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    if (ref.current) observer.observe(ref.current);

    const onScroll = () => {
      if (!visibleRef.current || !ref.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const viewH = window.innerHeight;
        const centerOffset = rect.top + rect.height / 2 - viewH / 2;
        setOffset(centerOffset * depth);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [depth]);

  return (
    <div ref={ref} className={className}>
      <div
        style={{
          transform: `translateY(${offset}px)`,
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}
