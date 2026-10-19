'use client'

import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Download,
  XCircle,
  Share2,
  Check,
  ChevronLeft,
  ArrowRight,
  Eye,
  X,
  HelpCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { SessionData, MediaItem } from '@/types/database'
import { User } from '@supabase/supabase-js'
import { claimSession } from '@/app/actions'
import Guide from '@/components/guide/Guide'
import { useGuide } from '@/components/guide/useGuide'
import { ACCESS_GUIDE, GUIDE_KEYS } from '@/config/guides'
import { checkSessionExpiry } from '@/lib/sessionExpiryPolicy'
import ClayPillButton from '@/components/ui/ClayPillButton'
import ClaimStatusStrip from '@/components/features/ClaimStatusStrip'
import ReviewSheet from '@/components/features/review/ReviewSheet'
import { FunnelStage, readFunnel, shouldAutoOpen } from '@/lib/reviewFunnel'
import { INSTAGRAM_HANDLE } from '@/config/social'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

interface AccessSessionClientProps {
  session: SessionData
  sessionId: string
}

function getOptimizedDisplayUrl(rawUrl: string, width = 720, quality = 75): string {
  if (!rawUrl) return ''
  if (rawUrl.includes('/api/image')) return rawUrl
  if (rawUrl.match(/\.(gif|mp4|webm|mov)(\?.*)?$/i)) return rawUrl
  if (rawUrl.match(/\.webp(\?.*)?$/i)) return rawUrl
  return `/api/image?url=${encodeURIComponent(rawUrl)}&w=${width}&q=${quality}`
}

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

