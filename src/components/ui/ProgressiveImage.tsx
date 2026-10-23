'use client'

import React, { useCallback } from 'react'

const FALLBACK_SRC = '/images/gallery/hd/strip_004a6bbb.webp'

interface ProgressiveImageProps {
  src: string
  /** Tiny or already-cached image shown blurred until `src` finishes loading. */
  placeholder?: string
  /** Original file tried when `src` fails (zero broken images). */
  fallbackSrc?: string
  alt: string
  /** Sizing and object-fit classes, applied to both layers. The parent must be `relative`. */
  className?: string
  loading?: 'eager' | 'lazy'
}

/**
 * Blur-up image: the placeholder paints instantly, then the display WebP fades in over it.
 * Fade is done on the DOM node directly so loading dozens of thumbnails never re-renders React.
 */
export default function ProgressiveImage({ src, placeholder, fallbackSrc, alt, className = '', loading = 'lazy' }: ProgressiveImageProps) {
  // Cached images can finish before React attaches onLoad, so check on mount too
  const reveal = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) img.style.opacity = '1'
  }, [])

  return (
    <>
      {placeholder && placeholder !== src && (
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          className={`${className} absolute inset-0 scale-110 blur-md`}
          decoding="async"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      <img
        ref={reveal}
        src={src}
        alt={alt}
        className={`${className} relative transition-opacity duration-300`}
        style={{ opacity: placeholder && placeholder !== src ? 0 : 1 }}
        loading={loading}
        decoding="async"
        onLoad={(e) => {
          e.currentTarget.style.opacity = '1'
        }}
        onError={(e) => {
          const img = e.currentTarget
          if (fallbackSrc && !img.src.endsWith(fallbackSrc) && img.dataset.fellBack !== '1') {
            img.dataset.fellBack = '1'
            img.src = fallbackSrc
          } else if (!img.src.endsWith(FALLBACK_SRC)) {
            img.src = FALLBACK_SRC
          }
        }}
      />
    </>
  )
}
