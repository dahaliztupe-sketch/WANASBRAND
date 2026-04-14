/**
 * WANAS WhatsApp Integration Manager
 * Placeholder for Phase 5 automated notifications.
 */

import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'wanas-luxury-secret-key-2026');

interface WhatsAppMessage {
  to: string;
  templateName: string;
  variables: Record<string, string>;
}

/**
 * Generates a secure, short-lived JWT for cart summaries.
 * Prevents URL manipulation in WhatsApp links.
 */
export const generateCartToken = async (cartData: unknown) => {
  return await new SignJWT({ cart: cartData as Record<string, unknown> })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
};

export const verifyCartToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.cart;
  } catch (error) {
    console.error('JWT Verification failed:', error);
    return null;
  }
};

/**
 * Generates a WhatsApp click-to-chat link for a reservation.
 * 
 * @param fullName - The customer's full name.
 * @param orderNumber - The unique reservation number.
 * @returns A formatted WhatsApp URL.
 */
export const sendWhatsAppLink = (fullName: string, orderNumber: string): string => {
  const whatsappMessage = `Hello ${fullName}, I am your WANAS Ambassador. I have received your reservation ${orderNumber}. Let us begin your journey...`;
  return `https://wa.me/201000000000?text=${encodeURIComponent(whatsappMessage)}`;
};

export const sendWhatsAppNotification = async ({ to: _to, templateName: _templateName, variables: _variables }: WhatsAppMessage) => {
  // In a real implementation, this would call the Meta/Twilio API
  // For now, we simulate the success/failure for the Two-Phase Commit demonstration
  
  const isSuccess = Math.random() > 0.1; // 90% success rate simulation

  if (!isSuccess) {
    throw new Error('WhatsApp API Delivery Failure');
  }
  
  return { 
    success: true, 
    messageId: `wa_${Math.random().toString(36).substr(2, 9)}` 
  };
};

export const templates = {
  RESERVATION_RECEIVED: 'wanas_reservation_received',
  CONSULTATION_SCHEDULED: 'wanas_consultation_scheduled',
  DEPOSIT_CONFIRMED: 'wanas_deposit_confirmed',
  ORDER_SHIPPED: 'wanas_order_shipped',
};
