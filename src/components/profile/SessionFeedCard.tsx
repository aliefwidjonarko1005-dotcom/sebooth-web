'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Film, Zap, Grid, ArrowRight, Image } from 'lucide-react'
import type { SessionData, MediaItem } from '@/types/database'

interface SessionFeedCardProps {
  session: SessionData
  index: number
}

/* ─── Media helpers (extract from session) ─── */
function getStripFromSession(session: SessionData): MediaItem | null {
  return session.media?.find(
    (m) => (m.metadata as Record<string, unknown>)?.is_strip || m.url?.toLowerCase().includes('strip.jpg')
  ) || null
}

function getGifFromSession(session: SessionData): MediaItem | null {
  return session.media?.find(
    (m) => m.type === 'gif' || m.url?.toLowerCase().includes('animation.gif')
  ) || null
}

function getLiveFromSession(session: SessionData): MediaItem | null {
  return session.media?.find(
    (m) => m.type === 'live' || m.url?.toLowerCase().includes('live.mp4')
  ) || null
}

function getPhotosFromSession(session: SessionData): MediaItem[] {
  if (!session.media) return []
  const strip = getStripFromSession(session)
  const gif = getGifFromSession(session)
  return session.media.filter((m) => {
    const isImg = m.url?.match(/\.(jpg|jpeg|png|webp)/i)
    const isStrip = strip && m.id === strip.id
    const isGif = gif && m.id === gif.id
    return isImg && !isStrip && !isGif
  })
}

export default function SessionFeedCard({ session, index }: SessionFeedCardProps) {
  const strip = getStripFromSession(session)
  const gif = getGifFromSession(session)
  const live = getLiveFromSession(session)
  const photos = getPhotosFromSession(session)

  // Use strip as hero, fallback to first photo
  const heroUrl = strip?.url || photos[0]?.url || null

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-white border-2 border-black hard-shadow-black mb-6"
    >
      {/* Hero Image */}
      {heroUrl ? (
        <Link href={`/profile/${session.id}`} className="block">
          <div className="relative w-full bg-gray-100 border-b-2 border-black overflow-hidden">
            <img
              src={heroUrl}
              alt={session.event_name || 'Photo Strip'}
              className="w-full object-contain max-h-[70vh]"
              loading="lazy"
            />
          </div>
        </Link>
      ) : (
        <div className="w-full aspect-[9/16] bg-gray-100 border-b-2 border-black flex items-center justify-center">
          <Image className="w-10 h-10 text-primary/20" />
        </div>
      )}

      {/* Info Bar */}
      <div className="px-4 py-3">
        {/* Event name + date */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-[1.3rem] font-black text-primary uppercase tracking-tight leading-tight">
              {session.event_name || 'Sebooth Session'}
            </h3>
            <p className="text-[0.65rem] font-bold text-primary/40 uppercase tracking-widest mt-0.5">
              {new Date(session.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Media type indicators */}
        <div className="flex items-center gap-3 mb-3">
          {strip && (
            <span className="flex items-center gap-1.5 text-[0.7rem] font-black text-primary/60 uppercase">
              <Image className="w-3.5 h-3.5" /> Strip
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
          className="flex items-center justify-center gap-2 w-full py-3 bg-secondary text-white font-black uppercase text-[0.8rem] tracking-wide border-2 border-black hard-shadow-black hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        >
          See More <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.article>
  )
}

export { getStripFromSession, getGifFromSession, getLiveFromSession, getPhotosFromSession }
