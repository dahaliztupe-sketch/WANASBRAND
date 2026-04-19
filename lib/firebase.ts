import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import firebaseConfigJson from '../firebase-applet-config.json';

const envDbId = process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID;
const databaseId = (envDbId && envDbId !== '(default)') ? envDbId : firebaseConfigJson.firestoreDatabaseId;

const cfg = firebaseConfigJson as Record<string, string>;
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || cfg.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || cfg.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || cfg.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || cfg.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || cfg.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || cfg.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]!;
export const auth = getAuth(app);
export const db = getFirestore(app, databaseId);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged };
export type { User };
