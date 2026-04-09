import { db } from '../firebase/client';
import { collection, query, where, getDocs, limit, startAfter, QueryDocumentSnapshot, DocumentData, orderBy } from 'firebase/firestore';
import { Product } from '@/types';

export const getProducts = async (
  pageSize: number = 12,
  lastDoc: QueryDocumentSnapshot<DocumentData> | null = null
) => {
  try {
    let q = query(
      collection(db, 'products'),
      where('status', '==', 'Published'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(
        collection(db, 'products'),
        where('status', '==', 'Published'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }

    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => {
      const data = doc.data() as Product;
      return { ...data, id: doc.id };
    });

    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

    return { products, lastVisible };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};
