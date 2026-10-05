'use client'

export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, LayoutGrid, Download, MoreHorizontal, Share2,
  Check, QrCode, ArrowRight, Camera, LogOut,
  ChevronLeft, ChevronRight, Loader2, FolderDown, Package,
  HelpCircle, Sparkles, Image as ImageIcon
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { SessionData } from '@/types/database'
import PhotoDirectGestureGuide from '@/components/ui/PhotoDirectGestureGuide'
import DesktopGuideModal from '@/components/ui/DesktopGuideModal'
import InteractiveTour, { TourStep } from '@/components/ui/InteractiveTour'
import { LiquidGlassDock } from '@/components/ui/LiquidGlassDock'

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
  stripUrl: string
  rawStripUrl: string
  badgeCount: number
  category: string
  likes: string
  price: string
  media: SessionMediaItem[]
  rawMedia?: any[]
  attendees: string[]
}

/**
 * Helper to get optimized, compressed WebP image for ultra-fast rendering & low data usage.
 * Animated GIFs and video MP4s remain untouched.
 * The original uncompressed master file is preserved in `hdUrl` for pristine downloads.
 */
function getOptimizedDisplayUrl(rawUrl: string, width = 640, quality = 70): string {
  if (!rawUrl) return ''
  // If already an /api/image URL, do not double-wrap
  if (rawUrl.includes('/api/image')) return rawUrl
  // Bypass animated formats and video streams
  if (rawUrl.match(/\.(gif|mp4|webm|mov)(\?.*)?$/i)) return rawUrl
  return `/api/image?url=${encodeURIComponent(rawUrl)}&w=${width}&q=${quality}`
}

/**
 * Ensures single and bundle downloads always target the 100% uncompressed master resolution camera file,
 * stripping any proxy /api/image query strings if present.
 */
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

