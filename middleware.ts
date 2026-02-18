import { type NextRequest } from "next/server";
import { updateSession } from "./src/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Check if this is an embed route (in /(embed) group) - bypass auth check
  // Routes in (embed) group are public and don't require authentication
  const pathname = request.nextUrl.pathname;
  
  // List of public routes that don't require auth
  const publicRoutes = [
    "/embed/kalkulator-harga/panel",
    // Add other calculator embed routes here when created
  ];
  
  // Check if the current path is a public calculator route
  const isPublicCalculator = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicCalculator) {
    // Still update session for cookies, but don't enforce auth
    return await updateSession(request);
  }

  // For protected routes, check auth
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
