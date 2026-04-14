import { create } from 'zustand';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

import { db, auth } from '@/lib/firebase/client';

interface TourState {
  isActive: boolean;
  currentStep: number;
  hasCompletedTour: boolean;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
  syncTourStatus: () => Promise<void>;
}

export const useTourStore = create<TourState>((set, get) => ({
  isActive: false,
  currentStep: 0,
  hasCompletedTour: false,
  startTour: () => set({ isActive: true, currentStep: 0 }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
  endTour: async () => {
    set({ isActive: false, currentStep: 0, hasCompletedTour: true });
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          'preferences.hasCompletedTour': true
        });
      } catch (error) {
        console.error('Error saving tour status:', error);
      }
    }
  },
  syncTourStatus: async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          set({ hasCompletedTour: data.preferences?.hasCompletedTour || false });
        }
      } catch (error) {
        console.error('Error syncing tour status:', error);
      }
    }
  }
}));
