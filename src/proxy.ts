import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define protected routes
const protectedRoutes = [
  '/produk-rab',
  '/dokumen',
  '/crm',
  '/master',
  '/supply-chain'
];
const authRoutes = ['/login'];
const publicRoutes = ['/', '/auth/callback'];

export async function proxy(request: NextRequest) {
  // 1. Initialize Response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Setup Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
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
        remove(name: string, options: CookieOptions) {
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

  // 3. Refresh/Check Session
  const { data: { user } } = await supabase.auth.getUser()

  // 4. Route Protection Logic
  const { pathname } = request.nextUrl

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith('/auth/')
  );

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if current route is auth route
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );

  console.log('Proxy check:', {
    pathname,
    isPublicRoute,
    isProtectedRoute,
    isAuthRoute,
    hasUser: !!user
  });

  // If accessing protected route without user, redirect to login
  if (isProtectedRoute && !user && !isPublicRoute) {
    console.log('Redirecting to login - protected route without auth');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing login while authenticated, redirect to dashboard
  if (isAuthRoute && user) {
    console.log('Redirecting to dashboard - accessing login while authenticated');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 5. Return the response (which might have updated cookies)
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (auth callback route)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
};
