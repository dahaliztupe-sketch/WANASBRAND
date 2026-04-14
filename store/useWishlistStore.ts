import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Product } from '@/types';
import { auth } from '@/lib/firebase/client';

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  syncWithCloud: (userId: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        set((state) => {
          if (!state.items.find(i => i.id === product.id)) {
            return { items: [...state.items, product] };
          }
          return state;
        });
        const userId = auth.currentUser?.uid;
        if (userId) get().syncWithCloud(userId);
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(i => i.id !== productId)
        }));
        const userId = auth.currentUser?.uid;
        if (userId) get().syncWithCloud(userId);
      },
      isInWishlist: (productId) => get().items.some(i => i.id === productId),
      syncWithCloud: async (userId: string) => {
        const { doc, getDoc, setDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase/client');
        
        const wishlistRef = doc(db, 'wishlists', userId);
        const wishlistDoc = await getDoc(wishlistRef);
        
        let cloudItems: Product[] = [];
        if (wishlistDoc.exists()) {
          cloudItems = wishlistDoc.data().items || [];
        }

        const localItems = get().items;
        const mergedItems = [...localItems];
        
        for (const cloudItem of cloudItems) {
          if (!mergedItems.find(i => i.id === cloudItem.id)) {
            mergedItems.push(cloudItem);
          }
        }

        await setDoc(wishlistRef, {
          items: mergedItems,
          updatedAt: new Date().toISOString(),
        }, { merge: true });

        set({ items: mergedItems });
      },
    }),
    {
      name: 'wanas-wishlist',
    }
  )
);
