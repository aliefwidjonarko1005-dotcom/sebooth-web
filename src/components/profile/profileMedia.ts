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
export function getOptimizedDisplayUrl(rawUrl: string, width = 640, quality = 70): string {
  if (!rawUrl) return ''
  // If already an /api/image URL, do not double-wrap
  if (rawUrl.includes('/api/image')) return rawUrl
  // Bypass animated formats and video streams
  if (rawUrl.match(/\.(gif|mp4|webm|mov)(\?.*)?$/i)) return rawUrl
  return `/api/image?url=${encodeURIComponent(rawUrl)}&w=${width}&q=${quality}`
}

/** ~300-byte blurred stand-in painted instantly while the display WebP loads. */
export function getBlurPlaceholderUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl || rawUrl.match(/\.(gif|mp4|webm|mov)(\?.*)?$/i)) return undefined
  return getOptimizedDisplayUrl(getRawOriginalUrl(rawUrl), 24, 40)
}

/**
 * Ensures single and bundle downloads always target the 100% uncompressed master resolution camera file,
 * stripping any proxy /api/image query strings if present.
 */
export function getRawOriginalUrl(url: string | undefined): string {
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
