'use client'

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'
import GuideGesture, { GESTURE_LABEL, GuideGestureKind } from './GuideGesture'

export interface GuideStep {
  /** DOM id of the element to spotlight. Omit for a centred card with no spotlight. */
  target?: string
  title: string
  body: string
  gesture?: GuideGestureKind
  /** 'click': the step waits for the user to tap the highlighted element itself. */
  advanceOn?: 'next' | 'click'
}

export type GuideVariant = 'editorial' | 'brutal'

interface GuideProps {
  steps: GuideStep[]
  open: boolean
  onClose: () => void
  /** localStorage key marked 'true' once the guide is finished or skipped. */
  storageKey: string
  variant?: GuideVariant
}

interface Box {
  x: number
  y: number
  w: number
  h: number
}

const PAD = 8
const TARGET_WAIT_MS = 900

function sameBox(a: Box | null, b: Box | null) {
  if (!a || !b) return a === b
  return Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5 && Math.abs(a.w - b.w) < 0.5 && Math.abs(a.h - b.h) < 0.5
}

/**
 * Spotlight guide: dims the page, cuts a hole around the target, glides the hole and the card
 * from step to step, and plays an animated gesture on the target. Steps whose target is missing
 * are skipped. Every step can be skipped; Esc closes; arrow keys move.
 */
