import { NextResponse } from 'next/server'
import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawUrlParam = searchParams.get('url')
  const w = parseInt(searchParams.get('w') || '720', 10)
  const q = parseInt(searchParams.get('q') || '75', 10)

  if (!rawUrlParam) {
    return new NextResponse('Missing URL parameter', { status: 400 })
  }

  let url: string = rawUrlParam

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

  // Safely construct base host URL for relative URLs (never output 0.0.0.0 to browser)
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

  // Bypass GIFs and videos (keep animations & video streams intact)
  if (url.match(/\.(gif|mp4|webm|mov)(\?.*)?$/i)) {
    return NextResponse.redirect(getSafeRedirectUrl(url))
  }

  try {
    let inputBuffer: Buffer | null = null

    // 1. If it's a local public file path, read directly from the filesystem (0ms, no network loopback risk)
    const isLocalUrl = !url.startsWith('http://') && !url.startsWith('https://')
    const isSelfHostUrl = url.includes('localhost') || url.includes('127.0.0.1') || url.includes('0.0.0.0') || url.includes('192.168.')

    if (isLocalUrl || isSelfHostUrl) {
      try {
        const pathname = isLocalUrl ? url.split('?')[0] : new URL(url).pathname
        const cleanRel = pathname.replace(/^\/+/, '')
        const localFilePath = path.join(process.cwd(), 'public', cleanRel)
        inputBuffer = await fs.readFile(localFilePath)
      } catch {
        // Fall through to HTTP fetch if not found directly in public/
      }
    }

    // 2. If not local or disk read missed, fetch over HTTP
    if (!inputBuffer) {
      const targetUrl = url.startsWith('http')
        ? url
        : new URL(url.startsWith('/') ? url : `/${url}`, 'http://127.0.0.1:3000').toString()

      const res = await fetch(targetUrl, {
        signal: AbortSignal.timeout(6000),
        headers: {
          Accept: 'image/*',
          'User-Agent': 'Sebooth-Optimizer/1.0',
        },
      })

      if (!res.ok) {
        return NextResponse.redirect(getSafeRedirectUrl(url))
      }

      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('video') || contentType.includes('gif')) {
        return NextResponse.redirect(getSafeRedirectUrl(url))
      }

      const arrayBuffer = await res.arrayBuffer()
      inputBuffer = Buffer.from(arrayBuffer)
    }

    // Clamp width and quality to safe ranges
    const targetWidth = Math.min(Math.max(w || 720, 100), 1600)
    const targetQuality = Math.min(Math.max(q || 75, 40), 95)

    const outputBuffer = await sharp(inputBuffer)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: targetQuality, effort: 4 })
      .toBuffer()

    return new Response(outputBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    console.error('Image optimization failed, falling back to original:', err)
    return NextResponse.redirect(getSafeRedirectUrl(url))
  }
}
