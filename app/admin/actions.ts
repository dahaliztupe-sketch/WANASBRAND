'use server';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { db } from '@/lib/firebase/server';
import { sendStatusUpdateEmail } from '@/lib/mail';
import { sendPushNotification } from '@/lib/services/push.service';
import { decryptPII } from '@/lib/utils/encryption';
import { logAdminAction } from '@/lib/services/audit.service';
import { Reservation } from '@/types';

const SESSION_SECRET = process.env.SESSION_SECRET || 'default_session_secret_change_me_in_production';
const secret = new TextEncoder().encode(SESSION_SECRET);

async function getAdminFromSession() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    if (!sessionToken) return null;

    const { payload } = await jwtVerify(sessionToken, secret);
    return {
      uid: payload.uid as string,
      name: (payload.name as string) || 'Admin',
    };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}

export async function getAdminReservations(statusFilter: string | string[] = 'active', limitCount: number = 100) {
  try {
    const firestore = db;
    if (!firestore) return null;
    let query: FirebaseFirestore.Query = firestore.collection('reservations').orderBy('createdAt', 'desc');
    
    if (statusFilter === 'active') {
      // Fetch only active statuses for the Kanban board (excluding historical 'shipped' orders)
      query = query.where('status', 'in', ['pending_contact', 'contacted', 'deposit_paid', 'in_production']);
    } else if (Array.isArray(statusFilter)) {
      query = query.where('status', 'in', statusFilter);
    } else if (statusFilter !== 'all') {
      query = query.where('status', '==', statusFilter);
    }

    if (limitCount > 0) {
      query = query.limit(limitCount);
    }

    const snapshot = await query.get();
    const reservations = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        customerInfo: {
          ...data.customerInfo,
          phone: decryptPII(data.customerInfo.phone),
        }
      } as Reservation;
    });

    return reservations;
  } catch (error) {
    console.error('Error fetching admin reservations:', error);
    return null;
  }
}

export async function getAdminReservationById(id: string) {
  try {
    const firestore = db;
    if (!firestore) return null;
    const doc = await firestore.collection('reservations').doc(id).get();
    if (!doc.exists) return null;

    const data = doc.data()!;
    return {
      ...data,
      id: doc.id,
      customerInfo: {
        ...data.customerInfo,
        phone: decryptPII(data.customerInfo.phone),
        address: data.customerInfo.address ? decryptPII(data.customerInfo.address) : '',
      }
    } as Reservation;
  } catch (error) {
    console.error('Error fetching admin reservation:', error);
    return null;
  }
}

export async function updateConciergeNotes(id: string, notes: string) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return { success: false, error: 'Unauthorized' };

    const firestore = db;
    if (!firestore) return { success: false, error: 'Database not initialized' };
    
    const ref = firestore.collection('reservations').doc(id);
    const doc = await ref.get();
    if (!doc.exists) return { success: false, error: 'Reservation not found' };
    
    const oldData = doc.data();

    await ref.update({
      conciergeNotes: notes,
      updatedAt: new Date().toISOString()
    });

    await logAdminAction(
      admin.uid,
      admin.name,
      'update_concierge_notes',
      id,
      'reservation',
      { notes: oldData?.conciergeNotes },
      { notes }
    );

    return { success: true };
  } catch (error) {
    console.error('Error updating notes:', error);
    return { success: false, error: 'Failed to update notes' };
  }
}

export async function initializeProductionDatabase() {
  try {
    const firestore = db;
    if (!firestore) return { success: false, error: 'Database not initialized' };
    const counterRef = firestore.collection('counters').doc('reservations');
    const counterDoc = await counterRef.get();

    if (!counterDoc.exists) {
      await counterRef.set({ current: 10000 });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing production database:', error);
    return { success: false, error: 'Failed to initialize database' };
  }
}

export async function getAdminCustomers() {
  try {
    const firestore = db;
    if (!firestore) return null;
    
    // OPTIMIZATION: Instead of fetching ALL reservations in history (which causes N+1 reads and OOM),
    // we fetch only the most recent 1000 reservations to build the active customer directory.
    // For a full historical directory, a denormalized 'customers' collection should be maintained via Cloud Functions.
    const snapshot = await firestore.collection('reservations')
      .orderBy('createdAt', 'desc')
      .limit(1000)
      .get();
      
    const customersMap = new Map<string, {
      id: string;
      name: string;
      email: string;
      phone: string;
      totalSpend: number;
      reservationCount: number;
      lastReservationDate: string;
    }>();

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const email = data.customerInfo.email?.toLowerCase().trim();
      const phone = decryptPII(data.customerInfo.phone);
      // Use email as primary key, fallback to phone
      const key = email || phone;

      if (!key) return;

      if (!customersMap.has(key)) {
        customersMap.set(key, {
          id: key,
          name: data.customerInfo.firstName + ' ' + data.customerInfo.lastName,
          email: email || 'N/A',
          phone: phone,
          totalSpend: 0,
          reservationCount: 0,
          lastReservationDate: data.createdAt,
        });
      }

      const customer = customersMap.get(key)!;
      customer.totalSpend += (data.financials?.total as number) || (data.totalAmount as number) || 0;
      customer.reservationCount += 1;
      
      if (new Date(data.createdAt) > new Date(customer.lastReservationDate)) {
        customer.lastReservationDate = data.createdAt;
      }
    });

    return Array.from(customersMap.values()).sort((a, b) => b.totalSpend - a.totalSpend);
  } catch (error) {
    console.error('Error fetching admin customers:', error);
    return null;
  }
}

