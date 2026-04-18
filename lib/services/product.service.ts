import { collection, query, where, getDocs, limit, startAfter, orderBy } from 'firebase/firestore';

import { Product } from '@/types';

import { db } from '../firebase/client';
import { handleError } from '../utils/error-handler';

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
    handleError(error, 'ProductService.getProducts');
  }
};

export const checkInventory = async (sku: string) => {
  try {
    const q = query(
      collection(db, 'products'),
      where('status', '==', 'Published'),
      where('variantSkus', 'array-contains', sku),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const product = snapshot.docs[0].data() as Product;
    const variant = product.variants.find(v => v.sku === sku);
    if (!variant) return null;

    return {
      productName: product.name,
      stock: variant.stock,
      size: variant.size,
      color: variant.color,
      price: product.price
    };
  } catch (error) {
    console.error('Error checking inventory:', error);
    return null;
  }
};

export const addToWaitlist = async (userId: string, sku: string) => {
  try {
    // In a real app, we might have a dedicated waitlist collection
    // For now, we'll log it or add to a 'waitlist' collection
    const waitlistRef = collection(db, 'waitlist');
    await getDocs(query(waitlistRef, where('userId', '==', userId), where('sku', '==', sku)));
    
    // Simplified: just add a new entry
    const { addDoc } = await import('firebase/firestore');
    await addDoc(waitlistRef, {
      userId,
      sku,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    return true;
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return false;
  }
};
