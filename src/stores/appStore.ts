import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AppState = {
  hasHydrated: boolean;
  hasSeenOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setHydrated: (hasHydrated: boolean) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      hasSeenOnboarding: false,
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
      resetOnboarding: () => set({ hasSeenOnboarding: false }),
      setHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'rachae-app-preferences',
      partialize: (state) => ({ hasSeenOnboarding: state.hasSeenOnboarding }),
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
