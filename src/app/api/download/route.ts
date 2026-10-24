import { NextResponse } from 'next/server'
import { resolveMediaSource, rateLimit } from '@/lib/apiSecurity'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const filename = searchParams.get('filename') || 'sebooth-photo.jpg'

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 })
  }

  const limited = rateLimit(request, 'download', 120, 60_000)
  if (limited) return limited

  // Only our own public files and allowlisted media buckets (otherwise this is an open proxy)
  const source = resolveMediaSource(url)
  if (!source) {
    return new NextResponse('URL not allowed', { status: 400 })
  }

  try {
    const targetUrl = source.kind === 'remote' ? source.url : new URL(source.path, request.url).toString()

    const response = await fetch(targetUrl, {
      // Not 'error': Vercel's edge runtime throws on it. A 3xx comes back !ok and is rejected below.
      redirect: 'manual',
      headers: {
        Accept: '*/*',
        'User-Agent': 'Sebooth Proxy/1.0',
      },
    })

    if (!response.ok) {
      return new NextResponse(`Failed to fetch file: ${response.statusText}`, {
        status: response.status,
      })
    }

    // Infer proper media MIME type so mobile Gallery apps (Android Photos / Apple Photos) immediately index it
    const lowerFilename = filename.toLowerCase()
    let contentType = response.headers.get('content-type') || ''
    if (!contentType || contentType === 'application/octet-stream') {
      if (lowerFilename.endsWith('.jpg') || lowerFilename.endsWith('.jpeg')) {
        contentType = 'image/jpeg'
      } else if (lowerFilename.endsWith('.png')) {
        contentType = 'image/png'
      } else if (lowerFilename.endsWith('.gif')) {
        contentType = 'image/gif'
      } else if (lowerFilename.endsWith('.mp4') || lowerFilename.endsWith('.mov')) {
        contentType = 'video/mp4'
      } else if (lowerFilename.endsWith('.webp')) {
        contentType = 'image/webp'
      } else {
        contentType = 'image/jpeg'
      }
    }

    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`)
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    return new NextResponse(response.body, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Download proxy error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
