"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function PageWrapper({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.99 }}
      transition={{
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`w-full max-w-7xl mx-auto flex flex-col gap-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