export default function Guide({ steps, open, onClose, storageKey, variant = 'editorial' }: GuideProps) {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [box, setBox] = useState<Box | null>(null)
  const [viewport, setViewport] = useState({ w: 0, h: 0 })
  const [cardH, setCardH] = useState(220)
  const [mounted, setMounted] = useState(false)
  const targetEl = useRef<HTMLElement | null>(null)
  const [dir, setDir] = useState<1 | -1>(1)
  const cardRef = useRef<HTMLDivElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)

  const step = steps[index]
  const brutal = variant === 'brutal'

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIndex(0)
      setDir(1)
    }
  }, [open])

  const finish = useCallback(() => {
    try {
      localStorage.setItem(storageKey, 'true')
    } catch {}
    targetEl.current = null
    setBox(null)
    onClose()
  }, [onClose, storageKey])

  const go = useCallback(
    (step: 1 | -1) => {
      setDir(step)
      const n = index + step
      if (n >= steps.length) {
        finish()
        return
      }
      setIndex(Math.max(0, n))
    },
    [index, steps.length, finish]
  )

  // Resolve the target for the current step, waiting briefly for elements that animate in
  useEffect(() => {
    if (!open || !step) return
    targetEl.current = null
    if (!step.target) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBox(null)
      return
    }
    let cancelled = false
    const started = performance.now()
    const tryFind = () => {
      if (cancelled) return
      const el = document.getElementById(step.target!)
      const r = el?.getBoundingClientRect()
      if (el && r && r.width > 0 && r.height > 0) {
        targetEl.current = el
        const fullyVisible = r.top >= 64 && r.bottom <= window.innerHeight - 64
        if (!fullyVisible) el.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' })
        return
      }
      if (performance.now() - started > TARGET_WAIT_MS) {
        // Target is not on this page state (e.g. a banner hidden for this user): skip it
        if (dir < 0 && index === 0) go(1)
        else go(dir)
        return
      }
      setTimeout(tryFind, 60)
    }
    tryFind()
    return () => {
      cancelled = true
    }
  }, [open, index, step, go, dir, reduceMotion])

  // Track the target box every frame while open (handles scrolling, layout shifts, animations)
  useEffect(() => {
    if (!open) return
    let raf = 0
    let last: Box | null = null
    const tick = () => {
      const el = targetEl.current
      let next: Box | null = null
      if (el && el.isConnected) {
        const r = el.getBoundingClientRect()
        next = { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 }
      }
      if (!sameBox(last, next)) {
        last = next
        setBox(next)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    onResize()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  // "Do it to continue" steps: advance when the user taps the real element
  useEffect(() => {
    if (!open || step?.advanceOn !== 'click' || !box) return
    const el = targetEl.current
    if (!el) return
    const onClick = () => setTimeout(() => go(1), 120)
    el.addEventListener('click', onClick, { once: true })
    return () => el.removeEventListener('click', onClick)
  }, [open, step, box, go])

  // Keyboard
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
      else if (e.key === 'ArrowRight' && step?.advanceOn !== 'click') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, step, go, finish])

  // Focus the primary action on each step for keyboard and screen reader users
  useEffect(() => {
    if (open) primaryRef.current?.focus({ preventScroll: true })
  }, [open, index])

  useLayoutEffect(() => {
    if (!cardRef.current) return
    const ro = new ResizeObserver(([entry]) => setCardH(entry.contentRect.height + 40))
    ro.observe(cardRef.current)
    return () => ro.disconnect()
  }, [open])

  if (!mounted || !step) return null

  const vw = viewport.w || (typeof window !== 'undefined' ? window.innerWidth : 390)
  const vh = viewport.h || (typeof window !== 'undefined' ? window.innerHeight : 800)
  const isPhone = vw < 640
  const cardW = isPhone ? vw - 24 : 360

  // Card placement: phone docks top or bottom away from the target; desktop sits beside it
  let cardX = (vw - cardW) / 2
  let cardY = (vh - cardH) / 2
  if (box) {
    if (isPhone) {
      cardX = 12
      cardY = box.y + box.h / 2 > vh * 0.5 ? 12 : vh - cardH - 12
    } else {
      cardX = Math.min(Math.max(box.x + box.w / 2 - cardW / 2, 16), vw - cardW - 16)
      const below = box.y + box.h + 14
      cardY = below + cardH < vh - 12 ? below : Math.max(12, box.y - cardH - 14)
    }
  }

  const spring = reduceMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 380, damping: 34 }
  const hole = box ?? { x: vw / 2, y: vh / 2, w: 0, h: 0 }
  const radius = brutal ? 0 : 16
  const isClickStep = step.advanceOn === 'click' && !!box
  const isLast = index === steps.length - 1

  // Four blockers around the hole keep the page inert; the hole itself is open only on click steps
  const blockers = box
    ? [
        { left: 0, top: 0, width: vw, height: Math.max(0, box.y) },
        { left: 0, top: box.y + box.h, width: vw, height: Math.max(0, vh - box.y - box.h) },
        { left: 0, top: box.y, width: Math.max(0, box.x), height: box.h },
        { left: box.x + box.w, top: box.y, width: Math.max(0, vw - box.x - box.w), height: box.h },
        ...(isClickStep ? [] : [{ left: box.x, top: box.y, width: box.w, height: box.h }])
      ]
    : [{ left: 0, top: 0, width: vw, height: vh }]

  const overlay = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="guide"
          className="fixed inset-0 z-[80] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          transition={{ duration: 0.2 }}
        >
          {/* Dim layer with an animated hole */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
            <defs>
              <mask id="guide-hole">
                <rect width="100%" height="100%" fill="white" />
                <motion.rect initial={false} animate={{ x: hole.x, y: hole.y, width: hole.w, height: hole.h }} transition={spring} rx={radius} fill="black" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill={brutal ? 'rgba(10,10,10,0.68)' : 'rgba(15,23,42,0.6)'} mask="url(#guide-hole)" />
            {box && (
              <motion.rect
                initial={false}
                animate={{ x: hole.x, y: hole.y, width: hole.w, height: hole.h }}
                transition={spring}
                rx={radius}
                fill="none"
                stroke={brutal ? '#000' : '#fff'}
                strokeWidth={brutal ? 4 : 2}
              />
            )}
            {isClickStep && !reduceMotion && (
              <motion.rect
                x={hole.x}
                y={hole.y}
                width={hole.w}
                height={hole.h}
                rx={radius}
                fill="none"
                stroke={brutal ? '#FF5500' : '#fff'}
                strokeWidth={3}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                animate={{ scale: [1, 1.08], opacity: [0.9, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
          </svg>

          {blockers.map((b, i) => (
            <div key={i} className="absolute pointer-events-auto" style={b} />
          ))}

          {/* Gesture glyph over the target */}
          {box && step.gesture && (
            <motion.div
              className="absolute left-0 top-0 pointer-events-none"
              initial={false}
              animate={{ x: box.x + box.w / 2 - 20, y: box.y + Math.min(box.h / 2, box.h - 40) }}
              transition={spring}
            >
              <GuideGesture kind={step.gesture} size={52} />
            </motion.div>
          )}

          {/* Step card */}
          <motion.div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
            aria-describedby="guide-body"
            className={`absolute left-0 top-0 pointer-events-auto ${brutal ? 'bg-white border-[3px] border-black hard-shadow-black' : 'bg-white rounded-3xl shadow-[0_18px_50px_rgba(15,23,42,0.28)]'} p-5`}
            style={{ width: cardW }}
            initial={reduceMotion ? { opacity: 0, x: cardX, y: cardY } : { opacity: 0, x: cardX, y: cardY + 16 }}
            animate={{ opacity: 1, x: cardX, y: cardY }}
            transition={spring}
          >
            <div className={`h-1 ${brutal ? 'bg-black/15' : 'bg-slate-100 rounded-full'} overflow-hidden`}>
              <motion.div
                className={`h-full origin-left ${brutal ? 'bg-[#FF5500]' : 'bg-slate-900 rounded-full'}`}
                initial={false}
                animate={{ scaleX: (index + 1) / steps.length }}
                transition={spring}
              />
            </div>

            <div className="mt-4 flex items-start justify-between gap-3">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={index}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * -12 }}
                  transition={{ duration: 0.18 }}
                  className="min-w-0"
                >
                  <h2 id="guide-title" className={`text-[18px] leading-snug ${brutal ? 'font-black uppercase tracking-tight text-black' : 'font-bold tracking-tight text-slate-900'}`}>
                    {step.title}
                  </h2>
                  <p id="guide-body" className="mt-1.5 text-[15px] leading-relaxed text-slate-600">
                    {step.body}
                  </p>
                  {step.gesture && (
                    <p className={`mt-2 text-[13px] font-semibold ${brutal ? 'text-[#FF5500]' : 'text-slate-900'}`}>
                      {isClickStep ? 'Coba sekarang: ' : ''}
                      {GESTURE_LABEL[step.gesture].toLowerCase()} bagian yang disorot
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
              <button
                type="button"
                onClick={finish}
                aria-label="Tutup panduan"
                className="-mr-2 -mt-2 w-10 h-10 shrink-0 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="text-[13px] text-slate-500 tabular-nums" aria-live="polite">
                {index + 1} dari {steps.length}
              </span>
              <div className="flex items-center gap-1">
                {index > 0 && (
                  <button type="button" onClick={() => go(-1)} className="min-h-[44px] px-3 text-[14px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer">
                    Kembali
                  </button>
                )}
                {isClickStep ? (
                  <button ref={primaryRef} type="button" onClick={() => go(1)} className="min-h-[44px] px-3 text-[14px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer">
                    Lewati langkah
                  </button>
                ) : (
                  <button
                    ref={primaryRef}
                    type="button"
                    onClick={() => go(1)}
                    className={`min-h-[44px] px-5 flex items-center gap-1.5 text-[14px] font-semibold text-white active:scale-95 transition-transform cursor-pointer ${
                      brutal ? 'bg-black border-2 border-black uppercase' : 'bg-slate-900 rounded-full hover:bg-black'
                    }`}
                  >
                    {isLast ? 'Selesai' : 'Lanjut'}
                    {!isLast && <ArrowRight className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(overlay, document.body)
}
