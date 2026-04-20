import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

/**
 * Subscription & Recurring Plans for WANAS Atelier.
 * Persisted to Firestore `subscriptions` collection.
 */

export type SubscriptionFrequency = 'monthly' | 'quarterly' | 'biannual' | 'annual';
export type SubscriptionStatus    = 'active' | 'paused' | 'cancelled' | 'expired';

export interface SubscriptionPlan {
  id: string;
  userId: string;
  productId: string;
  productName?: string;
  frequency: SubscriptionFrequency;
  status: SubscriptionStatus;
  nextRenewalDate: Timestamp;
  totalRenewals: number;
  createdAt: Timestamp;
}

const FREQUENCY_DAYS: Record<SubscriptionFrequency, number> = {
  monthly:  30,
  quarterly: 90,
  biannual: 180,
  annual:   365,
};

function nextRenewalDate(frequency: SubscriptionFrequency): Date {
  const d = new Date();
  d.setDate(d.getDate() + FREQUENCY_DAYS[frequency]);
  return d;
}

export const createSubscriptionPlan = async (
  userId: string,
  details: {
    productId: string;
    productName?: string;
    frequency: SubscriptionFrequency;
  }
) => {
  try {
    const { productId, productName, frequency } = details;
    const renewal = nextRenewalDate(frequency);

    const docRef = await addDoc(collection(db, 'subscriptions'), {
      userId,
      productId,
      productName: productName ?? '',
      frequency,
      status: 'active',
      nextRenewalDate: Timestamp.fromDate(renewal),
      totalRenewals: 0,
      createdAt: serverTimestamp(),
    });

    console.info(`[Subscriptions] Created plan ${docRef.id} for user=${userId}`);
    return { success: true, subscriptionId: docRef.id, nextRenewalDate: renewal };
  } catch (error) {
    console.error('[Subscriptions] Error creating plan:', error);
    return { success: false, error };
  }
};

export const processSubscriptionRenewal = async (subscriptionId: string) => {
  try {
    const ref = doc(db, 'subscriptions', subscriptionId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Subscription not found' };

    const data = snap.data() as SubscriptionPlan;
    if (data.status !== 'active') {
      return { success: false, error: `Subscription is ${data.status}` };
    }

    const nextRenewal = nextRenewalDate(data.frequency);

    await updateDoc(ref, {
      nextRenewalDate: Timestamp.fromDate(nextRenewal),
      totalRenewals: (data.totalRenewals ?? 0) + 1,
      lastRenewedAt: serverTimestamp(),
    });

    console.info(`[Subscriptions] Renewed ${subscriptionId} → next: ${nextRenewal.toISOString()}`);
    return { success: true, subscriptionId, nextRenewalDate: nextRenewal };
  } catch (error) {
    console.error('[Subscriptions] Error processing renewal:', error);
    return { success: false, error };
  }
};

export const pauseSubscription = async (subscriptionId: string) => {
  try {
    await updateDoc(doc(db, 'subscriptions', subscriptionId), {
      status: 'paused',
      pausedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    await updateDoc(doc(db, 'subscriptions', subscriptionId), {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const getUserSubscriptions = async (userId: string): Promise<SubscriptionPlan[]> => {
  try {
    const snap = await getDocs(
      query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SubscriptionPlan));
  } catch (error) {
    console.error('[Subscriptions] Error fetching user subscriptions:', error);
    return [];
  }
};

export const getDueRenewals = async (): Promise<SubscriptionPlan[]> => {
  try {
    const now = Timestamp.now();
    const snap = await getDocs(
      query(
        collection(db, 'subscriptions'),
        where('status', '==', 'active'),
        where('nextRenewalDate', '<=', now),
        orderBy('nextRenewalDate', 'asc')
      )
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SubscriptionPlan));
  } catch (error) {
    console.error('[Subscriptions] Error fetching due renewals:', error);
    return [];
  }
};
