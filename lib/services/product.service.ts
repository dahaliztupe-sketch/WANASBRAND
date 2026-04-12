import { collection, query, where, getDocs, limit, startAfter, orderBy } from 'firebase/firestore';

import { Product } from '@/types';

import { db } from '../firebase/client';

export const getProducts = async (
  pageSize: number = 12,
  lastCreatedAt: string | null = null
) => {
  try {
    let q = query(
      collection(db, 'products'),
      where('status', '==', 'Published'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastCreatedAt) {
      q = query(
        collection(db, 'products'),
        where('status', '==', 'Published'),
        orderBy('createdAt', 'desc'),
        startAfter(lastCreatedAt),
        limit(pageSize)
      );
    }

    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => {
      const data = doc.data() as Product;
      return { ...data, id: doc.id };
    });

    const lastVisible = products.length > 0 ? products[products.length - 1].createdAt : null;

    return { products, lastVisible };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};
