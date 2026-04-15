import { db } from '../firebase/server';
import { Product } from '@/types';

export const checkInventoryServer = async (sku: string) => {
  try {
    const snapshot = await db.collection('products').where('status', '==', 'Published').get();
    
    for (const doc of snapshot.docs) {
      const product = doc.data() as Product;
      const variant = product.variants?.find(v => v.sku === sku);
      if (variant) {
        return {
          productName: product.name,
          stock: variant.stock,
          size: variant.size,
          color: variant.color,
          price: product.price
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error checking inventory (server):', error);
    return null;
  }
};

export const addToWaitlistServer = async (userId: string, sku: string) => {
  try {
    const waitlistRef = db.collection('waitlist');
    await waitlistRef.add({
      userId,
      sku,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    return true;
  } catch (error) {
    console.error('Error adding to waitlist (server):', error);
    return false;
  }
};
