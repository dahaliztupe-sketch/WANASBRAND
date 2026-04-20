import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';

import { db } from '@/lib/firebase/client';

/**
 * Community & Loyalty Features for WANAS Atelier.
 * Loyalty tiers: Silver → Gold → Platinum → Diamond
 */

export type LoyaltyTier = 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface LoyaltyStatus {
  tier: LoyaltyTier;
  points: number;
  totalSpent: number;
  nextTierThreshold: number | null;
  nextTierName: LoyaltyTier | null;
  discount: number;
}

const TIER_THRESHOLDS: { tier: LoyaltyTier; minSpent: number; discount: number }[] = [
  { tier: 'Diamond',  minSpent: 200_000, discount: 0.15 },
  { tier: 'Platinum', minSpent: 100_000, discount: 0.10 },
  { tier: 'Gold',     minSpent: 50_000,  discount: 0.07 },
  { tier: 'Silver',   minSpent: 0,       discount: 0.03 },
];

export const calculateLoyaltyTier = (totalSpent: number): LoyaltyTier => {
  for (const { tier, minSpent } of TIER_THRESHOLDS) {
    if (totalSpent >= minSpent) return tier;
  }
  return 'Silver';
};

export const getLoyaltyStatus = async (userId: string): Promise<LoyaltyStatus> => {
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    const data = snap.exists() ? snap.data() : {};
    const totalSpent: number = data.totalSpent ?? 0;
    const points: number     = data.loyaltyPoints ?? 0;

    const tier = calculateLoyaltyTier(totalSpent);
    const currentIdx = TIER_THRESHOLDS.findIndex(t => t.tier === tier);
    const next = currentIdx > 0 ? TIER_THRESHOLDS[currentIdx - 1] : null;
    const discount = TIER_THRESHOLDS.find(t => t.tier === tier)?.discount ?? 0.03;

    return {
      tier,
      points,
      totalSpent,
      discount,
      nextTierThreshold: next?.minSpent ?? null,
      nextTierName:      next?.tier      ?? null,
    };
  } catch (error) {
    console.error('[Community] Error fetching loyalty status:', error);
    return {
      tier: 'Silver',
      points: 0,
      totalSpent: 0,
      discount: 0.03,
      nextTierThreshold: 50_000,
      nextTierName: 'Gold',
    };
  }
};

const POINT_RULES: Record<string, number> = {
  reservation_confirmed: 100,
  review_submitted:      20,
  referral_signup:       50,
  birthday:              30,
  profile_completed:     10,
  social_share:          5,
  first_purchase:        200,
  wishlist_item_added:   2,
};

export const earnPoints = async (userId: string, action: string): Promise<{ points: number; total: number } | null> => {
  const pointsToAdd = POINT_RULES[action] ?? 0;
  if (pointsToAdd === 0) return null;

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      loyaltyPoints: increment(pointsToAdd),
      [`loyaltyHistory.${action}`]: serverTimestamp(),
    });

    await addDoc(collection(db, 'loyalty_transactions'), {
      userId,
      action,
      points: pointsToAdd,
      createdAt: serverTimestamp(),
    });

    const updated = await getDoc(userRef);
    const total = updated.data()?.loyaltyPoints ?? pointsToAdd;
    console.info(`[Community] +${pointsToAdd} pts → user=${userId} action=${action} total=${total}`);
    return { points: pointsToAdd, total };
  } catch (error) {
    console.error('[Community] Error earning points:', error);
    return null;
  }
};

export const redeemPoints = async (userId: string, pointsToRedeem: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return { success: false, error: 'User not found' };

    const currentPoints: number = snap.data().loyaltyPoints ?? 0;
    if (currentPoints < pointsToRedeem) {
      return { success: false, error: 'Insufficient points', available: currentPoints };
    }

    await updateDoc(userRef, { loyaltyPoints: increment(-pointsToRedeem) });

    await addDoc(collection(db, 'loyalty_transactions'), {
      userId,
      action: 'points_redeemed',
      points: -pointsToRedeem,
      createdAt: serverTimestamp(),
    });

    const discountEGP = pointsToRedeem * 0.1;
    return { success: true, discountEGP, remainingPoints: currentPoints - pointsToRedeem };
  } catch (error) {
    console.error('[Community] Error redeeming points:', error);
    return { success: false, error };
  }
};

export const submitProductReview = async (
  userId: string,
  productId: string,
  review: { rating: number; comment: string; images?: string[] }
) => {
  try {
    await addDoc(collection(db, 'reviews'), {
      userId,
      productId,
      ...review,
      status: 'pending_moderation',
      helpful: 0,
      createdAt: serverTimestamp(),
    });

    await earnPoints(userId, 'review_submitted');
    return true;
  } catch (error) {
    console.error('[Community] Error submitting review:', error);
    return false;
  }
};

export const getProductReviews = async (productId: string, limitCount = 10) => {
  try {
    const snap = await getDocs(
      query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('[Community] Error fetching reviews:', error);
    return [];
  }
};

export const getLoyaltyTransactions = async (userId: string, limitCount = 20) => {
  try {
    const snap = await getDocs(
      query(
        collection(db, 'loyalty_transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('[Community] Error fetching transactions:', error);
    return [];
  }
};