export default function AccessSessionClient({ session: initialSession, sessionId }: AccessSessionClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const claimAttempted = useRef(false)

  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<SessionData>(initialSession)
  const [error, setError] = useState<string | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [alreadyClaimedByOther, setAlreadyClaimedByOther] = useState(false)
  const [isClaimedByMe, setIsClaimedByMe] = useState(false)

  // Mobile viewport detection for lightweight quality preview
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Download bundle state
  const [isBundling, setIsBundling] = useState(false)
  const [bundleProgress, setBundleProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 })
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [downloadedCount, setDownloadedCount] = useState<number | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [sheetStage, setSheetStage] = useState<FunnelStage | undefined>(undefined)
  const reduceMotion = useReducedMotion()

  const openSheet = (stage?: FunnelStage) => {
    setSheetStage(stage)
    setSheetOpen(true)
  }

  // Lightbox preview modal state
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [previewDir, setPreviewDir] = useState(0)

  // Expiration time & policy check
  const expiryInfo = useMemo(() => {
    return checkSessionExpiry(session.created_at, session.is_claimed)
  }, [session.created_at, session.is_claimed])

  // 1. Check auth
  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { session: authSession } } = await supabase.auth.getSession()
        const currentUser = authSession?.user || null
        setUser(currentUser)

        if (currentUser && session) {
          if (session.is_claimed) {
            if (session.user_id === currentUser.id) {
              setIsClaimedByMe(true)
            } else if (session.user_id) {
              setAlreadyClaimedByOther(true)
            }
          }
        }
      } catch (e) {
        console.error('Auth check error:', e)
      }
    }
    checkUser()
  }, [supabase, session])

  // 2. Auto-claim when user is logged in and session is unclaimed
  useEffect(() => {
    if (user && session && !session.is_claimed && !claimAttempted.current && !isClaiming) {
      claimAttempted.current = true
      handleClaim()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, session])

  // Show temporary toast notification
  const showToast = (msg: string, duration = 3500) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), duration)
  }

  // 3. Normalized Media List
  const mediaList = useMemo(() => {
    const raw = session.media || []
    return raw.map((item: MediaItem, idx: number) => {
      const isVideo = (item.type === 'live' || item.type === 'video' || !!item.url?.match(/\.(mp4|webm|mov)(\?.*)?$/i)) && !item.url?.match(/\.(jpg|jpeg|png|webp|avif)(\?.*)?$/i)
      const isGif = item.type === 'gif' || !!item.url?.match(/\.gif(\?.*)?$/i)
      const isStrip = !isVideo && !isGif && ((item.type as string) === 'strip' || !!item.url?.toLowerCase().includes('strip'))

      const label = isStrip
        ? 'Photostrip'
        : isVideo
        ? 'Live Video'
        : isGif
        ? 'Live GIF'
        : `Foto Pose ${idx + 1}`

      return {
        id: item.id || `m-${idx}`,
        url: item.url,
        displayUrl: getOptimizedDisplayUrl(item.url, isMobile ? 480 : 720, isMobile ? 60 : 75),
        type: isVideo ? 'video' : isGif ? 'gif' : isStrip ? 'strip' : 'photo',
        label
      }
    })
  }, [session.media, isMobile])

  const previewMedia = previewIndex !== null ? mediaList[previewIndex] ?? null : null
  const guide = useGuide(GUIDE_KEYS.access, { enabled: mediaList.length > 0 && !sheetOpen && previewIndex === null })
  const stepPreview = (dir: number) => {
    if (previewIndex === null || mediaList.length < 2) return
    setPreviewDir(dir)
    setPreviewIndex((previewIndex + dir + mediaList.length) % mediaList.length)
  }

  // Lightbox keyboard: arrows to browse, Esc to close
  useEffect(() => {
    if (previewIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewIndex(null)
      else if (e.key === 'ArrowRight') stepPreview(1)
      else if (e.key === 'ArrowLeft') stepPreview(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewIndex, mediaList.length])

  // 4. Handle Claim
  const handleClaim = async () => {
    if (!user) {
      router.push(`/login?claim=${sessionId}`)
      return
    }
    if (isClaiming) return
    setIsClaiming(true)

    try {
      const res = await claimSession(sessionId)
      if (!res.success) throw new Error(res.error || 'Gagal mengklaim sesi ini.')

      setClaimSuccess(true)
      setIsClaimedByMe(true)
      setSession(prev => ({ ...prev, is_claimed: true, user_id: user.id }))
      showToast('Sesi berhasil diklaim dan tersimpan di akun kamu.')
    } catch (err: any) {
      console.error('Claim error:', err)
      setError(err.message || 'Gagal mengklaim sesi. Silakan coba lagi.')
    } finally {
      setIsClaiming(false)
    }
  }

  // 5. Share link
  const handleShare = () => {
    const shareUrl = window.location.href
    if (navigator.share) {
      navigator.share({
        title: `Foto Sesi Sebooth · ${session.event_name || 'Sebooth Studio'}`,
        text: 'Lihat dan simpan foto hasil photobooth kita di Sebooth.',
        url: shareUrl
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(shareUrl)
      showToast('Tautan sesi berhasil disalin ke clipboard.')
    }
  }

  // 6. Individual Download
  const handleDownloadSingle = (e: React.MouseEvent, item: { url: string; type: string; label: string }, index: number) => {
    e.stopPropagation()
    const ext = item.type === 'video' ? 'mp4' : item.type === 'gif' ? 'gif' : 'jpg'
    const sessionSlug = session.event_name?.replace(/[^a-zA-Z0-9_-]+/g, '_') || `Sebooth_${sessionId.slice(0, 6)}`
    const fileName = `Sebooth_${sessionSlug}_${item.label.replace(/\s+/g, '_')}_${index + 1}.${ext}`

    const rawTarget = getRawOriginalUrl(item.url)
    const link = document.createElement('a')
    link.href = `/api/download?url=${encodeURIComponent(rawTarget)}&filename=${encodeURIComponent(fileName)}`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast(`Mengunduh ${item.label}...`)
  }

  // 7. Bundle Download: Multiple Sequential Downloads directly to User's Gallery (No ZIP)
  const handleDownloadBundle = async (): Promise<number> => {
    if (mediaList.length === 0 || isBundling) return 0
    let savedCount = 0
    setIsBundling(true)
    const total = mediaList.length
    setBundleProgress({ current: 0, total })

    try {
      const isMobileDevice = typeof window !== 'undefined' && (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 1))
      const sessionSlug = session.event_name?.replace(/[^a-zA-Z0-9_-]+/g, '_') || `Sebooth_${sessionId.slice(0, 6)}`
      const downloadedFiles: File[] = []

      // Step A: Fetch all media files with clean MIME types
      for (let i = 0; i < total; i++) {
        const item = mediaList[i]
        setBundleProgress({ current: i + 1, total })

        let ext = 'jpg'
        let mimeType = 'image/jpeg'
        if (item.type === 'video' || item.url.match(/\.(mp4|mov|webm)/i)) {
          ext = 'mp4'
          mimeType = 'video/mp4'
        } else if (item.type === 'gif' || item.url.match(/\.gif/i)) {
          ext = 'gif'
          mimeType = 'image/gif'
        } else if (item.url.match(/\.png/i)) {
          ext = 'png'
          mimeType = 'image/png'
        }

        const labelSlug = item.label.replace(/\s+/g, '_')
        const fileName = `Sebooth_${sessionSlug}_${labelSlug}.${ext}`

        const targetUrl = getRawOriginalUrl(item.url)
        let blob: Blob | null = null
        try {
          const res = await fetch(targetUrl)
          if (res.ok) {
            blob = await res.blob()
          }
        } catch {
          blob = null
        }

        if (!blob) {
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

      // Step B: Native Save via Web Share Level 2 on Mobile (Direct to Camera Roll / iOS Photos)
      let savedViaShare = false
      if (isMobileDevice && typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: downloadedFiles })) {
        try {
          await navigator.share({
            files: downloadedFiles,
            title: `Sesi Foto ${session.event_name || 'Sebooth'}`,
            text: 'Simpan semua foto & video ke galeri perangkat.'
          })
          savedViaShare = true
          savedCount = downloadedFiles.length
          showToast(`Berhasil menyimpan ${downloadedFiles.length} file ke galeri.`)
        } catch (shareErr: any) {
          if (shareErr.name !== 'AbortError') {
            console.warn('Share API fallback to sequential download:', shareErr)
          } else {
            savedViaShare = true
          }
        }
      }

      // Step C: Fallback Sequential Multiple Downloads for Android / Chrome / PC
      if (!savedViaShare) {
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

          if (i < downloadedFiles.length - 1) {
            await new Promise(r => setTimeout(r, 450))
          }
        }
        savedCount = downloadedFiles.length
        showToast(`Berhasil mengunduh ${downloadedFiles.length} file ke perangkat.`)
      }
    } catch (err) {
      console.error('Download all failed:', err)
      showToast('Gagal mengunduh beberapa file. Silakan coba lagi.')
    } finally {
      setIsBundling(false)
    }
    return savedCount
  }

  // 8. Download first, ask later: once every file is saved, slide up the rating → Google → Instagram sheet
  const handleDownloadClick = async () => {
    const saved = await handleDownloadBundle()
    if (saved > 0) {
      setDownloadedCount(saved)
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2800)
      if (shouldAutoOpen(readFunnel(sessionId))) {
        setTimeout(() => openSheet(), reduceMotion ? 0 : 600)
      }
    }
  }

  // Format date display
  const formattedDate = useMemo(() => {
    if (!session.created_at) return ''
    const d = new Date(session.created_at)
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [session.created_at])

  // Error screen
  if (error) {
    return (
      <div className="min-h-[100svh] bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center font-sans text-slate-900">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4 text-rose-600 shadow-xs">
          <XCircle className="w-7 h-7 stroke-[2]" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Terjadi Kendala</h1>
        <p className="mt-1.5 text-slate-600 text-xs sm:text-sm max-w-sm leading-relaxed">{error}</p>
        <div className="mt-6 flex items-center gap-2.5">
          <button
            onClick={() => setError(null)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-black transition-colors"
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium text-xs hover:bg-slate-50 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100svh] bg-[#FAF8F5] text-slate-900 flex flex-col font-sans select-none antialiased">

      {/* ─── TOAST NOTIFICATION ─── */}
      <div role="status" aria-live="polite" className="fixed top-[68px] left-1/2 -translate-x-1/2 z-50 pointer-events-none w-[calc(100%-32px)] max-w-sm flex justify-center">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              key={toastMessage}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="px-4 py-2.5 rounded-full bg-slate-950 text-white font-medium text-[14px] shadow-xl flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── TOP APP BAR ─── */}
      <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-100/70 flex items-center justify-center text-slate-700 transition-colors shrink-0 shadow-xs cursor-pointer"
            title="Kembali ke Beranda"
            aria-label="Kembali ke Beranda"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black font-bayon text-base sm:text-lg uppercase tracking-wider text-[#002366]">
                SEBOOTH<span className="text-[#FF4500]">.</span>
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs text-slate-600 font-medium truncate max-w-[150px] sm:max-w-xs">
                {session.event_name || 'Softfile Sesi'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Share Button */}
          <button
            id="tour-claim-share-btn"
            onClick={handleShare}
            className="w-9 h-9 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-100/70 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
            title="Bagikan Tautan Sesi Ini"
            aria-label="Bagikan Tautan"
          >
            <Share2 className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Interactive Tour / Help Button */}
          <button
            id="tour-claim-help-btn"
            onClick={guide.start}
            className="w-9 h-9 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-100/70 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
            title="Buka Panduan Penggunaan"
            aria-label="Panduan Penggunaan"
          >
            <HelpCircle className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </header>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-36 sm:pb-32 flex-1 flex flex-col gap-5">

        {/* ─── 1. HERO ─── */}
        <section className="pt-1">
          <h1 className="text-[30px] sm:text-[40px] font-black font-bayon uppercase text-[#181B34] tracking-tight leading-none">
            Foto & Video Sesi Kamu
          </h1>
          <p className="mt-2 text-[14px] text-slate-600 leading-relaxed">
            {session.event_name || 'Sebooth Studio'} · {mediaList.length} media
            {formattedDate ? ` · ${formattedDate}` : ''}
          </p>
        </section>

        {/* ─── 2. STORAGE STATUS (hidden once the session is in the user's own account) ─── */}
        {!isClaimedByMe && (
          <ClaimStatusStrip
            id="tour-claim-urgent-banner"
            variant={alreadyClaimedByOther ? 'other' : !expiryInfo.isSubjectToPolicy ? 'legacy' : expiryInfo.isExpired ? 'expired' : 'active'}
            timeString={expiryInfo.timeString}
            userName={user ? user.email?.split('@')[0] : null}
            isClaiming={isClaiming}
            onClaim={handleClaim}
            onLogin={() => router.push(`/login?claim=${sessionId}`)}
            onRegister={() => router.push(`/register?claim=${sessionId}`)}
          />
        )}

        {/* ─── 4. MEDIA GALLERY GRID ─── */}
        <section>
          <div id="tour-claim-tip-banner" className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-3 px-0.5">
            <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">
              Semua media ({mediaList.length})
            </h2>
            <p className="text-[13px] text-slate-500">
              Ketuk untuk lihat penuh, tahan untuk simpan cepat di HP
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {mediaList.map((item, idx) => {
              const isVideo = item.type === 'video'
              const isStrip = item.type === 'strip'

              return (
                <motion.div
                  key={item.id}
                  id={idx === 0 ? 'tour-claim-first-media' : undefined}
                  role="button"
                  tabIndex={0}
                  aria-label={`Lihat ${item.label}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setPreviewIndex(idx)
                    }
                  }}
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -40px 0px' }}
                  transition={{ duration: 0.36, delay: reduceMotion ? 0 : Math.min(idx, 8) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setPreviewIndex(idx)}
                  className={`group relative rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center select-auto ${
                    isStrip ? 'aspect-[2/3] row-span-1' : 'aspect-[3/4]'
                  }`}
                  style={{
                    WebkitTouchCallout: 'default'
                  }}
                >
                  {/* Media Element */}
                  {isVideo ? (
                    <video
                      src={item.url}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 pointer-events-auto"
                      style={{ WebkitTouchCallout: 'default' }}
                    />
                  ) : (
                    <img
                      src={item.displayUrl}
                      alt={item.label}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 select-auto pointer-events-auto"
                      style={{ WebkitTouchCallout: 'default' }}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        if (item.url && e.currentTarget.src !== item.url) {
                          e.currentTarget.src = item.url
                        }
                      }}
                    />
                  )}

                  {/* Top-Left Media Type Badge */}
                  <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-md bg-black/55 backdrop-blur-md text-white/95 text-[10px] font-medium tracking-wide uppercase border border-white/10 shadow-xs">
                      {item.label}
                    </span>
                  </div>

                  {/* Top-Right Apple Liquid Glass Circular Download Button */}
                  <button
                    onClick={(e) => handleDownloadSingle(e, item, idx)}
                    className="absolute top-2.5 right-2.5 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-black/65 text-white backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-sm active:scale-90 transition-all cursor-pointer"
                    title={`Unduh ${item.label}`}
                    aria-label={`Unduh ${item.label}`}
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.4]" />
                  </button>

                  {/* Bottom Hover Preview Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 pointer-events-none">
                    <span className="text-[11px] font-medium text-white/95 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 stroke-[2]" />
                      Lihat detail
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* ─── 3. AFTER-DOWNLOAD ASKS (quiet, always reachable even if the sheet was dismissed) ─── */}
        {mediaList.length > 0 && (
          <section id="tour-claim-after-card" aria-labelledby="after-card-title" className="rounded-2xl bg-white px-4 py-4 sm:px-5">
            <h2 id="after-card-title" className="text-[16px] font-bold text-slate-900 tracking-tight">
              Suka hasilnya?
            </h2>
            <p className="mt-0.5 text-[14px] text-slate-600">Dua langkah kecil yang sangat membantu tim Sebooth.</p>
            <div className="mt-3 flex flex-col divide-y divide-slate-100">
              <button type="button" onClick={() => openSheet('rating')} className="min-h-[52px] flex items-center justify-between gap-3 text-left cursor-pointer group">
                <span className="text-[15px] font-medium text-slate-900">Beri rating dan ulasan Google</span>
                <ArrowRight className="w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-1" />
              </button>
              <button type="button" onClick={() => openSheet('instagram')} className="min-h-[52px] flex items-center justify-between gap-3 text-left cursor-pointer group">
                <span className="text-[15px] font-medium text-slate-900">Follow @{INSTAGRAM_HANDLE} di Instagram</span>
                <ArrowRight className="w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </section>
        )}

      </main>

      {/* ─── 5. LIGHTBOX: swipe or arrow keys to browse ─── */}
      <AnimatePresence>
        {previewMedia && previewIndex !== null && (
          <motion.div
            key="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={previewMedia.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setPreviewIndex(null)}
            className="fixed inset-0 z-50 flex flex-col bg-slate-950/95"
          >
            <div onClick={(e) => e.stopPropagation()} className="w-full flex items-center justify-between px-4 py-3 text-white">
              <span className="text-[14px] font-medium tabular-nums">
                {previewMedia.label} · {previewIndex + 1}/{mediaList.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDownloadSingle(e, previewMedia, previewIndex)}
                  className="min-h-[40px] px-4 rounded-full bg-white text-slate-900 text-[14px] font-semibold flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
                >
                  <Download className="w-4 h-4 stroke-[2.2]" />
                  <span>Unduh</span>
                </button>
                <button
                  id="tour-lightbox-close"
                  onClick={() => setPreviewIndex(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Tutup preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden px-3" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={previewMedia.id}
                  id="tour-lightbox-media"
                  initial={reduceMotion ? { opacity: 0 } : { x: previewDir * 80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { x: previewDir * -80, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 34 }}
                  drag={mediaList.length > 1 && previewMedia.type !== 'video' ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.5}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -70 || info.velocity.x < -500) stepPreview(1)
                    else if (info.offset.x > 70 || info.velocity.x > 500) stepPreview(-1)
                  }}
                  className="max-h-full max-w-full flex items-center justify-center touch-pan-y"
                >
                  {previewMedia.type === 'video' ? (
                    <video src={previewMedia.url} autoPlay controls playsInline className="max-h-[78svh] w-auto max-w-full rounded-lg object-contain" />
                  ) : (
                    <img
                      src={previewMedia.displayUrl || previewMedia.url}
                      alt={previewMedia.label}
                      draggable={false}
                      className="max-h-[78svh] w-auto max-w-full rounded-lg object-contain select-auto"
                      style={{ WebkitTouchCallout: 'default' }}
                      onError={(e) => {
                        if (previewMedia.url && e.currentTarget.src !== previewMedia.url) {
                          e.currentTarget.src = previewMedia.url
                        }
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {mediaList.length > 1 && (
                <>
                  <button
                    onClick={() => stepPreview(-1)}
                    aria-label="Media sebelumnya"
                    className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => stepPreview(1)}
                    aria-label="Media berikutnya"
                    className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                  </button>
                </>
              )}
            </div>

            <p onClick={(e) => e.stopPropagation()} className="px-4 py-3 text-center text-white/60 text-[13px]">
              {mediaList.length > 1 ? 'Geser kiri atau kanan untuk media lain. ' : ''}Tahan foto untuk simpan di HP.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FOOTER ─── */}
      <footer className="text-center py-6 mt-auto border-t border-slate-200/80 bg-white mb-32 sm:mb-28">
        <p className="text-[11px] text-slate-400 font-medium">
          &copy; 2026 Sebooth Indonesia &middot; Digital Photobooth Experience
        </p>
      </footer>

      {/* ─── GLOBAL FLOATING 3D CLAY PILL ACTION BAR (IMAGE 2 STYLE) ─── */}
      <aside
        aria-label="Aksi Galeri Cepat"
        className="fixed z-40 w-auto max-w-fit pointer-events-auto flex items-center justify-center"
        style={{
          position: 'fixed',
          bottom: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          isolation: 'isolate',
        }}
      >
        <ClayPillButton
          id="tour-claim-bundle-btn"
          onClick={handleDownloadClick}
          disabled={isBundling || mediaList.length === 0}
          loading={isBundling}
          progress={bundleProgress}
          done={justSaved}
          title="Download All Photo"
          titleAttr="Download All Photo"
          ariaLabel="Download All Photo"
        />
      </aside>

      {/* Post-download rating → Google Review → Instagram */}
      <ReviewSheet
        open={sheetOpen}
        sessionId={sessionId}
        eventName={session.event_name}
        initialStage={sheetStage}
        doneNote={downloadedCount ? `${downloadedCount} file sudah tersimpan di perangkatmu.` : undefined}
        onClose={() => setSheetOpen(false)}
      />

      {/* Interactive guide: spotlight + gesture, "do it to continue" steps */}
      <Guide steps={ACCESS_GUIDE} open={guide.open} onClose={guide.close} storageKey={GUIDE_KEYS.access} />

    </div>
  )
}
