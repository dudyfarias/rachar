import './global.css';

import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AppProviders } from './src/app/providers/AppProviders';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/stores/authStore';

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    const unsubscribe = initializeAuth();

    return unsubscribe;
  }, [initializeAuth]);

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <RootNavigator />
    </AppProviders>
  );
}
