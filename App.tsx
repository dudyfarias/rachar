import './global.css';

import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AppProviders } from './src/app/providers/AppProviders';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/stores/authStore';
import { useSocialStore } from './src/stores/socialStore';

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const user = useAuthStore((state) => state.user);
  const loadFromSupabase = useSocialStore((state) => state.loadFromSupabase);

  useEffect(() => {
    const unsubscribe = initializeAuth();

    return unsubscribe;
  }, [initializeAuth]);

  useEffect(() => {
    if (user?.id && user.id !== 'demo-user') {
      loadFromSupabase(user.id);
    }
  }, [user?.id, loadFromSupabase]);

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <RootNavigator />
    </AppProviders>
  );
}
