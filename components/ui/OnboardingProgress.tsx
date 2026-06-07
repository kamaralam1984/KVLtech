"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function OnboardingProgress({ currentStep, totalSteps, labels }: OnboardingProgressProps) {
  return (
    <div className="relative flex items-start justify-between w-full">
      {/* Connecting line — background */}
      <div
        className="absolute top-4 left-0 right-0 h-0.5 bg-[var(--color-border)]"
        style={{ left: `${(0.5 / totalSteps) * 100}%`, right: `${(0.5 / totalSteps) * 100}%` }}
      />

      {/* Connecting line — filled progress */}
      <motion.div
        className="absolute top-4 h-0.5"
        style={{
          left: `${(0.5 / totalSteps) * 100}%`,
          background: "var(--color-gold)",
        }}
        initial={{ width: 0 }}
        animate={{
          width: `${Math.max(0, ((currentStep - 1) / (totalSteps - 1))) * (100 - (100 / totalSteps))}%`,
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {Array.from({ length: totalSteps }).map((_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        const label = labels?.[i];

        return (
          <div key={stepNum} className="relative flex flex-col items-center" style={{ width: `${100 / totalSteps}%` }}>
            <motion.div
              initial={false}
              animate={{
                scale: isActive ? 1.15 : 1,
                backgroundColor: isCompleted
                  ? "var(--color-gold)"
                  : isActive
                  ? "var(--color-gold)"
                  : "transparent",
                borderColor: isCompleted || isActive ? "var(--color-gold)" : "var(--color-border)",
              }}
              transition={{ duration: 0.3 }}
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 bg-[var(--color-bg)]"
              style={{ position: "relative" }}
            >
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <Check size={14} className="text-white" strokeWidth={2.5} />
                </motion.div>
              ) : isActive ? (
                <motion.span
                  className="w-3 h-3 rounded-full bg-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-border)]" />
              )}
            </motion.div>

            {label && (
              <motion.p
                animate={{
                  color: isCompleted || isActive ? "var(--color-text-secondary)" : "var(--color-text-muted)",
                  fontWeight: isActive ? 600 : 400,
                }}
                className="text-[10px] text-center mt-2 leading-tight max-w-[64px] hidden sm:block"
              >
                {label}
              </motion.p>
            )}
          </div>
        );
      })}
    </div>
  );
}