export async function updateReservationStatus(id: string, status: Reservation['status'], clientUpdatedAt?: number) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return { success: false, error: 'Unauthorized' };

    const firestore = db;
    if (!firestore) return { success: false, error: 'Database not initialized' };
    const ref = firestore.collection('reservations').doc(id);
    
    let oldStatus: string | undefined;

    await firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(ref);
      if (!doc.exists) {
        throw new Error('Reservation does not exist');
      }
      
      const data = doc.data();
      oldStatus = data?.status;
      const serverUpdatedAt = data?.updatedAt ? new Date(data.updatedAt).getTime() : 0;
      
      if (clientUpdatedAt && serverUpdatedAt > clientUpdatedAt) {
        throw new Error('StaleDataError: The reservation was modified by another user. Please refresh the board and try again.');
      }
      
      transaction.update(ref, {
        status,
        updatedAt: new Date().toISOString()
      });
    });

    await logAdminAction(
      admin.uid,
      admin.name,
      'update_reservation_status',
      id,
      'reservation',
      { status: oldStatus },
      { status }
    );
    
    // Optional: Send email notification if status is shipped or deposit_paid
    const doc = await ref.get();
    if (doc.exists) {
      const data = doc.data() as Reservation;
      
      // Handle Email
      if (data.customerInfo.email && (status === 'deposit_paid' || status === 'shipped')) {
        try {
          await sendStatusUpdateEmail(data.customerInfo.email, data.reservationNumber, status, undefined, data.customerInfo.fullName);
        } catch (e) {
          console.error('Failed to send status update email:', e);
        }
      }

      // Handle Push Notification
      if (status === 'shipped') {
        try {
          // Fetch user to get FCM token
          if (data.userId && data.userId !== 'guest') {
            const firestore = db;
            if (!firestore) return { success: false, error: 'Database not initialized' };
            const userDoc = await firestore.collection('users').doc(data.userId).get();
            const userData = userDoc.data();
            if (userData?.fcmToken) {
              await sendPushNotification(
                userData.fcmToken,
                'Your WANAS piece is on its way',
                'Your WANAS piece is on its way to your sanctuary.'
              );
            }
          }
        } catch (e) {
          console.error('Failed to send push notification:', e);
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating reservation status:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

export async function bulkUpdateReservations(ids: string[], status: Reservation['status']) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return { success: false, error: 'Unauthorized' };

    const database = db;
    if (!database) return { success: false, error: 'Database not initialized' };
    const batch = database.batch();
    const now = new Date().toISOString();

    // Fetch reservations first to get customer info
    const reservations = await Promise.all(ids.map(id => database.collection('reservations').doc(id).get()));
    
    ids.forEach((id) => {
      const ref = database.collection('reservations').doc(id);
      batch.update(ref, { status, updatedAt: now });
    });

    await batch.commit();

    // Log bulk action
    await logAdminAction(
      admin.uid,
      admin.name,
      'bulk_update_reservations',
      ids.join(','),
      'reservation',
      { count: ids.length },
      { status }
    );

    // Send emails
    for (const doc of reservations) {
        if (!doc.exists) continue;
        const data = doc.data() as Reservation;
        if (status === 'deposit_paid' || status === 'shipped') {
            await sendStatusUpdateEmail(data.customerInfo.email!, data.reservationNumber, status, undefined, data.customerInfo.fullName);
        }
    }

    return { success: true };
  } catch (error) {
    console.error('Error bulk updating reservations:', error);
    return { success: false, error: 'Failed to update reservations' };
  }
}
