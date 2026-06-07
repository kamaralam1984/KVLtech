"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  variant?: "default" | "dark" | "gold" | "subtle";
  tilt?: boolean;
  lift?: boolean;
  glow?: boolean;
  className?: string;
  onClick?: () => void;
}

const VARIANT_CLASS: Record<NonNullable<GlassCardProps["variant"]>, string> = {
  default: "glass",
  dark: "glass-dark",
  gold: "glass-gold",
  subtle: "glass-subtle",
};

export function GlassCard({
  children,
  variant = "default",
  tilt = false,
  lift = false,
  glow = false,
  className = "",
  onClick,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tilt || !cardRef.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const maxTilt = 15;
        const rx = (-dy / (rect.height / 2)) * maxTilt;
        const ry = (dx / (rect.width / 2)) * maxTilt;
        cardRef.current.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        if (shineRef.current) {
          const shineX = ((e.clientX - rect.left) / rect.width) * 100;
          const shineY = ((e.clientY - rect.top) / rect.height) * 100;
          shineRef.current.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
        }
      });
    },
    [tilt]
  );

  const handleMouseLeave = useCallback(() => {
    if (!tilt || !cardRef.current) return;
    cardRef.current.style.transition = "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)";
    cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    if (shineRef.current) shineRef.current.style.background = "transparent";
    setTimeout(() => {
      if (cardRef.current) cardRef.current.style.transition = "";
    }, 500);
  }, [tilt]);

  const variantClass = VARIANT_CLASS[variant];
  const glowClass = glow ? "glow-gold" : "";
  const liftClass = lift ? "card-lift" : "";

  return (
    <motion.div
      ref={cardRef}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={[
        "relative rounded-2xl overflow-hidden",
        variantClass,
        glowClass,
        liftClass,
        tilt ? "card-tilt will-change-transform" : "",
        onClick ? "cursor-pointer" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ willChange: tilt ? "transform" : undefined }}
    >
      {/* Shine overlay for tilt effect */}
      {tilt && (
        <div
          ref={shineRef}
          className="pointer-events-none absolute inset-0 rounded-2xl z-10 transition-[background] duration-100"
        />
      )}
      {children}
    </motion.div>
  );
}
