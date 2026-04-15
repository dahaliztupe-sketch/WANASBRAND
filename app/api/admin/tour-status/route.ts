import { NextResponse } from 'next/server';

import { db } from '@/lib/firebase/server';

export async function POST(req: Request) {
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  try {
    const { userId, status } = await req.json();
    
    if (!userId || !status) {
      return NextResponse.json({ error: 'Missing userId or status' }, { status: 400 });
    }

    await db.collection('users').doc(userId).update({
      tourStatus: status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tour status update error:', error);
    return NextResponse.json({ error: 'Failed to update tour status' }, { status: 500 });
  }
}
