import { db } from '@/lib/firebase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const WaitlistSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  productName: z.string(),
  variantName: z.string(),
  contactInfo: z.string().min(5),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = WaitlistSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 });
    }

    if (!db) throw new Error('Database not initialized');

    const waitlistRef = db.collection('waitlist').doc();
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
