'use client'

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, animate, type MotionValue } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'
import GuideGesture, { GESTURE_LABEL, GuideGestureKind } from './GuideGesture'

export interface GuideStep {
  /** DOM id of the element to spotlight. Omit for a centred card with no spotlight. */
  target?: string
  title: string
  body: string
  gesture?: GuideGestureKind
  /**
   * 'click': the step waits for the user to tap the highlighted element itself.
   * 'action': the step waits until the page reports `action` via emitGuideAction (a real swipe, hold, ...).
   */
  advanceOn?: 'next' | 'click' | 'action'
  /** Name the page passes to emitGuideAction when the user completes this step's gesture. */
  action?: string
}

const ACTION_EVENT = 'guide:action'

/** Pages call this when the user really performed a gesture, so an 'action' step can move on. */
export function emitGuideAction(name: string) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<string>(ACTION_EVENT, { detail: name }))
}

export type GuideVariant = 'editorial' | 'brutal' | 'ios'

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
const SPRING = { type: 'spring' as const, stiffness: 380, damping: 34 }
/** After a step change the spotlight and card glide; outside this window they stick to the target. */
const GLIDE_MS = 500
/** Keep measuring every frame this long after the target last moved, then go idle. */
const SETTLE_MS = 600
/** Slow fallback check for layout shifts that fire no event (images loading, transforms). */
const POLL_MS = 400

interface GuideTheme {
  radius: number
  dim: string
  ring: string
  pulse: string
  card: string
  track: string
  fill: string
  title: string
  hint: string
  secondary: string
  primary: string
}

const THEMES: Record<GuideVariant, GuideTheme> = {
  editorial: {
    radius: 16,
    dim: 'rgba(15,23,42,0.6)',
    ring: '0 0 0 2px #fff',
    pulse: '#fff',
    card: 'bg-white rounded-3xl shadow-[0_18px_50px_rgba(15,23,42,0.28)]',
    track: 'bg-slate-100 rounded-full',
    fill: 'bg-slate-900 rounded-full',
    title: 'text-[18px] leading-snug font-bold tracking-tight text-slate-900',
    hint: 'font-semibold text-slate-900',
    secondary: 'text-[14px] font-medium text-slate-600 hover:text-slate-900',
    primary: 'px-5 text-[14px] font-semibold bg-slate-900 rounded-full hover:bg-black'
  },
  brutal: {
    radius: 0,
    dim: 'rgba(10,10,10,0.68)',
    ring: '0 0 0 4px #000',
    pulse: '#FF5500',
    card: 'bg-white border-[3px] border-black hard-shadow-black',
    track: 'bg-black/15',
    fill: 'bg-[#FF5500]',
    title: 'text-[18px] leading-snug font-black uppercase tracking-tight text-black',
    hint: 'font-semibold text-[#FF5500]',
    secondary: 'text-[14px] font-medium text-slate-600 hover:text-slate-900',
    primary: 'px-5 text-[14px] font-semibold bg-black border-2 border-black uppercase'
  },
  // Apple look: system font, large corner radius, iOS blue capsule, page dots instead of a bar
  ios: {
    radius: 24,
    dim: 'rgba(0,0,0,0.5)',
    ring: '0 0 0 2px rgba(255,255,255,0.92)',
    pulse: '#fff',
    card: 'bg-white rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.22),0_0_0_0.5px_rgba(0,0,0,0.06)] [font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif] antialiased',
    track: '',
    fill: '',
    title: 'text-[17px] leading-[22px] font-semibold tracking-[-0.41px] text-black',
    hint: 'font-medium text-[#007AFF]',
    secondary: 'text-[15px] text-[#007AFF] active:opacity-50',
    primary: 'px-6 text-[15px] font-semibold tracking-[-0.24px] bg-[#007AFF] rounded-full active:opacity-80'
  }
}

/**
 * Spotlight guide: dims the page, cuts a hole around the target, glides the hole and the card
 * from step to step, and plays an animated gesture on the target. Steps whose target is missing
 * are skipped. Every step can be skipped; Esc closes; arrow keys move.
 *
 * Performance: the hole, card and gesture are driven by motion values written straight to the
 * DOM, so following a target while the page scrolls never re-renders React. The dim layer is one
 * composited div (huge box-shadow) instead of a full-screen SVG mask, so moving it costs a
 * composite, not a repaint.
 */
