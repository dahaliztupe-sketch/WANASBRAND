import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/admin') || pathname.startsWith('/account')) {
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
