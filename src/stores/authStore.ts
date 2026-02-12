import { create } from 'zustand';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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

export const useAuthStore = create<AuthStore>((set) => ({
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
        console.error('Error getting session:', error);
        set({ error: error.message, loading: false, initialized: true });
        return;
      }

      set({
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true,
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);

        set({
          session,
          user: session?.user ?? null,
        });

        // Handle specific events
        if (event === 'SIGNED_OUT') {
          set({ user: null, session: null });
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
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
        set({
          loading: false,
          error: 'Please check your email to verify your account.',
        });
        return;
      }

      set({
        user: data.user,
        session: data.session,
        loading: false,
      });
    } catch (error) {
      const authError = error as AuthError;
      console.error('Sign up error:', authError);
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      set({
        user: data.user,
        session: data.session,
        loading: false,
      });
    } catch (error) {
      const authError = error as AuthError;
      console.error('Sign in error:', authError);
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
      set({ loading: true, error: null });

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      set({
        user: null,
        session: null,
        loading: false,
      });
    } catch (error) {
      const authError = error as AuthError;
      console.error('Sign out error:', authError);
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
