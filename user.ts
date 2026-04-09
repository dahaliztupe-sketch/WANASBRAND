import { db } from './client';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { User as UserType } from '@/types';

const ADMIN_EMAIL = 'abdalrahman32008@gmail.com';

export async function syncUserToFirestore(firebaseUser: any) {
  if (!firebaseUser) return null;

  const userRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userRef);

  const isDefaultAdmin = firebaseUser.email === ADMIN_EMAIL;

  if (!userDoc.exists()) {
    const newUser: Partial<UserType> = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      fullName: firebaseUser.displayName || 'WANAS Client',
      role: isDefaultAdmin ? 'admin' : 'customer',
      tier: isDefaultAdmin ? 'InnerCircle' : 'Member',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userRef, newUser);
    
    if (isDefaultAdmin) {
      fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: firebaseUser.email })
      }).catch(console.error);
    }
    
    return newUser as UserType;
  } else {
    const existingData = userDoc.data() as UserType;
    
    // Retroactive check for the specific admin email
    if (isDefaultAdmin && existingData.role !== 'admin') {
      await updateDoc(userRef, { 
        role: 'admin',
        tier: 'InnerCircle',
        updatedAt: new Date().toISOString()
      });
      fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: firebaseUser.email })
      }).catch(console.error);
      return { ...existingData, role: 'admin', tier: 'InnerCircle' } as UserType;
    }
    
    return existingData;
  }
}

export async function promoteUserToAdmin(email: string) {
  // This would typically be a server-side function or admin-only
  // For this sprint, we'll use it in a secure context
  return { success: true, message: 'Admin promotion logic initialized.' };
}
