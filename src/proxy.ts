import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define protected routes
const protectedRoutes = [
  '/',
  '/products',
  '/documents',
  '/crm',
  '/master',
  '/supply-chain',
  '/meeting'
];
const authRoutes = ['/login'];
const publicRoutes = ['/auth/callback', '/embed/kalkulator-harga'];

export async function proxy(request: NextRequest) {
  // Initialize Response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options })
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  // Check session from Supabase (auto-refresh jika perlu)
  const { data: { user } } = await supabase.auth.getUser();

  // Route Protection Logic
  const { pathname } = request.nextUrl

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith('/auth/') || pathname.startsWith(route)
  );

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if current route is auth route
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if this is a logout redirect (has logged_out=true param)
  const isLogoutRedirect = request.nextUrl.searchParams.get('logged_out') === 'true';

  // If accessing protected route without user, redirect to login
  if (isProtectedRoute && !user && !isPublicRoute && !isAuthRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing login while authenticated, redirect to dashboard
  if (isAuthRoute && user && !isLogoutRedirect) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)).*)',
  ],
};
