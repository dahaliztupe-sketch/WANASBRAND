import { Redis } from '@upstash/redis';
import { db } from '@/lib/firebase/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCachedProduct(slug: string) {
  const cacheKey = `product:${slug}`;
  
  try {
    // 1. Try Redis First (0 Firestore Reads)
    const cached = await redis.get(cacheKey);
    if (cached) return cached;

    // 2. Fallback to Firestore (1 Read)
    if (!db) {
      console.warn('Firestore not initialized. Cache fallback skipped.');
      return null;
    }
    const snapshot = await db.collection('products').where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) return null;
    
    const product = snapshot.docs[0].data();
    
    // 3. Save to Redis (Cache for 1 hour)
    await redis.setex(cacheKey, 3600, product);
    
    return product;
  } catch (error) {
    console.error('Cache service error:', error);
    // Fallback to direct DB query if Redis fails
    if (!db) return null;
    const snapshot = await db.collection('products').where('slug', '==', slug).limit(1).get();
    return snapshot.empty ? null : snapshot.docs[0].data();
  }
}
