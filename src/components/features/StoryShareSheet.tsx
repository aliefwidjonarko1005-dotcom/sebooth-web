'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Check, ChevronLeft, Download, Loader2, RefreshCw, Share2, X } from 'lucide-react'
import { INSTAGRAM_HANDLE } from '@/config/social'

export interface StoryPhoto {
  id: string
  /** Raw media URL (allowlisted GCS / Supabase); fetched through our own proxies so the canvas stays clean */
  url: string
  label: string
}

interface StoryShareSheetProps {
  open: boolean
  photos: StoryPhoto[]
  initialPhotoId?: string
  sessionId: string
  eventName: string | null
  onClose: () => void
  onToast: (msg: string) => void
}

const W = 1080
const H = 1920
const BG = '#F4F1EA'
const INK = '#14213D'
const MENTION = `@${INSTAGRAM_HANDLE}`

let logoPromise: Promise<HTMLImageElement> | null = null
function loadLogo() {
  logoPromise ??= new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = '/images/logo/logo-navy.png'
  })
  return logoPromise
}

/** Same-origin fetch first (resized), then the download proxy; never the raw cross-origin URL. */
async function loadPhoto(url: string): Promise<ImageBitmap> {
  const sources = [
    `/api/image?url=${encodeURIComponent(url)}&w=1080&q=90`,
    `/api/download?url=${encodeURIComponent(url)}&filename=story.jpg`,
  ]
  for (const src of sources) {
    try {
      const res = await fetch(src)
      if (!res.ok) continue
      const blob = await res.blob()
      if (!blob.type.startsWith('image/')) continue
      return await createImageBitmap(blob)
    } catch {}
  }
  throw new Error('photo unavailable')
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, maxLines)
}

/** Draws the 9:16 story: logo on top, the photo on a white card, the caption, then the mention. */
function drawStory(canvas: HTMLCanvasElement, photo: ImageBitmap, logo: HTMLImageElement, caption: string, font: string) {
  const ctx = canvas.getContext('2d')!
  canvas.width = W
  canvas.height = H
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, W, H)

  // Logo
  const logoW = 260
  const logoH = (logo.height / logo.width) * logoW
  ctx.drawImage(logo, (W - logoW) / 2, 110, logoW, logoH)

  // Photo card, fitted inside the box without cropping (strips are tall, poses are 3:4)
  const boxTop = 110 + logoH + 70
  const boxBottom = H - 470
  const maxW = W - 180
  const maxH = boxBottom - boxTop
  const scale = Math.min(maxW / photo.width, maxH / photo.height)
  const pw = photo.width * scale
  const ph = photo.height * scale
  const px = (W - pw) / 2
  const py = boxTop + (maxH - ph) / 2
  // White mat on the warm ground: a tone step, no drop shadow
  const pad = 22
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.roundRect(px - pad, py - pad, pw + pad * 2, ph + pad * 2, 28)
  ctx.fill()
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(px, py, pw, ph, 14)
  ctx.clip()
  ctx.drawImage(photo, px, py, pw, ph)
  ctx.restore()

  // Caption
  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `600 54px ${font}`
  const lines = wrapLines(ctx, caption, W - 200, 3)
  const captionTop = boxBottom + 120
  lines.forEach((l, i) => ctx.fillText(l, W / 2, captionTop + i * 70))

  // Mention
  ctx.font = `500 40px ${font}`
  ctx.fillStyle = 'rgba(20, 33, 61, 0.62)'
  ctx.fillText(`foto di ${MENTION}`, W / 2, H - 120)
}

