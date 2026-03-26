import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams, useRootNavigationState } from 'expo-router';
import { LoadingSpinner } from '../../components/auth';

/**
 * OAuth callback handler
 * This screen handles the redirect after OAuth authentication (Google, etc.)
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) {
      return;
    }

    // The Supabase client will automatically handle the OAuth callback
    // and update the session. We just need to redirect to the home screen.
    console.log('Auth callback params:', params);

    // Give Supabase a moment to process the callback
    const timer = setTimeout(() => {
      router.replace('/');
    }, 1000);

    return () => clearTimeout(timer);
  }, [params, router, rootNavigationState?.key]);

  return (
    <View style={styles.container}>
      <LoadingSpinner message="Completing sign in..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
