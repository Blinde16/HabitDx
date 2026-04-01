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

function safeDecodeOAuthMessage(value: string) {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

type WebRedirectRecovery = 'proceed' | 'finished' | { kind: 'error'; message: string };

/**
 * GoTrue runs initialize() once when the client is created. If that pass did not
 * persist a session (race, fragment handled late, etc.), recover from the URL here.
 */
async function recoverSessionFromWebRedirectUrl(): Promise<WebRedirectRecovery> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return 'proceed';
  }

  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(
    url.hash.startsWith('#') ? url.hash.slice(1) : url.hash
  );

  const oauthError =
    hashParams.get('error') ||
    url.searchParams.get('error') ||
    url.searchParams.get('error_code');
  const oauthErrorDescription =
    hashParams.get('error_description') || url.searchParams.get('error_description');
  if (oauthError) {
    const msg = oauthErrorDescription
      ? safeDecodeOAuthMessage(oauthErrorDescription)
      : oauthError;
    stripAuthFragmentFromUrl();
    url.searchParams.delete('error');
    url.searchParams.delete('error_description');
    url.searchParams.delete('error_code');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`);
    return { kind: 'error', message: msg };
  }

  const code = url.searchParams.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    url.searchParams.delete('code');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    if (error) {
      const msg = error.message?.includes('PKCE code verifier')
        ? `${error.message}\n\nTip: finish sign-in on the same site URL you started from (www vs non-www must match). Add every origin you use under Supabase → Authentication → URL Configuration → Redirect URLs.`
        : error.message;
      return { kind: 'error', message: msg };
    }
    return 'finished';
  }

  const access_token = hashParams.get('access_token');
  const refresh_token = hashParams.get('refresh_token');
  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    stripAuthFragmentFromUrl();
    if (error) {
      return { kind: 'error', message: error.message };
    }
    return 'finished';
  }

  return 'proceed';
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

      const recovery = await recoverSessionFromWebRedirectUrl();
      if (cancelled) return;
      if (typeof recovery === 'object' && recovery.kind === 'error') {
        setInitError(recovery.message);
        return;
      }
      if (recovery === 'finished') {
        finish();
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
        const stillHasCode =
          Platform.OS === 'web' &&
          typeof window !== 'undefined' &&
          Boolean(new URL(window.location.href).searchParams.get('code'));
        stripAuthFragmentFromUrl();
        setInitError(
          stillHasCode
            ? 'OAuth returned a code but the session never saved. Common causes: (1) www vs non-www mismatch—use one canonical URL and add it under Supabase Redirect URLs; (2) storage blocked (private mode); (3) opening the login link in another browser. Env vars can still be correct—this is usually origin/storage for PKCE.'
            : 'Could not finish sign-in. If you use Google, confirm Supabase Google provider Client ID/secret match Google Cloud, and redirect URI there is https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback only.'
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
