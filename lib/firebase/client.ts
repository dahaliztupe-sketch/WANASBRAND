import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

import firebaseConfigJson from '../../firebase-applet-config.json';

const envDbId = process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID;
const databaseId = (envDbId && envDbId !== '(default)') ? envDbId : firebaseConfigJson.firestoreDatabaseId;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || firebaseConfigJson.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
}, databaseId);

const storage = getStorage(app);
const messaging = typeof window !== 'undefined' ? isSupported().then(yes => yes ? getMessaging(app) : null) : Promise.resolve(null);

export { app, auth, db, storage, messaging };
