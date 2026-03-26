import React, { useEffect } from 'react';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from './auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, initialized, loading, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    // Never navigate until the root navigator is mounted.
    if (!rootNavigationState?.key || !initialized || loading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inPublicGroup = segments[0] === 'share';

    if (!user && !inAuthGroup && !inPublicGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect authenticated users away from auth screens
      // index.tsx will handle routing to onboarding vs tabs
      router.replace('/');
    }
  }, [user, initialized, loading, segments, router, rootNavigationState?.key]);

  // Keep the navigator mounted on first render; show loading as an overlay.
  return (
    <>
      {children}
      {(!initialized || loading) && <LoadingSpinner message="Loading..." />}
    </>
  );
};
