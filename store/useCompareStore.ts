import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Product } from '@/types';

interface CompareStore {
  items: Product[];
  isOpen: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MAX_COMPARE_ITEMS = 3;

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product) => {
        const { items } = get();
        if (items.length >= MAX_COMPARE_ITEMS) return;
        if (items.some((p) => p.id === product.id)) return;
        set({ items: [...items, product], isOpen: true });
      },
      removeItem: (productId) => {
        const items = get().items.filter((p) => p.id !== productId);
        set({ items, isOpen: items.length > 0 });
      },
      isInCompare: (productId) => get().items.some((p) => p.id === productId),
      clear: () => set({ items: [], isOpen: false }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    { name: 'wanas-compare' }
  )
);
