import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    // Check for session cookie (set by Firebase Auth on login)
    const session = request.cookies.get('session');
    
    // In production, redirect to auth if no session exists
    if (!session && process.env.NODE_ENV === 'production') {
      // Allow access to admin login if it exists, otherwise redirect to main auth
      if (pathname !== '/admin/login') {
        return NextResponse.redirect(new URL('/auth', request.url));
      }
    }
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
