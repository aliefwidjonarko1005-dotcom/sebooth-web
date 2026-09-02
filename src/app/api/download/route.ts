import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const filename = searchParams.get('filename') || 'sebooth-photo.jpg'

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 })
  }

  try {
    // Resolve absolute URL for both relative static paths (/images/...) and remote cloud URLs
    const targetUrl = url.startsWith('http')
      ? url
      : new URL(url, request.url).toString()

    const response = await fetch(targetUrl, {
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

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
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
