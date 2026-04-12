import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ReservationItem } from '@/types';
import { auth } from '@/lib/firebase/client';

interface SelectionState {
  items: ReservationItem[];
  giftingDetails: {
    isGift: boolean;
    recipientName?: string;
    handwrittenNote?: string;
  };
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  addItem: (item: ReservationItem) => void;
  removeItem: (variantSku: string) => void;
  updateQuantity: (variantSku: string, quantity: number) => void;
  setGiftingDetails: (details: SelectionState['giftingDetails']) => void;
  clearSelection: () => void;
  syncWithCloud: (userId: string, isInitialSync?: boolean) => Promise<void>;
  initializeAuthSync: () => void;
}

export const useSelectionStore = create<SelectionState>()(
  persist(
    (set, get) => ({
      items: [],
      giftingDetails: { isGift: false },
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setGiftingDetails: (giftingDetails) => set({ giftingDetails }),
      addItem: (item) => {
        const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        const itemWithHold = { ...item, holdExpiresAt };
        
        set((state) => {
          const existingItem = state.items.find((i) => i.variant.sku === item.variant.sku);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.variant.sku === item.variant.sku
                  ? { ...i, quantity: i.quantity + item.quantity, holdExpiresAt }
                  : i
              ),
            };
          }
          return { items: [...state.items, itemWithHold] };
        });

        const userId = auth.currentUser?.uid;
        if (userId) {
          get().syncWithCloud(userId);
        } else {
          import('@/lib/services/cart.service').then(({ validateCartItems }) => {
            validateCartItems(get().items).then(({ validatedItems }) => {
              set({ items: validatedItems });
            });
          });
        }
      },
      removeItem: (variantSku) => {
        set((state) => ({
          items: state.items.filter((i) => i.variant.sku !== variantSku),
        }));
        const userId = auth.currentUser?.uid;
        if (userId) {
          get().syncWithCloud(userId);
        }
      },
      updateQuantity: (variantSku, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.variant.sku === variantSku ? { ...i, quantity } : i
          ),
        }));
        const userId = auth.currentUser?.uid;
        if (userId) {
          get().syncWithCloud(userId);
        } else {
          import('@/lib/services/cart.service').then(({ validateCartItems }) => {
            validateCartItems(get().items).then(({ validatedItems }) => {
              set({ items: validatedItems });
            });
          });
        }
      },
      clearSelection: () => {
        set({ items: [] });
        const userId = auth.currentUser?.uid;
        if (userId) {
          get().syncWithCloud(userId);
        }
      },
  syncWithCloud: async (userId: string, isInitialSync: boolean = false) => {
    const { syncCartToCloud } = await import('@/lib/services/cart.service');
    const currentItems = get().items;
    const { validatedItems, removedItems } = await syncCartToCloud(userId, currentItems, isInitialSync);
    
    // Check if any items were removed during validation
    if (removedItems.length > 0) {
      // Subtle notification
      import('sonner').then(({ toast }) => {
        toast.info('Some items were removed from your bag as they are no longer available.', {
          description: removedItems.map(i => i.productName).join(', ')
        });
      });
    }
    
    set({ items: validatedItems });
  },
  initializeAuthSync: () => {
    import('@/lib/firebase/client').then(({ auth }) => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          get().syncWithCloud(user.uid, true);
        }
      });
    });
  }
}),
    {
      name: 'wanas-selection-storage',
      partialize: (state) => ({ items: state.items, giftingDetails: state.giftingDetails }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
