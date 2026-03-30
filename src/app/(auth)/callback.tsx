import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { LoadingSpinner } from '../../components/auth';
import { supabase } from '../../lib/supabase';

/**
 * OAuth callback handler
 * This screen handles the redirect after OAuth authentication (Google, etc.)
 *
 * On web, tokens arrive in the URL hash; `detectSessionInUrl` parses them asynchronously.
 * We must wait for a real session (or auth event) before navigating — a fixed delay is unreliable.
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) {
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let subscription: { unsubscribe: () => void } | undefined;

    const finish = () => {
      if (cancelled) return;
      router.replace('/');
    };

    void (async () => {
      const waitForSession = async (): Promise<boolean> => {
        const attempts = Platform.OS === 'web' ? 12 : 4;
        for (let i = 0; i < attempts; i++) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) return true;
          await new Promise((r) => setTimeout(r, 150));
        }
        return false;
      };

      if (await waitForSession()) {
        finish();
        return;
      }

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          data.subscription.unsubscribe();
          finish();
        }
      });
      subscription = data.subscription;

      timeoutId = setTimeout(() => {
        subscription?.unsubscribe();
        finish();
      }, 12000);
    })();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, [router, rootNavigationState?.key]);

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
