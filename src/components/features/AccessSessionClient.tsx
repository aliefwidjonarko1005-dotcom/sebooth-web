'use client'

import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Download, Loader2, CheckCircle2, XCircle,
  Clock, AlertTriangle, Share2, Sparkles, Check,
  ChevronLeft, ArrowRight, ShieldCheck, Image as ImageIcon,
  Eye, X, HelpCircle, Star
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { SessionData, MediaItem } from '@/types/database'
import { User } from '@supabase/supabase-js'
import { claimSession } from '@/app/actions'
import InteractiveTour, { TourStep } from '@/components/ui/InteractiveTour'
import { checkSessionExpiry } from '@/lib/sessionExpiryPolicy'
import GoogleReviewPromptCard from '@/components/features/GoogleReviewPromptCard'

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

  // Lightbox preview modal state
  const [previewMedia, setPreviewMedia] = useState<{ url: string; displayUrl?: string; type: string; label: string } | null>(null)
  const [isTourOpen, setIsTourOpen] = useState(false)

  // Expiration time & policy check
  const expiryInfo = useMemo(() => {
    return checkSessionExpiry(session.created_at, session.is_claimed)
  }, [session.created_at, session.is_claimed])

  // Interactive Tour Steps (Editorial, calm, zero emojis, zero em-dashes)
  const claimTourSteps: TourStep[] = useMemo(() => [
    {
      targetId: 'tour-claim-urgent-banner',
      title: expiryInfo.isSubjectToPolicy
        ? 'Batas Simpan Sementara 3 Hari'
        : 'Tautkan Sesi ke Akun Sebooth',
      description: expiryInfo.isSubjectToPolicy
        ? 'Sesi foto dari kiosk photobooth disimpan sementara di server selama 3 hari. Masuk atau buat akun Sebooth agar seluruh foto tersimpan permanen di galeri kamu.'
        : 'Sesi ini dibuat sebelum kebijakan retensi berlaku. Masuk atau buat akun Sebooth agar foto tersimpan rapi di profil kamu.',
      badgeText: expiryInfo.isSubjectToPolicy
        ? 'Fase 1: Informasi Simpan'
        : 'Fase 1: Tautkan Akun',
      icon: expiryInfo.isSubjectToPolicy ? <Clock className="w-5 h-5 text-amber-700" /> : <ShieldCheck className="w-5 h-5 text-emerald-700" />,
      gesture: 'tap',
      gestureLabel: 'Masuk atau Buat Akun'
    },
    {
      targetId: 'tour-claim-bundle-btn',
      title: 'Unduh Semua File ke Galeri',
      description: 'Kamu dapat langsung mengunduh seluruh media (photostrip, live video, dan foto) tanpa harus masuk akun terlebih dahulu. File akan diunduh berurutan ke penyimpanan perangkat tanpa arsip ZIP.',
      badgeText: 'Fase 2: Unduh Langsung',
      icon: <Download className="w-5 h-5 text-slate-700" />,
      gesture: 'tap',
      gestureLabel: 'Unduh Semua Media'
    },
    {
      targetId: 'tour-claim-tip-banner',
      title: 'Simpan Cepat di Layar HP',
      description: 'Pada browser ponsel, tekan dan tahan (long-press) foto yang diinginkan, lalu pilih simpan gambar untuk menyimpannya langsung ke galeri.',
      badgeText: 'Fase 3: Simpan via HP',
      icon: <Sparkles className="w-5 h-5 text-slate-700" />,
      gesture: 'hold',
      gestureLabel: 'Tahan Foto di Layar'
    },
    {
      targetId: 'tour-claim-google-review-card',
      title: 'Ulasan di Google Maps',
      description: 'Bantu studio Sebooth berkembang dengan memberikan rating bintang 5 di Google Maps. Tersedia pilihan contoh ulasan yang dapat disalin dengan satu sentuhan.',
      badgeText: 'Fase 4: Dukung Studio',
      icon: <Star className="w-5 h-5 text-amber-500 fill-amber-500" />,
      gesture: 'tap',
      gestureLabel: 'Beri Ulasan di Google'
    },
    {
      targetId: 'tour-claim-first-media',
      title: 'Preview Detail Resolusi Penuh',
      description: 'Ketuk media mana pun untuk membuka tampilan layar besar dan memeriksa ketajaman foto.',
      badgeText: 'Fase 5: Pratinjau',
      icon: <ImageIcon className="w-5 h-5 text-slate-700" />,
      gesture: 'pinch',
      gestureLabel: 'Ketuk untuk Detail'
    },
    {
      targetId: 'tour-claim-share-btn',
      title: 'Bagikan Tautan Sesi',
      description: 'Gunakan tombol ini untuk membagikan tautan sesi ini kepada teman-teman atau menyalin link sesi.',
      badgeText: 'Fase 6: Bagikan Tautan',
      icon: <Share2 className="w-5 h-5 text-slate-700" />,
      gesture: 'tap',
      gestureLabel: 'Bagikan Tautan'
    }
  ], [expiryInfo.isSubjectToPolicy])

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
      showToast('Sesi berhasil diklaim dan tersimpan permanen di akun kamu.')
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
  const handleDownloadBundle = async () => {
    if (mediaList.length === 0 || isBundling) return
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
        showToast(`Berhasil mengunduh ${downloadedFiles.length} file ke perangkat.`)
      }
    } catch (err) {
      console.error('Download all failed:', err)
      showToast('Gagal mengunduh beberapa file. Silakan coba lagi.')
    } finally {
      setIsBundling(false)
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
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md text-white font-medium text-xs sm:text-sm shadow-xl border border-white/10 flex items-center gap-2 animate-fade-in pointer-events-none">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

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
              <span className="font-bold text-sm text-slate-900 tracking-tight">
                Sebooth
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs text-slate-600 font-medium truncate max-w-[150px] sm:max-w-xs">
                {session.event_name || 'Softfile Sesi'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Profile / Account Gallery Link if Claimed */}
          {isClaimedByMe && (
            <Link
              href="/profile"
              className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-800 border border-slate-200/80 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-700 stroke-[2.2]" />
              <span className="hidden xs:inline">Galeri Akun</span>
            </Link>
          )}

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
            onClick={() => setIsTourOpen(true)}
            className="w-9 h-9 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-100/70 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
            title="Buka Panduan Penggunaan"
            aria-label="Panduan Penggunaan"
          >
            <HelpCircle className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </header>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-24 flex-1 flex flex-col gap-6">

        {/* ─── 1. TOP STATUS & RETENTION CALLOUT ─── */}
        <section id="tour-claim-urgent-banner">
          {isClaimedByMe ? (
            /* Already Claimed by Current User */
            <div className="w-full rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Sesi tersimpan permanen di akun kamu
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Seluruh foto dan video sesi ini telah terhubung ke profil Sebooth kamu dan tidak memiliki batas kedaluwarsa.
                  </p>
                </div>
              </div>
              <Link
                href="/profile"
                className="shrink-0 self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Buka Galeri Akun</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : alreadyClaimedByOther ? (
            /* Claimed by Another User */
            <div className="w-full rounded-2xl bg-slate-100/80 border border-slate-200 p-4 sm:p-5 flex items-start gap-3 text-slate-700 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Sesi ini telah ditautkan ke akun lain
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Sesi ini sudah diklaim oleh pemilik akun lain. Namun, kamu tetap dapat melihat dan mengunduh seluruh media di bawah kapan saja.
                </p>
              </div>
            </div>
          ) : !expiryInfo.isSubjectToPolicy ? (
            /* Unclaimed Session BEFORE Policy Date: Permanent Safe Storage (Grandfathered Legacy Session) */
            <div className="w-full rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 flex flex-col gap-3.5 shadow-xs">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/80">
                    Penyimpanan Permanen
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Bebas batas kedaluwarsa
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Arsip Sesi
                </span>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                  Tautkan sesi ini ke akun Sebooth kamu
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Sesi ini dibuat sebelum kebijakan retensi 3 hari diberlakukan, sehingga file kamu aman. Masuk atau buat akun agar foto tersimpan rapi di galeri profil kamu selamanya.
                </p>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
                {user ? (
                  <button
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    {isClaiming ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menautkan sesi...</span>
                      </>
                    ) : (
                      <span>Tautkan ke Akun ({user.email?.split('@')[0]})</span>
                    )}
                  </button>
                ) : (
                  <div className="w-full flex flex-col sm:flex-row items-center gap-2">
                    <button
                      onClick={() => router.push(`/login?claim=${sessionId}`)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Masuk & Tautkan Sesi</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => router.push(`/register?claim=${sessionId}`)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium border border-slate-200 transition-colors cursor-pointer flex items-center justify-center"
                    >
                      Buat Akun Baru
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : expiryInfo.isExpired ? (
            /* Unclaimed Session AFTER Policy Date AND EXPIRED (> 3 days) */
            <div className="w-full rounded-2xl bg-white border border-rose-200 p-5 sm:p-6 flex flex-col gap-3 shadow-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-200">
                  Batas Simpan Sementara Berakhir
                </span>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                  Sesi ini melewati batas simpan sementara 3 hari
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Sesi ini belum sempat diklaim ke akun Sebooth. Unduh softfile yang tersedia di bawah ini sekarang ke perangkat kamu sebelum pembersihan berkala server dilakukan.
                </p>
              </div>
            </div>
          ) : (
            /* Unclaimed Session AFTER Policy Date AND ACTIVE (< 3 days): High-Contrast Restrained Urgency */
            <div className="w-full rounded-2xl bg-[#FFFDF9] border border-amber-300/80 p-5 sm:p-6 flex flex-col gap-3.5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100/80 text-amber-900 text-[11px] font-semibold border border-amber-200">
                    Penyimpanan Sementara
                  </span>
                  <span className="text-xs font-semibold text-amber-900">
                    Sisa Waktu: {expiryInfo.timeString}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Batas Server: 3 Hari
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Simpan sesi ini permanen ke akun Sebooth kamu
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Foto dan video sesi kiosk disimpan sementara selama 3 hari. Masuk atau buat akun sekarang agar seluruh file tersimpan selamanya di galeri akun kamu.
                </p>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
                {user ? (
                  <button
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    {isClaiming ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan ke akun...</span>
                      </>
                    ) : (
                      <span>Klaim ke Akun Saya ({user.email?.split('@')[0]})</span>
                    )}
                  </button>
                ) : (
                  <div className="w-full flex flex-col sm:flex-row items-center gap-2">
                    <button
                      onClick={() => router.push(`/login?claim=${sessionId}`)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Masuk & Klaim Sesi</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => router.push(`/register?claim=${sessionId}`)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium border border-slate-200 transition-colors cursor-pointer flex items-center justify-center"
                    >
                      Daftar Akun Baru
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ─── 2. HERO SECTION & PRIMARY ACTIONS ─── */}
        <section className="text-center pt-3 pb-2 flex flex-col items-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
            Koleksi Softfile
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Foto & Video Sesi Kamu
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {session.event_name || 'Sebooth Studio'} · {mediaList.length} media
            {formattedDate ? ` · ${formattedDate}` : ''}
          </p>

          {/* Action Buttons */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full sm:w-auto">
            <button
              id="tour-claim-bundle-btn"
              onClick={handleDownloadBundle}
              disabled={isBundling || mediaList.length === 0}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xs active:scale-98 transition-all cursor-pointer ${
                isBundling
                  ? 'bg-slate-800 text-slate-300 cursor-wait'
                  : mediaList.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-black text-white'
              }`}
              title="Unduh seluruh foto dan video sesi ini ke galeri perangkat"
            >
              {isBundling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                  <span>
                    Menyimpan ke Galeri ({bundleProgress.current}/{bundleProgress.total})...
                  </span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.2]" />
                  <span>Unduh Semua Media ({mediaList.length})</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('tour-claim-google-review-card')
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xs active:scale-98 transition-all cursor-pointer"
              title="Beri ulasan di Google Maps"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Beri Ulasan Studio</span>
            </button>
          </div>

          <p className="mt-3 text-[11px] text-slate-400 font-medium">
            File diunduh berurutan langsung ke galeri HP tanpa file ZIP
          </p>
        </section>

        {/* ─── 3. GOOGLE REVIEW 5-STAR PROMPT CARD ─── */}
        <GoogleReviewPromptCard
          sessionId={sessionId}
          eventName={session.event_name}
        />

        {/* ─── 4. MEDIA GALLERY GRID ─── */}
        <section>
          <div id="tour-claim-tip-banner" className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-3.5 px-0.5">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Semua Media ({mediaList.length})
            </h3>
            <p className="text-[11px] text-slate-500 font-normal">
              Ketuk foto untuk perbesar · Tahan (long-press) di layar HP untuk opsi simpan cepat
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {mediaList.map((item, idx) => {
              const isVideo = item.type === 'video'
              const isStrip = item.type === 'strip'

              return (
                <div
                  key={item.id}
                  id={idx === 0 ? 'tour-claim-first-media' : undefined}
                  onClick={() => setPreviewMedia(item)}
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
                    />
                  )}

                  {/* Top-Left Media Type Badge */}
                  <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-md bg-black/55 backdrop-blur-md text-white/95 text-[10px] font-medium tracking-wide uppercase border border-white/10 shadow-xs">
                      {item.label}
                    </span>
                  </div>

                  {/* Top-Right Frosted Glass Download Button */}
                  <button
                    onClick={(e) => handleDownloadSingle(e, item, idx)}
                    className="absolute top-2.5 right-2.5 z-30 w-8 h-8 rounded-lg bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/15 flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
                    title={`Unduh ${item.label}`}
                    aria-label={`Unduh ${item.label}`}
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>

                  {/* Bottom Hover Preview Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 pointer-events-none">
                    <span className="text-[11px] font-medium text-white/95 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 stroke-[2]" />
                      Lihat detail
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

      </main>

      {/* ─── 5. LIGHTBOX DETAIL PREVIEW MODAL ─── */}
      {previewMedia && (
        <div
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-slate-950 rounded-2xl overflow-hidden border border-white/15 shadow-2xl flex flex-col items-center"
          >
            {/* Top Modal Controls */}
            <div className="w-full flex items-center justify-between p-3.5 bg-slate-900/90 border-b border-white/10 z-20">
              <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">
                {previewMedia.label}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    const idx = mediaList.findIndex(m => m.url === previewMedia.url)
                    handleDownloadSingle(e, previewMedia, idx >= 0 ? idx : 0)
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Unduh</span>
                </button>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Tutup preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Media Body */}
            <div className="relative w-full max-h-[75vh] flex items-center justify-center p-3 overflow-hidden">
              {previewMedia.type === 'video' ? (
                <video
                  src={previewMedia.url}
                  autoPlay
                  controls
                  playsInline
                  className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain select-auto pointer-events-auto"
                />
              ) : (
                <img
                  src={previewMedia.displayUrl || previewMedia.url}
                  alt={previewMedia.label}
                  className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain select-auto pointer-events-auto"
                  style={{ WebkitTouchCallout: 'default' }}
                />
              )}
            </div>

            {/* Bottom Hint */}
            <div className="w-full p-3 bg-slate-900/90 border-t border-white/10 text-center text-slate-400 text-[11px]">
              Tahan (long-press) foto untuk opsi simpan di HP, atau gunakan tombol Unduh di atas
            </div>
          </div>
        </div>
      )}

      {/* ─── FOOTER ─── */}
      <footer className="text-center py-6 mt-auto border-t border-slate-200/80 bg-white">
        <p className="text-[11px] text-slate-400 font-medium">
          &copy; 2026 Sebooth Indonesia &middot; Digital Photobooth Experience
        </p>
      </footer>

      {/* Interactive Phase-by-Phase Tour */}
      <InteractiveTour
        steps={claimTourSteps}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        tourKey="hasSeenClaimTour_v1"
      />

    </div>
  )
}
