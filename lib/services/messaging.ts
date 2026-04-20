import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { sendWhatsAppMessage } from '@/lib/services/whatsapp';

export type NotificationChannel = 'whatsapp' | 'email' | 'push';

interface UserNotificationPreferences {
  preferredChannel: NotificationChannel;
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  phone?: string;
  email?: string;
}

const DEFAULT_PREFS: UserNotificationPreferences = {
  preferredChannel: 'whatsapp',
  whatsappEnabled: true,
  emailEnabled: true,
  pushEnabled: false,
};

async function getUserPreferences(userId: string): Promise<UserNotificationPreferences> {
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return DEFAULT_PREFS;
    const data = snap.data();
    return {
      preferredChannel:  data.preferredChannel  ?? 'whatsapp',
      whatsappEnabled:   data.whatsappEnabled   ?? true,
      emailEnabled:      data.emailEnabled      ?? true,
      pushEnabled:       data.pushEnabled       ?? false,
      phone:             data.phone,
      email:             data.email,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export const sendSmartNotification = async (
  userId: string,
  event: string,
  data: { phone?: string; email?: string; message: string; subject?: string }
) => {
  const prefs = await getUserPreferences(userId);

  const phone = data.phone || prefs.phone;
  const email = data.email || prefs.email;

  const results: Record<string, unknown> = {};

  if (prefs.whatsappEnabled && phone) {
    try {
      results.whatsapp = await sendWhatsAppMessage(phone, `وناس أتيليه: ${data.message}`);
    } catch (e) {
      results.whatsapp = { success: false, error: e };
    }
  }

  if (prefs.emailEnabled && email) {
    results.email = await sendEmailNotification(email, data.subject ?? event, data.message);
  }

  console.info(`[Messaging] Notification sent for user=${userId} event=${event}`, results);
  return results;
};

async function sendEmailNotification(to: string, subject: string, body: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from   = process.env.SMTP_FROM ?? 'WANAS Atelier <no-reply@wanas-atelier.com>';

  if (!apiKey) {
    console.warn('[Messaging] RESEND_API_KEY not set — email not sent');
    return { success: false, error: 'Missing RESEND_API_KEY' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html: `<div dir="rtl" style="font-family:'Tajawal',sans-serif;color:#1A1A1A;background:#FDFBF7;padding:32px;border-radius:8px;">
          <h2 style="color:#D4AF37;font-family:'Playfair Display',serif;">${subject}</h2>
          <p>${body.replace(/\n/g, '<br>')}</p>
          <hr style="border-color:#D1C7B7;margin:24px 0;">
          <p style="color:#4A4A4A;font-size:12px;">WANAS Atelier — حيث تلتقي الحرفية بالأناقة</p>
        </div>`,
      }),
    });

    const json = await res.json() as { id?: string };
    if (!res.ok) return { success: false, error: json };
    return { success: true, emailId: json.id };
  } catch (e) {
    console.error('[Messaging] Email error:', e);
    return { success: false, error: e };
  }
}
