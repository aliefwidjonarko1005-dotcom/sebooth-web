import { NextResponse } from 'next/server'
import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import os from 'os'
import crypto from 'crypto'

export const runtime = 'nodejs'

// ── Dynamic Sharp Loader with Graceful Fallback ──
// Prevents module crashes on environments where platform-specific native binaries are missing
let sharpModule: any = null
let sharpChecked = false

async function getSharp() {
  if (sharpChecked) return sharpModule
  try {
    const mod = await import('sharp')
    sharpModule = mod.default || mod
  } catch (e) {
    console.warn('[api/image] Sharp native module unavailable, using direct streaming fallback:', e)
    sharpModule = null
  }
  sharpChecked = true
  return sharpModule
}

// ── In-Memory LRU Cache (RAM: 0.1ms responses) ──
interface MemoryCacheItem {
  buffer: Buffer
  contentType: string
  etag: string
  addedAt: number
}

const memoryCache = new Map<string, MemoryCacheItem>()
const MAX_MEMORY_ITEMS = 120 // ~120 WebP images * ~70KB = ~8.4MB of RAM

function getFromMemoryCache(key: string): MemoryCacheItem | null {
  const item = memoryCache.get(key)
  if (!item) return null
  // Refresh recency
  memoryCache.delete(key)
  memoryCache.set(key, item)
  return item
}

function setToMemoryCache(key: string, item: MemoryCacheItem) {
  if (memoryCache.size >= MAX_MEMORY_ITEMS) {
    // Evict oldest
    const oldestKey = memoryCache.keys().next().value
    if (oldestKey) memoryCache.delete(oldestKey)
  }
  memoryCache.set(key, item)
}

// ── In-Flight Request Deduplication ──
// Prevents duplicate concurrent fetches for the same asset
const inFlightRequests = new Map<string, Promise<{ buffer: Buffer; contentType: string }>>()

// ── Persistent Disk Cache Directory (Safe for Serverless & Read-Only FS) ──
function getDiskCacheDir(): string | null {
  try {
    const fallback = path.join(os.tmpdir(), 'sebooth_images')
    if (!fs.existsSync(fallback)) {
      fs.mkdirSync(fallback, { recursive: true })
    }
    return fallback
  } catch {
    return null
  }
}

const diskCacheDir = getDiskCacheDir()

