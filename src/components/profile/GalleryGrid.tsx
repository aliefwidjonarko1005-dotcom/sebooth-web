'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Image as ImageIcon } from 'lucide-react'
import NextImage from 'next/image'
import type { SessionData, MediaItem } from '@/types/database'

interface GalleryGridProps {
  sessions: SessionData[]
}

function getStripFromSession(session: SessionData): MediaItem | null {
  return session.media?.find(
    (m) =>
      (m as any).type === 'strip' ||
      (m.metadata as Record<string, unknown>)?.is_strip ||
      m.url?.toLowerCase().includes('strip')
  ) || null
}

function getFirstPhotoFromSession(session: SessionData): MediaItem | null {
  if (!session.media) return null
  const strip = getStripFromSession(session)
  const gif = session.media.find(m => m.type === 'gif' || m.url?.toLowerCase().includes('gif'))
  return session.media.find((m) => {
    const isImg = m.url?.match(/\.(jpg|jpeg|png|webp|avif)(\?.*)?$/i) || (m.type !== 'live' && m.type !== 'video' && m.type !== 'gif')
    return isImg && (!strip || m.id !== strip.id) && (!gif || m.id !== gif.id)
  }) || session.media[0] || null
}

function GalleryItemCard({ session, idx }: { session: SessionData; idx: number }) {
  const [imgError, setImgError] = useState(false)
  const strip = getStripFromSession(session)
  const hero = strip || getFirstPhotoFromSession(session)
  const heroUrl = hero?.url || null
  const isGif = hero?.type === 'gif' || heroUrl?.match(/\.gif(\?.*)?$/i)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(idx * 0.04, 0.4), duration: 0.3 }}
    >
      <Link
        href={`/profile/${session.id}`}
        className="block relative bg-white border-2 border-black hard-shadow-black group overflow-hidden"
      >
        {heroUrl ? (
          <div className="aspect-[3/4] overflow-hidden relative flex items-center justify-center bg-gray-100">
            {isGif || imgError ? (
              <img
                src={heroUrl}
                alt={session.event_name || 'Photo Strip'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading={idx < 4 ? 'eager' : 'lazy'}
              />
            ) : (
              <NextImage
                src={heroUrl}
                alt={session.event_name || 'Photo Strip'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 280px"
                quality={75}
                loading={idx < 4 ? 'eager' : 'lazy'}
                onError={() => setImgError(true)}
              />
            )}
          </div>
        ) : (
          <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-primary/20" />
          </div>
        )}

        {/* Overlay with event info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
          <p className="text-white text-[0.7rem] font-black uppercase tracking-wider leading-tight truncate font-bayon">
            {session.event_name || 'Session'}
          </p>
          <p className="text-white/60 text-[0.55rem] font-bold uppercase tracking-widest mt-0.5">
            {new Date(session.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

export default function GalleryGrid({ sessions }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-3">
      {sessions.map((session, idx) => (
        <GalleryItemCard key={session.id || idx} session={session} idx={idx} />
      ))}
    </div>
  )
}
