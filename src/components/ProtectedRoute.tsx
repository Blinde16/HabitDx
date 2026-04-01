import React, { useEffect, useRef } from 'react';
import { useRouter, useSegments, usePathname, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from './auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, initialized, loading, initialize } = useAuthStore();
  const segments = useSegments();
  const segmentsKey = segments.join('/');
  const pathname = usePathname();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const navReady = Boolean(rootNavigationState?.key);
  /** Avoids repeated `router.replace('/')` while segments still show `(auth)` during transition (React #185). */
  const authToRootPendingRef = useRef(false);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    // Never navigate until the root navigator is mounted.
    if (!navReady || !initialized || loading || segments.length === 0) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    /** OAuth return URLs: `/callback` (group `(auth)/callback`) or `/auth/callback` (`app/auth/callback`). */
    const onOAuthWebCallback =
      (segments[0] === 'auth' && segments[1] === 'callback') ||
      pathname === '/callback' ||
      pathname === '/auth/callback';
    const inPublicGroup = segments[0] === 'share';

    if (!user || !inAuthGroup) {
      authToRootPendingRef.current = false;
    }

    if (!user && !inAuthGroup && !inPublicGroup && !onOAuthWebCallback) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect authenticated users away from auth screens — only once per visit to the auth group;
      // otherwise `replace` can fire every render while the route is still resolving (max update depth).
      if (!authToRootPendingRef.current) {
        authToRootPendingRef.current = true;
        router.replace('/');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- segmentsKey is derived from segments; avoid unstable array identity in deps
  }, [user, initialized, loading, segmentsKey, pathname, router, navReady]);

  // Keep the navigator mounted on first render; show loading as an overlay.
  return (
    <>
      {children}
      {(!initialized || loading) && <LoadingSpinner message="Loading..." />}
    </>
  );
};
