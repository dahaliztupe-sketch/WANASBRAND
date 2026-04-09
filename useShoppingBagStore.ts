import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant } from '@/types';

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
}

export const useShoppingBagStore = create<ShoppingBagStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, variant, quantity) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.variant.sku === variant.sku);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.variant.sku === variant.sku
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, variant, quantity }] };
        }),
      removeItem: (sku) =>
        set((state) => ({
          items: state.items.filter((item) => item.variant.sku !== sku),
        })),
      updateQuantity: (sku, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.variant.sku === sku ? { ...item, quantity } : item
          ),
        })),
      clearBag: () => set({ items: [] }),
    }),
    {
      name: 'wanas-shopping-bag',
    }
  )
);
