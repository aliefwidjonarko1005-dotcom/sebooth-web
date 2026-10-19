'use client'

import React from 'react'
import { motion, useReducedMotion, type TargetAndTransition } from 'framer-motion'

export type GuideGestureKind = 'tap' | 'hold' | 'swipe-x' | 'swipe-y' | 'pinch' | 'drag-dial' | 'scroll'

/** Human label shown under the card title for each gesture. */
export const GESTURE_LABEL: Record<GuideGestureKind, string> = {
  tap: 'Ketuk',
  hold: 'Tekan dan tahan',
  'swipe-x': 'Geser ke samping',
  'swipe-y': 'Geser ke atas',
  pinch: 'Cubit untuk zoom',
  'drag-dial': 'Putar ke kiri atau kanan',
  scroll: 'Gulir ke bawah'
}

function Finger({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M19 6.5a3.5 3.5 0 0 1 7 0V21l7.6 1.9a5 5 0 0 1 3.7 5.7l-1.7 9.7A6 6 0 0 1 29.7 43H22a6 6 0 0 1-4.6-2.1l-7.7-9.2a3.2 3.2 0 0 1 4.6-4.4L19 31V6.5Z"
        fill="#fff"
        stroke="#0f172a"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const LOOP = { repeat: Infinity, repeatDelay: 0.5, ease: 'easeInOut' as const }

const FINGER_MOTION: Record<GuideGestureKind, TargetAndTransition> = {
  tap: { scale: [1, 0.86, 1], y: [0, 4, 0], transition: { duration: 0.9, ...LOOP } },
  hold: { scale: [1, 0.88, 0.88, 1], y: [0, 4, 4, 0], transition: { duration: 1.8, times: [0, 0.15, 0.85, 1], ...LOOP } },
  'swipe-x': { x: [26, -26, -26, 26], opacity: [0, 1, 1, 0], transition: { duration: 1.4, times: [0, 0.2, 0.8, 1], ...LOOP } },
  'swipe-y': { y: [26, -26, -26, 26], opacity: [0, 1, 1, 0], transition: { duration: 1.4, times: [0, 0.2, 0.8, 1], ...LOOP } },
  scroll: { y: [-18, 22, 22, -18], opacity: [0, 1, 1, 0], transition: { duration: 1.4, times: [0, 0.2, 0.8, 1], ...LOOP } },
  pinch: { scale: [1, 1.18, 1], rotate: [0, -8, 0], transition: { duration: 1.2, ...LOOP } },
  'drag-dial': { x: [-30, 30, -30], rotate: [-12, 12, -12], transition: { duration: 2, ease: 'easeInOut', repeat: Infinity } }
}

/**
 * Animated finger glyph showing the gesture a step asks for. Placed over the spotlight target.
 * Reduced motion: a static finger with a ring, no travel.
 */
export default function GuideGesture({ kind, size = 56 }: { kind: GuideGestureKind; size?: number }) {
  const reduceMotion = useReducedMotion()
  const showRipple = kind === 'tap' || kind === 'hold'

  return (
    <div className="relative pointer-events-none" style={{ width: size, height: size }} aria-hidden="true">
      {showRipple && !reduceMotion && (
        <motion.span
          className="absolute left-[22%] top-[-6%] w-[42%] h-[42%] rounded-full border-[3px] border-white"
          style={{ boxShadow: '0 0 0 2px rgba(15,23,42,0.5)' }}
          animate={
            kind === 'hold'
              ? { scale: [0.4, 1.5, 1.5], opacity: [0, 0.9, 0], transition: { duration: 1.8, times: [0, 0.8, 1], repeat: Infinity, repeatDelay: 0.5 } }
              : { scale: [0.4, 1.7], opacity: [0.9, 0], transition: { duration: 0.9, repeat: Infinity, repeatDelay: 0.5 } }
          }
        />
      )}
      {kind === 'pinch' && !reduceMotion && (
        <motion.span
          className="absolute inset-[-20%] rounded-full border-2 border-dashed border-white/80"
          animate={{ scale: [0.7, 1.1, 0.7], transition: { duration: 1.2, repeat: Infinity, repeatDelay: 0.5 } }}
        />
      )}
      <motion.div className="w-full h-full drop-shadow-[0_6px_10px_rgba(15,23,42,0.35)]" animate={reduceMotion ? undefined : FINGER_MOTION[kind]}>
        <Finger className="w-full h-full" />
      </motion.div>
    </div>
  )
}
