import * as fs from 'fs';
import * as path from 'path';

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

async function seed() {
  const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));
  
  let app;
  if (!getApps().length) {
    const base64Credentials = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (base64Credentials) {
      const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const serviceAccount = JSON.parse(decodedCredentials);
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
      });
    } else {
      console.error('No FIREBASE_SERVICE_ACCOUNT_BASE64 found in env.');
      return;
    }
  } else {
    app = getApps()[0];
  }

  const envDbId = process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID;
  const databaseId = (envDbId && envDbId !== '(default)') ? envDbId : firebaseConfig.firestoreDatabaseId;
  const db = getFirestore(app, databaseId);

  console.log('Seeding counters/reservations...');
  await db.collection('counters').doc('reservations').set({ current: 10000 });

  console.log('Seeding settings/global...');
  await db.collection('settings').doc('global').set({
    shipping_cairo: 150,
    shipping_other: 250
  });

  console.log('Seeding products/sample-product...');
  await db.collection('products').doc('sample-product').set({
    name: 'The Signature Silk Dress',
    slug: 'signature-silk-dress',
    description: 'A timeless piece crafted from the finest silk.',
    price: 4500,
    category: 'Evening Dresses',
    images: ['https://picsum.photos/seed/silk-dress/800/1200'],
    status: 'Published',
    variants: [
      {
        id: 'var-1',
        size: 'S',
        color: 'Midnight Blue',
        stock: 5,
        isActive: true
      },
      {
        id: 'var-2',
        size: 'M',
        color: 'Midnight Blue',
        stock: 3,
        isActive: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  console.log('Seeding complete!');
}

seed().catch(console.error);
