import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { isSupabaseConfigured, supabase } from '../lib/supabase/client';

type SignUpPayload = {
  email: string;
  password: string;
  fullName: string;
};

type AuthState = {
  error: string | null;
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  initialize: () => () => void;
  setSession: (session: Session | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  startDemoSession: () => void;
};

function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY para usar autenticacao.');
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  error: null,
  isLoading: true,
  session: null,
  user: null,
  initialize: () => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      set({ isLoading: false });
      return () => {
        isMounted = false;
      };
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) {
          return;
        }

        set({
          isLoading: false,
          session: data.session,
          user: data.session?.user ?? null,
        });
      })
      .catch((error: Error) => {
        if (!isMounted) {
          return;
        }

        set({ error: error.message, isLoading: false });
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  },
  setSession: (session) => set({ session, user: session?.user ?? null }),
  signIn: async (email, password) => {
    ensureSupabaseConfigured();
    set({ error: null, isLoading: true });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }

    set({ isLoading: false, session: data.session, user: data.user });
  },
  signOut: async () => {
    if (get().session?.access_token === 'demo-token' || !isSupabaseConfigured) {
      set({ isLoading: false, session: null, user: null });
      return;
    }

    ensureSupabaseConfigured();
    set({ error: null, isLoading: true });

    const { error } = await supabase.auth.signOut();

    if (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }

    set({ isLoading: false, session: null, user: null });
  },
  signUp: async ({ email, password, fullName }) => {
    ensureSupabaseConfigured();
    set({ error: null, isLoading: true });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }

    set({ isLoading: false, session: data.session, user: data.user });
  },
  startDemoSession: () => {
    const now = new Date().toISOString();
    const demoUser = {
      id: 'demo-user',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'demo@rachae.app',
      app_metadata: {},
      user_metadata: { full_name: 'Demo Rachaê' },
      created_at: now,
    } as User;

    set({
      isLoading: false,
      session: {
        access_token: 'demo-token',
        refresh_token: 'demo-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: demoUser,
      } as Session,
      user: demoUser,
    });
  },
}));
