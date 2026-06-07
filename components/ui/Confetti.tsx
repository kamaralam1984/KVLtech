"use client";

import { useEffect, useState } from "react";

const COLORS = ["#C9A227", "#FFD700", "#0B1437", "#4CAF50", "#FF5722", "#2196F3"];

interface Particle {
  id: number;
  color: string;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  isCircle: boolean;
}

function generateParticles(count = 40): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1.2,
    size: 6 + Math.random() * 6,
    rotation: Math.random() * 360,
    isCircle: Math.random() > 0.5,
  }));
}

export function Confetti({ trigger }: { trigger: boolean }) {
  const [active, setActive] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger) {
      setParticles(generateParticles(40));
      setActive(true);
      const timer = setTimeout(() => setActive(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
