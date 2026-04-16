import { User } from '@/types';

import { db } from '../firebase/server';

export type Tier = 'Guest' | 'Member' | 'InnerCircle';

export const calculateTier = (totalSpent: number): Tier => {
  if (totalSpent >= 50000) return 'InnerCircle';
  if (totalSpent >= 10000) return 'Member';
  return 'Guest';
};

export const addPointsServer = async (userId: string, points: number) => {
  if (!userId || userId === 'guest') return;
  
  try {
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists) return;

    const userData = userSnap.data() as User;
    const newTotalSpent = (userData.totalSpent || 0) + (points / 10); 
    const newTier = calculateTier(newTotalSpent);

    await userRef.update({
      loyaltyPoints: (userData.loyaltyPoints || 0) + points,
      totalSpent: newTotalSpent,
      tier: newTier,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error adding loyalty points (server):', error);
  }
};
