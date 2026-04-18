import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Product } from '@/types';

const MAX_ITEMS = 8;

interface RecentlyViewedItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  image: string;
  viewedAt: string;
}

interface RecentlyViewedStore {
  items: RecentlyViewedItem[];
  trackView: (product: Product) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],
      trackView: (product: Product) => {
        set((state) => {
          const filtered = state.items.filter((i) => i.id !== product.id);
          const newItem: RecentlyViewedItem = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            category: product.category,
            image: product.images?.[0] || '',
            viewedAt: new Date().toISOString(),
          };
          return {
            items: [newItem, ...filtered].slice(0, MAX_ITEMS),
          };
        });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: 'wanas-recently-viewed',
    }
  )
);
