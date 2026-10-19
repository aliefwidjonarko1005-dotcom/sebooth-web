'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Check, ArrowRight, ExternalLink, Star, MessageCircle, Copy } from 'lucide-react'
import ExperienceDial, { MOODS } from './ExperienceDial'
import { FunnelStage, FunnelState, nextStage, readFunnel, writeFunnel } from '@/lib/reviewFunnel'
import { GOOGLE_REVIEW_URL, INSTAGRAM_HANDLE, INSTAGRAM_URL, whatsappUrl } from '@/config/social'

const TOPICS: { id: string; label: string; good: string; bad: string }[] = [
  { id: 'frame', label: 'Frame', good: 'Pilihan frame-nya estetik.', bad: 'Pilihan frame bisa lebih banyak.' },
  { id: 'print', label: 'Hasil cetak', good: 'Hasil cetaknya tajam dan warnanya bagus.', bad: 'Kualitas cetak masih bisa ditingkatkan.' },
  { id: 'crew', label: 'Staf', good: 'Stafnya ramah dan bantu arahkan pose.', bad: 'Staf bisa lebih sigap membantu.' },
  { id: 'queue', label: 'Antrean', good: 'Antreannya tertib, tidak lama menunggu.', bad: 'Antreannya terlalu lama.' },
  { id: 'softfile', label: 'Softfile', good: 'Softfile langsung bisa diunduh lewat QR.', bad: 'Softfile agak sulit diunduh.' }
]

const STEPS: { stage: Exclude<FunnelStage, 'done'>; label: string }[] = [
  { stage: 'rating', label: 'Rating' },
  { stage: 'google', label: 'Ulasan' },
  { stage: 'instagram', label: 'Instagram' }
]

function GoogleMark({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  )
}

interface ReviewFunnelProps {
  sessionId: string
  eventName?: string | null
  /** Stage to open on. Defaults to the first unfinished one. */
  initialStage?: FunnelStage
  /** Line shown on the done screen, e.g. "8 file tersimpan di perangkat". */
  doneNote?: string
  onFinish: () => void
  finishLabel?: string
}

