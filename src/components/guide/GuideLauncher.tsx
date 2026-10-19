'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'
import type { GuideVariant } from './Guide'

interface GuideLauncherProps {
  onClick: () => void
  variant?: GuideVariant
  className?: string
  id?: string
}

/** Small "Panduan" button for pages that have no help button of their own. */
export default function GuideLauncher({ onClick, variant = 'editorial', className = '', id }: GuideLauncherProps) {
  const reduceMotion = useReducedMotion()
  const brutal = variant === 'brutal'
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
      className={`min-h-[44px] px-4 flex items-center gap-2 text-[14px] font-semibold cursor-pointer ${
        brutal ? 'bg-white text-black border-[3px] border-black hard-shadow-black uppercase' : 'bg-white text-slate-900 rounded-full shadow-[0_6px_20px_rgba(15,23,42,0.16)]'
      } ${className}`}
    >
      <HelpCircle className="w-4 h-4" />
      Panduan
    </motion.button>
  )
}
