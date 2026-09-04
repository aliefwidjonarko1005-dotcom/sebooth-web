'use client'

export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  X, LayoutGrid, Download, MoreHorizontal, Share2,
  Check, Maximize2, QrCode, ArrowRight, Camera, LogOut,
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
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [activeSessionIndex, setActiveSessionIndex] = useState(0)
  const [activeMediaIndices, setActiveMediaIndices] = useState<Record<string, number>>({})
  const [isOverviewMode, setIsOverviewMode] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
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

  // Log Out Handler
  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err) {
      console.error('Logout error:', err)
      window.location.href = '/login'
    }
  }

  // Auto-dismiss swipe guide after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeGuide(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])


  // Fetch real sessions from Supabase for logged-in user (instant session check)
  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          router.push('/login?redirect=/profile')
          return
        }

        const { data, error } = await supabase
          .from('sessions')
          .select('*, media(*)')
          .eq('user_id', session.user.id)
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
        avatarUrl: mediaList[0]?.url || '/images/gallery/hd/strip_004a6bbb.webp',
        badgeCount: mediaList.length || 1,
        category: 'EVENT',
        likes: `${1.1 + (idx % 5) * 0.2}k`,
        price: 'Sebooth Softfile',
        media: mediaList.length > 0 ? mediaList : [
          { id: 'def-1', url: '/images/gallery/hd/strip_004a6bbb.webp', type: 'strip', label: 'Photostrip' }
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

  // Direct DOM track ref for hardware-accelerated transforms
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef<boolean>(false)
  const dragStartX = useRef<number>(0)
  const dragStartTime = useRef<number>(0)
  const hasMoved = useRef<boolean>(false)
  const currentDragDx = useRef<number>(0)

  // Sync track position smoothly whenever activeSessionIndex or isOverviewMode changes
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)'
      const baseCalc = isOverviewMode
        ? `calc(50% - (${activeSessionIndex + 0.5} * min(48vw, 300px)))`
        : `calc(-${activeSessionIndex * 100}%)`
      trackRef.current.style.transform = `translate3d(${baseCalc}, 0, 0)`
    }
  }, [activeSessionIndex, isOverviewMode, loading])

  // Direct 1:1 hardware drag handlers (works seamlessly on Mobile Touch and Desktop Mouse)
  const handleDragStart = (clientX: number) => {
    if (isOverviewMode) return
    isDragging.current = true
    dragStartX.current = clientX
    dragStartTime.current = Date.now()
    hasMoved.current = false
    currentDragDx.current = 0

    if (showSwipeGuide) setShowSwipeGuide(false)
    if (trackRef.current) {
      trackRef.current.style.transition = 'none'
    }
  }

  const handleDragMove = (clientX: number) => {
    if (!isDragging.current || isOverviewMode) return
    const dx = clientX - dragStartX.current
    currentDragDx.current = dx

    if (Math.abs(dx) > 3) {
      hasMoved.current = true
    }

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(calc(-${activeSessionIndex * 100}% + ${dx}px), 0, 0)`
    }
  }

  const handleDragEnd = (clientX?: number) => {
    if (!isDragging.current || isOverviewMode) return
    isDragging.current = false

    const dx = clientX !== undefined ? clientX - dragStartX.current : currentDragDx.current
    const duration = Date.now() - dragStartTime.current
    const distance = Math.abs(dx)
    const velocity = distance / (duration || 1)
    const totalSessions = sessionsList.length
    const currentIndex = activeSessionIndex

    // ── TAP DETECTION (PHOTO STACK SHUFFLE) ──
    if (!hasMoved.current || (distance < 8 && duration < 280)) {
      if (currentSession && currentSession.media.length > 1) {
        handleNextMedia(currentSession.id, currentSession.media.length)
      }
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)'
        trackRef.current.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`
      }
      return
    }

    // ── SWIPE GESTURE PROCESSING (INSTANT SWITCH SESSIONS) ──
    const isFlick = velocity > 0.15 && distance > 8
    const isDrag = distance > 25

    let targetIndex = currentIndex
    if (isFlick || isDrag) {
      if (dx < 0 && currentIndex < totalSessions - 1) {
        targetIndex = currentIndex + 1
      } else if (dx > 0 && currentIndex > 0) {
        targetIndex = currentIndex - 1
      }
    }

    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(-${targetIndex * 100}%, 0, 0)`
    }

    if (targetIndex !== currentIndex) {
      setActiveSessionIndex(targetIndex)
    }
  }

  // ── EXPAND / LIGHTBOX MODAL DRAG & SWIPE ENGINE (MOBILE & DESKTOP) ──
  const expandTrackRef = useRef<HTMLDivElement>(null)
  const isExpandDragging = useRef<boolean>(false)
  const expandDragStartX = useRef<number>(0)
  const expandDragStartTime = useRef<number>(0)
  const expandHasMoved = useRef<boolean>(false)
  const expandCurrentDragDx = useRef<number>(0)

  // Sync expand modal track position whenever activeSessionIndex or isLightboxOpen changes
  useEffect(() => {
    if (isLightboxOpen && expandTrackRef.current) {
      expandTrackRef.current.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)'
      expandTrackRef.current.style.transform = `translate3d(-${activeSessionIndex * 100}%, 0, 0)`
    }
  }, [activeSessionIndex, isLightboxOpen])

  const handleExpandDragStart = (clientX: number) => {
    isExpandDragging.current = true
    expandDragStartX.current = clientX
    expandDragStartTime.current = Date.now()
    expandHasMoved.current = false
    expandCurrentDragDx.current = 0

    if (expandTrackRef.current) {
      expandTrackRef.current.style.transition = 'none'
    }
  }

  const handleExpandDragMove = (clientX: number) => {
    if (!isExpandDragging.current) return
    const dx = clientX - expandDragStartX.current
    expandCurrentDragDx.current = dx

    if (Math.abs(dx) > 3) {
      expandHasMoved.current = true
    }

    if (expandTrackRef.current) {
      expandTrackRef.current.style.transform = `translate3d(calc(-${activeSessionIndex * 100}% + ${dx}px), 0, 0)`
    }
  }

  const handleExpandDragEnd = (clientX?: number) => {
    if (!isExpandDragging.current) return
    isExpandDragging.current = false

    const dx = clientX !== undefined ? clientX - expandDragStartX.current : expandCurrentDragDx.current
    const duration = Date.now() - expandDragStartTime.current
    const distance = Math.abs(dx)
    const velocity = distance / (duration || 1)
    const totalSessions = sessionsList.length
    const currentIndex = activeSessionIndex

    // ── TAP: CYCLE TO NEXT PHOTO IN CURRENT SESSION ──
    if (!expandHasMoved.current || (distance < 8 && duration < 280)) {
      if (currentSession && currentSession.media.length > 1) {
        handleNextMedia(currentSession.id, currentSession.media.length)
      }
      if (expandTrackRef.current) {
        expandTrackRef.current.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)'
        expandTrackRef.current.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`
      }
      return
    }

    // ── SWIPE GESTURE: SWITCH SESSIONS IN EXPAND MODE ──
    const isFlick = velocity > 0.15 && distance > 8
    const isDrag = distance > 25

    let targetIndex = currentIndex
    if (isFlick || isDrag) {
      if (dx < 0 && currentIndex < totalSessions - 1) {
        targetIndex = currentIndex + 1
      } else if (dx > 0 && currentIndex > 0) {
        targetIndex = currentIndex - 1
      }
    }

    if (expandTrackRef.current) {
      expandTrackRef.current.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)'
      expandTrackRef.current.style.transform = `translate3d(-${targetIndex * 100}%, 0, 0)`
    }

    if (targetIndex !== currentIndex) {
      setActiveSessionIndex(targetIndex)
    }
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
        setIsLightboxOpen(false)
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

            {/* Log Out */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-9 h-9 flex items-center justify-center text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90 cursor-pointer rounded-xl"
              title="Keluar / Log Out"
            >
              {isLoggingOut ? (
                <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
              ) : (
                <LogOut className="w-[20px] h-[20px] stroke-[2.2]" />
              )}
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
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-transform active:scale-90 cursor-pointer ${
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

            {/* Log Out */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-9 h-9 flex items-center justify-center text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90 cursor-pointer rounded-xl"
              title="Keluar / Log Out"
            >
              {isLoggingOut ? (
                <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
              ) : (
                <LogOut className="w-[20px] h-[20px] stroke-[2.2]" />
              )}
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
              if (e.touches.length === 1) {
                handleDragStart(e.touches[0].clientX)
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 1) {
                handleDragMove(e.touches[0].clientX)
              }
            }}
            onTouchEnd={(e) => {
              handleDragEnd(e.changedTouches[0]?.clientX)
            }}
            onTouchCancel={() => handleDragEnd()}
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onMouseMove={(e) => handleDragMove(e.clientX)}
            onMouseUp={(e) => handleDragEnd(e.clientX)}
            onMouseLeave={() => handleDragEnd()}
            className="relative w-full h-[72vh] xs:h-[75vh] sm:h-[78vh] md:h-[80vh] max-h-[640px] flex items-center justify-center touch-pan-y cursor-grab active:cursor-grabbing overflow-visible select-none"
          >
            {/* ── SEAMLESS ZOOMING SLIDER TRACK (DIRECT DOM HARDWARE-ACCELERATED TRANSFORMS) ── */}
            <div
              ref={trackRef}
              className="h-full flex flex-row items-center will-change-transform [transform:translate3d(0,0,0)]"
              style={{
                transform: `translate3d(${
                  isOverviewMode
                    ? `calc(50% - (${activeSessionIndex + 0.5} * min(48vw, 300px)))`
                    : `calc(-${activeSessionIndex * 100}%)`
                }, 0, 0)`,
                transition: 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)'
              }}
            >
              {sessionsList.map((session, sIdx) => {
                const isCurrentSession = sIdx === activeSessionIndex
                const isNearby = Math.abs(sIdx - activeSessionIndex) <= 1
                const mediaIdx = activeMediaIndices[session.id] || 0

                // Virtualization: Skip rendering full cards for distant sessions in focus mode
                if (!isOverviewMode && !isNearby) {
                  return (
                    <div
                      key={session.id}
                      style={{ width: '100%' }}
                      className="h-full shrink-0 px-4 sm:px-12 md:px-24 lg:px-36 flex items-center justify-center pointer-events-none"
                    />
                  )
                }

                return (
                  <div
                    key={session.id}
                    style={{
                      width: isOverviewMode ? 'min(48vw, 300px)' : '100%'
                    }}
                    className={`h-full shrink-0 flex items-center justify-center select-none [transform:translate3d(0,0,0)] [backface-visibility:hidden] ${
                      isOverviewMode
                        ? 'px-3 sm:px-6 cursor-pointer transition-[opacity,transform] duration-250 ease-out'
                        : 'px-4 sm:px-12 md:px-24 lg:px-36 opacity-100 scale-100'
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
                      className={`relative h-full aspect-[2/3] w-auto flex items-center justify-center transition-[max-height,transform] duration-250 ease-out ${
                        isOverviewMode
                          ? isCurrentSession
                            ? 'max-h-[260px] xs:max-h-[300px] sm:max-h-[340px] md:max-h-[380px] lg:max-h-[410px] scale-100'
                            : 'max-h-[240px] xs:max-h-[280px] sm:max-h-[320px] md:max-h-[360px] lg:max-h-[390px] scale-95 opacity-75 hover:opacity-100 hover:scale-100'
                          : 'max-h-[560px] xs:max-h-[600px] sm:max-h-[630px] md:max-h-[660px] max-w-[390px] xs:max-w-[430px] sm:max-w-[460px] md:max-w-[490px]'
                      }`}
                    >
                      {/* 1. Stack Media Cards (Streamlined to Active Front Card + 1 Peek Card) */}
                      {session.media.map((med, mIdx) => {
                        const totalMedia = session.media.length
                        const diff = (mIdx - mediaIdx + totalMedia) % totalMedia

                        // For inactive sessions, only render front card (diff 0) to save mobile GPU VRAM
                        // For active session, render front card (diff 0) and 1 peek card (diff 1)
                        if (!isCurrentSession && diff > 0) return null
                        if (isOverviewMode && diff > 0) return null
                        if (diff > 1) return null

                        const isFront = diff === 0
                        const isVideo = med.type === 'video' || !!med.url?.match(/\.(mp4|webm|mov)(\?.*)?$/i)
                        const shouldPlayVideo = isVideo && isCurrentSession && isFront

                        return (
                          <div
                            key={med.id}
                            className={`absolute inset-0 flex items-center justify-center will-change-transform [contain:paint] transition-[transform,opacity] duration-200 ease-out ${
                              isFront
                                ? 'z-20 opacity-100 [transform:translate3d(0,0,0)_scale(1)_rotate(0deg)]'
                                : 'z-10 opacity-70 [transform:translate3d(10px,-10px,0)_scale(0.96)_rotate(3.5deg)]'
                            }`}
                            style={{
                              pointerEvents: isFront ? 'auto' : 'none'
                            }}
                          >
                            <div
                              className={`relative w-full h-full rounded-[22px] xs:rounded-[28px] sm:rounded-[32px] overflow-hidden bg-zinc-950 flex items-center justify-center [transform:translate3d(0,0,0)] [backface-visibility:hidden] ${
                                isOverviewMode && isCurrentSession
                                  ? 'shadow-md ring-2 ring-orange-500/80'
                                  : 'shadow-lg'
                              }`}
                            >
                              {shouldPlayVideo ? (
                                <video
                                  src={med.url}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className="w-full h-full object-cover pointer-events-none select-none brightness-100 saturate-100"
                                />
                              ) : (
                                <img
                                  src={med.url}
                                  alt={med.label}
                                  className="w-full h-full object-cover pointer-events-none select-none"
                                  loading={isFront ? 'eager' : 'lazy'}
                                  decoding="async"
                                />
                              )}

                              {!isFront && (
                                <div className="absolute inset-0 bg-black/25 pointer-events-none" />
                              )}
                            </div>
                          </div>
                        )
                      })}

                      {/* 2. Top-Right Quick Actions (Rendered with pure CSS visibility to prevent mount reflow) */}
                      <div
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        className={`absolute top-3.5 right-3.5 z-40 flex items-center gap-1.5 transition-opacity duration-200 ${
                          !isOverviewMode && isCurrentSession ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                        }`}
                      >
                        <button
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            handleDownload(e)
                          }}
                          className="w-8.5 h-8.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
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
                            setActiveSessionIndex(sIdx)
                            setActiveMediaIndices(prev => ({ ...prev, [session.id]: mediaIdx }))
                            setIsLightboxOpen(true)
                          }}
                          className="w-8.5 h-8.5 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
                          title="Lihat Fullscreen HD (Mode Expand)"
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
                          className="w-8.5 h-8.5 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
                          title="Opsi Sesi"
                        >
                          <MoreHorizontal className="w-4 h-4 stroke-[2.2]" />
                        </button>
                      </div>

                      {/* 3. Mobile Initial Swipe Gesture Guide Overlay */}
                      {showSwipeGuide && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowSwipeGuide(false)
                          }}
                          className={`absolute inset-0 z-50 rounded-[24px] xs:rounded-[30px] sm:rounded-[34px] bg-black/75 flex flex-col items-center justify-center p-5 text-center text-white cursor-pointer transition-opacity duration-200 md:hidden select-none ${
                            !isOverviewMode && isCurrentSession ? 'opacity-100 pointer-events-auto animate-fade-in' : 'opacity-0 pointer-events-none'
                          }`}
                        >
                          <div className="relative mb-3 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/95 shadow-xl flex items-center justify-center p-3 z-10">
                              <img
                                src="/images/swipe.png"
                                alt="Swipe Gesture"
                                className="w-full h-full object-contain animate-swipe-hand select-none pointer-events-none"
                              />
                            </div>
                          </div>

                          <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-extrabold uppercase tracking-wider mb-1.5 shadow-sm font-sans">
                            PANDUAN GESTUR
                          </span>
                          <h4 className="text-[15px] font-black text-white tracking-tight mb-1 font-sans">
                            Geser / Swipe Layar
                          </h4>
                          <p className="text-[11px] text-white/90 max-w-[210px] leading-relaxed mb-3">
                            Swipe kiri / kanan untuk ganti sesi, atau tap foto untuk melihat pose lainnya
                          </p>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowSwipeGuide(false)
                            }}
                            className="px-5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold border border-white/30 transition-transform active:scale-95 cursor-pointer"
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
                setIsLightboxOpen(true)
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
          MODAL 4: FULLSCREEN HD EXPAND LIGHTBOX (WITH TOUCH SWIPE & NAVIGATION)
         ═══════════════════════════════════════════════════════════════════ */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 select-none animate-fade-in overflow-hidden font-sans">
          
          {/* Top Header Bar */}
          <div className="w-full max-w-5xl mx-auto px-4 pt-3 sm:pt-4 pb-2 flex items-center justify-between z-30 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-[11px] font-extrabold uppercase tracking-wider border border-white/15">
                SESI {activeSessionIndex + 1}/{sessionsList.length}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white/90 truncate max-w-[170px] xs:max-w-[220px] sm:max-w-xs font-sans">
                {currentSession?.title}
              </span>
            </div>

            <button
              onClick={() => setIsLightboxOpen(false)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              title="Tutup Fullscreen"
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          {/* Center Stage: Swipeable Slider Track */}
          <div
            onTouchStart={(e) => {
              if (e.touches.length === 1) {
                handleExpandDragStart(e.touches[0].clientX)
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 1) {
                handleExpandDragMove(e.touches[0].clientX)
              }
            }}
            onTouchEnd={(e) => {
              handleExpandDragEnd(e.changedTouches[0]?.clientX)
            }}
            onTouchCancel={() => handleExpandDragEnd()}
            onMouseDown={(e) => handleExpandDragStart(e.clientX)}
            onMouseMove={(e) => handleExpandDragMove(e.clientX)}
            onMouseUp={(e) => handleExpandDragEnd(e.clientX)}
            onMouseLeave={() => handleExpandDragEnd()}
            className="relative w-full flex-1 min-h-0 flex items-center justify-center touch-pan-y cursor-grab active:cursor-grabbing overflow-hidden"
          >
            {/* Desktop Left/Right Navigation Flanks */}
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                setActiveSessionIndex(prev => (prev > 0 ? prev - 1 : 0))
              }}
              disabled={activeSessionIndex === 0}
              className={`hidden sm:flex absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 transition-all items-center justify-center ${
                activeSessionIndex === 0
                  ? 'opacity-20 cursor-not-allowed pointer-events-none'
                  : 'active:scale-90 cursor-pointer shadow-lg'
              }`}
              title="Sesi Sebelumnya"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.4]" />
            </button>

            <button
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                setActiveSessionIndex(prev => (prev < sessionsList.length - 1 ? prev + 1 : prev))
              }}
              disabled={activeSessionIndex === sessionsList.length - 1}
              className={`hidden sm:flex absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 transition-all items-center justify-center ${
                activeSessionIndex === sessionsList.length - 1
                  ? 'opacity-20 cursor-not-allowed pointer-events-none'
                  : 'active:scale-90 cursor-pointer shadow-lg'
              }`}
              title="Sesi Berikutnya"
            >
              <ChevronRight className="w-6 h-6 stroke-[2.4]" />
            </button>

            {/* Slider Track with all sessions side-by-side */}
            <div
              ref={expandTrackRef}
              className="h-full flex flex-row items-center will-change-transform [transform:translate3d(0,0,0)]"
              style={{
                transform: `translate3d(-${activeSessionIndex * 100}%, 0, 0)`,
                transition: 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)'
              }}
            >
              {sessionsList.map((session, sIdx) => {
                const isCurrent = sIdx === activeSessionIndex
                const isNearby = Math.abs(sIdx - activeSessionIndex) <= 1
                const sMedIdx = activeMediaIndices[session.id] || 0
                const activeMed = session.media[sMedIdx] || session.media[0]
                const targetUrl = activeMed?.hdUrl || activeMed?.url
                const isVideo = activeMed?.type === 'video' || !!targetUrl?.match(/\.(mp4|webm|mov)(\?.*)?$/i)

                if (!isNearby) {
                  return (
                    <div
                      key={session.id}
                      style={{ width: '100vw' }}
                      className="h-full shrink-0 flex items-center justify-center pointer-events-none"
                    />
                  )
                }

                return (
                  <div
                    key={session.id}
                    style={{ width: '100vw' }}
                    className="h-full shrink-0 flex flex-col items-center justify-center px-3 sm:px-6 py-1 select-none"
                  >
                    <div className="relative max-h-[72vh] xs:max-h-[75vh] sm:max-h-[78vh] max-w-[92vw] sm:max-w-3xl flex items-center justify-center">
                      {isVideo ? (
                        <video
                          src={targetUrl}
                          autoPlay={isCurrent}
                          loop
                          controls
                          playsInline
                          className="max-w-full max-h-[72vh] xs:max-h-[75vh] sm:max-h-[78vh] w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/10 pointer-events-auto"
                        />
                      ) : (
                        <img
                          src={targetUrl}
                          alt={session.title}
                          className="max-w-full max-h-[72vh] xs:max-h-[75vh] sm:max-h-[78vh] w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/10 pointer-events-none select-none"
                          decoding="async"
                          loading={isCurrent ? 'eager' : 'lazy'}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom Action HUD: Media Dots / Label + Download Button */}
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-auto px-4 pb-3 sm:pb-4 pt-2 flex flex-col items-center gap-2 z-30 shrink-0"
          >
            {/* Media Pagination Dots & Label */}
            {currentSession && currentSession.media.length > 1 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
                <span className="text-[10.5px] font-bold text-white/90">
                  {currentSession.media[currentMediaIndex]?.label || `Foto ${currentMediaIndex + 1}`} ({currentMediaIndex + 1}/{currentSession.media.length})
                </span>
                <div className="flex items-center gap-1 ml-1">
                  {currentSession.media.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => {
                        setActiveMediaIndices(prev => ({
                          ...prev,
                          [currentSession.id]: dotIdx
                        }))
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        dotIdx === currentMediaIndex
                          ? 'w-4 bg-orange-400'
                          : 'w-1.5 bg-white/40 hover:bg-white/75'
                      }`}
                      title={`Pilih foto ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Download HD Button */}
            <button
              onClick={handleDownload}
              className="px-6 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-black font-bayon uppercase text-xs sm:text-sm tracking-wider flex items-center gap-2 shadow-lg cursor-pointer active:scale-95 transition-transform"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>DOWNLOAD ORIGINAL HD</span>
            </button>
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
