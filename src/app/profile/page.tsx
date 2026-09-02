'use client'

export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  X, LayoutGrid, Download, MoreHorizontal, Share2,
  Check, Maximize2, QrCode, ArrowRight, Camera,
  ChevronLeft, ChevronRight, Loader2, FolderDown, Package
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { SessionData } from '@/types/database'

export interface SessionMediaItem {
  id: string
  url: string
  hdUrl?: string
  type: 'strip' | 'photo' | 'gif' | 'video'
  label: string
}

export interface UserSessionDisplayItem {
  id: string
  title: string
  author: string
  location: string
  dateStr: string
  avatarUrl: string
  badgeCount: number
  category: string
  likes: string
  price: string
  media: SessionMediaItem[]
  attendees: string[]
}

export default function MyPhotosPage() {
  const router = useRouter()
  const supabase = createClient()

  const [dbSessions, setDbSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSessionIndex, setActiveSessionIndex] = useState(0)
  const [activeMediaIndices, setActiveMediaIndices] = useState<Record<string, number>>({})
  const [isOverviewMode, setIsOverviewMode] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [copiedNotification, setCopiedNotification] = useState(false)
  const [isGridModalOpen, setIsGridModalOpen] = useState(false)
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [claimInput, setClaimInput] = useState('')
  const [showSwipeGuide, setShowSwipeGuide] = useState(true)

  // Bundle download state
  const [isBundling, setIsBundling] = useState(false)
  const [bundleProgress, setBundleProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 })
  const [bundleNotification, setBundleNotification] = useState<string | null>(null)

  // Auto-dismiss swipe guide after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeGuide(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  // Live real-time finger drag tracking
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDraggingState, setIsDraggingState] = useState(false)
  const touchStartPos = useRef<{ x: number; y: number } | null>(null)
  const dragAxis = useRef<'none' | 'x' | 'y'>('none')

  // Fetch real sessions from Supabase for logged-in user
  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login?redirect=/profile')
          return
        }

        const { data, error } = await supabase
          .from('sessions')
          .select('*, media(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (!error && data) {
          setDbSessions(data)
        }
      } catch (err) {
        console.error('Error fetching profile data:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router, supabase])

  // Transform Supabase sessions into UI items
  const sessionsList: UserSessionDisplayItem[] = useMemo(() => {
    return dbSessions.map((s, idx) => {
      const mediaList: SessionMediaItem[] = (s.media || []).map((m, mIdx) => {
        const isVideo = m.type === 'video' || m.type === 'live' || !!m.url?.match(/\.(mp4|webm|mov)(\?.*)?$/i)
        const isStrip = !isVideo && ((m as any).type === 'strip' || m.url?.toLowerCase().includes('strip'))
        const isGif = !isVideo && (m.type === 'gif' || m.url?.toLowerCase().includes('gif'))
        return {
          id: m.id || `m-${mIdx}`,
          url: m.url,
          hdUrl: m.url,
          type: isVideo ? 'video' : isStrip ? 'strip' : isGif ? 'gif' : 'photo',
          label: isVideo ? 'Live Video Frame' : isStrip ? 'Photostrip' : isGif ? 'Live GIF' : `Photo ${mIdx + 1}`
        }
      })

      const date = s.created_at ? new Date(s.created_at) : new Date()
      const formattedDate = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })

      return {
        id: s.id,
        title: s.event_name || `Sebooth #${s.id.slice(0, 6)}`,
        author: 'sebooth.id',
        location: 'Sebooth Studio',
        dateStr: formattedDate,
        avatarUrl: mediaList[0]?.url || '/images/products/photostrip.png',
        badgeCount: mediaList.length || 1,
        category: 'EVENT',
        likes: `${1.1 + (idx % 5) * 0.2}k`,
        price: 'Sebooth Softfile',
        media: mediaList.length > 0 ? mediaList : [
          { id: 'def-1', url: '/images/products/photostrip.png', type: 'strip', label: 'Photostrip' }
        ],
        attendees: []
      }
    })
  }, [dbSessions])

  const currentSession = sessionsList[activeSessionIndex] || sessionsList[0]
  const currentMediaIndex = activeMediaIndices[currentSession?.id] || 0

  // Switch to next/prev photo within current active session with strict debounce
  const lastTapTime = useRef<number>(0)

  const handleNextMedia = (sessionId: string, totalMedia: number) => {
    const now = Date.now()
    if (now - lastTapTime.current < 280) return
    lastTapTime.current = now

    setActiveMediaIndices(prev => {
      const curIdx = prev[sessionId] || 0
      return { ...prev, [sessionId]: (curIdx + 1) % totalMedia }
    })
  }

  // Live 1:1 tactile drag event handlers
  const touchStartTime = useRef<number>(0)
  const hasMoved = useRef<boolean>(false)

  const handleStart = (clientX: number, clientY: number) => {
    if (showSwipeGuide) setShowSwipeGuide(false)
    touchStartPos.current = { x: clientX, y: clientY }
    touchStartTime.current = Date.now()
    hasMoved.current = false
    setIsDraggingState(true)
    dragAxis.current = 'none'
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!touchStartPos.current) return
    const dx = clientX - touchStartPos.current.x
    const dy = clientY - touchStartPos.current.y

    if (Math.hypot(dx, dy) > 8) {
      hasMoved.current = true
    }

    if (dragAxis.current === 'none') {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        dragAxis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      }
    }

    if (dragAxis.current === 'x') {
      setDragOffset({ x: dx * 0.75, y: 0 })
    } else if (dragAxis.current === 'y') {
      setDragOffset({ x: 0, y: dy * 0.75 })
    }
  }

  const handleEnd = (clientX?: number, clientY?: number) => {
    if (!touchStartPos.current) return

    const dx = clientX !== undefined ? clientX - touchStartPos.current.x : dragOffset.x
    const dy = clientY !== undefined ? clientY - touchStartPos.current.y : dragOffset.y
    const distance = Math.hypot(dx, dy)
    const duration = Date.now() - touchStartTime.current

    // ── TAP DETECTION (PHOTO STACK SHUFFLE) ──
    if (!hasMoved.current || (distance < 12 && duration < 350)) {
      if (currentSession && currentSession.media.length > 1) {
        handleNextMedia(currentSession.id, currentSession.media.length)
      }
    } else {
      // ── SWIPE GESTURE PROCESSING (LINEAR SLIDE SWITCH SESSIONS) ──
      const threshold = 35

      if (dragAxis.current === 'y' || (dragAxis.current === 'none' && Math.abs(dy) > Math.abs(dx))) {
        if (dy < -threshold) {
          // Swipe Up -> Next session
          setActiveSessionIndex(prev => (prev < sessionsList.length - 1 ? prev + 1 : prev))
        } else if (dy > threshold) {
          // Swipe Down -> Previous session
          setActiveSessionIndex(prev => (prev > 0 ? prev - 1 : prev))
        }
      } else if (dragAxis.current === 'x' || (dragAxis.current === 'none' && Math.abs(dx) > Math.abs(dy))) {
        if (dx < -threshold) {
          // Swipe Left -> Next session
          setActiveSessionIndex(prev => (prev < sessionsList.length - 1 ? prev + 1 : prev))
        } else if (dx > threshold) {
          // Swipe Right -> Previous session
          setActiveSessionIndex(prev => (prev > 0 ? prev - 1 : prev))
        }
      }
    }

    touchStartPos.current = null
    dragAxis.current = 'none'
    setIsDraggingState(false)
    setDragOffset({ x: 0, y: 0 })
  }

  // Keyboard navigation (Linear)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setActiveSessionIndex(prev => (prev < sessionsList.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setActiveSessionIndex(prev => (prev > 0 ? prev - 1 : prev))
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (currentSession && currentSession.media.length > 1) {
          handleNextMedia(currentSession.id, currentSession.media.length)
        }
      } else if (e.key === 'Escape') {
        setLightboxUrl(null)
        setIsOverviewMode(false)
        setIsGridModalOpen(false)
        setIsOptionsModalOpen(false)
        setIsClaimModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sessionsList.length, currentSession])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentSession?.title || 'Sebooth My Photos',
        text: 'Lihat koleksi foto di Sebooth!',
        url: window.location.href
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopiedNotification(true)
      setTimeout(() => setCopiedNotification(false), 2000)
    }
    setIsOptionsModalOpen(false)
  }

  const handleDownload = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation()
    }
    const activeMedia = currentSession?.media[currentMediaIndex]
    const targetUrl = activeMedia?.hdUrl || activeMedia?.url
    if (!targetUrl) return
    const ext = targetUrl.split('.').pop()?.split('?')[0] || 'jpg'
    const filename = `sebooth_${currentSession?.id || 'photo'}_${currentMediaIndex + 1}.${ext}`
    const downloadUrl = `/api/download?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(filename)}`

    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    setIsOptionsModalOpen(false)
  }

  // ─── DOWNLOAD 1 BUNDLE (.ZIP OF ALL ACTIVE SESSION MEDIA) ───
  const handleDownloadBundle = async (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation()
    }
    if (!currentSession || !currentSession.media || currentSession.media.length === 0) return
    if (isBundling) return

    setIsBundling(true)
    const total = currentSession.media.length
    setBundleProgress({ current: 0, total })

    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      for (let i = 0; i < total; i++) {
        const item = currentSession.media[i]
        const targetUrl = item.hdUrl || item.url
        const ext = targetUrl.split('.').pop()?.split('?')[0] || (item.type === 'video' ? 'mp4' : item.type === 'gif' ? 'gif' : 'jpg')
        
        const labelSlug = item.label ? item.label.toLowerCase().replace(/[^a-z0-9]+/g, '_') : `file_${i + 1}`
        const fileName = `${String(i + 1).padStart(2, '0')}_${labelSlug}.${ext}`

        // Direct fetch with fallback to /api/download proxy
        let response = await fetch(targetUrl).catch(() => null)
        if (!response || !response.ok) {
          response = await fetch(`/api/download?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(fileName)}`)
        }

        if (response && response.ok) {
          const blob = await response.blob()
          zip.file(fileName, blob)
        }
        setBundleProgress({ current: i + 1, total })
      }

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      })

      const sessionSlug = currentSession.title?.replace(/[^a-zA-Z0-9_-]+/g, '_') || `Sebooth_${currentSession.id.slice(0, 8)}`
      const zipFileName = `Sebooth_${sessionSlug}_Bundle.zip`

      const downloadUrl = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = zipFileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 8000)

      setBundleNotification(`Berhasil download 1 bundle (${total} file)!`)
      setTimeout(() => setBundleNotification(null), 3500)
    } catch (err) {
      console.error('Bundle download failed:', err)
      setBundleNotification('Gagal membuat bundle zip. Silakan coba lagi.')
      setTimeout(() => setBundleNotification(null), 3500)
    } finally {
      setIsBundling(false)
    }
  }

  // ── LOADING STATE ──
  if (loading) {
    return (
      <div className="relative w-full h-[100svh] min-h-[100svh] max-h-[100svh] bg-white text-slate-900 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <span className="text-xs font-semibold text-slate-500 tracking-wide">Memuat galeri foto kamu...</span>
        </div>
      </div>
    )
  }

  // ── EMPTY STATE (LOGGED IN USER WITHOUT SESSIONS) ──
  if (sessionsList.length === 0) {
    return (
      <div className="relative w-full h-[100svh] min-h-[100svh] max-h-[100svh] bg-white text-slate-900 overflow-hidden flex flex-col justify-between select-none font-sans">
        <div className="w-full max-w-6xl mx-auto h-full flex flex-col justify-between px-4 sm:px-6 md:px-8 pt-3 pb-4">
          {/* Header */}
          <header className="w-full max-w-4xl mx-auto pt-1 pb-2 flex items-center justify-between shrink-0 z-20">
            <Link
              href="/"
              className="w-10 h-10 flex items-center justify-start text-slate-800 hover:text-black transition-opacity active:scale-95 cursor-pointer"
              title="Kembali ke Beranda"
            >
              <X className="w-6 h-6 stroke-[2.2]" />
            </Link>

            <div className="flex flex-col items-center">
              <h1 className="text-[18px] sm:text-[20px] font-extrabold text-slate-900 tracking-tight font-sans">
                My Photos
              </h1>
              <span className="text-[11px] font-medium text-slate-400 -mt-0.5">
                0 Sesi Tersimpan
              </span>
            </div>

            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="w-9 h-9 flex items-center justify-center text-slate-800 hover:text-black transition-transform active:scale-90 cursor-pointer hover:bg-slate-100 rounded-xl"
              title="Klaim Foto / Scan QR"
            >
              <Camera className="w-[22px] h-[22px] stroke-[2]" />
            </button>
          </header>

          {/* Centerpiece: Empty State */}
          <div className="relative w-full flex-1 min-h-0 flex flex-col items-center justify-center my-auto py-6 text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 mb-5 shadow-sm">
              <Camera className="w-10 h-10 stroke-[1.8]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
              Belum Ada Sesi Foto
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6 px-4">
              Foto dan video dari photobooth Sebooth yang sudah kamu klaim akan otomatis muncul dan tersimpan di galeri ini.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
              <button
                onClick={() => setIsClaimModalOpen(true)}
                className="w-full py-3.5 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Klaim Foto Sekarang</span>
              </button>
              <Link
                href="/"
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center"
              >
                Ke Beranda
              </Link>
            </div>
          </div>

          <footer className="w-full max-w-4xl mx-auto py-2 text-center text-[11px] text-slate-400">
            Sebooth Photobooth &copy; {new Date().getFullYear()}
          </footer>
        </div>

        {/* Claim Modal in Empty State */}
        {isClaimModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
            <div className="w-full max-w-[420px] bg-white border-t sm:border border-slate-200 rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl flex flex-col gap-4 text-slate-900 animate-modal-pop">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 font-sans">
                    Klaim Foto Photobooth
                  </h3>
                </div>
                <button
                  onClick={() => setIsClaimModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Scan QR code di layar kiosk photobooth atau masukkan Session ID di bawah ini untuk menambahkan foto ke galeri kamu:
              </p>

              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={claimInput}
                  onChange={(e) => setClaimInput(e.target.value)}
                  placeholder="Masukkan Session ID / UUID..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
                <button
                  onClick={() => {
                    if (claimInput.trim()) {
                      window.location.href = `/access/${claimInput.trim()}`
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Klaim Foto Sekarang
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative w-full h-[100svh] min-h-[100svh] max-h-[100svh] bg-white text-slate-900 overflow-hidden flex flex-col justify-between select-none font-sans">

      {/* ── App Shell Container (Spacious Responsive Layout for Mobile & PC) ── */}
      <div className="w-full max-w-6xl mx-auto h-full flex flex-col justify-between px-4 sm:px-6 md:px-8 pt-3 pb-3 sm:pt-4 sm:pb-4">

        {/* ═══════════════════════════════════════════════════════════════════
            1. TOP HEADER BAR: Close [X] + "My Photos" + [Grid, Camera]
           ═══════════════════════════════════════════════════════════════════ */}
        <header className="w-full max-w-4xl mx-auto pt-1 pb-2 flex items-center justify-between shrink-0 z-20">
          {/* Close button */}
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-start text-slate-800 hover:text-black transition-opacity active:scale-95 cursor-pointer"
            title="Kembali ke Beranda"
          >
            <X className="w-6 h-6 stroke-[2.2]" />
          </Link>

          {/* Center Title: "My Photos" */}
          <div className="flex flex-col items-center">
            <h1 className="text-[18px] sm:text-[20px] font-extrabold text-slate-900 tracking-tight font-sans">
              My Photos
            </h1>
            <span className="text-[11px] font-medium text-slate-400 -mt-0.5">
              Sesi {activeSessionIndex + 1} dari {sessionsList.length}
            </span>
          </div>

          {/* Right Action Icons: 4-Grid (Zoom Out Toggle) + Camera */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 4-Square Grid Icon (Toggles Zoom Out Overview) */}
            <button
              onClick={() => setIsOverviewMode(prev => !prev)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-90 cursor-pointer ${
                isOverviewMode
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-800 hover:text-black hover:bg-slate-100'
              }`}
              title={isOverviewMode ? "Kembali ke Tampilan Fokus (Zoom In)" : "Lihat Semua Sesi (Zoom Out)"}
            >
              <div className="grid grid-cols-2 gap-[3px] w-[18px] h-[18px]">
                <div className={`w-[7px] h-[7px] rounded-[2px] border-[1.8px] ${isOverviewMode ? 'border-white bg-white' : 'border-slate-900'}`} />
                <div className={`w-[7px] h-[7px] rounded-[2px] border-[1.8px] ${isOverviewMode ? 'border-white bg-white' : 'border-slate-900'}`} />
                <div className={`w-[7px] h-[7px] rounded-[2px] border-[1.8px] ${isOverviewMode ? 'border-white bg-white' : 'border-slate-900'}`} />
                <div className={`w-[7px] h-[7px] rounded-[2px] border-[1.8px] ${isOverviewMode ? 'border-white bg-white' : 'border-slate-900'}`} />
              </div>
            </button>

            {/* Camera / Claim */}
            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="w-9 h-9 flex items-center justify-center text-slate-800 hover:text-black transition-transform active:scale-90 cursor-pointer hover:bg-slate-100 rounded-xl"
              title="Klaim Foto / Scan QR"
            >
              <Camera className="w-[22px] h-[22px] stroke-[2]" />
            </button>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════════
            2. CENTERPIECE: UNIFIED SEAMLESS IN-PLACE ZOOM-OUT / FOCUS SLIDER
           ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative w-full flex-1 min-h-0 flex items-center justify-center my-auto py-2 sm:py-3 overflow-visible">

          {/* Desktop Left/Right Navigation Flanks (Hidden in overview mode) */}
          {!isOverviewMode && (
            <>
              <button
                onClick={() => setActiveSessionIndex(prev => (prev > 0 ? prev - 1 : 0))}
                disabled={activeSessionIndex === 0}
                className={`hidden md:flex absolute left-2 lg:left-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-slate-200 text-slate-700 transition-all items-center justify-center ${
                  activeSessionIndex === 0
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:text-slate-950 hover:bg-slate-50 active:scale-90 cursor-pointer'
                }`}
                title="Sesi Sebelumnya"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.4]" />
              </button>

              <button
                onClick={() => setActiveSessionIndex(prev => (prev < sessionsList.length - 1 ? prev + 1 : prev))}
                disabled={activeSessionIndex === sessionsList.length - 1}
                className={`hidden md:flex absolute right-2 lg:right-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-slate-200 text-slate-700 transition-all items-center justify-center ${
                  activeSessionIndex === sessionsList.length - 1
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:text-slate-950 hover:bg-slate-50 active:scale-90 cursor-pointer'
                }`}
                title="Sesi Berikutnya"
              >
                <ChevronRight className="w-6 h-6 stroke-[2.4]" />
              </button>
            </>
          )}

          {/* Gesture / Drag Tracking Area */}
          <div
            onTouchStart={(e) => {
              if (!isOverviewMode) handleStart(e.touches[0].clientX, e.touches[0].clientY)
            }}
            onTouchMove={(e) => {
              if (!isOverviewMode) handleMove(e.touches[0].clientX, e.touches[0].clientY)
            }}
            onTouchEnd={(e) => {
              if (!isOverviewMode) handleEnd(e.changedTouches[0]?.clientX, e.changedTouches[0]?.clientY)
            }}
            onMouseDown={(e) => {
              if (!isOverviewMode) handleStart(e.clientX, e.clientY)
            }}
            onMouseMove={(e) => {
              if (!isOverviewMode && isDraggingState) handleMove(e.clientX, e.clientY)
            }}
            onMouseUp={(e) => {
              if (!isOverviewMode) handleEnd(e.clientX, e.clientY)
            }}
            onMouseLeave={() => {
              if (!isOverviewMode && isDraggingState) handleEnd()
            }}
            className="relative w-full h-[72vh] xs:h-[75vh] sm:h-[78vh] md:h-[80vh] max-h-[640px] flex items-center justify-center touch-none cursor-grab active:cursor-grabbing overflow-visible"
          >
            {/* ── SEAMLESS ZOOMING SLIDER TRACK (ORIGINATES DIRECTLY FROM SELECTED SESSION) ── */}
            <div
              className={`h-full flex flex-row items-center will-change-transform ${
                isDraggingState && dragAxis.current === 'x'
                  ? 'transition-none'
                  : 'transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'
              }`}
              style={{
                transform: `translate3d(calc(50% - (${activeSessionIndex + 0.5} * ${
                  isOverviewMode ? 'min(48vw, 300px)' : '100%'
                }) + ${dragAxis.current === 'x' ? dragOffset.x : 0}px), 0, 0)`
              }}
            >
              {sessionsList.map((session, sIdx) => {
                const isCurrentSession = sIdx === activeSessionIndex
                const mediaIdx = activeMediaIndices[session.id] || 0

                return (
                  <div
                    key={session.id}
                    style={{
                      width: isOverviewMode ? 'min(48vw, 300px)' : '100%'
                    }}
                    className={`h-full shrink-0 flex items-center justify-center select-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isOverviewMode
                        ? 'px-3 sm:px-6 cursor-pointer'
                        : `px-4 sm:px-12 md:px-24 lg:px-36 ${
                            isCurrentSession
                              ? 'opacity-100 scale-100'
                              : 'opacity-25 md:opacity-35 scale-90 blur-[0.5px] cursor-pointer'
                          }`
                    }`}
                    onClick={() => {
                      if (isOverviewMode) {
                        setActiveSessionIndex(sIdx)
                        setIsOverviewMode(false)
                      } else if (!isCurrentSession) {
                        setActiveSessionIndex(sIdx)
                      }
                    }}
                  >
                    {/* ── CARD CONTAINER: PROPORTIONAL JUSTIFIED MINI CARDS ── */}
                    <div
                      className={`relative h-full aspect-[2/3] w-auto flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isOverviewMode
                          ? isCurrentSession
                            ? 'max-h-[260px] xs:max-h-[300px] sm:max-h-[340px] md:max-h-[380px] lg:max-h-[410px] scale-100'
                            : 'max-h-[240px] xs:max-h-[280px] sm:max-h-[320px] md:max-h-[360px] lg:max-h-[390px] scale-95 opacity-75 hover:opacity-100 hover:scale-100'
                          : 'max-h-[560px] xs:max-h-[600px] sm:max-h-[630px] md:max-h-[660px] max-w-[390px] xs:max-w-[430px] sm:max-w-[460px] md:max-w-[490px]'
                      }`}
                    >
                      {session.media.map((med, mIdx) => {
                        const totalMedia = session.media.length
                        const diff = (mIdx - mediaIdx + totalMedia) % totalMedia

                        let transformStyle = ''
                        let zIndex = 10
                        let opacity = 1

                        if (diff === 0) {
                          zIndex = 30
                          opacity = 1
                          transformStyle = 'translate3d(0, 0, 0) scale(1)'
                        } else if (diff === 1) {
                          zIndex = 20
                          opacity = 0.95
                          transformStyle = isOverviewMode
                            ? 'translate3d(8px, -8px, 0) rotate(3deg) scale(0.96)'
                            : 'translate3d(16px, -16px, 0) rotate(4.5deg) scale(0.96)'
                        } else if (diff === 2) {
                          zIndex = 15
                          opacity = 0.85
                          transformStyle = isOverviewMode
                            ? 'translate3d(-8px, -6px, 0) rotate(-3deg) scale(0.92)'
                            : 'translate3d(-14px, -12px, 0) rotate(-4deg) scale(0.92)'
                        } else {
                          zIndex = 5
                          opacity = 0
                          transformStyle = 'translate3d(0, 0, 0) scale(0.85)'
                        }

                        return (
                          <div
                            key={med.id}
                            className={`absolute inset-0 flex items-center justify-center will-change-transform ${
                              isDraggingState && isCurrentSession && dragAxis.current === 'x' && diff === 0
                                ? 'transition-none'
                                : 'transition-all duration-400 ease-[cubic-bezier(0.34,1.4,0.64,1)]'
                            }`}
                            style={{
                              transform: transformStyle,
                              transformOrigin: '50% 50%',
                              zIndex,
                              opacity,
                              pointerEvents: diff === 0 ? 'auto' : 'none'
                            }}
                          >
                            {/* Card Body - Supports Photos, Photostrips, GIFs & Live Videos */}
                            <div
                              className={`relative w-full h-full rounded-[22px] xs:rounded-[28px] sm:rounded-[32px] overflow-hidden bg-zinc-950 flex items-center justify-center transition-all duration-300 ${
                                isOverviewMode && isCurrentSession
                                  ? 'shadow-[0_20px_45px_-8px_rgba(0,0,0,0.35)] ring-2 ring-orange-500/80'
                                  : 'shadow-[0_22px_50px_-10px_rgba(0,0,0,0.25),0_10px_20px_-6px_rgba(0,0,0,0.12)]'
                              }`}
                            >
                              {med.type === 'video' || !!med.url?.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? (
                                <video
                                  src={med.url}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className={`w-full h-full object-cover pointer-events-none select-none transition-all duration-300 ${
                                    diff > 0 ? 'brightness-[0.85] saturate-[0.9]' : 'brightness-100 saturate-100'
                                  }`}
                                />
                              ) : (
                                <img
                                  src={med.url}
                                  alt={med.label}
                                  className={`w-full h-full object-cover pointer-events-none select-none transition-all duration-300 ${
                                    diff > 0 ? 'brightness-[0.85] saturate-[0.9]' : 'brightness-100 saturate-100'
                                  }`}
                                  loading={diff <= 2 ? 'eager' : 'lazy'}
                                  decoding="async"
                                />
                              )}

                              {/* Dark tint overlay on background cards */}
                              {diff > 0 && (
                                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                              )}

                              {/* Top-Right Quick Actions (Only in focus mode) */}
                              {!isOverviewMode && diff === 0 && (
                                <div
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onTouchStart={(e) => e.stopPropagation()}
                                  className="absolute top-3.5 right-3.5 z-40 flex items-center gap-1.5 pointer-events-auto"
                                >
                                  <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      e.preventDefault()
                                      handleDownload(e)
                                    }}
                                    className="w-8.5 h-8.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all cursor-pointer"
                                    title="Download Foto Ini (HD)"
                                  >
                                    <Download className="w-4 h-4 stroke-[2.4]" />
                                  </button>
                                  <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      e.preventDefault()
                                      setLightboxUrl(med.hdUrl || med.url)
                                    }}
                                    className="w-8.5 h-8.5 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all cursor-pointer"
                                    title="Lihat Fullscreen HD"
                                  >
                                    <Maximize2 className="w-4 h-4 stroke-[2.2]" />
                                  </button>
                                  <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      e.preventDefault()
                                      setIsOptionsModalOpen(true)
                                    }}
                                    className="w-8.5 h-8.5 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all cursor-pointer"
                                    title="Opsi Sesi"
                                  >
                                    <MoreHorizontal className="w-4 h-4 stroke-[2.2]" />
                                  </button>
                                </div>
                              )}

                              {/* Mobile Initial Swipe Gesture Guide Overlay (Only in focus mode) */}
                              {!isOverviewMode && showSwipeGuide && diff === 0 && isCurrentSession && (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setShowSwipeGuide(false)
                                  }}
                                  className="absolute inset-0 z-50 rounded-[24px] xs:rounded-[30px] sm:rounded-[34px] bg-black/65 backdrop-blur-[3px] flex flex-col items-center justify-center p-5 text-center text-white cursor-pointer transition-opacity duration-300 animate-fade-in md:hidden"
                                >
                                  <div className="relative mb-3.5 flex items-center justify-center">
                                    <div className="absolute w-20 h-20 rounded-full bg-white/15 animate-ping" />
                                    <div className="w-18 h-18 rounded-full bg-white/95 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.5)] flex items-center justify-center p-3.5 z-10">
                                      <img
                                        src="/images/swipe.png"
                                        alt="Swipe Gesture"
                                        className="w-full h-full object-contain animate-swipe-hand select-none pointer-events-none"
                                      />
                                    </div>
                                  </div>

                                  <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-extrabold uppercase tracking-wider mb-2 shadow-sm font-sans">
                                    PANDUAN GESTUR
                                  </span>
                                  <h4 className="text-[16px] font-black text-white tracking-tight mb-1 font-sans">
                                    Geser / Swipe Layar
                                  </h4>
                                  <p className="text-[11px] text-white/85 max-w-[210px] leading-relaxed mb-4">
                                    Swipe kiri / kanan untuk ganti sesi, atau tap foto untuk melihat pose lainnya
                                  </p>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setShowSwipeGuide(false)
                                    }}
                                    className="px-5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold border border-white/30 backdrop-blur-sm transition-all active:scale-95 cursor-pointer"
                                  >
                                    Mengerti
                                  </button>
                                </div>
                              )}

                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* ─── 3. BOTTOM CENTER ACTION: DOWNLOAD 1 BUNDLE (ALL FILES IN ACTIVE SESSION) ─── */}
        {!isOverviewMode && currentSession && (
          <div className="w-full flex items-center justify-center pt-2 pb-2 sm:pb-3 z-40">
            <button
              onClick={handleDownloadBundle}
              disabled={isBundling}
              className={`group relative px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm tracking-wider flex items-center gap-2.5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.25)] hover:shadow-[0_14px_30px_-5px_rgba(0,0,0,0.35)] active:scale-95 transition-all cursor-pointer border ${
                isBundling
                  ? 'bg-slate-800 text-slate-300 border-slate-700 cursor-wait'
                  : 'bg-slate-950 hover:bg-slate-900 text-white border-slate-800 hover:border-slate-700'
              }`}
              title="Download 1 Bundle Semua File di Sesi Ini (.ZIP)"
            >
              {isBundling ? (
                <>
                  <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                  <span>
                    Menyiapkan Bundle ({bundleProgress.current}/{bundleProgress.total})...
                  </span>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>
                    DOWNLOAD 1 BUNDLE ({currentSession.media.length} FILE)
                  </span>
                </>
              )}
            </button>
          </div>
        )}

      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 1: SESSION GRID SELECTOR (TOP 00 00)
         ═══════════════════════════════════════════════════════════════════ */}
      {isGridModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-[420px] bg-white border-t sm:border border-slate-200 rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl flex flex-col max-h-[80vh] text-slate-900 animate-modal-pop">

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  Pilih Sesi Foto
                </h3>
              </div>
              <button
                onClick={() => setIsGridModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Session Grid List */}
            <div className="grid grid-cols-2 gap-3 py-4 overflow-y-auto no-scrollbar flex-1">
              {sessionsList.map((sess, sIdx) => {
                const isSelected = activeSessionIndex === sIdx
                const cover = sess.media[0]?.url || sess.avatarUrl

                return (
                  <button
                    key={sess.id}
                    onClick={() => {
                      setActiveSessionIndex(sIdx)
                      setIsGridModalOpen(false)
                    }}
                    className={`group relative rounded-[20px] overflow-hidden p-1.5 transition-all text-left cursor-pointer border ${isSelected
                      ? 'border-orange-500 bg-orange-50/50 shadow-md ring-2 ring-orange-500/20'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                      }`}
                  >
                    <div className="relative w-full aspect-[3/4] rounded-[14px] overflow-hidden bg-slate-200 mb-2">
                      <img
                        src={cover}
                        alt={sess.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/20">
                        {sess.media.length} foto
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-900 truncate px-1">
                      {sess.title}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate px-1">
                      {sess.dateStr}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Bottom Close */}
            <button
              onClick={() => setIsGridModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-sans tracking-wide cursor-pointer transition-colors"
            >
              TUTUP
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 2: SESSION OPTIONS / MENU (•••)
         ═══════════════════════════════════════════════════════════════════ */}
      {isOptionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-[420px] bg-white border-t sm:border border-slate-200 rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl flex flex-col gap-3 text-slate-900 animate-modal-pop">

            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Opsi Sesi ({currentSession?.title})
              </h3>
              <button
                onClick={() => setIsOptionsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => {
                setLightboxUrl(currentSession?.media[currentMediaIndex]?.hdUrl || currentSession?.media[currentMediaIndex]?.url || null)
                setIsOptionsModalOpen(false)
              }}
              className="w-full py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Maximize2 className="w-4 h-4 text-orange-500" />
                <span>Lihat Foto Fullscreen HD</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={handleDownload}
              className="w-full py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Download Foto Ini (HD)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => {
                handleDownloadBundle()
                setIsOptionsModalOpen(false)
              }}
              className="w-full py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-orange-500" />
                <span>Download 1 Bundle Semua File ({currentSession?.media.length} File .ZIP)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={handleShare}
              className="w-full py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Share2 className="w-4 h-4 text-sky-500" />
                <span>Bagikan Link Galeri</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 3: CLAIM SESSION MODAL (+)
         ═══════════════════════════════════════════════════════════════════ */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-[420px] bg-white border-t sm:border border-slate-200 rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl flex flex-col gap-4 text-slate-900 animate-modal-pop">

            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-sans">
                  Klaim Foto Photobooth
                </h3>
              </div>
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Scan QR code di layar kiosk photobooth atau masukkan Session ID di bawah ini untuk menambahkan foto ke galeri kamu:
            </p>

            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={claimInput}
                onChange={(e) => setClaimInput(e.target.value)}
                placeholder="Masukkan Session ID / UUID..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
              />
              <button
                onClick={() => {
                  if (claimInput.trim()) {
                    window.location.href = `/access/${claimInput.trim()}`
                  }
                }}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Klaim Foto Sekarang
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
              <Link
                href="/queue"
                onClick={() => setIsClaimModalOpen(false)}
                className="text-xs text-orange-500 hover:text-orange-600 font-semibold"
              >
                Lihat Antrean Aktif (Queue) →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 4: FULLSCREEN HD LIGHTBOX
         ═══════════════════════════════════════════════════════════════════ */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/95 animate-fade-in">
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center animate-modal-pop">
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {lightboxUrl.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? (
              <video
                src={lightboxUrl}
                autoPlay
                loop
                controls
                playsInline
                className="max-w-full max-h-[78vh] w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/10"
              />
            ) : (
              <img
                src={lightboxUrl}
                alt="Sebooth HD Fullscreen"
                className="max-w-full max-h-[78vh] w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/10"
              />
            )}

            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={handleDownload}
                className="px-6 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-black font-bayon uppercase text-sm tracking-wider flex items-center gap-2 shadow-lg cursor-pointer active:scale-95 transition-transform"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD ORIGINAL HD</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copied Toast */}
      {copiedNotification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg border border-slate-700 flex items-center gap-1.5 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Link berhasil disalin!</span>
        </div>
      )}

      {/* Bundle Download Toast */}
      {bundleNotification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl border border-slate-700 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          <span>{bundleNotification}</span>
        </div>
      )}

    </div>
  )
}
