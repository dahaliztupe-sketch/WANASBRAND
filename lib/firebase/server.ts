import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

import firebaseConfig from '../../firebase-applet-config.json';

let db: Firestore | null = null;
let auth: Auth | null = null;

function initializeAdmin(): App | null {
  if (getApps().length > 0) {
    const app = getApps()[0];
    return app;
  }

  const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  
  if (!base64Key) {
    console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_BASE64 is missing. Admin features will be disabled.');
    return null;
  }

  try {
    const decodedCredentials = Buffer.from(base64Key, 'base64').toString('utf-8');
    const serviceAccount = JSON.parse(decodedCredentials);
    
    const app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
    });

    console.log('✅ Firebase Admin initialized successfully.');
    return app;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    return null;
  }
}

const app = initializeAdmin();

if (app) {
  const envDbId = process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID;
  const databaseId = (envDbId && envDbId !== '(default)') ? envDbId : firebaseConfig.firestoreDatabaseId;
  
  db = getFirestore(app, databaseId);
  auth = getAuth(app);
}

export { db, auth };
