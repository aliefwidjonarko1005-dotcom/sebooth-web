import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const filename = searchParams.get('filename') || 'sebooth-photo.jpg'

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 })
  }

  try {
    // 1. Handle local files (e.g. /images/...)
    if (url.startsWith('/')) {
      const cleanPath = url.split('?')[0]
      const filePath = path.join(process.cwd(), 'public', cleanPath.replace(/^\//, ''))

      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath)
        const ext = path.extname(filePath).toLowerCase()
        const mimeMap: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.mp4': 'video/mp4'
        }
        const contentType = mimeMap[ext] || 'application/octet-stream'

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': fileBuffer.length.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable'
          }
        })
      }
    }

    // 2. Handle remote URLs (Supabase / GCS / S3)
    const targetUrl = url.startsWith('http') ? url : new URL(url, request.url).toString()
    const response = await fetch(targetUrl, {
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

