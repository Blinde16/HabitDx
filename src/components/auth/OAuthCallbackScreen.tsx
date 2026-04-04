import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Text, Pressable } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import { LoadingSpinner } from './LoadingSpinner';
import { supabase, supabaseUrl } from '../../lib/supabase';

function supabaseAuthCallbackUri(): string {
  try {
    const u = new URL(supabaseUrl);
    return `${u.origin}/auth/v1/callback`;
  } catch {
    return 'https://<your-project-ref>.supabase.co/auth/v1/callback';
  }
}

function buildTimeoutMessage(stillHasCode: boolean): string {
  const callbackUri = supabaseAuthCallbackUri();
  if (stillHasCode) {
    return [
      'OAuth returned a code but the session never saved.',
      'If you still use PKCE (code in the URL), use one canonical site URL (www vs non-www), add it under Supabase → Redirect URLs, and avoid private mode or split browsers.',
    ].join(' ');
  }
  return [
    'The app never received a usable session after redirect.',
    `In Google Cloud → OAuth client, Authorized redirect URIs must include exactly: ${callbackUri}`,
    'In Supabase → Authentication → Providers → Google, use that same Google client’s Client ID and Client secret.',
    'In Supabase → URL Configuration, add this app origin with /callback (e.g. https://habitdx.vercel.app/callback).',
    'Redeploy after changing Vercel env EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY so they match this Supabase project.',
  ].join('\n\n');
}

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
  const hashParams = new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash);

  const oauthError =
    hashParams.get('error') || url.searchParams.get('error') || url.searchParams.get('error_code');
  const oauthErrorDescription =
    hashParams.get('error_description') || url.searchParams.get('error_description');
  if (oauthError) {
    const msg = oauthErrorDescription ? safeDecodeOAuthMessage(oauthErrorDescription) : oauthError;
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
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`
    );
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

      // Late fragment / storage: retry recovery a few times before listening + timeout.
      if (Platform.OS === 'web') {
        for (let r = 0; r < 5; r++) {
          await new Promise((resolve) => setTimeout(resolve, 350));
          if (cancelled) return;
          const late = await recoverSessionFromWebRedirectUrl();
          if (late === 'finished') {
            finish();
            return;
          }
          if (typeof late === 'object' && late.kind === 'error') {
            setInitError(late.message);
            return;
          }
          const {
            data: { session: s },
          } = await supabase.auth.getSession();
          if (s) {
            finish();
            return;
          }
        }
      }

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          data.subscription.unsubscribe();
          finish();
        }
      });
      subscription = data.subscription;

      timeoutId = setTimeout(() => {
        void (async () => {
          subscription?.unsubscribe();
          if (cancelled) return;

          const stillHasCode =
            Platform.OS === 'web' &&
            typeof window !== 'undefined' &&
            Boolean(new URL(window.location.href).searchParams.get('code'));

          const last = await recoverSessionFromWebRedirectUrl();
          if (!cancelled && last === 'finished') {
            finish();
            return;
          }
          if (!cancelled && typeof last === 'object' && last.kind === 'error') {
            setInitError(last.message);
            return;
          }

          const {
            data: { session: finalSession },
          } = await supabase.auth.getSession();
          if (!cancelled && finalSession) {
            finish();
            return;
          }

          stripAuthFragmentFromUrl();
          if (!cancelled) {
            setInitError(buildTimeoutMessage(stillHasCode));
          }
        })();
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
    backgroundColor: '#f7f9fb',
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
    backgroundColor: '#131b2e',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 9999,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
