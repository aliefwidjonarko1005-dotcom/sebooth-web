'use client'

export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Image as ImageIcon, Film, Zap, Grid, ArrowLeft, Share2, Check } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { SessionData, MediaItem } from '@/types/database'
import { SeboothLoader } from "@/components/ui/SeboothLoader";

/* ─── Frame Templates ─── */
const FRAME_TEMPLATES = [
  { id: 'classic', name: 'Classic White', bg: '#ffffff', border: 'none', textColor: '#1A1A1A', subColor: '#666', subText: 'THE PREMIUM EXPERIENCE' },
  { id: 'dark', name: 'Night Edition', bg: '#1A1A1A', border: '2px solid #333', textColor: '#ffffff', subColor: '#888', subText: 'NIGHT EDITION' },
  { id: 'elegant', name: 'Wedding Elegant', bg: '#F9F6F0', border: '4px solid #D4AF37', textColor: '#002366', subColor: '#D4AF37', subText: 'WEDDING COLLECTION' },
]

type TabKey = 'strip' | 'gif' | 'live' | 'photos'

const SAVE_BUTTON =
  'mt-3 flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full bg-secondary px-6 text-[17px] font-bold text-blue-dark transition-colors hover:bg-orange-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] cursor-pointer'
const HEADER_BUTTON =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-dark text-white transition-[background-color,transform] hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-90 cursor-pointer'

/* ─── Helper: Ensure downloads strictly target original uncompressed file ─── */
function getRawOriginalUrl(url: string | undefined): string {
  if (!url) return ''
  if (url.includes('/api/image')) {
    try {
      const match = url.match(/[?&]url=([^&]+)/)
      if (match && match[1]) {
        return decodeURIComponent(match[1])
      }
    } catch {}
  }
  return url
}

/* ─── Helper: Download a file via API proxy ─── */
async function downloadFile(url: string, filename: string) {
  const cleanUrl = getRawOriginalUrl(url)
  if (cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) {
    const link = document.createElement('a')
    link.href = cleanUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    window.location.href = `/api/download?url=${encodeURIComponent(cleanUrl)}&filename=${encodeURIComponent(filename)}`
  }
}

