import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const filename = searchParams.get('filename') || 'sebooth-file'

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 })
  }

  try {
    const response = await fetch(url, {
      // Important to bypass caching and CORS issues
      cache: 'no-store',
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Sebooth Proxy/1.0',
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const body = response.body

    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)

    return new NextResponse(body, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Download proxy error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
