import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "wanas-4e90e",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:873229911604:web:7c90dcfcb63a8c19f4ec61",
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBLVuRyOiw0IMEzU7ialYqCrPFZ7gO4z4s",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "wanas-4e90e.firebaseapp.com",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "wanas-4e90e.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "873229911604",
  };

  const content = `
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js');

firebase.initializeApp(${JSON.stringify(config)});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
  `;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
