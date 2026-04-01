import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const VENDOR_PREFIX = '/vendor'
const CLIENT_PREFIX = '/client'
const PROTECTED_PREFIX = '/(protected)'

const PUBLIC_PATHS = [
  '/login',
  '/auth',
  '/_next',
  '/api',
]

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/login') ||
      pathname.includes('.')) {
    return true
  }
  return false
}

function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith(PROTECTED_PREFIX) ||
    (!PUBLIC_PATHS.some(p => pathname.startsWith(p)) && !pathname.includes('.'))
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && isProtectedRoute(request.nextUrl.pathname) && !request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (user && isPublicPath(request.nextUrl.pathname)) {
    return supabaseResponse
  }

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stakeholder_type, is_active')
      .eq('id', user.id)
      .single()

    if (profile && profile.is_active) {
      const isVendor = profile.stakeholder_type === 'vendor'
      const isClient = profile.stakeholder_type === 'client'
      const pathname = request.nextUrl.pathname

      if (isVendor && !pathname.startsWith(VENDOR_PREFIX) && !pathname.startsWith('/api')) {
        const url = request.nextUrl.clone()
        url.pathname = VENDOR_PREFIX
        return NextResponse.redirect(url)
      }

      if (isClient && !pathname.startsWith(CLIENT_PREFIX) && !pathname.startsWith('/api')) {
        const url = request.nextUrl.clone()
        url.pathname = CLIENT_PREFIX
        return NextResponse.redirect(url)
      }

      if (!isVendor && !isClient && (pathname.startsWith(VENDOR_PREFIX) || pathname.startsWith(CLIENT_PREFIX))) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
