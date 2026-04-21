import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/server';

/**
 * Verifies a welcome token (sent via email after first purchase).
 * Token is stored in Firestore `welcome_tokens` collection.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { token: string };
    const { token } = body;

    if (!token || typeof token !== 'string' || token.length < 8) {
      return NextResponse.json({ valid: false, error: 'Invalid token format' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ valid: false, error: 'Database unavailable' }, { status: 503 });
    }

    const snap = await db.collection('welcome_tokens').where('token', '==', token).limit(1).get();

    if (snap.empty) {
      return NextResponse.json({ valid: false, error: 'Token not found' }, { status: 404 });
    }

    const tokenDoc = snap.docs[0]!;
    const data = tokenDoc.data();

    if (data.used) {
      return NextResponse.json({ valid: false, error: 'Token already used' }, { status: 410 });
    }

    if (data.expiresAt && new Date(data.expiresAt as string) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Token expired' }, { status: 410 });
    }

    await tokenDoc.ref.update({ used: true, usedAt: new Date().toISOString() });

    if (data.userId) {
      await db.collection('users').doc(data.userId as string).update({
        emailVerified: true,
        innerCircle: true,
        innerCircleJoinedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      valid: true,
      userId: data.userId ?? null,
      customerName: data.customerName ?? null,
      reservationId: data.reservationId ?? null,
    });
  } catch (error) {
    console.error('[WelcomeVerify] Error:', error);
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 });
  }
}
