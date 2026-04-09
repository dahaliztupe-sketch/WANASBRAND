import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const runtime = 'nodejs';

// Initialize Firebase Admin for middleware
const app = !getApps().length ? initializeApp({
  credential: cert(JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || '', 'base64').toString('utf-8')))
}) : getApps()[0];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/admin') || pathname.startsWith('/account')) {
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    try {
      const decodedClaims = await getAuth(app).verifySessionCookie(sessionCookie, true);
      
      if (pathname.startsWith('/admin')) {
        // Admin Promotion Logic (for the owner)
        if (decodedClaims.email === 'abdalrahman32008@gmail.com') {
          return NextResponse.next();
        }

        // Check for admin: true custom claim as requested
        if (decodedClaims.admin !== true && decodedClaims.role !== 'admin') {
          return NextResponse.redirect(new URL('/', request.url));
        }
      }
      
      // For /account, just being authenticated is enough
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
