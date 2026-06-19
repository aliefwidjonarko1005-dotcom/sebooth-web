'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2, Download, Image as ImageIcon, Film, Zap, Grid,
  AlertCircle, ChevronLeft, ChevronRight, ArrowLeft, LogOut, Home
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

/* ─── Helper: Download a file via API proxy (Safari iOS Fix) ─── */
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

  // Keep a ref to the current generatedStripsMap so we can access it inside effects/cleanups
  const generatedStripsRef = useRef<Record<number, string>>({})

  useEffect(() => {
    generatedStripsRef.current = generatedStripsMap
  }, [generatedStripsMap])

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
      // Clean up all blob URLs on unmount
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

      // Check if super admin
      const userEmail = user.email || ''
      const envAdmins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
      const isEnvSuperAdmin = envAdmins.includes(userEmail.toLowerCase())
      let isSuperAdmin = isEnvSuperAdmin
      if (!isEnvSuperAdmin) {
        const { data: adminData } = await supabase
          .from('admins')
          .select('is_super')
          .eq('email', userEmail)
          .maybeSingle()
        if (adminData?.is_super) isSuperAdmin = true
      }

      // Super admin: fetch any session. Normal user: only own sessions.
      let query = supabase
        .from('sessions')
        .select('*, media(*)')
        .eq('id', sessionId)

      if (!isSuperAdmin) {
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query.single()

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
  const getStrip = useCallback(() => {
    return session?.media?.find(
      (m: MediaItem) => (m.metadata as Record<string, unknown>)?.is_strip || m.url?.toLowerCase().includes('strip.jpg')
    ) || null
  }, [session])

  const getGif = useCallback(() => {
    return session?.media?.find(
      (m: MediaItem) => m.type === 'gif' || m.url?.toLowerCase().includes('animation.gif')
    ) || null
  }, [session])

  const getLive = useCallback(() => {
    return session?.media?.find(
      (m: MediaItem) => m.type === 'live' || m.url?.toLowerCase().includes('live.mp4')
    ) || null
  }, [session])

  const getPhotos = useCallback(() => {
    if (!session?.media) return []
    const strip = getStrip()
    const gif = getGif()
    return session.media.filter((m: MediaItem) => {
      const isImg = m.url?.match(/\.(jpg|jpeg|png|webp)/i)
      const isStrip = strip && m.id === strip.id
      const isGif = gif && m.id === gif.id
      return isImg && !isStrip && !isGif
    })
  }, [session, getStrip, getGif])

  /* ─── Lazy Generate Strips ─── */
  useEffect(() => {
    if (activeTab === 'strip' && session) {
      const photos = getPhotos()
      const orig = getStrip()
      const total = photos.length < 3 ? (orig ? 1 : 0) : (orig ? FRAME_TEMPLATES.length + 1 : FRAME_TEMPLATES.length)
      setTotalStrips(total)
      setFrameIdx(0)
      revokeAllStrips()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, session])

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
      } catch {
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

    return new Promise<string | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob))
        } else {
          resolve(null)
        }
      }, 'image/jpeg', 0.92)
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
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
      <div className="flex min-h-screen items-center justify-center bg-fluid-gradient">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) return null

  const strip = getStrip()
  const gif = getGif()
  const live = getLive()
  const photos = getPhotos()

  const tabs = [
    { key: 'strip' as const, label: 'Strip', icon: <ImageIcon className="w-5 h-5" />, available: !!(strip || photos.length >= 3) },
    { key: 'gif' as const, label: 'GIF', icon: <Film className="w-5 h-5" />, available: !!gif },
    { key: 'live' as const, label: 'Live', icon: <Zap className="w-5 h-5" />, available: !!live },
    { key: 'photos' as const, label: 'Photos', icon: <Grid className="w-5 h-5" />, available: photos.length > 0 },
  ].filter(t => t.available)

  return (
    <div className="min-h-[100svh] bg-fluid-gradient paper-texture flex flex-col">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-primary border-b-2 border-black safe-top">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/profile" className="flex items-center gap-2 text-white/80 hover:text-white transition-none">
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden md:inline text-[0.8rem] font-black uppercase">Kembali</span>
          </Link>
          <div className="text-center flex-1 mx-4">
            <h1 className="text-[0.85rem] font-black text-white uppercase tracking-wider truncate">
              {session.event_name || 'Sebooth Session'}
            </h1>
            <p className="text-[0.55rem] font-bold text-white/50 uppercase tracking-widest">
              {new Date(session.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <button onClick={handleLogout} className="text-white/80 hover:text-white transition-none">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-lg w-full px-4 pt-5 pb-32 flex-1">
        <AnimatePresence mode="wait">
          {/* STRIP TAB */}
          {activeTab === 'strip' && (
            <motion.section key="strip" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
              {isGenerating || (!generatedStripsMap[frameIdx] && totalStrips > 0) ? (
                <div className="flex flex-col items-center py-20 text-primary">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  <p className="font-black uppercase text-[0.8rem]">Membuat template...</p>
                </div>
              ) : generatedStripsMap[frameIdx] ? (
                <>
                  <div className="relative w-full">
                    <div className="w-full bg-white border-2 border-black hard-shadow-black p-1.5">
                      {generatedStripsMap[frameIdx].startsWith('data:') || generatedStripsMap[frameIdx].startsWith('blob:') ? (
                        <img src={generatedStripsMap[frameIdx]} alt="Photo Strip" className="w-full object-contain max-h-[65vh] border border-black" />
                      ) : (
                        <div className="relative w-full border border-black" style={{ aspectRatio: '9/16', maxHeight: '65vh' }}>
                          <NextImage src={generatedStripsMap[frameIdx]} alt="Photo Strip" fill className="object-contain" sizes="(max-width: 512px) 100vw, 512px" quality={80} />
                        </div>
                      )}
                    </div>
                    {totalStrips > 1 && (
                      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none -mx-3">
                        <button onClick={() => setFrameIdx(prev => prev === 0 ? totalStrips - 1 : prev - 1)} className="pointer-events-auto w-10 h-10 bg-white border-2 border-black hard-shadow-black flex items-center justify-center text-primary active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => setFrameIdx(prev => (prev + 1) % totalStrips)} className="pointer-events-auto w-10 h-10 bg-white border-2 border-black hard-shadow-black flex items-center justify-center text-primary active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {totalStrips > 1 && (
                    <div className="flex gap-2 mt-5">
                      {Array.from({ length: totalStrips }).map((_, i) => (
                        <button key={i} onClick={() => setFrameIdx(i)} className={`h-2.5 transition-all border-2 border-black ${i === frameIdx ? 'bg-secondary w-7 hard-shadow-orange' : 'bg-white w-2.5'}`} />
                      ))}
                    </div>
                  )}
                  <button onClick={() => downloadFile(generatedStripsMap[frameIdx], `strip_${frameIdx + 1}.jpg`)}
                    className="mt-6 w-full py-3.5 bg-secondary text-white font-black uppercase text-[0.8rem] flex items-center justify-center gap-2 border-2 border-black hard-shadow-black hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                    <Download className="w-4 h-4" /> Simpan Strip
                  </button>
                </>
              ) : strip ? (
                <>
                  <div className="w-full bg-white border-2 border-black hard-shadow-black p-1.5">
                    <div className="relative w-full border border-black" style={{ aspectRatio: '9/16', maxHeight: '65vh' }}>
                      <NextImage src={strip.url} alt="Photo Strip" fill className="object-contain" sizes="(max-width: 512px) 100vw, 512px" quality={80} />
                    </div>
                  </div>
                  <button onClick={() => downloadFile(strip.url, 'strip.jpg')} className="mt-6 w-full py-3.5 bg-secondary text-white font-black uppercase text-[0.8rem] flex items-center justify-center gap-2 border-2 border-black hard-shadow-black hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                    <Download className="w-4 h-4" /> Simpan Strip
                  </button>
                </>
              ) : (
                <p className="text-primary/50 font-bold py-16 text-[0.8rem]">Tidak ada photo strip.</p>
              )}
            </motion.section>
          )}

          {/* GIF TAB */}
          {activeTab === 'gif' && (
            <motion.section key="gif" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
              {gif ? (
                <>
                  <div className="w-full bg-white border-2 border-black hard-shadow-black p-1.5">
                    <img src={gif.url} alt="GIF Animation" className="w-full object-contain max-h-[65vh] border border-black" loading="lazy" />
                  </div>
                  <button onClick={() => downloadFile(gif.url, 'animation.gif')} className="mt-6 w-full py-3.5 bg-secondary text-white font-black uppercase text-[0.8rem] flex items-center justify-center gap-2 border-2 border-black hard-shadow-black hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                    <Download className="w-4 h-4" /> Simpan GIF
                  </button>
                </>
              ) : (
                <p className="text-primary/50 font-bold py-16 text-[0.8rem]">Tidak ada GIF.</p>
              )}
            </motion.section>
          )}

          {/* LIVE TAB */}
          {activeTab === 'live' && (
            <motion.section key="live" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
              {live ? (
                <>
                  <div className="w-full bg-white border-2 border-black hard-shadow-black p-1.5">
                    <video
                      key={live.url}
                      autoPlay loop muted playsInline
                      className="w-full object-contain max-h-[65vh] border border-black"
                      onError={(e) => {
                        const target = e.currentTarget
                        target.style.display = 'none'
                        const fallback = target.parentElement?.querySelector('.video-fallback') as HTMLElement
                        if (fallback) fallback.style.display = 'flex'
                      }}
                    >
                      <source src={live.url} type="video/mp4" />
                    </video>
                    <div className="video-fallback hidden flex-col items-center justify-center py-12 text-primary border border-black" style={{ display: 'none' }}>
                      <AlertCircle className="w-8 h-8 mb-2" />
                      <p className="font-black uppercase text-[0.8rem]">Video gagal dimuat</p>
                      <p className="text-[0.65rem] mt-1 font-bold text-primary/60">File mungkin rusak atau belum selesai</p>
                    </div>
                  </div>
                  <button onClick={() => downloadFile(live.url, 'live_photo.mp4')} className="mt-6 w-full py-3.5 bg-secondary text-white font-black uppercase text-[0.8rem] flex items-center justify-center gap-2 border-2 border-black hard-shadow-black hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                    <Download className="w-4 h-4" /> Simpan Live Photo
                  </button>
                </>
              ) : (
                <p className="text-primary/50 font-bold py-16 text-[0.8rem]">Tidak ada Live Photo.</p>
              )}
            </motion.section>
          )}

          {/* PHOTOS TAB */}
          {activeTab === 'photos' && (
            <motion.section key="photos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid grid-cols-2 gap-3">
                {photos.map((p, i) => (
                  <div key={p.id} className="relative group aspect-square bg-white border-2 border-black hard-shadow-black p-1">
                    <div className="relative w-full h-full border border-black">
                      <NextImage src={p.url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="(max-width: 512px) 50vw, 256px" quality={75} loading="lazy" />
                    </div>
                    <button
                      onClick={() => downloadFile(p.url, `photo_${i + 1}.jpg`)}
                      className="absolute bottom-2 right-2 w-9 h-9 bg-secondary border-2 border-black flex items-center justify-center text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 active:translate-x-[1px] active:translate-y-[1px] transition-all"
                    >
                    <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}

              </div>
              <button onClick={handleDownloadAll} className="mt-6 w-full py-3.5 bg-secondary text-white font-black uppercase text-[0.8rem] flex items-center justify-center gap-2 border-2 border-black hard-shadow-black hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                <Download className="w-4 h-4" /> Simpan Semua Foto
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Tab Bar */}
      <div className="fixed bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] md:w-[calc(100%-48px)] max-w-[340px] z-40 safe-bottom">
        <div className="flex bg-white border-2 border-black hard-shadow-black">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 touch-target border-r border-black last:border-r-0 transition-none ${
                activeTab === tab.key
                  ? 'text-white bg-primary'
                  : 'text-primary hover:bg-gray-50'
              }`}
            >
              <div>{tab.icon}</div>
              <span className="text-[0.55rem] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
