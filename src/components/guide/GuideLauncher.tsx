'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'

interface GuideLauncherProps {
  onClick: () => void
  className?: string
  id?: string
}

/** Small "Panduan" button for pages that have no help button of their own. */
export default function GuideLauncher({ onClick, className = '', id }: GuideLauncherProps) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.button
      id={id}
      type="button"
      onClick={onClick}
      aria-label="Buka panduan halaman ini"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24, delay: 0.4 }}
      className={`min-h-[44px] px-4 flex items-center gap-2 rounded-full bg-white text-[15px] font-semibold text-primary cursor-pointer ${className}`}
    >
      <HelpCircle className="w-4 h-4" />
      Panduan
    </motion.button>
  )
}
