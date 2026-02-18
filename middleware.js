const { NextResponse } = require("next/server");

// Dynamic import for ESM modules
let updateSession;

async function loadUpdateSession() {
  if (!updateSession) {
    const supabaseMiddleware = await import("./src/lib/supabase/middleware.js");
    updateSession = supabaseMiddleware.updateSession;
  }
  return updateSession;
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
    const updateSessionFn = await loadUpdateSession();
    return await updateSessionFn(request);
  }

  // For protected routes, check auth
  const updateSessionFn = await loadUpdateSession();
  return await updateSessionFn(request);
}

const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

module.exports = { middleware, config };
