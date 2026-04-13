import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

/**
 * Community & Loyalty Features for WANAS.
 */

export const submitProductReview = async (userId: string, productId: string, review: { rating: number; comment: string }) => {
  try {
    await addDoc(collection(db, 'reviews'), {
      userId,
      productId,
      ...review,
      status: 'pending_moderation',
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error submitting review:', error);
    return false;
  }
};

export const calculateLoyaltyTier = (totalSpent: number) => {
  if (totalSpent > 100000) return 'Platinum';
  if (totalSpent > 50000) return 'Gold';
  return 'Silver';
};

export const earnPoints = async (userId: string, action: string) => {
  console.log(`User ${userId} earned points for: ${action}`);
};
