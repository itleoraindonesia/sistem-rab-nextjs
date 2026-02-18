const { createServerClient } = require('@supabase/ssr');
const { NextResponse } = require('next/server');

async function updateSession(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options });
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  
  // List of public routes that don't require auth
  const publicRoutes = [
    "/embed/kalkulator-harga/panel",
  ];
  
  const isPublicCalculator = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicCalculator) {
    // For embed routes, still update session but don't enforce auth
    return await updateSession(request);
  }

  // For protected routes, check auth
  return await updateSession(request);
}

const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

module.exports = { middleware, config };