/* ─── Mobile detection ─── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export default function SessionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string
  const supabase = createClient()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isMobile = useIsMobile()

  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('strip')
  const [frameIdx, setFrameIdx] = useState(0)
  const [totalStrips, setTotalStrips] = useState(0)
  const [generatedStripsMap, setGeneratedStripsMap] = useState<Record<number, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [stripImgError, setStripImgError] = useState(false)
  const [liveIdx, setLiveIdx] = useState(0)
  const [copiedNotification, setCopiedNotification] = useState(false)

  const generatedStripsRef = useRef<Record<number, string>>({})

  useEffect(() => {
    generatedStripsRef.current = generatedStripsMap
  }, [generatedStripsMap])

  useEffect(() => {
    setStripImgError(false)
  }, [frameIdx])

  const revokeAllStrips = useCallback(() => {
    Object.values(generatedStripsRef.current).forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    })
    setGeneratedStripsMap({})
  }, [])

  useEffect(() => {
    return () => {
      Object.values(generatedStripsRef.current).forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/login?redirect=/profile/${sessionId}`)
        return
      }

      const { data, error } = await supabase
        .from('sessions')
        .select('*, media(*)')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        router.push('/profile')
        return
      }

      setSession(data)
      setLoading(false)
    }
    init()
  }, [router, supabase, sessionId])

  /* ─── Data Helpers ─── */
  const getSortedMedia = useCallback(() => {
    if (!session?.media) return []
    return [...session.media].sort((a, b) => {
      const nameA = a.url.split('/').pop() || ''
      const nameB = b.url.split('/').pop() || ''
      return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' })
    })
  }, [session])

  const getStrip = useCallback(() => {
    const sorted = getSortedMedia()
    return sorted.find(
      (m: MediaItem) =>
        (m as any).type === 'strip' ||
        (m.metadata as Record<string, unknown>)?.is_strip ||
        m.url?.toLowerCase().includes('strip') ||
        m.url?.toLowerCase().includes('photostrip')
    ) || null
  }, [getSortedMedia])

  const getGif = useCallback(() => {
    const sorted = getSortedMedia()
    return sorted.find(
      (m: MediaItem) =>
        m.type === 'gif' ||
        m.url?.toLowerCase().includes('gif') ||
        m.url?.match(/\.gif(\?.*)?$/i)
    ) || null
  }, [getSortedMedia])

  const getLives = useCallback(() => {
    const sorted = getSortedMedia()
    return sorted.filter(
      (m: MediaItem) => {
        const isVideoExt = !!m.url?.match(/\.(mp4|webm|mov)(\?.*)?$/i)
        const isImageExt = !!m.url?.match(/\.(jpg|jpeg|png|webp|avif)(\?.*)?$/i)
        const isVideoType = m.type === 'video' || m.type === 'live'
        return isVideoExt || (isVideoType && !isImageExt)
      }
    )
  }, [getSortedMedia])

  const getLive = useCallback(() => {
    const lives = getLives()
    return lives[liveIdx] || lives[0] || null
  }, [getLives, liveIdx])

  const getPhotos = useCallback(() => {
    const sorted = getSortedMedia()
    const strip = getStrip()
    const gif = getGif()
    const lives = getLives()
    const liveIds = new Set(lives.map(l => l.id))

    return sorted.filter((m: MediaItem) => {
      const isVideoExt = !!m.url?.match(/\.(mp4|webm|mov)(\?.*)?$/i)
      const isImageExt = !!m.url?.match(/\.(jpg|jpeg|png|webp|avif)(\?.*)?$/i)
      const isNotSpecialType = m.type !== 'live' && m.type !== 'video' && m.type !== 'gif' && (m as any).type !== 'strip'
      const isImg = isImageExt || isNotSpecialType
      const isStrip = strip && m.id === strip.id
      const isGif = gif && m.id === gif.id
      const isLive = liveIds.has(m.id)
      return isImg && !isStrip && !isGif && !isVideoExt && !isLive
    })
  }, [getSortedMedia, getStrip, getGif, getLives])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: session?.event_name || 'Sebooth Session',
        text: 'Lihat koleksi foto photobooth saya di Sebooth!',
        url: window.location.href
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopiedNotification(true)
      setTimeout(() => setCopiedNotification(false), 2000)
    }
  }

  const handleDownloadAll = async () => {
    const items = session?.media || []
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const ext = item.type === 'gif' ? 'gif' : item.type === 'live' ? 'mp4' : 'jpg'
      await downloadFile(item.url, `sebooth_${i + 1}.${ext}`)
      await new Promise(r => setTimeout(r, 400))
    }
  }

  if (loading) {
    return <SeboothLoader theme="white" label="Memuat foto sesi kamu" />
  }

  if (!session) return null

  const strip = getStrip()
  const gif = getGif()
  const live = getLive()
  const photos = getPhotos()

  const tabs = [
    { key: 'strip' as const, label: 'Strip', icon: <ImageIcon className="w-4 h-4" />, available: !!(strip || photos.length >= 3) },
    { key: 'gif' as const, label: 'GIF', icon: <Film className="w-4 h-4" />, available: !!gif },
    { key: 'live' as const, label: 'Live', icon: <Zap className="w-4 h-4" />, available: !!live },
    { key: 'photos' as const, label: 'Photos', icon: <Grid className="w-4 h-4" />, available: photos.length > 0 },
  ].filter(t => t.available)

  return (
    <div className="min-h-svh bg-cream-soft text-blue-dark flex flex-col select-none">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ── Top Header Bar ── */}
      <header className="sticky top-0 z-40 bg-cream-soft px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/profile" aria-label="Kembali ke My Photos" title="Kembali ke My Photos" className={HEADER_BUTTON}>
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate font-bayon text-[1.75rem] leading-none text-primary uppercase">
            {session.event_name || `Session #${session.id.slice(0, 6)}`}
          </h1>
          <p className="mt-0.5 text-[13px] leading-snug text-slate-600">
            {new Date(session.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        <button type="button" onClick={handleShare} aria-label="Bagikan" title="Bagikan" className={HEADER_BUTTON}>
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      {/* ── Main Media Stage ── */}
      <main className="mx-auto max-w-md w-full px-4 pt-2 pb-10 flex-1 flex flex-col items-center">

        {/* Media type tabs */}
        {tabs.length > 1 && (
          <div className="mb-4 flex w-full items-center gap-1 rounded-full bg-white p-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  aria-pressed={isActive}
                  className={`relative flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    isActive ? 'text-white' : 'text-primary'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="session-tab-indicator"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </span>
                </button>
              )
            })}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STRIP TAB */}
          {activeTab === 'strip' && (
            <motion.section 
              key="strip" 
              initial={{ opacity: 0, scale: 0.96 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.96 }} 
              className="w-full flex flex-col items-center"
            >
              {strip ? (
                <div className="w-full">
                  <div className="relative w-full rounded-lg overflow-hidden flex items-center justify-center bg-blue-dark" style={{ maxHeight: '68vh', aspectRatio: '2/3' }}>
                    <img
                      src={isMobile ? `/api/image?url=${encodeURIComponent(strip.url)}&w=480&q=60` : strip.url}
                      alt="Photo Strip" 
                      className="w-full h-full object-contain" 
                      loading="lazy"
                      onError={(e) => {
                        if (e.currentTarget.src !== strip.url) {
                          e.currentTarget.src = strip.url
                        }
                      }}
                    />
                  </div>

                  <button type="button" onClick={() => downloadFile(strip.url, 'strip.jpg')} className={SAVE_BUTTON}>
                    <Download className="w-5 h-5" aria-hidden="true" />
                    Simpan Strip HD
                  </button>
                </div>
              ) : (
                <p className="py-16 text-[17px] text-slate-600">Tidak ada photo strip.</p>
              )}
            </motion.section>
          )}

          {/* GIF TAB */}
          {activeTab === 'gif' && (
            <motion.section 
              key="gif" 
              initial={{ opacity: 0, scale: 0.96 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.96 }} 
              className="w-full flex flex-col items-center"
            >
              {gif ? (
                <div className="w-full">
                  <div className="relative w-full rounded-lg overflow-hidden flex items-center justify-center bg-blue-dark" style={{ maxHeight: '68vh', aspectRatio: '9/16' }}>
                    <img src={gif.url} alt="GIF Animation" className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <button type="button" onClick={() => downloadFile(gif.url, 'animation.gif')} className={SAVE_BUTTON}>
                    <Download className="w-5 h-5" aria-hidden="true" />
                    Simpan GIF
                  </button>
                </div>
              ) : (
                <p className="py-16 text-[17px] text-slate-600">Tidak ada GIF.</p>
              )}
            </motion.section>
          )}

          {/* LIVE TAB */}
          {activeTab === 'live' && (
            <motion.section 
              key="live" 
              initial={{ opacity: 0, scale: 0.96 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.96 }} 
              className="w-full flex flex-col items-center"
            >
              {live ? (
                <div className="w-full">
                  <div className="relative w-full rounded-lg overflow-hidden flex items-center justify-center bg-blue-dark" style={{ maxHeight: '68vh', aspectRatio: '9/16' }}>
                    <video
                      key={live.url}
                      src={live.url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <button type="button" onClick={() => downloadFile(live.url, `live_photo_${liveIdx + 1}.mp4`)} className={SAVE_BUTTON}>
                    <Download className="w-5 h-5" aria-hidden="true" />
                    Simpan Live Video HD
                  </button>
                </div>
              ) : (
                <p className="py-16 text-[17px] text-slate-600">Tidak ada Live Photo.</p>
              )}
            </motion.section>
          )}

          {/* PHOTOS TAB */}
          {activeTab === 'photos' && (
            <motion.section 
              key="photos" 
              initial={{ opacity: 0, scale: 0.96 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.96 }} 
              className="w-full flex flex-col items-center"
            >
              <div className="grid grid-cols-2 gap-3 w-full">
                {photos.map((p, i) => (
                  <div key={p.id} className="relative aspect-square bg-slate-200 rounded-lg overflow-hidden">
                    <img 
                      src={isMobile ? `/api/image?url=${encodeURIComponent(p.url)}&w=480&q=60` : `/api/image?url=${encodeURIComponent(p.url)}&w=640&q=70`} 
                      alt={`Photo ${i + 1}`} 
                      className="w-full h-full object-cover" 
                      loading="lazy" 
                      onError={(e) => {
                        if (e.currentTarget.src !== p.url) {
                          e.currentTarget.src = p.url
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => downloadFile(p.url, `photo_${i + 1}.jpg`)}
                      aria-label={`Download foto ${i + 1} (ukuran asli)`}
                      title="Download (ukuran asli)"
                      className="absolute right-2 bottom-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-blue-dark text-white transition-[background-color,transform] hover:bg-primary active:scale-90"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={handleDownloadAll} className={SAVE_BUTTON}>
                <Download className="w-5 h-5" aria-hidden="true" />
                Simpan Semua Foto ({photos.length})
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Copied Toast */}
      {copiedNotification && (
        <div role="status" className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex w-max max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full bg-blue-dark px-5 py-3 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(0,17,58,0.4)] animate-fade-in">
          <Check className="w-4 h-4 shrink-0 text-secondary" aria-hidden="true" />
          <span>Link sesi berhasil disalin</span>
        </div>
      )}
    </div>
  )
}
