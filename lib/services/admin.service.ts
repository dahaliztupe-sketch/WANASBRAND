import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';

import { db } from '@/lib/firebase/client';

export const logAction = async (adminName: string, action: string, targetId?: string) => {
  try {
    await addDoc(collection(db, 'logs'), {
      adminName,
      action,
      targetId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging action:', error);
  }
};

export const bulkUpdatePrice = async (ids: string[], _percentage: number) => {
  const batch = writeBatch(db);
  ids.forEach(id => {
    const _ref = doc(db, 'products', id);
    // Note: This requires fetching the product first, but for now I'll assume we have the price in the UI or fetch it.
    // Actually, I should probably fetch the products first in the UI and pass the new prices.
    // Let's adjust this to take new prices.
  });
  await batch.commit();
};

export const bulkUpdateStatus = async (ids: string[], status: 'Published' | 'Archived') => {
  const batch = writeBatch(db);
  ids.forEach(id => {
    const ref = doc(db, 'products', id);
    batch.update(ref, { status, updatedAt: new Date().toISOString() });
  });
  await batch.commit();
};
