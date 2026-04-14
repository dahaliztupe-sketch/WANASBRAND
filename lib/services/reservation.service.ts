import { ReservationItem } from '@/types';

import { auth } from '../firebase/client';
import { encrypt } from '../utils/encryption';

/**
 * Creates a new reservation by sending customer data and items to the API.
 * Handles PII encryption and idempotency.
 * 
 * @param customerData - The customer's personal information.
 * @param items - The list of products being reserved.
 * @param totalAmount - The total price of the reservation.
 * @returns A promise resolving to the success status and reservation ID.
 */
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
): Promise<{ success: boolean; reservationId: string }> => {
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
    const idempotencyKey = crypto.randomUUID();
    const response = await fetch('/api/reserve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
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
