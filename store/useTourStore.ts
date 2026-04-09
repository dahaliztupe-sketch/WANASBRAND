import { create } from 'zustand';

interface TourState {
  isActive: boolean;
  currentStep: number;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
}

export const useTourStore = create<TourState>((set) => ({
  isActive: false,
  currentStep: 0,
  startTour: () => set({ isActive: true, currentStep: 0 }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
  endTour: () => set({ isActive: false, currentStep: 0 }),
}));