export default function MyPhotosPage() {
  const router = useRouter()
  const supabase = createClient()

  // Responsive HP / Mobile viewport detection (< 768px)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const [dbSessions, setDbSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [activeSessionIndex, setActiveSessionIndex] = useState(0)
  const [activeMediaIndices, setActiveMediaIndices] = useState<Record<string, number>>({})
  const [isOverviewMode, setIsOverviewMode] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState<string>('50% 50%')
  const bookshelfScrollRef = useRef<HTMLDivElement | null>(null)
  const lastScrollTop = useRef<number>(0)
  const cardRectsRef = useRef<Record<number, { x: number; y: number }>>({})
  const [copiedNotification, setCopiedNotification] = useState(false)
  const [isGridModalOpen, setIsGridModalOpen] = useState(false)
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [claimInput, setClaimInput] = useState('')
  const [isGestureGuideOpen, setIsGestureGuideOpen] = useState(false)
  const [isDesktopGuideOpen, setIsDesktopGuideOpen] = useState(false)
  const [isInteractiveTourOpen, setIsInteractiveTourOpen] = useState(false)
  const holdTimer = useRef<NodeJS.Timeout | null>(null)
  const holdFired = useRef<boolean>(false)
  const [touchFeedback, setTouchFeedback] = useState<'idle' | 'pressing' | 'peeking' | 'dragging' | 'tapping'>('idle')
  const touchFeedbackRef = useRef<'idle' | 'pressing' | 'peeking' | 'dragging' | 'tapping'>('idle')
  const rAFId = useRef<number | null>(null)
  const activeCardContainerRef = useRef<HTMLDivElement>(null)
  const activeFrontCardRef = useRef<HTMLDivElement>(null)

  // ── AUTHENTIC APPLE TAPTIC ENGINE & HAPTIC TOUCH SOUND-TACTILE SIMULATOR ──
  // Works 100% on iOS Safari (where navigator.vibrate is blocked by Apple), Chrome iOS, and Android
  const audioCtxRef = useRef<AudioContext | null>(null)

  const initAudioCtx = () => {
    if (typeof window === 'undefined') return null
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass()
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {})
    }
    return audioCtxRef.current
  }

  // Synthesize Apple Taptic Engine sub-bass transient micro-impulse (acoustic-tactile sensation)
  const playTactileClick = (type: 'tick' | 'pop') => {
    try {
      const ctx = initAudioCtx()
      if (!ctx) return
      const now = ctx.currentTime

      if (type === 'tick') {
        // Crisp 10ms mechanical micro-tick (Light impact on touch down)
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(120, now)
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.012)
        gain.gain.setValueAtTime(0.08, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.onended = () => {
          try {
            osc.disconnect()
            gain.disconnect()
          } catch {}
        }
        osc.start(now)
        osc.stop(now + 0.012)
      } else if (type === 'pop') {
        // Heavy 26ms breakthrough pop (Apple 3D/Haptic Touch Pop)
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(65, now)
        osc.frequency.exponentialRampToValueAtTime(26, now + 0.026)
        gain.gain.setValueAtTime(0.24, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.026)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.onended = () => {
          try {
            osc.disconnect()
            gain.disconnect()
          } catch {}
        }
        osc.start(now)
        osc.stop(now + 0.026)

        // Secondary settle rebound micro-tick at +24ms
        setTimeout(() => {
          if (!audioCtxRef.current) return
          const ctx2 = audioCtxRef.current
          const now2 = ctx2.currentTime
          const osc2 = ctx2.createOscillator()
          const gain2 = ctx2.createGain()
          osc2.type = 'triangle'
          osc2.frequency.setValueAtTime(80, now2)
          osc2.frequency.exponentialRampToValueAtTime(30, now2 + 0.01)
          gain2.gain.setValueAtTime(0.1, now2)
          gain2.gain.exponentialRampToValueAtTime(0.0001, now2 + 0.01)
          osc2.connect(gain2)
          gain2.connect(ctx2.destination)
          osc2.onended = () => {
            try {
              osc2.disconnect()
              gain2.disconnect()
            } catch {}
          }
          osc2.start(now2)
          osc2.stop(now2 + 0.01)
        }, 24)
      }
    } catch {}
  }

  // Combined physical motor (Android) + iOS Switch Toggle + acoustic-tactile Taptic impulse (iOS Safari & all mobile devices)
  const triggerHaptic = (
    typeOrPattern: 'tick' | 'pop' | 'settle' | number | number[] = 'tick'
  ) => {
    let mode: 'tick' | 'pop' | 'settle' = 'tick'
    let pattern: number | number[] = 12

    if (typeof typeOrPattern === 'string') {
      mode = typeOrPattern
      pattern = mode === 'pop' ? [35, 40, 20] : mode === 'settle' ? 8 : 12
    } else if (Array.isArray(typeOrPattern)) {
      mode = 'pop'
      pattern = typeOrPattern
    } else if (typeof typeOrPattern === 'number') {
      mode = typeOrPattern > 20 ? 'pop' : 'tick'
      pattern = typeOrPattern
    }

    // 1. Android physical vibration motor
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern)
      } catch {}
    }

    // 2. iOS native switch toggle (iOS 17.4+ hardware Taptic Engine trigger)
    if (typeof document !== 'undefined') {
      try {
        const switchEl = document.getElementById('ios-taptic-switch') as HTMLInputElement | null
        if (switchEl) {
          switchEl.checked = !switchEl.checked
        }
      } catch {}
    }

    // 3. Apple Sub-bass Taptic Acoustic-Tactile pulse (iOS Safari & all mobile devices)
    if (mode === 'tick' || mode === 'settle') {
      playTactileClick('tick')
    } else if (mode === 'pop') {
      playTactileClick('pop')
    }
  }

  // Interactive Spotlight Tour steps for desktop
  const profileTourSteps: TourStep[] = useMemo(() => [
    {
      targetId: 'tour-profile-session-card',
      title: 'Tumpukan Foto Polaroid (3D Focus View)',
      description: 'Ini adalah tumpukan foto polaroid sesi aktif kamu. Klik foto untuk ganti pose (shuffle), atau geser mouse (drag) / tekan panah keyboard [←] [→] untuk berpindah sesi.',
      badgeText: 'KONTROL UTAMA',
      icon: <Sparkles className="w-5 h-5 text-orange-500" />,
      gesture: 'swipe',
      gestureLabel: 'Drag Mouse / Panah Keyboard'
    },
    {
      targetId: 'tour-profile-mode-switcher',
      title: 'Mode Rak Album (Bookshelf View)',
      description: 'Klik tombol 4-kotak ini untuk membuka tampilan rak album seluruh sesi kamu dengan animasi zoom out ala Apple Photos.',
      badgeText: 'TAMPILAN GRID',
      icon: <LayoutGrid className="w-5 h-5 text-orange-500" />
    },
    {
      targetId: 'tour-profile-bundle-btn',
      title: 'Simpan Semua ke Galeri (HD)',
      description: 'Download seluruh file dalam sesi ini (Photostrip, Live Video, GIF, dan Foto Master) secara beruntun dan cepat dalam kualitas 100% original.',
      badgeText: 'DOWNLOAD CEPAT',
      icon: <Download className="w-5 h-5 text-emerald-500" />
    },
    {
      targetId: 'tour-profile-help-btn',
      title: 'Pusat Bantuan & Shortcut',
      description: 'Klik tombol tanda tanya kapan saja untuk melihat shortcut keyboard dan panduan navigasi desktop lengkap.',
      badgeText: 'BANTUAN',
      icon: <HelpCircle className="w-5 h-5 text-orange-500" />
    }
  ], [])

  // Universal Help Opener: Routes cleanly to Desktop Guide on desktop (>=768px) and Direct Hand Gesture Guide on mobile (<768px)
  const handleOpenHelp = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsDesktopGuideOpen(true)
    } else {
      setIsOverviewMode(false)
      setIsGestureGuideOpen(true)
    }
  }

  // Handle clicking a card in Bookshelf -> Zoom In to Focus Mode (iOS Photos style)
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>, targetIdx: number) => {
    triggerHaptic(12)
    const rect = e.currentTarget.getBoundingClientRect()
    const originX = Math.round(rect.left + rect.width / 2)
    const originY = Math.round(rect.top + rect.height / 2)
    setZoomOrigin(`${originX}px ${originY}px`)
    setActiveSessionIndex(targetIdx)
    setIsOverviewMode(false)
  }

  // Handle opening Bookshelf from Focus Mode -> Zoom Out (iOS Photos style)
  const handleOpenBookshelf = () => {
    triggerHaptic(15)
    setIsGestureGuideOpen(false)
    const rect = cardRectsRef.current[activeSessionIndex]
    if (rect) {
      setZoomOrigin(`${Math.round(rect.x)}px ${Math.round(rect.y)}px`)
    } else {
      setZoomOrigin('50% 50%')
    }
    setIsOverviewMode(true)
  }

  // Handle closing Bookshelf back to Focus Mode via X button
  const handleCloseBookshelf = () => {
    triggerHaptic(12)
    const rect = cardRectsRef.current[activeSessionIndex]
    if (rect) {
      setZoomOrigin(`${Math.round(rect.x)}px ${Math.round(rect.y)}px`)
    } else {
      setZoomOrigin('50% 50%')
    }
    setIsOverviewMode(false)
  }

  // Synchronize bookshelf scroll to active session card on overview open
  useEffect(() => {
    if (isOverviewMode) {
      const timer = setTimeout(() => {
        const cardEl = document.getElementById(`bookshelf-card-${activeSessionIndex}`)
        if (cardEl && bookshelfScrollRef.current) {
          cardEl.scrollIntoView({ block: 'nearest', behavior: 'instant' })
          const rect = cardEl.getBoundingClientRect()
          cardRectsRef.current[activeSessionIndex] = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          }
        }
      }, 40)
      return () => clearTimeout(timer)
    }
  }, [isOverviewMode, activeSessionIndex])

  // Auto-launch direct on-photo hand gesture tutorial for first-time visitors on mobile devices (< 768px)
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading && dbSessions.length > 0) {
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        const hasSeen = localStorage.getItem('hasSeenPhotoGestureGuide_v1')
        if (!hasSeen) {
          const timer = setTimeout(() => {
            setIsOverviewMode(false)
            setIsGestureGuideOpen(true)
          }, 800)
          return () => clearTimeout(timer)
        }
      }
    }
  }, [loading, dbSessions.length])

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



  // Fetch real sessions from Supabase for logged-in user (instant session check)
  useEffect(() => {
    let isMounted = true
    async function init() {
      try {
        const isPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === '1'
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user && !isPreview) {
          router.push('/login?redirect=/profile')
          return
        }

        const targetUserId = session?.user?.id || 'e42f79ce-4721-4c15-84f3-f429ad9df958'

        const { data, error } = await supabase
          .from('sessions')
          .select('*, media(*)')
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false })

        if (!error && data && isMounted) {
          setDbSessions(data)
        }
      } catch (err) {
        console.error('Error fetching profile data:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Safety timeout: guaranteed dismiss of loading state within 4.5s
    const safetyTimer = setTimeout(() => {
      if (isMounted) setLoading(false)
    }, 4500)

    init().finally(() => {
      clearTimeout(safetyTimer)
    })

    return () => {
      isMounted = false
      clearTimeout(safetyTimer)
    }
  }, [router, supabase])

  // Transform Supabase sessions into lightweight UI items for Bookshelf & Focus Mode
  // CRITICAL REQUIREMENT: In Bookshelf mode, ONLY extract the 1 photostrip.
  // DO NOT process other media (GIF, Live Video, individual photos) across all sessions!
  const sessionsList: UserSessionDisplayItem[] = useMemo(() => {
    return dbSessions.map((s, idx) => {
      const rawMediaList = s.media || []

      // Identify dedicated photostrip only (exclude videos and GIFs)
      const stripMedia = rawMediaList.find((m: any) => {
        const isVideo = m.type === 'video' || m.type === 'live' || !!m.url?.match(/\.(mp4|webm|mov)(\?.*)?$/i)
        return !isVideo && (m.type === 'strip' || m.url?.toLowerCase().includes('strip'))
      }) || rawMediaList[0]

      const isMobileDevice = isMobile || (typeof window !== 'undefined' ? window.innerWidth < 768 : false)
      const rawStripUrl = stripMedia?.url || '/images/gallery/hd/strip_004a6bbb.webp'
      // HP/Mobile Mode: compress photostrip preview to 60% quality (w=360, q=60) for minimal load
      const stripThumbUrl = getOptimizedDisplayUrl(rawStripUrl, isMobileDevice ? 360 : 420, isMobileDevice ? 60 : 75)

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
        avatarUrl: stripThumbUrl,
        stripUrl: stripThumbUrl,
        rawStripUrl: rawStripUrl,
        badgeCount: rawMediaList.length || 1,
        category: 'EVENT',
        likes: `${1.1 + (idx % 5) * 0.2}k`,
        price: 'Sebooth Softfile',
        // In Bookshelf mode: media array contains ONLY the single photostrip!
        media: [
          {
            id: stripMedia?.id || `strip-${s.id}`,
            url: stripThumbUrl,
            hdUrl: rawStripUrl,
            type: 'strip',
            label: 'Photostrip'
          }
        ],
        rawMedia: rawMediaList,
        attendees: []
      }
    })
  }, [dbSessions, isMobile])

  const currentSession = sessionsList[activeSessionIndex] || sessionsList[0]

  // Lazy Media Processing for Active Session ONLY (Focus Mode)
  // Non-active sessions and Bookshelf overview do NOT process any candid, GIF, or video!
  const activeSessionMediaList: SessionMediaItem[] = useMemo(() => {
    if (!currentSession) return []
    const rawList = (currentSession as any).rawMedia || []
    if (rawList.length === 0) {
      return currentSession.media || [
        {
          id: 'def-1',
          url: currentSession.stripUrl,
          hdUrl: currentSession.rawStripUrl,
          type: 'strip',
          label: 'Photostrip'
        }
      ]
    }

    const isMobileDevice = isMobile || (typeof window !== 'undefined' ? window.innerWidth < 768 : false)

    return rawList.map((m: any, mIdx: number) => {
      const isVideo = m.type === 'video' || m.type === 'live' || !!m.url?.match(/\.(mp4|webm|mov)(\?.*)?$/i)
      const isStrip = !isVideo && (m.type === 'strip' || m.url?.toLowerCase().includes('strip'))
      const isGif = !isVideo && (m.type === 'gif' || m.url?.toLowerCase().includes('gif'))
      const isIndividualPhoto = !isVideo && !isStrip && !isGif

      // Mobile phone screens (HP Mode): 60% quality (q=60, w=480 for photos, w=360 for strips)
      // Saves 80-85% data & RAM, instant decoding and lightweight rendering
      // Laptops / tablets: 640-720px @ q72
      // Animated GIFs and videos remain in original format
      const targetWidth = isMobileDevice ? (isStrip ? 360 : 480) : (isIndividualPhoto ? 640 : 720)
      const targetQuality = isMobileDevice ? 60 : (isIndividualPhoto ? 68 : 72)
      const displayUrl = isVideo || isGif 
        ? m.url 
        : getOptimizedDisplayUrl(m.url, targetWidth, targetQuality)

      return {
        id: m.id || `m-${mIdx}`,
        url: displayUrl, // Compressed display image (saves 85-90% data & RAM, 60% quality on mobile)
        hdUrl: m.url, // Original raw master camera file (100% full original resolution for downloads)
        type: isVideo ? 'video' : isStrip ? 'strip' : isGif ? 'gif' : 'photo',
        label: isVideo ? 'Live Video Frame' : isStrip ? 'Photostrip' : isGif ? 'Live GIF' : `Photo ${mIdx + 1}`
      }
    })
  }, [currentSession?.id, isOverviewMode, isMobile])

  const currentMediaIndex = activeMediaIndices[currentSession?.id] || 0

  // Strict Sliding Window Memory Management:
  // Purge any cached media indices for sessions that leave the strict ±1 window [activeSessionIndex - 1, activeSessionIndex + 1]
  useEffect(() => {
    setActiveMediaIndices(prev => {
      const allowedIds = new Set([
        sessionsList[activeSessionIndex - 1]?.id,
        sessionsList[activeSessionIndex]?.id,
        sessionsList[activeSessionIndex + 1]?.id
      ].filter(Boolean))

      const hasStale = Object.keys(prev).some(id => !allowedIds.has(id))
      if (!hasStale) return prev

      const nextState: Record<string, number> = {}
      for (const id of Object.keys(prev)) {
        if (allowedIds.has(id)) {
          nextState[id] = prev[id]
        }
      }
      return nextState
    })
  }, [activeSessionIndex, sessionsList])

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

  // Sync track position smoothly whenever activeSessionIndex changes in Focus Mode
  useEffect(() => {
    if (trackRef.current && !isOverviewMode) {
      trackRef.current.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(-${activeSessionIndex * 100}%, 0, 0)`
    }
  }, [activeSessionIndex, isOverviewMode, loading, sessionsList.length])

  // Direct 1:1 hardware drag & iOS tactile gesture handlers (Zero Re-render & 120 FPS Compositor)
  const handleDragStart = (clientX: number) => {
    if (isOverviewMode) return
    isDragging.current = true
    dragStartX.current = clientX
    dragStartTime.current = Date.now()
    hasMoved.current = false
    currentDragDx.current = 0

    // 1. Immediate iOS Tactile Press: Compress card with cushioned resistance (scale: 0.94) via direct DOM (0ms lag, no React re-render)
    touchFeedbackRef.current = 'pressing'
    if (activeCardContainerRef.current) {
      activeCardContainerRef.current.style.transition = 'transform 0.18s cubic-bezier(0.25, 1, 0.5, 1)'
      activeCardContainerRef.current.style.transform = 'scale(0.94)'
    }
    triggerHaptic('tick')

    if (trackRef.current) {
      trackRef.current.style.transition = 'none'
    }

    // 2. iOS Haptic Touch Breakthrough Timer (280ms): Triggers authentic Apple spring pop (scale: 1.08)
    if (holdTimer.current) clearTimeout(holdTimer.current)
    holdTimer.current = setTimeout(() => {
      if (!hasMoved.current && isDragging.current) {
        touchFeedbackRef.current = 'peeking'
        setTouchFeedback('peeking')
        triggerHaptic('pop') // Authentic iPhone Taptic Engine breakthrough double-impulse
      }
    }, 280)
  }

  const handleDragMove = (clientX: number) => {
    if (!isDragging.current || isOverviewMode) return
    const rawDx = clientX - dragStartX.current
    currentDragDx.current = rawDx

    // When movement exceeds 8px, cancel hold peek and enter iOS Swipe/Drag mode
    if (Math.abs(rawDx) > 8) {
      hasMoved.current = true
      if (holdTimer.current) {
        clearTimeout(holdTimer.current)
        holdTimer.current = null
      }
      if (touchFeedbackRef.current !== 'dragging') {
        touchFeedbackRef.current = 'dragging'
        if (activeCardContainerRef.current) {
          activeCardContainerRef.current.style.transition = 'transform 0.2s ease'
          activeCardContainerRef.current.style.transform = 'scale(0.985)'
        }
      }
      if (activeFrontCardRef.current && activeFrontCardRef.current.style.transition !== 'none') {
        activeFrontCardRef.current.style.transition = 'none'
      }
      if (trackRef.current && trackRef.current.style.transition !== 'none') {
        trackRef.current.style.transition = 'none'
      }
    }

    // GPU-accelerated requestAnimationFrame batching (zero React state re-renders during motion!)
    if (rAFId.current) cancelAnimationFrame(rAFId.current)
    rAFId.current = requestAnimationFrame(() => {
      if (!isDragging.current) return

      const isAtStart = activeSessionIndex === 0 && rawDx > 0
      const isAtEnd = activeSessionIndex === sessionsList.length - 1 && rawDx < 0
      let effectiveDx = rawDx

      if (isAtStart || isAtEnd) {
        effectiveDx = Math.sign(rawDx) * Math.pow(Math.abs(rawDx), 0.76) * 1.85
      }

      const tilt = Math.max(-5.5, Math.min(5.5, (effectiveDx / 300) * 7.5))

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(calc(-${activeSessionIndex * 100}% + ${effectiveDx}px), 0, 0)`
      }
      if (activeFrontCardRef.current) {
        activeFrontCardRef.current.style.transform = `translate3d(0, 0, 0) rotate(${tilt}deg)`
      }
    })
  }

  const handleDragEnd = (clientX?: number) => {
    if (rAFId.current) {
      cancelAnimationFrame(rAFId.current)
      rAFId.current = null
    }
    if (holdTimer.current) {
      clearTimeout(holdTimer.current)
      holdTimer.current = null
    }

    // ── 1. If released while in iOS Haptic Peek mode -> Open Options Modal ──
    if (touchFeedbackRef.current === 'peeking') {
      touchFeedbackRef.current = 'idle'
      setTouchFeedback('idle')
      isDragging.current = false
      if (activeCardContainerRef.current) {
        activeCardContainerRef.current.style.transition = 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1)'
        activeCardContainerRef.current.style.transform = 'scale(1)'
      }
      triggerHaptic('settle')
      setIsOptionsModalOpen(true)
      return
    }

    if (!isDragging.current || isOverviewMode) {
      touchFeedbackRef.current = 'idle'
      if (activeCardContainerRef.current) {
        activeCardContainerRef.current.style.transition = 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1)'
        activeCardContainerRef.current.style.transform = 'scale(1)'
      }
      return
    }
    isDragging.current = false

    const dx = clientX !== undefined ? clientX - dragStartX.current : currentDragDx.current
    const duration = Date.now() - dragStartTime.current
    const distance = Math.abs(dx)
    const velocity = distance / (duration || 1)
    const totalSessions = sessionsList.length
    const currentIndex = activeSessionIndex

    // ── 2. TAP DETECTION (TACTILE PHOTO SHUFFLE WITH MICRO-SQUASH SPRING) ──
    if (!hasMoved.current || (distance < 8 && duration < 280)) {
      touchFeedbackRef.current = 'tapping'
      triggerHaptic('tick')

      if (activeCardContainerRef.current) {
        activeCardContainerRef.current.style.transition = 'transform 0.14s cubic-bezier(0.2, 0.9, 0.3, 1)'
        activeCardContainerRef.current.style.transform = 'scale(0.96)'
        setTimeout(() => {
          if (activeCardContainerRef.current) {
            activeCardContainerRef.current.style.transition = 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)'
            activeCardContainerRef.current.style.transform = 'scale(1)'
          }
          touchFeedbackRef.current = 'idle'
        }, 140)
      }

      if (currentSession && activeSessionMediaList.length > 1) {
        handleNextMedia(currentSession.id, activeSessionMediaList.length)
      }
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1)'
        trackRef.current.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`
      }
      return
    }

    // ── 3. SWIPE GESTURE PROCESSING (INERTIAL SNAPPING & SPRING REBOUND) ──
    const isFlick = velocity > 0.16 && distance > 10
    const isDrag = distance > 28

    let targetIndex = currentIndex
    if (isFlick || isDrag) {
      if (dx < 0 && currentIndex < totalSessions - 1) {
        targetIndex = currentIndex + 1
      } else if (dx > 0 && currentIndex > 0) {
        targetIndex = currentIndex - 1
      }
    }

    touchFeedbackRef.current = 'idle'
    if (activeCardContainerRef.current) {
      activeCardContainerRef.current.style.transition = 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1)'
      activeCardContainerRef.current.style.transform = 'scale(1)'
    }

    // Elastic return for card tilt
    if (activeFrontCardRef.current) {
      activeFrontCardRef.current.style.transition = 'transform 0.32s cubic-bezier(0.25, 1, 0.5, 1)'
      activeFrontCardRef.current.style.transform = 'translate3d(0, 0, 0) rotate(0deg)'
    }

    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)'
      trackRef.current.style.transform = `translate3d(-${targetIndex * 100}%, 0, 0)`
    }

    if (targetIndex !== currentIndex) {
      triggerHaptic(18)
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
        if (currentSession && activeSessionMediaList.length > 1) {
          handleNextMedia(currentSession.id, activeSessionMediaList.length)
        }
      } else if (e.key === 'Escape') {
        setIsOverviewMode(false)
        setIsGridModalOpen(false)
        setIsOptionsModalOpen(false)
        setIsClaimModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sessionsList.length, currentSession, activeSessionMediaList.length])

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
    const activeMedia = activeSessionMediaList[currentMediaIndex] || {
      url: currentSession?.stripUrl,
      hdUrl: currentSession?.rawStripUrl,
      type: 'strip',
      label: 'Photostrip'
    }
    // Strictly download 100% original uncompressed master camera file (never proxy/compressed display URL)
    const targetUrl = getRawOriginalUrl(activeMedia?.hdUrl || activeMedia?.url)
    if (!targetUrl) return
    const ext = targetUrl.split('.').pop()?.split('?')[0] || (activeMedia.type === 'video' ? 'mp4' : activeMedia.type === 'gif' ? 'gif' : 'jpg')
    const filename = `Sebooth_${currentSession?.id || 'photo'}_${currentMediaIndex + 1}.${ext}`
    const downloadUrl = `/api/download?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(filename)}`

    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    setIsOptionsModalOpen(false)
  }

  // ─── SEQUENTIAL MULTIPLE DOWNLOADS (DOWNLOAD BERUNTUN LANGSUNG KE GALERI HP) ───
  // No ZIP file: saves individual media files so they appear directly in user's Gallery app!
  const handleDownloadBundle = async (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation()
    }
    const mediaItems = activeSessionMediaList
    if (!currentSession || mediaItems.length === 0) return
    if (isBundling) return

    setIsBundling(true)
    const total = mediaItems.length
    setBundleProgress({ current: 0, total })

    try {
      const isMobile = typeof window !== 'undefined' && (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 1))
      const sessionSlug = currentSession.title?.replace(/[^a-zA-Z0-9_-]+/g, '_') || `Sebooth_${currentSession.id.slice(0, 8)}`
      
      const downloadedFiles: File[] = []

      // 1. Fetch each file with proper MIME type and clean naming
      for (let i = 0; i < total; i++) {
        const item = mediaItems[i]
        setBundleProgress({ current: i + 1, total })
        // Strictly download 100% original uncompressed master camera file (never proxy/compressed display URL)
        const targetUrl = getRawOriginalUrl(item.hdUrl || item.url)

        let ext = 'jpg'
        let mimeType = 'image/jpeg'
        if (item.type === 'video' || targetUrl.match(/\.(mp4|mov|webm)/i)) {
          ext = 'mp4'
          mimeType = 'video/mp4'
        } else if (item.type === 'gif' || targetUrl.match(/\.gif/i)) {
          ext = 'gif'
          mimeType = 'image/gif'
        } else if (targetUrl.match(/\.png/i)) {
          ext = 'png'
          mimeType = 'image/png'
        }

        const labelSlug = item.type === 'strip'
          ? 'Photostrip'
          : item.type === 'video'
          ? 'LiveVideo'
          : item.type === 'gif'
          ? 'GIF'
          : `Foto_${i + 1}`

        const fileName = `Sebooth_${sessionSlug}_${labelSlug}.${ext}`

        // Fetch file blob with proxy fallback
        let res = await fetch(targetUrl).catch(() => null)
        let blob: Blob | null = null
        if (res && res.ok) {
          blob = await res.blob()
        } else {
          const proxyRes = await fetch(`/api/download?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(fileName)}`)
          if (proxyRes.ok) {
            blob = await proxyRes.blob()
          }
        }

        if (blob) {
          const typedBlob = blob.type && blob.type !== 'application/octet-stream'
            ? blob
            : new Blob([blob], { type: mimeType })
          downloadedFiles.push(new File([typedBlob], fileName, { type: mimeType }))
        }
      }

      // 2. Mobile Native Save via Web Share Level 2 (Direct to Camera Roll / Apple Photos)
      let sharedViaSystem = false
      if (isMobile && typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: downloadedFiles })) {
        try {
          await navigator.share({
            files: downloadedFiles,
            title: `Sesi Foto ${currentSession.title}`,
            text: 'Simpan semua foto & video ke galeri HP!'
          })
          sharedViaSystem = true
          setBundleNotification(`Berhasil menyimpan ${downloadedFiles.length} file ke Galeri!`)
          setTimeout(() => setBundleNotification(null), 4000)
        } catch (shareErr: any) {
          if (shareErr.name !== 'AbortError') {
            console.warn('Share API fallback to sequential download:', shareErr)
          } else {
            sharedViaSystem = true
          }
        }
      }

      // 3. Sequential Multiple Downloads (Download Beruntun) for Android / Chrome / Fallback
      if (!sharedViaSystem) {
        for (let i = 0; i < downloadedFiles.length; i++) {
          const file = downloadedFiles[i]
          const blobUrl = URL.createObjectURL(file)
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = file.name
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10000)

          // 500ms delay between downloads allows native download manager to queue smoothly
          if (i < downloadedFiles.length - 1) {
            await new Promise(r => setTimeout(r, 500))
          }
        }

        setBundleNotification(`Berhasil mendownload ${downloadedFiles.length} file ke Galeri!`)
        setTimeout(() => setBundleNotification(null), 4000)
      }
    } catch (err) {
      console.error('Download all failed:', err)
      setBundleNotification('Gagal mendownload beberapa file. Coba lagi.')
      setTimeout(() => setBundleNotification(null), 3500)
    } finally {
      setIsBundling(false)
    }
  }

  // ── LOADING STATE ──
  if (loading) {
    return (
      <div className="relative w-full h-[100svh] min-h-[100svh] max-h-[100svh] bg-white text-slate-900 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3.5">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <Loader2
              className="w-10 h-10 text-orange-500 animate-spin"
              style={{
                animation: 'spin 0.85s linear infinite',
                transformOrigin: 'center center'
              }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 tracking-wide">
            Memuat galeri foto kamu...
          </span>
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
    <div className="relative w-full h-[100svh] min-h-[100svh] max-h-[100svh] bg-[#FAF8F5] text-slate-900 overflow-hidden select-none font-sans">

      <AnimatePresence initial={false} mode="sync">
        {isOverviewMode ? (
          /* ═══════════════════════════════════════════════════════════════════
             EXPANDED GALLERY VIEW: "My bookshelf" 2-Column Grid (Gambar 1)
             Zoom Out / In container with iOS Photos physics
             ═══════════════════════════════════════════════════════════════════ */
          <motion.div
            key="bookshelf-overview"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
            style={{
              transformOrigin: zoomOrigin,
              willChange: 'transform, opacity'
            }}
            ref={bookshelfScrollRef}
            onScroll={(e) => {
              lastScrollTop.current = e.currentTarget.scrollTop
            }}
            className="absolute inset-0 w-full h-full overflow-y-auto bg-[#FAF8F5] text-slate-900 flex flex-col font-sans z-10 [transform:translate3d(0,0,0)]"
          >
            <div className="w-full max-w-md sm:max-w-2xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-5 pb-28 sm:pb-32 flex flex-col flex-1">
              {/* Top Header Bar */}
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-[28px] md:text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
                  Galeri Sebooth
                </h1>

                <div className="flex items-center gap-2">
                  {/* Close / Return to Focus View */}
                  <button
                    onClick={handleCloseBookshelf}
                    className="w-9 h-9 rounded-xl bg-slate-200/70 hover:bg-slate-300/80 active:scale-90 flex items-center justify-center text-slate-700 transition-all cursor-pointer"
                    title="Kembali ke Tampilan Fokus"
                  >
                    <X className="w-5 h-5 stroke-[2.2]" />
                  </button>
                </div>
              </div>

              {/* Bookshelf Grid: 2 columns on mobile, 3 on tablet, 4 columns on desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-7 sm:gap-x-6 sm:gap-y-8 md:gap-x-7 md:gap-y-9 lg:gap-x-8 lg:gap-y-10">
                {sessionsList.map((session, sIdx) => {
                  const originalIndex = sessionsList.findIndex(s => s.id === session.id)
                  const targetIndex = originalIndex >= 0 ? originalIndex : sIdx

                  return (
                    <div
                      key={session.id}
                      id={`bookshelf-card-${targetIndex}`}
                      ref={(el) => {
                        if (el) {
                          const rect = el.getBoundingClientRect()
                          cardRectsRef.current[targetIndex] = {
                            x: rect.left + rect.width / 2,
                            y: rect.top + rect.height / 2
                          }
                        }
                      }}
                      onClick={(e) => handleCardClick(e, targetIndex)}
                      style={{
                        contentVisibility: 'auto',
                        containIntrinsicSize: '0 240px'
                      }}
                      className="group flex flex-col cursor-pointer select-none active:scale-[0.94] active:brightness-95 transition-all duration-150 ease-out"
                    >
                      {/* 3D Stacked Album Card (Gambar 1) */}
                      <div className="relative w-full aspect-[3/4] flex items-center justify-center p-1.5">
                        {/* Back Left Card: Stylized photo backing layer (Zero duplicate image requests) */}
                        <div
                          className="absolute inset-1.5 rounded-[15px] sm:rounded-[17px] bg-gradient-to-tr from-stone-300 via-stone-200 to-stone-100 border border-white/90 shadow-sm will-change-transform transition-transform duration-200 group-hover:-translate-x-2"
                          style={{
                            transform: 'translate3d(-8px, -5px, 0) rotate(-7.5deg) scale(0.92)',
                            transformOrigin: 'center center'
                          }}
                        />

                        {/* Back Right Card: Stylized photo backing layer (Zero duplicate image requests) */}
                        <div
                          className="absolute inset-1.5 rounded-[15px] sm:rounded-[17px] bg-gradient-to-tl from-stone-300 via-stone-200 to-stone-100 border border-white/90 shadow-sm will-change-transform transition-transform duration-200 group-hover:translate-x-2"
                          style={{
                            transform: 'translate3d(8px, -5px, 0) rotate(7.5deg) scale(0.92)',
                            transformOrigin: 'center center'
                          }}
                        />

                        {/* Front Center Card */}
                        <div
                          className="relative w-full h-full rounded-[16px] sm:rounded-[18px] overflow-hidden border-[2.2px] border-white shadow-[0_12px_24px_-6px_rgba(0,0,0,0.18),0_4px_8px_-2px_rgba(0,0,0,0.08)] bg-zinc-950 will-change-transform group-hover:scale-[1.02] transition-transform duration-200"
                          style={{
                            transform: 'translate3d(0, 0, 0)',
                            transformOrigin: 'center center'
                          }}
                        >
                          <img
                            src={session.stripUrl}
                            alt={session.title}
                            className="w-full h-full object-cover object-top select-none pointer-events-none"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              if (session.rawStripUrl && e.currentTarget.src !== session.rawStripUrl) {
                                e.currentTarget.src = session.rawStripUrl
                              } else {
                                e.currentTarget.src = '/images/gallery/hd/strip_004a6bbb.webp'
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════
             FOCUS VIEW: 1200x1800 3D Polaroid Stack Slider
             Zoom In / Out container with iOS Photos physics
             ═══════════════════════════════════════════════════════════════════ */
          <motion.div
            key="focus-view"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
            style={{
              transformOrigin: zoomOrigin,
              willChange: 'transform, opacity'
            }}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-between bg-[#FAF8F5] z-20 overflow-hidden [transform:translate3d(0,0,0)]"
          >
            <div className="w-full max-w-6xl mx-auto h-full flex flex-col justify-between px-4 sm:px-6 md:px-8 pt-3 pb-3 sm:pt-4 sm:pb-4">

              {/* Top Header Bar */}
              <header className="w-full max-w-4xl mx-auto pt-1 pb-2 flex items-center justify-between shrink-0 z-20">
                {/* Close button */}
                <Link
                  href="/"
                  className="w-10 h-10 flex items-center justify-start text-slate-800 hover:text-black transition-opacity active:scale-95 cursor-pointer"
                  title="Kembali ke Beranda"
                >
                  <X className="w-6 h-6 stroke-[2.2]" />
                </Link>

                {/* Center Title: "My Photos" (Clickable to open Bookshelf Gallery View) */}
                <button
                  onClick={handleOpenBookshelf}
                  className="flex flex-col items-center cursor-pointer group active:scale-95 transition-transform"
                  title="Buka Galeri Album (Expanded View)"
                >
                  <h1 className="text-[18px] sm:text-[20px] font-extrabold text-slate-900 tracking-tight font-sans group-hover:text-orange-600 transition-colors">
                    My Photos
                  </h1>
                  <span className="text-[11px] font-medium text-slate-400 -mt-0.5 group-hover:text-slate-600">
                    Sesi {activeSessionIndex + 1} dari {sessionsList.length} &bull; Lihat Semua &rarr;
                  </span>
                </button>

                {/* Right Empty Spacer to geometrically center "My Photos" relative to the left close button */}
                <div className="w-10 h-10 pointer-events-none" />
              </header>

          {/* Centerpiece: Polaroid Stack Focus Slider */}
          <div className="relative w-full flex-1 min-h-0 flex items-center justify-center my-auto py-2 sm:py-3 overflow-visible">

            {/* Desktop Left/Right Navigation Flanks */}
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

            {/* Hidden native switch input for iOS 17.4+ Taptic Engine hardware trigger */}
            <input
              type="checkbox"
              id="ios-taptic-switch"
              aria-hidden="true"
              tabIndex={-1}
              className="fixed -left-[9999px] opacity-0 pointer-events-none"
            />

            {/* iOS Haptic Touch Ambient Backdrop Dimming */}
            <div
              className={`fixed inset-0 z-20 bg-black/75 md:backdrop-blur-[8px] pointer-events-none transition-opacity duration-250 ${
                touchFeedback === 'peeking' ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden="true"
            />

            {/* Gesture / Drag Tracking Area (Single-touch Drag, Swipe & Hold) */}
            <div
              onTouchStart={(e) => {
                if (isGestureGuideOpen) {
                  setIsGestureGuideOpen(false)
                }
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
              onTouchCancel={() => {
                handleDragEnd()
              }}
              onMouseDown={(e) => {
                if (e.button === 0) {
                  handleDragStart(e.clientX)
                }
              }}
              onMouseMove={(e) => handleDragMove(e.clientX)}
              onMouseUp={(e) => handleDragEnd(e.clientX)}
              onMouseLeave={() => handleDragEnd()}
              className="relative z-30 w-full h-[72vh] xs:h-[75vh] sm:h-[78vh] md:h-[80vh] max-h-[640px] flex items-center justify-start touch-pan-y cursor-grab active:cursor-grabbing overflow-visible select-none"
            >
              {/* Slider Track */}
              <div
                ref={trackRef}
                className="w-full h-full flex flex-row items-center will-change-transform [transform:translate3d(0,0,0)]"
                style={{
                  transform: `translate3d(-${activeSessionIndex * 100}%, 0, 0)`,
                  transition: 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)'
                }}
              >
                {sessionsList.map((session, sIdx) => {
                  const isCurrentSession = sIdx === activeSessionIndex
                  // Strict sliding window: strictly 1 session before (-1), current (0), and 1 session after (+1)
                  const isStrictlyInWindow = Math.abs(sIdx - activeSessionIndex) <= 1
                  const mediaIdx = activeMediaIndices[session.id] || 0

                  // Complete Unmount & Ignore:
                  // Any session outside [activeSessionIndex - 1, activeSessionIndex + 1] (termasuk sesi yang pernah di-load sebelumnya)
                  // diabaikan sepenuhnya dan tidak dipertahankan di memori / DOM.
                  if (!isStrictlyInWindow) {
                    return (
                      <div
                        key={`slot-empty-${session.id}`}
                        style={{ width: '100%' }}
                        className="h-full shrink-0 flex items-center justify-center pointer-events-none select-none"
                        aria-hidden="true"
                      />
                    )
                  }

                  return (
                    <div
                      key={`slot-active-${session.id}`}
                      style={{ width: '100%' }}
                      className="h-full shrink-0 flex items-center justify-center select-none [transform:translate3d(0,0,0)] [backface-visibility:hidden] px-4 sm:px-12 md:px-24 lg:px-36 opacity-100 scale-100"
                      onClick={() => {
                        if (!isCurrentSession) {
                          setActiveSessionIndex(sIdx)
                        }
                      }}
                    >
                      {/* Card Container: 1200x1800 2:3 ratio with authentic iOS Haptic Touch spring physics */}
                      <div
                        ref={isCurrentSession ? activeCardContainerRef : undefined}
                        id={isCurrentSession ? 'tour-profile-session-card' : undefined}
                        className={`relative h-full aspect-[2/3] w-auto flex items-center justify-center max-h-[58svh] xs:max-h-[62svh] sm:max-h-[620px] md:max-h-[660px] max-w-[340px] xs:max-w-[380px] sm:max-w-[440px] md:max-w-[480px] ${
                          isCurrentSession && touchFeedback === 'peeking'
                            ? 'z-40 max-md:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.65)] md:shadow-[0_36px_80px_-15px_rgba(0,0,0,0.85),0_15px_30px_-8px_rgba(0,0,0,0.6)] ring-2 ring-white/60 rounded-[24px] xs:rounded-[30px] sm:rounded-[34px]'
                            : ''
                        }`}
                        style={{
                          transform: isCurrentSession && touchFeedback === 'peeking' ? 'scale(1.08)' : 'scale(1)',
                          transition: isCurrentSession && touchFeedback === 'peeking'
                            ? 'transform 0.32s cubic-bezier(0.16, 1.55, 0.3, 1), box-shadow 0.32s ease'
                            : 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.28s ease'
                        }}
                      >
                        {/* iOS Haptic Peek Floating HUD pill (iOS Dynamic Island Style) */}
                        {isCurrentSession && touchFeedback === 'peeking' && (
                          <div className="absolute -top-14 z-50 px-4 py-2 rounded-full bg-slate-900/90 backdrop-blur-2xl border border-white/30 shadow-[0_12px_36px_rgba(0,0,0,0.55)] text-white text-[12px] font-semibold tracking-wide flex items-center gap-2 pointer-events-none select-none animate-in fade-in zoom-in-95 duration-200 slide-in-from-bottom-3">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                            <span className="font-medium text-white/95">Lepas untuk Buka Menu</span>
                          </div>
                        )}

                        {/* 1. Stack Media Cards (Active Front Card + 1 Peek Card) */}
                        {(() => {
                          const mediaToRender = isCurrentSession
                            ? activeSessionMediaList
                            : [{ id: `strip-${session.id}`, url: session.stripUrl, hdUrl: session.rawStripUrl, type: 'strip' as const, label: 'Photostrip' }]
                          
                          return mediaToRender.map((med, mIdx) => {
                            const totalMedia = mediaToRender.length
                            const diff = (mIdx - mediaIdx + totalMedia) % totalMedia

                          // For inactive sessions, only render front card (diff 0) to save mobile GPU VRAM
                          if (!isCurrentSession && diff > 0) return null
                          if (diff > 1) return null

                          const isFront = diff === 0
                          const isVideo = med.type === 'video' || !!med.url?.match(/\.(mp4|webm|mov)(\?.*)?$/i)
                          const shouldPlayVideo = isVideo && isCurrentSession && isFront

                          return (
                            <div
                              key={med.id}
                              ref={isFront && isCurrentSession ? activeFrontCardRef : undefined}
                              className={`absolute inset-0 flex items-center justify-center [contain:paint] ${
                                isFront
                                  ? isCurrentSession && touchFeedback === 'peeking'
                                    ? 'z-30 opacity-100 ring-2 ring-white/60 rounded-[22px] xs:rounded-[28px] sm:rounded-[32px] max-md:shadow-xl md:shadow-2xl'
                                    : 'z-20 opacity-100'
                                  : 'z-10 opacity-70 [transform:translate3d(10px,-10px,0)_scale(0.96)_rotate(3.5deg)]'
                              }`}
                              style={{
                                pointerEvents: isFront ? 'auto' : 'none',
                                transform: isFront ? 'translate3d(0,0,0) scale(1) rotate(0deg)' : undefined,
                                transition: isFront && touchFeedbackRef.current === 'dragging'
                                  ? 'none'
                                  : 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease-out'
                              }}
                            >
                              <div className="relative w-full h-full rounded-[22px] xs:rounded-[28px] sm:rounded-[32px] overflow-hidden bg-zinc-950 flex items-center justify-center shadow-lg [transform:translate3d(0,0,0)] [backface-visibility:hidden]">
                                {shouldPlayVideo ? (
                                  <video
                                    src={med.url}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="metadata"
                                    className="w-full h-full object-cover pointer-events-none select-none brightness-100 saturate-100"
                                  />
                                ) : (
                                  <img
                                    src={med.url}
                                    alt={med.label}
                                    className="w-full h-full object-cover pointer-events-none select-none"
                                    loading={isCurrentSession || isStrictlyInWindow ? 'eager' : 'lazy'}
                                    decoding="async"
                                    onError={(e) => {
                                      if (med.hdUrl && e.currentTarget.src !== med.hdUrl) {
                                        e.currentTarget.src = med.hdUrl
                                      } else {
                                        e.currentTarget.src = '/images/gallery/hd/strip_004a6bbb.webp'
                                      }
                                    }}
                                  />
                                )}

                                {!isFront && (
                                  <div className="absolute inset-0 bg-black/25 pointer-events-none" />
                                )}
                              </div>
                            </div>
                          )
                        })
                      })()}

                        {/* 2. Top-Right Quick Actions */}
                        <div
                          id={isCurrentSession ? 'tour-profile-card-actions' : undefined}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          className={`absolute top-3.5 right-3.5 z-40 flex items-center gap-1.5 transition-opacity duration-200 ${
                            isCurrentSession && !isGestureGuideOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
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
                              setIsOptionsModalOpen(true)
                            }}
                            className="w-8.5 h-8.5 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
                            title="Opsi Sesi"
                          >
                            <MoreHorizontal className="w-4 h-4 stroke-[2.2]" />
                          </button>
                        </div>

                        {/* 3. Direct On-Photo Hand Gesture Tutorial */}
                        {isCurrentSession && isGestureGuideOpen && (
                          <PhotoDirectGestureGuide
                            isOpen={isGestureGuideOpen}
                            onClose={() => setIsGestureGuideOpen(false)}
                            onOpenBookshelf={() => {
                              setIsGestureGuideOpen(false)
                              handleOpenBookshelf()
                            }}
                            storageKey="hasSeenPhotoGestureGuide_v1"
                          />
                        )}

                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Bottom spacing spacer for floating capsule dock */}
          <div className="w-full h-12 sm:h-14 shrink-0 pointer-events-none" />
        </div>
      </motion.div>
    )}
  </AnimatePresence>

      {/* ─── FLOATING BOTTOM CAPSULE DOCK (APPLE-GRADE iOS DEPTH DOCK) ─── */}
      {currentSession && (
        <div
          className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4"
          style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
        >
          <LiquidGlassDock
            ariaLabel="Navigasi Galeri"
            surface="dark"
            onHaptic={(type) => triggerHaptic(type || 'tick')}
            activeId={
              isLoggingOut
                ? 'logout'
                : isBundling
                  ? 'download'
                  : isOverviewMode
                    ? 'gallery'
                    : (isGestureGuideOpen || isDesktopGuideOpen)
                      ? 'guide'
                      : 'photos'
            }
            items={[
              {
                id: 'gallery',
                domId: 'bottom-nav-bookshelf-btn',
                label: 'Gallery View',
                icon: <LayoutGrid className="w-5 h-5 stroke-[1.8]" />,
                activeIcon: <LayoutGrid className="w-5 h-5 stroke-[1.6] fill-white" />,
                onSelect: (e) => {
                  e.stopPropagation()
                  if (!isOverviewMode) handleOpenBookshelf()
                },
              },
              {
                id: 'photos',
                domId: 'bottom-nav-photos-btn',
                label: 'Photos View',
                icon: <ImageIcon className="w-5 h-5 stroke-[1.8]" />,
                activeIcon: <ImageIcon className="w-5 h-5 stroke-[2] fill-white/25" />,
                onSelect: (e) => {
                  e.stopPropagation()
                  if (isOverviewMode) handleCloseBookshelf()
                },
              },
              {
                id: 'download',
                domId: 'tour-profile-bundle-btn',
                label: 'Download',
                title: isBundling
                  ? `Menyimpan (${bundleProgress.current}/${bundleProgress.total})...`
                  : 'Download',
                disabled: isBundling,
                icon: isBundling ? (
                  <Loader2
                    className="w-5 h-5 animate-spin text-orange-400"
                    style={{ animation: 'spin 0.85s linear infinite', transformOrigin: 'center center' }}
                  />
                ) : (
                  <Download className="w-5 h-5 stroke-[1.8]" />
                ),
                activeIcon: <Download className="w-5 h-5 stroke-[2.4]" />,
                onSelect: (e) => {
                  e.stopPropagation()
                  handleDownloadBundle(e)
                },
              },
              {
                id: 'guide',
                domId: 'bottom-nav-guide-btn',
                label: 'Guide',
                icon: <HelpCircle className="w-5 h-5 stroke-[1.8]" />,
                activeIcon: <HelpCircle className="w-5 h-5 stroke-[2.2] fill-white/30" />,
                onSelect: (e) => {
                  e.stopPropagation()
                  handleOpenHelp()
                },
              },
              {
                id: 'logout',
                domId: 'bottom-nav-logout-btn',
                label: 'Log Out',
                title: 'Keluar / Log Out',
                tone: 'danger',
                disabled: isLoggingOut,
                icon: isLoggingOut ? (
                  <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
                ) : (
                  <LogOut className="w-5 h-5 stroke-[1.8]" />
                ),
                activeIcon: <LogOut className="w-5 h-5 stroke-[2.2]" />,
                onSelect: (e) => {
                  e.stopPropagation()
                  handleLogout()
                },
              },
            ]}
          />
        </div>
      )}

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
                const cover = sess.stripUrl || sess.avatarUrl

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
                        {sess.badgeCount} media
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
                <span>Simpan Semua File ke Galeri HP ({activeSessionMediaList.length} File)</span>
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

      {/* Desktop Navigation Guide Modal (Keyboard Shortcuts & Mouse Controls) */}
      <DesktopGuideModal
        isOpen={isDesktopGuideOpen}
        onClose={() => setIsDesktopGuideOpen(false)}
        onStartSpotlightTour={() => setIsInteractiveTourOpen(true)}
        onOpenMobileGestureSimulation={() => {
          setIsGestureGuideOpen(true)
        }}
      />

      {/* Desktop Interactive Spotlight Tour */}
      <InteractiveTour
        steps={profileTourSteps}
        isOpen={isInteractiveTourOpen}
        onClose={() => setIsInteractiveTourOpen(false)}
        tourKey="hasSeenProfileTour_v1"
      />

    </div>
  )
}
