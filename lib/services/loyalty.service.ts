import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';

import { User } from '@/types';

import { db } from '../firebase/client';

export type Tier = 'Guest' | 'Member' | 'InnerCircle';

export const calculateTier = (totalSpent: number): Tier => {
  if (totalSpent >= 50000) return 'InnerCircle';
  if (totalSpent >= 10000) return 'Member';
  return 'Guest';
};

export const addPoints = async (userId: string, points: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;

    const userData = userSnap.data() as User;
    const newTotalSpent = (userData.totalSpent || 0) + (points / 10); // Example: 10 points per 1 EGP spent for tier calculation? Or just use points.
    // Let's assume points = amount spent for simplicity in this example.
    
    const newTier = calculateTier(newTotalSpent);

    await updateDoc(userRef, {
      loyaltyPoints: increment(points),
      totalSpent: increment(points / 10), // Assuming points are awarded based on spending
      tier: newTier,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error adding loyalty points:', error);
  }
};
