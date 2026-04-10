import { NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase/server';

export async function POST(req: Request) {
  try {
    const firestore = db;
    const firebaseAuth = auth;
    
    if (!firestore || !firebaseAuth) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const { email } = await req.json();
    
    if (email !== 'abdalrahman32008@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersRef = firestore.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userDoc = snapshot.docs[0];
    
    // Set custom claim
    await firebaseAuth.setCustomUserClaims(userDoc.id, { admin: true });

    await userDoc.ref.update({
      role: 'admin',
      tier: 'InnerCircle',
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: 'User promoted to admin' });
  } catch (error) {
    console.error('Promotion error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
