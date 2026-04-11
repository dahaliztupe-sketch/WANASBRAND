import { db, appCheck } from '@/lib/firebase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Basic in-memory rate limiter for edge protection
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (now - record.lastReset > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

const WaitlistSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  productName: z.string(),
  variantName: z.string(),
  contactInfo: z.string().min(5),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    // 1. Verify App Check Token
    const appCheckToken = req.headers.get('X-Firebase-AppCheck');
    if (!appCheckToken) {
      return NextResponse.json({ error: 'Unauthorized: Missing App Check token' }, { status: 401 });
    }

    if (appCheck) {
      try {
        await appCheck.verifyToken(appCheckToken);
      } catch (err) {
        console.error('App Check token verification failed:', err);
        return NextResponse.json({ error: 'Unauthorized: Invalid App Check token' }, { status: 401 });
      }
    }

    const body = await req.json();
    const validation = WaitlistSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 });
    }

    const firestore = db;
    if (!firestore) throw new Error('Database not initialized');

    const waitlistRef = firestore.collection('waitlist').doc();
    await waitlistRef.set({
      ...validation.data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: waitlistRef.id });
  } catch (error) {
    console.error('Waitlist request error:', error);
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
  }
}
