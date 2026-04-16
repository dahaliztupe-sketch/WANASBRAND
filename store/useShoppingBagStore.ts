import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Product, ProductVariant } from '@/types';
import { syncGuestCartToCloud, recoverGuestCart } from '@/lib/services/cart.service';

function getGuestId() {
  if (typeof document === 'undefined') return 'server';
  let guestId = document.cookie.split('; ').find(row => row.startsWith('guestId='))?.split('=')[1];
  if (!guestId) {
    guestId = `guest_${Math.random().toString(36).substr(2, 9)}`;
    document.cookie = `guestId=${guestId}; path=/; max-age=31536000; SameSite=Lax`;
  }
  return guestId;
}

interface BagItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

interface ShoppingBagStore {
  items: BagItem[];
  addItem: (product: Product, variant: ProductVariant, quantity: number) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearBag: () => void;
  recoverCart: () => Promise<void>;
}

export const useShoppingBagStore = create<ShoppingBagStore>()(
  persist(
    (set, _get) => ({
      items: [],
      addItem: (product, variant, quantity) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.variant.sku === variant.sku);
          let newItems;
          if (existingItem) {
            newItems = state.items.map((item) =>
              item.variant.sku === variant.sku
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            newItems = [...state.items, { product, variant, quantity }];
          }
          syncGuestCartToCloud(getGuestId(), newItems);
          return { items: newItems };
        });
      },
      removeItem: (sku) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.variant.sku !== sku);
          syncGuestCartToCloud(getGuestId(), newItems);
          return { items: newItems };
        });
      },
      updateQuantity: (sku, quantity) => {
        set((state) => {
          const newItems = state.items.map((item) =>
            item.variant.sku === sku ? { ...item, quantity } : item
          );
          syncGuestCartToCloud(getGuestId(), newItems);
          return { items: newItems };
        });
      },
      clearBag: () => {
        set({ items: [] });
        syncGuestCartToCloud(getGuestId(), []);
      },
      recoverCart: async () => {
        const items = await recoverGuestCart(getGuestId());
        if (items.length > 0) {
          set({ items });
        }
      }
    }),
    {
      name: 'wanas-shopping-bag',
    }
  )
);
