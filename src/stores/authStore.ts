import { create } from 'zustand';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { logAuth, logError } from '../lib/logger';

// Secure storage adapter for Supabase auth
const SecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      // Use localStorage for web
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true });

      // Get initial session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        logError(new Error(error.message), {
          context: 'auth.initialize',
          event: 'get_session_error',
        });
        set({ error: error.message, loading: false, initialized: true });
        return;
      }

      set({
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true,
      });

      // Listen for auth changes — only update state when something meaningful
      // changes (user ID or access token). Supabase re-reads storage every 10s
      // and fires this callback even when nothing changed, which would cause
      // the entire subscribed component tree to re-render on every tick.
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          logAuth.signOut(get().user?.id || 'unknown');
          set({ user: null, session: null });
          return;
        }

        const currentSession = get().session;
        const sameUser = currentSession?.user?.id === session?.user?.id;
        const sameToken = currentSession?.access_token === session?.access_token;
        if (sameUser && sameToken) return; // nothing changed — skip re-render

        set({
          session,
          user: session?.user ?? null,
        });
      });
    } catch (error) {
      logError(error as Error, { context: 'auth.initialize' });
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize auth',
        loading: false,
        initialized: true,
      });
    }
  },

  signUp: async (email: string, password: string, metadata?: Record<string, unknown>) => {
    try {
      set({ loading: true, error: null });
      logAuth.signUpAttempt(email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        throw error;
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        logAuth.signUpSuccess(data.user.id, email);
        set({
          loading: false,
          error: 'Please check your email to verify your account.',
        });
        return;
      }

      if (data.user) {
        logAuth.signUpSuccess(data.user.id, email);
      }

      set({
        user: data.user,
        session: data.session,
        loading: false,
      });
    } catch (error) {
      const authError = error as AuthError;
      logAuth.signUpError(email, authError);
      set({
        error: authError.message || 'Failed to sign up',
        loading: false,
      });
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      logAuth.signInAttempt(email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      logAuth.signInSuccess(data.user.id, email);

      set({
        user: data.user,
        session: data.session,
        loading: false,
      });
    } catch (error) {
      const authError = error as AuthError;
      logAuth.signInError(email, authError);
      set({
        error: authError.message || 'Failed to sign in',
        loading: false,
      });
      throw error;
    }
  },

  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo:
            Platform.OS === 'web'
              ? `${window.location.origin}/auth/callback`
              : 'habitdx://auth/callback',
        },
      });

      if (error) {
        throw error;
      }

      // OAuth flow will handle the session via deep link or redirect
      set({ loading: false });
    } catch (error) {
      const authError = error as AuthError;
      console.error('Google sign in error:', authError);
      set({
        error: authError.message || 'Failed to sign in with Google',
        loading: false,
      });
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { session } = useAuthStore.getState();
      set({ loading: true, error: null });

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      if (session?.user?.id) {
        logAuth.signOut(session.user.id);
      }

      set({
        user: null,
        session: null,
        loading: false,
      });
    } catch (error) {
      const authError = error as AuthError;
      logError(authError, { context: 'auth.signOut' });
      set({
        error: authError.message || 'Failed to sign out',
        loading: false,
      });
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          Platform.OS === 'web'
            ? `${window.location.origin}/auth/reset-password`
            : 'habitdx://auth/reset-password',
      });

      if (error) {
        throw error;
      }

      set({
        loading: false,
        error: 'Password reset email sent. Please check your inbox.',
      });
    } catch (error) {
      const authError = error as AuthError;
      console.error('Reset password error:', authError);
      set({
        error: authError.message || 'Failed to send reset email',
        loading: false,
      });
      throw error;
    }
  },

  updatePassword: async (newPassword: string) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      set({
        loading: false,
        error: 'Password updated successfully',
      });
    } catch (error) {
      const authError = error as AuthError;
      console.error('Update password error:', authError);
      set({
        error: authError.message || 'Failed to update password',
        loading: false,
      });
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));

// Export the secure storage adapter for use in supabase client
export { SecureStoreAdapter };
