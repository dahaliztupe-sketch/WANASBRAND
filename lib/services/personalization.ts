import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

import { db } from '@/lib/firebase/client';
import { Product } from '@/types';

/**
 * WANAS Personalization Engine
 * Generates product recommendations based on browsing history, category affinity, and price tier.
 */

interface RecentlyViewedItem {
  id: string;
  category: string;
  price: number;
}

/**
 * Fetch recommended products based on recently viewed items.
 * Strategy: same category as most-viewed, similar price range, exclude already-seen.
 */
export const getRecommendedProducts = async (
  recentlyViewed: RecentlyViewedItem[],
  maxResults = 4
): Promise<Product[]> => {
  if (recentlyViewed.length === 0) return getTrendingProducts(maxResults);

  try {
    // Determine most frequent category from browsing history
    const categoryCounts = recentlyViewed.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    }, {});

    const topCategory = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0];
    const viewedIds = new Set(recentlyViewed.map((i) => i.id));

    // Average price of recently viewed for price-range affinity
    const avgPrice =
      recentlyViewed.reduce((sum, i) => sum + i.price, 0) / recentlyViewed.length;
    const priceFloor = Math.max(0, avgPrice * 0.5);
    const priceCeiling = avgPrice * 2;

    const q = query(
      collection(db, 'products'),
      where('status', '==', 'Published'),
      where('category', '==', topCategory),
      limit(maxResults + viewedIds.size) // Over-fetch to filter out viewed
    );

    const snapshot = await getDocs(q);

    const candidates = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Product))
      .filter(
        (p) =>
          !viewedIds.has(p.id) &&
          p.price >= priceFloor &&
          p.price <= priceCeiling
      )
      .slice(0, maxResults);

    // If not enough results in same category, fill from trending
    if (candidates.length < maxResults) {
      const trending = await getTrendingProducts(maxResults - candidates.length, viewedIds);
      return [...candidates, ...trending];
    }

    return candidates;
  } catch (error) {
    console.error('[Personalization] Error fetching recommendations:', error);
    return getTrendingProducts(maxResults);
  }
};

/**
 * Fallback: fetch recently published products as "trending"
 */
export const getTrendingProducts = async (
  maxResults = 4,
  excludeIds: Set<string> = new Set()
): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, 'products'),
      where('status', '==', 'Published'),
      orderBy('createdAt', 'desc'),
      limit(maxResults + excludeIds.size + 2)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Product))
      .filter((p) => !excludeIds.has(p.id))
      .slice(0, maxResults);
  } catch (error) {
    console.error('[Personalization] Error fetching trending:', error);
    return [];
  }
};

/**
 * A/B test variant assignment — deterministic by userId
 */
export const getABTestVariant = (userId: string): 'A' | 'B' => {
  const charCodeSum = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return charCodeSum % 2 === 0 ? 'A' : 'B';
};
