import { sendWhatsAppMessage } from '@/lib/services/whatsapp';

/**
 * Multi-channel Messaging service (SMS & WhatsApp).
 */

export const sendSmartNotification = async (userId: string, event: string, data: { phone: string; message: string }) => {
  console.log(`Smart Notification for user ${userId} on event ${event}`);
  
  // Logic to check user preferences and send via best channel
  const userPreference = 'whatsapp'; // Mock preference
  
  if (userPreference === 'whatsapp') {
    await sendWhatsAppMessage(data.phone, `WANAS: ${data.message}`);
  } else {
    console.log('Sending SMS...');
  }
};