export default function Guide({ steps, open, onClose, storageKey, variant = 'editorial' }: GuideProps) {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [hasBox, setHasBox] = useState(false)
  const [viewport, setViewport] = useState({ w: 0, h: 0 })
  const [mounted, setMounted] = useState(false)
  const targetEl = useRef<HTMLElement | null>(null)
  const [dir, setDir] = useState<1 | -1>(1)
  const cardRef = useRef<HTMLDivElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)

  // Tracking state lives in refs so the measure loop never needs a render
  const hasBoxRef = useRef(false)
  const cardHRef = useRef(220)
  const glideUntil = useRef(0)
  const reduceMotionRef = useRef(reduceMotion)
  const kickRef = useRef<() => void>(() => {})
  useEffect(() => {
    reduceMotionRef.current = reduceMotion
  }, [reduceMotion])

  // Hole (spotlight) and card position
  const hx = useMotionValue(0)
  const hy = useMotionValue(0)
  const hw = useMotionValue(0)
  const hh = useMotionValue(0)
  const cx = useMotionValue(0)
  const cy = useMotionValue(0)

  // Click blockers around the hole and the gesture glyph follow the hole without React
  const topH = useTransform(() => Math.max(0, hy.get()))
  const bottomTop = useTransform(() => hy.get() + hh.get())
  const leftW = useTransform(() => Math.max(0, hx.get()))
  const rightLeft = useTransform(() => hx.get() + hw.get())
  const gx = useTransform(() => hx.get() + hw.get() / 2 - 20)
  const gy = useTransform(() => hy.get() + Math.min(hh.get() / 2, hh.get() - 40))

  const step = steps[index]
  const theme = THEMES[variant]
  const ios = variant === 'ios'

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
    const startGlide = () => {
      glideUntil.current = performance.now() + GLIDE_MS
      kickRef.current()
    }
    if (!step.target) {
      startGlide()
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
        startGlide()
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

  // Follow the target. Runs per frame only while something moves (scroll, resize, step glide,
  // layout shift), then idles; a slow poll catches shifts that fire no event.
  useEffect(() => {
    if (!open) return
    let raf = 0
    let activeUntil = 0
    const last = new Map<MotionValue<number>, number>()

    const put = (mv: MotionValue<number>, value: number, glide: boolean) => {
      const v = Math.round(value * 2) / 2
      if (last.get(mv) === v) return false
      last.set(mv, v)
      if (glide) animate(mv, v, SPRING)
      else {
        mv.stop()
        mv.set(v)
      }
      return true
    }

    const measure = () => {
      raf = 0
      const now = performance.now()
      const vw = window.innerWidth
      const vh = window.innerHeight
      const el = targetEl.current
      let box: Box | null = null
      if (el && el.isConnected) {
        const r = el.getBoundingClientRect()
        box = { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 }
      }

      // Card placement: phone docks top or bottom away from the target; desktop sits beside it
      const cardH = cardHRef.current
      const cardW = vw < 640 ? vw - 24 : 360
      let cardX = (vw - cardW) / 2
      let cardY = (vh - cardH) / 2
      if (box) {
        if (vw < 640) {
          cardX = 12
          cardY = box.y + box.h / 2 > vh * 0.5 ? 12 : vh - cardH - 12
        } else {
          cardX = Math.min(Math.max(box.x + box.w / 2 - cardW / 2, 16), vw - cardW - 16)
          const below = box.y + box.h + 14
          cardY = below + cardH < vh - 12 ? below : Math.max(12, box.y - cardH - 14)
        }
      }

      const hole = box ?? { x: vw / 2, y: vh / 2, w: 0, h: 0 }
      const glide = !reduceMotionRef.current && now < glideUntil.current
      const moved = [put(hx, hole.x, glide), put(hy, hole.y, glide), put(hw, hole.w, glide), put(hh, hole.h, glide), put(cx, cardX, glide), put(cy, cardY, glide)].some(Boolean)
      if (moved) activeUntil = now + SETTLE_MS

      if (!!box !== hasBoxRef.current) {
        hasBoxRef.current = !!box
        setHasBox(!!box)
      }
      if (now < activeUntil || now < glideUntil.current) raf = requestAnimationFrame(measure)
    }

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    const kick = () => {
      activeUntil = performance.now() + SETTLE_MS
      schedule()
    }
    kickRef.current = kick

    // Open from the centre: an empty hole and a centred card, then glide to the first target
    const vw = window.innerWidth
    const vh = window.innerHeight
    const cardW = vw < 640 ? vw - 24 : 360
    put(hx, vw / 2, false)
    put(hy, vh / 2, false)
    put(hw, 0, false)
    put(hh, 0, false)
    put(cx, (vw - cardW) / 2, false)
    put(cy, (vh - cardHRef.current) / 2, false)
    kick()

    const onResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight })
      kick()
    }
    onResize()
    const poll = setInterval(schedule, POLL_MS)
    window.addEventListener('scroll', kick, { capture: true, passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(poll)
      kickRef.current = () => {}
      window.removeEventListener('scroll', kick, { capture: true })
      window.removeEventListener('resize', onResize)
    }
  }, [open, hx, hy, hw, hh, cx, cy])

  // "Do it to continue" steps: advance when the user taps the real element
  useEffect(() => {
    if (!open || step?.advanceOn !== 'click' || !hasBox) return
    const el = targetEl.current
    if (!el) return
    const onClick = () => setTimeout(() => go(1), 120)
    el.addEventListener('click', onClick, { once: true })
    return () => el.removeEventListener('click', onClick)
  }, [open, step, hasBox, go])

  // "Do the gesture to continue" steps: the page reports the gesture it recognised
  useEffect(() => {
    if (!open || step?.advanceOn !== 'action' || !step.action) return
    const onAction = (e: Event) => {
      if ((e as CustomEvent<string>).detail === step.action) setTimeout(() => go(1), 450)
    }
    window.addEventListener(ACTION_EVENT, onAction)
    return () => window.removeEventListener(ACTION_EVENT, onAction)
  }, [open, step, go])

  // Keyboard
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
      else if (e.key === 'ArrowRight' && !step?.advanceOn?.match(/click|action/)) go(1)
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
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height + 40
      if (Math.abs(h - cardHRef.current) < 1) return
      cardHRef.current = h
      glideUntil.current = performance.now() + GLIDE_MS
      kickRef.current()
    })
    ro.observe(cardRef.current)
    return () => ro.disconnect()
  }, [open])

  if (!mounted || !step) return null

  const vw = viewport.w || (typeof window !== 'undefined' ? window.innerWidth : 390)
  const cardW = vw < 640 ? vw - 24 : 360

  const spring = reduceMotion ? { duration: 0 } : SPRING
  const radius = theme.radius
  // Click and action steps open the hole so the real element takes the gesture
  const isClickStep = (step.advanceOn === 'click' || step.advanceOn === 'action') && hasBox
  const isLast = index === steps.length - 1

  // 150vmax spread covers the viewport from any hole position; the overlay clips the rest
  const spotShadow = hasBox ? `${theme.ring}, 0 0 0 150vmax ${theme.dim}` : `0 0 0 150vmax ${theme.dim}`

  const overlay = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="guide"
          className="fixed inset-0 z-[80] pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          transition={{ duration: 0.2 }}
        >
          {/* Dim layer: one div whose box-shadow darkens everything outside the hole */}
          <motion.div
            aria-hidden="true"
            className="absolute left-0 top-0 pointer-events-none"
            style={{ x: hx, y: hy, width: hw, height: hh, borderRadius: radius, boxShadow: spotShadow, willChange: 'transform' }}
          >
            {isClickStep && !reduceMotion && (
              <span className="guide-pulse absolute inset-0" style={{ borderRadius: radius, border: `3px solid ${theme.pulse}` }} />
            )}
          </motion.div>

          {/* Blockers around the hole keep the page inert; the hole itself is open only on click steps */}
          {hasBox ? (
            <>
              <motion.div className="absolute left-0 right-0 top-0 pointer-events-auto" style={{ height: topH }} />
              <motion.div className="absolute left-0 right-0 bottom-0 pointer-events-auto" style={{ top: bottomTop }} />
              <motion.div className="absolute left-0 pointer-events-auto" style={{ top: hy, height: hh, width: leftW }} />
              <motion.div className="absolute right-0 pointer-events-auto" style={{ top: hy, height: hh, left: rightLeft }} />
              {!isClickStep && <motion.div className="absolute pointer-events-auto" style={{ left: hx, top: hy, width: hw, height: hh }} />}
            </>
          ) : (
            <div className="absolute inset-0 pointer-events-auto" />
          )}

          {/* Gesture glyph over the target */}
          {hasBox && step.gesture && (
            <motion.div className="absolute left-0 top-0 pointer-events-none" style={{ x: gx, y: gy }}>
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
            className={`absolute left-0 top-0 pointer-events-auto ${theme.card} p-5`}
            style={{ width: cardW, x: cx, y: cy }}
          >
            <motion.div initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
              {ios ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    {steps.map((_, i) => (
                      <span
                        key={i}
                        className={`h-[7px] rounded-full transition-[width,background-color] duration-300 ${i === index ? 'w-[18px] bg-[#007AFF]' : 'w-[7px] bg-black/15'}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={finish}
                    aria-label="Tutup panduan"
                    className="-mr-2 -my-2 w-11 h-11 shrink-0 flex items-center justify-center cursor-pointer group"
                  >
                    <span className="w-[30px] h-[30px] rounded-full bg-[#767680]/[0.12] text-[#3c3c43]/60 flex items-center justify-center group-active:bg-[#767680]/[0.24] transition-colors">
                      <X className="w-4 h-4 stroke-[2.6]" />
                    </span>
                  </button>
                </div>
              ) : (
                <div className={`h-1 ${theme.track} overflow-hidden`}>
                  <motion.div
                    className={`h-full origin-left ${theme.fill}`}
                    initial={false}
                    animate={{ scaleX: (index + 1) / steps.length }}
                    transition={spring}
                  />
                </div>
              )}

              <div className={`${ios ? 'mt-3' : 'mt-4'} flex items-start justify-between gap-3`}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={index}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * -12 }}
                    transition={{ duration: 0.18 }}
                    className="min-w-0"
                  >
                    <h2 id="guide-title" className={theme.title}>
                      {step.title}
                    </h2>
                    <p id="guide-body" className={ios ? 'mt-1 text-[15px] leading-[20px] tracking-[-0.24px] text-[#3c3c43]/[0.6]' : 'mt-1.5 text-[15px] leading-relaxed text-slate-600'}>
                      {step.body}
                    </p>
                    {step.gesture && (
                      <p className={`mt-2 text-[13px] ${theme.hint}`}>
                        {isClickStep ? 'Coba sekarang: ' : ''}
                        {GESTURE_LABEL[step.gesture].toLowerCase()} bagian yang disorot
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
                {!ios && (
                <button
                  type="button"
                  onClick={finish}
                  aria-label="Tutup panduan"
                  className="-mr-2 -mt-2 w-10 h-10 shrink-0 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                )}
              </div>

              <div className={`${ios ? 'mt-5' : 'mt-4'} flex items-center justify-between gap-2`}>
                <span className={`text-[13px] tabular-nums ${ios ? 'sr-only' : 'text-slate-500'}`} aria-live="polite">
                  {index + 1} dari {steps.length}
                </span>
                <div className="flex items-center gap-1">
                  {index > 0 && (
                    <button type="button" onClick={() => go(-1)} className={`min-h-[44px] px-3 ${theme.secondary} cursor-pointer`}>
                      Kembali
                    </button>
                  )}
                  {isClickStep ? (
                    <button ref={primaryRef} type="button" onClick={() => go(1)} className={`min-h-[44px] px-3 ${theme.secondary} cursor-pointer`}>
                      Lewati langkah
                    </button>
                  ) : (
                    <button
                      ref={primaryRef}
                      type="button"
                      onClick={() => go(1)}
                      className={`min-h-[44px] flex items-center gap-1.5 text-white active:scale-95 transition-[transform,opacity] cursor-pointer ${theme.primary}`}
                    >
                      {isLast ? 'Selesai' : 'Lanjut'}
                      {!isLast && !ios && <ArrowRight className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(overlay, document.body)
}
