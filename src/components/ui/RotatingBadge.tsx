'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

interface RotatingBadgeProps {
  text?: string
  btnText?: string
  href?: string
  onClick?: () => void
  bgColor?: string
  textColor?: string
  size?: number
}

export function RotatingBadge({
  text = "SEBOOTH • THE FAVORITE PHOTOBOOTH • ",
  btnText = "BOOK NOW",
  href = "#pricing",
  onClick,
  bgColor = "#e33529",
  textColor = "#f6f6ed",
  size = 140,
}: RotatingBadgeProps) {
  const characters = text.split("")

  const Content = (
    <div
      className="relative flex items-center justify-center cursor-pointer group"
      style={{ width: size, height: size }}
      onClick={onClick}
      data-cursor="CLICK"
    >
      {/* Circular Rotating Text */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            id="circlePath"
            d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            fill="none"
          />
          <text className="text-[9.5px] font-black uppercase tracking-[0.18em]" fill={bgColor}>
            <textPath href="#circlePath" startOffset="0%">
              {text}
            </textPath>
          </text>
        </svg>
      </motion.div>

      {/* Center Button Pill */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className="relative z-10 flex flex-col items-center justify-center rounded-full shadow-lg transition-transform"
        style={{
          width: size * 0.58,
          height: size * 0.58,
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        <ArrowUpRight className="w-5 h-5 mb-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        <span className="text-[9px] font-black uppercase tracking-wider leading-none text-center px-1">
          {btnText}
        </span>
      </motion.div>
    </div>
  )

  if (href) {
    return <a href={href}>{Content}</a>
  }

  return Content
}
