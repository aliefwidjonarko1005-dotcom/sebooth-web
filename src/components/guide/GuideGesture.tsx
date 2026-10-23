'use client'

import React from 'react'

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

const FINGER_PATH =
  'M19 6.5a3.5 3.5 0 0 1 7 0V21l7.6 1.9a5 5 0 0 1 3.7 5.7l-1.7 9.7A6 6 0 0 1 29.7 43H22a6 6 0 0 1-4.6-2.1l-7.7-9.2a3.2 3.2 0 0 1 4.6-4.4L19 31V6.5Z'

function Finger({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Baked shadow: a CSS drop-shadow on a moving element would repaint every frame */}
      <path d={FINGER_PATH} transform="translate(1 3.5)" fill="rgba(15,23,42,0.28)" />
      <path d={FINGER_PATH} fill="#fff" stroke="#0f172a" strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  )
}

const RIPPLE: Partial<Record<GuideGestureKind, string>> = {
  tap: 'guide-ripple--tap absolute left-[22%] top-[-6%] w-[42%] h-[42%] rounded-full border-[3px] border-white shadow-[0_0_0_2px_rgba(15,23,42,0.5)]',
  hold: 'guide-ripple--hold absolute left-[22%] top-[-6%] w-[42%] h-[42%] rounded-full border-[3px] border-white shadow-[0_0_0_2px_rgba(15,23,42,0.5)]',
  pinch: 'guide-ripple--pinch absolute inset-[-20%] rounded-full border-2 border-dashed border-white/80'
}

/**
 * Animated finger glyph showing the gesture a step asks for. Placed over the spotlight target.
 * Loops are CSS keyframes (globals.css, `.guide-finger--*`) so they run off the main thread.
 * Reduced motion: a static finger, no ripple.
 */
export default function GuideGesture({ kind, size = 56 }: { kind: GuideGestureKind; size?: number }) {
  const ripple = RIPPLE[kind]
  return (
    <div className="relative pointer-events-none" style={{ width: size, height: size }} aria-hidden="true">
      {ripple && <span className={`guide-ripple ${ripple}`} />}
      <div className={`guide-finger guide-finger--${kind} w-full h-full`}>
        <Finger className="w-full h-full" />
      </div>
    </div>
  )
}
