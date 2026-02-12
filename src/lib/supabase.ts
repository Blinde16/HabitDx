import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please configure environment variables.');
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: undefined, // Will be configured with proper storage in Phase 2
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Simple connectivity check function for testing
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('_test_').select('*').limit(1);
    // If we get a "relation does not exist" error, connection is working
    // (we just don't have tables yet)
    if (error && error.message.includes('relation')) {
      return true;
    }
    return !error;
  } catch (err) {
    console.error('Supabase connection test failed:', err);
    return false;
  }
}
