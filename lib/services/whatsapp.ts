/**
 * Mock WhatsApp service for WANAS.
 */

export const sendWhatsAppMessage = async (phone: string, message: string) => {
  console.log(`[MOCK WHATSAPP] To: ${phone}, Message: ${message}`);
  return { success: true, messageId: `wa_${Math.random().toString(36).substr(2, 9)}` };
};
