'use client'

export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2, Download, Image as ImageIcon, Film, Zap, Grid,
  AlertCircle, ChevronLeft, ChevronRight, ArrowLeft, LogOut, Home,
  Share2, Bookmark, Check, Sparkles
} from 'lucide-react'
import Link from 'next/link'
import NextImage from 'next/image'
import { createClient } from '@/lib/supabase'
import { SessionData, MediaItem } from '@/types/database'

/* ─── Frame Templates ─── */
const FRAME_TEMPLATES = [
  { id: 'classic', name: 'Classic White', bg: '#ffffff', border: 'none', textColor: '#1A1A1A', subColor: '#666', subText: 'THE PREMIUM EXPERIENCE' },
  { id: 'dark', name: 'Night Edition', bg: '#1A1A1A', border: '2px solid #333', textColor: '#ffffff', subColor: '#888', subText: 'NIGHT EDITION' },
  { id: 'elegant', name: 'Wedding Elegant', bg: '#F9F6F0', border: '4px solid #D4AF37', textColor: '#0F3D2E', subColor: '#D4AF37', subText: 'WEDDING COLLECTION' },
]

type TabKey = 'strip' | 'gif' | 'live' | 'photos'

/* ─── Helper: Download a file via API proxy ─── */
async function downloadFile(url: string, filename: string) {
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    window.location.href = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
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
      if (!user) { router.push('/login'); return }

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC]">
        <Loader2 className="h-10 w-10 animate-spin text-[#FF5500]" />
      </div>
    )
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
    <div className="min-h-[100svh] bg-[#F7F9FC] text-slate-900 flex flex-col justify-between select-none">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ── Top Header Bar ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
        <Link 
          href="/profile" 
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </Link>

        <div className="text-center flex-1 mx-3 truncate">
          <h1 className="text-base font-black font-bayon uppercase text-[#111827] truncate">
            {session.event_name || `Session #${session.id.slice(0, 6)}`}
          </h1>
          <p className="text-[10px] font-semibold text-slate-500">
            {new Date(session.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition-all"
            title="Bagikan"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Main Media Stage ── */}
      <main className="mx-auto max-w-md w-full px-4 pt-4 pb-28 flex-1 flex flex-col items-center">
        
        {/* Segmented Media Tab Filter */}
        {tabs.length > 1 && (
          <div className="w-full bg-slate-200/70 p-1 rounded-full flex items-center gap-1 mb-4 shadow-inner">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-1.5 rounded-full flex items-center justify-center gap-1.5 text-xs font-black font-bayon uppercase tracking-wider transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-[#FF5500] shadow-md scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
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
                <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-200/80 p-2 flex flex-col items-center">
                  <div className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center bg-slate-950" style={{ maxHeight: '68vh', aspectRatio: '9/16' }}>
                    <img src={strip.url} alt="Photo Strip" className="w-full h-full object-contain" />
                  </div>

                  <div className="w-full mt-3 flex items-center justify-between gap-2 px-1">
                    <button 
                      onClick={() => downloadFile(strip.url, 'strip.jpg')} 
                      className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#FF5500] to-[#FF2200] hover:opacity-95 active:scale-95 text-white font-black font-bayon uppercase text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <Download className="w-4 h-4" /> 
                      <span>Simpan Strip HD</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 font-semibold py-16 text-sm">Tidak ada photo strip.</p>
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
                <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-200/80 p-2 flex flex-col items-center">
                  <div className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center bg-slate-950" style={{ maxHeight: '68vh', aspectRatio: '9/16' }}>
                    <img src={gif.url} alt="GIF Animation" className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <button 
                    onClick={() => downloadFile(gif.url, 'animation.gif')} 
                    className="w-full mt-3 py-3 rounded-full bg-gradient-to-r from-[#FF5500] to-[#FF2200] hover:opacity-95 active:scale-95 text-white font-black font-bayon uppercase text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <Download className="w-4 h-4" /> 
                    <span>Simpan GIF Animation</span>
                  </button>
                </div>
              ) : (
                <p className="text-slate-400 font-semibold py-16 text-sm">Tidak ada GIF.</p>
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
                <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-200/80 p-2 flex flex-col items-center">
                  <div className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center bg-slate-950" style={{ maxHeight: '68vh', aspectRatio: '9/16' }}>
                    <video
                      key={live.url}
                      autoPlay loop muted playsInline
                      className="w-full h-full object-contain"
                    >
                      <source src={live.url} type="video/mp4" />
                    </video>
                  </div>
                  <button 
                    onClick={() => downloadFile(live.url, `live_photo_${liveIdx + 1}.mp4`)} 
                    className="w-full mt-3 py-3 rounded-full bg-gradient-to-r from-[#FF5500] to-[#FF2200] hover:opacity-95 active:scale-95 text-white font-black font-bayon uppercase text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <Download className="w-4 h-4" /> 
                    <span>Simpan Live Video HD</span>
                  </button>
                </div>
              ) : (
                <p className="text-slate-400 font-semibold py-16 text-sm">Tidak ada Live Photo.</p>
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
                  <div key={p.id} className="relative group aspect-square bg-slate-900 rounded-2xl overflow-hidden shadow-md border border-slate-200/80">
                    <img src={p.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    <button
                      onClick={() => downloadFile(p.url, `photo_${i + 1}.jpg`)}
                      className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/75 backdrop-blur-md flex items-center justify-center text-white hover:bg-orange-600 active:scale-90 transition-all shadow-md"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={handleDownloadAll} 
                className="mt-5 w-full py-3.5 rounded-full bg-[#181B34] hover:bg-black active:scale-95 text-white font-black font-bayon uppercase text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Download className="w-4 h-4" /> 
                <span>Simpan Semua Foto ({photos.length})</span>
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Copied Toast */}
      {copiedNotification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-black/85 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg border border-white/20 flex items-center gap-1.5 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Link sesi berhasil disalin!</span>
        </div>
      )}
    </div>
  )
}
