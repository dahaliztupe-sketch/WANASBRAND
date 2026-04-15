import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_SECRET = process.env.SESSION_SECRET || 'default_session_secret_change_me_in_production';
const secret = new TextEncoder().encode(SESSION_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for /admin or /account routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/account')) {
    // Read the session cookie
    const session = request.cookies.get('session');
    
    // If the cookie is missing, redirect to /auth
    if (!session) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    try {
      const { payload } = await jwtVerify(session.value, secret);
      
      // Basic 2FA Check for Admin routes
      // If the user is an admin and has 2FA enabled (hypothetically), 
      // they must have twoFactorVerified claim.
      // For now, we just check if the claim exists if we want to enforce it.
      if (pathname.startsWith('/admin')) {
        const isTwoFactorEnabled = payload.twoFactorEnabled as boolean;
        const isTwoFactorVerified = payload.twoFactorVerified as boolean;

        if (isTwoFactorEnabled && !isTwoFactorVerified) {
          // Redirect to a hypothetical 2FA verification page
          // return NextResponse.redirect(new URL('/auth/2fa', request.url));
          console.log('2FA required but not verified');
        }
      }
    } catch (error) {
      console.error('Middleware JWT verification failed:', error);
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
