'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LogOut, Loader2, Download, Image, Film, Zap, Grid, 
  ChevronDown, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react'
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
  } catch (err) {
    console.error('Download failed:', err)
    // Fallback: open in new tab
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
  }, [activeTab, activeSession])

  const generateAllStrips = async () => {
    const photos = getPhotos()
    if (photos.length < 3) {
      // Fall back to original strip
      const strip = getStrip()
      if (strip) setGeneratedStrips([strip.url])
      return
    }

    setIsGenerating(true)
    const strips: string[] = []
    
    // Also include the original strip as first option
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

    // 1:3 ratio canvas with 16:9 photo slots
    const W = 1080
    const H = 1920
    canvas.width = W
    canvas.height = H

    const PADDING = 40
    const GAP = 30
    const SLOT_W = W - PADDING * 2  // 1000
    const SLOT_H = Math.round(SLOT_W * (9 / 16))  // ~562 (16:9)
    const BRANDING_H = H - (PADDING + (SLOT_H + GAP) * 3 - GAP + PADDING)

    // BG
    ctx.fillStyle = template.bg
    ctx.fillRect(0, 0, W, H)

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })
    }

    // Draw photos
    for (let i = 0; i < Math.min(photos.length, 3); i++) {
      const x = PADDING
      const y = PADDING + i * (SLOT_H + GAP)

      // Border
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
      } catch (err) {
        ctx.fillStyle = '#333'
        ctx.fillRect(x, y, SLOT_W, SLOT_H)
      }
    }

    // Branding
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

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
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
    <div className="min-h-screen bg-[#0a0a0c] text-white" style={{
      backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(99,102,241,0.1) 0%, transparent 40%), radial-gradient(circle at 100% 100%, rgba(139,92,246,0.1) 0%, transparent 40%)'
    }}>
      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Top Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="mx-auto max-w-2xl px-6 h-16 flex items-center justify-between">
          <span className="font-black text-lg tracking-tighter">Sebooth</span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-white/50 hover:text-red-400 transition-colors">
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </nav>

      {/* Header */}
      <header className="text-center pt-10 pb-4 px-6">
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
          Halo, {userName}!
        </h1>
        
        {/* Session Picker */}
        {sessions.length > 1 && (
          <div className="relative mt-4 inline-block">
            <button 
              onClick={() => setShowSessionPicker(!showSessionPicker)}
              className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-5 py-2 text-sm font-bold text-white/70 border border-white/10 hover:bg-white/15 transition-all"
            >
              {activeSession?.event_name || 'Sebooth Session'} 
              <ChevronDown className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showSessionPicker && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 rounded-2xl bg-[#1a1a1f]/95 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
                >
                  {sessions.map(s => (
                    <button key={s.id} onClick={() => { setActiveSession(s); setShowSessionPicker(false) }}
                      className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors ${activeSession?.id === s.id ? 'bg-indigo-600/30 text-indigo-300' : 'text-white/60 hover:bg-white/5'}`}
                    >
                      {s.event_name || 'Sebooth Session'}
                      <span className="block text-[10px] font-medium text-white/30 mt-0.5">
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
          <p className="mt-2 text-white/40 text-xs font-semibold uppercase tracking-widest">
            {activeSession?.event_name || 'Sebooth Session'} · {activeSession && new Date(activeSession.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </header>

      {/* Content Area */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center pt-20 px-6">
          <div className="h-24 w-24 rounded-3xl bg-white/5 flex items-center justify-center"><Grid className="h-12 w-12 text-white/20" /></div>
          <h3 className="mt-6 text-xl font-bold">Belum Ada Koleksi</h3>
          <p className="mt-2 text-white/40 max-w-xs text-sm">Scan QR code di Sebooth untuk mulai mengisi galerimu!</p>
        </div>
      ) : (
        <main className="mx-auto max-w-2xl px-5 pt-6 pb-40">
          <AnimatePresence mode="wait">
            {/* STRIP TAB */}
            {activeTab === 'strip' && (
              <motion.section key="strip" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
                {isGenerating ? (
                  <div className="flex flex-col items-center py-20 text-white/50">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="font-bold text-sm">Membuat template...</p>
                  </div>
                ) : generatedStrips.length > 0 ? (
                  <>
                    <div className="relative w-full">
                      <div className="w-full rounded-[28px] overflow-hidden bg-black shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
                        <img src={generatedStrips[frameIdx % generatedStrips.length]} alt="Photo Strip" className="w-full object-contain max-h-[65vh]" />
                      </div>
                      {generatedStrips.length > 1 && (
                        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 pointer-events-none">
                          <button onClick={() => setFrameIdx(prev => prev === 0 ? generatedStrips.length - 1 : prev - 1)} className="pointer-events-auto w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-all">
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button onClick={() => setFrameIdx(prev => (prev + 1) % generatedStrips.length)} className="pointer-events-auto w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                    {generatedStrips.length > 1 && (
                      <div className="flex gap-2 mt-4">
                        {generatedStrips.map((_, i) => (
                          <button key={i} onClick={() => setFrameIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === frameIdx % generatedStrips.length ? 'bg-indigo-500 w-6' : 'bg-white/20'}`} />
                        ))}
                      </div>
                    )}
                    <button onClick={() => downloadFile(generatedStrips[frameIdx % generatedStrips.length], `strip_${frameIdx + 1}.jpg`)} 
                      className="mt-6 w-full py-4 rounded-[20px] bg-white text-black font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:translate-y-[-3px] active:scale-95 transition-all">
                      <Download className="w-5 h-5" /> Simpan Strip
                    </button>
                  </>
                ) : strip ? (
                  <>
                    <div className="w-full rounded-[28px] overflow-hidden bg-black shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
                      <img src={strip.url} alt="Photo Strip" className="w-full object-contain max-h-[65vh]" />
                    </div>
                    <button onClick={() => downloadFile(strip.url, 'strip.jpg')} className="mt-6 w-full py-4 rounded-[20px] bg-white text-black font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:translate-y-[-3px] active:scale-95 transition-all">
                      <Download className="w-5 h-5" /> Simpan Strip
                    </button>
                  </>
                ) : (
                  <p className="text-white/40 py-20 text-sm">Tidak ada photo strip.</p>
                )}
              </motion.section>
            )}

            {/* GIF TAB */}
            {activeTab === 'gif' && (
              <motion.section key="gif" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
                {gif ? (
                  <>
                    <div className="w-full rounded-[28px] overflow-hidden bg-black shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
                      <img src={gif.url} alt="GIF Animation" className="w-full object-contain max-h-[65vh]" />
                    </div>
                    <button onClick={() => downloadFile(gif.url, 'animation.gif')} className="mt-6 w-full py-4 rounded-[20px] bg-white text-black font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:translate-y-[-3px] active:scale-95 transition-all">
                      <Download className="w-5 h-5" /> Simpan GIF
                    </button>
                  </>
                ) : (
                  <p className="text-white/40 py-20 text-sm">Tidak ada GIF.</p>
                )}
              </motion.section>
            )}

            {/* LIVE TAB */}
            {activeTab === 'live' && (
              <motion.section key="live" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
                {live ? (
                  <>
                    <div className="w-full rounded-[28px] overflow-hidden bg-black shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
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
                      <div className="video-fallback hidden flex-col items-center justify-center py-16 text-white/40" style={{ display: 'none' }}>
                        <AlertCircle className="w-10 h-10 mb-3" />
                        <p className="font-bold text-sm">Video gagal dimuat</p>
                        <p className="text-xs mt-1">File mungkin rusak atau belum selesai diproses</p>
                      </div>
                    </div>
                    <button onClick={() => downloadFile(live.url, 'live_photo.mp4')} className="mt-6 w-full py-4 rounded-[20px] bg-white text-black font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:translate-y-[-3px] active:scale-95 transition-all">
                      <Download className="w-5 h-5" /> Simpan Live Photo
                    </button>
                  </>
                ) : (
                  <p className="text-white/40 py-20 text-sm">Tidak ada Live Photo.</p>
                )}
              </motion.section>
            )}

            {/* PHOTOS TAB */}
            {activeTab === 'photos' && (
              <motion.section key="photos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((p, i) => (
                    <div key={p.id} className="relative group aspect-square rounded-[22px] overflow-hidden bg-[#151518] shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
                      <img src={p.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <button 
                        onClick={() => downloadFile(p.url, `photo_${i + 1}.jpg`)}
                        className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white flex items-center justify-center text-black shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={handleDownloadAll} className="mt-6 w-full py-4 rounded-[20px] bg-white text-black font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:translate-y-[-3px] active:scale-95 transition-all">
                  <Download className="w-5 h-5" /> Simpan Semua Foto
                </button>
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      )}

      {/* Bottom Nav Pill */}
      {sessions.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[400px] z-50">
          <div className="flex p-2 rounded-[40px] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)]" 
            style={{ background: 'rgba(20,20,25,0.7)', backdropFilter: 'blur(24px) saturate(180%)' }}>
            {tabs.map(tab => (
              <button 
                key={tab.key} 
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[32px] transition-all duration-300 ${
                  activeTab === tab.key 
                    ? 'text-white bg-white/8 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]' 
                    : 'text-white/40 hover:text-white/60'
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
      <footer className="text-center pb-32 pt-8">
        <p className="text-[10px] text-white/20 font-medium">Powered by Sebooth</p>
      </footer>
    </div>
  )
}
