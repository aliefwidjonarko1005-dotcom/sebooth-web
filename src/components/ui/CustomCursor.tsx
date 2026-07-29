'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [isHovered, setIsHovered] = useState(false)
  const [cursorText, setCursorText] = useState('')

  useEffect(() => {
    // Only enable on desktop
    if (window.innerWidth < 1024) return

    const updateMouse = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const clickable = target.closest('button, a, input, [data-cursor]')
      if (clickable) {
        setIsHovered(true)
        const customText = clickable.getAttribute('data-cursor')
        if (customText) setCursorText(customText)
      } else {
        setIsHovered(false)
        setCursorText('')
      }
    }

    window.addEventListener('mousemove', updateMouse)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', updateMouse)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[10000] hidden lg:flex items-center justify-center font-bold text-[10px] uppercase tracking-widest text-[#e33529]"
      animate={{
        x: position.x - (isHovered ? 28 : 12),
        y: position.y - (isHovered ? 28 : 12),
        width: isHovered ? 56 : 24,
        height: isHovered ? 56 : 24,
        backgroundColor: isHovered ? '#fff500' : 'rgba(227, 53, 41, 0.4)',
        scale: isHovered ? 1.2 : 1,
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.5 }}
      style={{
        borderRadius: '50%',
        mixBlendMode: 'difference',
      }}
    >
      {cursorText && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[8px] font-black leading-none text-center text-[#e33529]"
        >
          {cursorText}
        </motion.span>
      )}
    </motion.div>
  )
}
