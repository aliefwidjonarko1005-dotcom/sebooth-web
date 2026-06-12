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
import { SessionData, MediaItem, QueueTicket } from '@/types/database'
import ActiveQueueCard from '@/components/queue/ActiveQueueCard'

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

/* ─── Mobile detection for canvas optimization ─── */
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

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isMobile = useIsMobile()
  
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string | null>(null)
  const [activeSession, setActiveSession] = useState<SessionData | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('strip')
  const [showSessionPicker, setShowSessionPicker] = useState(false)
  const [frameIdx, setFrameIdx] = useState(0)
  const [totalStrips, setTotalStrips] = useState(0)
  const [generatedStripsMap, setGeneratedStripsMap] = useState<Record<number, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTickets, setActiveTickets] = useState<QueueTicket[]>([])

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

      // Fetch active queue tickets
      const { data: ticketsData } = await supabase
        .from('queue_tickets')
        .select('*, queue_events(*)')
        .eq('user_id', user.id)
        .in('status', ['waiting', 'called', 'in_session'])
        .order('created_at', { ascending: false })

      if (ticketsData) {
        // Filter out ghost tickets belonging to deactivated events
        const validTickets = ticketsData.filter(t => t.queue_events?.is_active)
        setActiveTickets(validTickets)
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

  /* ─── Lazy Generate Strips ─── */
  useEffect(() => {
    if (activeTab === 'strip' && activeSession) {
      const photos = getPhotos()
      const orig = getStrip()
      const total = photos.length < 3 ? (orig ? 1 : 0) : (orig ? FRAME_TEMPLATES.length + 1 : FRAME_TEMPLATES.length)
      setTotalStrips(total)
      setGeneratedStripsMap({})
      setFrameIdx(0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeSession])

  useEffect(() => {
    if (activeTab !== 'strip' || totalStrips === 0) return
    if (generatedStripsMap[frameIdx]) return

    const generateCurrent = async () => {
      setIsGenerating(true)
      const photos = getPhotos()
      const orig = getStrip()
      
      let newUrl = null
      
      if (photos.length < 3) {
        if (orig && frameIdx === 0) newUrl = orig.url
      } else {
        if (orig && frameIdx === 0) {
          newUrl = orig.url
        } else {
          const templateIdx = orig ? frameIdx - 1 : frameIdx
          try {
            newUrl = await renderStripOnCanvas(photos.slice(0, 3), FRAME_TEMPLATES[templateIdx])
          } catch (e) {
            console.error('Strip generation failed for', FRAME_TEMPLATES[templateIdx].id, e)
          }
        }
      }

      if (newUrl) {
        setGeneratedStripsMap(prev => ({ ...prev, [frameIdx]: newUrl }))
      }
      setIsGenerating(false)
    }

    generateCurrent()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameIdx, totalStrips, activeTab, generatedStripsMap])

  const renderStripOnCanvas = async (
    photos: MediaItem[],
    template: typeof FRAME_TEMPLATES[0]
  ): Promise<string | null> => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Lower resolution on mobile to save GPU/RAM on low-end Android devices
    const W = isMobile ? 720 : 1080
    const H = isMobile ? 1280 : 1920
    canvas.width = W
    canvas.height = H

    const PADDING = isMobile ? 24 : 40
    const GAP = isMobile ? 20 : 30
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
    ctx.font = `bold ${isMobile ? 40 : 56}px Arial, sans-serif`
    ctx.fillStyle = template.textColor
    ctx.fillText('SEBOOTH', W / 2, brandY - 10)
    ctx.font = `${isMobile ? 18 : 24}px Arial, sans-serif`
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
    <div className="min-h-[100svh] bg-white paper-texture flex flex-col">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Brutalist Header */}
      <nav className="sticky top-0 z-50 bg-white border-b-4 border-black safe-top py-3">
        <div className="container mx-auto px-6 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-secondary transition-none text-sm font-black uppercase">
            <Home className="h-4 w-4" /> Beranda
          </Link>
          <span className="font-black text-primary text-xl marker-font tracking-widest">MY PHOTOS</span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-black uppercase text-primary hover:text-secondary transition-none">
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </nav>

      {/* Header */}
      <header className="text-center pt-10 pb-4 px-6">
        <h1 className="text-3xl font-black text-primary uppercase tracking-tighter">
          Halo, {userName}! 👋
        </h1>
        
        {sessions.length > 1 && (
          <div className="relative mt-4 inline-block">
            <button 
              onClick={() => setShowSessionPicker(!showSessionPicker)}
              className="flex items-center gap-2 bg-white px-5 py-2 text-sm font-black uppercase text-primary border-2 border-black hard-shadow-black hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
            >
              {activeSession?.event_name || 'Sebooth Session'} 
              <ChevronDown className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showSessionPicker && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-white border-4 border-black hard-shadow-black overflow-hidden z-50"
                >
                  {sessions.map(s => (
                    <button key={s.id} onClick={() => { setActiveSession(s); setShowSessionPicker(false) }}
                      className={`w-full text-left px-5 py-3 text-sm font-black uppercase border-b-2 border-black last:border-b-0 transition-none ${activeSession?.id === s.id ? 'bg-secondary text-white' : 'text-primary hover:bg-gray-100'}`}
                    >
                      {s.event_name || 'Sebooth Session'}
                      <span className={`block text-[10px] font-bold mt-0.5 ${activeSession?.id === s.id ? 'text-white/80' : 'text-primary/50'}`}>
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
          <p className="mt-2 text-primary/60 text-xs font-black uppercase tracking-widest bg-white border-2 border-black inline-block px-3 py-1">
            {activeSession?.event_name || 'Sebooth Session'} · {activeSession && new Date(activeSession.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
      </header>

      {/* Content Area */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center pt-20 px-6 flex-1">
          <div className="h-24 w-24 bg-white border-4 border-black hard-shadow-black flex items-center justify-center mb-6"><Grid className="h-10 w-10 text-primary" /></div>
          <h3 className="text-2xl font-black text-primary uppercase marker-font">Belum Ada Koleksi</h3>
          <p className="mt-2 text-primary/70 font-bold max-w-xs text-sm">Scan QR code di Sebooth untuk mulai mengisi galerimu!</p>
        </div>
      ) : (
        <main className="mx-auto max-w-lg w-full px-5 pt-6 pb-40 flex-1">
          {/* Active Queue Tickets */}
          {activeTickets.length > 0 && (
            <div className="bg-primary border-4 border-black p-5 mb-6 hard-shadow-blue">
              <ActiveQueueCard tickets={activeTickets} />
            </div>
          )}
          <AnimatePresence mode="wait">
            {/* STRIP TAB */}
            {activeTab === 'strip' && (
              <motion.section key="strip" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
                {isGenerating || (!generatedStripsMap[frameIdx] && totalStrips > 0) ? (
                  <div className="flex flex-col items-center py-20 text-primary">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="font-black uppercase text-sm">Membuat template...</p>
                  </div>
                ) : generatedStripsMap[frameIdx] ? (
                  <>
                    <div className="relative w-full">
                      <div className="w-full bg-white border-4 border-black hard-shadow-black p-2">
                        <img src={generatedStripsMap[frameIdx]} alt="Photo Strip" className="w-full object-contain max-h-[65vh] border-2 border-black" />
                      </div>
                      {totalStrips > 1 && (
                        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-0 pointer-events-none -mx-4">
                          <button onClick={() => setFrameIdx(prev => prev === 0 ? totalStrips - 1 : prev - 1)} className="pointer-events-auto w-12 h-12 bg-white border-4 border-black hard-shadow-black flex items-center justify-center text-primary active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button onClick={() => setFrameIdx(prev => (prev + 1) % totalStrips)} className="pointer-events-auto w-12 h-12 bg-white border-4 border-black hard-shadow-black flex items-center justify-center text-primary active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </div>
                      )}
                    </div>
                    {totalStrips > 1 && (
                      <div className="flex gap-2 mt-6">
                        {Array.from({ length: totalStrips }).map((_, i) => (
                          <button key={i} onClick={() => setFrameIdx(i)} className={`h-3 transition-all border-2 border-black ${i === frameIdx ? 'bg-secondary w-8 hard-shadow-orange' : 'bg-white w-3'}`} />
                        ))}
                      </div>
                    )}
                    <button onClick={() => downloadFile(generatedStripsMap[frameIdx], `strip_${frameIdx + 1}.jpg`)} 
                      className="mt-8 w-full py-4 bg-secondary text-white font-black uppercase text-sm flex items-center justify-center gap-2 border-2 border-black hard-shadow-black hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                      <Download className="w-5 h-5" /> Simpan Strip
                    </button>
                  </>
                ) : strip ? (
                  <>
                    <div className="w-full bg-white border-4 border-black hard-shadow-black p-2">
                      <img src={strip.url} alt="Photo Strip" className="w-full object-contain max-h-[65vh] border-2 border-black" />
                    </div>
                    <button onClick={() => downloadFile(strip.url, 'strip.jpg')} className="mt-8 w-full py-4 bg-secondary text-white font-black uppercase text-sm flex items-center justify-center gap-2 border-2 border-black hard-shadow-black hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                      <Download className="w-5 h-5" /> Simpan Strip
                    </button>
                  </>
                ) : (
                  <p className="text-primary/60 font-bold py-20 text-sm">Tidak ada photo strip.</p>
                )}
              </motion.section>
            )}

            {/* GIF TAB */}
            {activeTab === 'gif' && (
              <motion.section key="gif" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
                {gif ? (
                  <>
                    <div className="w-full bg-white border-4 border-black hard-shadow-black p-2">
                      <img src={gif.url} alt="GIF Animation" className="w-full object-contain max-h-[65vh] border-2 border-black" />
                    </div>
                    <button onClick={() => downloadFile(gif.url, 'animation.gif')} className="mt-8 w-full py-4 bg-secondary text-white font-black uppercase text-sm flex items-center justify-center gap-2 border-2 border-black hard-shadow-black hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                      <Download className="w-5 h-5" /> Simpan GIF
                    </button>
                  </>
                ) : (
                  <p className="text-primary/60 font-bold py-20 text-sm">Tidak ada GIF.</p>
                )}
              </motion.section>
            )}

            {/* LIVE TAB */}
            {activeTab === 'live' && (
              <motion.section key="live" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
                {live ? (
                  <>
                    <div className="w-full bg-white border-4 border-black hard-shadow-black p-2">
                      <video 
                        key={live.url}
                        autoPlay loop muted playsInline 
                        className="w-full object-contain max-h-[65vh] border-2 border-black"
                        onError={(e) => {
                          const target = e.currentTarget
                          target.style.display = 'none'
                          const fallback = target.parentElement?.querySelector('.video-fallback') as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      >
                        <source src={live.url} type="video/mp4" />
                      </video>
                      <div className="video-fallback hidden flex-col items-center justify-center py-16 text-primary border-2 border-black" style={{ display: 'none' }}>
                        <AlertCircle className="w-10 h-10 mb-3" />
                        <p className="font-black uppercase text-sm">Video gagal dimuat</p>
                        <p className="text-xs mt-1 font-bold">File mungkin rusak atau belum selesai</p>
                      </div>
                    </div>
                    <button onClick={() => downloadFile(live.url, 'live_photo.mp4')} className="mt-8 w-full py-4 bg-secondary text-white font-black uppercase text-sm flex items-center justify-center gap-2 border-2 border-black hard-shadow-black hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                      <Download className="w-5 h-5" /> Simpan Live Photo
                    </button>
                  </>
                ) : (
                  <p className="text-primary/60 font-bold py-20 text-sm">Tidak ada Live Photo.</p>
                )}
              </motion.section>
            )}

            {/* PHOTOS TAB */}
            {activeTab === 'photos' && (
              <motion.section key="photos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="grid grid-cols-2 gap-4">
                  {photos.map((p, i) => (
                    <div key={p.id} className="relative group aspect-square bg-white border-4 border-black hard-shadow-black p-1">
                      <img src={p.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover border-2 border-black transition-transform duration-700" />
                      <button 
                        onClick={() => downloadFile(p.url, `photo_${i + 1}.jpg`)}
                        className="absolute bottom-2 right-2 w-10 h-10 bg-secondary border-2 border-black hard-shadow-orange flex items-center justify-center text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={handleDownloadAll} className="mt-8 w-full py-4 bg-secondary text-white font-black uppercase text-sm flex items-center justify-center gap-2 border-2 border-black hard-shadow-black hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                  <Download className="w-5 h-5" /> Simpan Semua Foto
                </button>
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      )}

      {/* Brutalist Bottom Nav Pill */}
      {sessions.length > 0 && (
        <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] md:w-[calc(100%-48px)] max-w-[360px] z-40 safe-bottom">
          <div className="flex bg-white border-4 border-black hard-shadow-black">
            {tabs.map((tab, idx) => (
              <button 
                key={tab.key} 
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 md:py-3 touch-target border-r-2 border-black last:border-r-0 transition-none ${
                  activeTab === tab.key 
                    ? 'text-white bg-primary' 
                    : 'text-primary hover:bg-gray-100'
                }`}
              >
                <div className={activeTab === tab.key ? "text-white" : "text-primary"}>
                  {tab.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest mt-1">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center pb-28 pt-8 border-t-4 border-black bg-white mt-auto">
        <p className="text-xs text-primary font-black uppercase tracking-widest marker-font">Powered by Sebooth</p>
      </footer>
    </div>
  )
}