export async function GET(request: Request) {
  let url = ''
  try {
    const { searchParams } = new URL(request.url)
    const rawUrlParam = searchParams.get('url')
    const w = parseInt(searchParams.get('w') || '640', 10)
    const q = parseInt(searchParams.get('q') || '72', 10)

    if (!rawUrlParam) {
      return new NextResponse('Missing URL parameter', { status: 400 })
    }

    url = rawUrlParam

    // Unroll nested /api/image calls if any
    while (url.includes('/api/image')) {
      try {
        const dummyBase = 'http://localhost'
        const parsed = new URL(url, dummyBase)
        const inner = parsed.searchParams.get('url')
        if (inner && inner !== url) {
          url = inner
        } else {
          break
        }
      } catch {
        break
      }
    }

    // Safely construct base host URL for relative URLs
    const hostHeader = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000'
    const safeHost = hostHeader.includes('0.0.0.0') ? hostHeader.replace('0.0.0.0', '127.0.0.1') : hostHeader
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const safeBaseUrl = `${protocol}://${safeHost}`

    const getSafeRedirectUrl = (raw: string) => {
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        return raw
      }
      return new URL(raw.startsWith('/') ? raw : `/${raw}`, safeBaseUrl).toString()
    }

    // Bypass animated GIFs and videos (keep animations & video streams intact)
    if (url.match(/\.(gif|mp4|webm|mov)(\?.*)?$/i)) {
      return NextResponse.redirect(getSafeRedirectUrl(url), { status: 302 })
    }

    // Clamp width and quality to optimal performance ranges
    const targetWidth = Math.min(Math.max(w || 640, 100), 1600)
    const targetQuality = Math.min(Math.max(q || 72, 40), 95)

    // Unique deterministic cache key
    const cacheKey = crypto.createHash('md5').update(`${url}_w${targetWidth}_q${targetQuality}`).digest('hex')
    const etag = `"${cacheKey}"`

    // ── 1. HTTP 304 Not Modified Check (Client already has it cached) ──
    const ifNoneMatch = request.headers.get('if-none-match')
    if (ifNoneMatch === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
          ETag: etag,
        },
      })
    }

    // ── 2. Check Fast In-Memory RAM Cache (0.1ms) ──
    const memItem = getFromMemoryCache(cacheKey)
    if (memItem) {
      return new Response(memItem.buffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': memItem.contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          ETag: memItem.etag,
          'X-Cache': 'HIT-RAM',
        },
      })
    }

    // ── 3. Check Persistent Disk Cache (1-3ms) ──
    const cacheFilePath = diskCacheDir ? path.join(diskCacheDir, `${cacheKey}.webp`) : null
    if (cacheFilePath) {
      try {
        if (fs.existsSync(cacheFilePath)) {
          const diskBuffer = await fsPromises.readFile(cacheFilePath)
          // Save to memory cache for subsequent instant hits
          setToMemoryCache(cacheKey, {
            buffer: diskBuffer,
            contentType: 'image/webp',
            etag,
            addedAt: Date.now(),
          })

          return new Response(diskBuffer as unknown as BodyInit, {
            status: 200,
            headers: {
              'Content-Type': 'image/webp',
              'Cache-Control': 'public, max-age=31536000, immutable',
              ETag: etag,
              'X-Cache': 'HIT-DISK',
            },
          })
        }
      } catch {
        // Disk read failed, proceed to fetch & process
      }
    }

    // ── 4. In-Flight Request Deduplication ──
    let pendingPromise = inFlightRequests.get(cacheKey)

    if (!pendingPromise) {
      pendingPromise = (async () => {
        let inputBuffer: Buffer | null = null
        let detectedContentType = 'image/jpeg'

        // Local public file check (0ms)
        const isLocalUrl = !url.startsWith('http://') && !url.startsWith('https://')
        const isSelfHostUrl = url.includes('localhost') || url.includes('127.0.0.1') || url.includes('0.0.0.0') || url.includes('192.168.')

        if (isLocalUrl || isSelfHostUrl) {
          try {
            const pathname = isLocalUrl ? url.split('?')[0] : new URL(url).pathname
            const cleanRel = pathname.replace(/^\/+/, '')
            const localFilePath = path.join(process.cwd(), 'public', cleanRel)
            inputBuffer = await fsPromises.readFile(localFilePath)
            if (url.endsWith('.png')) detectedContentType = 'image/png'
            else if (url.endsWith('.webp')) detectedContentType = 'image/webp'
          } catch {
            // Fall through to HTTP fetch
          }
        }

        // Fetch remote resource
        if (!inputBuffer) {
          const targetUrl = url.startsWith('http')
            ? url
            : new URL(url.startsWith('/') ? url : `/${url}`, 'http://127.0.0.1:3000').toString()

          const res = await fetch(targetUrl, {
            signal: AbortSignal.timeout(8000),
            headers: {
              Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
              'User-Agent': 'Sebooth-Fast-Optimizer/2.0',
            },
          })

          if (!res.ok) {
            throw new Error(`Remote image fetch failed: HTTP ${res.status}`)
          }

          const rawContentType = res.headers.get('content-type') || 'image/jpeg'
          if (rawContentType.includes('video') || rawContentType.includes('gif')) {
            throw new Error('Animation/Video format bypass')
          }
          detectedContentType = rawContentType

          const arrayBuffer = await res.arrayBuffer()
          inputBuffer = Buffer.from(arrayBuffer)
        }

        // Check if Sharp is available
        const sharp = await getSharp()
        if (!sharp) {
          // Sharp native binary unavailable on serverless host: return original buffer directly
          return {
            buffer: inputBuffer,
            contentType: detectedContentType,
          }
        }

        // High-Speed Sharp Conversion
        try {
          const outputBuffer = await sharp(inputBuffer)
            .rotate() // preserve EXIF orientation
            .resize({
              width: targetWidth,
              withoutEnlargement: true,
              fastShrinkOnLoad: true,
            })
            .webp({
              quality: targetQuality,
              effort: 1, // Ultra-fast CPU effort
              smartSubsample: true,
            })
            .toBuffer()

          // Asynchronously persist to disk cache
          if (cacheFilePath) {
            fsPromises.writeFile(cacheFilePath, outputBuffer).catch(() => {})
          }

          return {
            buffer: outputBuffer,
            contentType: 'image/webp',
          }
        } catch (procErr) {
          console.warn('[api/image] Sharp processing failed, returning raw original buffer:', procErr)
          return {
            buffer: inputBuffer,
            contentType: detectedContentType,
          }
        }
      })()

      inFlightRequests.set(cacheKey, pendingPromise)
    }

    try {
      const result = await pendingPromise
      inFlightRequests.delete(cacheKey)

      // Store in RAM cache
      setToMemoryCache(cacheKey, {
        buffer: result.buffer,
        contentType: result.contentType,
        etag,
        addedAt: Date.now(),
      })

      return new Response(result.buffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': result.contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          ETag: etag,
          'X-Cache': 'MISS',
        },
      })
    } catch (err) {
      inFlightRequests.delete(cacheKey)
      console.error('Image optimization fallback redirect:', err)
      const redirectUrl = getSafeRedirectUrl(url)
      return NextResponse.redirect(redirectUrl, { status: 302 })
    }
  } catch (topErr) {
    console.error('[api/image] Top-level handler error:', topErr)
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      return NextResponse.redirect(url, { status: 302 })
    }
    return new NextResponse('Internal Image Error', { status: 500 })
  }
}
