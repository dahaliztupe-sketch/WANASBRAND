import { db } from '@/lib/firebase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId, status } = await req.json();
    
    if (!userId || !status) {
      return NextResponse.json({ error: 'Missing userId or status' }, { status: 400 });
    }
    const firestore = db;
    if (!firestore) throw new Error('Database not initialized');

    await firestore.collection('users').doc(userId).update({
      tourStatus: status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tour status update error:', error);
    return NextResponse.json({ error: 'Failed to update tour status' }, { status: 500 });
  }
}
