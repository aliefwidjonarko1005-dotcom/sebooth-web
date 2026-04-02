'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LogOut, Loader2, Download, Image, Film, Zap, Grid, 
  ChevronDown, AlertCircle, ChevronLeft, ChevronRight, Home
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { SessionData, MediaItem } from '@/types/database'

/* ─── Frame Templates ─── */
const FRAME_TEMPLATES = [
  { id: 'classic', name: 'Classic White', bg: '#ffffff', border: 'none', textColor: '#1A1A1A', subColor: '#666', subText: 'THE PREMIUM EXPERIENCE' },
  { id: 'dark', name: 'Night Edition', bg: '#1A1A1A', border: '2px solid #333', textColor: '#ffffff', subColor: '#888', subText: 'NIGHT EDITION' },
  { id: 'elegant', name: 'Wedding Elegant', bg: '#F9F6F0', border: '4px solid #D4AF37', textColor: '#0F3D2E', subColor: '#D4AF37', subText: 'WEDDING COLLECTION' },
]

type TabKey = 'strip' | 'gif' | 'live' | 'photos'

/* ─── Helper: Download a file via fetch + blob ─── */
async function downloadFile(url: string, filename: string) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
  } catch {
    window.open(url, '_blank')
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string | null>(null)
  const [activeSession, setActiveSession] = useState<SessionData | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('strip')
  const [showSessionPicker, setShowSessionPicker] = useState(false)
  const [frameIdx, setFrameIdx] = useState(0)
  const [generatedStrips, setGeneratedStrips] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserName(user.email?.split('@')[0] || 'User')

      const { data, error } = await supabase
        .from('sessions')
        .select('*, media(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setSessions(data)
        if (data.length > 0) setActiveSession(data[0])
      }
      setLoading(false)
    }
    init()
  }, [router, supabase])

  /* ─── Data Helpers ─── */
  const getStrip = useCallback(() => {
    return activeSession?.media?.find(
      (m: MediaItem) => (m.metadata as Record<string, unknown>)?.is_strip || m.url?.toLowerCase().includes('strip.jpg')
    ) || null
  }, [activeSession])

  const getGif = useCallback(() => {
    return activeSession?.media?.find(
      (m: MediaItem) => m.type === 'gif' || m.url?.toLowerCase().includes('animation.gif')
    ) || null
  }, [activeSession])

  const getLive = useCallback(() => {
    return activeSession?.media?.find(
      (m: MediaItem) => m.type === 'live' || m.url?.toLowerCase().includes('live.mp4')
    ) || null
  }, [activeSession])

  const getPhotos = useCallback(() => {
    if (!activeSession?.media) return []
    const strip = getStrip()
    const gif = getGif()
    return activeSession.media.filter((m: MediaItem) => {
      const isImg = m.url?.match(/\.(jpg|jpeg|png|webp)/i)
      const isStrip = strip && m.id === strip.id
      const isGif = gif && m.id === gif.id
      return isImg && !isStrip && !isGif
    })
  }, [activeSession, getStrip, getGif])

  /* ─── Auto-generate strips for all frame templates ─── */
  useEffect(() => {
    if (activeTab === 'strip' && activeSession) {
      generateAllStrips()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeSession])

  const generateAllStrips = async () => {
    const photos = getPhotos()
    if (photos.length < 3) {
      const strip = getStrip()
      if (strip) setGeneratedStrips([strip.url])
      return
    }

    setIsGenerating(true)
    const strips: string[] = []
    
    const origStrip = getStrip()
    if (origStrip) strips.push(origStrip.url)

    for (const template of FRAME_TEMPLATES) {
      try {
        const url = await renderStripOnCanvas(photos.slice(0, 3), template)
        if (url) strips.push(url)
      } catch (e) {
        console.error('Strip generation failed for', template.id, e)
      }
    }

    setGeneratedStrips(strips)
    setIsGenerating(false)
  }

  const renderStripOnCanvas = async (
    photos: MediaItem[],
    template: typeof FRAME_TEMPLATES[0]
  ): Promise<string | null> => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const W = 1080
    const H = 1920
    canvas.width = W
    canvas.height = H

    const PADDING = 40
    const GAP = 30
    const SLOT_W = W - PADDING * 2
    const SLOT_H = Math.round(SLOT_W * (9 / 16))

    ctx.fillStyle = template.bg
    ctx.fillRect(0, 0, W, H)

    const loadImage = async (src: string): Promise<HTMLImageElement> => {
      try {
        // Fetch to bypass browser cache opaque responses and avoid tainted canvases
        const res = await fetch(src, { cache: 'no-store', mode: 'cors' })
        if (!res.ok) throw new Error('Network response was not ok')
        const blob = await res.blob()
        const blobUrl = URL.createObjectURL(blob)
        return new Promise((resolve, reject) => {
          const img = new window.Image()
          img.onload = () => { resolve(img); URL.revokeObjectURL(blobUrl) }
          img.onerror = () => { reject(); URL.revokeObjectURL(blobUrl) }
          img.src = blobUrl
        })
      } catch (e) {
        // Fallback: If CORS fails (e.g. GCS not configured), use Next.js internal image proxy
        const proxyUrl = `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=75`
        return new Promise((resolve, reject) => {
          const img = new window.Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = proxyUrl
        })
      }
    }

    for (let i = 0; i < Math.min(photos.length, 3); i++) {
      const x = PADDING
      const y = PADDING + i * (SLOT_H + GAP)

      if (template.border !== 'none') {
        ctx.strokeStyle = template.border.split(' ').pop() || '#333'
        ctx.lineWidth = parseInt(template.border) || 2
        ctx.strokeRect(x - 2, y - 2, SLOT_W + 4, SLOT_H + 4)
      }

      try {
        const img = await loadImage(photos[i].url)
        const imgAspect = img.width / img.height
        const slotAspect = SLOT_W / SLOT_H
        let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height
        if (imgAspect > slotAspect) {
          srcW = img.height * slotAspect
          srcX = (img.width - srcW) / 2
        } else {
          srcH = img.width / slotAspect
          srcY = (img.height - srcH) / 2
        }
        ctx.drawImage(img, srcX, srcY, srcW, srcH, x, y, SLOT_W, SLOT_H)
      } catch {
        ctx.fillStyle = '#ddd'
        ctx.fillRect(x, y, SLOT_W, SLOT_H)
      }
    }

    const BRANDING_H = H - (PADDING + (SLOT_H + GAP) * 3 - GAP + PADDING)
    const brandY = PADDING + 3 * (SLOT_H + GAP) + BRANDING_H / 2
    ctx.textAlign = 'center'
    ctx.font = 'bold 56px Arial, sans-serif'
    ctx.fillStyle = template.textColor
    ctx.fillText('SEBOOTH', W / 2, brandY - 10)
    ctx.font = '24px Arial, sans-serif'
    ctx.fillStyle = template.subColor
    ctx.fillText(template.subText, W / 2, brandY + 30)

    return canvas.toDataURL('image/jpeg', 0.92)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDownloadAll = async () => {
    const items = activeSession?.media || []
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const ext = item.type === 'gif' ? 'gif' : item.type === 'live' ? 'mp4' : 'jpg'
      await downloadFile(item.url, `sebooth_${i + 1}.${ext}`)
      await new Promise(r => setTimeout(r, 400))
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F9F9]">
        <Loader2 className="h-10 w-10 animate-spin text-[#0F3D2E]" />
      </div>
    )
  }

  const strip = getStrip()
  const gif = getGif()
  const live = getLive()
  const photos = getPhotos()

  const tabs = [
    { key: 'strip' as const, label: 'Strip', icon: <Image className="w-5 h-5" />, available: !!(strip || photos.length >= 3) },
    { key: 'gif' as const, label: 'GIF', icon: <Film className="w-5 h-5" />, available: !!gif },
    { key: 'live' as const, label: 'Live', icon: <Zap className="w-5 h-5" />, available: !!live },
    { key: 'photos' as const, label: 'Photos', icon: <Grid className="w-5 h-5" />, available: photos.length > 0 },
  ].filter(t => t.available)

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Minimal Header */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#1A1A1A]/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#1A1A1A]/60 hover:text-[#0F3D2E] transition-colors text-sm font-medium">
            <Home className="h-4 w-4" /> Beranda
          </Link>
          <span className="font-bold text-[#1A1A1A] tracking-tight text-lg">My Photos</span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-[#1A1A1A]/50 hover:text-red-600 transition-colors">
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </nav>

      {/* Header */}
      <header className="text-center pt-10 pb-4 px-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
          Halo, {userName}! 👋
        </h1>
        
        {sessions.length > 1 && (
          <div className="relative mt-4 inline-block">
            <button 
              onClick={() => setShowSessionPicker(!showSessionPicker)}
              className="flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-medium text-[#1A1A1A]/70 border border-[#1A1A1A]/10 hover:border-[#0F3D2E] transition-all shadow-sm"
            >
              {activeSession?.event_name || 'Sebooth Session'} 
              <ChevronDown className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showSessionPicker && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 rounded-2xl bg-white border border-[#1A1A1A]/10 shadow-2xl overflow-hidden z-50"
                >
                  {sessions.map(s => (
                    <button key={s.id} onClick={() => { setActiveSession(s); setShowSessionPicker(false) }}
                      className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors ${activeSession?.id === s.id ? 'bg-[#0F3D2E]/10 text-[#0F3D2E] font-bold' : 'text-[#1A1A1A]/60 hover:bg-[#F9F9F9]'}`}
                    >
                      {s.event_name || 'Sebooth Session'}
                      <span className="block text-[10px] font-medium text-[#1A1A1A]/30 mt-0.5">
                        {new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {sessions.length === 1 && (
          <p className="mt-2 text-[#1A1A1A]/40 text-xs font-medium uppercase tracking-widest">
            {activeSession?.event_name || 'Sebooth Session'} · {activeSession && new Date(activeSession.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </header>

      {/* Content Area */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center pt-20 px-6">
          <div className="h-24 w-24 rounded-3xl bg-[#1A1A1A]/5 flex items-center justify-center"><Grid className="h-12 w-12 text-[#1A1A1A]/15" /></div>
          <h3 className="mt-6 text-xl font-bold text-[#1A1A1A]">Belum Ada Koleksi</h3>
          <p className="mt-2 text-[#1A1A1A]/40 max-w-xs text-sm">Scan QR code di Sebooth untuk mulai mengisi galerimu!</p>
        </div>
      ) : (
        <main className="mx-auto max-w-lg px-5 pt-6 pb-40">
          <AnimatePresence mode="wait">
            {/* STRIP TAB */}
            {activeTab === 'strip' && (
              <motion.section key="strip" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
                {isGenerating ? (
                  <div className="flex flex-col items-center py-20 text-[#1A1A1A]/40">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="font-medium text-sm">Membuat template...</p>
                  </div>
                ) : generatedStrips.length > 0 ? (
                  <>
                    <div className="relative w-full">
                      <div className="w-full rounded-3xl overflow-hidden bg-white shadow-xl ring-1 ring-[#1A1A1A]/5">
                        <img src={generatedStrips[frameIdx % generatedStrips.length]} alt="Photo Strip" className="w-full object-contain max-h-[65vh]" />
                      </div>
                      {generatedStrips.length > 1 && (
                        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 pointer-events-none">
                          <button onClick={() => setFrameIdx(prev => prev === 0 ? generatedStrips.length - 1 : prev - 1)} className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-[#1A1A1A] hover:bg-white transition-all">
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button onClick={() => setFrameIdx(prev => (prev + 1) % generatedStrips.length)} className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-[#1A1A1A] hover:bg-white transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                    {generatedStrips.length > 1 && (
                      <div className="flex gap-2 mt-4">
                        {generatedStrips.map((_, i) => (
                          <button key={i} onClick={() => setFrameIdx(i)} className={`h-2 rounded-full transition-all ${i === frameIdx % generatedStrips.length ? 'bg-[#0F3D2E] w-6' : 'bg-[#1A1A1A]/15 w-2'}`} />
                        ))}
                      </div>
                    )}
                    <button onClick={() => downloadFile(generatedStrips[frameIdx % generatedStrips.length], `strip_${frameIdx + 1}.jpg`)} 
                      className="mt-6 w-full py-4 rounded-2xl bg-[#0F3D2E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-[#195240] active:scale-[0.98] transition-all">
                      <Download className="w-5 h-5" /> Simpan Strip
                    </button>
                  </>
                ) : strip ? (
                  <>
                    <div className="w-full rounded-3xl overflow-hidden bg-white shadow-xl ring-1 ring-[#1A1A1A]/5">
                      <img src={strip.url} alt="Photo Strip" className="w-full object-contain max-h-[65vh]" />
                    </div>
                    <button onClick={() => downloadFile(strip.url, 'strip.jpg')} className="mt-6 w-full py-4 rounded-2xl bg-[#0F3D2E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-[#195240] active:scale-[0.98] transition-all">
                      <Download className="w-5 h-5" /> Simpan Strip
                    </button>
                  </>
                ) : (
                  <p className="text-[#1A1A1A]/40 py-20 text-sm">Tidak ada photo strip.</p>
                )}
              </motion.section>
            )}

            {/* GIF TAB */}
            {activeTab === 'gif' && (
              <motion.section key="gif" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
                {gif ? (
                  <>
                    <div className="w-full rounded-3xl overflow-hidden bg-white shadow-xl ring-1 ring-[#1A1A1A]/5">
                      <img src={gif.url} alt="GIF Animation" className="w-full object-contain max-h-[65vh]" />
                    </div>
                    <button onClick={() => downloadFile(gif.url, 'animation.gif')} className="mt-6 w-full py-4 rounded-2xl bg-[#0F3D2E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-[#195240] active:scale-[0.98] transition-all">
                      <Download className="w-5 h-5" /> Simpan GIF
                    </button>
                  </>
                ) : (
                  <p className="text-[#1A1A1A]/40 py-20 text-sm">Tidak ada GIF.</p>
                )}
              </motion.section>
            )}

            {/* LIVE TAB */}
            {activeTab === 'live' && (
              <motion.section key="live" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
                {live ? (
                  <>
                    <div className="w-full rounded-3xl overflow-hidden bg-white shadow-xl ring-1 ring-[#1A1A1A]/5">
                      <video 
                        key={live.url}
                        autoPlay loop muted playsInline 
                        className="w-full object-contain max-h-[65vh]"
                        onError={(e) => {
                          const target = e.currentTarget
                          target.style.display = 'none'
                          const fallback = target.parentElement?.querySelector('.video-fallback') as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      >
                        <source src={live.url} type="video/mp4" />
                      </video>
                      <div className="video-fallback hidden flex-col items-center justify-center py-16 text-[#1A1A1A]/30" style={{ display: 'none' }}>
                        <AlertCircle className="w-10 h-10 mb-3" />
                        <p className="font-bold text-sm">Video gagal dimuat</p>
                        <p className="text-xs mt-1">File mungkin rusak atau belum selesai</p>
                      </div>
                    </div>
                    <button onClick={() => downloadFile(live.url, 'live_photo.mp4')} className="mt-6 w-full py-4 rounded-2xl bg-[#0F3D2E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-[#195240] active:scale-[0.98] transition-all">
                      <Download className="w-5 h-5" /> Simpan Live Photo
                    </button>
                  </>
                ) : (
                  <p className="text-[#1A1A1A]/40 py-20 text-sm">Tidak ada Live Photo.</p>
                )}
              </motion.section>
            )}

            {/* PHOTOS TAB */}
            {activeTab === 'photos' && (
              <motion.section key="photos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((p, i) => (
                    <div key={p.id} className="relative group aspect-square rounded-2xl overflow-hidden bg-white shadow-md ring-1 ring-[#1A1A1A]/5">
                      <img src={p.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <button 
                        onClick={() => downloadFile(p.url, `photo_${i + 1}.jpg`)}
                        className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center text-[#1A1A1A] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={handleDownloadAll} className="mt-6 w-full py-4 rounded-2xl bg-[#0F3D2E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-[#195240] active:scale-[0.98] transition-all">
                  <Download className="w-5 h-5" /> Simpan Semua Foto
                </button>
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      )}

      {/* Bottom Nav Pill */}
      {sessions.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[360px] z-40">
          <div className="flex p-1.5 rounded-[32px] bg-white border border-[#1A1A1A]/10 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
            {tabs.map(tab => (
              <button 
                key={tab.key} 
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-[28px] transition-all duration-300 ${
                  activeTab === tab.key 
                    ? 'text-[#0F3D2E] bg-[#0F3D2E]/10 font-bold' 
                    : 'text-[#1A1A1A]/35 hover:text-[#1A1A1A]/60'
                }`}
              >
                {tab.icon}
                <span className="text-[9px] font-extrabold uppercase tracking-[1px]">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center pb-28 pt-8">
        <p className="text-[10px] text-[#1A1A1A]/20 font-medium">Powered by Sebooth</p>
      </footer>
    </div>
  )
}
