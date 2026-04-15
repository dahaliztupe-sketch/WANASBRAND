import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for /admin or /account routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/account')) {
    // Read the session cookie
    const session = request.cookies.get('session');
    
    // If the cookie is missing, redirect to /auth
    if (!session) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
  ],
};
