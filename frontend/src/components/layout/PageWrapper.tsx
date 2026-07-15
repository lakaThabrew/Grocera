"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

export function PageWrapper({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`w-full max-w-7xl mx-auto flex flex-col gap-6 ${className}`}
    >
      {children}
    </motion.div>
  )
}
