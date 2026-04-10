import { NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase/server';

export async function GET(request: Request) {
  const firestore = db;
  const firebaseAuth = auth;

  if (!firestore || !firebaseAuth) {
    return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
  }

  try {
    console.log('Seeding counters/reservations...');
    await firestore.collection('counters').doc('reservations').set({ current: 10000 });

    console.log('Seeding settings/global...');
    await firestore.collection('settings').doc('global').set({
      shipping_cairo: 150,
      shipping_other: 250,
      instapay_handle: "wanas@instapay"
    });

    console.log('Seeding products/sample-product...');
    await firestore.collection('products').doc('sample-product').set({
      name: 'The Signature Silk Dress',
      slug: 'signature-silk-dress',
      description: 'A timeless piece crafted from the finest silk.',
      price: 4500,
      category: 'Evening Dresses',
      images: ['https://picsum.photos/seed/silk-dress/800/1200'],
      status: 'Published',
      variants: [
        {
          id: 'var-1',
          size: 'S',
          color: 'Midnight Blue',
          stock: 5,
          isActive: true
        },
        {
          id: 'var-2',
          size: 'M',
          color: 'Midnight Blue',
          stock: 3,
          isActive: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Admin Promotion Logic
    try {
      const user = await firebaseAuth.getUserByEmail('abdalrahman32008@gmail.com');
      await firebaseAuth.setCustomUserClaims(user.uid, { admin: true });
      console.log('Admin claim set for abdalrahman32008@gmail.com');
    } catch (e: any) {
      console.log('User abdalrahman32008@gmail.com not found yet, skipping admin promotion:', e.message);
    }

    return NextResponse.json({ success: true, message: 'Seeding complete' });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
