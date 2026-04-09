import { db, auth } from '../firebase/client';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Reservation, ReservationItem } from '@/types';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { encrypt } from '../utils/encryption';

export const createReservation = async (
  customerData: {
    fullName: string;
    phone: string;
    address?: string;
    contactMethod: "whatsapp" | "phone";
    vibe: "styling" | "sizing";
    consent: true;
  },
  items: ReservationItem[],
  totalAmount: number
): Promise<any> => {
  const user = auth.currentUser;
  const userId = user?.uid || 'guest';
  let idToken = '';

  if (user) {
    idToken = await user.getIdToken();
  }

  // Encrypt PII before sending to API
  const encryptedCustomerData = {
    ...customerData,
    phone: encrypt(customerData.phone),
    address: customerData.address ? encrypt(customerData.address) : undefined,
  };

  try {
    const response = await fetch('/api/reserve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify({
        customerData: encryptedCustomerData,
        items,
        totalAmount,
        userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create reservation');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};
