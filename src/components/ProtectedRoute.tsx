import React, { useEffect } from 'react';
import { useRouter, useSegments, usePathname, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from './auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, initialized, loading, initialize } = useAuthStore();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    // Never navigate until the root navigator is mounted.
    if (!rootNavigationState?.key || !initialized || loading || segments.length === 0) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    /** OAuth return URLs: `/callback` (group `(auth)/callback`) or `/auth/callback` (`app/auth/callback`). */
    const onOAuthWebCallback =
      (segments[0] === 'auth' && segments[1] === 'callback') ||
      pathname === '/callback' ||
      pathname === '/auth/callback';
    const inPublicGroup = segments[0] === 'share';

    if (!user && !inAuthGroup && !inPublicGroup && !onOAuthWebCallback) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect authenticated users away from auth screens
      // index.tsx will handle routing to onboarding vs tabs
      router.replace('/');
    }
  }, [user, initialized, loading, segments, pathname, router, rootNavigationState?.key]);

  // Keep the navigator mounted on first render; show loading as an overlay.
  return (
    <>
      {children}
      {(!initialized || loading) && <LoadingSpinner message="Loading..." />}
    </>
  );
};
