'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Film, Zap, Grid, ArrowRight, Image as ImageIcon } from 'lucide-react'
import NextImage from 'next/image'
import type { SessionData, MediaItem } from '@/types/database'

interface SessionFeedCardProps {
  session: SessionData
  index: number
  showOwner?: boolean
}

/* ─── Media helpers (extract from session) ─── */
function getSortedMediaFromSession(session: SessionData): MediaItem[] {
  if (!session.media) return []
  return [...session.media].sort((a, b) => {
    const nameA = a.url.split('/').pop() || ''
    const nameB = b.url.split('/').pop() || ''
    return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' })
  })
}

function getStripFromSession(session: SessionData): MediaItem | null {
  const sorted = getSortedMediaFromSession(session)
  return sorted.find(
    (m) =>
      (m as any).type === 'strip' ||
      (m.metadata as Record<string, unknown>)?.is_strip ||
      m.url?.toLowerCase().includes('strip') ||
      m.url?.toLowerCase().includes('photostrip')
  ) || null
}

function getGifFromSession(session: SessionData): MediaItem | null {
  const sorted = getSortedMediaFromSession(session)
  return sorted.find(
    (m) => m.type === 'gif' || m.url?.toLowerCase().includes('gif') || m.url?.match(/\.gif(\?.*)?$/i)
  ) || null
}

function getLiveFromSession(session: SessionData): MediaItem | null {
  const sorted = getSortedMediaFromSession(session)
  return sorted.find((m) => {
    const isVideoExt = !!m.url?.match(/\.(mp4|webm|mov)(\?.*)?$/i)
    const isImageExt = !!m.url?.match(/\.(jpg|jpeg|png|webp|avif)(\?.*)?$/i)
    const isVideoType = m.type === 'video' || m.type === 'live'
    return isVideoExt || (isVideoType && !isImageExt)
  }) || null
}

function getPhotosFromSession(session: SessionData): MediaItem[] {
  const sorted = getSortedMediaFromSession(session)
  if (sorted.length === 0) return []
  const strip = getStripFromSession(session)
  const gif = getGifFromSession(session)
  const live = getLiveFromSession(session)
  return sorted.filter((m) => {
    const isImageExt = !!m.url?.match(/\.(jpg|jpeg|png|webp|avif)(\?.*)?$/i)
    const isVideoExt = !!m.url?.match(/\.(mp4|webm|mov)(\?.*)?$/i)
    const isNotSpecialType = m.type !== 'live' && m.type !== 'video' && m.type !== 'gif' && (m as any).type !== 'strip'
    
    const isImg = isImageExt || isNotSpecialType
    const isStrip = strip && m.id === strip.id
    const isGif = gif && m.id === gif.id
    const isLiveVideo = live && m.id === live.id
    return isImg && !isStrip && !isGif && !isVideoExt && !isLiveVideo
  })
}

export default function SessionFeedCard({ session, index, showOwner = false }: SessionFeedCardProps) {
  const [imgError, setImgError] = useState(false)

  const strip = getStripFromSession(session)
  const gif = getGifFromSession(session)
  const live = getLiveFromSession(session)
  const photos = getPhotosFromSession(session)

  // Use strip as hero, fallback to first photo or any available media
  const heroMedia = strip || photos[0] || gif || session.media?.[0] || null
  const heroUrl = heroMedia?.url || null
  const isGif = heroMedia?.type === 'gif' || heroUrl?.match(/\.gif(\?.*)?$/i)

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.08, 0.4), duration: 0.4 }}
      className="bg-white border-2 border-black hard-shadow-black mb-6"
    >
      {/* Hero Image */}
      {heroUrl ? (
        <Link href={`/profile/${session.id}`} className="block">
          <div className="relative w-full bg-gray-100 border-b-2 border-black overflow-hidden flex items-center justify-center" style={{ aspectRatio: '9/16', maxHeight: '70vh' }}>
            {isGif || imgError ? (
              /* Fallback to native img tag to bypass Next.js image optimization errors */
              <img
                src={heroUrl}
                alt={session.event_name || 'Photo Strip'}
                className="w-full h-full object-contain"
                loading={index < 2 ? 'eager' : 'lazy'}
              />
            ) : (
              <NextImage
                src={heroUrl}
                alt={session.event_name || 'Photo Strip'}
                fill
                className="object-contain"
                sizes="(max-width: 512px) 100vw, 512px"
                quality={80}
                loading={index < 2 ? 'eager' : 'lazy'}
                onError={() => setImgError(true)}
              />
            )}
          </div>
        </Link>
      ) : (
        <div className="w-full aspect-[9/16] bg-gray-100 border-b-2 border-black flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-primary/20" />
        </div>
      )}

      {/* Info Bar */}
      <div className="px-4 py-3">
        {/* Event name + date */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-[1.3rem] font-black text-primary uppercase tracking-tight leading-tight font-bayon">
              {session.event_name || 'Sebooth Session'}
            </h3>
            <p className="text-[0.65rem] font-bold text-primary/40 uppercase tracking-widest mt-0.5">
              {new Date(session.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            {showOwner && session.user_id && (
              <p className="text-[0.6rem] font-bold text-primary/30 mt-0.5 font-mono truncate max-w-[200px]">
                👤 {session.user_id.slice(0, 8)}...
              </p>
            )}
          </div>
        </div>

        {/* Media type indicators */}
        <div className="flex items-center gap-3 mb-3">
          {strip && (
            <span className="flex items-center gap-1.5 text-[0.7rem] font-black text-primary/60 uppercase">
              <ImageIcon className="w-3.5 h-3.5" /> Strip
            </span>
          )}
          {gif && (
            <span className="flex items-center gap-1.5 text-[0.7rem] font-black text-primary/60 uppercase">
              <Film className="w-3.5 h-3.5" /> GIF
            </span>
          )}
          {live && (
            <span className="flex items-center gap-1.5 text-[0.7rem] font-black text-primary/60 uppercase">
              <Zap className="w-3.5 h-3.5" /> Live
            </span>
          )}
          {photos.length > 0 && (
            <span className="flex items-center gap-1.5 text-[0.7rem] font-black text-primary/60 uppercase">
              <Grid className="w-3.5 h-3.5" /> {photos.length} Foto
            </span>
          )}
        </div>

        {/* See More CTA */}
        <Link
          href={`/profile/${session.id}`}
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#e33529] text-white font-black uppercase text-[0.8rem] tracking-wide border-2 border-black hard-shadow-black hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        >
          See More <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.article>
  )
}

export { getStripFromSession, getGifFromSession, getLiveFromSession, getPhotosFromSession }
