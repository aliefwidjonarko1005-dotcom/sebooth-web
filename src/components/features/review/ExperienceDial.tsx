'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import GuideGesture from '@/components/guide/GuideGesture'

export interface MoodConfig {
  key: string
  title: string
  sub: string
  color: string
  lightColor: string
}

export const MOODS: MoodConfig[] = [
  { key: 'BURUK', title: 'BURUK', sub: 'Maaf atas pengalaman kurang baikmu', color: '#FF4258', lightColor: '#FFF0F3' },
  { key: 'KURANG', title: 'KURANG', sub: 'Beri tahu kami apa yang bisa diperbaiki', color: '#FF7A45', lightColor: '#FFF3EE' },
  { key: 'CUKUP', title: 'CUKUP', sub: 'Sesi standar tanpa kendala berarti', color: '#FFB020', lightColor: '#FFFDF0' },
  { key: 'BAGUS', title: 'BAGUS', sub: 'Hasil foto ceria dan memuaskan', color: '#00C2FF', lightColor: '#EDFAFF' },
  { key: 'KEREN', title: 'KEREN!', sub: 'Luar biasa seru dan sangat puas', color: '#10D078', lightColor: '#ECFDF5' }
]

const NEUTRAL = { color: '#94A3B8', lightColor: '#F1F5F9' }
const CX = 300
const CY = 300
const R_OUTER = 285
const R_INNER = 175
const SECTOR_STEP = 60
const NEUTRAL_INDEX = 2

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeRingSector(x: number, y: number, ri: number, ro: number, a0: number, a1: number) {
  const p1 = polarToCartesian(x, y, ro, a0)
  const p2 = polarToCartesian(x, y, ro, a1)
  const p3 = polarToCartesian(x, y, ri, a1)
  const p4 = polarToCartesian(x, y, ri, a0)
  const large = (a1 - a0) % 360 <= 180 ? 0 : 1
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${ro} ${ro} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)} A ${ri} ${ri} 0 ${large} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)} Z`
}

function Face({ index }: { index: number | null }) {
  const c = index === null ? NEUTRAL.color : MOODS[index].color
  switch (index) {
    case 0:
      return (
        <g>
          <ellipse cx="54" cy="64" rx="7" ry="8" fill={c} transform="rotate(15 54 64)" />
          <ellipse cx="106" cy="64" rx="7" ry="8" fill={c} transform="rotate(-15 106 64)" />
          <path d="M46 50 L64 58" stroke={c} strokeWidth="5.5" strokeLinecap="round" />
          <path d="M114 50 L96 58" stroke={c} strokeWidth="5.5" strokeLinecap="round" />
          <path d="M52 114 Q80 84 108 114" stroke={c} strokeWidth="7.5" strokeLinecap="round" fill="none" />
        </g>
      )
    case 1:
      return (
        <g>
          <ellipse cx="55" cy="64" rx="7.5" ry="8.5" fill={c} />
          <ellipse cx="105" cy="64" rx="7.5" ry="8.5" fill={c} />
          <path d="M48 50 Q60 44 70 50" stroke={c} strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M90 52 Q100 46 112 50" stroke={c} strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M52 108 C68 96 90 114 108 102" stroke={c} strokeWidth="7.5" strokeLinecap="round" fill="none" />
        </g>
      )
    case 3:
      return (
        <g>
          <ellipse cx="55" cy="64" rx="8" ry="9" fill={c} />
          <ellipse cx="105" cy="64" rx="8" ry="9" fill={c} />
          <path d="M50 96 Q80 134 110 96" stroke={c} strokeWidth="7.5" strokeLinecap="round" fill="none" />
        </g>
      )
    case 4:
      return (
        <g>
          <path d="M54 50 L57 60 L67 63 L57 66 L54 76 L51 66 L41 63 L51 60 Z" fill={c} />
          <path d="M106 50 L109 60 L119 63 L109 66 L106 76 L103 66 L93 63 L103 60 Z" fill={c} />
          <path d="M46 94 Q80 142 114 94 Z" fill={c} stroke={c} strokeWidth="4" strokeLinejoin="round" />
        </g>
      )
    default:
      // CUKUP and the neutral (unselected) state share the straight face
      return (
        <g>
          <circle cx="56" cy="65" r="8" fill={c} />
          <circle cx="104" cy="65" r="8" fill={c} />
          <line x1="52" y1="108" x2="108" y2="108" stroke={c} strokeWidth="7.5" strokeLinecap="round" />
        </g>
      )
  }
}

interface ExperienceDialProps {
  value: number | null
  onChange: (index: number) => void
  /** Diameter of the wheel in px. The visible dome is the top half. */
  wheelSize?: number
  faceSize?: number
}

/**
 * Roulette arc rating dial (5 moods). Starts neutral (no preselected mood) until the user
 * drags, taps a sector or uses the arrow keys.
 */
export default function ExperienceDial({ value, onChange, wheelSize = 440, faceSize = 148 }: ExperienceDialProps) {
  const reduceMotion = useReducedMotion()
  const wheelRef = useRef<SVGSVGElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [tilt, setTilt] = useState(0)

  const restIndex = value ?? NEUTRAL_INDEX
  const angleRef = useRef(-(restIndex * SECTOR_STEP))
  const pointerDown = useRef(false)
  const startX = useRef(0)
  const startAngle = useRef(0)
  const lastT = useRef(0)
  const lastA = useRef(0)
  const velocity = useRef(0)
  const captured = useRef(false)
  const liveIndex = useRef<number | null>(value)

  const springTransition = reduceMotion ? 'none' : 'transform 0.42s cubic-bezier(0.18, 1, 0.26, 1.02)'

  useEffect(() => {
    liveIndex.current = value
    if (!pointerDown.current) {
      angleRef.current = -(restIndex * SECTOR_STEP)
      if (wheelRef.current) {
        wheelRef.current.style.transition = springTransition
        wheelRef.current.style.transform = `rotate(${angleRef.current}deg)`
      }
    }
  }, [value, restIndex, springTransition])

  const select = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(4, idx))
      liveIndex.current = clamped
      onChange(clamped)
      try {
        navigator.vibrate?.(16)
      } catch {}
    },
    [onChange]
  )

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDown.current = true
    setIsDragging(true)
    startX.current = e.clientX
    startAngle.current = angleRef.current
    lastA.current = angleRef.current
    lastT.current = performance.now()
    velocity.current = 0
    captured.current = false
    if (wheelRef.current) wheelRef.current.style.transition = 'none'
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDown.current) return
    const dx = e.clientX - startX.current
    // Capture only once it is a real drag, so a plain tap still reaches the sector's onClick
    if (!captured.current) {
      if (Math.abs(dx) < 5) return
      captured.current = true
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {}
    }
    let a = startAngle.current + dx * 0.32
    const max = 20
    const min = -(4 * SECTOR_STEP + 20)
    if (a > max) a = max + (a - max) * 0.25
    else if (a < min) a = min + (a - min) * 0.25
    angleRef.current = a
    if (wheelRef.current) wheelRef.current.style.transform = `rotate(${a}deg)`

    const now = performance.now()
    if (now - lastT.current > 10) {
      velocity.current = (a - lastA.current) / (now - lastT.current)
      lastT.current = now
      lastA.current = a
    }
    setTilt(Math.max(-12, Math.min(12, dx * 0.1)))

    const est = Math.max(0, Math.min(4, Math.round(-a / SECTOR_STEP)))
    if (est !== liveIndex.current) {
      liveIndex.current = est
      onChange(est)
      try {
        navigator.vibrate?.(10)
      } catch {}
    }
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDown.current) return
    pointerDown.current = false
    setIsDragging(false)
    setTilt(0)
    if (captured.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {}
    }
    if (!captured.current) {
      // A tap without drag: let the sector's own click handler decide
      angleRef.current = startAngle.current
      if (wheelRef.current) {
        wheelRef.current.style.transition = springTransition
        wheelRef.current.style.transform = `rotate(${angleRef.current}deg)`
      }
      return
    }
    const projected = angleRef.current + velocity.current * 140
    const target = Math.max(0, Math.min(4, Math.round(-projected / SECTOR_STEP)))
    angleRef.current = -(target * SECTOR_STEP)
    if (wheelRef.current) {
      wheelRef.current.style.transition = springTransition
      wheelRef.current.style.transform = `rotate(${angleRef.current}deg)`
    }
    select(target)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      select((value ?? NEUTRAL_INDEX - 1) + 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      select((value ?? NEUTRAL_INDEX + 1) - 1)
    }
  }

  const mood = value === null ? null : MOODS[value]
  const color = mood?.color ?? NEUTRAL.color
  const light = mood?.lightColor ?? NEUTRAL.lightColor
  const domeHeight = wheelSize / 2

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Face + mood label */}
      <div className="flex flex-col items-center">
        <motion.div
          key={value ?? 'neutral'}
          initial={reduceMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0.4 }}
          animate={reduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 520, damping: 26 }}
          className="rounded-full flex items-center justify-center"
          style={{ width: faceSize, height: faceSize, backgroundColor: light }}
          aria-hidden="true"
        >
          <svg className="w-full h-full" fill="none" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="72" stroke={color} strokeWidth="7" fill={light} />
            <Face index={value} />
          </svg>
        </motion.div>

        <div className="h-[64px] mt-2 flex flex-col items-center justify-start overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={value ?? 'neutral'}
              initial={reduceMotion ? { opacity: 0 } : { y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { y: -10, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col items-center"
            >
              <span className="text-[34px] leading-none font-bayon uppercase tracking-wide" style={{ color }}>
                {mood ? mood.title : 'Geser rodanya'}
              </span>
              <span className="mt-1 text-[13px] font-medium text-slate-500 text-center">
                {mood ? mood.sub : 'Pilih satu dari lima, atau ketuk langsung'}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dome */}
      <div className="relative w-full overflow-hidden mt-1" style={{ height: domeHeight + 18 }}>
        <div
          className="absolute top-0 left-1/2 z-20 flex flex-col items-center pointer-events-none transition-transform duration-150"
          style={{ transform: `translateX(-50%) rotate(${tilt}deg)` }}
          aria-hidden="true"
        >
          <div className="w-3.5 h-3.5 bg-white border-[2.5px] border-slate-700 rounded-full z-10" />
          <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[14px] border-t-slate-800 -mt-1.5" />
        </div>

        {/* Inline guide: an animated finger turns the dial until the user touches it */}
        <AnimatePresence>
          {value === null && !isDragging && (
            <motion.div
              className="absolute left-1/2 z-30 pointer-events-none"
              style={{ top: domeHeight * 0.32, marginLeft: -26 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.6 } }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
            >
              <GuideGesture kind="drag-dial" size={52} />
            </motion.div>
          )}
        </AnimatePresence>

        <div
          id="review-dial"
          role="slider"
          tabIndex={0}
          aria-label="Rating pengalaman"
          aria-valuemin={1}
          aria-valuemax={5}
          aria-valuenow={value === null ? undefined : value + 1}
          aria-valuetext={mood ? `${value! + 1} dari 5, ${mood.title}` : 'Belum dipilih'}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute left-1/2 cursor-grab active:cursor-grabbing touch-none rounded-full outline-none focus-visible:ring-4 focus-visible:ring-slate-900/20"
          style={{ top: 14, width: wheelSize, height: wheelSize, transform: 'translateX(-50%)' }}
        >
          <svg
            ref={wheelRef}
            className="w-full h-full"
            viewBox="0 0 600 600"
            style={{
              transform: `rotate(${-(restIndex * SECTOR_STEP)}deg)`,
              transformOrigin: '50% 50%',
              transition: isDragging ? 'none' : springTransition
            }}
          >
            {MOODS.map((m, i) => {
              const center = i * SECTOR_STEP
              const d = describeRingSector(CX, CY, R_INNER, R_OUTER, center - SECTOR_STEP / 2, center + SECTOR_STEP / 2)
              const tp = polarToCartesian(CX, CY, (R_INNER + R_OUTER) / 2 + 4, center)
              const isSel = value === i
              return (
                <g
                  key={m.key}
                  className="cursor-pointer"
                  style={{ opacity: value === null ? 0.62 : isSel ? 1 : 0.72, transition: 'opacity 200ms' }}
                  onClick={() => select(i)}
                >
                  <path d={d} fill={m.color} stroke="#FFFFFF" strokeWidth="2.5" />
                  {[-20, -10, 0, 10, 20].map((t) => {
                    const o = polarToCartesian(CX, CY, R_OUTER - 3, center + t)
                    const oi = polarToCartesian(CX, CY, R_OUTER - 12, center + t)
                    return <line key={t} x1={o.x} y1={o.y} x2={oi.x} y2={oi.y} stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />
                  })}
                  <text
                    x={tp.x}
                    y={tp.y + 6}
                    fill="#FFFFFF"
                    fontSize={isSel ? 20 : 17}
                    fontWeight={isSel ? 900 : 700}
                    letterSpacing="0.06em"
                    textAnchor="middle"
                    transform={`rotate(${center}, ${tp.x}, ${tp.y})`}
                    className="pointer-events-none"
                  >
                    {m.title}
                  </text>
                </g>
              )
            })}
            <circle cx={CX} cy={CY} r={R_INNER} fill="#FFFFFF" stroke="rgba(226,232,240,0.9)" strokeWidth="4" />
          </svg>
        </div>
      </div>
    </div>
  )
}
