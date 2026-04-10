import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/server';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    const firestore = db;
    if (!firestore) throw new Error('Database not initialized');

    await firestore.collection('products').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
