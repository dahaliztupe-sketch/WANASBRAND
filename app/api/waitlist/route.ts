import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/lib/firebase/server';
import { waitlistRateLimit } from '@/lib/upstash';

const WaitlistSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  productName: z.string(),
  variantName: z.string(),
  contactInfo: z.string().min(5),
  website: z.string().optional(), // Honeypot field
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // 1. Enhanced Rate Limiting with Upstash
    if (waitlistRateLimit) {
      const { success } = await waitlistRateLimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Too many requests. Please try again in an hour.' }, { status: 429 });
      }
    }

    const body = await req.json();
    
    // 2. Honeypot Check
    if (body.website) {
      console.warn(`Honeypot triggered by IP: ${ip}`);
      // Silently reject or return success to fool the bot
      return NextResponse.json({ success: true, message: 'Joined waitlist' });
    }

    const validation = WaitlistSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 });
    }

    const firestore = db;
    if (!firestore) throw new Error('Database not initialized');

    const waitlistRef = firestore.collection('waitlist').doc();
    
    // Remove honeypot field before saving
    const { website: _website, ...dataToSave } = validation.data;

    await waitlistRef.set({
      ...dataToSave,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: waitlistRef.id });
  } catch (error) {
    console.error('Waitlist request error:', error);
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
  }
}