export default function StoryShareSheet({ open, photos, initialPhotoId, sessionId, eventName, onClose, onToast }: StoryShareSheetProps) {
  const reduceMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [photoId, setPhotoId] = useState<string | undefined>(initialPhotoId)
  const [captions, setCaptions] = useState<string[]>([])
  const [captionIdx, setCaptionIdx] = useState(0)
  const [caption, setCaption] = useState('')
  const [loadingCaptions, setLoadingCaptions] = useState(false)
  const [rendering, setRendering] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shared, setShared] = useState(false)
  const blobRef = useRef<Blob | null>(null)

  useEffect(() => {
    if (open) {
      setPhotoId(initialPhotoId || photos[0]?.id)
      setShared(false)
    }
  }, [open, initialPhotoId, photos])

  useEffect(() => {
    if (!open) return
    // Keyboard and screen-reader users land inside the sheet, not behind it
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Captions: once per session, kept for the tab so reopening the sheet costs no extra AI call
  const fetchCaptions = useCallback(async (force = false) => {
    const key = `sebooth_story_captions_${sessionId}`
    if (!force) {
      try {
        const cached = sessionStorage.getItem(key)
        if (cached) {
          const list = JSON.parse(cached) as string[]
          setCaptions(list)
          setCaptionIdx(0)
          setCaption(list[0] || '')
          return
        }
      } catch {}
    }
    setLoadingCaptions(true)
    try {
      const res = await fetch('/api/ai/story-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName }),
      })
      const data = await res.json()
      const list: string[] = Array.isArray(data?.captions) && data.captions.length ? data.captions : ['Kenang-kenangan kecil dari hari ini.']
      setCaptions(list)
      setCaptionIdx(0)
      setCaption(list[0])
      try {
        sessionStorage.setItem(key, JSON.stringify(list))
      } catch {}
    } catch {
      setCaption((c) => c || 'Kenang-kenangan kecil dari hari ini.')
    } finally {
      setLoadingCaptions(false)
    }
  }, [sessionId, eventName])

  useEffect(() => {
    if (open && captions.length === 0) fetchCaptions()
  }, [open, captions.length, fetchCaptions])

  // Re-render the story whenever the photo or caption changes (caption typing is debounced).
  // An empty caption is allowed once the suggestions have arrived: the guest may want none.
  const captionReady = captions.length > 0 || caption.length > 0
  useEffect(() => {
    if (!open || !photoId || !captionReady) return
    const photo = photos.find((p) => p.id === photoId)
    if (!photo) return
    let cancelled = false
    // Busy from the first keystroke, so Share never sends the image of an older caption
    setRendering(true)
    const t = setTimeout(async () => {
      setError(null)
      try {
        const [bitmap, logo] = await Promise.all([loadPhoto(photo.url), loadLogo()])
        if (cancelled || !canvasRef.current) return
        const font = getComputedStyle(document.body).fontFamily || 'sans-serif'
        drawStory(canvasRef.current, bitmap, logo, caption, font)
        const blob = await new Promise<Blob | null>((r) => canvasRef.current!.toBlob(r, 'image/png'))
        if (cancelled || !blob) return
        blobRef.current = blob
        setPreviewUrl((old) => {
          if (old) URL.revokeObjectURL(old)
          return URL.createObjectURL(blob)
        })
      } catch {
        if (!cancelled) setError('Foto ini belum bisa dijadikan Story. Coba pilih foto lain.')
      } finally {
        if (!cancelled) setRendering(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [open, photoId, caption, captionReady, photos])

  useEffect(() => {
    if (!open) {
      setPreviewUrl((old) => {
        if (old) URL.revokeObjectURL(old)
        return null
      })
      blobRef.current = null
    }
  }, [open])

  const nextCaption = () => {
    if (captions.length > 1) {
      const i = (captionIdx + 1) % captions.length
      setCaptionIdx(i)
      setCaption(captions[i])
    } else {
      fetchCaptions(true)
    }
  }

  const fileName = `Sebooth_Story_${sessionId.slice(0, 6)}.png`
  const shareText = `${caption} ${MENTION}`.trim()

  const saveImage = () => {
    if (!previewUrl) return
    const a = document.createElement('a')
    a.href = previewUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleShare = async () => {
    const blob = blobRef.current
    if (!blob) return
    // Instagram does not let a website add the tag itself; the copied text carries the mention
    try {
      await navigator.clipboard.writeText(shareText)
    } catch {}
    const file = new File([blob], fileName, { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: shareText })
        setShared(true)
        return
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }
    saveImage()
    setShared(true)
    onToast('Gambar Story tersimpan. Teks dan tag sudah disalin.')
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-slate-950/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-sheet-title"
            className={/* taste-skill-ignore: real overlay, same lift as DownloadChoiceSheet */ "relative w-full sm:max-w-[440px] max-h-[94svh] overflow-y-auto overscroll-contain bg-white rounded-t-[28px] sm:rounded-[28px] px-5 pt-5 pb-[max(20px,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(15,23,42,0.18)]"}
            initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100%', transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="story-sheet-title" className="text-[17px] font-bold text-slate-900">
                  {shared ? 'Tinggal posting' : 'Bikin Story Instagram'}
                </h2>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                  {shared
                    ? `Di Instagram, tempel teks yang sudah disalin supaya ${MENTION} ikut ter-tag.`
                    : 'Pilih foto, cek captionnya, lalu bagikan.'}
                </p>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Tutup"
                className="w-10 h-10 -mr-2 -mt-1 shrink-0 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="mt-4 mx-auto w-[56%] aspect-[9/16] rounded-2xl overflow-hidden bg-[#F4F1EA] border border-slate-200 relative">
              {previewUrl && <img src={previewUrl} alt="Pratinjau Story" className="w-full h-full object-cover" />}
              {(rendering || loadingCaptions || !previewUrl) && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                  <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
                </div>
              )}
              {error && (
                <p className="absolute inset-0 flex items-center justify-center p-4 text-center text-[13px] text-slate-600">{error}</p>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />

            {shared ? (
              <div className="mt-5 space-y-3">
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-[14px] text-slate-700">{shareText}</div>
                <button
                  onClick={() => setShared(false)}
                  className="w-full min-h-[48px] rounded-full border border-slate-300 text-slate-800 text-[15px] font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Ubah lagi
                </button>
              </div>
            ) : (
              <>
                {/* Photo picker */}
                {photos.length > 1 && (
                  <div className="mt-4">
                    <p className="text-[13px] font-medium text-slate-700 mb-2">Foto</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {photos.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPhotoId(p.id)}
                          aria-label={`Pakai ${p.label}`}
                          aria-pressed={p.id === photoId}
                          className={`relative shrink-0 w-14 h-[74px] rounded-lg overflow-hidden border-2 cursor-pointer ${
                            p.id === photoId ? 'border-slate-900' : 'border-transparent opacity-70'
                          }`}
                        >
                          <img src={`/api/image?url=${encodeURIComponent(p.url)}&w=160&q=60`} alt={p.label}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              if (e.currentTarget.src !== p.url) e.currentTarget.src = p.url
                            }}
                          />
                          {p.id === photoId && (
                            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Caption */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="story-caption" className="text-[13px] font-medium text-slate-700">Caption</label>
                    <button
                      onClick={nextCaption}
                      disabled={loadingCaptions}
                      className="min-h-[44px] -my-3 -mr-2 px-2 text-[13px] text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingCaptions ? 'animate-spin' : ''}`} /> Ganti
                    </button>
                  </div>
                  <input
                    id="story-caption"
                    value={caption}
                    maxLength={90}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full min-h-[46px] rounded-xl border border-slate-300 px-3.5 text-[15px] text-slate-900 focus:outline-none focus:border-slate-900"
                    placeholder="Tulis caption"
                  />
                  <p className="mt-1.5 text-[12px] text-slate-500">{MENTION} otomatis ikut di gambar dan teks yang disalin.</p>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={saveImage}
                    disabled={!previewUrl || rendering}
                    className="min-h-[50px] px-4 rounded-full border border-slate-300 text-slate-800 flex items-center justify-center cursor-pointer disabled:opacity-50"
                    aria-label="Simpan gambar"
                    title="Simpan gambar"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleShare}
                    disabled={!previewUrl || rendering}
                    className="flex-1 min-h-[50px] rounded-full bg-slate-900 text-white text-[15px] font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98] transition-transform"
                  >
                    <Share2 className="w-4 h-4" /> Bagikan ke Story
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
