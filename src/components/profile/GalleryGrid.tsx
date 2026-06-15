'use client'

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
    (m) => (m.metadata as Record<string, unknown>)?.is_strip || m.url?.toLowerCase().includes('strip.jpg')
  ) || null
}

function getFirstPhotoFromSession(session: SessionData): MediaItem | null {
  if (!session.media) return null
  const strip = getStripFromSession(session)
  const gif = session.media.find(m => m.type === 'gif' || m.url?.toLowerCase().includes('animation.gif'))
  return session.media.find((m) => {
    const isImg = m.url?.match(/\.(jpg|jpeg|png|webp)/i)
    return isImg && (!strip || m.id !== strip.id) && (!gif || m.id !== gif.id)
  }) || null
}

export default function GalleryGrid({ sessions }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-3">
      {sessions.map((session, idx) => {
        const strip = getStripFromSession(session)
        const hero = strip || getFirstPhotoFromSession(session)

        return (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(idx * 0.04, 0.4), duration: 0.3 }}
          >
            <Link
              href={`/profile/${session.id}`}
              className="block relative bg-white border-2 border-black hard-shadow-black group overflow-hidden"
            >
              {hero ? (
                <div className="aspect-[3/4] overflow-hidden relative">
                  <NextImage
                    src={hero.url}
                    alt={session.event_name || 'Photo Strip'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 280px"
                    quality={60}
                    loading={idx < 4 ? 'eager' : 'lazy'}
                  />
                </div>
              ) : (
                <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-primary/20" />
                </div>
              )}

              {/* Overlay with event info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
                <p className="text-white text-[0.7rem] font-black uppercase tracking-wider leading-tight truncate">
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
      })}
    </div>
  )
}
