import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define protected routes
const protectedRoutes = [
  '/',
  '/produk-rab',
  '/dokumen',
  '/crm',
  '/master',
  '/supply-chain',
  '/meeting'
];
const authRoutes = ['/login'];
const publicRoutes = ['/auth/callback'];

// Cache duration in milliseconds (5 minutes)
const AUTH_CACHE_DURATION = 5 * 60 * 1000;
const AUTH_CACHE_COOKIE = 'auth-cache';

interface AuthCache {
  hasUser: boolean;
  timestamp: number;
}

export async function proxy(request: NextRequest) {
  // 1. Initialize Response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Check cached auth first (FAST PATH)
  // But skip cache if we have Supabase auth cookies (fresh login/logout)
  const hasSupabaseCookies = request.cookies.getAll().some(cookie => 
    cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
  );
  
  const authCacheCookie = request.cookies.get(AUTH_CACHE_COOKIE)?.value;
  let cachedAuth: AuthCache | null = null;
  let user: any = null;
  let usedCache = false;

  if (authCacheCookie && !hasSupabaseCookies) {
    try {
      cachedAuth = JSON.parse(authCacheCookie) as AuthCache;
      const now = Date.now();
      
      // If cache is still valid (within 5 minutes), use it
      if (now - cachedAuth.timestamp < AUTH_CACHE_DURATION) {
        user = cachedAuth.hasUser ? { id: 'cached' } : null; // Dummy user object
        usedCache = true;
        console.log('[Proxy] Using cached auth (fast path)');
      }
    } catch (e) {
      // Invalid cache, will fetch fresh
      console.log('[Proxy] Invalid auth cache, fetching fresh');
    }
  } else if (hasSupabaseCookies) {
    console.log('[Proxy] Supabase cookies detected, skipping cache for fresh auth check');
  }

  // 3. Only call Supabase API if cache miss or expired
  if (!usedCache) {
    const startTime = Date.now();
    
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

    // Check session from Supabase (SLOW - API call)
    const { data: { user: freshUser } } = await supabase.auth.getUser();
    user = freshUser;
    
    const duration = Date.now() - startTime;
    console.log(`[Proxy] Supabase auth check took ${duration}ms`);

    // Update cache
    const newCache: AuthCache = {
      hasUser: !!user,
      timestamp: Date.now(),
    };
    
    response.cookies.set({
      name: AUTH_CACHE_COOKIE,
      value: JSON.stringify(newCache),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 5, // 5 minutes in seconds
      path: '/',
    });
  }

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
    hasUser: !!user,
    usedCache,
    duration: usedCache ? 'cached' : 'API call'
  });

  // If accessing protected route without user, redirect to login
  // But don't redirect if it's an auth route (like /login itself)
  if (isProtectedRoute && !user && !isPublicRoute && !isAuthRoute) {
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
