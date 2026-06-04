import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AppState = {
  authEntryRoute: 'Login' | 'Register';
  hasHydrated: boolean;
  hasSeenOnboarding: boolean;
  completeOnboarding: (authEntryRoute?: 'Login' | 'Register') => void;
  resetOnboarding: () => void;
  setHydrated: (hasHydrated: boolean) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      authEntryRoute: 'Login',
      hasHydrated: false,
      hasSeenOnboarding: false,
      completeOnboarding: (authEntryRoute = 'Login') => set({ authEntryRoute, hasSeenOnboarding: true }),
      resetOnboarding: () => set({ authEntryRoute: 'Login', hasSeenOnboarding: false }),
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
