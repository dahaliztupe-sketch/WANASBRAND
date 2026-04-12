import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let app;
if (!getApps().length) {
  try {
    const base64Credentials = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (base64Credentials) {
      const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const serviceAccount = JSON.parse(decodedCredentials);
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
      });
    } else {
      // Graceful fallback for build phase
      console.warn('FIREBASE_SERVICE_ACCOUNT_BASE64 not found, skipping admin init');
    }
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
} else {
  app = getApps()[0];
}

const envDbId = process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID;
const databaseId = (envDbId && envDbId !== '(default)') ? envDbId : firebaseConfig.firestoreDatabaseId;

export const db = app ? getFirestore(app, databaseId) : null;
export const auth = app ? getAuth(app) : null;
