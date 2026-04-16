import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

import { auth, db } from '@/lib/firebase/server';

export const runtime = 'nodejs';

const SESSION_SECRET = process.env.SESSION_SECRET || 'default_session_secret_change_me_in_production';
const secret = new TextEncoder().encode(SESSION_SECRET);

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    
    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    if (!auth || !db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Verify ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Check for admin role in Firestore
    const firestore = db;
    if (!firestore) throw new Error('Database not initialized');
    const userDoc = await firestore.collection('users').doc(uid).get();
    const userData = userDoc.data();
    const isAdmin = userData?.role === 'admin';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    // Create a session JWT
    const sessionToken = await new SignJWT({ uid, isAdmin: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({ success: true, isAdmin: true });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  return NextResponse.json({ success: true });
}
