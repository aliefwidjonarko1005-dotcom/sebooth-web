import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_PATHS = ['/admin']
// Server Components here read the session but cannot save a refreshed token, which would log people
// out once the old token is rejected as reused. So the token is refreshed here, before they render.
const SESSION_PATHS = ['/queue']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Skip auth check entirely for public routes ──
  // Only run Supabase for the paths that need a session to reduce latency
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))
  const needsSession = SESSION_PATHS.some(p => pathname.startsWith(p))
  // preview=1 skips auth for local UI screenshots only, never in production
  const isDevPreview = process.env.NODE_ENV === 'development' && request.nextUrl.searchParams.get('preview') === '1'
  if ((!isProtected && !needsSession) || isDevPreview) {
    return NextResponse.next()
  }

  // ── Protected route: validate auth ──
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refreshes an expired token and, unlike getUser, makes no network call otherwise
  if (!isProtected) {
    await supabase.auth.getSession()
    return response
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

