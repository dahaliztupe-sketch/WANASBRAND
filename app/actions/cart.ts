'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase/server';

export async function updateCartItem(userId: string, sku: string, quantity: number) {
  try {
    const cartRef = db.collection('carts').doc(userId);
    // Transaction logic to update cart items would go here
    // For now, we just simulate the success to allow optimistic UI to work
    
    revalidatePath('/collections');
    revalidatePath('/product/[slug]', 'page');
    return { success: true };
  } catch (error) {
    console.error('Failed to update cart:', error);
    return { success: false, error: 'Failed to update cart' };
  }
}
