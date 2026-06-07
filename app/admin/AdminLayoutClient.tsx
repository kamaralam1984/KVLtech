"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex-1 overflow-y-auto"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
