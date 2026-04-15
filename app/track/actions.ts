'use server';

import { collection, query, where, getDocs } from 'firebase/firestore';

import { db } from '@/lib/firebase/client';
import { decrypt } from '@/lib/utils/encryption';
import { Reservation } from '@/types';

export async function trackByToken(token: string) {
  try {
    const q = query(collection(db, 'reservations'), where('magicLinkToken', '==', token));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: 'Invalid tracking token.' };
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    
    // For token tracking, we might still want to verify phone last 4 digits for extra security
    // but the prompt says "enter the LAST 4 DIGITS of the phone number... before showing any data"
    // so I'll keep the data hidden until verified.
    
    return { 
      success: true, 
      data: { 
        id: doc.id, 
        reservationNumber: data.reservationNumber,
        status: data.status,
        // Don't return full data yet if we need phone verification
        needsVerification: true 
      } 
    };
  } catch {
    return { success: false, error: 'Failed to fetch tracking data.' };
  }
}

export async function trackReservation(reservationNumber: string, last4Digits: string) {
  try {
    const q = query(collection(db, 'reservations'), where('reservationNumber', '==', reservationNumber));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: 'Reservation not found.' };
    }

    const doc = snapshot.docs[0];
    const reservation = { id: doc.id, ...doc.data() } as Reservation;

    // Decrypt phone number
    const decryptedPhone = decrypt(reservation.customerInfo.phone);

    // Verify last 4 digits
    if (!decryptedPhone.endsWith(last4Digits)) {
      return { success: false, error: 'Verification failed: Phone number does not match.' };
    }

    // Prepare timeline steps
    const steps = [
      { status: 'Requested', completed: true },
      { status: 'Contacted', completed: ['contacted', 'deposit_paid', 'in_production', 'shipped', 'delivered'].includes(reservation.status) },
      { status: 'Confirmed', completed: ['deposit_paid', 'in_production', 'shipped', 'delivered'].includes(reservation.status) },
      { status: 'In Atelier', completed: ['in_production', 'shipped', 'delivered'].includes(reservation.status) },
      { status: 'Shipped', completed: ['shipped', 'delivered'].includes(reservation.status) },
    ];

    return {
      success: true,
      data: {
        id: reservation.reservationNumber,
        status: reservation.status,
        steps,
        items: reservation.items, // Snapshots
      }
    };
  } catch (error: unknown) {
    console.error('Error tracking reservation:', error);
    return { success: false, error: 'An error occurred during tracking.' };
  }
}

export async function verifyGuestTracking(token: string, last4Digits: string) {
  try {
    const q = query(collection(db, 'reservations'), where('magicLinkToken', '==', token));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Invalid tracking token.');
    }

    const doc = snapshot.docs[0];
    const reservation = { id: doc.id, ...doc.data() } as Reservation;

    // Decrypt phone number
    const decryptedPhone = decrypt(reservation.customerInfo.phone);

    // Verify last 4 digits
    if (!decryptedPhone.endsWith(last4Digits)) {
      throw new Error('Verification failed: Phone number does not match.');
    }

    // Return decrypted details (sanitize sensitive info if needed)
    return {
      ...reservation,
      customerInfo: {
        ...reservation.customerInfo,
        phone: decryptedPhone,
        address: reservation.customerInfo.address ? decrypt(reservation.customerInfo.address) : undefined
      }
    };
  } catch (error: unknown) {
    console.error('Error verifying guest tracking:', error);
    throw error;
  }
}
