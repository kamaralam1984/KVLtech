"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{ background: "var(--color-bg-secondary)" }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        <p
          style={{
            color: "var(--color-gold)",
            fontSize: "8rem",
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          404
        </p>

        <h1
          style={{ color: "var(--color-text)" }}
          className="text-3xl font-bold mt-4 mb-3"
        >
          Page Not Found
        </h1>

        <p
          style={{ color: "var(--color-text-muted)" }}
          className="text-base mb-8"
        >
          The page you&apos;re looking for doesn&apos;t exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-gold flex items-center justify-center gap-2">
            <Home size={18} />
            Go Home
          </Link>
          <Link href="/products" className="btn-outline flex items-center justify-center">
            View Products
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
