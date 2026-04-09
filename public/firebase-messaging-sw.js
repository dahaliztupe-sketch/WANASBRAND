importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js');

firebase.initializeApp({
  projectId: "wanas-4e90e",
  appId: "1:873229911604:web:7c90dcfcb63a8c19f4ec61",
  apiKey: "AIzaSyBLVuRyOiw0IMEzU7ialYqCrPFZ7gO4z4s",
  authDomain: "wanas-4e90e.firebaseapp.com",
  storageBucket: "wanas-4e90e.firebasestorage.app",
  messagingSenderId: "873229911604"
});

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
