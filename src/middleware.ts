import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the token from cookies or headers
  const token = request.cookies.get('adminToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  // Define protected routes
  const protectedRoutes = ['/dashboard', '/regions', '/brokers'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Define public routes
  const publicRoutes = ['/login', '/'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // If accessing a protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If accessing login page with token, redirect to regions
  if (isPublicRoute && token && pathname === '/login') {
    return NextResponse.redirect(new URL('/regions', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
