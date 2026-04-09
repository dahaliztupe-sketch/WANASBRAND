import { getMessaging } from 'firebase-admin/messaging';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
const app = !getApps().length ? initializeApp({
  credential: cert(JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || '', 'base64').toString('utf-8')))
}) : getApps()[0];

const messaging = getMessaging(app);

export async function sendPushNotification(token: string, title: string, body: string, data?: any) {
  if (!token) return;

  const message = {
    notification: {
      title,
      body,
    },
    data: data || {},
    token: token,
  };

  try {
    const response = await messaging.send(message);
    console.log('Successfully sent push message:', response);
    return response;
  } catch (error) {
    console.error('Error sending push message:', error);
    throw error;
  }
}
