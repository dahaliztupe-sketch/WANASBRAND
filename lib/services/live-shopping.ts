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
  limit,
  serverTimestamp,
  increment,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

/**
 * Live Shopping Events for WANAS Atelier.
 * Supports event creation, real-time inventory, and push notifications.
 */

export interface LiveEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  products: string[];
  status: 'scheduled' | 'live' | 'ended';
  viewerCount: number;
  subscriberCount: number;
  createdAt: unknown;
}

export const createLiveEvent = async (details: {
  title: string;
  description: string;
  startTime: Date;
  products: string[];
  hostName?: string;
  thumbnailUrl?: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, 'live_events'), {
      ...details,
      status: 'scheduled',
      viewerCount: 0,
      subscriberCount: 0,
      createdAt: serverTimestamp(),
    });
    console.info(`[LiveShopping] Created event ${docRef.id}: ${details.title}`);
    return docRef.id;
  } catch (error) {
    console.error('[LiveShopping] Error creating event:', error);
    return null;
  }
};

export const startLiveEvent = async (eventId: string) => {
  try {
    await updateDoc(doc(db, 'live_events', eventId), {
      status: 'live',
      actualStartTime: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('[LiveShopping] Error starting event:', error);
    return { success: false, error };
  }
};

export const endLiveEvent = async (eventId: string) => {
  try {
    await updateDoc(doc(db, 'live_events', eventId), {
      status: 'ended',
      endedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('[LiveShopping] Error ending event:', error);
    return { success: false, error };
  }
};

export const trackLiveInventory = async (productId: string): Promise<{
  available: number;
  reserved: number;
  productId: string;
} | null> => {
  try {
    const snap = await getDoc(doc(db, 'products', productId));
    if (!snap.exists()) return null;

    const data = snap.data();
    const available: number = data.inventory ?? data.stock ?? 0;
    const reserved: number  = data.reserved   ?? 0;

    return { productId, available: Math.max(0, available - reserved), reserved };
  } catch (error) {
    console.error('[LiveShopping] Error tracking inventory for', productId, ':', error);
    return null;
  }
};

export const subscribeToEvent = async (eventId: string, userId: string) => {
  try {
    await addDoc(collection(db, 'event_subscribers'), {
      eventId,
      userId,
      subscribedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'live_events', eventId), {
      subscriberCount: increment(1),
    });

    return { success: true };
  } catch (error) {
    console.error('[LiveShopping] Error subscribing to event:', error);
    return { success: false, error };
  }
};

export const notifySubscribers = async (
  eventId: string,
  data: { title: string; message: string; link?: string }
) => {
  try {
    const subscribersSnap = await getDocs(
      query(
        collection(db, 'event_subscribers'),
        where('eventId', '==', eventId)
      )
    );

    const notificationPromises = subscribersSnap.docs.map(subscriberDoc =>
      addDoc(collection(db, 'notifications'), {
        userId:    subscriberDoc.data().userId,
        type:      'live_event',
        eventId,
        title:     data.title,
        message:   data.message,
        link:      data.link ?? `/live/${eventId}`,
        read:      false,
        createdAt: serverTimestamp(),
      })
    );

    const results = await Promise.allSettled(notificationPromises);
    const sent = results.filter(r => r.status === 'fulfilled').length;

    console.info(`[LiveShopping] Notified ${sent}/${subscribersSnap.size} subscribers for event ${eventId}`);
    return { success: true, notified: sent, total: subscribersSnap.size };
  } catch (error) {
    console.error('[LiveShopping] Error notifying subscribers:', error);
    return { success: false, error };
  }
};

export const getUpcomingEvents = async (limitCount = 5): Promise<LiveEvent[]> => {
  try {
    const snap = await getDocs(
      query(
        collection(db, 'live_events'),
        where('status', 'in', ['scheduled', 'live']),
        orderBy('startTime', 'asc'),
        limit(limitCount)
      )
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LiveEvent));
  } catch (error) {
    console.error('[LiveShopping] Error fetching upcoming events:', error);
    return [];
  }
};

export const subscribeToEventUpdates = (
  eventId: string,
  callback: (event: LiveEvent | null) => void
): Unsubscribe => {
  return onSnapshot(doc(db, 'live_events', eventId), snap => {
    if (!snap.exists()) { callback(null); return; }
    callback({ id: snap.id, ...snap.data() } as LiveEvent);
  });
};