export default function ReviewFunnel({ sessionId, eventName, initialStage, doneNote, onFinish, finishLabel = 'Tutup' }: ReviewFunnelProps) {
  const reduceMotion = useReducedMotion()
  const [state, setState] = useState<FunnelState>({})
  const [stage, setStage] = useState<FunnelStage>(initialStage ?? 'rating')
  const [rating, setRating] = useState<number | null>(null)
  const [topics, setTopics] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [draftEdited, setDraftEdited] = useState(false)
  const [copied, setCopied] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // localStorage is client-only, so the saved progress is restored after mount
    const s = readFunnel(sessionId)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(s)
    if (s.rating) setRating(s.rating - 1)
    setStage(initialStage ?? nextStage(s))
  }, [sessionId, initialStage])

  // Move focus to the stage heading so screen readers announce each step
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [stage])

  const save = (patch: Partial<FunnelState>) => setState(writeFunnel(sessionId, patch))
  const score = rating === null ? 0 : rating + 1
  const positive = score >= 3

  const goNext = (from: FunnelStage) => {
    const order: FunnelStage[] = ['rating', 'google', 'instagram', 'done']
    setStage(order[order.indexOf(from) + 1] ?? 'done')
  }

  const submitRating = () => {
    if (rating === null) return
    const ratingScore = rating + 1
    save({ rating: ratingScore, ratedAt: new Date().toISOString() })
    try {
      // Keep the legacy keys in sync for analytics and older code paths
      localStorage.setItem(`sebooth_review_${sessionId}`, JSON.stringify({ mood: MOODS[rating].key, ratingScore, submittedAt: new Date().toISOString() }))
      localStorage.setItem(`sebooth_reviewed_${sessionId}`, 'true')
    } catch {}
    goNext('rating')
  }

  const toggleTopic = (id: string) => {
    const next = topics.includes(id) ? topics.filter((t) => t !== id) : [...topics, id]
    setTopics(next)
    const topic = TOPICS.find((t) => t.id === id)!
    const sentence = positive ? topic.good : topic.bad
    if (!draftEdited) {
      setDraft(TOPICS.filter((t) => next.includes(t.id)).map((t) => (positive ? t.good : t.bad)).join(' '))
    } else if (!topics.includes(id) && !draft.includes(sentence)) {
      setDraft((d) => `${d.trim()} ${sentence}`.trim())
    }
  }

  const openGoogle = async (withCopy: boolean) => {
    if (withCopy && draft.trim()) {
      try {
        await navigator.clipboard.writeText(draft.trim())
        setCopied(true)
      } catch {}
    }
    window.open(GOOGLE_REVIEW_URL, '_blank', 'noopener,noreferrer')
    save({ googleOpenedAt: new Date().toISOString() })
  }

  const openInstagram = () => {
    window.open(INSTAGRAM_URL, '_blank', 'noopener,noreferrer')
    save({ igOpenedAt: new Date().toISOString() })
  }

  const stepIndex = stage === 'done' ? STEPS.length : STEPS.findIndex((s) => s.stage === stage)
  const variants = useMemo(
    () =>
      reduceMotion
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -18 } },
    [reduceMotion]
  )

  const primaryBtn =
    'w-full min-h-[52px] rounded-full bg-slate-900 text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-transform active:scale-[0.98] hover:bg-black disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer'
  const secondaryBtn =
    'w-full min-h-[48px] rounded-full bg-white text-slate-700 font-medium text-[14px] flex items-center justify-center gap-2 border border-slate-200 transition-colors hover:bg-slate-50 active:scale-[0.98] cursor-pointer'
  const linkBtn = 'min-h-[44px] px-4 text-[14px] font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer'

  return (
    <div className="w-full flex flex-col">
      {/* Progress: three strip frames filling left to right */}
      <div className="flex items-center gap-1.5 px-1" aria-label={`Langkah ${Math.min(stepIndex + 1, 3)} dari 3`}>
        {STEPS.map((s, i) => (
          <div key={s.stage} className="flex-1 flex flex-col gap-1.5">
            <div className="h-1 rounded-full bg-slate-200 overflow-hidden">
              <motion.div
                className="h-full bg-slate-900 origin-left"
                initial={false}
                animate={{ scaleX: i < stepIndex ? 1 : i === stepIndex ? 0.5 : 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              />
            </div>
            <span className={`text-[12px] ${i <= stepIndex ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="relative mt-4 min-h-[420px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={stage}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ type: 'spring', stiffness: 380, damping: 34, opacity: { duration: 0.16 } }}
            className="w-full flex flex-col"
          >
            {stage === 'rating' && (
              <>
                <h2 ref={headingRef} tabIndex={-1} className="text-[22px] font-bold text-slate-900 tracking-tight text-center outline-none">
                  Gimana sesi foto kamu?
                </h2>
                <p className="mt-1 text-[14px] text-slate-500 text-center">
                  {eventName ? `${eventName} · ` : ''}Satu geseran, lalu selesai.
                </p>
                <div className="mt-3">
                  <ExperienceDial value={rating} onChange={setRating} />
                </div>
                <div className="mt-3 flex flex-col items-center gap-1">
                  <button type="button" className={primaryBtn} disabled={rating === null} onClick={submitRating}>
                    <span>{rating === null ? 'Pilih rating dulu' : `Kirim rating ${score} dari 5`}</span>
                    {rating !== null && <ArrowRight className="w-4 h-4" />}
                  </button>
                  <button type="button" className={linkBtn} onClick={onFinish}>
                    Nanti saja
                  </button>
                </div>
              </>
            )}

            {stage === 'google' && (
              <>
                <div className="flex items-center gap-2">
                  <GoogleMark />
                  <div className="flex items-center gap-0.5" aria-label={`Rating kamu ${score} dari 5`}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.span
                        key={i}
                        initial={reduceMotion ? false : { scale: 0, rotate: -40 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: reduceMotion ? 0 : 0.08 + i * 0.06, type: 'spring', stiffness: 500, damping: 18 }}
                      >
                        <Star className={`w-5 h-5 ${i < score ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </motion.span>
                    ))}
                  </div>
                </div>
                <h2 ref={headingRef} tabIndex={-1} className="mt-3 text-[22px] font-bold text-slate-900 tracking-tight outline-none">
                  {positive ? 'Ceritakan juga di Google' : 'Ceritakan apa adanya di Google'}
                </h2>
                <p className="mt-1 text-[15px] text-slate-600 leading-relaxed">
                  Ulasanmu dibaca orang yang sedang mencari photobooth. Pilih {score} bintang di Google, lalu tulis dengan kata-katamu sendiri.
                </p>

                <p className="mt-4 text-[13px] font-medium text-slate-700">Bingung mulai dari mana? Ketuk topik:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TOPICS.map((t) => {
                    const on = topics.includes(t.id)
                    return (
                      <button
                        key={t.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleTopic(t.id)}
                        className={`min-h-[40px] px-4 rounded-full text-[14px] font-medium transition-colors active:scale-95 cursor-pointer ${
                          on ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    )
                  })}
                </div>

                <AnimatePresence initial={false}>
                  {draft && (
                    <motion.div
                      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <label htmlFor="review-draft" className="sr-only">
                        Draf ulasan
                      </label>
                      <textarea
                        id="review-draft"
                        value={draft}
                        onChange={(e) => {
                          setDraft(e.target.value)
                          setDraftEdited(true)
                        }}
                        rows={3}
                        className="mt-3 w-full rounded-2xl bg-slate-50 px-4 py-3 text-[15px] text-slate-900 leading-relaxed resize-none outline-none focus:ring-2 focus:ring-slate-900/15"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-4 flex flex-col gap-2">
                  {state.googleOpenedAt ? (
                    <>
                      <button type="button" className={primaryBtn} onClick={() => goNext('google')}>
                        <span>Sudah, lanjut</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button type="button" className={secondaryBtn} onClick={() => openGoogle(!!draft.trim())}>
                        <ExternalLink className="w-4 h-4" />
                        <span>Buka Google lagi</span>
                      </button>
                    </>
                  ) : (
                    <button type="button" className={primaryBtn} onClick={() => openGoogle(!!draft.trim())}>
                      {draft.trim() ? <Copy className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                      <span>{draft.trim() ? 'Salin teks dan buka Google' : 'Tulis ulasan di Google'}</span>
                    </button>
                  )}
                  {copied && <p className="text-[13px] text-emerald-700 text-center" role="status">Teks tersalin. Tempel di kolom ulasan Google.</p>}
                  {score > 0 && score <= 2 && (
                    <a
                      href={whatsappUrl(`Halo Sebooth, saya mau kasih masukan soal sesi foto ${eventName || ''} (sesi ${sessionId.slice(0, 8)}).`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={secondaryBtn}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Sampaikan kendala ke tim via WhatsApp</span>
                    </a>
                  )}
                  {!state.googleOpenedAt && (
                    <button
                      type="button"
                      className={linkBtn}
                      onClick={() => {
                        save({ googleSkipped: true })
                        goNext('google')
                      }}
                    >
                      Lewati
                    </button>
                  )}
                </div>
              </>
            )}

            {stage === 'instagram' && (
              <>
                <h2 ref={headingRef} tabIndex={-1} className="text-[22px] font-bold text-slate-900 tracking-tight outline-none">
                  Follow Sebooth di Instagram
                </h2>
                <p className="mt-1 text-[15px] text-slate-600 leading-relaxed">
                  Frame baru, hasil foto dari event lain, dan jadwal booth berikutnya, semuanya diumumkan di sana dulu.
                </p>

                <div className="mt-5 rounded-3xl bg-slate-50 p-5 flex items-center gap-4">
                  <motion.div
                    className="relative w-16 h-16 shrink-0"
                    animate={reduceMotion ? undefined : { rotate: [0, -6, 6, 0] }}
                    transition={{ duration: 0.9, delay: 0.35, ease: 'easeInOut' }}
                  >
                    <div className="absolute inset-0 rounded-full p-[3px]" style={{ background: 'conic-gradient(from 200deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5, #FEDA75)' }}>
                      <div className="w-full h-full rounded-full bg-white p-[3px]">
                        <Image src="/icon.png" alt="" width={56} height={56} className="w-full h-full rounded-full object-cover" />
                      </div>
                    </div>
                  </motion.div>
                  <div className="min-w-0">
                    <p className="text-[17px] font-semibold text-slate-900 truncate">@{INSTAGRAM_HANDLE}</p>
                    <p className="text-[14px] text-slate-500">Sebooth Photobooth · Semarang</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  {state.igOpenedAt ? (
                    <>
                      <button type="button" className={primaryBtn} onClick={() => goNext('instagram')}>
                        <span>Sudah follow, lanjut</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button type="button" className={secondaryBtn} onClick={openInstagram}>
                        <ExternalLink className="w-4 h-4" />
                        <span>Buka Instagram lagi</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className={primaryBtn} onClick={openInstagram}>
                        <span>Follow @{INSTAGRAM_HANDLE}</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className={linkBtn}
                        onClick={() => {
                          save({ igSkipped: true })
                          goNext('instagram')
                        }}
                      >
                        Lewati
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {stage === 'done' && (
              <div className="flex flex-col items-center text-center pt-6">
                <motion.div
                  initial={reduceMotion ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                  className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center"
                >
                  <Check className="w-8 h-8 stroke-[3]" />
                </motion.div>
                <h2 ref={headingRef} tabIndex={-1} className="mt-4 text-[24px] font-bold text-slate-900 tracking-tight outline-none">
                  Terima kasih, semua beres
                </h2>
                <p className="mt-1 text-[15px] text-slate-600 max-w-xs leading-relaxed">
                  {doneNote || 'Foto kamu tetap bisa dibuka lagi lewat tautan ini.'}
                </p>
                <div className="mt-6 w-full flex flex-col gap-2">
                  <button type="button" className={primaryBtn} onClick={onFinish}>
                    {finishLabel}
                  </button>
                  {(!state.googleOpenedAt || !state.igOpenedAt) && (
                    <div className="flex items-center justify-center gap-1">
                      {!state.googleOpenedAt && (
                        <button type="button" className={linkBtn} onClick={() => setStage('google')}>
                          Tulis ulasan
                        </button>
                      )}
                      {!state.igOpenedAt && (
                        <button type="button" className={linkBtn} onClick={() => setStage('instagram')}>
                          Follow Instagram
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    </div>
  )
}
