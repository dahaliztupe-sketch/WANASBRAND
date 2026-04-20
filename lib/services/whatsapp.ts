/**
 * WhatsApp Cloud API integration for WANAS Atelier.
 * Uses Meta's WhatsApp Business Cloud API (v19.0).
 */

const WHATSAPP_API_URL = 'https://graph.facebook.com/v19.0';

interface WhatsAppTextMessage {
  phone: string;
  message: string;
}

interface WhatsAppTemplateMessage {
  phone: string;
  templateName: string;
  languageCode?: string;
  components?: object[];
}

const getToken = () => process.env.WHATSAPP_API_TOKEN;
const getPhoneId = () => process.env.WHATSAPP_PHONE_NUMBER_ID;

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `20${digits.slice(1)}`;
  if (!digits.startsWith('20') && digits.length === 10) return `20${digits}`;
  return digits;
}

export const sendWhatsAppMessage = async (phone: string, message: string) => {
  const token = getToken();
  const phoneId = getPhoneId();

  if (!token || !phoneId) {
    console.warn('[WhatsApp] Missing WHATSAPP_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID — message not sent.');
    return { success: false, error: 'Missing credentials', messageId: null };
  }

  const to = normalizePhone(phone);

  try {
    const res = await fetch(`${WHATSAPP_API_URL}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body: message },
      }),
    });

    const data = await res.json() as { messages?: Array<{ id: string }> };

    if (!res.ok) {
      console.error('[WhatsApp] API error:', data);
      return { success: false, error: data, messageId: null };
    }

    const messageId = data.messages?.[0]?.id ?? null;
    return { success: true, messageId };
  } catch (error) {
    console.error('[WhatsApp] Request failed:', error);
    return { success: false, error, messageId: null };
  }
};

export const sendWhatsAppTemplate = async ({
  phone,
  templateName,
  languageCode = 'ar',
  components = [],
}: WhatsAppTemplateMessage) => {
  const token = getToken();
  const phoneId = getPhoneId();

  if (!token || !phoneId) {
    console.warn('[WhatsApp] Missing credentials — template not sent.');
    return { success: false, error: 'Missing credentials' };
  }

  const to = normalizePhone(phone);

  try {
    const res = await fetch(`${WHATSAPP_API_URL}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) return { success: false, error: data };
    return { success: true, data };
  } catch (error) {
    console.error('[WhatsApp] Template send failed:', error);
    return { success: false, error };
  }
};

export const sendReservationConfirmation = async (phone: string, reservationData: {
  customerName: string;
  reservationId: string;
  items: string;
  totalAmount: number;
}) => {
  const { customerName, reservationId, items, totalAmount } = reservationData;
  const message =
    `مرحباً ${customerName} 🌸\n\n` +
    `تم استلام حجزك في أتيليه وناس بنجاح ✨\n\n` +
    `رقم الحجز: #${reservationId}\n` +
    `القطع: ${items}\n` +
    `الإجمالي: ${totalAmount.toLocaleString('ar-EG')} جنيه\n\n` +
    `سيتواصل معكِ فريقنا خلال 24 ساعة لتأكيد موعد التجربة.\n\n` +
    `WANAS Atelier — حيث تلتقي الحرفية بالأناقة`;

  return sendWhatsAppMessage(phone, message);
};

export const sendShippingUpdate = async (phone: string, trackingData: {
  customerName: string;
  reservationId: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}) => {
  const { customerName, reservationId, trackingNumber, estimatedDelivery } = trackingData;
  const message =
    `${customerName} العزيزة 📦\n\n` +
    `تم شحن طلبكِ رقم #${reservationId} ✨\n` +
    (trackingNumber ? `رقم التتبع: ${trackingNumber}\n` : '') +
    (estimatedDelivery ? `موعد التسليم المتوقع: ${estimatedDelivery}\n` : '') +
    `\nشكراً لاختياركِ أتيليه وناس 🌸`;

  return sendWhatsAppMessage(phone, message);
};
