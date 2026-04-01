import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Text, Pressable } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { LoadingSpinner } from './LoadingSpinner';
import { supabase } from '../../lib/supabase';

function stripAuthFragmentFromUrl() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  const { pathname, search } = window.location;
  window.history.replaceState(window.history.state, '', `${pathname}${search}`);
}

/**
 * OAuth callback handler (Google, etc.)
 *
 * On web, tokens arrive in the URL hash; GoTrue parses them on initialize().
 * Always await initialize() so redirect errors (e.g. PKCE/implicit mismatch,
 * invalid JWT for user lookup) surface instead of leaving tokens in the address bar.
 */
export function OAuthCallbackScreen() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const navReady = Boolean(rootNavigationState?.key);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (!navReady) {
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
      const { error: urlAuthError } = await supabase.auth.initialize();
      if (cancelled) return;

      if (urlAuthError) {
        setInitError(urlAuthError.message);
        stripAuthFragmentFromUrl();
        return;
      }

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
        stripAuthFragmentFromUrl();
        setInitError(
          'Could not finish sign-in. Check that this deployment uses the same Supabase URL and anon key as your project, then try again.'
        );
      }, 12000);
    })();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, [router, navReady]);

  if (initError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Sign-in incomplete</Text>
        <Text style={styles.errorBody}>{initError}</Text>
        <Pressable
          style={styles.button}
          onPress={() => router.replace('/(auth)/login')}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Back to sign in</Text>
        </Pressable>
      </View>
    );
  }

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
    padding: 24,
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  errorBody: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 24,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
