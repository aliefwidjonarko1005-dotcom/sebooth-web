'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, Hand } from 'lucide-react'

export type TourGesture = 'swipe' | 'pinch' | 'hold' | 'tap'

interface GestureVisualizerProps {
  gesture: TourGesture
  compact?: boolean
  className?: string
}

export default function GestureVisualizer({
  gesture,
  compact = false,
  className = ''
}: GestureVisualizerProps) {
  if (gesture === 'swipe') {
    return (
      <div
        className={`relative flex items-center justify-center select-none pointer-events-none ${
          compact ? 'w-14 h-10' : 'w-36 h-20'
        } ${className}`}
      >
        {/* Left Arrow Guide */}
        <div className={`absolute left-1 flex items-center text-orange-400 ${compact ? 'opacity-50' : 'opacity-80'}`}>
          <ChevronLeft className={`${compact ? 'w-3 h-3 stroke-[3]' : 'w-4.5 h-4.5 stroke-[3]'}`} />
        </div>

        {/* Right Arrow Guide */}
        <div className={`absolute right-1 flex items-center text-orange-400 ${compact ? 'opacity-50' : 'opacity-80'}`}>
          <ChevronRight className={`${compact ? 'w-3 h-3 stroke-[3]' : 'w-4.5 h-4.5 stroke-[3]'}`} />
        </div>

        {/* Motion Track Guide Line */}
        <div className={`rounded-full bg-white/20 relative ${compact ? 'w-10 h-0.5' : 'w-24 h-1'}`} />

        {/* Animated Finger Puck */}
        <div className="absolute animate-gesture-swipe flex items-center justify-center">
          <div
            className={`rounded-full bg-orange-500/40 border border-white flex items-center justify-center shadow-lg shadow-orange-500/50 ${
              compact ? 'w-6 h-6 border-1.5' : 'w-10 h-10 border-2'
            }`}
          >
            <div className={`rounded-full bg-white shadow-sm ${compact ? 'w-2.5 h-2.5' : 'w-4 h-4'}`} />
          </div>
        </div>
      </div>
    )
  }

  if (gesture === 'pinch') {
    return (
      <div
        className={`relative flex items-center justify-center select-none pointer-events-none ${
          compact ? 'w-12 h-10' : 'w-32 h-20'
        } ${className}`}
      >
        {/* Dotted Radial Guide Circle */}
        <div
          className={`absolute rounded-full border border-dashed border-orange-400/40 ${
            compact ? 'w-9 h-9' : 'w-20 h-20'
          }`}
        />

        {/* Finger 1: Top-Left Finger Puck */}
        <div className="absolute animate-gesture-pinch-1 flex items-center justify-center">
          <div
            className={`rounded-full bg-orange-500/40 border border-white flex items-center justify-center shadow-md ${
              compact ? 'w-5 h-5 border-1.5' : 'w-8 h-8 border-2'
            }`}
          >
            <div className={`rounded-full bg-white ${compact ? 'w-2 h-2' : 'w-3 h-3'}`} />
          </div>
        </div>

        {/* Finger 2: Bottom-Right Finger Puck */}
        <div className="absolute animate-gesture-pinch-2 flex items-center justify-center">
          <div
            className={`rounded-full bg-orange-500/40 border border-white flex items-center justify-center shadow-md ${
              compact ? 'w-5 h-5 border-1.5' : 'w-8 h-8 border-2'
            }`}
          >
            <div className={`rounded-full bg-white ${compact ? 'w-2 h-2' : 'w-3 h-3'}`} />
          </div>
        </div>
      </div>
    )
  }

  if (gesture === 'hold') {
    const size = compact ? 42 : 76
    const radius = compact ? 16 : 30
    const strokeWidth = compact ? 2.5 : 4
    const circumference = 2 * Math.PI * radius

    return (
      <div
        className={`relative flex items-center justify-center select-none pointer-events-none ${
          compact ? 'w-12 h-12' : 'w-24 h-24'
        } ${className}`}
      >
        {/* Shockwave Haptic Pulse on Hold Complete */}
        <div
          className={`absolute rounded-full border border-orange-400 animate-gesture-hold-pulse ${
            compact ? 'w-10 h-10 border-1.5' : 'w-18 h-18 border-2'
          }`}
        />

        {/* Circular SVG Timer Ring */}
        <svg
          className="absolute -rotate-90"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={strokeWidth}
          />
          {/* Animated progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f97316"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            className="animate-gesture-hold-ring"
            strokeLinecap="round"
          />
        </svg>

        {/* Center Finger Puck (Presses Down) */}
        <div className="absolute animate-gesture-hold-press flex items-center justify-center">
          <div
            className={`rounded-full bg-orange-500/50 border border-white flex items-center justify-center shadow-xl ${
              compact ? 'w-6 h-6 border-1.5' : 'w-10 h-10 border-2'
            }`}
          >
            <div className={`rounded-full bg-white shadow-sm ${compact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}`} />
          </div>
        </div>
      </div>
    )
  }

  // Fallback: 'tap'
  return (
    <div
      className={`relative flex items-center justify-center select-none pointer-events-none ${
        compact ? 'w-12 h-10' : 'w-20 h-20'
      } ${className}`}
    >
      {/* Expanding Tap Ripple Ring */}
      <div
        className={`absolute rounded-full border border-orange-400 animate-gesture-tap-ripple ${
          compact ? 'w-9 h-9 border-1.5' : 'w-16 h-16 border-2'
        }`}
      />

      {/* Center Finger Puck (Taps Down) */}
      <div className="absolute animate-gesture-tap-puck flex items-center justify-center">
        <div
          className={`rounded-full bg-orange-500/40 border border-white flex items-center justify-center shadow-lg ${
            compact ? 'w-6 h-6 border-1.5' : 'w-10 h-10 border-2'
          }`}
        >
          <div className={`rounded-full bg-white shadow-sm ${compact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}`} />
        </div>
      </div>
    </div>
  )
}
