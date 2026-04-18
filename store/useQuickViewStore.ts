import { create } from 'zustand';

import { Product } from '@/types';

interface QuickViewStore {
  product: Product | null;
  isOpen: boolean;
  open: (product: Product) => void;
  close: () => void;
}

export const useQuickViewStore = create<QuickViewStore>((set) => ({
  product: null,
  isOpen: false,
  open: (product) => set({ product, isOpen: true }),
  close: () => set({ isOpen: false }),
}));
