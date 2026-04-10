import { db } from '@/lib/firebase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const ConciergeSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  contactMethod: z.enum(['whatsapp', 'phone']),
  vibe: z.enum(['styling', 'sizing']),
  consent: z.literal(true),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = ConciergeSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 });
    }

    const firestore = db;
    if (!firestore) throw new Error('Database not initialized');

    const conciergeRef = firestore.collection('concierge_requests').doc();
    await conciergeRef.set({
      ...validation.data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: conciergeRef.id });
  } catch (error) {
    console.error('Concierge request error:', error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}
