'use server';

import { db } from '@/lib/firebase/server';
import { decryptPII } from '@/lib/utils/encryption';
import { Reservation } from '@/types';

export async function getAdminReservations(statusFilter: string = 'all') {
  try {
    let query: FirebaseFirestore.Query = db.collection('reservations').orderBy('createdAt', 'desc');
    
    if (statusFilter !== 'all') {
      query = query.where('status', '==', statusFilter);
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
    throw new Error('Failed to fetch reservations');
  }
}

export async function getAdminReservationById(id: string) {
  try {
    const doc = await db.collection('reservations').doc(id).get();
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
    throw new Error('Failed to fetch reservation');
  }
}

export async function updateConciergeNotes(id: string, notes: string) {
  try {
    await db.collection('reservations').doc(id).update({
      conciergeNotes: notes,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating notes:', error);
    throw new Error('Failed to update notes');
  }
}

export async function initializeProductionDatabase() {
  try {
    const counterRef = db.collection('counters').doc('reservations');
    const counterDoc = await counterRef.get();

    if (!counterDoc.exists) {
      await counterRef.set({ current: 10000 });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing production database:', error);
    throw new Error('Failed to initialize database');
  }
}

export async function getAdminCustomers() {
  try {
    const snapshot = await db.collection('reservations').get();
    const customersMap = new Map<string, any>();

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
          orderCount: 0,
          lastOrderDate: data.createdAt,
        });
      }

      const customer = customersMap.get(key);
      customer.totalSpend += data.totalAmount || 0;
      customer.orderCount += 1;
      
      if (new Date(data.createdAt) > new Date(customer.lastOrderDate)) {
        customer.lastOrderDate = data.createdAt;
      }
    });

    return Array.from(customersMap.values()).sort((a, b) => b.totalSpend - a.totalSpend);
  } catch (error) {
    console.error('Error fetching admin customers:', error);
    throw new Error('Failed to fetch customers');
  }
}

import { sendStatusUpdateEmail } from '@/lib/mail';
import { sendPushNotification } from '@/lib/services/push.service';

export async function updateReservationStatus(id: string, status: Reservation['status']) {
  try {
    const ref = db.collection('reservations').doc(id);
    await ref.update({ 
      status, 
      updatedAt: new Date().toISOString() 
    });
    
    // Optional: Send email notification if status is shipped or deposit_paid
    const doc = await ref.get();
    if (doc.exists) {
      const data = doc.data() as Reservation;
      
      // Handle Email
      if (data.customerInfo.email && (status === 'deposit_paid' || status === 'shipped')) {
        try {
          await sendStatusUpdateEmail(data.customerInfo.email, data.orderNumber || data.reservationNumber, status, undefined, data.customerInfo.fullName);
        } catch (e) {
          console.error('Failed to send status update email:', e);
        }
      }

      // Handle Push Notification
      if (status === 'shipped') {
        try {
          // Fetch user to get FCM token
          if (data.userId && data.userId !== 'guest') {
            const userDoc = await db.collection('users').doc(data.userId).get();
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
    throw new Error('Failed to update status');
  }
}

export async function bulkUpdateReservations(ids: string[], status: Reservation['status']) {
  try {
    const batch = db.batch();
    const now = new Date().toISOString();

    // Fetch reservations first to get customer info
    const reservations = await Promise.all(ids.map(id => db.collection('reservations').doc(id).get()));
    
    ids.forEach((id, index) => {
      const ref = db.collection('reservations').doc(id);
      batch.update(ref, { status, updatedAt: now });
    });

    await batch.commit();

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
    throw new Error('Failed to update reservations');
  }
}
